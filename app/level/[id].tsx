import { Canvas, Circle, Group, vec } from '@shopify/react-native-skia';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  audioEngine,
  chaserParams,
  collectibleParams,
  narrationKey,
  preloadNarration,
  preloadSounds,
  spatialPresets,
  TimeSoundPlayer,
  timeSoundKeys,
  type SpatialSource,
} from '@/audio';
import { ChaserGlow } from '@/components/ChaserGlow';
import { ControlDemo } from '@/components/ControlDemo';
import { CollectBurst } from '@/components/CollectBurst';
import { ColorTrail } from '@/components/ColorTrail';
import { DebugOverlay } from '@/components/DebugOverlay';
import { FoundStar } from '@/components/FoundStar';
import { HintButton } from '@/components/HintButton';
import { HintGlow } from '@/components/HintGlow';
import { MenuButton } from '@/components/MenuButton';
import { Segmented } from '@/components/Segmented';
import { LitGround } from '@/components/LitGround';
import { ObstacleOverlay } from '@/components/ObstacleOverlay';
import { PlayerDot } from '@/components/PlayerDot';
import { RevealImage } from '@/components/RevealImage';
import { SoundNotes } from '@/components/SoundNotes';
import { Stars } from '@/components/Stars';
import { StoryCaption } from '@/components/StoryCaption';
import { TimerLine } from '@/components/TimerLine';
import { TimerReadout } from '@/components/TimerReadout';
import { WaveRings } from '@/components/WaveRings';
import {
  getLevel,
  obstaclesFor,
  type CollectibleDefinition,
  type LevelDefinition,
} from '@/data/levels';
import { fitCamera } from '@/game/camera';
import { moveWithCollisions } from '@/game/collision';
import { Countdown, levelDuration, starsFor, type StarCount } from '@/game/countdown';
import {
  DIFFICULTIES,
  difficultyRules,
  isDifficulty,
  type Difficulty,
} from '@/game/difficulty';
import { clamp, distance, dot, WORLD_HEIGHT, WORLD_WIDTH, type Vec2 } from '@/game/geometry';
import { Hints, type HintSnapshot } from '@/game/hints';
import { NavGrid } from '@/game/pathfinding';
import {
  defaultMovementTuning,
  desiredVelocity,
  smoothVelocity,
  type ControlScheme,
  type TouchState,
} from '@/game/movement';
import { TiltInput } from '@/game/tilt';
import { Trail } from '@/game/trail';
import { useGameLoop } from '@/game/useGameLoop';
import { useAudioOutput } from '@/hooks/useAudioOutput';
import { ValueStore } from '@/game/valueStore';
import { useTranslation, type TranslationKey } from '@/i18n';
import type { StoryId } from '@/i18n/types';
import { SCREENSHOT_MODE } from '@/config/screenshotMode';
import { JOURNEY_LENGTH, lockReason, nextLevel } from '@/data/journeys';
import { goBack } from '@/navigation/goBack';
import { getMode, isModeId, type ModeId } from '@/modes';
import { ads, REWARDED_EXTRA_SECONDS } from '@/services/ads';
import * as haptics from '@/services/haptics';
import { useKeepScreenAwake } from '@/services/keepAwake';
import { freeHintsPerLevel } from '@/services/purchases';
import { useProgress } from '@/services/ProgressProvider';
import { useSettings } from '@/services/SettingsProvider';
import { colors, motion, palettes, radius, spacing, typography } from '@/theme';

/** Player collision radius in world units. */
const PLAYER_RADIUS = 9;
const DEFAULT_REACH_RADIUS = 26;
const TARGET_SOURCE_ID = 'level-target';
/** While pressing into a wall, repeat the bump at most this often (ms). */
const BUMP_REPEAT_MS = 700;
/** Speed into a wall (world units/s) needed to count as a bump, not a graze. */
const BUMP_MIN_SPEED = 25;
/** How long the Zen "time's up, no rush" note stays on screen (ms). */
const ZEN_NOTICE_MS = 4500;
/** Walking within this distance (world units) of a hidden sound picks it up. */
const COLLECT_RADIUS = 22;
const collectibleSourceId = (id: string) => `collectible:${id}`;
/** How long reward toasts ("+10 seconds") stay up (ms). */
const TOAST_MS = 1800;
/** Duration of one wave ring sweep (ms). */
const WAVE_MS = 1400;
/** How far ahead along the route the hint light floats (world units). */
const HINT_LOOKAHEAD = 75;
/** A hint also flashes the obstacles: fade in, hold, fade out ≈ 0.3 s. */
const OBSTACLE_FLASH = { fadeIn: 60, hold: 100, fadeOut: 120 };
/** How visible the obstacles are over the finished picture. */
const OBSTACLE_REVEAL_OPACITY = 0.9;
const CONTROL_SCHEMES: readonly ControlScheme[] = ['followFinger', 'joystick', 'tilt'];
const CHASER_SOURCE_ID = 'level-chaser';
/** The chaser catches the player within this distance (world units). */
const CATCH_RADIUS = 20;
/** The chaser is felt (haze, haptics) from this distance. */
const CHASER_SENSE_RADIUS = 240;
/** How often the chaser re-plans its route to the moving player (s). */
const CHASER_REPLAN = 0.35;
const WORLD = { width: WORLD_WIDTH, height: WORLD_HEIGHT };
/** Modes the test level can be played as (developer toggle). */
const TEST_MODES: readonly ModeId[] = ['zen', 'mystery'];

/**
 * loading   → sounds decoding
 * ready     → control demo card; nothing plays until the player presses Start
 * playing   → walking around, countdown running
 * paused    → a rewarded video (extra hint) is showing; clock frozen
 * timeUp    → countdown ended in a "fail" mode (Mystery): retry / +15 s
 * caught    → Tension: the chaser reached the player: retry / escape
 * revealing → target reached, picture opening (input disabled)
 * revealed  → picture shown, stars + result buttons visible
 */
type Phase =
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'timeUp'
  | 'caught'
  | 'revealing'
  | 'revealed';

