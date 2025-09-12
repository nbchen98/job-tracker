/**
 * Popup script for Job Tracker Chrome Extension
 * Handles form submission and communication with content script
 */

// DOM elements
const loadingDiv = document.getElementById('loading');
const notJobPageDiv = document.getElementById('not-job-page');
const jobFormDiv = document.getElementById('job-form');
const statusDiv = document.getElementById('status');
const addJobForm = document.getElementById('addJobForm');
const cancelBtn = document.getElementById('cancelBtn');
const submitBtn = document.getElementById('submitBtn');
const addManuallyBtn = document.getElementById('add-manually');

// Configuration elements
const apiUrlInput = document.getElementById('apiUrl');
const authTokenInput = document.getElementById('authToken');
const saveConfigBtn = document.getElementById('saveConfig');

// Load configuration
async function loadConfig() {
  const config = await chrome.storage.sync.get(['apiUrl', 'authToken']);
  if (config.apiUrl) apiUrlInput.value = config.apiUrl;
  if (config.authToken) authTokenInput.value = config.authToken;
}

// Save configuration
async function saveConfig() {
  const config = {
    apiUrl: apiUrlInput.value,
    authToken: authTokenInput.value
  };
  await chrome.storage.sync.set(config);
  showStatus('Configuration saved!', 'success');
}

// Show status message
function showStatus(message, type = 'info') {
  statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
  setTimeout(() => {
    statusDiv.innerHTML = '';
  }, 3000);
}

// Load job data from current page
async function loadJobData() {
  try {
    // Get data from content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractJobData' });
    
    if (response && response.success) {
      const { data, isJobPosting } = response;
      
      if (isJobPosting) {
        // Pre-fill form with extracted data
        document.getElementById('title').value = data.title || '';
        document.getElementById('company').value = data.company || '';
        document.getElementById('link').value = data.link || '';
        document.getElementById('date_applied').value = data.date_applied || '';
        document.getElementById('notes').value = data.notes || '';
        
        showJobForm();
      } else {
        showNotJobPage();
      }
    } else {
      // Fallback: try to get data from storage
      const storedData = await chrome.storage.local.get(['extractedJobData', 'isJobPosting']);
      if (storedData.extractedJobData) {
        const data = storedData.extractedJobData;
        document.getElementById('title').value = data.title || '';
        document.getElementById('company').value = data.company || '';
        document.getElementById('link').value = data.link || '';
        document.getElementById('date_applied').value = data.date_applied || '';
        document.getElementById('notes').value = data.notes || '';
        
        if (storedData.isJobPosting) {
          showJobForm();
        } else {
          showNotJobPage();
        }
      } else {
        showNotJobPage();
      }
    }
  } catch (error) {
    console.error('Error loading job data:', error);
    showNotJobPage();
  }
}

// Show job form
function showJobForm() {
  loadingDiv.style.display = 'none';
  notJobPageDiv.style.display = 'none';
  jobFormDiv.style.display = 'block';
}

// Show not job page message
function showNotJobPage() {
  loadingDiv.style.display = 'none';
  jobFormDiv.style.display = 'none';
  notJobPageDiv.style.display = 'block';
}

// Add job manually
function addJobManually() {
  showJobForm();
}

// Submit job to API
async function submitJob(formData) {
  const config = await chrome.storage.sync.get(['apiUrl', 'authToken']);
  
  if (!config.apiUrl) {
    showStatus('Please configure API URL in settings', 'error');
    return false;
  }

  try {
    const response = await fetch(`${config.apiUrl}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.authToken}`
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      showStatus('Job added successfully!', 'success');
      return true;
    } else {
      const error = await response.text();
      showStatus(`Error: ${error}`, 'error');
      return false;
    }
  } catch (error) {
    showStatus(`Network error: ${error.message}`, 'error');
    return false;
  }
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(addJobForm);
  const jobData = {
    title: formData.get('title'),
    company: formData.get('company'),
    link: formData.get('link'),
    status: formData.get('status'),
    date_applied: formData.get('date_applied'),
    notes: formData.get('notes'),
    tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : []
  };

  // Validate required fields
  if (!jobData.title || !jobData.company) {
    showStatus('Please fill in required fields (Title and Company)', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Adding...';

  const success = await submitJob(jobData);
  
  if (success) {
    // Close popup after successful submission
    setTimeout(() => {
      window.close();
    }, 1500);
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Add Job';
  }
}

// Handle cancel
function handleCancel() {
  window.close();
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  await loadJobData();
});

addJobForm.addEventListener('submit', handleFormSubmit);
cancelBtn.addEventListener('click', handleCancel);
addManuallyBtn.addEventListener('click', addJobManually);
saveConfigBtn.addEventListener('click', saveConfig);
