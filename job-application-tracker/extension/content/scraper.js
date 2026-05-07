// Runs on Seek, Indeed, and LinkedIn job pages.
// Listens for a SCRAPE_JOB message from the popup and returns company + role.

function scrape() {
  const host = window.location.hostname;

  if (host.includes('seek.com')) {
    return {
      role:    document.querySelector('[data-automation="job-detail-title"]')?.textContent?.trim() ?? '',
      company: document.querySelector('[data-automation="advertiser-name"]')?.textContent?.trim() ?? '',
    };
  }

  if (host.includes('indeed.com')) {
    return {
      role:
        document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]')?.textContent?.trim().replace(/\s*-\s*job post$/i, '') ??
        '',
      company:
        document.querySelector('[data-testid="inlineHeader-companyName"]')?.textContent?.trim() ??
        document.querySelector('[data-testid="jobsearch-CompanyInfoContainer"] span')?.textContent?.trim() ??
        '',
    };
  }

  return { role: '', company: '' };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SCRAPE_JOB') {
    sendResponse(scrape());
  }
  return true;
});
