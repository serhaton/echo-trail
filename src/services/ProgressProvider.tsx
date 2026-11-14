import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { demoProgress, SCREENSHOT_MODE } from '@/config/screenshotMode';
import { allLevels } from '@/data/levels';
import type { StarCount } from '@/game/countdown';

import {
  emptyProgress,
  loadProgress,
  saveProgress,
  withCompletion,
  type ProgressData,
} from './progress';

interface ProgressContextValue {
  progress: ProgressData;
  /** Save a finished level (keeps the best stars, merges found collectibles). */
  recordCompletion: (levelId: string, stars: StarCount, collectedIds: readonly string[]) => void;
  /** Developer helper: wipe all progress. */
  resetProgress: () => void;
  /** Developer helper: mark every level complete with everything found. */
  unlockAll: () => void;
  ready: boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressData>(emptyProgress);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadProgress().then((p) => {
      setProgress(SCREENSHOT_MODE ? demoProgress() : p);
      setReady(true);
    });
  }, []);

  const recordCompletion = useCallback(
    (levelId: string, stars: StarCount, collectedIds: readonly string[]) => {
      setProgress((prev) => {
        const next = withCompletion(prev, levelId, stars, collectedIds);
        void saveProgress(next);
        return next;
      });
    },
    [],
  );

  const resetProgress = useCallback(() => {
    setProgress(emptyProgress);
    void saveProgress(emptyProgress);
  }, []);

  const unlockAll = useCallback(() => {
    const next: ProgressData = {
      ...emptyProgress,
      levels: Object.fromEntries(
        allLevels().map((l) => [
          l.id,
          { stars: 3 as const, collected: (l.collectibles ?? []).map((c) => c.id) },
        ]),
      ),
    };
    setProgress(next);
    void saveProgress(next);
  }, []);

  const value = useMemo(
    () => ({ progress, recordCompletion, resetProgress, unlockAll, ready }),
    [progress, recordCompletion, resetProgress, unlockAll, ready],
  );
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}
