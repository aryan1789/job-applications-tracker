# Jobs Tracker

A job application tracker with a companion browser extension.

Live: [job-applications-tracker-mu.vercel.app](https://job-applications-tracker-mu.vercel.app)

---

## Web App

Track every job you apply to — status, notes, interviews, and analytics in one place.

**Stack:** React, TypeScript, Vite, Tailwind CSS, Supabase, Recharts  
**Auth:** Google OAuth  
**Deployed:** Vercel

### Running locally

```bash
npm install
npm run dev
```

Create a `.env.local` with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Building

```bash
npm run build
```

---

## Browser Extension

Saves job listings from Seek and Indeed directly to your dashboard without leaving the page.

**Supported sites:** Seek, Indeed  
**Auth:** Google OAuth (PKCE)

### Loading the extension

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `extension/` folder

### How it works

- Navigate to a job listing on Seek or Indeed
- Click the Jobs Tracker icon in the toolbar
- Company and role are pre-filled from the page
- Click **Add Application** to save it to your dashboard

---

## Project Structure

```
├── src/
│   ├── pages/        # Home, Dashboard, Analytics, Login, Profile
│   ├── components/   # Layout, Sidebar, JobCard, modals
│   ├── contexts/     # Auth, Notifications
│   └── lib/          # Supabase client, types, utilities
└── extension/
    ├── manifest.json
    ├── background.js
    ├── content/      # Page scrapers for Seek and Indeed
    └── popup/        # Extension UI
```
