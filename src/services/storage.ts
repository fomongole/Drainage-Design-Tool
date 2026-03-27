/**
 * Storage service — src/services/storage.ts
 *
 * Session persistence is handled entirely by the Zustand `persist` middleware
 * in `src/store/calculationStore.ts` (localStorage key: 'drainage_sessions').
 *
 * The store's saveSession / loadSession / deleteSession actions satisfy
 * the full Phase 11A requirement. This file provides lightweight utilities
 * for consumers that need to inspect the storage environment directly.
 */

export const STORAGE_KEY = 'drainage_sessions' as const

/**
 * Returns true if localStorage is available and writable in this environment.
 * Use this guard before any direct localStorage access outside the Zustand store.
 */
export function isStorageAvailable(): boolean {
  try {
    const probe = '__drainage_storage_probe__'
    localStorage.setItem(probe, probe)
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

/**
 * Returns the raw byte-length of the persisted sessions string, or 0 if absent.
 * Useful for displaying storage usage in a future settings panel.
 */
export function getStorageUsageBytes(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Blob([raw]).size : 0
  } catch {
    return 0
  }
}