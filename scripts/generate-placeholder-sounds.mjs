#!/usr/bin/env node
/**
 * Generates royalty-free PLACEHOLDER sounds as 16-bit mono WAV files.
 *
 * These are synthesized from math, so there are no licensing concerns.
 * They exist only so development can start before final sound design;
 * replace them with real recordings using the same file names
 * (see assets/sounds/README.md).
 *
 * Usage: node scripts/generate-placeholder-sounds.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SAMPLE_RATE = 44100;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');

/** Deterministic PRNG so regenerated files are byte-identical. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function writeWav(relPath, samples, peakLevel = 0.89) {
  const data = Buffer.alloc(samples.length * 2);
  // Normalize to the given peak (default -1 dBFS). Ambience beds use a much
  // lower level: noise-like sounds are loud even at modest peaks.
  let peak = 0;
  for (const v of samples) peak = Math.max(peak, Math.abs(v));
  const scale = peak > 0 ? peakLevel / peak : 1;
  samples.forEach((v, i) => {
    const s = Math.max(-1, Math.min(1, v * scale));
    data.writeInt16LE(Math.round(s * 32767), i * 2);
  });
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  const out = join(ROOT, relPath);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, Buffer.concat([header, data]));
  console.log(`wrote ${relPath} (${(samples.length / SAMPLE_RATE).toFixed(2)}s)`);
}

/**
 * Music-box style chime, repeating every `period` seconds: a plucked tone
 * with slightly inharmonic partials plus a tiny noise "tick" transient.
 * Rich in high frequencies, so the low-pass "clarity" effect is audible.
 */
function chime({ period = 1.1, notes = [1046.5, 1318.5] } = {}) {
  const rand = rng(7);
  const len = Math.round(period * notes.length * SAMPLE_RATE);
  const out = new Float32Array(len);
  const partials = [
    [1, 1.0, 1.2],
    [2.0, 0.5, 2.0],
    [3.01, 0.28, 3.2],
    [4.2, 0.18, 4.5],
    [5.43, 0.1, 6.0],
  ]; // [ratio, amplitude, decay speed]
  notes.forEach((f0, n) => {
    const start = Math.round(n * period * SAMPLE_RATE);
    const noteLen = Math.round(period * SAMPLE_RATE);
    for (let i = 0; i < noteLen; i++) {
      const t = i / SAMPLE_RATE;
      let v = 0;
      for (const [ratio, amp, decay] of partials) {
        v += amp * Math.sin(2 * Math.PI * f0 * ratio * t) * Math.exp(-t * decay * 3);
      }
      // 4 ms attack ramp to avoid clicks, noise tick in the first 6 ms.
      const attack = Math.min(1, t / 0.004);
      const tick = t < 0.006 ? (rand() * 2 - 1) * 0.35 * (1 - t / 0.006) : 0;
      out[start + i] += v * attack + tick;
    }
  });
  return out;
}

/**
 * Continuous babbling-brook texture: filtered noise with slow random
 * "gurgle" modulation. Broadband, so it is the easiest to localize.
 * The end is cross-faded into the start so it loops seamlessly.
 */
function stream({ seconds = 6, fade = 0.5 } = {}) {
  const rand = rng(42);
  const total = Math.round((seconds + fade) * SAMPLE_RATE);
  const raw = new Float32Array(total);
  // Two one-pole filters → band-limited noise around 400 Hz – 5 kHz.
  let lp = 0;
  let lp2 = 0;
  let mod = 0.5;
  let modTarget = 0.5;
  for (let i = 0; i < total; i++) {
    const white = rand() * 2 - 1;
    lp += 0.35 * (white - lp);
    lp2 += 0.06 * (white - lp2);
    const band = lp - lp2;
    if (i % 2205 === 0) modTarget = 0.25 + rand() * 0.75; // new gurgle every 50 ms
    mod += 0.0015 * (modTarget - mod);
    // Occasional tiny droplets for texture.
    raw[i] = band * mod;
  }
  for (let d = 0; d < 40; d++) {
    const at = Math.floor(rand() * (total - SAMPLE_RATE * 0.05));
    const f = 900 + rand() * 1800;
    for (let i = 0; i < SAMPLE_RATE * 0.04; i++) {
      const t = i / SAMPLE_RATE;
      raw[at + i] += 0.25 * Math.sin(2 * Math.PI * (f + 4000 * t) * t) * Math.exp(-t * 90);
    }
  }
  // Seamless loop: fade the extra tail over the head.
  const len = Math.round(seconds * SAMPLE_RATE);
  const fadeLen = total - len;
  const out = raw.slice(0, len);
  for (let i = 0; i < fadeLen; i++) {
    const k = i / fadeLen;
    out[i] = raw[i] * Math.sqrt(k) + raw[len + i] * Math.sqrt(1 - k);
  }
  return out;
}

