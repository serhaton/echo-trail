import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';
import mobileAds, {
  AdEventType,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

import { AD_UNIT_IDS } from '@/config/monetization';

import type { AdsProvider, RewardedPlacement } from './ads';

/** How long to wait for an ad that isn't loaded yet before giving up (ms). */
const LOAD_TIMEOUT_MS = 8000;

/** Test units in development or while real ids are missing. */
const unit = (real: string, test: string) => (__DEV__ || !real ? test : real);
const INTERSTITIAL_UNIT = unit(AD_UNIT_IDS.interstitial, TestIds.INTERSTITIAL);
const REWARDED_UNIT = unit(AD_UNIT_IDS.rewarded, TestIds.REWARDED);

/**
 * AdMob provider.
 *
 * Tracking: iOS App Tracking Transparency is requested once. If the player
 * declines, every request is marked non-personalized; ads still show.
 *
 * One interstitial and one rewarded ad are kept preloaded so they appear
 * without a wait; after each show the next one starts loading.
 */
export class AdmobAdsProvider implements AdsProvider {
  private nonPersonalized = true;
  private interstitial: InterstitialAd | null = null;
  private rewarded: RewardedAd | null = null;

  async init() {
    let { status } = await getTrackingPermissionsAsync();
    if (status === 'undetermined') ({ status } = await requestTrackingPermissionsAsync());
    this.nonPersonalized = status !== 'granted';

    await mobileAds().initialize();
    this.loadInterstitial();
    this.loadRewarded();
  }

  private get request() {
    return { requestNonPersonalizedAdsOnly: this.nonPersonalized };
  }

  private loadInterstitial() {
    const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_UNIT, this.request);
    ad.addAdEventListener(AdEventType.ERROR, (error) => console.warn('[ads] interstitial', error));
    ad.load();
    this.interstitial = ad;
  }

  private loadRewarded() {
    const ad = RewardedAd.createForAdRequest(REWARDED_UNIT, this.request);
    ad.addAdEventListener(AdEventType.ERROR, (error) => console.warn('[ads] rewarded', error));
    ad.load();
    this.rewarded = ad;
  }

  showInterstitial(): Promise<void> {
    const ad = this.interstitial;
    if (!ad?.loaded) {
      // Never make the player wait for an ad between levels.
      if (!ad) this.loadInterstitial();
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const done = () => {
        this.loadInterstitial();
        resolve();
      };
      ad.addAdEventListener(AdEventType.CLOSED, done);
      ad.addAdEventListener(AdEventType.ERROR, done);
      ad.show().catch(done);
    });
  }

  async showRewarded(placement: RewardedPlacement): Promise<boolean> {
    const ad = this.rewarded ?? (this.loadRewarded(), this.rewarded!);
    if (!ad.loaded && !(await waitUntilLoaded(ad))) {
      console.warn(`[ads] no rewarded ad available for "${placement}"`);
      this.loadRewarded();
      return false;
    }
    return new Promise((resolve) => {
      let earned = false;
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        this.loadRewarded();
        resolve(earned);
      };
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      });
      ad.addAdEventListener(AdEventType.CLOSED, finish);
      ad.addAdEventListener(AdEventType.ERROR, finish);
      ad.show().catch(finish);
    });
  }
}

function waitUntilLoaded(ad: RewardedAd): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), LOAD_TIMEOUT_MS);
    ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      clearTimeout(timer);
      resolve(true);
    });
    ad.addAdEventListener(AdEventType.ERROR, () => {
      clearTimeout(timer);
      resolve(false);
    });
  });
}
