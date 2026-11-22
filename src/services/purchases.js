/**
 * The one purchase: unlocking the full game.
 *
 * In the iOS and Android apps this goes through the local DevicePurchases
 * plugin (native/device-speech), which talks to the App Store or Google Play
 * directly. A browser cannot take the payment without accounts, so there the
 * full game is "in the app" and these functions report that it is unavailable.
 */
import { Capacitor, registerPlugin } from '@capacitor/core';

const DevicePurchases = registerPlugin('DevicePurchases');

/** The product's identifier in App Store Connect and the Play Console. */
export const FULL_GAME = 'com.victorsaly.olivermath.fullgame';

/** True where the full game can be bought: inside the store apps. */
export const canPurchase = Capacitor.isNativePlatform();

/**
 * The price, as the store formats it for the family's country.
 * @returns {Promise<{available: boolean, price?: string}>}
 */
export async function fullGameProduct() {
  if (!canPurchase) return { available: false };
  try {
    return await DevicePurchases.product({ productId: FULL_GAME });
  } catch (error) {
    console.warn('Could not reach the store:', error);
    return { available: false };
  }
}

/** @returns {Promise<boolean|null>} null when the store could not be asked */
export async function ownsFullGame() {
  if (!canPurchase) return null;
  try {
    const { unlocked } = await DevicePurchases.status({ productId: FULL_GAME });
    return !!unlocked;
  } catch (error) {
    console.warn('Could not check the purchase:', error);
    return null;
  }
}

/**
 * Start the purchase.
 * @returns {Promise<{unlocked: boolean, cancelled: boolean, pending: boolean, failed?: boolean}>}
 */
export async function buyFullGame() {
  try {
    return await DevicePurchases.purchase({ productId: FULL_GAME });
  } catch (error) {
    console.warn('Purchase failed:', error);
    return { unlocked: false, cancelled: false, pending: false, failed: true };
  }
}

/** Ask the store again what this family owns. */
export async function restoreFullGame() {
  try {
    const { unlocked } = await DevicePurchases.restore({ productId: FULL_GAME });
    return !!unlocked;
  } catch (error) {
    console.warn('Restore failed:', error);
    return false;
  }
}

/**
 * Called when a purchase completes outside the app: approved later by a
 * parent, or made on another device.
 * @param {(unlocked: boolean) => void} callback
 */
export function onFullGameChange(callback) {
  if (!canPurchase) return;
  DevicePurchases.addListener('purchaseUpdated', (event) => {
    if (!event.productId || event.productId === FULL_GAME) callback(!!event.unlocked);
  }).catch(() => {});
}
