/**
 * Tells the Chrome extension to re-read the session from localStorage.
 * Call this after changing the stored token. The event carries no data, so the
 * token isn't exposed to page scripts through it.
 */
export const notifyAuthChanged = () => {
  window.dispatchEvent(new Event('applymate:auth-changed'));
};
