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
  interstitial: 'ca-app-pub-4475107857161348/5197423028',
  rewarded: 'ca-app-pub-4475107857161348/7161066372',
};

/**
 * Interstitials (between levels only): after each ad, the next one comes
 * after a random number of completed levels in this range, so with 1–2 an
 * ad follows either the very next level or the one after it.
 */
export const INTERSTITIAL_GAP = { min: 1, max: 2 };

/** App Store Connect product id of the one-time "remove ads" purchase. */
export const REMOVE_ADS_PRODUCT_ID = 'com.serhatonal.echotrail.removeads';
