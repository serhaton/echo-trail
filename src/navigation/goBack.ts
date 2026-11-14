import { router, type Href } from 'expo-router';

/**
 * Go back if there is a screen to go back to; otherwise go to `fallback`
 * (e.g. when the app was opened straight into a level from a link).
 * `router.back()` alone silently does nothing in that case.
 */
export function goBack(fallback: Href = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
