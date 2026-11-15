import { useEffect } from 'react';

import { SCREENSHOT_MODE } from '@/config/screenshotMode';

import { ads } from './ads';
import { purchases } from './purchases';

/**
 * Starts purchases and ads once the app is on screen. Purchases first, so
 * we already know about "remove ads" before any ad is prepared, but ads
 * never wait long for the store: if it is slow or silent (it can be, in
 * TestFlight and during review), ads start anyway. The saved "remove ads"
 * flag is read from the device before the store is contacted, so nothing
 * is lost. The ATT prompt (inside ads.init) appears a moment after the
 * menu, not on top of the splash screen.
 */
const STORE_WAIT_MS = 3000;

export function ServicesInit() {
  useEffect(() => {
    if (SCREENSHOT_MODE) return;
    const timer = setTimeout(() => {
      const store = purchases.init().catch(() => {});
      const waited = new Promise<void>((resolve) => setTimeout(resolve, STORE_WAIT_MS));
      void Promise.race([store, waited]).then(() => ads.init());
    }, 1200);
    return () => clearTimeout(timer);
  }, []);
  return null;
}