/**
 * Zen time sound: a soft temple-bell strike with inharmonic partials and a
 * long, slowly fading tail.
 */
function bell({ f0 = 392, seconds = 4.5 } = {}) {
  const len = Math.round(seconds * SAMPLE_RATE);
  const out = new Float32Array(len);
  const partials = [
    [0.5, 0.35, 0.6], // hum tone
    [1.0, 1.0, 0.9],
    [2.0, 0.45, 1.4],
    [2.76, 0.35, 1.9],
    [5.4, 0.16, 3.2],
    [8.93, 0.08, 4.5],
  ];
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let v = 0;
    for (const [ratio, amp, decay] of partials) {
      // Slight beating between two close copies gives the bell its shimmer.
      const f = f0 * ratio;
      v += amp * (Math.sin(2 * Math.PI * f * t) + 0.6 * Math.sin(2 * Math.PI * (f + 1.3) * t)) * Math.exp(-t * decay);
    }
    out[i] = v * Math.min(1, t / 0.003);
  }
  return out;
}

/**
 * Mystery time sound: a single dry, woody wall-clock tick. Played as
 * "tick" (normal) and "tock" (slower playback) alternately in code.
 */
function clockTick() {
  const rand = rng(11);
  // v2 (playtest): longer, fuller "wooden" body so it's audible next to the target.
  const len = Math.round(0.16 * SAMPLE_RATE);
  const out = new Float32Array(len);
  let bp1 = 0;
  let bp2 = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    // Band-limited noise burst (the "click") + resonant pings (the wooden case).
    const white = rand() * 2 - 1;
    bp1 += 0.5 * (white - bp1);
    bp2 += 0.12 * (white - bp2);
    const click = (bp1 - bp2) * Math.exp(-t * 300);
    const ping = Math.sin(2 * Math.PI * 1750 * t) * Math.exp(-t * 55) * 0.55;
    const body = Math.sin(2 * Math.PI * 540 * t) * Math.exp(-t * 32) * 0.6;
    const low = Math.sin(2 * Math.PI * 260 * t) * Math.exp(-t * 40) * 0.35;
    out[i] = click + ping + body + low;
  }
  return out;
}

/**
 * Hidden collectible: a quiet, continuous twinkle (random high glints over
 * a faint airy shimmer). Seamless 3 s loop.
 */
function twinkle({ seconds = 3, fade = 0.3 } = {}) {
  const rand = rng(21);
  const total = Math.round((seconds + fade) * SAMPLE_RATE);
  const raw = new Float32Array(total);
  // v2 (playtest): no noise bed under the glints — it added up to a hiss.
  const notes = [2093, 2349, 2637, 3136, 3520];
  for (let k = 0; k < 14; k++) {
    const at = Math.floor(rand() * (total - SAMPLE_RATE * 0.4));
    const f = notes[Math.floor(rand() * notes.length)];
    for (let i = 0; i < SAMPLE_RATE * 0.4; i++) {
      const t = i / SAMPLE_RATE;
      raw[at + i] += 0.35 * Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 9) * Math.min(1, t / 0.002);
    }
  }
  const len = Math.round(seconds * SAMPLE_RATE);
  const fadeLen = total - len;
  const out = raw.slice(0, len);
  for (let i = 0; i < fadeLen; i++) {
    const k = i / fadeLen;
    out[i] = raw[i] * Math.sqrt(k) + raw[len + i] * Math.sqrt(1 - k);
  }
  return out;
}

