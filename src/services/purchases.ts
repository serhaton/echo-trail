import { REMOVE_ADS_PRODUCT_ID } from '@/config/monetization';
import { ValueStore } from '@/game/valueStore';

import { readJSON, StorageKeys, writeJSON } from './storage';

/**
 * In-app purchases through StoreKit (expo-iap): one non-consumable,
 * "remove ads". Apple remembers who owns it, so there is no server and no
 * account; "restore purchases" simply asks Apple again.
 *
 * Ownership is cached on the device so the game knows it immediately at
 * launch (and offline); the store's answer replaces the cache when it
 * arrives.
 *
 * The native module is loaded defensively: a development build made before
 * expo-iap was added keeps working, purchases are just reported as
 * unavailable.
 */

export type PurchaseResult = 'purchased' | 'cancelled' | 'failed' | 'unavailable';

type Iap = typeof import('expo-iap');

let iap: Iap | null | undefined;
function loadIap(): Iap | null {
  if (iap === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      iap = require('expo-iap') as Iap;
    } catch {
      iap = null;
    }
  }
  return iap;
}

class StoreKitPurchases {
  /** True if the player owns "remove ads". Observable (useStoreValue). */
  readonly removeAds = new ValueStore<boolean>(false);
  /** Localised price such as "₺49,99"; null until the store answers. */
  readonly price = new ValueStore<string | null>(null);

  private connected = false;
  private initPromise: Promise<void> | null = null;
  private pending: ((result: PurchaseResult) => void) | null = null;

  hasRemoveAds(): boolean {
    return this.removeAds.get();
  }

  init(): Promise<void> {
    this.initPromise ??= this.doInit();
    return this.initPromise;
  }

  private async doInit() {
    this.removeAds.set((await readJSON<boolean>(StorageKeys.removeAds)) === true);
    const lib = loadIap();
    if (!lib) return;
    try {
      await lib.initConnection();
      this.connected = true;

      lib.purchaseUpdatedListener((purchase) => {
        if (purchase.productId !== REMOVE_ADS_PRODUCT_ID) return;
        void lib.finishTransaction({ purchase, isConsumable: false }).catch(() => {});
        this.setOwned(true);
        this.settle('purchased');
      });
      lib.purchaseErrorListener((error) => {
        this.settle(lib.isUserCancelledError(error) ? 'cancelled' : 'failed');
      });

      await this.refreshOwnership(lib);
      const products = await lib.fetchProducts({ skus: [REMOVE_ADS_PRODUCT_ID], type: 'in-app' });
      const product = products?.find((p) => p.id === REMOVE_ADS_PRODUCT_ID);
      if (product) this.price.set(product.displayPrice);
    } catch (error) {
      console.warn('[purchases] store unavailable', error);
    }
  }

  /** Ask the store what the player owns; the answer replaces the cache. */
  private async refreshOwnership(lib: Iap): Promise<boolean> {
    const owned = (await lib.getAvailablePurchases()).some(
      (p) => p.productId === REMOVE_ADS_PRODUCT_ID,
    );
    this.setOwned(owned);
    return owned;
  }

  private setOwned(owned: boolean) {
    this.removeAds.set(owned);
    void writeJSON(StorageKeys.removeAds, owned);
  }

  private settle(result: PurchaseResult) {
    this.pending?.(result);
    this.pending = null;
  }

  /** Start the purchase sheet for "remove ads". */
  async buyRemoveAds(): Promise<PurchaseResult> {
    await this.init();
    const lib = loadIap();
    if (!lib || !this.connected) return 'unavailable';
    const outcome = new Promise<PurchaseResult>((resolve) => {
      this.pending = resolve;
    });
    try {
      // The result arrives through the listeners registered in init().
      await lib.requestPurchase({ request: { apple: { sku: REMOVE_ADS_PRODUCT_ID } }, type: 'in-app' });
    } catch (error) {
      this.settle(lib.isUserCancelledError(error) ? 'cancelled' : 'failed');
    }
    return outcome;
  }

  /** Restore earlier purchases; resolves true if "remove ads" came back. */
  async restore(): Promise<boolean> {
    await this.init();
    const lib = loadIap();
    if (!lib || !this.connected) return false;
    try {
      await lib.restorePurchases();
      return await this.refreshOwnership(lib);
    } catch (error) {
      console.warn('[purchases] restore failed', error);
      return false;
    }
  }

  /** Developer helper: pretend the purchase was made (or undone). */
  devSetRemoveAds(owned: boolean) {
    this.setOwned(owned);
  }
}

export const purchases = new StoreKitPurchases();

/** Free hints per level: buyers of "remove ads" get one extra. */
export function freeHintsPerLevel(): number {
  return purchases.hasRemoveAds() ? 2 : 1;
}
