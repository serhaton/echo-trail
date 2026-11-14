import { AppState, type NativeEventSubscription } from 'react-native';
import {
  AudioContext,
  AudioManager,
  type AudioBuffer,
  type AudioBufferSourceNode,
  type BiquadFilterNode,
  type ConvolverNode,
  type GainNode,
  type StereoPannerNode,
} from 'react-native-audio-api';

import { computeSpatial, type SpatialOutput, type SpatialParams, type Vec2 } from './spatialMath';
import type {
  AudioEngine,
  Bus,
  OneShotOptions,
  SoundAsset,
  SpatialSource,
  SpatialSourceOptions,
} from './types';

/**
 * Parameter smoothing time constant (seconds). Every change glides to its
 * new value instead of jumping, which removes "zipper" crackle when the
 * finger moves fast. 25 ms is below what feels like lag but long enough to
 * be smooth at 60 Hz touch updates.
 */
const SMOOTHING = 0.025;
/** Fade-in/out when sources start or stop, to avoid clicks. */
const FADE = 0.08;
/**
 * Pulse scheduler ("two clocks" pattern): a JS timer wakes every
 * SCHEDULER_TICK and books strikes on the precise audio clock up to
 * LOOKAHEAD ahead. A short JS hiccup therefore never breaks the rhythm,
 * while the interval is still re-evaluated often enough to react to
 * movement within ~0.1 s.
 */
const SCHEDULER_TICK_MS = 25;
const LOOKAHEAD = 0.12;

/**
 * Stop a source after its fade-out, from a JS timer rather than with
 * `node.stop(futureTime)`.
 *
 * Why: react-native-audio-api crashes (use-after-free in the AudioContext
 * destructor) if a stop command is still queued when the JS runtime is torn
 * down. Screen clean-ups run exactly then (on a dev reload or when the app
 * quits), so they must not queue one. A timer simply never fires after
 * teardown; by then the gain has already been faded to silence.
 */
function stopAfter(node: AudioBufferSourceNode, seconds: number, then?: () => void) {
  setTimeout(() => {
    try {
      node.stop();
    } catch {
      // Already stopped.
    }
    then?.();
  }, seconds * 1000);
}

/**
 * AudioEngine implementation on top of react-native-audio-api
 * (a native Web Audio API port).
 *
 * Graph per spatial source:
 *   BufferSource → LowPass (clarity) → Gain (distance) → StereoPanner → bus Gain → master → speakers
 *
 * Non-spatial sounds go straight into their bus.
 */
class WebSpatialSource implements SpatialSource {
  readonly id: string;
  output: SpatialOutput = {
    pan: 0,
    gain: 0,
    cutoffHz: 20000,
    playbackRate: 1,
    pulseInterval: 1,
    distance: 0,
    frontness: 1,
  };

  private node: AudioBufferSourceNode | null = null;
  private readonly filter: BiquadFilterNode;
  private readonly distanceGain: GainNode;
  private readonly volumeGain: GainNode;
  private readonly panner: StereoPannerNode;
  private position: Vec2;
  private params: SpatialParams;
  private volume: number;
  private playing = false;
  private readonly mode: 'loop' | 'pulse';
  /** Pulse mode: audio-clock time of the last booked strike. */
  private lastPulseAt = 0;
  private scheduler: ReturnType<typeof setInterval> | null = null;
  private readonly onPulse?: (delaySeconds: number) => void;

  constructor(
    private readonly ctx: AudioContext,
    private readonly buffer: AudioBuffer,
    destination: GainNode,
    reverbInput: GainNode | null,
    private readonly getListener: () => Vec2,
    options: SpatialSourceOptions,
  ) {
    this.mode = options.mode ?? 'loop';
    this.onPulse = options.onPulse;
    this.id = options.id;
    this.position = options.position;
    this.params = options.params;
    this.volume = options.volume ?? 1;

    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.Q.value = 0.707; // Butterworth: no resonant peak.
    this.distanceGain = ctx.createGain();
    this.distanceGain.gain.value = 0;
    this.volumeGain = ctx.createGain();
    this.volumeGain.gain.value = this.volume;
    this.panner = ctx.createStereoPanner();

    this.filter.connect(this.distanceGain);
    this.distanceGain.connect(this.volumeGain);
    this.volumeGain.connect(this.panner);
    this.panner.connect(destination);
    // Only positioned sounds feel the room; time ticks, bumps and UI stay dry.
    if (reverbInput) this.panner.connect(reverbInput);

    this.update(true);
  }

