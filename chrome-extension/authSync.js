/**
 * Content script that runs only on the Applymate web app (see manifest.json).
 * Sends the app's login session to the background script, which stores it, so
 * users never handle a token.
 */

function sendSession() {
  // After the extension reloads, this script keeps running in open tabs but can
  // no longer reach the extension
  if (!chrome.runtime?.id) return;

  chrome.runtime.sendMessage({
    action: 'syncSession',
    token: localStorage.getItem('token')
  });
}

sendSession();

// Login and logout in this tab don't reload the page, so the app announces them
window.addEventListener('applymate:auth-changed', sendSession);

// Login and logout in another tab. A null key means localStorage was cleared.
window.addEventListener('storage', (event) => {
  if (event.key === 'token' || event.key === null) {
    sendSession();
  }
});
