/**
 * Background service worker for Applymate Chrome Extension
 * Handles extension lifecycle and communication
 */

// Only the popup and this service worker can use local storage. Content scripts
// run alongside every visited site, so they must not be able to read the token.
chrome.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });

// The web app origins allowed to provide a session, and the API each one uses
const API_URLS = new Map([
  ['https://applymate-henna.vercel.app', 'https://job-tracker-nghc.onrender.com'],
  ['http://localhost:5173', 'http://localhost:5001']
]);

// Saves the session sent by authSync.js. The origin comes from Chrome, not the
// message, so a compromised page on another site can't replace the token.
async function syncSession(origin, token) {
  const apiUrl = API_URLS.get(origin);
  if (!apiUrl) return;

  if (typeof token === 'string' && token) {
    await chrome.storage.local.set({ authToken: token, apiUrl });
    return;
  }

  // Being signed out here shouldn't end a session from the other environment
  const { apiUrl: storedApiUrl } = await chrome.storage.local.get('apiUrl');
  if (storedApiUrl === apiUrl) {
    await chrome.storage.local.remove('authToken');
  }
}

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  // Older versions kept these in sync storage, which copies them to every
  // browser on the Chrome profile. They now live in local storage.
  chrome.storage.sync.remove(['apiUrl', 'authToken']);
  // Older versions also saved data from every visited page here
  chrome.storage.local.remove(['extractedJobData', 'isJobPosting', 'pageUrl']);

  if (details.reason === 'install') {
    console.log('Applymate Extension installed!');
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup automatically due to manifest configuration
  console.log('Extension icon clicked on tab:', tab.url);
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'syncSession') {
    syncSession(sender.origin, request.token);
  } else if (request.action === 'updateBadge') {
    // Update extension badge based on job detection
    if (request.isJobPosting) {
      chrome.action.setBadgeText({ text: 'JOB' });
      chrome.action.setBadgeBackgroundColor({ color: '#3b82f6' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }
});

// Handle tab updates to detect job pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if it's a job posting page
    const jobIndicators = ['job', 'career', 'position', 'opening', 'opportunity'];
    const isJobPage = jobIndicators.some(indicator => 
      tab.url.toLowerCase().includes(indicator)
    );
    
    if (isJobPage) {
      chrome.action.setBadgeText({ text: 'JOB' });
      chrome.action.setBadgeBackgroundColor({ color: '#3b82f6' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }
});
