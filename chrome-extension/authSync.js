/**
 * Content script that runs only on the Applymate web app (see manifest.json).
 * Copies the app's login session into the extension, so users never handle a token.
 */

// The API each web app origin talks to, so the token and API URL always match
const API_URLS = {
  'https://applymate-henna.vercel.app': 'https://job-tracker-nghc.onrender.com',
  'http://localhost:5173': 'http://localhost:5001'
};

function syncSession() {
  // After the extension reloads, this script keeps running in open tabs but can
  // no longer reach chrome.storage
  if (!chrome.runtime?.id) return;

  const apiUrl = API_URLS[window.location.origin];
  const authToken = localStorage.getItem('token');

  if (authToken) {
    chrome.storage.local.set({ authToken, apiUrl });
    return;
  }

  // Being signed out here shouldn't end a session from the other environment
  chrome.storage.local.get('apiUrl', ({ apiUrl: storedApiUrl }) => {
    if (storedApiUrl === apiUrl) {
      chrome.storage.local.remove('authToken');
    }
  });
}

syncSession();

// Login and logout in this tab don't reload the page, so the app announces them
window.addEventListener('applymate:auth-changed', syncSession);

// Login and logout in another tab. A null key means localStorage was cleared.
window.addEventListener('storage', (event) => {
  if (event.key === 'token' || event.key === null) {
    syncSession();
  }
});
