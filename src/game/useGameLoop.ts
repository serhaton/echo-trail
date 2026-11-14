import { useEffect, useRef } from 'react';

/**
 * Runs `tick(dt)` every display frame while `running` is true.
 *
 * Runs on the JS thread, where the audio engine also lives, so movement,
 * collision and audio updates happen in the same frame with no thread hop.
 * `dt` is clamped so a hitch (e.g. app returning from background) can't
 * teleport the player through a wall.
 */
export function useGameLoop(tick: (dt: number) => void, running: boolean) {
  // Always call the latest tick without restarting the loop.
  const tickRef = useRef(tick);
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let last: number | null = null;
    const loop = (now: number) => {
      const dt = last == null ? 0 : Math.min((now - last) / 1000, 0.05);
      last = now;
      if (dt > 0) tickRef.current(dt);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running]);
}