/** Rising sparkle arpeggio: picking up a hidden sound. */
function sparkle({ notes = [1318.5, 1568, 2093, 2637], step = 0.06, tail = 0.7 } = {}) {
  const len = Math.round((notes.length * step + tail) * SAMPLE_RATE);
  const out = new Float32Array(len);
  notes.forEach((f, n) => {
    const start = Math.round(n * step * SAMPLE_RATE);
    for (let i = 0; start + i < len; i++) {
      const t = i / SAMPLE_RATE;
      const env = Math.exp(-t * 6) * Math.min(1, t / 0.003);
      out[start + i] += env * (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t));
    }
  });
  return out;
}

/** Soft airy swell used when a hint lights up. */
function shimmer({ seconds = 1.6 } = {}) {
  const len = Math.round(seconds * SAMPLE_RATE);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.sin(Math.PI * Math.min(1, t / seconds)) ** 2;
    let v = 0;
    for (const [f, a] of [[880, 1], [1320, 0.6], [1760, 0.4], [2640, 0.25]]) {
      v += a * Math.sin(2 * Math.PI * f * t + 2 * Math.sin(2 * Math.PI * 5 * t) * (f / 2640));
    }
    out[i] = v * env;
  }
  return out;
}

/**
 * Placeholder for story narration: a short music-box phrase. Real Mystery
 * story fragments are recorded per language (narration/tr, narration/en).
 */
function melody() {
  const notes = [659.3, 784, 880, 784, 659.3, 587.3, 659.3, 0, 523.3, 587.3, 659.3];
  const step = 0.36;
  const len = Math.round((notes.length * step + 1.5) * SAMPLE_RATE);
  const out = new Float32Array(len);
  notes.forEach((f, n) => {
    if (!f) return;
    const start = Math.round(n * step * SAMPLE_RATE);
    for (let i = 0; start + i < len; i++) {
      const t = i / SAMPLE_RATE;
      const env = Math.exp(-t * 3.2) * Math.min(1, t / 0.003);
      out[start + i] +=
        env * (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * f * 3.01 * t) * Math.exp(-t * 6));
    }
  });
  return out;
}

// ---------------------------------------------------------------------------
// Stage 9: per-level target strikes (single hits, repeated by pulse mode)
// ---------------------------------------------------------------------------

/** Generic envelope helper: fast attack, exponential decay. */
const env = (t, attack, decay) => Math.min(1, t / attack) * Math.exp(-t * decay);

/** Water drop: a short upward "plink" plus a tiny bubble ring. */
function waterDrop() {
  const len = Math.round(0.6 * SAMPLE_RATE);
  const out = new Float32Array(len);
  let phase = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const f = 900 + 1300 * Math.min(1, t / 0.035); // pitch rises as the drop lands
    phase += (2 * Math.PI * f) / SAMPLE_RATE;
    const ring = Math.sin(2 * Math.PI * 1450 * t) * env(t, 0.004, 14) * 0.35;
    out[i] = Math.sin(phase) * env(t, 0.002, 22) + ring;
  }
  return out;
}

/** Bird: two quick rising chirps. */
function birdChirp() {
  const len = Math.round(0.55 * SAMPLE_RATE);
  const out = new Float32Array(len);
  for (const [start, f0, f1] of [[0, 2900, 4300], [0.16, 3100, 4600]]) {
    let phase = 0;
    const s0 = Math.round(start * SAMPLE_RATE);
    const dur = 0.09;
    for (let i = 0; i < dur * SAMPLE_RATE; i++) {
      const t = i / SAMPLE_RATE;
      const f = f0 + (f1 - f0) * (t / dur) + 250 * Math.sin(2 * Math.PI * 38 * t);
      phase += (2 * Math.PI * f) / SAMPLE_RATE;
      out[s0 + i] += Math.sin(phase) * Math.sin((Math.PI * t) / dur);
    }
  }
  return out;
}

/** Wind chime: one metal tube, inharmonic partials, long shimmer. */
function windChime({ f0 = 1174.7 } = {}) {
  const len = Math.round(1.6 * SAMPLE_RATE);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let v = 0;
    for (const [r, a, d] of [[1, 1, 2.2], [2.76, 0.5, 3.5], [5.4, 0.25, 6], [8.93, 0.1, 9]]) {
      v += a * Math.sin(2 * Math.PI * f0 * r * t) * Math.exp(-t * d);
    }
    out[i] = v * Math.min(1, t / 0.002);
  }
  return out;
}

