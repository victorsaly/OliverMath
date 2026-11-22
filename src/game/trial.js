/**
 * The free version: a few sums every day.
 *
 * The app is free to download and free to keep using a little each day. A
 * grown-up can unlock the full game with one purchase. This module only
 * counts; what happens at the limit is the game screen's business.
 *
 * Everything is kept on the device. There is no account, so the count can be
 * reset by clearing the app's data. That is accepted: the limit is there to
 * invite a purchase, not to police one.
 */
export const FREE_SUMS_PER_DAY = 10;

const DAY_KEY = 'trialDay';
const USED_KEY = 'trialUsed';
const UNLOCKED_KEY = 'fullGame';

function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

// Some browsers refuse to store anything (private mode, blocked site data).
// The count is then kept in memory and lasts for the visit.
let storageWorks = true;

function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    storageWorks = false;
  }
}

const memory = { day: null, used: 0 };

/** Sums marked so far today. */
export function sumsUsedToday() {
  if (!storageWorks) return memory.day === today() ? memory.used : 0;
  if (read(DAY_KEY) !== today()) return 0;
  return Math.max(parseInt(read(USED_KEY), 10) || 0, 0);
}

/** How many free sums are left today. */
export function sumsLeftToday() {
  return Math.max(FREE_SUMS_PER_DAY - sumsUsedToday(), 0);
}

/** Count one sum that was marked right or wrong. Unheard answers do not count. */
export function countSum() {
  const used = sumsUsedToday() + 1;
  memory.day = today();
  memory.used = used;
  write(DAY_KEY, memory.day);
  write(USED_KEY, String(used));
  return Math.max(FREE_SUMS_PER_DAY - used, 0);
}

/** The last known answer to "is the full game unlocked?", for before the store replies. */
export function wasUnlocked() {
  return read(UNLOCKED_KEY) === '1';
}

export function rememberUnlocked(unlocked) {
  write(UNLOCKED_KEY, unlocked ? '1' : '0');
}