  setPosition(position: Vec2) {
    this.position = position;
    this.update();
  }

  setParams(params: SpatialParams) {
    this.params = params;
    this.update();
  }

  setVolume(volume: number) {
    this.volume = volume;
    this.volumeGain.gain.setTargetAtTime(volume, this.ctx.currentTime, SMOOTHING);
  }

  start() {
    if (this.playing) return;
    this.playing = true;
    const now = this.ctx.currentTime;

    if (this.mode === 'loop') {
      const node = this.ctx.createBufferSource();
      node.buffer = this.buffer;
      node.loop = true;
      node.playbackRate.value = this.output.playbackRate;
      node.connect(this.filter);
      node.start();
      this.node = node;
    } else {
      // First strike right away, then the scheduler takes over.
      this.lastPulseAt = now - this.output.pulseInterval;
      this.schedulePulses();
      this.scheduler = setInterval(this.schedulePulses, SCHEDULER_TICK_MS);
    }

    // Fade in from silence to the current distance gain.
    this.distanceGain.gain.cancelScheduledValues(now);
    this.distanceGain.gain.setValueAtTime(0, now);
    this.distanceGain.gain.linearRampToValueAtTime(this.output.gain, now + FADE);
  }

  stop() {
    if (!this.playing) return;
    this.playing = false;
    const now = this.ctx.currentTime;
    this.distanceGain.gain.cancelScheduledValues(now);
    this.distanceGain.gain.setTargetAtTime(0, now, FADE / 3);
    if (this.scheduler) clearInterval(this.scheduler);
    this.scheduler = null;
    const node = this.node;
    this.node = null;
    if (node) stopAfter(node, FADE);
  }

  /**
   * Book every strike that falls inside the lookahead window. The next
   * strike time is always derived from the CURRENT interval, so walking
   * toward the target speeds the rhythm up immediately instead of waiting
   * out a long gap booked while you were far away.
   */
  private schedulePulses = () => {
    const now = this.ctx.currentTime;
    const horizon = now + LOOKAHEAD;
    for (;;) {
      const next = Math.max(this.lastPulseAt + this.output.pulseInterval, now);
      if (next > horizon) break;
      this.firePulse(next);
      this.lastPulseAt = next;
    }
  };

  private firePulse(when: number) {
    const node = this.ctx.createBufferSource();
    node.buffer = this.buffer;
    // Each strike takes the pitch of the moment; no glide needed, so
    // there's never any warble.
    node.playbackRate.value = this.output.playbackRate;
    node.connect(this.filter);
    node.onended = () => node.disconnect();
    node.start(when);
    this.onPulse?.(Math.max(0, when - this.ctx.currentTime));
  }

  /** Recompute the model and push it to the graph. Called on every move. */
  update(immediate = false) {
    const out = computeSpatial(this.getListener(), this.position, this.params);
    this.output = out;
    const now = this.ctx.currentTime;
    if (immediate) {
      this.panner.pan.value = out.pan;
      this.filter.frequency.value = out.cutoffHz;
      return;
    }
    this.panner.pan.setTargetAtTime(out.pan, now, SMOOTHING);
    this.filter.frequency.setTargetAtTime(out.cutoffHz, now, SMOOTHING);
    // Pitch glides a little slower than the rest: a fast pitch wobble while
    // circling the target would sound like a tape warble.
    this.node?.playbackRate.setTargetAtTime(out.playbackRate, now, SMOOTHING * 3);
    if (this.playing) this.distanceGain.gain.setTargetAtTime(out.gain, now, SMOOTHING);
  }

  dispose() {
    this.stop();
    // Disconnect after the fade so the tail isn't cut.
    setTimeout(() => {
      this.filter.disconnect();
      this.distanceGain.disconnect();
      this.volumeGain.disconnect();
      this.panner.disconnect();
    }, FADE * 1000 + 50);
  }
}