/** Owl: a soft, breathy low "hoo". */
function owlHoot() {
  const rand = rng(31);
  const len = Math.round(0.75 * SAMPLE_RATE);
  const out = new Float32Array(len);
  let lp = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const shape = Math.sin(Math.PI * Math.min(1, t / 0.55)) ** 1.5;
    lp += 0.05 * (rand() * 2 - 1 - lp);
    const f = 390 - 40 * (t / 0.75);
    out[i] = (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t) + lp * 0.6) * shape;
  }
  return out;
}

/** Piano-like note: harmonic partials + a soft hammer thump. */
function pianoNote({ f0 = 523.3 } = {}) {
  const rand = rng(41);
  const len = Math.round(1.4 * SAMPLE_RATE);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let v = 0;
    for (let h = 1; h <= 6; h++) v += (1 / h) * Math.sin(2 * Math.PI * f0 * h * 1.0008 ** h * t) * Math.exp(-t * (1.8 + h * 0.9));
    const hammer = t < 0.01 ? (rand() * 2 - 1) * 0.3 * (1 - t / 0.01) : 0;
    out[i] = v * Math.min(1, t / 0.003) + hammer;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Stage 9: ambience loops (quiet beds under the gameplay)
// ---------------------------------------------------------------------------

/** Render `seconds` of audio with `fill(out, rand)` and make it loop seamlessly. */
function loop(seconds, seed, fill, fade = 0.8) {
  const rand = rng(seed);
  const total = Math.round((seconds + fade) * SAMPLE_RATE);
  const raw = new Float32Array(total);
  fill(raw, rand);
  const len = Math.round(seconds * SAMPLE_RATE);
  const fadeLen = total - len;
  const out = raw.slice(0, len);
  for (let i = 0; i < fadeLen; i++) {
    const k = i / fadeLen;
    out[i] = raw[i] * Math.sqrt(k) + raw[len + i] * Math.sqrt(1 - k);
  }
  return out;
}

/** Add filtered noise with a slowly wandering level. */
function noiseBed(out, rand, { lpA = 0.05, lpB = 0.005, level = 0.5, wander = 0.0005 } = {}) {
  let a = 0;
  let b = 0;
  let m = 0.6;
  let mt = 0.6;
  for (let i = 0; i < out.length; i++) {
    const w = rand() * 2 - 1;
    a += lpA * (w - a);
    b += lpB * (w - b);
    if (i % 4410 === 0) mt = 0.3 + rand() * 0.7;
    m += wander * (mt - m);
    out[i] += (a - b) * m * level;
  }
}

function sprinkle(out, rand, count, make) {
  for (let k = 0; k < count; k++) {
    const piece = make(rand);
    const at = Math.floor(rand() * (out.length - piece.length));
    for (let i = 0; i < piece.length; i++) out[at + i] += piece[i];
  }
}

function tweet(rand) {
  const f0 = 2500 + rand() * 2500;
  const n = Math.round((0.05 + rand() * 0.08) * SAMPLE_RATE);
  const p = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    ph += (2 * Math.PI * (f0 + 900 * Math.sin(Math.PI * t))) / SAMPLE_RATE;
    p[i] = Math.sin(ph) * Math.sin(Math.PI * t) * 0.12;
  }
  return p;
}

const ambForestDawn = () =>
  loop(10, 51, (o, r) => {
    noiseBed(o, r, { lpA: 0.03, lpB: 0.004, level: 0.35, wander: 0.0003 }); // breeze
    sprinkle(o, r, 26, tweet);
  });

const ambRiver = () =>
  loop(8, 52, (o, r) => {
    noiseBed(o, r, { lpA: 0.3, lpB: 0.05, level: 0.45, wander: 0.002 });
    sprinkle(o, r, 30, (rr) => {
      const n = Math.round(0.03 * SAMPLE_RATE);
      const p = new Float32Array(n);
      const f = 700 + rr() * 1400;
      for (let i = 0; i < n; i++) p[i] = Math.sin(2 * Math.PI * (f + 3000 * (i / n)) * (i / SAMPLE_RATE)) * Math.exp(-i / n * 4) * 0.08;
      return p;
    });
  });

