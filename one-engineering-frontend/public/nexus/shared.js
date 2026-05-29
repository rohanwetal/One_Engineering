// ═══════════════════════════════════════════════════════════════════
//  NEXUS — shared.js  (One Engineering Integrated Edition)
//
//  Auth is owned by One Engineering. The LauncherPage copies the OE
//  session into 'nexus:session' before navigating here.
//
//  Session shape: { token, user: { id, employeeId, role, name }, expiry }
//  Roles: 'Employee' | 'Manager(COE)' | 'Admin'
//  Add/Edit/Delete open to: all authenticated users
// ═══════════════════════════════════════════════════════════════════

// ── API base — Nexus routes are on the unified OE backend ────────────
const API_BASE = 'http://localhost:3000/api/nexus';

// ── OE login page (redirect here when session missing) ───────────────
const OE_LOGIN_URL = 'http://localhost:5173/login';

// ── OE launcher page (for "← Platform" link) ─────────────────────────
const OE_LAUNCHER_URL = 'http://localhost:5173/launcher';

// ── Session key written by LauncherPage.jsx before opening Nexus ──────
const NEXUS_SESSION_KEY = 'nexus:session';

// ── All authenticated users can add/edit/delete projects ─────────────

// ═══════════════════════════════════════════════════════════════════
//  SESSION HELPERS
// ═══════════════════════════════════════════════════════════════════

function getSession() {
  try {
    const raw = localStorage.getItem(NEXUS_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.token || !session?.user || !session?.expiry) return null;
    if (Date.now() >= session.expiry) {
      localStorage.removeItem(NEXUS_SESSION_KEY);
      return null;
    }
    return session.user;
  } catch {
    return null;
  }
}

