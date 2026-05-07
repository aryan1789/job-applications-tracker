const SUPABASE_URL = 'https://wqozyedsddtwxkwpeusk.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxb3p5ZWRzZGR0d3hrd3BldXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNzcyMTksImV4cCI6MjA4OTY1MzIxOX0.-HQmT2VEpdxs6nYmaYcz9uXyNWN7sMrEOKAMX7b00XI';

// ── PKCE ─────────────────────────────────────────────────────────────────────
function randomString(len) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '').slice(0, len);
}

async function generatePKCE() {
  const verifier = randomString(64);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return { verifier, challenge };
}

// ── DOM refs ──────────────────────────────────────────────────────────────────
const loginView  = document.getElementById('login-view');
const jobView    = document.getElementById('job-view');
const emailEl    = document.getElementById('email');
const passwordEl = document.getElementById('password');
const googleBtn  = document.getElementById('google-btn');
const loginBtn   = document.getElementById('login-btn');
const loginMsg   = document.getElementById('login-msg');
const signoutBtn = document.getElementById('signout-btn');
const siteBadge  = document.getElementById('site-badge');
const companyEl  = document.getElementById('company');
const roleEl     = document.getElementById('role');
const notesEl    = document.getElementById('notes');
const addBtn     = document.getElementById('add-btn');
const jobMsg     = document.getElementById('job-msg');

// ── UI helpers ────────────────────────────────────────────────────────────────
function showMsg(el, text, type) {
  el.textContent = text;
  el.className = `message ${type}`;
  el.style.display = 'block';
}
function hideMsg(el) { el.style.display = 'none'; }

// ── Fetch wrapper ─────────────────────────────────────────────────────────────
async function supabaseFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  return { ok: res.ok, status: res.status, data };
}

// ── Session storage ───────────────────────────────────────────────────────────
const SESSION_KEYS = ['access_token', 'refresh_token', 'user_id', 'expires_at'];

async function getSession() {
  return new Promise(resolve => chrome.storage.local.get(SESSION_KEYS, resolve));
}

async function saveSession(accessToken, refreshToken, userId, expiresIn) {
  return new Promise(resolve =>
    chrome.storage.local.set({
      access_token:  accessToken,
      refresh_token: refreshToken,
      user_id:       userId,
      expires_at:    Date.now() + expiresIn * 1000,
    }, resolve)
  );
}

async function clearSession() {
  return new Promise(resolve => chrome.storage.local.remove(SESSION_KEYS, resolve));
}

// ── Token refresh ─────────────────────────────────────────────────────────────
// Supabase access tokens expire after 1 hour; refresh tokens last 60 days.
// getValidToken() silently refreshes before the token expires so the user
// never needs to re-login unless their refresh token is also expired.
async function getValidToken() {
  const session = await getSession();
  if (!session.access_token) return null;

  const expiresIn60s = session.expires_at && Date.now() > session.expires_at - 60_000;

  if (expiresIn60s && session.refresh_token) {
    const { ok, data } = await supabaseFetch('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    if (ok && data.access_token) {
      await saveSession(data.access_token, data.refresh_token, session.user_id, data.expires_in);
      return { access_token: data.access_token, user_id: session.user_id };
    }
    // Refresh token itself expired — force re-login
    await clearSession();
    return null;
  }

  return { access_token: session.access_token, user_id: session.user_id };
}

// ── Auth ──────────────────────────────────────────────────────────────────────
async function signInWithGoogle() {
  const { verifier, challenge } = await generatePKCE();
  const redirectUrl = chrome.identity.getRedirectURL('auth');

  const params = new URLSearchParams({
    provider: 'google',
    redirect_to: redirectUrl,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  const responseUrl = await new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: `${SUPABASE_URL}/auth/v1/authorize?${params}`, interactive: true },
      url => chrome.runtime.lastError ? reject(new Error(chrome.runtime.lastError.message)) : resolve(url)
    );
  });

  const code = new URL(responseUrl).searchParams.get('code');
  if (!code) throw new Error('No auth code returned.');

  return supabaseFetch('/auth/v1/token?grant_type=pkce', {
    method: 'POST',
    body: JSON.stringify({ auth_code: code, code_verifier: verifier }),
  });
}

async function signInWithPassword(email, password) {
  return supabaseFetch('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ── Scraping ──────────────────────────────────────────────────────────────────
async function scrapeCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return null;
    const hostname = new URL(tab.url).hostname;
    if (!['seek.com', 'indeed.com'].some(s => hostname.includes(s))) return null;
    return await new Promise(resolve => {
      chrome.tabs.sendMessage(tab.id, { type: 'SCRAPE_JOB' }, response => {
        if (chrome.runtime.lastError) resolve(null);
        else resolve(response);
      });
    });
  } catch { return null; }
}