const ambBeach = () =>
  loop(12, 53, (o, r) => {
    let a = 0;
    for (let i = 0; i < o.length; i++) {
      const t = i / SAMPLE_RATE;
      a += 0.04 * (r() * 2 - 1 - a);
      // Two wave swells per loop: rise, crash, wash back.
      const ph = (t % 6) / 6;
      const swell = ph < 0.6 ? (ph / 0.6) ** 2 : Math.exp(-(ph - 0.6) * 6);
      o[i] += a * (0.15 + 0.85 * swell) * 0.8;
    }
  });

const ambNightHill = () =>
  loop(8, 54, (o, r) => {
    noiseBed(o, r, { lpA: 0.02, lpB: 0.003, level: 0.2, wander: 0.0002 });
    // Crickets: trains of short 4.6 kHz pulses.
    for (let k = 0; k < 18; k++) {
      const at = r() * (o.length / SAMPLE_RATE - 0.5);
      for (let p = 0; p < 3; p++) {
        const s0 = Math.round((at + p * 0.055) * SAMPLE_RATE);
        for (let i = 0; i < 0.03 * SAMPLE_RATE; i++) {
          const t = i / SAMPLE_RATE;
          o[s0 + i] += Math.sin(2 * Math.PI * 4600 * t) * Math.sin((Math.PI * t) / 0.03) * 0.06;
        }
      }
    }
  });

const ambHouse = () =>
  loop(10, 55, (o, r) => {
    noiseBed(o, r, { lpA: 0.01, lpB: 0.002, level: 0.6, wander: 0.0002 }); // low room tone
    sprinkle(o, r, 4, (rr) => {
      // Floorboard creak: low pitch-bent squeak.
      const n = Math.round((0.25 + rr() * 0.3) * SAMPLE_RATE);
      const p = new Float32Array(n);
      let ph = 0;
      const f0 = 180 + rr() * 120;
      for (let i = 0; i < n; i++) {
        const t = i / n;
        ph += (2 * Math.PI * (f0 + 90 * Math.sin(Math.PI * t * 3))) / SAMPLE_RATE;
        p[i] = Math.sign(Math.sin(ph)) * 0.03 * Math.sin(Math.PI * t);
      }
      return p;
    });
  });

// v2 (playtest): much darker — soft rain behind glass, not white noise.
const ambRain = () =>
  loop(8, 56, (o, r) => {
    noiseBed(o, r, { lpA: 0.08, lpB: 0.02, level: 0.35, wander: 0.0008 });
    sprinkle(o, r, 60, (rr) => {
      // Individual drops on the window: short, low "tick"s.
      const n = Math.round(0.02 * SAMPLE_RATE);
      const p = new Float32Array(n);
      const f = 900 + rr() * 900;
      for (let i = 0; i < n; i++) p[i] = Math.sin((2 * Math.PI * f * i) / SAMPLE_RATE) * Math.exp((-i / n) * 7) * 0.05;
      return p;
    });
  });

const ambCellar = () =>
  loop(10, 57, (o, r) => {
    noiseBed(o, r, { lpA: 0.008, lpB: 0.002, level: 0.5, wander: 0.0002 });
    sprinkle(o, r, 7, (rr) => {
      const d = waterDrop();
      const g = 0.12 + rr() * 0.1;
      return d.map((v) => v * g);
    });
  });

// ---------------------------------------------------------------------------
// Tension and Cheerful modes
// ---------------------------------------------------------------------------

/** One heartbeat thump (code plays it twice: "lub-dub"). */
function heartbeat() {
  const len = Math.round(0.22 * SAMPLE_RATE);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const f = 62 - 22 * Math.min(1, t / 0.1);
    out[i] = Math.sin(2 * Math.PI * f * t) * env(t, 0.006, 20) + 0.3 * Math.sin(2 * Math.PI * f * 2 * t) * env(t, 0.004, 40);
  }
  return out;
}