function getToken() {
  try {
    const raw = localStorage.getItem(NEXUS_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.token || !session?.expiry) return null;
    if (Date.now() >= session.expiry) return null;
    return session.token;
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(NEXUS_SESSION_KEY);
  localStorage.removeItem('auth:session'); // also clear the main app session
}

async function logout() {
  try {
    await fetch('http://localhost:3000/api/users/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch { /* clear session regardless */ }
  clearSession();
  window.location.href = OE_LOGIN_URL;
}

function requireAuth() {
  const s = getSession();
  if (!s) {
    window.location.href = OE_LOGIN_URL;
    return null;
  }
  return s;
}

// ═══════════════════════════════════════════════════════════════════
//  PERMISSIONS
// ═══════════════════════════════════════════════════════════════════

function canAddProject(session) {
  return !!session;
}

// ═══════════════════════════════════════════════════════════════════
//  AUTH HEADER HELPER — for POST/PUT/DELETE calls
// ═══════════════════════════════════════════════════════════════════

function authHeaders() {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

// ── localStorage cache (unused now, kept for compatibility) ──────────
function getUpdates()     { return JSON.parse(localStorage.getItem('gw_updates') || '{}'); }
function saveUpdates(obj) { localStorage.setItem('gw_updates', JSON.stringify(obj)); }

// ── Toast ─────────────────────────────────────────────────────────────
function showToast(msg, type) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className   = 'toast ' + (type || '');
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => t.classList.remove('show'), 3200);
}

// ═══════════════════════════════════════════════════════════════════
//  COE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

const COE_LIST = [
  { key: 'mechanical', label: 'Mechanical',                        short: 'Mech', color: '#3b82f6' },
  { key: 'electrical', label: 'Electrical',                        short: 'Elec', color: '#f59e0b' },
  { key: 'hydraulics', label: 'Hydraulics',                        short: 'Hyd',  color: '#10b981' },
  { key: 'virtual',    label: 'Virtual Manufacturing Engineering',  short: 'VME',  color: '#8b5cf6' },
  { key: 'lean',       label: 'Lean Manufacturing & Tool Design',   short: 'Lean', color: '#ec4899' },
  { key: 'digital',    label: 'Digital Tech. & Program Management', short: 'DPM',  color: '#f97316' },
];
const DEPT_OPTIONS = COE_LIST.map(c => c.label);
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ═══════════════════════════════════════════════════════════════════
//  BACKEND API HELPERS
// ═══════════════════════════════════════════════════════════════════

async function fetchProjects() {
  try {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return await res.json();
  } catch (err) {
    console.error('fetchProjects:', err.message);
    showToast('Error loading projects', 'error');
    return [];
  }
}

async function fetchKPISummary() {
  try {
    const res = await fetch(`${API_BASE}/kpi/summary`);
    if (!res.ok) throw new Error('Failed to fetch KPI summary');
    return await res.json();
  } catch (err) {
    console.error('fetchKPISummary:', err.message);
    return { total: 0, ongoing: 0, completed: 0, delayed: 0, noprog: 0, watchlist: 0 };
  }
}

async function fetchKPIDetails(filters = {}) {
  try {
    const params = new URLSearchParams(filters).toString();
    const res    = await fetch(`${API_BASE}/kpi/details${params ? '?' + params : ''}`);
    if (!res.ok) throw new Error('Failed to fetch KPI details');
    return await res.json();
  } catch (err) {
    console.error('fetchKPIDetails:', err.message);
    return [];
  }
}

async function fetchDelayedProjects(limit = 10) {
  try {
    const res = await fetch(`${API_BASE}/kpi/delayed?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch delayed projects');
    return await res.json();
  } catch (err) {
    console.error('fetchDelayedProjects:', err.message);
    return [];
  }
}

async function fetchDeptStats() {
  try {
    const res = await fetch(`${API_BASE}/kpi/departments`);
    if (!res.ok) throw new Error('Failed to fetch dept stats');
    return await res.json();
  } catch (err) {
    console.error('fetchDeptStats:', err.message);
    return [];
  }
}

async function fetchHealthTable() {
  try {
    const res = await fetch(`${API_BASE}/kpi/health-table`);
    if (!res.ok) throw new Error('Failed to fetch health table');
    return await res.json();
  } catch (err) {
    console.error('fetchHealthTable:', err.message);
    return [];
  }
}

async function fetchWatchlistProjects() {
  try {
    const res = await fetch(`${API_BASE}/kpi/watchlist`);
    if (!res.ok) throw new Error('Failed to fetch watchlist');
    return await res.json();
  } catch (err) {
    console.error('fetchWatchlistProjects:', err.message);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════════
//  LOCAL HELPERS
// ═══════════════════════════════════════════════════════════════════

function parseEndDate(str) {
  if (!str) return null;
  const match = str.trim().match(/^([A-Za-z]{3})\s*'(\d{2})$/);
  if (!match) return null;
  const monthIdx = MONTHS.findIndex(m => m.toLowerCase() === match[1].toLowerCase());
  if (monthIdx === -1) return null;
  return new Date(2000 + parseInt(match[2]), monthIdx + 1, 0, 23, 59, 59);
}

function isDateDelayed(project, pct) {
  if (pct === 100) return false;
  const endDate = parseEndDate(project.end);
  if (!endDate) return false;
  return new Date() > endDate;
}

function computeAvg(coeData) {
  if (!coeData) return 0;
  const vals = COE_LIST.map(c => parseInt(coeData[c.key]) || 0).filter(v => v > 0);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}

function classifyProjectFull(project, pct) {
  if (pct === 100) return 'completed';
  if (pct === 0)   return 'noprog';
  if (isDateDelayed(project, pct)) return 'delayed';
  return 'ongoing';
}

function projectInYear(project, year) {
  function parseY(str) {
    if (!str) return null;
    const ap = str.match(/'(\d{2})$/);      if (ap) return 2000 + parseInt(ap[1]);
    const f4 = str.match(/\b(20\d{2})\b/); if (f4) return parseInt(f4[1]);
    const f2 = str.match(/\b(\d{2})\b/);   if (f2) return 2000 + parseInt(f2[1]);
    return null;
  }
  const sy = parseY(project.start);
  const ey = parseY(project.end);
  const yr = parseInt(year);
  if (!sy || !ey) return false;
  return yr >= sy && yr <= ey;
}

function hasWatchNotes(upd) {
  return upd && upd.coeNotes && COE_LIST.some(c => (upd.coeNotes[c.key] || '').trim().length > 0);
}

// ═══════════════════════════════════════════════════════════════════
//  HEADER BUILDER
// ═══════════════════════════════════════════════════════════════════

function buildHeader(session) {
  const el = document.getElementById('siteHeader');
  if (!el) return;
  const initials = session
    ? session.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';
  const name = session ? session.name : 'User';
  const role = session ? (session.role || '') : '';
  const roleHtml = role
    ? `<span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;
        background:rgba(255,255,255,.18);color:rgba(255,255,255,.85);letter-spacing:.3px;">
        ${role}</span>`
    : '';

  el.innerHTML = `
    <div class="header-inner">
      <div class="logo-wrap">
        <img src="logo-white.png" alt="Gainwell Engineering" onerror="this.style.display='none'">
      </div>
      <div class="header-title-wrap">
        <span class="nexus-brand">NEXUS</span>
        <span class="nexus-sub">Project Tracking</span>
      </div>
      <div class="header-right">
        <a href="${OE_LAUNCHER_URL}"
           title="Back to One Engineering"
           style="color:rgba(255,255,255,.8);font-size:13px;font-weight:600;
                  text-decoration:none;padding:6px 13px;border-radius:8px;
                  border:1.5px solid rgba(255,255,255,.28);transition:background .2s;
                  display:inline-flex;align-items:center;gap:6px;"
           onmouseover="this.style.background='rgba(255,255,255,.12)'"
           onmouseout="this.style.background='transparent'">
          ← Platform
        </a>
        <div class="user-badge">
          <div class="user-avatar">${initials}</div>
          <span class="user-name">${name}</span>
          ${roleHtml}
        </div>
        <button class="logout-btn" onclick="logout()">Logout</button>
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════
//  DEPT PROGRESS TOOLTIP
// ═══════════════════════════════════════════════════════════════════

let _deptTooltip = null;
let _deptTooltipHideTimer = null;

function _ensureDeptTooltip() {
  if (!_deptTooltip) {
    _deptTooltip = document.createElement('div');
    _deptTooltip.id = 'deptProgressTooltip';
    _deptTooltip.className = 'dept-progress-tooltip';
    document.body.appendChild(_deptTooltip);
  }
  return _deptTooltip;
}

function showDeptTooltip(event, coeData, projectDepts) {
  clearTimeout(_deptTooltipHideTimer);
  const tooltip  = _ensureDeptTooltip();
  const relevant = (projectDepts && projectDepts.length)
    ? COE_LIST.filter(c => projectDepts.some(d => d.toLowerCase() === c.label.toLowerCase()))
    : COE_LIST;
  const rows = relevant.map(c => {
    const val   = parseInt((coeData || {})[c.key]) || 0;
    const color = val === 0 ? '#94a3b8' : val < 30 ? '#ef4444' : val < 70 ? '#f59e0b' : '#22c55e';
    return `<div class="dpt-row">
      <span class="dpt-dot" style="background:${c.color}"></span>
      <span class="dpt-label">${c.short}</span>
      <div class="dpt-bar-bg"><div class="dpt-bar-fill" style="width:${val}%;background:${color}"></div></div>
      <span class="dpt-pct" style="color:${color}">${val}%</span>
    </div>`;
  }).join('');
  tooltip.innerHTML = `<div class="dpt-header">Dept. Breakdown</div>${rows}`;
  tooltip.classList.add('visible');
  _positionDeptTooltip(event, tooltip);
}

function _positionDeptTooltip(event, tooltip) {
  const vpW = window.innerWidth, vpH = window.innerHeight;
  const tw  = tooltip.offsetWidth  || 220;
  const th  = tooltip.offsetHeight || 180;
  let left  = event.clientX + 14;
  let top   = event.clientY - th / 2;
  if (left + tw > vpW - 8) left = event.clientX - tw - 14;
  top = Math.max(8, Math.min(top, vpH - th - 8));
  tooltip.style.left = left + 'px';
  tooltip.style.top  = top  + 'px';
}

function hideDeptTooltip() {
  _deptTooltipHideTimer = setTimeout(() => {
    if (_deptTooltip) _deptTooltip.classList.remove('visible');
  }, 120);
}

// ═══════════════════════════════════════════════════════════════════
//  MONTH-YEAR PICKER
// ═══════════════════════════════════════════════════════════════════

const _pickerState = {};
let _openPickerId  = null;

function openPicker(fieldId) {
  if (_openPickerId && _openPickerId !== fieldId) closePicker(_openPickerId);
  const existY = parseInt(document.getElementById(fieldId).dataset.year);
  if (!_pickerState[fieldId]) _pickerState[fieldId] = { year: existY || new Date().getFullYear() };
  _renderPickerPopup(fieldId);
  document.getElementById('pop_' + fieldId).classList.add('open');
  document.getElementById(fieldId).classList.add('active');
  _openPickerId = fieldId;
}

function closePicker(fieldId) {
  document.getElementById('pop_' + fieldId)?.classList.remove('open');
  document.getElementById(fieldId)?.classList.remove('active');
  if (_openPickerId === fieldId) _openPickerId = null;
}

function _renderPickerPopup(fieldId) {
  const state = _pickerState[fieldId];
  const cv    = document.getElementById(fieldId).value;
  let sm = -1;
  if (cv) {
    const mi = MONTHS.findIndex(m => cv.startsWith(m));
    if (mi >= 0 && (2000 + parseInt(cv.slice(-2))) === state.year) sm = mi;
  }
  const btns = MONTHS.map((m, i) =>
    `<button class="mypicker-month-btn ${i === sm ? 'selected' : ''}"
       onclick="selectMonthYear('${fieldId}',${i},${state.year})">${m}</button>`
  ).join('');
  document.getElementById('pop_' + fieldId).innerHTML =
    `<div class="mypicker-nav">
       <button onclick="changePickerYear('${fieldId}',-1)">‹</button>
       <span class="mypicker-year-label">${state.year}</span>
       <button onclick="changePickerYear('${fieldId}',+1)">›</button>
     </div>
     <div class="mypicker-months">${btns}</div>`;
}

function changePickerYear(f, d) { _pickerState[f].year += d; _renderPickerPopup(f); }

function selectMonthYear(f, mi, yr) {
  const inp    = document.getElementById(f);
  inp.value    = MONTHS[mi] + "'" + String(yr).slice(-2);
  inp.dataset.year = yr;
  closePicker(f);
}

function resetPicker(f) {
  const el = document.getElementById(f);
  if (el) { el.value = ''; delete el.dataset.year; }
  delete _pickerState[f];
  closePicker(f);
}

function initPickerOutsideClose() {
  document.addEventListener('click', function (e) {
    if (_openPickerId) {
      const w = document.getElementById('wrap_' + _openPickerId);
      if (w && !w.contains(e.target)) closePicker(_openPickerId);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
//  DEPARTMENT SELECTOR
// ═══════════════════════════════════════════════════════════════════

let _currentDeptCount = 1;

function setDeptCount(count, btn) {
  _currentDeptCount = count;
  document.querySelectorAll('.dept-count-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderDeptSelects(count);
}

function renderDeptSelects(count) {
  const wrap = document.getElementById('deptSelects');
  if (!wrap) return;
  wrap.innerHTML = '';
  if (count >= DEPT_OPTIONS.length) {
    const info = document.createElement('div');
    info.style.cssText = 'padding:10px 14px;background:#f0f7ff;border-radius:8px;font-size:13px;color:var(--blue);font-weight:700;';
    info.textContent = `✓ All ${DEPT_OPTIONS.length} departments selected`;
    wrap.appendChild(info);
  } else {
    for (let i = 0; i < count; i++) {
      const sel = document.createElement('select');
      sel.className = 'dept-select';
      sel.id = 'dept_' + i;
      sel.innerHTML = `<option value="">— Select Department ${i + 1} —</option>` +
        DEPT_OPTIONS.map(d => `<option value="${d}">${d}</option>`).join('');
      wrap.appendChild(sel);
    }
  }
}

function getSelectedDepts() {
  if (_currentDeptCount >= DEPT_OPTIONS.length) return [...DEPT_OPTIONS];
  const d = [];
  for (let i = 0; i < _currentDeptCount; i++) {
    const el = document.getElementById('dept_' + i);
    if (el && el.value) d.push(el.value);
  }
  return d;
}

function resetDeptSelector() {
  _currentDeptCount = 1;
  document.querySelectorAll('.dept-count-btn').forEach((b, i) =>
    b.classList.toggle('active', i === 0)
  );
  renderDeptSelects(1);
}
