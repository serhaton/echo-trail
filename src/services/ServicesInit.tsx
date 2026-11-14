import { useEffect } from 'react';

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
    const timer = setTimeout(() => {
      void purchases.init().then(() => ads.init());
    }, 1200);
    return () => clearTimeout(timer);
  }, []);
  return null;
}