/** The chaser: a low, uneasy growl with slow throbbing. Seamless loop. */
const chaserLoop = () =>
  loop(4, 61, (o, r) => {
    let lp = 0;
    for (let i = 0; i < o.length; i++) {
      const t = i / SAMPLE_RATE;
      lp += 0.02 * (r() * 2 - 1 - lp);
      const throb = 0.55 + 0.45 * Math.sin(2 * Math.PI * 1.5 * t);
      const saw = ((t * 55) % 1) * 2 - 1;
      const saw2 = ((t * 82.7) % 1) * 2 - 1;
      o[i] = (saw * 0.5 + saw2 * 0.3 + lp * 6) * throb;
    }
    // Soften the saw edges.
    let s1 = 0;
    for (let i = 0; i < o.length; i++) {
      s1 += 0.12 * (o[i] - s1);
      o[i] = s1;
    }
  });

/** Tension target: a distant signal bell (lighthouse / buoy). */
function beacon() {
  const len = Math.round(1.3 * SAMPLE_RATE);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let v = 0;
    for (const [f, a, d] of [[740, 1, 3], [1112, 0.5, 4], [1480, 0.3, 6], [2090, 0.15, 9]]) v += a * Math.sin(2 * Math.PI * f * t) * Math.exp(-t * d);
    out[i] = v * Math.min(1, t / 0.003);
  }
  return out;
}

/** Tension ambience: a dark, slowly moving drone with wind. */
const ambDread = () =>
  loop(10, 62, (o, r) => {
    noiseBed(o, r, { lpA: 0.015, lpB: 0.003, level: 0.5, wander: 0.0002 });
    for (let i = 0; i < o.length; i++) {
      const t = i / SAMPLE_RATE;
      o[i] += 0.05 * Math.sin(2 * Math.PI * 49 * t) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 0.1 * t)) + 0.03 * Math.sin(2 * Math.PI * 73.5 * t);
    }
  });

/** Cheerful target: a bright toy xylophone bar. */
function xylophone({ f0 = 1046.5 } = {}) {
  const len = Math.round(0.7 * SAMPLE_RATE);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    out[i] = (Math.sin(2 * Math.PI * f0 * t) * Math.exp(-t * 7) + 0.4 * Math.sin(2 * Math.PI * f0 * 4 * t) * Math.exp(-t * 22) + 0.15 * Math.sin(2 * Math.PI * f0 * 9.2 * t) * Math.exp(-t * 40)) * Math.min(1, t / 0.002);
  }
  return out;
}

/** Cheerful target: bicycle bell "dr-ring". */
function bikeBell() {
  const len = Math.round(0.9 * SAMPLE_RATE);
  const out = new Float32Array(len);
  for (const start of [0, 0.07, 0.14, 0.21]) {
    const s0 = Math.round(start * SAMPLE_RATE);
    for (let i = 0; s0 + i < len; i++) {
      const t = i / SAMPLE_RATE;
      out[s0 + i] += (Math.sin(2 * Math.PI * 2350 * t) + 0.6 * Math.sin(2 * Math.PI * 3760 * t) + 0.3 * Math.sin(2 * Math.PI * 5120 * t)) * Math.exp(-t * 6) * Math.min(1, t / 0.001);
    }
  }
  return out;
}

/** Cheerful time sound: one soft marimba note (code plays a little tune with it). */
function marimba() {
  const f0 = 523.3;
  const len = Math.round(0.5 * SAMPLE_RATE);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    out[i] = (Math.sin(2 * Math.PI * f0 * t) * Math.exp(-t * 9) + 0.3 * Math.sin(2 * Math.PI * f0 * 3.9 * t) * Math.exp(-t * 30)) * Math.min(1, t / 0.003);
  }
  return out;
}

/** Cheerful ambience: a sunny day, lots of birds, light breeze. */
const ambFair = () =>
  loop(10, 63, (o, r) => {
    noiseBed(o, r, { lpA: 0.03, lpB: 0.004, level: 0.25, wander: 0.0003 });
    sprinkle(o, r, 60, tweet);
  });

/**
 * Main-menu pad: a soft, mysterious sustained chord (A minor with an added
 * ninth), each voice drifting slightly so it shimmers, over a breath of air.
 * The menu swells its volume in time with the glowing dot. Seamless loop.
 */
