// Service worker — keeps the extension alive and handles any future background tasks.
// API calls are made directly from popup.js for simplicity.
chrome.runtime.onInstalled.addListener(() => {
  console.log('Jobs Tracker extension installed.');
});
