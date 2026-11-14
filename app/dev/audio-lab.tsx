import {
  Canvas,
  Circle,
  DashPathEffect,
  Group,
  RadialGradient,
  vec,
} from '@shopify/react-native-skia';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  audioEngine,
  preloadSounds,
  spatialPresets,
  withBehindCue,
  type BehindCueMode,
  type Difficulty,
  type SoundKey,
  type SpatialOutput,
  type SpatialParams,
  type SpatialSource,
  type Vec2,
} from '@/audio';
import { MenuButton } from '@/components/MenuButton';
import { Segmented } from '@/components/Segmented';
import { useTranslation } from '@/i18n';
import { goBack } from '@/navigation/goBack';
import { success } from '@/services/haptics';
import { colors, palettes, spacing, typography } from '@/theme';

/**
 * Stage 2 — spatial audio prototype ("Audio Lab"). Developer only.
 *
 * Drag anywhere in the dark field: the glowing dot is YOU (the listener).
 * The target sound sits at a fixed point. Its direction (stereo pan),
 * loudness (distance) and clarity (low-pass) update live as you move.
 *
 * World units = screen points here, the same scale real levels will use.
 */

const TARGET_ID = 'lab-target';
const glow = palettes.zen.playerGlow;

/** Sound choices in the lab: which file, and whether it loops or pulses. */
type LabSound = 'pulse' | 'chime' | 'stream';
const LAB_SOUNDS: Record<LabSound, { key: SoundKey; mode: 'loop' | 'pulse' }> = {
  pulse: { key: 'placeholderPulse', mode: 'pulse' },
  chime: { key: 'placeholderChime', mode: 'loop' },
  stream: { key: 'placeholderStream', mode: 'loop' },
};

/** Build params for the current difficulty and behind-cue variant. */
function paramsFor(difficulty: Difficulty, behindCue: BehindCueMode): SpatialParams {
  return withBehindCue(spatialPresets[difficulty], behindCue);
}

const toDb = (gain: number) => (gain <= 0.0001 ? '-∞' : (20 * Math.log10(gain)).toFixed(1));