const menuPad = () =>
  loop(12, 71, (o, r) => {
    const voices = [
      [110.0, 1.0],
      [164.8, 0.55],
      [220.0, 0.6],
      [261.6, 0.4],
      [329.6, 0.28],
      [493.9, 0.14], // the ninth: a little unresolved, hence "mysterious"
    ];
    for (let i = 0; i < o.length; i++) {
      const t = i / SAMPLE_RATE;
      let v = 0;
      voices.forEach(([f, a], k) => {
        const drift = 1 + 0.0025 * Math.sin(2 * Math.PI * (0.07 + k * 0.013) * t + k);
        v += a * (Math.sin(2 * Math.PI * f * drift * t) + 0.5 * Math.sin(2 * Math.PI * f * 1.003 * t + k));
      });
      o[i] = v * 0.2;
    }
    noiseBed(o, r, { lpA: 0.04, lpB: 0.01, level: 0.12, wander: 0.0002 });
  });

/** Short muffled thud for obstacle bumps (used from stage 3). */
function bump() {
  const len = Math.round(0.18 * SAMPLE_RATE);
  const out = new Float32Array(len);
  const rand = rng(3);
  let lp = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const f = 140 - 70 * Math.min(1, t / 0.08); // pitch drops
    lp += 0.08 * (rand() * 2 - 1 - lp);
    out[i] = (Math.sin(2 * Math.PI * f * t) + lp * 0.6) * Math.exp(-t * 28) * Math.min(1, t / 0.002);
  }
  return out;
}

writeWav('common/placeholder-target-chime.wav', chime());
// Single strike for pulse-based targets (repeat rate is driven by distance in code).
writeWav('common/placeholder-target-pulse.wav', chime({ period: 0.9, notes: [1174.7] }));
writeWav('common/placeholder-target-stream.wav', stream());
writeWav('common/bump.wav', bump());
writeWav('common/menu-pad.wav', menuPad(), 0.5);
writeWav('zen/time-bell.wav', bell());
writeWav('mystery/time-clock-tick.wav', clockTick());
writeWav('common/placeholder-collectible.wav', twinkle());
writeWav('common/collect.wav', sparkle());
writeWav('common/hint.wav', shimmer());
writeWav('common/placeholder-story-melody.wav', melody());
// Stage 9 targets
writeWav('zen/target-water-drop.wav', waterDrop());
writeWav('zen/target-bird.wav', birdChirp());
writeWav('zen/target-wind-chime.wav', windChime());
writeWav('zen/target-owl.wav', owlHoot());
writeWav('mystery/target-music-box.wav', chime({ period: 0.9, notes: [880] }));
writeWav('mystery/target-piano.wav', pianoNote());
writeWav('mystery/target-clock-chime.wav', windChime({ f0: 659.3 }));
// Tension and Cheerful
writeWav('tension/time-heartbeat.wav', heartbeat());
writeWav('tension/chaser-loop.wav', chaserLoop(), 0.7);
writeWav('tension/target-beacon.wav', beacon());
writeWav('cheerful/target-xylophone.wav', xylophone());
writeWav('cheerful/target-bike-bell.wav', bikeBell());
writeWav('cheerful/time-marimba.wav', marimba());
// Stage 9 ambiences (quiet beds: -14 dBFS peak)
const AMBIENCE_PEAK = 0.2;
writeWav('zen/amb-forest-dawn.wav', ambForestDawn(), AMBIENCE_PEAK);
writeWav('zen/amb-river-noon.wav', ambRiver(), AMBIENCE_PEAK);
writeWav('zen/amb-beach-evening.wav', ambBeach(), AMBIENCE_PEAK);
writeWav('zen/amb-hill-night.wav', ambNightHill(), AMBIENCE_PEAK);
writeWav('mystery/amb-house.wav', ambHouse(), AMBIENCE_PEAK);
writeWav('mystery/amb-rain.wav', ambRain(), AMBIENCE_PEAK);
writeWav('mystery/amb-cellar.wav', ambCellar(), AMBIENCE_PEAK);
writeWav('tension/amb-dread.wav', ambDread(), AMBIENCE_PEAK);
writeWav('cheerful/amb-fair.wav', ambFair(), AMBIENCE_PEAK);
