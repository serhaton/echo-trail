import { useEffect } from 'react';

import { SCREENSHOT_MODE } from '@/config/screenshotMode';

import { ads } from './ads';
import { purchases } from './purchases';

/**
 * Starts purchases and ads once the app is on screen. Purchases first, so
 * we already know about "remove ads" before any ad is prepared. The ATT
 * prompt (inside ads.init) appears a moment after the menu, not on top of
 * the splash screen.
 */
export function ServicesInit() {
  useEffect(() => {
    if (SCREENSHOT_MODE) return;
    const timer = setTimeout(() => {
      void purchases.init().then(() => ads.init());
    }, 1200);
    return () => clearTimeout(timer);
  }, []);
  return null;
}
