# Job Tracker Chrome Extension

A Chrome extension that allows you to quickly add job applications to your Job Tracker from any job posting page.

## Features

- 🎯 **Smart Job Detection**: Automatically detects job posting pages
- 📝 **Auto-fill Forms**: Extracts job title, company, and description from popular job sites
- ⚡ **Quick Add**: Add jobs with one click from any job posting
- 🔧 **Configurable**: Set your own API endpoint and authentication
- 🌐 **Universal**: Works on LinkedIn, Indeed, Glassdoor, and other job sites

## Installation

1. **Load the Extension**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `chrome-extension` folder

2. **Configure the Extension**:
   - Click the extension icon in your browser toolbar
   - Set your Job Tracker API URL (default: `http://localhost:3000`)
   - Add your authentication token

3. **Get Your Auth Token**:
   - Go to your Job Tracker app
   - Open browser developer tools (F12)
   - Go to Application/Storage tab → Local Storage
   - Copy the `token` value

## Usage

1. **Navigate to a job posting** (LinkedIn, Indeed, Glassdoor, etc.)
2. **Click the extension icon** in your browser toolbar
3. **Review the auto-filled information** (title, company, link, etc.)
4. **Add any additional details** (notes, tags, status)
5. **Click "Add Job"** to save to your Job Tracker

## Supported Job Sites

- LinkedIn Jobs
- Indeed
- Glassdoor
- AngelList
- Remote.co
- We Work Remotely
- And many more!

## Development

### File Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic
├── content.js            # Content script for job extraction
├── background.js         # Background service worker
└── README.md            # This file
```

### Key Components

- **Content Script**: Extracts job data from web pages
- **Popup**: User interface for adding jobs
- **Background**: Handles extension lifecycle and communication
- **API Integration**: Communicates with your Job Tracker backend

## API Integration

The extension communicates with your Job Tracker API using the following endpoint:

```
POST /api/jobs
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "title": "Software Engineer",
  "company": "Tech Corp",
  "link": "https://...",
  "status": "applied",
  "date_applied": "2024-01-15",
  "notes": "Job description...",
  "tags": ["react", "frontend"]
}
```

## Troubleshooting

### Extension not detecting jobs?
- Make sure you're on a job posting page
- Check that the extension has permission to access the site
- Try refreshing the page and clicking the extension icon again

### API connection issues?
- Verify your API URL is correct
- Check that your authentication token is valid
- Ensure your Job Tracker backend is running
- Check browser console for error messages

### Auto-fill not working?
- The extension tries to extract data from common job sites
- If auto-fill fails, you can still add jobs manually
- Some job sites may have different HTML structures

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License