export default function AudioLab() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // --- UI state -------------------------------------------------------------
  const [ready, setReady] = useState(false);
  const [sound, setSound] = useState<LabSound>('pulse');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [behindCue, setBehindCue] = useState<BehindCueMode>('muffleAndPitch');
  const [targetVisible, setTargetVisible] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [readout, setReadout] = useState<SpatialOutput | null>(null);
  const [latencyMs, setLatencyMs] = useState(0);
  const [found, setFound] = useState(false);

  // --- World state ----------------------------------------------------------
  const [field, setField] = useState({ width: 0, height: 0 });
  const [target, setTarget] = useState<Vec2>({ x: 0, y: 0 });
  const sourceRef = useRef<SpatialSource | null>(null);
  const foundRef = useRef(false);

  // Player position lives in shared values so the Skia dot moves on the UI
  // thread without re-rendering React on every touch event.
  const px = useSharedValue(0);
  const py = useSharedValue(0);
  const playerCenter = useDerivedValue(() => vec(px.value, py.value));

  // --- Layout: place player bottom-centre, target upper area ----------------
  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      setField({ width, height });
      const start = { x: width / 2, y: height * 0.8 };
      px.set(start.x);
      py.set(start.y);
      audioEngine.setListener(start);
      setTarget({ x: width * 0.3, y: height * 0.22 });
    },
    [px, py],
  );

  // --- Audio setup / teardown ----------------------------------------------
  useEffect(() => {
    let cancelled = false;
    preloadSounds(['placeholderPulse', 'placeholderChime', 'placeholderStream', 'bump'])
      .then(() => !cancelled && setReady(true))
      .catch((error) => console.warn('[audio-lab] failed to load sounds', error));
    return () => {
      cancelled = true;
      audioEngine.reset();
    };
  }, []);

  // (Re)create the target source when the sound changes.
  useEffect(() => {
    if (!ready || field.width === 0) return;
    const source = audioEngine.createSpatialSource({
      id: TARGET_ID,
      sound: LAB_SOUNDS[sound].key,
      mode: LAB_SOUNDS[sound].mode,
      position: target,
      params: paramsFor(difficulty, behindCue),
    });
    sourceRef.current = source;
    if (playing) source.start();
    return () => audioEngine.destroySource(TARGET_ID);
    // Only the sound choice / readiness should rebuild the source; the other
    // values are pushed live by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, sound, field.width]);

  useEffect(() => sourceRef.current?.setPosition(target), [target]);
  useEffect(
    () => sourceRef.current?.setParams(paramsFor(difficulty, behindCue)),
    [difficulty, behindCue],
  );
  useEffect(() => {
    if (playing) sourceRef.current?.start();
    else sourceRef.current?.stop();
  }, [playing]);

  // Readouts refresh at 10 Hz — plenty for humans, cheap for React.
  useEffect(() => {
    const id = setInterval(() => {
      const out = sourceRef.current?.output;
      if (!out) return;
      setReadout({ ...out });
      setLatencyMs(Math.round(audioEngine.getLatency() * 1000));
    }, 100);
    return () => clearInterval(id);
  }, []);

  // --- Movement ---------------------------------------------------------------
  const moveTo = useCallback(
    (x: number, y: number) => {
      px.set(x);
      py.set(y);
      audioEngine.setListener({ x, y });
      // "Found it" when inside the full-volume radius (with hysteresis so it
      // doesn't flicker on the edge).
      const d = sourceRef.current?.output.distance ?? Infinity;
      const ref = spatialPresets[difficulty].refDistance;
      if (!foundRef.current && d < ref) {
        foundRef.current = true;
        setFound(true);
        success();
      } else if (foundRef.current && d > ref * 2) {
        foundRef.current = false;
        setFound(false);
      }
    },
    [px, py, difficulty],
  );

  const pan = usePanGesture({
    minDistance: 0,
    // Run callbacks on the JS thread: the audio engine lives there.
    runOnJS: true,
    onBegin: (e) => moveTo(e.x, e.y),
    onUpdate: (e) => moveTo(e.x, e.y),
  });

  const moveTargetRandomly = () => {
    const margin = 40;
    setTarget({
      x: margin + Math.random() * (field.width - margin * 2),
      y: margin + Math.random() * (field.height - margin * 2),
    });
    foundRef.current = false;
    setFound(false);
  };

  const params = spatialPresets[difficulty];

  return (
    <View style={styles.root}>
      {/* ---------- Dark field (touch area) ---------- */}
      <GestureDetector gesture={pan}>
        <View style={[styles.field, { marginTop: insets.top }]} onLayout={onLayout}>
          <Canvas style={StyleSheet.absoluteFill}>
            {targetVisible && field.width > 0 && (
              <Group>
                {/* Full-volume radius and max-distance radius */}
                <Circle
                  cx={target.x}
                  cy={target.y}
                  r={params.maxDistance}
                  style="stroke"
                  strokeWidth={1}
                  color="rgba(80, 220, 255, 0.12)"
                >
                  <DashPathEffect intervals={[4, 8]} />
                </Circle>
                <Circle
                  cx={target.x}
                  cy={target.y}
                  r={params.refDistance}
                  style="stroke"
                  strokeWidth={1.5}
                  color={colors.debugTarget}
                />
                <Circle cx={target.x} cy={target.y} r={4} color={colors.debugTarget} />
              </Group>
            )}
            {/* Player glow + core */}
            <Circle c={playerCenter} r={70}>
              <RadialGradient c={playerCenter} r={70} colors={[`${glow}55`, `${glow}00`]} />
            </Circle>
            <Circle c={playerCenter} r={7} color={glow} />
          </Canvas>

          {/* Live readout */}
          <View style={styles.readout} pointerEvents="none">
            <Text style={styles.readoutTitle}>
              {t('dev.audioLab')} · {t('dev.devOnly')}
            </Text>
            {readout && (
              <Text style={styles.readoutText}>
                pan {readout.pan >= 0 ? '+' : ''}
                {readout.pan.toFixed(2)} · {toDb(readout.gain)} dB ·{' '}
                {Math.round(readout.cutoffHz)} Hz · d {Math.round(readout.distance)} ·{' '}
                {readout.frontness >= 0 ? 'front' : 'behind'} · ×{readout.playbackRate.toFixed(2)} ·{' '}
                {sound === 'pulse' ? `${readout.pulseInterval.toFixed(2)} s · ` : ''}
                {latencyMs} ms
              </Text>
            )}
            {!ready && <Text style={styles.readoutText}>{t('dev.loading')}</Text>}
            {found && <Text style={styles.found}>{t('dev.found')}</Text>}
          </View>
          <Text style={styles.hint} pointerEvents="none">
            {t('dev.labHint')}
          </Text>
        </View>
      </GestureDetector>

      {/* ---------- Control panel ---------- */}
      <View style={[styles.panel, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Segmented
          compact
          value={sound}
          onChange={setSound}
          options={[
            { value: 'pulse', label: t('dev.soundPulse') },
            { value: 'chime', label: t('dev.soundChime') },
            { value: 'stream', label: t('dev.soundStream') },
          ]}
        />
        <Segmented
          compact
          value={difficulty}
          onChange={setDifficulty}
          options={[
            { value: 'easy', label: t('difficulty.easy') },
            { value: 'normal', label: t('difficulty.normal') },
            { value: 'hard', label: t('difficulty.hard') },
          ]}
        />
        <Text style={styles.panelLabel}>{t('dev.behindCue')}</Text>
        <Segmented
          compact
          value={behindCue}
          onChange={setBehindCue}
          options={[
            { value: 'off', label: t('dev.off') },
            { value: 'muffle', label: t('dev.cueMuffle') },
            { value: 'muffleAndPitch', label: t('dev.cueMufflePitch') },
          ]}
        />
        <Segmented
          compact
          value={targetVisible ? 'show' : 'hide'}
          onChange={(v) => setTargetVisible(v === 'show')}
          options={[
            { value: 'show', label: t('dev.showTarget') },
            { value: 'hide', label: t('dev.hideTarget') },
          ]}
        />
        <View style={styles.buttonRow}>
          <View style={styles.flex}>
            <MenuButton compact label={t('dev.moveTarget')} onPress={moveTargetRandomly} />
          </View>
          <View style={styles.flex}>
            <MenuButton
              compact
              label={playing ? t('dev.pause') : t('dev.play')}
              onPress={() => setPlaying((p) => !p)}
            />
          </View>
          <View style={styles.flex}>
            <MenuButton compact label={t('common.back')} onPress={() => goBack()} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  field: { flex: 1, overflow: 'hidden' },
  // Right inset leaves room for the dev-client's floating gear button.
  readout: { position: 'absolute', top: spacing.sm, left: spacing.md, right: 72 },
  readoutTitle: { ...typography.caption, color: colors.textMuted, textTransform: 'uppercase' },
  readoutText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.3,
  },
  found: { ...typography.subtitle, color: colors.success, marginTop: spacing.sm },
  hint: {
    ...typography.caption,
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.md,
    right: spacing.md,
    textAlign: 'center',
    letterSpacing: 0.4,
    color: colors.textMuted,
  },
  panel: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  panelLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: -spacing.xs,
  },
  buttonRow: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
