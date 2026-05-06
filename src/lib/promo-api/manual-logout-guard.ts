/**
 * While true, the promo API 401 interceptor skips the "Session expired" toast
 * and forced login redirect — used when the user explicitly logs out and other
 * requests may still complete with 401 after local auth is cleared.
 */
let manualLogoutActive = false;

export function beginManualLogout(): void {
  manualLogoutActive = true;
}

/** Call after local auth is cleared; keeps suppression briefly for trailing requests. */
export function scheduleEndManualLogout(): void {
  window.setTimeout(() => {
    manualLogoutActive = false;
  }, 3000);
}

export function isManualLogoutActive(): boolean {
  return manualLogoutActive;
}