export class WebAudioEngine implements AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buses: Partial<Record<Bus, GainNode>> = {};
  /** Kept separately so volumes set before init() still apply. */
  private busVolumes: Record<Bus, number> = { sfx: 1, ambient: 1 };
  private buffers = new Map<string, AudioBuffer>();
  private sources = new Map<string, WebSpatialSource>();
  private listener: Vec2 = { x: 0, y: 0 };
  private initPromise: Promise<void> | null = null;
  private appStateSub: NativeEventSubscription | null = null;
  private ambience: { node: AudioBufferSourceNode; gain: GainNode; sound: string } | null = null;
  /** Spatial sources feed this; its gain is the reverb amount. */
  private reverbInput: GainNode | null = null;

  init(): Promise<void> {
    this.initPromise ??= this.doInit();
    return this.initPromise;
  }

  private async doInit() {
    // 'playback' keeps the game audible even with the silent switch on —
    // essential for an audio-first game. It pauses the user's music, which
    // is what players expect from a game that needs their ears.
    AudioManager.setSystemOptions({ ios: { category: 'playback', mode: 'default', options: [] } });
    AudioManager.observeAudioInterruptions(true);
    AudioManager.addSystemEventListener('interruption', (event) => {
      if (event.type === 'ended' && event.shouldResume) void this.ctx?.resume();
    });

    // 'interactive' asks the OS for the smallest output buffer it allows.
    const ctx = new AudioContext({ latencyHint: 'interactive' });
    this.ctx = ctx;

    const master = ctx.createGain();
    master.connect(ctx.destination);
    this.master = master;
    for (const bus of ['sfx', 'ambient'] as const) {
      const g = ctx.createGain();
      g.gain.value = this.busVolumes[bus];
      g.connect(master);
      this.buses[bus] = g;
    }

    // Reverb: spatial sources → reverbInput (gain = amount) → convolver → sfx
    // bus. Runs in parallel to the dry path, so direction cues stay intact.
    const convolver: ConvolverNode = ctx.createConvolver();
    convolver.buffer = makeRoomImpulse(ctx, 1.1);
    const reverbInput = ctx.createGain();
    reverbInput.gain.value = 0;
    reverbInput.connect(convolver);
    convolver.connect(this.buses.sfx!);
    this.reverbInput = reverbInput;

    // Silence everything while the app is in the background.
    this.appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void this.ctx?.resume();
      else if (state === 'background') void this.ctx?.suspend();
    });

    if (ctx.state === 'suspended') await ctx.resume();
  }

  async load(key: string, asset: SoundAsset) {
    await this.init();
    if (this.buffers.has(key) || !this.ctx) return;
    const buffer = await this.ctx.decodeAudioData(asset);
    this.buffers.set(key, buffer);
  }

  setListener(position: Vec2) {
    this.listener = position;
    for (const source of this.sources.values()) source.update();
  }

  createSpatialSource(options: SpatialSourceOptions): SpatialSource {
    const { ctx } = this;
    const buffer = this.buffers.get(options.sound);
    const bus = this.buses[options.bus ?? 'sfx'];
    if (!ctx || !buffer || !bus) {
      throw new Error(`[audio] cannot create "${options.id}": engine not ready or sound "${options.sound}" not loaded`);
    }
    this.destroySource(options.id);
    const source = new WebSpatialSource(
      ctx,
      buffer,
      bus,
      this.reverbInput,
      () => this.listener,
      options,
    );
    this.sources.set(options.id, source);
    return source;
  }

  destroySource(id: string) {
    this.sources.get(id)?.dispose();
    this.sources.delete(id);
  }

  playOneShot(sound: string, options: OneShotOptions = {}) {
    const { ctx } = this;
    const buffer = this.buffers.get(sound);
    const bus = this.buses[options.bus ?? 'sfx'];
    if (!ctx || !buffer || !bus) return;
    const node = ctx.createBufferSource();
    node.buffer = buffer;
    if (options.playbackRate) node.playbackRate.value = options.playbackRate;
    const gain = ctx.createGain();
    gain.gain.value = options.volume ?? 1;
    node.connect(gain);
    if (options.pan) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = options.pan;
      gain.connect(panner);
      panner.connect(bus);
      node.onended = () => {
        gain.disconnect();
        panner.disconnect();
      };
    } else {
      gain.connect(bus);
      node.onended = () => gain.disconnect();
    }
    node.start();
  }

  setBusVolume(bus: Bus, volume: number) {
    this.busVolumes[bus] = volume;
    const node = this.buses[bus];
    if (node && this.ctx) node.gain.setTargetAtTime(volume, this.ctx.currentTime, SMOOTHING);
  }

  startAmbience(sound: string, volume = 0.35) {
    const { ctx } = this;
    const buffer = this.buffers.get(sound);
    const bus = this.buses.ambient;
    if (!ctx || !buffer || !bus) return;
    if (this.ambience?.sound === sound) return;
    this.stopAmbience();
    const node = ctx.createBufferSource();
    node.buffer = buffer;
    node.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    node.connect(gain);
    gain.connect(bus);
    node.start();
    // Slow fade-in: the world "comes up" around the player.
    gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.6);
    this.ambience = { node, gain, sound };
  }

  stopAmbience() {
    const { ctx, ambience } = this;
    if (!ctx || !ambience) return;
    this.ambience = null;
    const now = ctx.currentTime;
    ambience.gain.gain.cancelScheduledValues(now);
    ambience.gain.gain.setTargetAtTime(0, now, 0.25);
    stopAfter(ambience.node, 1.2, () => ambience.gain.disconnect());
  }

  rampAmbience(volume: number, seconds: number) {
    const { ctx, ambience } = this;
    if (!ctx || !ambience) return;
    const now = ctx.currentTime;
    const g = ambience.gain.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(volume, now + seconds);
  }

  setReverb(amount: number) {
    if (this.reverbInput && this.ctx) {
      this.reverbInput.gain.setTargetAtTime(Math.max(0, amount), this.ctx.currentTime, 0.1);
    }
  }

  getDuration(sound: string) {
    return this.buffers.get(sound)?.duration ?? 0;
  }

  getLatency() {
    return this.ctx ? this.ctx.baseLatency + this.ctx.outputLatency : 0;
  }

  setPaused(paused: boolean) {
    if (!this.ctx) return;
    if (paused) void this.ctx.suspend();
    else void this.ctx.resume();
  }

  reset() {
    for (const id of [...this.sources.keys()]) this.destroySource(id);
    this.stopAmbience();
    this.setReverb(0);
  }

  /** Full teardown (not needed in normal play; the engine lives for the app's lifetime). */
  async dispose() {
    this.reset();
    this.appStateSub?.remove();
    await this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.buses = {};
    this.buffers.clear();
    this.initPromise = null;
  }
}