/**
 * Route: /level/[id]?mode=zen|mystery&difficulty=easy|normal|hard
 *
 * `mode` only matters for test levels (real levels belong to one mode);
 * `difficulty` defaults to normal until the selection screens exist.
 */
export default function LevelScreen() {
  const params = useLocalSearchParams<{
    id: string;
    mode?: string;
    difficulty?: string;
    demo?: string;
    cues?: string;
  }>();
  const level = getLevel(params.id ?? '');
  const { t } = useTranslation();

  if (!level) {
    return (
      <View style={[styles.root, styles.centered]}>
        <Text style={styles.message}>{t('level.notFound')}</Text>
        <MenuButton label={t('common.back')} onPress={() => goBack()} />
      </View>
    );
  }

  const mode: ModeId =
    level.mode === 'test' ? (isModeId(params.mode) ? params.mode : 'zen') : level.mode;
  const difficulty: Difficulty = isDifficulty(params.difficulty) ? params.difficulty : 'normal';

  // Remount on any change so every run starts from a clean state.
  return (
    <LevelPlayer
      key={`${level.id}:${mode}:${difficulty}`}
      level={level}
      mode={mode}
      difficulty={difficulty}
      // Screenshot builds only: the level plays itself (see screenshotMode.ts).
      demo={SCREENSHOT_MODE ? params.demo : undefined}
      demoCues={SCREENSHOT_MODE && params.cues === '1'}
    />
  );
}

interface LevelPlayerProps {
  level: LevelDefinition;
  mode: ModeId;
  difficulty: Difficulty;
  /** Screenshot mode: 'walk' = walk the route by itself; 'hint' = also use a hint. */
  demo?: string;
  /** Screenshot mode: force the no-headphones wave rings on. */
  demoCues?: boolean;
}

/**
 * The level itself: dark field, the player dot, invisible obstacles, a
 * target found by ear, the countdown (sound + corner line), the colour
 * trail and the end-of-level reveal with stars.
 */
