import { audioEngine } from '@/audio';
import { ADS_PROVIDER, INTERSTITIAL_EVERY } from '@/config/monetization';

import { purchases } from './purchases';

/**
 * Advertising: the game only talks to `ads` below.
 *
 * Rules (from the design doc):
 *   - never show an ad during gameplay;
 *   - interstitials only between levels, every INTERSTITIAL_EVERY levels,
 *     and never for players who bought "remove ads";
 *   - rewarded videos are always the player's choice (extra time, extra hint)
 *     and stay available after "remove ads".
 *
 * Providers: AdMob (./adsAdmob.ts) or a mock. The game audio is paused
 * around every full-screen ad so the two never play over each other.
 */

export type RewardedPlacement = 'extraTime' | 'extraHint';

/** What a provider must implement. */
export interface AdsProvider {
  init(): Promise<void>;
  /** Resolves true only if the video was watched to the end. */
  showRewarded(placement: RewardedPlacement): Promise<boolean>;
  /** Resolves when the interstitial is closed (or immediately if none is ready). */
  showInterstitial(): Promise<void>;
}

/** Development mock: no UI, short delay, always rewards. */
class MockAdsProvider implements AdsProvider {
  async init() {}

  async showRewarded(placement: RewardedPlacement) {
    console.log(`[ads:mock] rewarded "${placement}" → granted`);
    await new Promise((r) => setTimeout(r, 600));
    return true;
  }

  async showInterstitial() {
    console.log('[ads:mock] interstitial');
  }
}

/** Used when the ad SDK can't start in a release build: no ads, no free rewards. */
class NoAdsProvider implements AdsProvider {
  async init() {}

  async showRewarded() {
    return false;
  }

  async showInterstitial() {}
}

let provider: AdsProvider = new MockAdsProvider();
let initPromise: Promise<void> | null = null;

/** Run `show` with the game audio paused. */
async function withAudioPaused<T>(show: () => Promise<T>): Promise<T> {
  audioEngine.setPaused(true);
  try {
    return await show();
  } finally {
    audioEngine.setPaused(false);
  }
}

export const ads = {
  /** Ask for tracking permission (ATT), start the SDK, preload ads. Safe to call twice. */
  init(): Promise<void> {
    initPromise ??= (async () => {
      if (ADS_PROVIDER === 'admob') {
        try {
          // Loaded lazily so the mock never touches the native SDK.
          const { AdmobAdsProvider } = await import('./adsAdmob');
          const admob = new AdmobAdsProvider();
          await admob.init();
          provider = admob;
        } catch (error) {
          // In development fall back to the mock so work can continue; in a
          // release build never hand out rewards without an ad.
          console.warn('[ads] AdMob unavailable', error);
          if (!__DEV__) provider = new NoAdsProvider();
        }
      }
    })();
    return initPromise;
  },

  async showRewarded(placement: RewardedPlacement): Promise<boolean> {
    await this.init();
    return withAudioPaused(() => provider.showRewarded(placement));
  },

  /**
   * Call between levels with the total number of completed levels.
   * Shows an interstitial on every INTERSTITIAL_EVERY-th one, unless the
   * player owns "remove ads".
   */
  async maybeShowInterstitial(completions: number): Promise<void> {
    if (purchases.hasRemoveAds()) return;
    if (completions === 0 || completions % INTERSTITIAL_EVERY !== 0) return;
    await this.init();
    await withAudioPaused(() => provider.showInterstitial());
  },
};

/** Seconds granted by the "watch an ad" option when time runs out. */
export const REWARDED_EXTRA_SECONDS = 15;