// ── Duplicate check ───────────────────────────────────────────────────────────
async function isDuplicate(accessToken, userId, company, role) {
  const params = new URLSearchParams({
    select:       'id',
    user_id:      `eq.${userId}`,
    company_name: `eq.${company}`,
    role_name:    `eq.${role}`,
    limit:        '1',
  });
  const { ok, data } = await supabaseFetch(`/rest/v1/applications?${params}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  return ok && Array.isArray(data) && data.length > 0;
}

// ── Add application ───────────────────────────────────────────────────────────
async function addApplication(accessToken, userId, company, role, notes) {
  return supabaseFetch('/rest/v1/applications', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Prefer': 'return=minimal' },
    body: JSON.stringify({
      user_id:      userId,
      company_name: company,
      role_name:    role,
      description:  '',
      notes:        notes.trim(),
      status:       'applied',
    }),
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  const session = await getSession();

  if (!session.access_token) {
    loginView.style.display = 'block';
    jobView.style.display   = 'none';
    duplicateConfirmPending  = false;
    return;
  }

  loginView.style.display = 'none';
  jobView.style.display   = 'block';
  addBtn.textContent      = 'Add Application';
  hideMsg(jobMsg);

  const [scraped, [tab]] = await Promise.all([
    scrapeCurrentTab(),
    chrome.tabs.query({ active: true, currentWindow: true }),
  ]);

  if (scraped?.company) companyEl.value = scraped.company;
  if (scraped?.role)    roleEl.value    = scraped.role;

  if (tab?.url) {
    try {
      const host = new URL(tab.url).hostname.replace('www.', '');
      siteBadge.textContent = scraped?.role
        ? `Scraped from ${host}`
        : `On ${host} — fill in details below`;
    } catch { siteBadge.textContent = ''; }
  }
}

// ── Session helper shared by both login handlers ──────────────────────────────
async function handleAuthSuccess(data) {
  await saveSession(data.access_token, data.refresh_token, data.user.id, data.expires_in);
  init();
}

// ── Duplicate state ───────────────────────────────────────────────────────────
let duplicateConfirmPending = false;

// Reset duplicate confirm if user edits the fields
[companyEl, roleEl].forEach(el => el.addEventListener('input', () => {
  if (duplicateConfirmPending) {
    duplicateConfirmPending = false;
    addBtn.textContent = 'Add Application';
    hideMsg(jobMsg);
  }
}));

// ── Event listeners ───────────────────────────────────────────────────────────
const GOOGLE_ICON = `<svg width="16" height="16" viewBox="0 0 48 48" style="flex-shrink:0"><path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.1-6.1C34.36 3.09 29.45 1 24 1 14.82 1 7.01 6.48 3.53 14.22l7.1 5.52C12.32 13.73 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.7c-.55 2.97-2.22 5.49-4.73 7.18l7.28 5.65C43.55 37.58 46.5 31.5 46.5 24.5z"/><path fill="#FBBC05" d="M10.63 28.26A14.63 14.63 0 0 1 9.5 24c0-1.48.25-2.9.63-4.26l-7.1-5.52A23.94 23.94 0 0 0 0 24c0 3.87.93 7.52 2.57 10.74l8.06-6.48z"/><path fill="#34A853" d="M24 47c5.45 0 10.02-1.8 13.35-4.88l-7.28-5.65c-1.8 1.21-4.1 1.93-6.07 1.93-6.3 0-11.68-4.23-13.37-9.74l-8.06 6.48C7.01 41.52 14.82 47 24 47z"/></svg> Continue with Google`;

googleBtn.innerHTML = GOOGLE_ICON;

googleBtn.addEventListener('click', async () => {
  googleBtn.disabled = true;
  googleBtn.textContent = 'Opening Google…';
  hideMsg(loginMsg);
  try {
    const { ok, data } = await signInWithGoogle();
    if (!ok || !data.access_token) {
      showMsg(loginMsg, data.error_description ?? 'Google sign in failed.', 'error');
      return;
    }
    await handleAuthSuccess(data);
  } catch (err) {
    showMsg(loginMsg, err.message ?? 'Google sign in failed.', 'error');
  } finally {
    googleBtn.disabled = false;
    googleBtn.innerHTML = GOOGLE_ICON;
  }
});

loginBtn.addEventListener('click', async () => {
  const email    = emailEl.value.trim();
  const password = passwordEl.value;
  if (!email || !password) {
    showMsg(loginMsg, 'Enter your email and password.', 'error');
    return;
  }
  loginBtn.disabled = true;
  loginBtn.textContent = 'Signing in…';
  hideMsg(loginMsg);

  const { ok, data } = await signInWithPassword(email, password);
  if (!ok || !data.access_token) {
    showMsg(loginMsg, data.error_description ?? data.msg ?? 'Sign in failed.', 'error');
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign in';
    return;
  }
  await handleAuthSuccess(data);
});

passwordEl.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });

signoutBtn.addEventListener('click', async () => {
  await clearSession();
  companyEl.value = '';
  roleEl.value    = '';
  notesEl.value   = '';
  init();
});

addBtn.addEventListener('click', async () => {
  const company = companyEl.value.trim();
  const role    = roleEl.value.trim();

  if (!company || !role) {
    showMsg(jobMsg, 'Company and role are required.', 'error');
    return;
  }

  addBtn.disabled = true;
  addBtn.textContent = 'Checking…';
  hideMsg(jobMsg);

  const token = await getValidToken();
  if (!token) {
    // Both access and refresh tokens expired — send back to login
    showMsg(jobMsg, 'Session expired — please sign in again.', 'error');
    setTimeout(() => init(), 1200);
    return;
  }

  // Duplicate check (skipped if user already confirmed once)
  if (!duplicateConfirmPending) {
    const alreadyExists = await isDuplicate(token.access_token, token.user_id, company, role);
    if (alreadyExists) {
      showMsg(jobMsg, 'Already in your dashboard. Click again to add anyway.', 'warning');
      duplicateConfirmPending = true;
      addBtn.disabled = false;
      addBtn.textContent = 'Add anyway';
      return;
    }
  }

  duplicateConfirmPending = false;
  addBtn.textContent = 'Adding…';

  const { ok, data } = await addApplication(token.access_token, token.user_id, company, role, notesEl.value);

  if (!ok) {
    showMsg(jobMsg, data.message ?? 'Failed to add application.', 'error');
    addBtn.disabled = false;
    addBtn.textContent = 'Add Application';
    return;
  }

  showMsg(jobMsg, '✓ Added to Jobs Dashboard!', 'success');
  companyEl.value = '';
  roleEl.value    = '';
  notesEl.value   = '';
  addBtn.disabled = false;
  addBtn.textContent = 'Add Application';
});

init();
