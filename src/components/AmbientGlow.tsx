import { BlurMask, Canvas, Circle, Group, RadialGradient, vec } from '@shopify/react-native-skia';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Easing, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, motion } from '@/theme';

interface AmbientGlowProps {
  /** Canvas size in points (square). */
  size: number;
  color?: string;
  /**
   * Called at the start of every half-breath with the direction and its
   * length in seconds. The menu uses it to swell a sound in step with the
   * light: both are started by the same timer, so they can never drift.
   */
  onBreath?: (direction: 'in' | 'out', seconds: number) => void;
}

/**
 * A softly "breathing" point of light, drawn with Skia: the game's visual
 * signature on the main menu. Each half-breath is one eased animation on
 * the UI thread, started from a JS timer.
 */
export function AmbientGlow({ size, color = colors.glow, onBreath }: AmbientGlowProps) {
  const center = size / 2;
  const breath = useSharedValue(0);
  // Always call the latest callback without restarting the timer.
  const onBreathRef = useRef(onBreath);
  useEffect(() => {
    onBreathRef.current = onBreath;
  }, [onBreath]);

  useEffect(() => {
    const half = motion.breathe / 2;
    let growing = false;
    const step = () => {
      growing = !growing;
      breath.set(
        withTiming(growing ? 1 : 0, { duration: half, easing: Easing.inOut(Easing.sin) }),
      );
      onBreathRef.current?.(growing ? 'in' : 'out', half / 1000);
    };
    step();
    const id = setInterval(step, half);
    return () => clearInterval(id);
  }, [breath]);

  // Outer halo grows and fades; inner core stays steady and bright.
  const haloRadius = useDerivedValue(() => size * (0.28 + 0.06 * breath.get()));
  const haloOpacity = useDerivedValue(() => 0.35 + 0.25 * breath.get());
  const coreRadius = useDerivedValue(() => size * (0.035 + 0.006 * breath.get()));

  return (
    <Canvas style={[styles.canvas, { width: size, height: size }]} pointerEvents="none">
      {/* Wide, very soft halo */}
      <Group opacity={haloOpacity}>
        <Circle cx={center} cy={center} r={haloRadius}>
          <RadialGradient
            c={vec(center, center)}
            r={size * 0.34}
            colors={[`${color}AA`, `${color}22`, `${color}00`]}
          />
        </Circle>
      </Group>
      {/* Bright core with a gentle blur so it reads as light, not a disc */}
      <Circle cx={center} cy={center} r={coreRadius} color={color}>
        <BlurMask blur={6} style="solid" />
      </Circle>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: { backgroundColor: 'transparent' },
});