/**
 * Synthetic stereo room impulse response, built to sound like a ROOM rather
 * than a hiss:
 *   - a few discrete early reflections (walls) in the first ~60 ms;
 *   - a short diffuse tail that is heavily low-passed and gets darker fast
 *     (old plaster and wood absorb highs), so it never adds "shhh".
 * Left and right differ slightly for width. No asset needed.
 */
function makeRoomImpulse(ctx: AudioContext, seconds: number): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * seconds);
  const buffer = ctx.createBuffer(2, length, rate);
  const reflections = [
    [0.011, 0.5],
    [0.019, 0.35],
    [0.029, 0.28],
    [0.043, 0.2],
    [0.058, 0.14],
  ] as const;
  for (let ch = 0; ch < 2; ch++) {
    const data = new Float32Array(length);
    // Early reflections (slightly offset per ear).
    for (const [time, gain] of reflections) {
      const i = Math.floor((time + ch * 0.0023) * rate);
      if (i < length) data[i] = (data[i] ?? 0) + gain * (ch === 0 ? 1 : 0.9);
    }
    // Dark diffuse tail.
    let lp1 = 0;
    let lp2 = 0;
    let seed = ch === 0 ? 1234 : 5678;
    const tailStart = Math.floor(0.02 * rate);
    for (let i = tailStart; i < length; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const white = seed / 0xffffffff - 0.5;
      const t = i / rate;
      const k = 0.12 * Math.exp(-t * 6) + 0.015; // two-pole low-pass closing over time
      lp1 += k * (white - lp1);
      lp2 += k * (lp1 - lp2);
      const fadeIn = Math.min(1, (i - tailStart) / (0.03 * rate));
      data[i] = (data[i] ?? 0) + lp2 * 6 * Math.exp(-t * (4.5 + ch * 0.4)) * fadeIn;
    }
    buffer.copyToChannel(data, ch);
  }
  return buffer;
}