function LevelPlayer({ level, mode, difficulty, demo, demoCues = false }: LevelPlayerProps) {
  const { t, language } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { settings, updateSettings } = useSettings();
  const scheme = settings.controlScheme;
  // Read once per level: turning the demo off mid-card must not restart loading.
  const showControlIntro = useRef(settings.showControlIntro && !demo);
  const collectibles = useMemo(() => level.collectibles ?? [], [level]);
  /** True when every hidden sound of the level is a star to collect (the Cheerful journey). */
  const starLevel = collectibles.length > 0 && collectibles.every((c) => c.reward.kind === 'star');
  useKeepScreenAwake();

  // Tilt control: listen to the accelerometer only while it's the chosen scheme.
  const tilt = useMemo(() => new TiltInput(), []);
  useEffect(() => {
    if (scheme !== 'tilt') return;
    tilt.start();
    return () => tilt.stop();
  }, [scheme, tilt]);
  const visualCues = useAudioOutput().visualCues || demoCues;
  const { progress, recordCompletion } = useProgress();

  const modeDef = getMode(mode);
  const palette = palettes[modeDef.palette];
  const obstacles = useMemo(() => obstaclesFor(level, difficulty), [level, difficulty]);
  const totalTime = levelDuration(level.baseTimeSeconds, difficulty);
  // Walkable-route map: the hint points along the real path, around walls.
  const nav = useMemo(() => new NavGrid(obstacles, WORLD, PLAYER_RADIUS), [obstacles]);
  const routeToTarget = useMemo(() => nav.distanceField(level.target.position), [nav, level]);
  const reachRadius = level.target.reachRadius ?? DEFAULT_REACH_RADIUS;

  const [phase, setPhase] = useState<Phase>('loading');
  const [debug, setDebug] = useState(false);
  const [stars, setStars] = useState<StarCount>(1);
  const [zenNotice, setZenNotice] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  // Result card hidden so the whole picture (trail + obstacles) can be seen.
  const [peek, setPeek] = useState(false);
  const [collected, setCollected] = useState<string[]>([]);
  const [toast, setToast] = useState<{ key: number; text: string } | null>(null);
  const [story, setStory] = useState<StoryId | null>(null);
  const [burstAt, setBurstAt] = useState<Vec2 | null>(null);

  // Leave room for the top HUD row; the level fills the rest of the screen.
  const hudHeight = 48;
  const camera = useMemo(
    () =>
      fitCamera(WORLD, {
        x: insets.left,
        y: insets.top + hudHeight,
        width: width - insets.left - insets.right,
        height: height - insets.top - hudHeight - insets.bottom,
      }),
    [width, height, insets],
  );

  // --- Mutable game state (refs: changes every frame, must not re-render) ---
  const pos = useRef<Vec2>({ ...level.start });
  const vel = useRef<Vec2>({ x: 0, y: 0 });
  const touch = useRef<TouchState>({
    active: false,
    origin: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
  });
  const contact = useRef({ touching: false, lastBumpAt: 0 });
  const countdown = useRef(new Countdown(totalTime));
  // Whole seconds for the digits (null = hidden). Only <TimerReadout> re-renders.
  const secondsLeft = useMemo(() => new ValueStore<number | null>(totalTime), [totalTime]);
  const timedOut = useRef(false);
  const timeSound = useMemo(() => new TimeSoundPlayer(audioEngine, modeDef.timeSound), [modeDef]);
  const target = useRef<SpatialSource | null>(null);
  // Tension: the chaser (only in modes that have one, on levels that place one).
  const chaserDef = modeDef.chaser ? level.chaser : undefined;
  const chaserStart = chaserDef?.start ?? level.start;
  const chaserPos = useRef<Vec2>({ ...chaserStart });
  const chaserWait = useRef(chaserDef?.delaySeconds ?? 0);
  const chaserRoute = useRef<Float32Array | null>(null);
  const chaserRouteAge = useRef(0);
  const chaserSource = useRef<SpatialSource | null>(null);
  const chaserPulseIn = useRef(0);
  const collectedIds = useRef(new Set<string>());
  const hints = useRef(new Hints(freeHintsPerLevel(), difficulty));
  // Hint button state; only <HintButton> re-renders when it changes.
  const hintStore = useMemo(
    () => new ValueStore<HintSnapshot>(new Hints(freeHintsPerLevel(), difficulty).snapshot),
    [difficulty],
  );
  // The trail is its own tiny store: only <ColorTrail> re-renders when it grows.
  const trail = useMemo(() => {
    const tr = new Trail();
    tr.add(level.start);
    return tr;
  }, [level]);

  // Render state on the UI thread.
  const playerCenter = useSharedValue(vec(level.start.x, level.start.y));
  const joyOrigin = useSharedValue(vec(0, 0));
  const joyKnob = useSharedValue(vec(0, 0));
  const joyOpacity = useSharedValue(0);
  const energy = useSharedValue(0);
  const flash = useSharedValue(0);
  const reveal = useSharedValue(0);
  const trailOpacity = useSharedValue(1);
  const timerFraction = useSharedValue(1);
  const urgency = useSharedValue(0);
  const hintProgress = useSharedValue(0);
  const hintAim = useSharedValue(vec(level.start.x, level.start.y));
  const obstacleOpacity = useSharedValue(0);
  const chaserCenter = useSharedValue(vec(chaserStart.x, chaserStart.y));
  const chaserProximity = useSharedValue(0);
  // Three wave slots are enough: a wave lasts 1.4 s, strikes come ≥ 0.4 s apart.
  const wave0 = useSharedValue(0);
  const wave1 = useSharedValue(0);
  const wave2 = useSharedValue(0);
  const waves = useMemo(() => [wave0, wave1, wave2], [wave0, wave1, wave2]);
  const nextWave = useRef(0);
  const visualCuesRef = useRef(visualCues);
  const burstProgress = useSharedValue(0);

  // --- Audio setup -------------------------------------------------------
  /** A target strike was booked: send a wave ring that lands on the beat. */
  const onTargetPulse = useCallback(
    (delaySeconds: number) => {
      if (!visualCuesRef.current) return;
      setTimeout(() => {
        const slot = waves[nextWave.current++ % waves.length]!;
        slot.set(0);
        slot.set(withTiming(1, { duration: WAVE_MS, easing: Easing.out(Easing.quad) }));
      }, delaySeconds * 1000);
    },
    [waves],
  );

  /** Send the chaser back to where it starts and make it wait again. */
  const resetChaser = useCallback(() => {
    if (!chaserDef) return;
    chaserPos.current = { ...chaserDef.start };
    chaserWait.current = chaserDef.delaySeconds;
    chaserRoute.current = null;
    chaserCenter.set(vec(chaserDef.start.x, chaserDef.start.y));
    chaserProximity.set(0);
    chaserSource.current?.setPosition(chaserDef.start);
  }, [chaserDef, chaserCenter, chaserProximity]);

  /** Create and start the target + every hidden sound not yet collected. */
  const startSources = useCallback(() => {
    audioEngine.setListener(level.start);
    audioEngine.setReverb(modeDef.reverb);
    if (level.ambience) audioEngine.startAmbience(level.ambience);
    const source = audioEngine.createSpatialSource({
      id: TARGET_SOURCE_ID,
      sound: level.target.sound,
      mode: level.target.playback ?? 'pulse',
      position: level.target.position,
      params: spatialPresets[difficulty],
      onPulse: onTargetPulse,
    });
    source.start();
    target.current = source;
    if (chaserDef) {
      resetChaser();
      chaserSource.current = audioEngine.createSpatialSource({
        id: CHASER_SOURCE_ID,
        sound: 'chaserLoop',
        mode: 'loop',
        position: chaserDef.start,
        params: chaserParams,
        volume: 0.9,
      });
      chaserSource.current.start();
    }
    for (const c of collectibles) {
      if (collectedIds.current.has(c.id)) continue;
      audioEngine
        .createSpatialSource({
          id: collectibleSourceId(c.id),
          sound: c.sound,
          mode: 'loop',
          position: c.position,
          params: collectibleParams,
          volume: 0.8,
        })
        .start();
    }
  }, [level, difficulty, collectibles, onTargetPulse, modeDef, chaserDef, resetChaser]);

  useEffect(() => {
    let cancelled = false;
    const storyIds = collectibles.flatMap((c) => (c.reward.kind === 'story' ? [c.reward.storyId] : []));
    Promise.all([
      preloadSounds([
        level.target.sound,
        'bump',
        'collect',
        'hint',
        'placeholderPulse', // placeholder success chime + star sound
        ...timeSoundKeys(modeDef.timeSound),
        ...collectibles.map((c) => c.sound),
        ...(level.ambience ? [level.ambience] : []),
        ...(chaserDef ? (['chaserLoop'] as const) : []),
      ]),
      ...storyIds.map((id) => preloadNarration(id, language)),
    ])
      .then(() => {
        if (cancelled) return;
        if (showControlIntro.current) {
          setPhase('ready'); // the player starts sound and clock with "Start"
        } else {
          startSources();
          setPhase('playing');
        }
      })
      .catch((error) => console.warn('[level] failed to load sounds', error));
    return () => {
      cancelled = true;
      audioEngine.reset();
    };
  }, [level, modeDef, collectibles, language, startSources, chaserDef]);

  // Follow headphone changes live; tell the player when cues switch on mid-level.
  useEffect(() => {
    const wasOn = visualCuesRef.current;
    visualCuesRef.current = visualCues;
    if (visualCues && !wasOn && phase === 'playing') {
      setToast({ key: Date.now(), text: t('level.headphonesRemoved') });
    }
    // Only react to visualCues flips, not every phase change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualCues]);

  // Reward toast auto-hides.
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  // Story subtitle stays for the narration's length (at least 5 s).
  useEffect(() => {
    if (!story) return;
    const seconds = Math.max(5, audioEngine.getDuration(narrationKey(story, language)) + 0.8);
    const id = setTimeout(() => setStory(null), seconds * 1000);
    return () => clearTimeout(id);
  }, [story, language]);

  // Hide the Zen "no rush" note after a few seconds.
  useEffect(() => {
    if (!zenNotice) return;
    const id = setTimeout(() => setZenNotice(false), ZEN_NOTICE_MS);
    return () => clearTimeout(id);
  }, [zenNotice]);

  // --- Input ---------------------------------------------------------------
  const pan = usePanGesture({
    minDistance: 0,
    runOnJS: true,
    // Don't cancel React Native touchables (HUD buttons) when the pan starts.
    cancelsJSResponder: false,
    onBegin: (e) => {
      touch.current = { active: true, origin: { x: e.x, y: e.y }, current: { x: e.x, y: e.y } };
    },
    onUpdate: (e) => {
      touch.current.current = { x: e.x, y: e.y };
    },
    onFinalize: () => {
      touch.current.active = false;
      joyOpacity.set(0);
    },
  });

  // --- Game loop -----------------------------------------------------------
  const stopMoving = useCallback(() => {
    touch.current.active = false;
    vel.current = { x: 0, y: 0 };
    energy.set(withTiming(0, { duration: motion.normal }));
    joyOpacity.set(0);
  }, [energy, joyOpacity]);

  /** Pick up a hidden sound and grant its reward. */
  const collect = useCallback(
    (c: CollectibleDefinition) => {
      collectedIds.current.add(c.id);
      setCollected([...collectedIds.current]);
      audioEngine.destroySource(collectibleSourceId(c.id));
      audioEngine.playOneShot('collect', { volume: 0.8 });
      haptics.collect();
      setBurstAt(c.position);
      burstProgress.set(0);
      burstProgress.set(withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));

      const { reward } = c;
      if (reward.kind === 'time' || reward.kind === 'star') {
        const cd = countdown.current;
        // After Zen's time-up the clock is gone for good; time can't revive it.
        if (!cd.isUp) cd.addTime(reward.seconds);
        if (reward.kind === 'star') {
          setToast({ key: Date.now(), text: t('collect.star', { seconds: reward.seconds }) });
        } else if (!cd.isUp) {
          setToast({ key: Date.now(), text: t('collect.time', { seconds: reward.seconds }) });
        }
      } else if (reward.kind === 'albumDetail') {
        setToast({ key: Date.now(), text: t('collect.albumDetail') });
      } else {
        audioEngine.playOneShot(narrationKey(reward.storyId, language), { volume: 0.9 });
        setStory(reward.storyId);
      }
    },
    [t, language, burstProgress, setCollected, setBurstAt, setToast, setStory],
  );

  /** Next point on the walkable route to the target (falls back to the target). */
  const hintTarget = useCallback(
    () => nav.waypoint(routeToTarget, pos.current, HINT_LOOKAHEAD) ?? level.target.position,
    [nav, routeToTarget, level],
  );

  /** Light the hint along the route (its sound comes from that side too). */
  const showHint = useCallback(() => {
    const aim = hintTarget();
    hintAim.set(vec(aim.x, aim.y));
    // A glimpse of what is in the way.
    obstacleOpacity.set(
      withSequence(
        withTiming(1, { duration: OBSTACLE_FLASH.fadeIn }),
        withDelay(OBSTACLE_FLASH.hold, withTiming(0, { duration: OBSTACLE_FLASH.fadeOut })),
      ),
    );
    hintProgress.set(0);
    hintProgress.set(
      withTiming(1, { duration: hints.current.duration * 1000, easing: Easing.linear }),
    );
    const dx = aim.x - pos.current.x;
    const d = distance(aim, pos.current) || 1;
    audioEngine.playOneShot('hint', { pan: clamp((dx / d) * 0.8, -0.8, 0.8), volume: 0.7 });
  }, [hintProgress, hintAim, hintTarget, obstacleOpacity]);

  const tick = useCallback(
    (dt: number) => {
      // 1) Movement + collision
      const tuning = defaultMovementTuning;
      let desired = desiredVelocity(scheme, touch.current, pos.current, camera, tuning, tilt.lean);
      if (demo) {
        // Screenshot mode: walk the route to the target at an easy pace.
        const wp = nav.waypoint(routeToTarget, pos.current, 40) ?? level.target.position;
        const gap = distance(wp, pos.current) || 1;
        desired = {
          x: ((wp.x - pos.current.x) / gap) * tuning.maxSpeed * 0.8,
          y: ((wp.y - pos.current.y) / gap) * tuning.maxSpeed * 0.8,
        };
      }
      let v = smoothVelocity(vel.current, desired, dt, tuning);

      const result = moveWithCollisions(
        pos.current,
        { x: v.x * dt, y: v.y * dt },
        PLAYER_RADIUS,
        obstacles,
        WORLD,
      );
      pos.current = result.position;

      // 2) Bump feedback: sound panned toward the wall's side + haptic + flash.
      const n = result.contactNormal;
      const speedIntoWall = n ? -dot(v, n) : 0;
      if (n && speedIntoWall > BUMP_MIN_SPEED) {
        const now = Date.now();
        const c = contact.current;
        if (!c.touching || now - c.lastBumpAt > BUMP_REPEAT_MS) {
          audioEngine.playOneShot('bump', {
            // Normal points away from the wall, so the wall is on -normal.x.
            pan: clamp(-n.x * 0.8, -0.8, 0.8),
            volume: clamp(speedIntoWall / tuning.maxSpeed, 0.45, 1),
          });
          haptics.bump();
          flash.set(withSequence(withTiming(1, { duration: 0 }), withTiming(0, { duration: 450 })));
          c.lastBumpAt = now;
        }
        c.touching = true;
        // Drop the velocity component into the wall so we slide, not stick.
        v = { x: v.x + n.x * speedIntoWall, y: v.y + n.y * speedIntoWall };
      } else if (!n) {
        contact.current.touching = false;
      }
      vel.current = v;

      // 3) Push state to audio + renderer
      audioEngine.setListener(pos.current);
      playerCenter.set(vec(pos.current.x, pos.current.y));
      trail.add(pos.current);
      energy.set(clamp(Math.hypot(v.x, v.y) / tuning.maxSpeed, 0, 1));
      if (scheme === 'joystick' && touch.current.active) {
        const { origin, current } = touch.current;
        const dx = current.x - origin.x;
        const dy = current.y - origin.y;
        const len = Math.hypot(dx, dy);
        const k = len > tuning.joystickRange ? tuning.joystickRange / len : 1;
        joyOrigin.set(vec(origin.x, origin.y));
        joyKnob.set(vec(origin.x + dx * k, origin.y + dy * k));
        joyOpacity.set(1);
      }

      // 4) Hints and hidden sounds
      hints.current.tick(dt);
      const snap = hints.current.snapshot;
      const prev = hintStore.get();
      if (
        snap.status !== prev.status ||
        snap.freeLeft !== prev.freeLeft ||
        snap.cooldownSeconds !== prev.cooldownSeconds
      ) {
        hintStore.set(snap);
      }
      if (snap.status === 'active') {
        // Keep re-aiming along the route while the light is showing.
        const aim = hintTarget();
        hintAim.set(vec(aim.x, aim.y));
      }
      for (const c of collectibles) {
        if (!collectedIds.current.has(c.id) && distance(pos.current, c.position) < COLLECT_RADIUS) {
          collect(c);
        }
      }

      // 5) Reached the target? (Checked before the clock: a tie goes to the player.)
      if (distance(pos.current, level.target.position) < reachRadius) {
        const cd = countdown.current;
        // Cheerful: the level's three stars are lying on the ground, so the
        // rating is how many of them were picked up (at least one for
        // finishing). Everywhere else it is the share of time left.
        const earned = starLevel
          ? (Math.min(3, Math.max(1, collectedIds.current.size)) as StarCount)
          : starsFor(cd.remaining, cd.total, timedOut.current);
        setStars(earned);
        recordCompletion(level.id, earned, [...collectedIds.current]);
        audioEngine.destroySource(TARGET_SOURCE_ID);
        target.current = null;
        audioEngine.destroySource(CHASER_SOURCE_ID);
        chaserSource.current = null;
        chaserProximity.set(0);
        haptics.success();
        playSuccessChime();
        stopMoving();
        setZenNotice(false);
        reveal.set(withTiming(1, { duration: motion.reveal, easing: Easing.inOut(Easing.cubic) }));
        // Once the picture is mostly open, show what stood in the way.
        obstacleOpacity.set(
          withDelay(motion.reveal * 0.6, withTiming(OBSTACLE_REVEAL_OPACITY, { duration: 900 })),
        );
        // Dim the trail so it glows softly over the picture.
        trailOpacity.set(withTiming(0.35, { duration: motion.reveal }));
        setPhase('revealing');
        return;
      }

      // 6) Tension: the chaser follows the walkable route to the player.
      if (chaserDef) {
        if (chaserWait.current > 0) {
          chaserWait.current -= dt;
        } else {
          chaserRouteAge.current += dt;
          if (!chaserRoute.current || chaserRouteAge.current > CHASER_REPLAN) {
            chaserRoute.current = nav.distanceField(pos.current);
            chaserRouteAge.current = 0;
          }
          const cp = chaserPos.current;
          const wp = nav.waypoint(chaserRoute.current, cp, 30) ?? pos.current;
          const gapToWp = distance(wp, cp);
          if (gapToWp > 0.01) {
            const step = Math.min(gapToWp, difficultyRules[difficulty].chaserSpeed * dt);
            chaserPos.current = {
              x: cp.x + ((wp.x - cp.x) / gapToWp) * step,
              y: cp.y + ((wp.y - cp.y) / gapToWp) * step,
            };
          }
          chaserSource.current?.setPosition(chaserPos.current);
          chaserCenter.set(vec(chaserPos.current.x, chaserPos.current.y));
        }
        const gap = distance(chaserPos.current, pos.current);
        const proximity = clamp(1 - gap / CHASER_SENSE_RADIUS, 0, 1);
        chaserProximity.set(proximity);
        // The closer it gets, the faster the phone pulses.
        if (proximity > 0.5) {
          chaserPulseIn.current -= dt;
          if (chaserPulseIn.current <= 0) {
            haptics.countdownPulse();
            chaserPulseIn.current = 0.75 - 0.5 * proximity;
          }
        }
        if (chaserWait.current <= 0 && gap < CATCH_RADIUS) {
          haptics.failure();
          target.current?.stop();
          chaserSource.current?.stop();
          stopMoving();
          setPhase('caught');
          return;
        }
      }

      // 7) Countdown
      const cd = countdown.current;
      if (cd.isUp) return; // Zen after time-up: keep walking, clock is silent.
      timeSound.update(dt, cd.fraction);
      for (const event of cd.tick(dt)) {
        if (event.type === 'finalSecond') {
          haptics.countdownPulse();
          timeSound.finalSecond();
          urgency.set(withSequence(withTiming(1, { duration: 80 }), withTiming(0, { duration: 650 })));
        } else {
          timeSound.timeUp();
          if (modeDef.timeoutBehavior === 'fail') {
            target.current?.stop();
            chaserSource.current?.stop();
            stopMoving();
            setPhase('timeUp');
          } else {
            timedOut.current = true; // finishing now earns 1 star
            secondsLeft.set(null);
            setZenNotice(true);
          }
        }
      }
      timerFraction.set(cd.fraction);
      if (!cd.isUp || modeDef.timeoutBehavior === 'fail') secondsLeft.set(Math.ceil(cd.remaining));
    },
    [
      scheme,
      camera,
      obstacles,
      level,
      reachRadius,
      modeDef,
      timeSound,
      trail,
      tilt,
      demo,
      routeToTarget,
      secondsLeft,
      collectibles,
      collect,
      hintStore,
      hintTarget,
      hintAim,
      obstacleOpacity,
      nav,
      difficulty,
      chaserDef,
      chaserCenter,
      chaserProximity,
      recordCompletion,
      starLevel,
      stopMoving,
      playerCenter,
      joyOrigin,
      joyKnob,
      joyOpacity,
      energy,
      flash,
      reveal,
      trailOpacity,
      timerFraction,
      urgency,
      // State setters are stable; listed so the React Compiler can verify deps.
      setStars,
      setZenNotice,
      setPhase,
    ],
  );

  useGameLoop(tick, phase === 'playing');


  // Screenshot mode: use a hint a few seconds into the walk.
  useEffect(() => {
    if (demo !== 'hint' || phase !== 'playing') return;
    const id = setTimeout(() => {
      if (hints.current.activate()) showHint();
      hintStore.set(hints.current.snapshot);
    }, 3500);
    return () => clearTimeout(id);
  }, [demo, phase, showHint, hintStore]);

  // Show the result once the picture has fully opened.
  useEffect(() => {
    if (phase !== 'revealing') return;
    const id = setTimeout(() => setPhase('revealed'), motion.reveal);
    return () => clearTimeout(id);
  }, [phase]);

  // --- Actions ---------------------------------------------------------------
  const restart = () => {
    pos.current = { ...level.start };
    vel.current = { x: 0, y: 0 };
    contact.current = { touching: false, lastBumpAt: 0 };
    touch.current.active = false;
    countdown.current = new Countdown(totalTime);
    timedOut.current = false;
    timeSound.reset();
    playerCenter.set(vec(level.start.x, level.start.y));
    trail.reset();
    trail.add(level.start);
    reveal.set(0);
    obstacleOpacity.set(0);
    trailOpacity.set(1);
    timerFraction.set(1);
    secondsLeft.set(totalTime);
    collectedIds.current.clear();
    setCollected([]);
    hints.current = new Hints(freeHintsPerLevel(), difficulty);
    hintStore.set(hints.current.snapshot);
    hintProgress.set(0);
    setStory(null);
    setToast(null);
    setZenNotice(false);
    setPeek(false);
    startSources();
    setPhase('playing');
  };

  /** "Start" on the ready card: sounds and the clock begin now. */
  const begin = () => {
    startSources();
    setPhase('playing');
  };

  /** No video could be shown (or it was closed early): say so instead of doing nothing. */
  const adUnavailable = () => setToast({ key: Date.now(), text: t('level.adUnavailable') });

  /** Mystery time-up: watch a rewarded ad for +15 seconds. */
  const watchAdForTime = async () => {
    setAdLoading(true);
    const rewarded = await ads.showRewarded('extraTime');
    setAdLoading(false);
    if (!rewarded) return adUnavailable();
    countdown.current.addTime(REWARDED_EXTRA_SECONDS);
    timerFraction.set(countdown.current.fraction);
    secondsLeft.set(Math.ceil(countdown.current.remaining));
    target.current?.start();
    chaserSource.current?.start();
    setPhase('playing');
  };

  /** Tension, caught: watch a rewarded ad to shake the chaser off and go on. */
  const watchAdToEscape = async () => {
    setAdLoading(true);
    const rewarded = await ads.showRewarded('extraTime');
    setAdLoading(false);
    if (!rewarded) return adUnavailable();
    resetChaser();
    target.current?.start();
    chaserSource.current?.start();
    setPhase('playing');
  };

  const onHintPress = async () => {
    const { status } = hints.current.snapshot;
    if (status === 'ready') {
      if (hints.current.activate()) showHint();
    } else if (status === 'adRequired') {
      setPhase('paused'); // freeze the clock while the video plays
      const rewarded = await ads.showRewarded('extraHint');
      setPhase('playing');
      if (rewarded && hints.current.activate(true)) showHint();
      else if (!rewarded) adUnavailable();
    }
    hintStore.set(hints.current.snapshot);
  };

  const showReveal = phase === 'revealing' || phase === 'revealed';
  // Where "exit" leads if there's no screen to go back to.
  const journeyHref =
    level.mode === 'test'
      ? ('/' as const)
      : ({ pathname: '/journey/[mode]', params: { mode } } as const);
  // After a win: the next level in this journey, and whether it's open yet.
  const next = nextLevel(level);
  const nextLock = next ? lockReason(progress, next) : null;
  const goNext = async () => {
    if (!next) return;
    // Between levels only, never in play; the service decides whether one is due.
    await ads.maybeShowInterstitial();
    router.replace({ pathname: '/level/[id]', params: { id: next.id, difficulty } });
  };
  const timerRight = width - insets.right - spacing.md;

  // Hidden sounds still waiting: drawn as lights where the ground is lit.
  const uncollectedLights = collectibles.filter((c) => !collected.includes(c.id)).map((c) => c.position);

  return (
    <View style={styles.root}>
      <GestureDetector gesture={pan}>
        <View style={StyleSheet.absoluteFill}>
          <Canvas style={StyleSheet.absoluteFill}>
            {/* World space: everything inside is in world units. */}
            <Group
              transform={[
                { translateX: camera.offsetX },
                { translateY: camera.offsetY },
                { scale: camera.scale },
              ]}
            >
              {/* Where the light has been, the picture and the obstacles stay lit. */}
              <LitGround
                trail={trail}
                source={level.revealImage}
                world={WORLD}
                obstacles={obstacles}
                obstacleColor={palette.playerGlow}
                lights={uncollectedLights}
                lightColor={palette.hint}
              />
              {showReveal && (
                <RevealImage
                  source={level.revealImage}
                  world={WORLD}
                  origin={level.target.position}
                  progress={reveal}
                  burstColor={palette.hint}
                />
              )}
              <ObstacleOverlay
                obstacles={obstacles}
                opacity={obstacleOpacity}
                color={palette.playerGlow}
              />
              <ColorTrail
                trail={trail}
                palette={palette.trail}
                opacity={trailOpacity}
                colorStep={modeDef.trailColorStep}
              />
              {chaserDef && !showReveal && (
                <ChaserGlow
                  center={chaserCenter}
                  proximity={chaserProximity}
                  color={palette.accent}
                  minOpacity={__DEV__ && debug ? 0.7 : visualCues ? 0.3 : 0}
                />
              )}
              {__DEV__ && debug && (
                <DebugOverlay
                  level={{
                    ...level,
                    obstacles,
                    collectibles: collectibles.filter((c) => !collected.includes(c.id)),
                  }}
                  world={WORLD}
                  reachRadius={reachRadius}
                />
              )}
              {visualCues && !showReveal && (
                <WaveRings
                  player={playerCenter}
                  target={level.target.position}
                  waves={waves}
                  color={palette.waves}
                />
              )}
              {phase === 'playing' && uncollectedLights.length > 0 && (
                <SoundNotes positions={uncollectedLights} color={palette.hint} />
              )}
              <CollectBurst at={burstAt} progress={burstProgress} color={palette.hint} />
              {!showReveal && (
                <HintGlow
                  player={playerCenter}
                  aim={hintAim}
                  progress={hintProgress}
                  color={palette.hint}
                />
              )}
              <PlayerDot
                center={playerCenter}
                radius={PLAYER_RADIUS}
                color={palette.playerGlow}
                energy={energy}
                flash={flash}
              />
              {/* On top of the dot: the player ends the level standing on the target. */}
              {showReveal && (
                <FoundStar at={level.target.position} progress={reveal} color={palette.hint} />
              )}
            </Group>

            {/* Screen space */}
            {!showReveal && (
              <TimerLine
                right={timerRight}
                y={insets.top + hudHeight - 6}
                length={Math.min(160, width * 0.38)}
                fraction={timerFraction}
                urgency={urgency}
                color={palette.accent}
              />
            )}
            {scheme === 'joystick' && (
              <Group opacity={joyOpacity}>
                <Circle
                  c={joyOrigin}
                  r={defaultMovementTuning.joystickRange}
                  style="stroke"
                  strokeWidth={1}
                  color="rgba(255,255,255,0.12)"
                />
                <Circle c={joyKnob} r={14} color="rgba(255,255,255,0.10)" />
              </Group>
            )}
          </Canvas>
        </View>
      </GestureDetector>

      {/* Top HUD (above the gesture area, so taps here don't move you). */}
      <View style={[styles.hud, { top: insets.top, left: insets.left + spacing.md }]}>
        <Pill label="✕" accessibilityLabel={t('level.exit')} onPress={() => goBack(journeyHref)} />
      </View>

      {/* Bottom-left: switch control scheme on the fly (+ developer toggles). */}
      {(phase === 'playing' || phase === 'paused') && (
        <View
          style={[
            styles.hud,
            { bottom: insets.bottom + spacing.xs, left: insets.left + spacing.md },
          ]}
        >
          <Pill
            label={
              {
                followFinger: t('settings.controlFollow'),
                joystick: t('settings.controlJoystick'),
                tilt: t('settings.controlTilt'),
              }[scheme]
            }
            accessibilityLabel={t('settings.control')}
            onPress={() => {
              // Drop any touch in progress so the new scheme starts clean.
              touch.current.active = false;
              joyOpacity.set(0);
              updateSettings({ controlScheme: cycle(CONTROL_SCHEMES, scheme) });
            }}
          />
          {__DEV__ && (
            <>
              <Pill label={t('dev.debugView')} active={debug} onPress={() => setDebug((d) => !d)} />
              {level.mode === 'test' && (
                <Pill
                  label={t(`modes.${mode}.name`)}
                  onPress={() => router.setParams({ mode: cycle(TEST_MODES, mode) })}
                />
              )}
              <Pill
                label={t(`difficulty.${difficulty}`)}
                onPress={() => router.setParams({ difficulty: cycle(DIFFICULTIES, difficulty) })}
              />
            </>
          )}
        </View>
      )}

      {!showReveal && (
        <View
          pointerEvents="none"
          style={[styles.timerReadout, { top: insets.top + 2, right: insets.right + spacing.md }]}
        >
          <TimerReadout seconds={secondsLeft} urgency={urgency} urgentColor={palette.accent} />
        </View>
      )}

      {(phase === 'playing' || phase === 'paused') && (
        <View
          style={[
            styles.hintButton,
            { bottom: insets.bottom + spacing.md, right: insets.right + spacing.md },
          ]}
        >
          <HintButton
            hints={hintStore}
            onPress={onHintPress}
            color={palette.accent}
            disabled={phase === 'paused'}
          />
        </View>
      )}

      {toast && (
        <Animated.Text
          key={toast.key}
          entering={FadeIn.duration(motion.fast)}
          exiting={FadeOut.duration(motion.slow)}
          style={[styles.toast, { top: insets.top + hudHeight + spacing.sm, color: palette.accent }]}
          pointerEvents="none"
        >
          {toast.text}
        </Animated.Text>
      )}

      {story && (
        <StoryCaption
          title={t('collect.story')}
          text={t(`stories.${story}`)}
          style={{ top: insets.top + hudHeight + spacing.xl }}
        />
      )}

      {/* Zen: time ran out but the walk goes on. */}
      {zenNotice && (
        <Animated.Text
          entering={FadeIn.duration(motion.slow)}
          exiting={FadeOut.duration(motion.slow)}
          style={[styles.notice, { top: insets.top + hudHeight + spacing.sm }]}
          pointerEvents="none"
        >
          {t('level.timeUpZen')}
        </Animated.Text>
      )}

      {/* Mystery: time ran out → retry or +15 s. */}
      {phase === 'timeUp' && (
        <Animated.View
          entering={FadeIn.duration(motion.normal)}
          style={[styles.card, { bottom: insets.bottom + spacing.lg }]}
        >
          <Text style={styles.cardTitle}>{t('level.timeUp')}</Text>
          <MenuButton
            variant="primary"
            label={adLoading ? t('level.adLoading') : t('level.watchAdTime', { seconds: REWARDED_EXTRA_SECONDS })}
            onPress={watchAdForTime}
            disabled={adLoading}
          />
          <MenuButton label={t('common.retry')} onPress={restart} disabled={adLoading} />
        </Animated.View>
      )}

      {/* Before the level: how the chosen controls work, changeable on the spot. */}
      {phase === 'ready' && (
        <Animated.View
          entering={FadeIn.duration(motion.normal)}
          exiting={FadeOut.duration(motion.fast)}
          style={[styles.card, styles.readyCard, { bottom: insets.bottom + spacing.lg }]}
        >
          <Text style={styles.cardTitle}>{t(`levels.${level.id}` as TranslationKey)}</Text>
          <View style={styles.demo}>
            <ControlDemo scheme={scheme} color={palette.playerGlow} />
          </View>
          <Segmented
            compact
            value={scheme}
            onChange={(controlScheme) => updateSettings({ controlScheme })}
            options={[
              { value: 'followFinger', label: t('settings.controlFollow') },
              { value: 'joystick', label: t('settings.controlJoystick') },
              { value: 'tilt', label: t('settings.controlTilt') },
            ]}
          />
          <Text style={styles.readyHelp}>
            {
              {
                followFinger: t('settings.controlFollowHelp'),
                joystick: t('settings.controlJoystickHelp'),
                tilt: t('settings.controlTiltHelp'),
              }[scheme]
            }
          </Text>
          <MenuButton variant="primary" label={t('ready.start')} onPress={begin} />
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => {
              updateSettings({ showControlIntro: false });
              begin();
            }}
          >
            <Text style={styles.dontShow}>{t('ready.dontShow')}</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Tension: the chaser got you → retry or shake it off. */}
      {phase === 'caught' && (
        <Animated.View
          entering={FadeIn.duration(motion.normal)}
          style={[styles.card, { bottom: insets.bottom + spacing.lg }]}
        >
          <Text style={styles.cardTitle}>{t('level.caught')}</Text>
          <MenuButton
            variant="primary"
            label={adLoading ? t('level.adLoading') : t('level.watchAdEscape')}
            onPress={watchAdToEscape}
            disabled={adLoading}
          />
          <MenuButton label={t('common.retry')} onPress={restart} disabled={adLoading} />
        </Animated.View>
      )}

      {phase === 'revealed' && peek && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('level.showResult')}
          style={StyleSheet.absoluteFill}
          onPress={() => setPeek(false)}
        />
      )}

      {phase === 'revealed' && !peek && (
        <Animated.View
          entering={FadeIn.duration(motion.normal)}
          style={[styles.card, { bottom: insets.bottom + spacing.lg }]}
        >
          <Text style={styles.cardTitle}>{t('level.found')}</Text>
          <Stars count={stars} color={palette.accent} />
          {collectibles.length > 0 && (
            <Text style={styles.collected}>
              {t(
                starLevel
                  ? 'collect.stars'
                  : 'collect.found',
                { found: collected.length, total: collectibles.length },
              )}
            </Text>
          )}
          {level.mode !== 'test' && level.index === JOURNEY_LENGTH && (
            <Text style={styles.journeyEnd}>{t(`journeyEnd.${level.mode}`)}</Text>
          )}
          {next && nextLock?.kind === 'stars' && (
            <Text style={styles.collected}>
              {t('level.nextNeedsStars', { stars: nextLock.required })}
            </Text>
          )}
          {next && !nextLock ? (
            <>
              <MenuButton variant="primary" label={t('level.nextLevel')} onPress={goNext} />
              <MenuButton label={t('level.playAgain')} onPress={restart} />
            </>
          ) : (
            <MenuButton variant="primary" label={t('level.playAgain')} onPress={restart} />
          )}
          <MenuButton
            label={level.mode === 'test' ? t('level.exit') : t('level.backToJourney')}
            onPress={() => goBack(journeyHref)}
          />
          <Pressable accessibilityRole="button" hitSlop={10} onPress={() => setPeek(true)}>
            <Text style={styles.dontShow}>{t('level.viewPicture')}</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

/** Next item in a list, wrapping around (dev toggles). */
function cycle<T>(list: readonly T[], current: T): T {
  return list[(list.indexOf(current) + 1) % list.length]!;
}

/**
 * Placeholder success flourish: the target strike as a quick rising
 * arpeggio, until the real "level complete" sound exists.
 */
function playSuccessChime() {
  [1, 1.26, 1.5].forEach((rate, i) => {
    setTimeout(
      () => audioEngine.playOneShot('placeholderPulse', { playbackRate: rate, volume: 0.6 }),
      i * 110,
    );
  });
}

/** Small rounded HUD button. */
function Pill({
  label,
  onPress,
  active = false,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={() => {
        haptics.uiTap();
        onPress();
      }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.pill,
        active && styles.pillActive,
        pressed && styles.pillPressed,
      ]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  centered: { alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.lg },
  message: { ...typography.body, color: colors.textSecondary },
  hud: {
    position: 'absolute',
    flexDirection: 'row',
    gap: spacing.sm,
    height: 48,
    alignItems: 'center',
  },
  pill: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: colors.surfaceRaised, borderColor: colors.textMuted },
  pillPressed: { opacity: 0.6 },
  pillText: { ...typography.caption, color: colors.textSecondary },
  pillTextActive: { color: colors.textPrimary },
  timerReadout: { position: 'absolute', alignItems: 'flex-end' },
  hintButton: { position: 'absolute' },
  toast: {
    ...typography.subtitle,
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    textAlign: 'center',
  },
  collected: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  journeyEnd: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  notice: {
    ...typography.body,
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  card: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    // Translucent card so text stays readable over any picture.
    backgroundColor: 'rgba(5, 6, 10, 0.78)',
  },
  readyCard: { alignItems: 'stretch' },
  demo: { alignItems: 'center' },
  readyHelp: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    minHeight: 54,
  },
  dontShow: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  cardTitle: { ...typography.title, color: colors.textPrimary, textAlign: 'center' },
});
