/**
 * Monetisation settings in one place.
 *
 * Before release, replace the placeholders:
 *   1. app.json → react-native-google-mobile-ads → iosAppId (AdMob app id)
 *   2. AD_UNIT_IDS below (AdMob ad unit ids)
 *   3. REMOVE_ADS_PRODUCT_ID must match the non-consumable product created
 *      in App Store Connect.
 * Development builds always use Google's public TEST ad units, so real ads
 * are never requested (and never clicked) while developing.
 */

/** 'mock' skips the ad SDK entirely (instant fake rewards). */
export const ADS_PROVIDER: 'admob' | 'mock' = 'admob';

/** Real AdMob ad unit ids (release builds only). Empty = use test units. */
export const AD_UNIT_IDS = {
  interstitial: '',
  rewarded: '',
};

/** Show an interstitial after every Nth completed level (between levels only). */
export const INTERSTITIAL_EVERY = 1;

/** App Store Connect product id of the one-time "remove ads" purchase. */
export const REMOVE_ADS_PRODUCT_ID = 'com.serhatonal.echotrail.removeads';
