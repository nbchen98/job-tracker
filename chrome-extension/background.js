/**
 * Background service worker for Job Tracker Chrome Extension
 * Handles extension lifecycle and communication
 */

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default configuration
    chrome.storage.sync.set({
      apiUrl: 'http://localhost:5432',
      authToken: ''
    });
    
    // Open options page or show welcome message
    console.log('Job Tracker Extension installed!');
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup automatically due to manifest configuration
  console.log('Extension icon clicked on tab:', tab.url);
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBadge') {
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
