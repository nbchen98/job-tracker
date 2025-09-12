/**
 * Content script for Job Tracker Chrome Extension
 * Extracts job information from web pages and sends to popup
 */

// Function to extract job data from common job posting sites
function extractJobData() {
  const data = {
    title: '',
    company: '',
    link: window.location.href,
    date_applied: new Date().toISOString().split('T')[0]
  };

  // Try to extract job title
  const titleSelectors = [
    'h1[data-testid="job-title"]', // LinkedIn
    'h1.jobsearch-JobInfoHeader-title', // Indeed
    'h1[data-automation-id="jobPostingHeader"]', // Glassdoor
    'h1.job-title', // Generic
    'h1', // Fallback
    '.job-title',
    '[data-testid="job-title"]',
    '.job-header h1',
    '.job-details h1'
  ];

  for (const selector of titleSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      data.title = element.textContent.trim();
      break;
    }
  }

  // Try to extract company name
  const companySelectors = [
    '[data-testid="job-company"]', // LinkedIn
    '.jobsearch-CompanyInfoContainer .jobsearch-CompanyInfoWithoutHeaderImage', // Indeed
    '[data-automation-id="jobPostingHeader"] .employerName', // Glassdoor
    '.company-name', // Generic
    '.employer-name',
    '.job-company',
    '[data-testid="company-name"]',
    '.job-header .company',
    '.job-details .company'
  ];

  for (const selector of companySelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      data.company = element.textContent.trim();
      break;
    }
  }

  // If we couldn't find company name, try to extract from URL or page title
  if (!data.company) {
    // Try to extract from URL (e.g., linkedin.com/company/company-name)
    const urlMatch = window.location.href.match(/company\/([^\/]+)/);
    if (urlMatch) {
      data.company = urlMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Try to extract from page title
    if (!data.company && document.title) {
      const titleMatch = document.title.match(/(.+?)\s*-\s*(.+?)(?:\s*-\s*|$)/);
      if (titleMatch) {
        data.company = titleMatch[1].trim();
        if (!data.title) {
          data.title = titleMatch[2].trim();
        }
      }
    }
  }

  // Try to extract job description for notes
  const descriptionSelectors = [
    '.job-description',
    '.job-details',
    '[data-testid="job-description"]',
    '.jobsearch-jobDescriptionText',
    '.job-description-content'
  ];

  for (const selector of descriptionSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      // Truncate description to first 200 characters for notes
      const description = element.textContent.trim();
      data.notes = description.length > 200 ? description.substring(0, 200) + '...' : description;
      break;
    }
  }

  return data;
}

// Function to detect if current page is likely a job posting
function isJobPosting() {
  const jobIndicators = [
    'job',
    'career',
    'position',
    'opening',
    'opportunity',
    'employment'
  ];

  const url = window.location.href.toLowerCase();
  const title = document.title.toLowerCase();
  const bodyText = document.body.textContent.toLowerCase();

  // Check URL for job-related keywords
  const urlHasJobKeywords = jobIndicators.some(keyword => url.includes(keyword));
  
  // Check title for job-related keywords
  const titleHasJobKeywords = jobIndicators.some(keyword => title.includes(keyword));
  
  // Check for common job posting elements
  const hasJobElements = document.querySelector('.job-description, .job-details, [data-testid="job-title"], .jobsearch-JobInfoHeader-title');

  return urlHasJobKeywords || titleHasJobKeywords || hasJobElements;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJobData') {
    const jobData = extractJobData();
    const isJob = isJobPosting();
    
    sendResponse({
      success: true,
      data: jobData,
      isJobPosting: isJob
    });
  }
});

// Send initial data when page loads
window.addEventListener('load', () => {
  const jobData = extractJobData();
  const isJob = isJobPosting();
  
  // Store data in chrome storage for popup to access
  chrome.storage.local.set({
    extractedJobData: jobData,
    isJobPosting: isJob,
    pageUrl: window.location.href
  });
});
