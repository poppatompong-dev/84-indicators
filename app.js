// === LOCALSTORAGE KEY MIGRATION (D-2) ===
(function migrateLocalStorageKeys() {
  if (localStorage.getItem("84_migrated") === "1") return;
  try {
    // 84status → 84_status_overrides
    const oldStatus = localStorage.getItem("84status");
    if (oldStatus && !localStorage.getItem("84_status_overrides")) {
      localStorage.setItem("84_status_overrides", oldStatus);
    }
    // lang → 84_lang
    const oldLang = localStorage.getItem("lang");
    if (oldLang && !localStorage.getItem("84_lang")) {
      localStorage.setItem("84_lang", oldLang);
    }
    localStorage.setItem("84_migrated", "1");
    console.log("[Migration] localStorage keys migrated successfully");
  } catch (e) { console.warn("[Migration] Error:", e); }
})();

// === ADMIN MODE ===
let adminUnlocked = (function () { try { return sessionStorage.getItem('84admin') === '1'; } catch (e) { return false; } })();

function promptAdmin() {
  const pw = prompt("🔐 รหัสผ่าน Admin:");
  if (pw === null) return;
  if (pw === 'admin123') {
    try { sessionStorage.setItem('84admin', '1'); } catch (e) { }
    adminUnlocked = true;
    navigate('admin');
    showToast('🔓 Admin Mode เปิดแล้ว');
  } else {
    alert('รหัสผิด');
  }
}

function lockAdmin() {
  try { sessionStorage.removeItem('84admin'); } catch (e) { }
  adminUnlocked = false;
  showToast('🔒 Admin Mode ปิดแล้ว');
  navigate('dashboard');
}

// === HELPERS ===
const STATUS_RAW = { c: { th: "ดำเนินการแล้ว", en: "Completed", cls: "badge-completed" }, p: { th: "กำลังดำเนินการ", en: "In Progress", cls: "badge-progress" }, w: { th: "รอดำเนินการ", en: "Pending", cls: "badge-pending" } };
function stLabel(key) { const s = STATUS_RAW[key]; return s ? s[getLang()] || s.th : key; }
const STATUS_MAP = new Proxy(STATUS_RAW, { get(target, prop) { const s = target[prop]; if (!s) return undefined; return { ...s, label: s[getLang()] || s.th }; } });
function getIndicators() {
  const overrides = getStatusOverrides();
  const L = typeof getLang === 'function' ? getLang() : 'th';
  const syncState = typeof loadSyncState === 'function' ? loadSyncState() : {};
  const mappingAll = typeof loadMapping === 'function' ? loadMapping() : {};

  return D.map(d => {
    const id = d[0];
    const ov = overrides[id];
    let sub = L === 'en' ? t(d[2]) : d[2];
    let title = d[3];
    let desc = d[4];
    let agencies = d[5].split("|");

    if (L === 'en') {
      agencies = agencies.map(a => t(a));

      // Priority: Drive EN data > data.js titleEn/descEn > placeholder
      if (typeof INDICATOR_EN !== 'undefined' && INDICATOR_EN[id]) {
        title = INDICATOR_EN[id].title || title;
        desc = INDICATOR_EN[id].desc || desc;
      } else if (d[7]) {
        title = d[7];
        desc = d[8] || desc;
      } else {
        title = "Content Pending (English Version)";
        desc = "The Uthai Thani Municipality team is actively preparing and translating evidence for this indicator into the Google Drive 'English Version' workspace. This content will sync automatically once available.";
      }
    }

    const originalStatus = d[6]; // Status from data source (before any override)
    let filesCount = null;
    let files = [];
    let dataNotReady = false;

    // Strict language separation: use ONLY the correct dataset
    if (L === 'en') {
      if (typeof INDICATOR_EN !== 'undefined' && INDICATOR_EN[id]) {
        filesCount = INDICATOR_EN[id].filesCount !== undefined ? INDICATOR_EN[id].filesCount : 0;
        files = INDICATOR_EN[id].files || [];
      } else {
        dataNotReady = true;
      }
    } else {
      if (typeof INDICATOR_TH !== 'undefined' && INDICATOR_TH[id]) {
        filesCount = INDICATOR_TH[id].filesCount !== undefined ? INDICATOR_TH[id].filesCount : 0;
        files = INDICATOR_TH[id].files || [];
      } else {
        dataNotReady = true;
      }
    }

    // Auto Status Calculation from Drive data:
    // ≥1 file = "c" (Complete), 0 files = "w" (Pending)
    let autoStatus = dataNotReady ? 'w' : (filesCount > 0 ? 'c' : 'w');
    let status = ov ? ov.status : autoStatus;
    let validationMatch = 'ok';

    // Detect mismatch between override/original and auto-calculated
    if (ov && ov.status !== autoStatus) {
      validationMatch = 'override_mismatch';
    } else if (!ov && !dataNotReady && filesCount !== null) {
      if (filesCount === 0 && (originalStatus === 'c' || originalStatus === 'p')) {
        validationMatch = 'mismatch';
      }
    }

    // Data Integrity Status (from sync state, independent of business status)
    let dataIntegrity = 'unknown';
    let dataIssues = [];
    let lastSyncedAt = null;
    const syncEntry = syncState[id];
    if (syncEntry) {
      dataIntegrity = syncEntry.validationStatus || 'ok';
      dataIssues = syncEntry.validationIssues || [];
      lastSyncedAt = syncEntry.lastSyncedAt || null;
    } else {
      const mapping = mappingAll[id] || null;
      if (!mapping) {
        dataIntegrity = 'error';
        dataIssues = ['No folder mapping'];
      } else {
        dataIntegrity = 'unknown';
        dataIssues = ['Not yet synced'];
      }
    }

    // Subfolder and English Version info from sync state
    let hasEnglishVersion = false;
    let subfolderNames = [];
    if (syncEntry) {
      hasEnglishVersion = !!syncEntry.hasEnglishVersion;
      subfolderNames = syncEntry.subfolderNames || [];
    }

    return {
      id, cat: d[1], sub, title, desc, agencies,
      status,
      autoStatus,
      originalStatus,
      statusOverridden: !!ov,
      validationMatch,
      filesCount,
      files,
      dataNotReady,
      dataIntegrity,
      dataIssues,
      lastSyncedAt,
      hasEnglishVersion,
      subfolderNames
    };
  });
}

function getCatStats() {
  const items = getIndicators();
  return CATS.map(c => {
    const ci = items.filter(i => i.cat === c.id);
    const done = ci.filter(i => i.status === "c").length;
    return { ...c, total: ci.length, done, pct: ci.length ? Math.round(done / ci.length * 100) : 0 };
  });
}
function totalStats() {
  const items = getIndicators();
  const done = items.filter(i => i.status === "c").length;
  const prog = items.filter(i => i.status === "p").length;
  const pend = items.filter(i => i.status === "w").length;
  return { total: items.length, done, prog, pend, pct: Math.round(done / items.length * 100) };
}

// === ADMIN STATUS OVERRIDES (localStorage) ===
function getStatusOverrides() {
  try { return JSON.parse(localStorage.getItem('84_status_overrides') || '{}'); } catch (e) { return {}; }
}
function saveStatusOverride(indicatorId, newStatus) {
  const ov = getStatusOverrides();
  ov[indicatorId] = { status: newStatus, ts: new Date().toISOString(), by: 'admin' };
  try { localStorage.setItem('84_status_overrides', JSON.stringify(ov)); } catch (e) { }
}
function clearStatusOverride(indicatorId) {
  const ov = getStatusOverrides();
  delete ov[indicatorId];
  try { localStorage.setItem('84_status_overrides', JSON.stringify(ov)); } catch (e) { }
}
function changeIndicatorStatus(indicatorId, newStatus) {
  const labels = { c: t('status.completed'), p: t('status.in_progress'), w: t('status.pending') };
  if (!confirm(`${t('status.change.confirm')} "${labels[newStatus]}"?`)) return;
  saveStatusOverride(indicatorId, newStatus);
  showToast(`✅ ${t('status.change.toast')} #${indicatorId} → "${labels[newStatus]}"`);
  render();
}
function resetIndicatorStatus(indicatorId) {
  if (!confirm(t('status.reset.confirm'))) return;
  clearStatusOverride(indicatorId);
  showToast(t('status.reset.toast'));
  render();
}

// === AUDITOR FEEDBACK STORAGE ===
function getFeedback(indicatorId) {
  try { return JSON.parse(localStorage.getItem(`84fb_${indicatorId}`) || 'null'); } catch (e) { return null; }
}
function saveFeedback(indicatorId, data) {
  try { localStorage.setItem(`84fb_${indicatorId}`, JSON.stringify(data)); } catch (e) { }
}
function deleteFeedback(indicatorId) {
  try { localStorage.removeItem(`84fb_${indicatorId}`); } catch (e) { }
}
function saveFeedbackFromForm(indicatorId) {
  const el = document.getElementById(`feedback-text-${indicatorId}`);
  const ratingEl = document.getElementById(`feedback-rating-${indicatorId}`);
  if (!el) return;
  const text = el.value.trim();
  const rating = ratingEl ? ratingEl.value : '';
  if (!text) { showToast('กรุณากรอกข้อความ'); return; }
  const data = { text, rating, author: 'ผู้ตรวจประเมิน', ts: new Date().toISOString() };
  saveFeedback(indicatorId, data);
  showToast('✅ บันทึกข้อเสนอแนะแล้ว');
  render();
}
function clearFeedback(indicatorId) {
  if (!confirm('ลบข้อเสนอแนะนี้?')) return;
  deleteFeedback(indicatorId);
  showToast('ลบข้อเสนอแนะแล้ว');
  render();
}

// === ROUTER ===
let currentView = "dashboard";
let currentFilter = { cat: 0, status: "", search: "" };
let suppressHash = false;
let catalogView = (function () { try { return localStorage.getItem("84catalogView") || "grid"; } catch (e) { return "grid"; } })();
function setCatalogView(v) { catalogView = v; try { localStorage.setItem("84catalogView", v); } catch (e) { } render(); }

function navigate(view, params) {
  currentView = view;
  if (params) Object.assign(currentFilter, params);
  suppressHash = true;
  window.location.hash = view === "detail" ? "detail/" + currentFilter.id : view;
  suppressHash = false;
  closeMobile();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeMobile() {
  const sb = document.getElementById("sidebar");
  const ov = document.getElementById("mobileOverlay");
  if (!sb.classList.contains("-translate-x-full") && window.innerWidth < 768) {
    sb.classList.add("-translate-x-full");
    ov.classList.add("hidden");
  }
}

function onHashChange() {
  if (suppressHash) return;
  const h = window.location.hash.slice(1) || "dashboard";
  if (h.startsWith("detail/")) {
    currentFilter.id = parseInt(h.split("/")[1]);
    currentView = "detail";
  } else if (h === "catalog") {
    currentView = "catalog";
  } else if (h === "admin") {
    currentView = adminUnlocked ? "admin" : "dashboard";
  } else if (h === "audit") {
    currentView = "audit";
  } else if (h === "manual") {
    currentView = "manual";
  } else {
    currentView = "dashboard";
  }
  render();
}
window.addEventListener("hashchange", onHashChange);

function toggleMobile() {
  const sb = document.getElementById("sidebar");
  const ov = document.getElementById("mobileOverlay");
  sb.classList.toggle("-translate-x-full");
  ov.classList.toggle("hidden");
}

function onGlobalSearch(v) {
  currentFilter.search = v;
  if (currentView !== "catalog") { navigate("catalog"); }
  else render();
}

// === RENDER ===
function render() {
  const app = document.getElementById("app");
  updateNav();
  updateSidebar();
  // Language toggle
  const lt = document.getElementById("langToggle");
  if (lt) lt.innerHTML = langToggleHTML();
  // Update nav Drive status
  updateNavDriveStatus();
  if (currentView === "dashboard") app.innerHTML = renderDashboard();
  else if (currentView === "catalog") app.innerHTML = renderCatalog();
  else if (currentView === "detail") app.innerHTML = renderDetail();
  else if (currentView === "admin" && adminUnlocked) app.innerHTML = renderAdmin();
  else if (currentView === "audit") app.innerHTML = renderAudit();
  else if (currentView === "manual") app.innerHTML = renderManual();
  const vEl = app.querySelector("[data-view]");
  if (vEl) { vEl.classList.add("active", "fade-in"); }
  // Restore search focus in catalog
  if (currentView === "catalog" && currentFilter.search) {
    const si = app.querySelector("input[placeholder*='ค้นหา'], input[placeholder*='Search']");
    if (si) { si.focus(); si.setSelectionRange(si.value.length, si.value.length); }
  }
  // Update static i18n elements
  if (typeof updateStaticI18n === "function") updateStaticI18n();
  // Load Drive data asynchronously
  postRenderDrive();
}

function updateNav() {
  document.querySelectorAll(".nav-pill").forEach(a => {
    const n = a.dataset.nav;
    const isActive = n === currentView || (currentView === "detail" && n === "catalog") || (currentView === "admin" && n === "dashboard") || (currentView === "manual" && n === "manual");
    a.classList.toggle("active", isActive);
    a.classList.toggle("text-on-surface-variant", !isActive);
  });
}

function updateNavDriveStatus() {
  const el = document.getElementById("navDriveStatus");
  if (!el) return;
  el.innerHTML = driveStatusHTML();
}

// Navbar scroll effect
let _navScrollBound = false;
function initNavScroll() {
  if (_navScrollBound) return;
  _navScrollBound = true;
  const mainArea = document.querySelector("main");
  if (!mainArea) return;
  window.addEventListener("scroll", () => {
    const nav = document.getElementById("mainNav");
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 10);
  }, { passive: true });
}

function updateSidebar() {
  const nav = document.getElementById("sideNav");
  const stats = getCatStats();
  const L = getLang();
  nav.innerHTML = `
    <a class="flex items-center space-x-3 px-3 py-2.5 ${currentView === "dashboard" ? "bg-white/80 text-emerald-800 font-bold rounded-lg" : "text-on-surface-variant hover:bg-white/50 rounded-lg"} cursor-pointer transition-all" onclick="navigate('dashboard')">
      <span class="material-symbols-outlined text-xl">dashboard</span>
      <span class="text-sm">${t("nav.dashboard")}</span>
    </a>
    <a class="flex items-center space-x-3 px-3 py-2.5 ${currentView === 'manual' ? 'bg-white/80 text-emerald-800 font-bold rounded-lg' : 'text-on-surface-variant hover:bg-white/50 rounded-lg'} cursor-pointer transition-all" onclick="navigate('manual')">
      <span class="material-symbols-outlined text-xl">menu_book</span>
      <span class="text-sm">${t('nav.manual')}</span>
    </a>
    ${stats.map(c => `
      <a class="flex items-center space-x-3 px-3 py-2.5 ${currentView === "catalog" && currentFilter.cat === c.id ? "bg-white/80 text-emerald-800 font-bold rounded-lg" : "text-on-surface-variant hover:bg-white/50 rounded-lg"} cursor-pointer transition-all group" onclick="navigate('catalog',{cat:${c.id},status:'',search:''})">
        <span class="material-symbols-outlined text-xl" style="color:${c.cl}">${c.ic}</span>
        <div class="flex-1 min-w-0">
          <span class="text-sm block truncate">${catName(c.id)}</span>
          <div class="flex items-center mt-1">
            <div class="h-1 flex-1 bg-black/5 rounded-full overflow-hidden"><div class="h-full rounded-full" style="width:${c.pct}%;background:${c.cl}"></div></div>
            <span class="text-[10px] ml-2 text-on-surface-variant">${c.done}/${c.total}</span>
          </div>
        </div>
      </a>
    `).join("")}
  `;
}

// === DASHBOARD ===
function renderDashboard() {
  const s = totalStats();
  const cats = getCatStats();
  const L = getLang();
  const circumference = 2 * Math.PI * 110;
  const offset = circumference - (s.pct / 100) * circumference;
  const mappedCount = Object.keys(driveStatusMap).length;
  const inProgressCount = s.prog;
  return `<div data-view="dashboard" class="px-4 md:px-8 py-6 max-w-7xl w-full mx-auto space-y-8">
    <!-- Hero -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl p-6 lg:p-10 relative overflow-hidden" style="background:linear-gradient(135deg,#0A3D2A 0%,#1b4332 55%,#0D6B3F 100%)">
      <div id="hero-bg-img" class="hero-img-bg" style="opacity:0.08"></div>
      <!-- floating circles decoration -->
      <div class="absolute -top-16 -right-16 w-80 h-80 rounded-full" style="background:rgba(255,255,255,0.03)"></div>
      <div class="absolute -bottom-20 -left-10 w-64 h-64 rounded-full" style="background:rgba(200,149,46,0.07)"></div>
      <div class="lg:col-span-7 space-y-5 relative z-10">
        <div class="flex items-center gap-3 flex-wrap">
          <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style="background:rgba(200,149,46,0.2);color:#f1c048">${t("dash.cycle")}</span>
          <span class="flex items-center gap-1 px-2.5 py-1 rounded-full" style="background:rgba(255,255,255,0.1)">${driveStatusHTMLLight()}</span>
          ${mappedCount > 0 ? `<span class="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold" style="background:rgba(165,208,185,0.15);color:#a5d0b9"><span class="material-symbols-outlined" style="font-size:13px">link</span>${mappedCount}/84 ${t('dash.hero.mapped')}</span>` : ''}
        </div>
        <h1 class="text-4xl lg:text-5xl font-headline font-extrabold tracking-tight leading-tight" style="color:#ffffff">
          ${t("dash.hero.title1")}<br/><span style="color:#75daa8">${t("dash.hero.title2")}</span>
        </h1>
        <p class="text-base max-w-lg leading-relaxed font-thai" style="color:rgba(255,255,255,0.75)">
          ${t("dash.hero.desc")}
        </p>
        <!-- Stat chips -->
        <div class="flex flex-wrap gap-3">
          <div class="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style="background:rgba(255,255,255,0.1);backdrop-filter:blur(10px)">
            <span class="material-symbols-outlined text-xl" style="color:#75daa8">check_circle</span>
            <div>
              <div class="text-2xl font-headline font-black" style="color:#ffffff">${s.done}</div>
              <div class="text-[10px] font-bold uppercase tracking-wide" style="color:rgba(255,255,255,0.55)">${t('dash.hero.completed')}</div>
            </div>
          </div>
          <div class="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style="background:rgba(255,255,255,0.08);backdrop-filter:blur(10px)">
            <span class="material-symbols-outlined text-xl" style="color:#f1c048">pending</span>
            <div>
              <div class="text-2xl font-headline font-black" style="color:#ffffff">${inProgressCount}</div>
              <div class="text-[10px] font-bold uppercase tracking-wide" style="color:rgba(255,255,255,0.55)">${t('dash.hero.inprogress')}</div>
            </div>
          </div>
          <div class="flex items-center gap-2 px-4 py-2.5 rounded-2xl" style="background:rgba(255,255,255,0.06);backdrop-filter:blur(10px)">
            <span class="material-symbols-outlined text-xl" style="color:rgba(255,255,255,0.4)">schedule</span>
            <div>
              <div class="text-2xl font-headline font-black" style="color:#ffffff">${s.pend}</div>
              <div class="text-[10px] font-bold uppercase tracking-wide" style="color:rgba(255,255,255,0.55)">${t('dash.hero.pending')}</div>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3 pt-1">
          <button onclick="navigate('catalog')" class="px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 hover:scale-105 transition-transform text-sm" style="background:#ffffff;color:#0A3D2A">
            <span class="material-symbols-outlined text-lg">visibility</span><span>${t("dash.btn.viewall")}</span>
          </button>
          <button onclick="navigate('catalog',{status:'w'})" class="font-bold px-5 py-2.5 rounded-xl transition-colors text-sm" style="background:rgba(255,255,255,0.12);color:rgba(255,255,255,0.9);border:1px solid rgba(255,255,255,0.2)">
            ${t("dash.btn.pending")} (${s.pend})
          </button>
        </div>
      </div>
      <div class="lg:col-span-5 flex justify-center items-center relative py-4">
        <div class="relative w-56 h-56 flex items-center justify-center">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
            <circle cx="128" cy="128" r="110" fill="transparent" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
            <circle cx="128" cy="128" r="110" fill="transparent" stroke="#75daa8" stroke-width="12" stroke-linecap="round"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" style="transition:stroke-dashoffset 1s ease"/>
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-5xl font-headline font-black" style="color:#ffffff">${s.pct}%</span>
            <span class="text-xs font-bold uppercase tracking-widest mt-1" style="color:rgba(255,255,255,0.6)">${t("dash.progress.done")}</span>
            <span class="text-[10px] mt-2 font-bold" style="color:#75daa8">${s.done} / ${s.total}</span>
          </div>
        </div>
      </div>
      <div class="absolute bottom-3 right-8 raft-float" style="opacity:0.15">
        <svg width="80" height="40" viewBox="0 0 80 40"><rect x="5" y="15" width="70" height="8" rx="4" fill="#C8952E"/><rect x="10" y="10" width="60" height="5" rx="2" fill="#D4A94E"/><polygon points="40,0 45,10 35,10" fill="#75daa8"/><line x1="40" y1="0" x2="40" y2="15" stroke="#C8952E" stroke-width="1.5"/><path d="M0,30 Q20,25 40,30 Q60,35 80,30" fill="none" stroke="#75daa8" stroke-width="1" opacity="0.7"/></svg>
      </div>
    </section>

    <!-- Raft Progress Bar -->
    <section class="bg-white rounded-2xl p-5 relative overflow-hidden">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-headline font-bold text-sm text-on-surface">${t("dash.progress.title")}</h3>
        <span class="text-xs text-on-surface-variant font-bold">${s.pct}% ${t("dash.progress.done")}</span>
      </div>
      <div class="relative h-12 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl overflow-hidden">
        <div class="absolute inset-0 wave-bg"></div>
        <div class="absolute top-0 left-0 h-full bg-gradient-to-r from-river-blue/20 to-emerald-forest/20 rounded-xl" style="width:${s.pct}%"></div>
        <div class="absolute raft-float" style="top:50%;left:calc(${s.pct}% - 20px);transform:translateY(-50%)">
          <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden="true"><rect x="3" y="8" width="34" height="6" rx="3" fill="#6B3E26"/><polygon points="20,0 23,8 17,8" fill="#0D6B3F"/><line x1="20" y1="0" x2="20" y2="10" stroke="#6B3E26" stroke-width="1"/></svg>
        </div>
        <div class="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-forest">
          <span class="material-symbols-outlined text-lg" aria-hidden="true">flag</span>
        </div>
      </div>
      <div class="flex justify-between mt-2 text-[10px] text-on-surface-variant font-bold">
        <span>${t("dash.progress.start")}</span><span>${t("dash.progress.goal")}</span>
      </div>
    </section>

    <!-- Theme Cards -->
    <section class="space-y-4">
      <div class="flex justify-between items-end">
        <div>
          <h2 class="text-xl font-headline font-extrabold text-on-surface">${t("dash.cats.title")}</h2>
          <p class="text-on-surface-variant text-sm font-thai">${t("dash.cats.subtitle")}</p>
        </div>
        <button onclick="navigate('catalog')" class="text-sm font-bold text-emerald-forest hover:underline">${t("dash.cats.viewall")}</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${cats.map(c => `
        <div class="bg-white p-5 rounded-2xl hover:translate-y-[-2px] transition-transform cursor-pointer group" onclick="navigate('catalog',{cat:${c.id},status:'',search:''})">
          <div class="flex justify-between items-start mb-3">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center" style="background:${c.cl}15">
              <span class="material-symbols-outlined" style="color:${c.cl}">${c.ic}</span>
            </div>
            ${c.pct === 100 ? `<span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">${t("status.done")}</span>`
      : `<span class="text-xs font-bold text-on-surface-variant">${c.done} / ${c.total}</span>`}
          </div>
          <h3 class="font-headline font-bold text-on-surface mb-1 text-sm">${catName(c.id)}</h3>
          <p class="text-[11px] text-on-surface-variant mb-3 font-thai">${L === "en" && c.locEn ? c.locEn : c.loc}</p>
          <div class="space-y-1">
            <div class="flex justify-between text-[11px] font-bold">
              <span class="text-on-surface-variant">${t("dash.cats.progress")}</span>
              <span style="color:${c.cl}">${c.pct}%</span>
            </div>
            <div class="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700" style="width:${c.pct}%;background:${c.cl}"></div>
            </div>
          </div>
        </div>`).join("")}
      </div>
    </section>

    <!-- Lower Section -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <section class="lg:col-span-8 bg-white rounded-2xl p-6 space-y-5">
        <h2 class="text-lg font-headline font-extrabold text-on-surface">${t("dash.summary.title")}</h2>
        <div class="grid grid-cols-3 gap-4">
          <div class="bg-emerald-50 rounded-xl p-4 text-center cursor-pointer hover:scale-105 transition-transform" onclick="navigate('catalog',{status:'c',cat:0,search:''})">
            <span class="material-symbols-outlined text-emerald-forest text-3xl">check_circle</span>
            <div class="text-2xl font-headline font-black text-emerald-forest mt-1">${s.done}</div>
            <div class="text-[11px] text-on-surface-variant font-bold">${t("status.completed")}</div>
          </div>
          <div class="bg-amber-50 rounded-xl p-4 text-center cursor-pointer hover:scale-105 transition-transform" onclick="navigate('catalog',{status:'p',cat:0,search:''})">
            <span class="material-symbols-outlined text-amber-600 text-3xl">pending</span>
            <div class="text-2xl font-headline font-black text-amber-600 mt-1">${s.prog}</div>
            <div class="text-[11px] text-on-surface-variant font-bold">${t("status.in_progress")}</div>
          </div>
          <div class="bg-gray-50 rounded-xl p-4 text-center cursor-pointer hover:scale-105 transition-transform" onclick="navigate('catalog',{status:'w',cat:0,search:''})">
            <span class="material-symbols-outlined text-gray-500 text-3xl">schedule</span>
            <div class="text-2xl font-headline font-black text-gray-600 mt-1">${s.pend}</div>
            <div class="text-[11px] text-on-surface-variant font-bold">${t("status.pending")}</div>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead><tr class="text-left text-on-surface-variant text-xs border-b border-outline-variant/10">
              <th class="py-2 font-bold">${t("dash.summary.cat")}</th><th class="py-2 font-bold text-center">${t("dash.summary.completed")}</th><th class="py-2 font-bold text-center">${t("dash.summary.inprogress")}</th><th class="py-2 font-bold text-center">${t("dash.summary.waiting")}</th><th class="py-2 font-bold text-right">%</th>
            </tr></thead>
            <tbody>${cats.map(c => {
        const ci = getIndicators().filter(i => i.cat === c.id);
        const cd = ci.filter(i => i.status === "c").length;
        const cp = ci.filter(i => i.status === "p").length;
        const cw = ci.filter(i => i.status === "w").length;
        return `<tr class="border-b border-outline-variant/5 hover:bg-surface-container-low cursor-pointer" onclick="navigate('catalog',{cat:${c.id},status:'',search:''})">
                <td class="py-2.5 font-medium"><span class="material-symbols-outlined text-sm mr-1 align-middle" style="color:${c.cl}">${c.ic}</span>${catName(c.id)}</td>
                <td class="py-2.5 text-center text-emerald-700 font-bold">${cd}</td>
                <td class="py-2.5 text-center text-amber-600 font-bold">${cp}</td>
                <td class="py-2.5 text-center text-gray-500 font-bold">${cw}</td>
                <td class="py-2.5 text-right font-bold" style="color:${c.cl}">${c.pct}%</td>
              </tr>`;
      }).join("")}</tbody>
          </table>
        </div>
      </section>
      <section class="lg:col-span-4 space-y-4">
        <!-- Admin shortcut (visible only when unlocked) -->
        ${adminUnlocked ? `<button onclick="navigate('admin')" class="w-full flex items-center justify-between bg-emerald-50 border border-emerald-200/60 px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition-colors">
          <div class="flex items-center gap-2 text-xs font-bold text-emerald-700"><span class="material-symbols-outlined text-sm">admin_panel_settings</span>Admin Panel</div>
          <span class="material-symbols-outlined text-sm text-emerald-600">chevron_right</span>
        </button>` : ''}
        <!-- Submit -->
        <div class="bg-velvet text-white p-6 rounded-2xl relative overflow-hidden">
          <div class="relative z-10 space-y-3">
            <h3 class="text-xl font-headline font-extrabold tracking-tight">${t("dash.submit.title")}</h3>
            <p class="text-emerald-200 text-sm leading-relaxed font-thai">${t("dash.submit.desc")}</p>
            <button onclick="openSubmitModal()" class="w-full bg-white/90 text-primary font-bold py-3 rounded-xl hover:scale-105 transition-transform flex items-center justify-center space-x-2 text-sm">
              <span>${t("dash.submit.btn")}</span><span class="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
          <span class="material-symbols-outlined absolute -bottom-4 -right-4 text-7xl opacity-10 rotate-12">rocket_launch</span>
        </div>
        <!-- Portfolio Health -->
        <div class="bg-white p-6 rounded-2xl space-y-4">
          <h3 class="text-sm font-headline font-extrabold text-on-surface">${t("dash.health.title")}</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between"><div class="flex items-center space-x-2"><span class="material-symbols-outlined text-emerald-forest text-lg">check_circle</span><span class="text-sm">${t("dash.health.done")}</span></div><span class="text-sm font-bold">${s.done}</span></div>
            <div class="flex items-center justify-between"><div class="flex items-center space-x-2"><span class="material-symbols-outlined text-amber-500 text-lg">warning</span><span class="text-sm">${t("dash.health.evidence")}</span></div><span class="text-sm font-bold text-error">${s.pend}</span></div>
            <div class="flex items-center justify-between"><div class="flex items-center space-x-2"><span class="material-symbols-outlined text-on-surface-variant text-lg">schedule</span><span class="text-sm">${t("dash.health.deadline")}</span></div><span class="text-sm font-bold">2026</span></div>
          </div>
        </div>
      </section>
    </div>
  </div>`;
}

// === AUDIT VIEWER ===
function renderAudit() {
  const L = getLang();
  const items = getIndicators();
  const isAdmin = adminUnlocked;

  const completeItems = items.filter(i => i.status === 'c');
  const pendingItems = items.filter(i => i.status === 'w');
  const mismatchItems = items.filter(i => i.validationMatch === 'mismatch' || i.validationMatch === 'override_mismatch');

  return `<div data-view="audit" class="px-4 md:px-8 py-6 max-w-7xl w-full mx-auto space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:linear-gradient(135deg,#0A3D2A,#0D6B3F)">
          <span class="material-symbols-outlined text-white">fact_check</span>
        </div>
        <div>
          <h1 class="text-xl font-headline font-extrabold text-on-surface">${t('audit.title')}</h1>
          <p class="text-xs text-on-surface-variant shadow-none">${t('audit.subtitle')}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[10px] font-bold px-2 py-1 rounded-full ${L === 'en' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}">${L === 'en' ? t('audit.lang.en') : t('audit.lang.th')}</span>
        <button onclick="navigate('dashboard')" class="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant bg-white px-3 py-2 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors">
          <span class="material-symbols-outlined text-sm">arrow_back</span>${t("detail.breadcrumb.home")}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-200">
        <p class="text-3xl font-black text-emerald-600">${completeItems.length}</p>
        <p class="text-[10px] font-bold text-emerald-700 mt-1">${t('audit.evidence.available')}</p>
      </div>
      <div class="bg-gray-50 p-4 rounded-xl text-center border border-gray-200">
        <p class="text-3xl font-black text-gray-500">${pendingItems.length}</p>
        <p class="text-[10px] font-bold text-gray-600 mt-1">${t('audit.pending')}</p>
      </div>
      ${isAdmin ? `<div class="bg-red-50 p-4 rounded-xl text-center border border-red-200">
        <p class="text-3xl font-black text-error">${mismatchItems.length}</p>
        <p class="text-[10px] font-bold text-red-700 mt-1">${t('audit.mismatch')}</p>
      </div>` : `<div class="bg-blue-50 p-4 rounded-xl text-center border border-blue-200">
        <p class="text-3xl font-black text-river-blue">84</p>
        <p class="text-[10px] font-bold text-blue-700 mt-1">${t('audit.total')}</p>
      </div>`}
    </div>

    <div class="bg-white rounded-2xl overflow-hidden shadow-sm mt-6">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-outline-variant/10 bg-surface-container-low/50">
              <th class="text-left py-3 px-4 text-xs font-bold text-on-surface-variant w-12">#</th>
              <th class="text-left py-3 px-4 text-xs font-bold text-on-surface-variant min-w-[200px]">${t('audit.indicator')}</th>
              ${isAdmin ? `<th class="text-center py-3 px-4 text-xs font-bold text-on-surface-variant w-20">${t('audit.files')}</th>` : ''}
              ${isAdmin ? `<th class="text-left py-3 px-4 text-xs font-bold text-on-surface-variant hidden md:table-cell">${t('audit.evidence.sample')}</th>` : ''}
              <th class="text-center py-3 px-4 text-xs font-bold text-on-surface-variant w-24">${t('audit.status')}</th>
              <th class="text-center py-3 px-4 text-xs font-bold text-on-surface-variant w-28">${t('audit.evidence')}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/5">
            ${items.map(i => {
    const st = STATUS_MAP[i.status];
    // Public: simplified badge (has evidence / no evidence)
    // Admin: full validation details
    let valBadge = '';
    if (isAdmin) {
      if (i.validationMatch === 'mismatch') valBadge = `<span class="bg-red-100 text-error px-2 py-0.5 rounded text-[10px] font-bold">${t('audit.mismatch.label')} 🔴</span>`;
      else if (i.validationMatch === 'override_mismatch') valBadge = `<span class="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">${t('audit.override.label')} ⚠️</span>`;
      else if (i.filesCount === 0 || i.dataNotReady) valBadge = `<span class="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold">${t('audit.nodata')}</span>`;
      else valBadge = `<span class="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">${t('audit.verified')} ✓</span>`;
    } else {
      if (i.filesCount > 0 && !i.dataNotReady) valBadge = `<span class="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">✓</span>`;
      else if (i.dataNotReady) valBadge = `<span class="bg-gray-100 text-gray-400 px-2 py-0.5 rounded text-[10px] font-bold">—</span>`;
      else valBadge = `<span class="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold">✗</span>`;
    }

    // Admin-only: file list with links
    const fileListStr = isAdmin && (i.files && i.files.length > 0) ? i.files.slice(0, 2).map(f => `<a href="${f.link}" target="_blank" class="text-river-blue hover:underline text-[10px] inline-block truncate max-w-[120px] align-bottom" title="${f.name}">${f.name}</a>`).join('<br>') + (i.files.length > 2 ? '<br><span class="text-on-surface-variant/70 text-[9px]">...more</span>' : '') : '';

    return `<tr class="hover:bg-surface-container-low/40 transition-colors ${isAdmin && (i.validationMatch === 'mismatch' || i.validationMatch === 'override_mismatch') ? 'bg-red-50/30' : ''}">
                 <td class="py-3 px-4 font-bold text-xs">${i.id}</td>
                 <td class="py-3 px-4 cursor-pointer" onclick="navigate('detail',{id:${i.id}})">
                   <p class="font-medium text-xs text-on-surface">${i.title}</p>
                 </td>
                 ${isAdmin ? `<td class="py-3 px-4 text-center text-xs font-bold ${i.filesCount > 0 ? 'text-river-blue' : 'text-error'}">${i.filesCount !== null ? i.filesCount : '?'}</td>` : ''}
                 ${isAdmin ? `<td class="py-3 px-4 hidden md:table-cell text-[10px]">${fileListStr || '<span class="text-on-surface-variant/50 text-[10px]">—</span>'}</td>` : ''}
                 <td class="py-3 px-4 text-center"><span class="px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ${st.cls}">${st.label}</span></td>
                 <td class="py-3 px-4 text-center">${valBadge}</td>
               </tr>`;
  }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

// === STAFF MANUAL DOWNLOAD HELPERS ===
function downloadManualFile(type) {
  let content, filename, mime;
  const isEn = getLang() === 'en';

  if (type === 'doc') {
    filename = isEn ? 'Staff_Guide_84Indicators.doc' : 'คู่มือเจ้าหน้าที่_84ตัวชี้วัด.doc';
    mime = 'application/msword';
    content = `{\\rtf1\\ansi\\deff0\n{\\fonttbl{\\f0 Angsana New;}{\\f1 TH SarabunPSK;}}\n{\\colortbl ;\\red10\\green61\\blue42;}\n\\paperw12240\\paperh15840\\margl1800\\margr1800\\margt1440\\margb1440\n\\f1\\fs28\\b\\cf1 ${isEn ? 'Staff Guide — 84 Indicators Google Drive Upload' : 'คู่มือเจ้าหน้าที่ — การอัปโหลดไฟล์หลักฐาน 84 ตัวชี้วัด'}\\b0\\cf0\\par\n\\f1\\fs22\\par\n${isEn ? '1. Folder Structure Rules\\par\\tab- Root: หมวด 1-6 (Thai) / English Version (English)\\par\\tab- Level 2: Indicator folder (numbered)\\par\\tab- Level 3-5: Subfolders (any name)\\par\\par 2. English Version Usage\\par\\tab- Files for EN must go in English Version > Category > N_English folder\\par\\tab- Example: English Version / 1.Visitor Management / 1_English / file.pdf\\par\\par 3. Common Mistakes\\par\\tab- Do NOT upload EN files inside TH category folders\\par\\tab- Do NOT create duplicate indicator folders\\par\\tab- File names must not contain special characters' : '1. กฎโครงสร้างโฟลเดอร์\\par\\tab- Root: หมวด 1-6 (ภาษาไทย) / English Version (ภาษาอังกฤษ)\\par\\tab- ระดับ 2: โฟลเดอร์ตัวชี้วัด (ระบุหมายเลข)\\par\\tab- ระดับ 3-5: โฟลเดอร์ย่อย (ตั้งชื่อเอง)\\par\\par 2. การใช้ English Version\\par\\tab- ไฟล์ภาษาอังกฤษต้องอยู่ใน English Version > หมวด > N_English\\par\\tab- ตัวอย่าง: English Version / 1.Visitor Management / 1_English / file.pdf\\par\\par 3. ข้อผิดพลาดที่พบบ่อย\\par\\tab- อย่าอัปโหลดไฟล์ EN ไว้ในโฟลเดอร์หมวดภาษาไทย\\par\\tab- อย่าสร้างโฟลเดอร์ตัวชี้วัดซ้ำกัน\\par\\tab- ชื่อไฟล์ต้องไม่มีอักขระพิเศษ'}\\par\n}`;
  } else if (type === 'xls') {
    filename = isEn ? 'Evidence_Template_84Indicators.xls' : 'แบบฟอร์มหลักฐาน_84ตัวชี้วัด.xls';
    mime = 'application/vnd.ms-excel';
    content = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#0A3D2A" ss:Pattern="Solid"/></Style><Style ss:ID="s"><Font ss:Bold="1"/><Interior ss:Color="#E8F5E9" ss:Pattern="Solid"/></Style></Styles><Worksheet ss:Name="${isEn ? 'Evidence Template' : 'แบบฟอร์มหลักฐาน'}"><Table><Row><Cell ss:StyleID="h"><Data ss:Type="String">${isEn ? 'Indicator #' : 'ตัวชี้วัดข้อที่'}</Data></Cell><Cell ss:StyleID="h"><Data ss:Type="String">${isEn ? 'Category' : 'หมวด'}</Data></Cell><Cell ss:StyleID="h"><Data ss:Type="String">${isEn ? 'Indicator Name' : 'ชื่อตัวชี้วัด'}</Data></Cell><Cell ss:StyleID="h"><Data ss:Type="String">${isEn ? 'Drive Folder Name' : 'ชื่อโฟลเดอร์ Drive'}</Data></Cell><Cell ss:StyleID="h"><Data ss:Type="String">${isEn ? 'File Count (TH)' : 'จำนวนไฟล์ (ไทย)'}</Data></Cell><Cell ss:StyleID="h"><Data ss:Type="String">${isEn ? 'File Count (EN)' : 'จำนวนไฟล์ (อังกฤษ)'}</Data></Cell><Cell ss:StyleID="h"><Data ss:Type="String">${isEn ? 'Status' : 'สถานะ'}</Data></Cell><Cell ss:StyleID="h"><Data ss:Type="String">${isEn ? 'Responsible Agency' : 'หน่วยงานรับผิดชอบ'}</Data></Cell><Cell ss:StyleID="h"><Data ss:Type="String">${isEn ? 'Notes' : 'หมายเหตุ'}</Data></Cell></Row>${D.slice(0, 84).map(d => `<Row><Cell><Data ss:Type="Number">${d[0]}</Data></Cell><Cell><Data ss:Type="Number">${d[1]}</Data></Cell><Cell><Data ss:Type="String">${(d[3] || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell><Cell><Data ss:Type="String"></Data></Cell><Cell><Data ss:Type="Number">0</Data></Cell><Cell><Data ss:Type="Number">0</Data></Cell><Cell><Data ss:Type="String">${d[6] === 'c' ? (isEn ? 'Completed' : 'ดำเนินการแล้ว') : d[6] === 'p' ? (isEn ? 'In Progress' : 'กำลังดำเนินการ') : (isEn ? 'Pending' : 'รอดำเนินการ')}</Data></Cell><Cell><Data ss:Type="String">${(d[5] || '').replace(/\|/g, ', ').replace(/&/g, '&amp;')}</Data></Cell><Cell><Data ss:Type="String"></Data></Cell></Row>`).join('')}</Table></Worksheet></Workbook>`;
  } else if (type === 'pdf') {
    filename = isEn ? 'Staff_Guide_84Indicators.pdf' : 'คู่มือเจ้าหน้าที่_84ตัวชี้วัด.pdf';
    mime = 'application/pdf';
    const title = isEn ? 'Staff Guide - 84 Indicators' : 'คู่มือเจ้าหน้าที่ 84 ตัวชี้วัด';
    const lines = isEn
      ? ['Staff Guide — 84 Indicators Google Drive Upload System', '', '1. Folder Structure Rules', '   Root Level: หมวด 1-6 (Thai folders) | English Version (EN folder)', '   Level 2: Indicator folder (e.g. 1ผู้ประสานงาน or 1_English)', '   Level 3-5: Subfolders with any name (max depth = 3)', '', '2. English Version Upload', '   - Files must be placed inside: English Version > Category > N_English', '   - Example: English Version / 1.Visitor Management / 1_English / evidence.pdf', '   - Do NOT mix EN files with TH category folders', '', '3. File Naming Rules', '   - Avoid special characters in filenames', '   - Use descriptive names: e.g. GSTC_Report_2026.pdf', '   - Supported: PDF, DOCX, XLSX, JPG, PNG', '', '4. Common Mistakes to Avoid', '   - Uploading EN evidence in TH category folders', '   - Creating duplicate indicator folders', '   - Leaving subfolder empty without files', '   - Wrong folder depth (max 3 levels from indicator)', '', '5. Sync Schedule', '   - System auto-syncs every 5 minutes', '   - Manual sync: Admin Panel > Refresh button', '   - Cache clears automatically on language switch']
      : ['คู่มือเจ้าหน้าที่ — ระบบอัปโหลดไฟล์หลักฐาน 84 ตัวชี้วัด', '', '1. กฎโครงสร้างโฟลเดอร์', '   ระดับ Root: หมวด 1-6 (โฟลเดอร์ภาษาไทย) | English Version (โฟลเดอร์อังกฤษ)', '   ระดับ 2: โฟลเดอร์ตัวชี้วัด (เช่น 1ผู้ประสานงาน หรือ 1_English)', '   ระดับ 3-5: โฟลเดอร์ย่อย ตั้งชื่อเองได้ (ความลึกสูงสุด = 3 ชั้น)', '', '2. การอัปโหลดเวอร์ชันภาษาอังกฤษ', '   - ไฟล์ต้องอยู่ใน: English Version > หมวด > N_English', '   - ตัวอย่าง: English Version / 1.Visitor Management / 1_English / evidence.pdf', '   - ห้ามวางไฟล์ EN ไว้ในโฟลเดอร์หมวดภาษาไทย', '', '3. กฎการตั้งชื่อไฟล์', '   - หลีกเลี่ยงอักขระพิเศษในชื่อไฟล์', '   - ใช้ชื่อที่สื่อความหมาย เช่น รายงาน_GSTC_2569.pdf', '   - รองรับ: PDF, DOCX, XLSX, JPG, PNG', '', '4. ข้อผิดพลาดที่พบบ่อย', '   - อัปโหลดหลักฐาน EN ไว้ในโฟลเดอร์หมวดภาษาไทย', '   - สร้างโฟลเดอร์ตัวชี้วัดซ้ำ', '   - ทิ้งโฟลเดอร์ย่อยไว้โดยไม่มีไฟล์', '   - ความลึกโฟลเดอร์เกิน 3 ชั้น', '', '5. รอบการซิงค์ข้อมูล', '   - ระบบซิงค์อัตโนมัติทุก 5 นาที', '   - ซิงค์ด้วยตนเอง: Admin Panel > ปุ่ม Refresh', '   - แคชล้างอัตโนมัติเมื่อเปลี่ยนภาษา'];
    content = `%PDF-1.4\n1 0 obj<</Type /Catalog /Pages 2 0 R>>endobj\n2 0 obj<</Type /Pages /Kids[3 0 R] /Count 1>>endobj\n3 0 obj<</Type /Page /Parent 2 0 R /MediaBox[0 0 595 842] /Contents 4 0 R /Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length ${lines.length * 20 + 200}>>stream\nBT /F1 14 Tf 50 800 Td (${title.replace(/[()\\]/g, '\\$&')}) Tj\n/F1 10 Tf\n${lines.map((l, i) => `0 -${i === 0 ? 0 : 18} Td (${l.replace(/[()\\]/g, '\\$&').replace(/[^\x20-\x7E]/g, '?')}) Tj`).join('\n')}\nET\nendstream\nendobj\n5 0 obj<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>endobj\nxref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000266 00000 n\n0000000560 00000 n\ntrailer<</Size 6 /Root 1 0 R>>\nstartxref\n641\n%%EOF`;
  }

  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast(`⬇ ${t('manual.download.started')}: ${filename}`);
}

// === STAFF MANUAL VIEW ===
function renderManual() {
  const L = getLang();
  const sections = [
    {
      icon: 'upload_file',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      title: t('manual.section.upload.title'),
      steps: [
        t('manual.step.upload.1'),
        t('manual.step.upload.2'),
        t('manual.step.upload.3'),
        t('manual.step.upload.4'),
      ]
    },
    {
      icon: 'folder_open',
      color: 'text-river-blue',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      title: t('manual.section.structure.title'),
      steps: [
        t('manual.step.struct.1'),
        t('manual.step.struct.2'),
        t('manual.step.struct.3'),
        t('manual.step.struct.4'),
      ]
    },
    {
      icon: 'translate',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      title: t('manual.section.english.title'),
      steps: [
        t('manual.step.en.1'),
        t('manual.step.en.2'),
        t('manual.step.en.3'),
      ]
    },
    {
      icon: 'account_tree',
      color: 'text-deep-teak',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      title: t('manual.section.subfolder.title'),
      steps: [
        t('manual.step.sub.1'),
        t('manual.step.sub.2'),
        t('manual.step.sub.3'),
      ]
    },
    {
      icon: 'warning',
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      title: t('manual.section.mistakes.title'),
      steps: [
        t('manual.step.mistake.1'),
        t('manual.step.mistake.2'),
        t('manual.step.mistake.3'),
        t('manual.step.mistake.4'),
      ]
    }
  ];

  return `<div data-view="manual" class="px-4 md:px-8 py-6 max-w-4xl w-full mx-auto space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-2xl p-6 md:p-8 space-y-2">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center" style="background:linear-gradient(135deg,#0A3D2A,#0D6B3F)">
          <span class="material-symbols-outlined text-white text-2xl">menu_book</span>
        </div>
        <div>
          <h1 class="text-2xl font-headline font-extrabold text-on-surface">${t('manual.title')}</h1>
          <p class="text-xs text-on-surface-variant">${t('manual.subtitle')}</p>
        </div>
      </div>
    </div>

    <!-- Download Section -->
    <div class="bg-white rounded-2xl p-6 space-y-4">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-deep-teak">download</span>
        <h2 class="font-headline font-bold text-on-surface">${t('manual.download.title')}</h2>
      </div>
      <p class="text-xs text-on-surface-variant">${t('manual.download.desc')}</p>
      <div class="flex flex-wrap gap-3">
        <button onclick="downloadManualFile('pdf')" class="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]" style="background:linear-gradient(135deg,#dc2626,#b91c1c)">
          <span class="material-symbols-outlined text-base">picture_as_pdf</span>
          ${t('manual.download.pdf')}
        </button>
        <button onclick="downloadManualFile('doc')" class="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]" style="background:linear-gradient(135deg,#1d4ed8,#1e40af)">
          <span class="material-symbols-outlined text-base">description</span>
          ${t('manual.download.doc')}
        </button>
        <button onclick="downloadManualFile('xls')" class="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]" style="background:linear-gradient(135deg,#15803d,#166534)">
          <span class="material-symbols-outlined text-base">table_chart</span>
          ${t('manual.download.xls')}
        </button>
      </div>
      <div class="flex flex-wrap gap-2 mt-2">
        <span class="flex items-center gap-1 text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100"><span class="material-symbols-outlined" style="font-size:11px">picture_as_pdf</span> PDF — ${t('manual.file.pdf.desc')}</span>
        <span class="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100"><span class="material-symbols-outlined" style="font-size:11px">description</span> DOC — ${t('manual.file.doc.desc')}</span>
        <span class="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100"><span class="material-symbols-outlined" style="font-size:11px">table_chart</span> XLS — ${t('manual.file.xls.desc')}</span>
      </div>
    </div>

    <!-- Guide Sections -->
    ${sections.map((s, idx) => `
    <div class="bg-white rounded-2xl p-6 space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center border ${s.border}">
          <span class="material-symbols-outlined ${s.color} text-lg">${s.icon}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style="background:#0A3D2A">${idx + 1}</span>
          <h2 class="font-headline font-bold text-on-surface">${s.title}</h2>
        </div>
      </div>
      <div class="space-y-2 pl-12">
        ${s.steps.map(step => `
          <div class="flex items-start gap-2.5">
            <span class="material-symbols-outlined ${s.color} mt-0.5 flex-shrink-0" style="font-size:14px">chevron_right</span>
            <p class="text-sm text-on-surface-variant font-thai leading-relaxed">${step}</p>
          </div>`).join('')}
      </div>
    </div>`).join('')}

    <!-- Drive Structure Quick Reference -->
    <div class="bg-white rounded-2xl p-6 space-y-4">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-on-surface-variant">schema</span>
        <h2 class="font-headline font-bold text-on-surface">${t('manual.section.structure.ref')}</h2>
      </div>
      <div class="font-mono text-[11px] bg-gray-50 rounded-xl p-4 space-y-1 border border-outline-variant/20 overflow-x-auto">
        <div class="text-emerald-700 font-bold">Root (16SyUIAG…)</div>
        <div class="pl-4 text-on-surface">├── หมวด 1 การจัดการแหล่งท่องเที่ยว/</div>
        <div class="pl-8 text-on-surface-variant">├── 1ผู้ประสานงาน/</div>
        <div class="pl-12 text-on-surface-variant/70">│   └── รูปภาพ/ → ภาพ ปี 66/ → ไฟล์</div>
        <div class="pl-4 text-on-surface">├── หมวด 3, 4, 6 …</div>
        <div class="pl-4 text-indigo-700 font-bold">└── English Version/ (1hNi__LP…)</div>
        <div class="pl-8 text-indigo-600">├── 1.Visitor Management/</div>
        <div class="pl-12 text-indigo-500">│   ├── 1_English/ → files</div>
        <div class="pl-12 text-indigo-500">│   └── 2_English/ → files</div>
        <div class="pl-8 text-indigo-600">└── 3.Water management/</div>
        <div class="pl-12 text-indigo-500">    └── 29_English/ → files</div>
      </div>
    </div>
  </div>`;
}

// === ADMIN VIEW ===
function renderAdmin() {
  const L = getLang();
  const q = (typeof driveQuota !== "undefined") ? driveQuota.getStats() : null;
  const mapping = typeof loadMapping === "function" ? loadMapping() : {};
  const syncState = typeof loadSyncState === "function" ? loadSyncState() : {};
  const mappedCount = Object.keys(mapping).filter(k => mapping[k] && mapping[k].folderId).length;
  const lockedCount = Object.keys(mapping).filter(k => mapping[k] && mapping[k].locked).length;
  const enVersionCount = Object.keys(mapping).filter(k => mapping[k] && mapping[k].hasEnglishVersion).length;
  const s = totalStats();
  const lastSync = syncState._lastFullSync ? new Date(syncState._lastFullSync).toLocaleString(L === "en" ? "en-US" : "th-TH") : "—";
  const syncErrors = syncState._errors || [];

  // Validation summary from sync state
  let valOk = 0, valWarn = 0, valErr = 0;
  for (let i = 1; i <= 84; i++) {
    const se = syncState[i];
    if (!se) { valErr++; continue; }
    if (se.validationStatus === "ok") valOk++;
    else if (se.validationStatus === "warning") valWarn++;
    else valErr++;
  }
  // Status mismatch count (current vs auto-calculated)
  const allItems = getIndicators();
  const statusMismatchCount = allItems.filter(x => x.validationMatch === 'mismatch' || x.validationMatch === 'override_mismatch').length;
  const missingEnCount = allItems.filter(x => !x.hasEnglishVersion && x.filesCount > 0).length;

  return `<div data-view="admin" class="px-4 md:px-8 py-6 max-w-6xl w-full mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:linear-gradient(135deg,#0A3D2A,#0D6B3F)">
          <span class="material-symbols-outlined text-white">admin_panel_settings</span>
        </div>
        <div>
          <h1 class="text-xl font-headline font-extrabold text-on-surface">Admin Panel</h1>
          <p class="text-xs text-on-surface-variant">${t("admin.subtitle")}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="navigate('dashboard')" class="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant bg-white px-3 py-2 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors">
          <span class="material-symbols-outlined text-sm">arrow_back</span>${t('admin.back')}
        </button>
        <button onclick="lockAdmin()" class="flex items-center gap-1.5 text-xs font-bold text-error bg-red-50 px-3 py-2 rounded-xl border border-red-100 hover:bg-red-100 transition-colors">
          <span class="material-symbols-outlined text-sm">lock</span>${t('admin.lock.btn')}
        </button>
      </div>
    </div>

    <!-- Drive Status + Integrity Overview -->
    <div class="bg-white rounded-2xl p-6 space-y-4">
      <div class="flex items-center gap-2 mb-1">
        <span class="material-symbols-outlined text-river-blue">cloud_sync</span>
        <h2 class="font-headline font-bold text-on-surface">${t("admin.drive.title")}</h2>
        <span class="ml-auto">${driveStatusHTML()}</span>
      </div>
      <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
        <div class="bg-emerald-50 rounded-xl p-3 text-center">
          <div class="text-xl font-headline font-black text-emerald-700">${mappedCount}</div>
          <div class="text-[10px] font-bold text-emerald-600 mt-0.5">${t("admin.mapped")}</div>
        </div>
        <div class="bg-blue-50 rounded-xl p-3 text-center">
          <div class="text-xl font-headline font-black text-river-blue">${lockedCount}</div>
          <div class="text-[10px] font-bold text-river-blue mt-0.5">${t("admin.locked")}</div>
        </div>
        <div class="bg-indigo-50 rounded-xl p-3 text-center">
          <div class="text-xl font-headline font-black text-indigo-600">${enVersionCount}</div>
          <div class="text-[10px] font-bold text-indigo-600 mt-0.5">EN Version</div>
        </div>
        <div class="bg-emerald-50 rounded-xl p-3 text-center">
          <div class="text-xl font-headline font-black text-emerald-600">${valOk}</div>
          <div class="text-[10px] font-bold text-emerald-600 mt-0.5">${t("data.integrity.ok")}</div>
        </div>
        <div class="bg-amber-50 rounded-xl p-3 text-center">
          <div class="text-xl font-headline font-black text-amber-600">${valWarn}</div>
          <div class="text-[10px] font-bold text-amber-600 mt-0.5">${t("data.integrity.warning")}</div>
        </div>
        <div class="bg-red-50 rounded-xl p-3 text-center">
          <div class="text-xl font-headline font-black text-red-600">${valErr}</div>
          <div class="text-[10px] font-bold text-red-600 mt-0.5">${t("data.integrity.error")}</div>
        </div>
      </div>
      ${statusMismatchCount > 0 || missingEnCount > 0 ? `<div class="flex flex-wrap gap-2 mt-2">
        ${statusMismatchCount > 0 ? `<div class="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
          <span class="material-symbols-outlined text-red-500" style="font-size:14px">error</span>
          <span class="text-[10px] font-bold text-red-700">${statusMismatchCount} ${t('admin.mismatch.alert')}</span>
        </div>` : ''}
        ${missingEnCount > 0 ? `<div class="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
          <span class="material-symbols-outlined text-amber-500" style="font-size:14px">translate</span>
          <span class="text-[10px] font-bold text-amber-700">${missingEnCount} ${t('admin.missing.en')}</span>
        </div>` : ''}
      </div>` : ''}
      <div class="flex items-center gap-2 text-[10px] text-on-surface-variant">
        <span class="material-symbols-outlined" style="font-size:14px">schedule</span>
        ${t("sync.lastSynced")}: ${lastSync}
      </div>
      <div class="flex gap-2 flex-wrap">
        <button id="refreshBtn" onclick="refreshDriveData()" class="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200">
          <span class="material-symbols-outlined text-sm">refresh</span>${t("refresh.btn")}
        </button>
        <button onclick="adminAutoDiscover()" class="flex items-center gap-1.5 text-xs font-bold text-river-blue bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200">
          <span class="material-symbols-outlined text-sm">manage_search</span>${t("admin.autoDiscover")}
        </button>
        <button onclick="adminLockAll()" class="flex items-center gap-1.5 text-xs font-bold text-deep-teak bg-amber-50 px-4 py-2 rounded-xl hover:bg-amber-100 transition-colors border border-amber-200">
          <span class="material-symbols-outlined text-sm">lock</span>${t("admin.lockAll")}
        </button>
        <button onclick="exportMappingManifest()" class="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant bg-gray-50 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200">
          <span class="material-symbols-outlined text-sm">download</span>${t("admin.exportMapping")}
        </button>
        <label class="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant bg-gray-50 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer">
          <span class="material-symbols-outlined text-sm">upload</span>${t("admin.importMapping")}
          <input type="file" accept=".json" class="hidden" onchange="adminImportMapping(this)">
        </label>
      </div>
    </div>

    <!-- API Quota Meter -->
    <div class="bg-white rounded-2xl p-6 space-y-4" id="quota-card">
      ${renderQuotaCard()}
    </div>

    <!-- Mapping Change Alert -->
    <div id="mapping-change-alert"></div>

    <!-- Data Integrity Debug Table -->
    <div class="bg-white rounded-2xl p-6 space-y-4">
      <div class="flex items-center gap-2 mb-1">
        <span class="material-symbols-outlined text-deep-teak">bug_report</span>
        <h2 class="font-headline font-bold text-on-surface">${t("admin.debug.title")}</h2>
        <span class="ml-auto text-[10px] text-on-surface-variant">${t("admin.debug.subtitle")}</span>
        <span class="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 ml-2">EN Folder ID = ${Object.keys(mapping).filter(k => mapping[k] && mapping[k].enFolderId).length}/${Object.keys(mapping).filter(k => mapping[k] && mapping[k].folderId).length} mapped</span>
      </div>
      <div class="overflow-x-auto -mx-6 px-6">
        <table class="w-full text-[11px] border-collapse">
          <thead>
            <tr class="border-b-2 border-outline-variant/20 text-left">
              <th class="py-2 px-2 font-bold text-on-surface-variant">#</th>
              <th class="py-2 px-2 font-bold text-on-surface-variant">${t('admin.indicator')}</th>
              <th class="py-2 px-2 font-bold text-on-surface-variant">TH Folder ID</th>
              <th class="py-2 px-2 font-bold text-on-surface-variant text-indigo-700">EN Folder ID</th>
              <th class="py-2 px-2 font-bold text-on-surface-variant text-center">TH Files</th>
              <th class="py-2 px-2 font-bold text-on-surface-variant text-center">EN Files</th>
              <th class="py-2 px-2 font-bold text-on-surface-variant">${t('admin.subfolders')}</th>
              <th class="py-2 px-2 font-bold text-on-surface-variant text-center">${t('admin.depth')}</th>
              <th class="py-2 px-2 font-bold text-on-surface-variant text-center">${t('admin.status.header')}</th>
              <th class="py-2 px-2 font-bold text-on-surface-variant text-center">${t("admin.debug.validation")}</th>
              <th class="py-2 px-2 font-bold text-on-surface-variant">${t("sync.lastSynced")}</th>
              <th class="py-2 px-2 font-bold text-on-surface-variant text-center">${t('admin.debug.resync')}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/5">
            ${renderAdminDebugRows(mapping, syncState, L)}
          </tbody>
        </table>
      </div>
    </div>

    ${syncErrors.length > 0 ? `
    <!-- Sync Error Log -->
    <div class="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-3">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-red-600">error_outline</span>
        <h3 class="text-sm font-headline font-extrabold text-red-800">${t("admin.debug.errorLog")} (${syncErrors.length})</h3>
      </div>
      <div class="space-y-1 max-h-48 overflow-y-auto">
        ${syncErrors.map(e => `<div class="text-[10px] text-red-700 font-mono bg-white/50 px-3 py-1.5 rounded-lg">
          <span class="font-bold">#${e.indicatorId || "?"}</span> ${e.lang ? `[${e.lang.toUpperCase()}]` : ""} ${e.message}
        </div>`).join("")}
      </div>
    </div>` : ""}
  </div>`;
}

// === ADMIN DEBUG TABLE ROWS ===
function renderAdminDebugRows(mapping, syncState, L) {
  let rows = "";
  for (let i = 1; i <= 84; i++) {
    const m = mapping[i] || {};
    const se = syncState[i] || {};
    const cat = CATS.find(c => c.id === (m.cat || (D[i - 1] ? D[i - 1][1] : 0)));
    const indicator = D[i - 1];
    const title = indicator ? (indicator[3] || "").substring(0, 25) : "—";

    const fId = m.folderId ? `<span title="${m.folderId}" class="cursor-help">${m.folderId.substring(0, 12)}…</span>` : "—";
    const enFId = m.enFolderId ? `<span title="${m.enFolderId}" class="cursor-help text-indigo-600">${m.enFolderId.substring(0, 12)}…</span>` : '<span class="text-gray-300">—</span>';
    const thFiles = se.thFileCount !== undefined ? se.thFileCount : "—";
    const enFiles = se.enFileCount !== undefined ? se.enFileCount : "—";
    const hasEn = se.hasEnglishVersion || m.hasEnglishVersion || !!m.enFolderId;
    const depth = se.thDepth !== undefined ? se.thDepth : "—";
    const vStatus = se.validationStatus || (m.folderId ? "unknown" : "error");
    const lastSync = se.lastSyncedAt ? new Date(se.lastSyncedAt).toLocaleTimeString(L === "en" ? "en-US" : "th-TH", { hour: "2-digit", minute: "2-digit" }) : "—";
    const isLocked = !!m.locked;

    // Subfolder info
    const subfolderNames = se.subfolderNames || [];
    const subfolderFileCount = se.subfolderFileCount || {};
    const subfolderDisplay = subfolderNames.length > 0
      ? subfolderNames.map(n => `<span class="inline-block bg-gray-100 text-gray-600 px-1 py-0.5 rounded text-[9px] mr-0.5 mb-0.5" title="${n}: ${subfolderFileCount[n] || 0} files">${n.substring(0, 15)}${n.length > 15 ? "…" : ""} (${subfolderFileCount[n] || 0})</span>`).join("")
      : '<span class="text-gray-400">—</span>';

    // Auto-status calculation for mismatch detection
    const curL = typeof getLang === "function" ? getLang() : "th";
    const langFileCount = curL === "en" ? (se.enFileCount || 0) : (se.thFileCount || 0);
    const autoSt = langFileCount > 0 ? "c" : "w";
    const indicatorItem = getIndicators().find(x => x.id === i);
    const currentSt = indicatorItem ? indicatorItem.status : (indicator ? indicator[6] : "w");
    const isOverridden = indicatorItem ? indicatorItem.statusOverridden : false;
    const statusMismatch = currentSt !== autoSt;
    const stLabels = { c: "✓", p: "◑", w: "○" };

    const vIcon = vStatus === "ok" ? "verified" : vStatus === "warning" ? "warning" : vStatus === "error" ? "error" : "help";
    const vColor = vStatus === "ok" ? "text-emerald-600" : vStatus === "warning" ? "text-amber-500" : vStatus === "error" ? "text-red-500" : "text-gray-400";
    const vBg = vStatus === "ok" ? "bg-emerald-50" : vStatus === "warning" ? "bg-amber-50" : vStatus === "error" ? "bg-red-50" : "bg-gray-50";
    const rowBg = statusMismatch ? "bg-red-50/30" : vStatus === "error" ? "bg-red-50/20" : "";

    rows += `<tr class="${rowBg} hover:bg-surface-container-low/30 transition-colors">
      <td class="py-1.5 px-2"><span class="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold" style="background:${cat ? cat.cl : "#888"}">${i}</span></td>
      <td class="py-1.5 px-2 max-w-[120px]"><span class="truncate block" title="${title}">${title}</span></td>
      <td class="py-1.5 px-2 font-mono text-[10px] ${m.folderId ? 'text-on-surface' : 'text-red-400'}">${fId}</td>
      <td class="py-1.5 px-2 font-mono text-[10px]">${enFId}</td>
      <td class="py-1.5 px-2 text-center font-bold ${thFiles > 0 ? 'text-river-blue' : 'text-red-400'}">${thFiles}</td>
      <td class="py-1.5 px-2 text-center font-bold ${enFiles > 0 ? 'text-indigo-600' : hasEn ? 'text-amber-400' : 'text-gray-300'}">${enFiles}${hasEn ? ' <span class="text-[8px] text-indigo-400">EN</span>' : ''}</td>
      <td class="py-1.5 px-2 max-w-[180px]"><div class="flex flex-wrap">${subfolderDisplay}</div></td>
      <td class="py-1.5 px-2 text-center text-on-surface-variant">${depth}</td>
      <td class="py-1.5 px-2 text-center">
        <span class="inline-flex items-center gap-0.5 ${statusMismatch ? "text-red-600 bg-red-50" : "text-on-surface bg-gray-50"} px-1.5 py-0.5 rounded-full" title="${statusMismatch ? "Mismatch: current=" + currentSt + " auto=" + autoSt : "OK"}">
          <span class="text-[9px] font-bold">${stLabels[currentSt] || "?"}→${stLabels[autoSt] || "?"}</span>
          ${isOverridden ? '<span class="text-[8px] text-amber-500">⚑</span>' : ''}
          ${statusMismatch ? '<span class="material-symbols-outlined text-red-500" style="font-size:10px">error</span>' : ''}
        </span>
      </td>
      <td class="py-1.5 px-2 text-center"><span class="inline-flex items-center gap-0.5 ${vColor} ${vBg} px-1.5 py-0.5 rounded-full" title="${(se.validationIssues || []).join('; ')}"><span class="material-symbols-outlined" style="font-size:11px">${vIcon}</span></span></td>
      <td class="py-1.5 px-2 text-on-surface-variant">${lastSync}</td>
      <td class="py-1.5 px-2 text-center"><button onclick="refreshSingleIndicator(${i})" title="Force resync indicator ${i}" class="w-5 h-5 rounded flex items-center justify-center hover:bg-surface-container-low transition-colors"><span class="material-symbols-outlined text-on-surface-variant hover:text-emerald-600" style="font-size:12px">refresh</span></button></td>
    </tr>`;
  }
  return rows;
}

// === ADMIN ACTION FUNCTIONS ===
async function adminAutoDiscover() {
  if (!driveReady) { showToast(t('drive.not.connected')); return; }
  showToast(t('drive.scanning'));
  try {
    const discovery = await autoDiscoverMapping();
    window._pendingMappingChanges = discovery;
    if (discovery.changes.length > 0 || discovery.newFolders.length > 0 || discovery.missingFolders.length > 0) {
      renderMappingChangeAlert(discovery);
    } else {
      // No changes — just lock what we found
      lockMapping(discovery.mapping);
      showToast(`${t('audit.verified')}: ${Object.keys(discovery.mapping).length} ${t('audit.indicator')}`);
    }
    render();
  } catch (e) {
    showToast("Error: " + e.message);
  }
}

function adminLockAll() {
  const mapping = typeof loadMapping === "function" ? loadMapping() : {};
  if (Object.keys(mapping).length === 0) {
    showToast(t('drive.no.mapping'));
    return;
  }
  lockMapping(mapping);
  showToast(`${t('admin.lock.header')} ${Object.keys(mapping).length} mappings`);
  render();
}

function adminImportMapping(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const result = importMappingManifest(e.target.result);
    if (result.ok) {
      showToast(`Import: ${result.count} mappings`);
      render();
    } else {
      showToast("Import error: " + result.error);
    }
  };
  reader.readAsText(file);
}

// === MAPPING CHANGE ALERT ===
function renderMappingChangeAlert(discovery) {
  const el = document.getElementById("mapping-change-alert");
  if (!el) return;
  const L = getLang();
  const { changes, newFolders, missingFolders } = discovery;

  let html = `<div class="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 space-y-4">
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined text-amber-600 text-xl">warning</span>
      <h3 class="text-sm font-headline font-extrabold text-amber-800">${t("mapping.alert.title")}</h3>
    </div>`;

  if (changes.length > 0) {
    html += `<div class="space-y-1">
      <p class="text-xs font-bold text-amber-800">${t("mapping.alert.changed")} (${changes.length}):</p>
      ${changes.map(c => `<div class="text-[10px] bg-white/60 rounded-lg px-3 py-1.5 flex items-center gap-2">
        <span class="font-bold text-amber-700">#${c.indicatorId}</span>
        <span class="text-on-surface-variant">[${c.field.toUpperCase()}]</span>
        <span class="font-mono text-red-500 line-through">${(c.oldValue || "").substring(0, 10)}…</span>
        <span class="material-symbols-outlined text-[10px]">arrow_forward</span>
        <span class="font-mono text-emerald-600">${(c.newValue || "").substring(0, 10)}…</span>
      </div>`).join("")}
    </div>`;
  }

  if (newFolders.length > 0) {
    html += `<p class="text-xs text-emerald-700"><span class="font-bold">${t('admin.new.found')}:</span> ${newFolders.map(f => `#${f.indicatorId}`).join(", ")}</p>`;
  }

  if (missingFolders.length > 0) {
    html += `<p class="text-xs text-red-700"><span class="font-bold">${t('admin.missing.folder')}:</span> ${missingFolders.map(f => `#${f.indicatorId}`).join(", ")}</p>`;
  }

  html += `<div class="flex gap-2">
    <button onclick="adminApplyChanges()" class="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors">
      <span class="material-symbols-outlined text-sm">check</span>${t("mapping.alert.apply")}
    </button>
    <button onclick="document.getElementById('mapping-change-alert').innerHTML=''" class="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant bg-white px-4 py-2 rounded-xl border border-outline-variant/20 hover:bg-gray-50 transition-colors">
      <span class="material-symbols-outlined text-sm">close</span>${t('admin.dismiss')}
    </button>
  </div></div>`;

  el.innerHTML = html;
}

function adminApplyChanges() {
  if (!window._pendingMappingChanges) return;
  lockMapping(window._pendingMappingChanges.mapping);
  window._pendingMappingChanges = null;
  document.getElementById("mapping-change-alert").innerHTML = "";
  showToast(t('drive.mapping.applied'));
  render();
}

// === SUBMIT MODAL ===
function openSubmitModal() {
  const s = totalStats();
  const L = getLang();
  const pct = s.pct;
  const ready = s.done >= Math.floor(s.total * 0.8);
  let el = document.getElementById("submitModal");
  if (!el) {
    el = document.createElement("div");
    el.id = "submitModal";
    document.body.appendChild(el);
  }
  el.className = "fixed inset-0 z-[100] flex items-center justify-center p-4";
  el.innerHTML = `
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="closeSubmitModal()"></div>
    <div class="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
      <!-- Header -->
      <div class="p-6 pb-4" style="background:linear-gradient(135deg,#0A3D2A,#0D6B3F)">
        <div class="flex items-center justify-between mb-3">
          <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style="background:rgba(200,149,46,0.25);color:#f1c048">2026 TOP100 CYCLE</span>
          <button onclick="closeSubmitModal()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/70"><span class="material-symbols-outlined text-lg">close</span></button>
        </div>
        <h2 class="text-2xl font-headline font-extrabold text-white">${t('submit.title')}</h2>
        <p class="text-white/70 text-sm mt-1 font-thai">${t('submit.subtitle')}</p>
      </div>
      <!-- Progress -->
      <div class="px-6 py-5 space-y-4">
        <div class="flex items-center gap-4 p-4 rounded-2xl ${ready ? 'bg-emerald-50' : 'bg-amber-50'}">
          <span class="material-symbols-outlined text-3xl ${ready ? 'text-emerald-600' : 'text-amber-500'}">${ready ? 'check_circle' : 'warning'}</span>
          <div>
            <p class="text-sm font-bold ${ready ? 'text-emerald-800' : 'text-amber-800'}">${ready ? t('submit.ready') : t('submit.not_ready')}</p>
            <p class="text-xs ${ready ? 'text-emerald-600' : 'text-amber-600'} font-thai">${s.done} / ${s.total} ${t('submit.indicators.completed')} — ${pct}%</p>
          </div>
        </div>
        <div class="space-y-2 text-sm text-on-surface-variant font-thai">
          <div class="flex items-start gap-2"><span class="material-symbols-outlined text-base text-emerald-500 mt-0.5">info</span><p>${t('submit.info')}</p></div>
          <div class="flex items-start gap-2"><span class="material-symbols-outlined text-base text-amber-500 mt-0.5">schedule</span><p>${t('submit.deadline')}: <strong>2026</strong></p></div>
        </div>
        <!-- Step-by-step workflow -->
        <details class="group rounded-xl border border-outline-variant/20 overflow-hidden">
          <summary class="flex items-center gap-2 px-4 py-2.5 cursor-pointer hover:bg-surface-container-low transition-colors text-xs font-bold text-on-surface">
            <span class="material-symbols-outlined text-sm text-river-blue">help</span>
            ${t('submit.workflow.title')}
            <span class="material-symbols-outlined text-sm ml-auto group-open:rotate-180 transition-transform">expand_more</span>
          </summary>
          <div class="px-4 pb-4 space-y-2.5 border-t border-outline-variant/10 pt-3">
            <div class="flex gap-3 items-start">
              <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
              <div><p class="text-xs font-bold text-on-surface">${t('submit.step1.title')}</p><p class="text-[11px] text-on-surface-variant">${t('submit.step1.desc')}</p></div>
            </div>
            <div class="flex gap-3 items-start">
              <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
              <div><p class="text-xs font-bold text-on-surface">${t('submit.step2.title')}</p><p class="text-[11px] text-on-surface-variant">${t('submit.step2.desc')}</p></div>
            </div>
            <div class="flex gap-3 items-start">
              <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
              <div><p class="text-xs font-bold text-on-surface">${t('submit.step3.title')}</p><p class="text-[11px] text-on-surface-variant">${t('submit.step3.desc')}</p></div>
            </div>
            <div class="flex gap-3 items-start">
              <span class="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">4</span>
              <div><p class="text-xs font-bold text-on-surface">${t('submit.step4.title')}</p><p class="text-[11px] text-on-surface-variant">${t('submit.step4.desc')}</p></div>
            </div>
            <div class="flex gap-3 items-start">
              <span class="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">5</span>
              <div><p class="text-xs font-bold text-on-surface">${t('submit.step5.title')}</p><p class="text-[11px] text-on-surface-variant">${t('submit.step5.desc')}</p></div>
            </div>
          </div>
        </details>
        <div class="flex gap-2 pt-1">
          <button onclick="closeSubmitModal()" class="flex-1 py-3 rounded-xl font-bold text-sm text-on-surface-variant bg-surface-container-low hover:bg-surface-container transition-colors">${t('submit.cancel')}</button>
          <button onclick="confirmSubmit()" class="flex-1 py-3 rounded-xl font-bold text-sm text-white hover:scale-[1.02] transition-transform flex items-center justify-center gap-2" style="background:linear-gradient(135deg,#0A3D2A,#0D6B3F)">
            <span class="material-symbols-outlined text-lg">send</span>${t('submit.confirm')}
          </button>
        </div>
      </div>
    </div>`;
  document.onkeydown = function (e) {
    if (e.key === "Escape") closeSubmitModal();
  };
}

function closeSubmitModal() {
  const el = document.getElementById("submitModal");
  if (el) el.remove();
  document.onkeydown = null;
}

function confirmSubmit() {
  const s = totalStats();
  const L = getLang();
  const snapshot = {
    ts: new Date().toISOString(),
    stats: s,
    overrides: getStatusOverrides(),
    feedbackCount: getIndicators().filter(i => getFeedback(i.id)).length,
    driveConnected: typeof driveReady !== 'undefined' && driveReady,
    mappedFolders: typeof driveFolderMap !== 'undefined' ? Object.keys(driveFolderMap).length : 0
  };
  try { localStorage.setItem('84submit', JSON.stringify(snapshot)); } catch (e) { }
  closeSubmitModal();
  showToast(t('submit.toast'));
  // Show confirmation detail
  setTimeout(() => {
    showToast(t('submit.snapshot.detail').replace('{done}', s.done).replace('{total}', s.total).replace('{fb}', snapshot.feedbackCount));
  }, 2000);
}

// === STATUS GUIDE ===
function renderStatusGuide(collapsed) {
  const L = getLang();
  const items = [
    { key: "c", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", titleColor: "text-emerald-800", descColor: "text-emerald-700", needsColor: "text-emerald-600", needsBg: "bg-emerald-100" },
    { key: "p", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500", titleColor: "text-amber-800", descColor: "text-amber-700", needsColor: "text-amber-600", needsBg: "bg-amber-100" },
    { key: "w", bg: "bg-gray-50", border: "border-gray-200", dot: "bg-gray-400", titleColor: "text-gray-800", descColor: "text-gray-600", needsColor: "text-gray-500", needsBg: "bg-gray-100" },
  ];
  if (collapsed) {
    return `<div class="flex flex-wrap gap-2">
      ${items.map(s => `<div class="flex items-center gap-2 px-3 py-2 rounded-xl border ${s.border} ${s.bg}">
        <span class="w-2 h-2 rounded-full ${s.dot} flex-shrink-0"></span>
        <span class="text-xs font-bold ${s.titleColor}">${t(`status.guide.${s.key}.title`)}</span>
      </div>`).join("")}
    </div>`;
  }
  return `<div class="bg-white rounded-2xl p-5 space-y-4">
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined text-emerald-forest">verified</span>
      <h3 class="font-headline font-extrabold text-on-surface text-sm">${t("status.guide.title")}</h3>
      <span class="ml-auto text-[10px] text-on-surface-variant font-medium">${t("status.guide.subtitle")}</span>
    </div>
    <div class="space-y-3">
      ${items.map(s => `<div class="p-4 rounded-xl border ${s.border} ${s.bg} space-y-1.5">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full ${s.dot} flex-shrink-0"></span>
          <span class="text-sm font-bold ${s.titleColor}">${t(`status.guide.${s.key}.title`)}</span>
        </div>
        <p class="text-xs ${s.descColor} leading-relaxed pl-4">${t(`status.guide.${s.key}.desc`)}</p>
        <div class="flex items-start gap-1.5 pl-4">
          <span class="material-symbols-outlined text-xs mt-0.5 ${s.needsColor}">arrow_right</span>
          <p class="text-[11px] font-medium ${s.needsColor}">${t(`status.guide.${s.key}.needs`)}</p>
        </div>
      </div>`).join("")}
    </div>
    <div class="border-t border-outline-variant/10 pt-3 space-y-1.5">
      <p class="text-[11px] font-bold text-on-surface">${t("status.guide.criteria.title")}</p>
      <div class="flex items-start gap-1.5">
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-mono mt-0.5 flex-shrink-0">w→p</span>
        <p class="text-[11px] text-on-surface-variant">${t("status.guide.w2p")}</p>
      </div>
      <div class="flex items-start gap-1.5">
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-mono mt-0.5 flex-shrink-0">p→c</span>
        <p class="text-[11px] text-on-surface-variant">${t("status.guide.p2c")}</p>
      </div>
    </div>
  </div>`;
}

// === VIEW SWITCHER HTML ===
function viewSwitcherHTML() {
  const views = [
    { id: "grid", icon: "grid_view", label: t("view.grid") },
    { id: "list", icon: "view_agenda", label: t("view.list") },
    { id: "table", icon: "table_rows", label: t("view.table") },
  ];
  return `<div class="flex items-center gap-0.5 bg-surface-container-low rounded-xl p-1">
    ${views.map(v => `<button onclick="setCatalogView('${v.id}')" title="${v.label}"
      class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${catalogView === v.id ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}">
      <span class="material-symbols-outlined text-sm">${v.icon}</span>
      <span class="hidden sm:inline">${v.label}</span>
    </button>`).join("")}
  </div>`;
}

// === DATA INTEGRITY BADGE ===
function dataIntegrityBadge(item, size = "sm") {
  const di = item.dataIntegrity;
  const isAdmin = typeof adminUnlocked !== "undefined" && adminUnlocked;
  // Public: show icon only, no technical details in tooltip
  // Admin: show full details including validation issues
  const adminTip = isAdmin ? item.dataIssues.join('; ') : '';
  if (di === "ok") {
    return size === "lg"
      ? `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full" ${adminTip ? `title="${adminTip}"` : ''}><span class="material-symbols-outlined" style="font-size:12px">verified</span>${t("data.integrity.ok")}</span>`
      : `<span class="inline-flex items-center gap-0.5 text-emerald-600"><span class="material-symbols-outlined" style="font-size:10px">verified</span></span>`;
  }
  if (di === "warning") {
    return size === "lg"
      ? `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full" ${adminTip ? `title="${adminTip}"` : ''}><span class="material-symbols-outlined" style="font-size:12px">warning</span>${t("data.integrity.warning")}</span>`
      : `<span class="inline-flex items-center gap-0.5 text-amber-500" ${adminTip ? `title="${adminTip}"` : ''}><span class="material-symbols-outlined" style="font-size:10px">warning</span></span>`;
  }
  if (di === "error") {
    return size === "lg"
      ? `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full" ${adminTip ? `title="${adminTip}"` : ''}><span class="material-symbols-outlined" style="font-size:12px">error</span>${isAdmin ? t("data.integrity.error") : ''}</span>`
      : `<span class="inline-flex items-center gap-0.5 text-red-500" ${adminTip ? `title="${adminTip}"` : ''}><span class="material-symbols-outlined" style="font-size:10px">error</span></span>`;
  }
  // unknown
  return size === "lg"
    ? `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full"><span class="material-symbols-outlined" style="font-size:12px">help</span>${isAdmin ? t("data.integrity.unknown") : ''}</span>`
    : `<span class="inline-flex items-center gap-0.5 text-gray-400"><span class="material-symbols-outlined" style="font-size:10px">help</span></span>`;
}

// === CATALOG ITEM RENDERERS ===
function renderCatalogItemGrid(i, cat, st, L) {
  const isAdmin = typeof adminUnlocked !== "undefined" && adminUnlocked;
  const isMismatch = isAdmin && (i.validationMatch === 'mismatch' || i.validationMatch === 'override_mismatch');
  const borderClass = isMismatch ? "border-2 border-error/50" : "border border-transparent";
  const warningBadge = isMismatch ? `<span class="absolute -top-2 -right-2 bg-error text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-pulse" title="Status mismatch detected"><span class="material-symbols-outlined text-[14px]">error</span></span>` : "";

  return `<div class="bg-white p-5 rounded-2xl hover:translate-y-[-2px] transition-all cursor-pointer group shadow-sm ${borderClass} relative" onclick="navigate('detail',{id:${i.id}})">
    ${warningBadge}
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center space-x-2">
        <span class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style="background:${cat.cl}">${i.id}</span>
        <span class="text-[10px] text-on-surface-variant font-bold">${catName(cat.id).substring(0, 12)}</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${st.cls}">${st.label}</span>
        ${dataIntegrityBadge(i)}
      </div>
    </div>
    <h3 class="font-headline font-bold text-sm text-on-surface mb-2 group-hover:text-emerald-forest transition-colors leading-snug">${i.title}</h3>
    <p class="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">${i.desc}</p>
    <div class="flex flex-wrap gap-1 mt-3 items-center">
      ${i.filesCount !== null ? `<span class="text-[9px] ${i.filesCount > 0 ? "bg-blue-50 text-river-blue" : "bg-red-50 text-error border border-red-200"} px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5"><span class="material-symbols-outlined" style="font-size:10px">folder</span>${i.filesCount} ${t("cat.files")}</span>` : ""}
      ${i.agencies.slice(0, 2).map(a => `<span class="text-[9px] bg-surface-container-low px-2 py-0.5 rounded-full text-on-surface-variant">${a.length > 20 ? a.substring(0, 18) + "…" : a}</span>`).join("")}
      ${i.agencies.length > 2 ? `<span class="text-[9px] bg-surface-container-low px-2 py-0.5 rounded-full text-on-surface-variant">+${i.agencies.length - 2}</span>` : ""}
    </div>
  </div>`;
}

function renderCatalogItemList(i, cat, st, L) {
  const isAdmin = typeof adminUnlocked !== "undefined" && adminUnlocked;
  const isMismatch = isAdmin && (i.validationMatch === 'mismatch' || i.validationMatch === 'override_mismatch');
  const borderClass = isMismatch ? "border-l-4 border-error" : "border-l-4 border-transparent";
  return `<div class="bg-white px-4 py-3.5 rounded-xl flex items-center gap-3 hover:shadow-sm transition-all cursor-pointer group ${borderClass}" onclick="navigate('detail',{id:${i.id}})">
    <span class="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style="background:${cat.cl}">${i.id}</span>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 flex-wrap">
        <h3 class="font-bold text-sm text-on-surface group-hover:text-emerald-forest transition-colors leading-snug">${i.title}</h3>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${st.cls}">${st.label}</span>
        ${dataIntegrityBadge(i)}
        ${isMismatch ? `<span class="material-symbols-outlined text-[14px] text-error">error</span><span class="text-[10px] text-error font-bold">${t('mismatch.label')}</span>` : ""}
      </div>
      <p class="text-xs text-on-surface-variant mt-0.5 truncate">${catName(cat.id)} \u00b7 ${i.agencies[0]}${i.agencies.length > 1 ? ` +${i.agencies.length - 1}` : ""}</p>
    </div>
    <div class="flex items-center gap-2 flex-shrink-0">
      ${i.filesCount !== null ? `<span class="text-[10px] ${i.filesCount > 0 ? "bg-blue-50 text-river-blue" : "bg-red-50 text-error border border-red-200"} px-2 py-0.5 rounded-full font-bold">${i.filesCount} ${t("cat.files")}</span>` : ""}
      <span class="material-symbols-outlined text-sm text-on-surface-variant group-hover:text-primary transition-colors">chevron_right</span>
    </div>
  </div>`;
}

function renderCatalogItemTable(items, L) {
  return `<div class="bg-white rounded-2xl overflow-hidden shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-outline-variant/10">
            <th class="text-left py-3 px-4 text-xs font-bold text-on-surface-variant w-10">#</th>
            <th class="text-left py-3 px-4 text-xs font-bold text-on-surface-variant">${t('cat.indicator')}</th>
            <th class="text-left py-3 px-4 text-xs font-bold text-on-surface-variant hidden md:table-cell">${t('cat.category')}</th>
            <th class="text-left py-3 px-4 text-xs font-bold text-on-surface-variant hidden lg:table-cell">${t('cat.agency')}</th>
            <th class="text-center py-3 px-4 text-xs font-bold text-on-surface-variant">${t('cat.files.header')}</th>
            <th class="text-center py-3 px-4 text-xs font-bold text-on-surface-variant">${t('cat.status.header')}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant/5">
          ${items.map(i => {
    const cat = CATS.find(c => c.id === i.cat);
    const st = STATUS_MAP[i.status];
    const fileCount = i.filesCount;
    const isAdm = typeof adminUnlocked !== "undefined" && adminUnlocked;
    const isMismatch = isAdm && (i.validationMatch === 'mismatch' || i.validationMatch === 'override_mismatch');
    return `<tr class="hover:bg-surface-container-low/40 cursor-pointer transition-colors ${isMismatch ? "bg-red-50/50" : ""}" onclick="navigate('detail',{id:${i.id}})">
              <td class="py-2.5 px-4"><span class="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style="background:${cat.cl}">${i.id}</span></td>
              <td class="py-2.5 px-4 font-medium text-on-surface max-w-xs">
                <div class="flex items-center gap-2">
                  <p class="truncate">${i.title}</p>
                  ${isMismatch ? `<span class="material-symbols-outlined text-[14px] text-error flex-shrink-0" title="Status mismatch">error</span>` : ""}
                </div>
                <p class="text-[10px] text-on-surface-variant truncate">${i.desc.substring(0, 60)}…</p>
              </td>
              <td class="py-2.5 px-4 hidden md:table-cell text-xs text-on-surface-variant">${catName(cat.id).substring(0, 16)}</td>
              <td class="py-2.5 px-4 hidden lg:table-cell text-xs text-on-surface-variant">${i.agencies[0]}${i.agencies.length > 1 ? ` +${i.agencies.length - 1}` : ""}</td>
              <td class="py-2.5 px-4 text-center text-xs ${fileCount > 0 ? "text-river-blue font-bold" : "text-error font-bold"}">${fileCount !== null ? fileCount : "—"}</td>
              <td class="py-2.5 px-4 text-center"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${st.cls}">${st.label}</span> ${dataIntegrityBadge(i)}</td>
            </tr>`;
  }).join("")}
        </tbody>
      </table>
    </div>
  </div>`;
}

// === CATALOG ===
function renderCatalog() {
  const cats = getCatStats();
  const L = getLang();
  let items = getIndicators();
  if (currentFilter.cat > 0) items = items.filter(i => i.cat === currentFilter.cat);
  if (currentFilter.status) items = items.filter(i => i.status === currentFilter.status);
  if (currentFilter.search) {
    const q = currentFilter.search.toLowerCase();
    items = items.filter(i => i.title.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q) || String(i.id).includes(q));
  }
  const activeCat = currentFilter.cat > 0 ? CATS.find(c => c.id === currentFilter.cat) : null;
  return `<div data-view="catalog" class="px-4 md:px-8 py-6 max-w-7xl w-full mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-headline font-extrabold text-on-surface">
        ${activeCat ? `<span class="material-symbols-outlined align-middle mr-1" style="color:${activeCat.cl}">${activeCat.ic}</span>${catName(activeCat.id)}` : t("cat.title")}
      </h1>
      ${activeCat ? `<p class="text-on-surface-variant text-sm font-thai mt-1">${L === "en" ? activeCat.locEn : activeCat.loc} — ${L === "en" ? activeCat.n : activeCat.en}</p>`
      : `<p class="text-on-surface-variant text-sm font-thai mt-1">${t("cat.subtitle")}</p>`}
    </div>
    ${L === "en" ? `<div class="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
      <span class="material-symbols-outlined text-river-blue text-sm">translate</span>
      <p class="text-[11px] text-river-blue leading-relaxed">${t("content.status.en_version")} — ${t("content.status.auto_update")}</p>
    </div>` : ""}
    <div class="space-y-2">
      <div class="filter-scroll">
        <button onclick="currentFilter.cat=0;currentFilter.status='';render()" class="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!currentFilter.cat && !currentFilter.status ? "bg-primary text-white" : "bg-white text-on-surface-variant hover:bg-gray-100"}">${t("cat.all")} (84)</button>
        ${cats.map(c => `<button onclick="currentFilter.cat=${c.id};currentFilter.status='';render()" class="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentFilter.cat === c.id ? "text-white" : "bg-white text-on-surface-variant hover:bg-gray-100"}" style="${currentFilter.cat === c.id ? `background:${c.cl}` : ""}">${catName(c.id).substring(0, 10)}\u2026 (${c.total})</button>`).join("")}
      </div>
      <div class="flex gap-2 flex-wrap">
        ${["c", "p", "w"].map(st => `<button onclick="currentFilter.status=currentFilter.status==='${st}'?'':'${st}';render()" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentFilter.status === st ? STATUS_MAP[st].cls : "bg-white text-on-surface-variant hover:bg-gray-100"}">${STATUS_MAP[st].label}</button>`).join("")}
      </div>
    </div>
    <!-- Search + View Switcher row -->
    <div class="flex items-center gap-2">
      <div class="flex-1 flex items-center bg-white px-4 py-2.5 rounded-xl">
        <span class="material-symbols-outlined text-on-surface-variant mr-2">search</span>
        <input class="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant" placeholder="${t("cat.search.placeholder")}" value="${currentFilter.search || ""}" oninput="currentFilter.search=this.value;render()"/>
        ${currentFilter.search ? `<button onclick="currentFilter.search='';document.getElementById('globalSearch').value='';render()" class="text-on-surface-variant hover:text-error"><span class="material-symbols-outlined text-lg">close</span></button>` : ""}
      </div>
      ${viewSwitcherHTML()}
    </div>
    <!-- Status guide legend (collapsed) -->
    ${renderStatusGuide(true)}
    <p class="text-xs text-on-surface-variant font-bold">${t("cat.showing")} ${items.length} ${t("cat.of")} 84</p>
    <!-- Items: view-aware -->
    ${items.length === 0
      ? `<div class="text-center py-16"><span class="material-symbols-outlined text-5xl text-on-surface-variant/30">search_off</span><p class="text-on-surface-variant mt-3 font-thai">${t("cat.noresult")}</p></div>`
      : catalogView === "table"
        ? renderCatalogItemTable(items, L)
        : catalogView === "list"
          ? `<div class="space-y-2">${items.map(i => { const cat = CATS.find(c => c.id === i.cat); const st = STATUS_MAP[i.status]; return renderCatalogItemList(i, cat, st, L); }).join("")}</div>`
          : `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${items.map(i => { const cat = CATS.find(c => c.id === i.cat); const st = STATUS_MAP[i.status]; return renderCatalogItemGrid(i, cat, st, L); }).join("")}</div>`
    }
  </div>`;
}

// === DETAIL ===
function renderDetail() {
  const item = getIndicators().find(i => i.id === currentFilter.id);
  const L = getLang();
  if (!item) return `<div data-view="detail" class="p-8 text-center"><p>${t('detail.notfound')}</p></div>`;
  const cat = CATS.find(c => c.id === item.cat);
  const st = STATUS_MAP[item.status];
  const catLabel = catName(cat.id);
  const sameCategory = getIndicators().filter(i => i.cat === item.cat && i.id !== item.id).slice(0, 4);
  const prevId = item.id > 1 ? item.id - 1 : 84;
  const nextId = item.id < 84 ? item.id + 1 : 1;
  return `<div data-view="detail" class="px-4 md:px-8 py-6 max-w-4xl w-full mx-auto space-y-6">
    <!-- Breadcrumb -->
    <nav class="flex items-center text-xs text-on-surface-variant space-x-2">
      <a class="hover:text-primary cursor-pointer" onclick="navigate('dashboard')">${t("detail.breadcrumb.home")}</a>
      <span>›</span>
      <a class="hover:text-primary cursor-pointer" onclick="navigate('catalog',{cat:${item.cat}})">${t("detail.breadcrumb.cat")} ${item.cat}: ${catLabel}</a>
      <span>›</span>
      <span class="text-on-surface font-bold">${t("detail.breadcrumb.item")} ${item.id}</span>
    </nav>
    <!-- Header Card -->
    <div class="bg-white rounded-2xl p-6 md:p-8 relative overflow-hidden">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-3">
          <span class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold" style="background:${cat.cl}">${item.id}</span>
          <div>
            <p class="text-xs text-on-surface-variant font-bold">${t("detail.breadcrumb.cat")} ${item.cat}: ${catLabel}</p>
            <p class="text-[11px] text-on-surface-variant">${item.sub}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 rounded-full text-xs font-bold ${st.cls}">${st.label}</span>
          ${item.statusOverridden ? `<span class="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200 font-bold">${t('audit.override.label')}</span>` : ''}
          ${adminUnlocked ? `<div class="relative" id="statusChanger-${item.id}"><button onclick="document.getElementById('statusMenu-${item.id}').classList.toggle('hidden')" class="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors" aria-label="เปลี่ยนสถานะ" title="เปลี่ยนสถานะ"><span class="material-symbols-outlined text-sm text-on-surface-variant">edit</span></button><div id="statusMenu-${item.id}" class="hidden absolute right-0 top-8 z-20 bg-white rounded-xl shadow-xl border border-outline-variant/20 p-1.5 min-w-[180px] space-y-0.5">${['c', 'p', 'w'].map(k => { const s2 = STATUS_MAP[k]; return `<button onclick="changeIndicatorStatus(${item.id},'${k}')" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold hover:bg-surface-container-low transition-colors ${item.status === k ? 'bg-surface-container-low' : ''}"><span class="w-2 h-2 rounded-full ${k === 'c' ? 'bg-emerald-500' : k === 'p' ? 'bg-amber-500' : 'bg-gray-400'}"></span>${s2.label}${item.status === k ? ' ✓' : ''}</button>`; }).join('')}${item.statusOverridden ? `<hr class="my-1 border-outline-variant/15"/><button onclick="resetIndicatorStatus(${item.id})" class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-error hover:bg-red-50 transition-colors"><span class="material-symbols-outlined text-sm">undo</span>${t('status.reset.btn')}</button>` : ''}</div></div>` : ''}
        </div>
      </div>
      <h1 class="text-2xl md:text-3xl font-headline font-extrabold text-on-surface leading-tight mb-4">${item.title}</h1>
      <div class="absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl" style="background:${cat.cl}10"></div>
    </div>
    <!-- Status Criteria Card (Admin only) -->
    ${adminUnlocked ? (function () {
      const cfg = {
        c: { bg: "bg-emerald-50", border: "border-emerald-200/60", icon: "check_circle", iconColor: "text-emerald-600", titleColor: "text-emerald-800", descColor: "text-emerald-700", needsBg: "bg-emerald-100", needsColor: "text-emerald-700" },
        p: { bg: "bg-amber-50", border: "border-amber-200/60", icon: "pending", iconColor: "text-amber-500", titleColor: "text-amber-800", descColor: "text-amber-700", needsBg: "bg-amber-100", needsColor: "text-amber-700" },
        w: { bg: "bg-gray-50", border: "border-gray-200/60", icon: "schedule", iconColor: "text-gray-400", titleColor: "text-gray-800", descColor: "text-gray-600", needsBg: "bg-gray-100", needsColor: "text-gray-600" },
      };
      const c = cfg[item.status];
      const next = item.status === "w" ? t("status.guide.w2p") : item.status === "p" ? t("status.guide.p2c") : null;
      return `<div class="rounded-2xl border p-5 space-y-3 ${c.bg} ${c.border}">
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined text-xl ${c.iconColor}">${c.icon}</span>
          <h3 class="font-headline font-bold text-sm ${c.titleColor}">${t(`status.guide.${item.status}.title`)}</h3>
          <span class="ml-auto text-[10px] font-bold ${c.needsColor} ${c.needsBg} px-2 py-0.5 rounded-full">${t("status.guide.criteria.title")}</span>
        </div>
        <p class="text-xs ${c.descColor} leading-relaxed pl-7">${t(`status.guide.${item.status}.desc`)}</p>
        <div class="pl-7 space-y-1">
          <p class="text-[11px] font-bold ${c.titleColor}">${t(`status.guide.${item.status}.needs`)}</p>
          ${next ? `<div class="flex items-center gap-1.5 mt-1"><span class="text-[10px] px-2 py-0.5 rounded-full ${c.needsBg} ${c.needsColor} font-mono flex-shrink-0">${item.status === "w" ? "w→p" : "p→c"}</span><p class="text-[11px] ${c.descColor}">${next}</p></div>` : ""}
        </div>
      </div>`;
    })() : ""}
    <!-- Mapping Verification (Admin only) -->
    ${adminUnlocked ? `<div class="bg-white rounded-2xl p-6 md:p-8 space-y-4">
      <div class="flex items-center space-x-2 mb-2">
        <span class="material-symbols-outlined text-river-blue">verified</span>
        <h2 class="font-headline font-bold text-on-surface">${t("detail.mapping.title")}</h2>
      </div>
      <div id="drive-mapping" class="space-y-2">
        <div class="flex items-center gap-2 text-sm text-on-surface-variant">
          <span class="material-symbols-outlined drive-spinner text-sm">sync</span>
          ${t("drive.connecting")}
        </div>
      </div>
    </div>` : ""}
    <!-- Description -->
    <div class="bg-white rounded-2xl p-6 md:p-8 space-y-4">
      <div class="flex items-center space-x-2 mb-2">
        <span class="material-symbols-outlined text-emerald-forest">description</span>
        <h2 class="font-headline font-bold text-on-surface">${t("detail.desc.title")}</h2>
      </div>
      <p class="text-on-surface-variant leading-relaxed font-thai">${item.desc}</p>
    </div>
    <!-- Local Context (from Drive Google Doc) -->
    <div class="bg-white rounded-2xl p-6 md:p-8 space-y-4">
      <div class="flex items-center space-x-2 mb-2">
        <span class="material-symbols-outlined text-temple-gold">location_on</span>
        <h2 class="font-headline font-bold text-on-surface">${t("detail.context.title")}</h2>
      </div>
      <div id="drive-doc-content">
        <p class="text-on-surface-variant leading-relaxed font-thai italic">${t("detail.context.placeholder")}</p>
      </div>
    </div>
    <!-- Agencies -->
    <div class="bg-white rounded-2xl p-6 md:p-8 space-y-4">
      <div class="flex items-center space-x-2 mb-2">
        <span class="material-symbols-outlined text-river-blue">groups</span>
        <h2 class="font-headline font-bold text-on-surface">${t("detail.agencies.title")}</h2>
      </div>
      <div class="flex flex-wrap gap-2">
        ${item.agencies.map(a => `<span class="inline-flex items-center bg-blue-50 text-river-blue px-3 py-1.5 rounded-lg text-xs font-medium"><span class="material-symbols-outlined text-sm mr-1">apartment</span>${a}</span>`).join("")}
      </div>
    </div>
    <!-- Evidence (from Google Drive) -->
    <div class="bg-white rounded-2xl p-6 md:p-8 space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="material-symbols-outlined text-deep-teak">folder_open</span>
          <h2 class="font-headline font-bold text-on-surface">${t("detail.evidence.title")}</h2>
        </div>
        <div class="flex items-center gap-2">
          ${driveStatusHTML()}
          <button onclick="refreshSingleIndicator(${item.id})" class="flex items-center gap-1 text-[10px] font-bold text-river-blue bg-blue-50 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200" title="${t('refresh.btn')}">
            <span class="material-symbols-outlined" style="font-size:14px">refresh</span>${t('refresh.btn')}
          </button>
        </div>
      </div>
      <div id="drive-evidence">${renderDriveLoading()}</div>
    </div>
    <!-- Auditor Feedback -->
    ${(function () {
      const L = getLang();
      const fb = getFeedback(item.id);
      const ratings = [
        { v: "", label: t('detail.rating.select') },
        { v: "5", label: t('detail.rating.5') },
        { v: "4", label: t('detail.rating.4') },
        { v: "3", label: t('detail.rating.3') },
        { v: "2", label: t('detail.rating.2') },
        { v: "1", label: t('detail.rating.1') },
      ];
      const ratingStars = (r) => r ? '★'.repeat(parseInt(r)) + '☆'.repeat(5 - parseInt(r)) : '';
      const ratingLabel = (r) => ratings.find(x => x.v === String(r))?.label?.split(' — ')[1] || '';
      return `<div class="bg-white rounded-2xl p-6 md:p-8 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-purple-600" aria-hidden="true">rate_review</span>
            <h2 class="font-headline font-bold text-on-surface">${t("detail.feedback.title")}</h2>
          </div>
          ${fb ? `<span class="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-bold border border-purple-100">${t('detail.feedback.recorded')}</span>` : ""}
        </div>
        ${fb ? `
        <div class="bg-purple-50 rounded-xl p-4 space-y-2 border border-purple-100">
          ${fb.rating ? `<div class="flex items-center gap-2"><span class="text-amber-500 text-base tracking-wider" aria-label="${t('detail.feedback.rating.aria')} ${fb.rating}/5">${ratingStars(fb.rating)}</span><span class="text-xs font-bold text-purple-700">${ratingLabel(fb.rating)}</span></div>` : ""}
          <p class="text-sm text-purple-900 font-thai leading-relaxed whitespace-pre-wrap">${fb.text.replace(/</g, '&lt;')}</p>
          <div class="flex items-center justify-between pt-1">
            <p class="text-[10px] text-purple-400">${fb.author} · ${new Date(fb.ts).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</p>
            ${adminUnlocked ? `<button onclick="clearFeedback(${item.id})" class="text-[10px] text-error hover:underline font-bold">${t('detail.feedback.delete')}</button>` : ""}
          </div>
        </div>
        ${adminUnlocked ? `
        <details class="group">
          <summary class="text-xs font-bold text-purple-600 cursor-pointer hover:underline list-none flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">edit</span>${t('detail.feedback.edit')}
          </summary>
          <div class="mt-3 space-y-3">
            <select id="feedback-rating-${item.id}" class="w-full text-sm border border-outline-variant/30 rounded-xl px-3 py-2 bg-surface focus:ring-0 focus:border-emerald-forest">
              ${ratings.map(r => `<option value="${r.v}" ${fb.rating === r.v ? "selected" : ""}>${r.label}</option>`).join("")}
            </select>
            <textarea id="feedback-text-${item.id}" class="feedback-editor w-full border border-outline-variant/30 rounded-xl px-3 py-2.5 bg-surface focus:ring-0 focus:border-emerald-forest" placeholder="${t('detail.feedback.update.placeholder')}">${fb.text.replace(/</g, '&lt;')}</textarea>
            <button onclick="saveFeedbackFromForm(${item.id})" class="px-4 py-2 rounded-xl text-sm font-bold text-white hover:scale-[1.02] transition-transform" style="background:linear-gradient(135deg,#6d28d9,#7c3aed)">
              ${t('detail.feedback.save.changes')}
            </button>
          </div>
        </details>` : ""}
        ` : adminUnlocked ? `
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-on-surface-variant mb-1.5" for="feedback-rating-${item.id}">${t('detail.feedback.compliance.label')}</label>
            <select id="feedback-rating-${item.id}" class="w-full text-sm border border-outline-variant/30 rounded-xl px-3 py-2 bg-surface focus:ring-0 focus:border-emerald-forest">
              ${ratings.map(r => `<option value="${r.v}">${r.label}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-on-surface-variant mb-1.5" for="feedback-text-${item.id}">${t('detail.feedback.recommendations.label')}</label>
            <textarea id="feedback-text-${item.id}" class="feedback-editor w-full border border-outline-variant/30 rounded-xl px-3 py-2.5 bg-surface focus:ring-0 focus:border-emerald-forest" placeholder="${t('detail.feedback.recommendations.placeholder')}"></textarea>
          </div>
          <button onclick="saveFeedbackFromForm(${item.id})" class="px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:scale-[1.02] transition-transform flex items-center gap-2" style="background:linear-gradient(135deg,#6d28d9,#7c3aed)">
            <span class="material-symbols-outlined text-sm" aria-hidden="true">save</span>${t('detail.feedback.save')}
          </button>
        </div>
        ` : `
        <div class="bg-surface-container-low rounded-xl p-4 flex items-center gap-3">
          <span class="material-symbols-outlined text-on-surface-variant/50" aria-hidden="true">lock</span>
          <p class="text-sm text-on-surface-variant font-thai">${t('detail.feedback.locked')}</p>
        </div>
        `}
      </div>`;
    })()}
    <!-- Navigation -->
    <div class="flex items-center justify-between pt-2">
      <button onclick="navigate('detail',{id:${prevId}})" class="flex items-center space-x-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
        <span class="material-symbols-outlined">arrow_back</span><span>${t("detail.breadcrumb.item")} ${prevId}</span>
      </button>
      <button onclick="navigate('catalog',{cat:${item.cat}})" class="text-sm font-bold text-emerald-forest hover:underline">${t("detail.nav.back")} ${item.cat}</button>
      <button onclick="navigate('detail',{id:${nextId}})" class="flex items-center space-x-2 text-sm text-on-surface-variant hover:text-primary transition-colors">
        <span>${t("detail.breadcrumb.item")} ${nextId}</span><span class="material-symbols-outlined">arrow_forward</span>
      </button>
    </div>
    <!-- Related -->
    ${sameCategory.length ? `
    <section class="space-y-3 pt-4">
      <h3 class="font-headline font-bold text-on-surface text-sm">${t("detail.related.title")}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        ${sameCategory.map(r => {
      const rs = STATUS_MAP[r.status];
      return `<div class="bg-white p-4 rounded-xl hover:translate-y-[-1px] transition-all cursor-pointer" onclick="navigate('detail',{id:${r.id}})">
            <div class="flex items-center space-x-2 mb-1">
              <span class="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold" style="background:${cat.cl}">${r.id}</span>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${rs.cls}">${rs.label}</span>
            </div>
            <h4 class="text-sm font-bold text-on-surface leading-snug">${r.title}</h4>
          </div>`;
    }).join("")}
      </div>
    </section>`: ""}
  </div>`;
}

// === DRIVE UI HELPERS ===
function driveStatusHTML() {
  if (typeof driveReady === "undefined") return `<span class="drive-status-dot err"></span><span class="text-[10px] text-on-surface-variant ml-1">drive.js not loaded</span>`;
  if (!driveReady && !driveError) return `<span class="drive-status-dot loading"></span><span class="text-[10px] text-on-surface-variant ml-1">${t("drive.connecting")}</span>`;
  if (driveError) return `<span class="drive-status-dot err"></span><span class="text-[10px] text-error ml-1" title="${driveError}">${t("drive.notready")}</span>`;
  const folderCount = Object.keys(driveFolderMap).length;
  return `<span class="drive-status-dot ok"></span><span class="text-[10px] text-emerald-700 ml-1">${t("drive.connected")} (${folderCount} ${t("drive.cats")})</span>`;
}

function driveStatusHTMLLight() {
  if (typeof driveReady === "undefined") return `<span class="drive-status-dot err"></span><span class="text-[10px] ml-1" style="color:rgba(255,255,255,0.5)">drive.js not loaded</span>`;
  if (!driveReady && !driveError) return `<span class="drive-status-dot loading"></span><span class="text-[10px] ml-1" style="color:rgba(255,255,255,0.6)">${t("drive.connecting")}</span>`;
  if (driveError) return `<span class="drive-status-dot err"></span><span class="text-[10px] ml-1" style="color:#ff8a80" title="${driveError}">${t("drive.notready")}</span>`;
  const folderCount = Object.keys(driveFolderMap).length;
  return `<span class="drive-status-dot ok"></span><span class="text-[10px] ml-1" style="color:#a5d0b9">${t("drive.connected")} (${folderCount} ${t("drive.cats")})</span>`;
}

// Store current evidence files for modal navigation
let currentEvidenceFiles = [];

function renderFileThumbnail(f, idx) {
  const info = driveFileInfo(f.mimeType);
  // Use Drive thumbnail for ALL file types (images, PDFs, Docs, Sheets, etc.)
  const thumbUrl = f.thumbnailLink ? f.thumbnailLink.replace(/=s\d+/, "=s400") : null;
  return `<div class="group cursor-pointer rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/30 hover:shadow-md transition-all" onclick="openFileModal(currentEvidenceFiles, ${idx})" role="button" aria-label="${f.name}">
    <div class="aspect-[4/3] bg-surface-container-low flex items-center justify-center relative overflow-hidden">
      ${thumbUrl
      ? `<img src="${thumbUrl}" class="w-full h-full object-cover" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'material-symbols-outlined text-4xl\\' style=\\'color:${info.color}\\'>${info.icon}</span>'" alt="${f.name}"/>`
      : `<span class="material-symbols-outlined text-4xl" style="color:${info.color}">${info.icon}</span>`}
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <span class="material-symbols-outlined text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" aria-hidden="true">visibility</span>
      </div>
      <span class="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black/50 text-white backdrop-blur-sm">${info.label}</span>
    </div>
    <div class="p-2.5">
      <p class="text-xs font-medium text-on-surface truncate">${f.name}</p>
      <p class="text-[10px] text-on-surface-variant">${info.label}${f.size ? " \u00b7 " + formatFileSize(f.size) : ""}</p>
    </div>
  </div>`;
}

function renderFileSummary(files) {
  const L = getLang();
  const groups = {};
  files.forEach(f => {
    const info = driveFileInfo(f.mimeType);
    const key = info.label;
    if (!groups[key]) groups[key] = { count: 0, icon: info.icon, color: info.color };
    groups[key].count++;
  });
  const pills = Object.entries(groups).map(([label, g]) =>
    `<span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border" style="border-color:${g.color}20;background:${g.color}10;color:${g.color}"><span class="material-symbols-outlined" style="font-size:13px" aria-hidden="true">${g.icon}</span>${label} <span class="text-[11px]">${g.count}</span></span>`
  ).join("");
  const totalSize = files.reduce((s, f) => s + (parseInt(f.size) || 0), 0);
  return `<div class="flex flex-wrap items-center gap-1.5 mb-3">
    <span class="text-xs font-bold text-on-surface">${files.length} ${t('files.count')}</span>
    ${totalSize > 0 ? `<span class="text-[10px] text-on-surface-variant">(${formatFileSize(totalSize)})</span>` : ''}
    <span class="text-on-surface-variant/30">|</span>
    ${pills}
  </div>`;
}

function renderDriveLoading() {
  return `<div class="flex items-center justify-center py-8 gap-2">
    <span class="material-symbols-outlined drive-spinner text-emerald-forest">sync</span>
    <span class="text-sm text-on-surface-variant">${t("drive.loading")}</span>
  </div>`;
}

function renderDriveError(msg) {
  return `<div class="flex flex-col items-center justify-center py-6 gap-3">
    <div class="flex items-center gap-2">
      <span class="material-symbols-outlined text-error">cloud_off</span>
      <span class="text-sm text-on-surface-variant">${msg || t("drive.error")}</span>
    </div>
    <button onclick="retryDrive()" class="text-xs font-bold text-emerald-forest bg-emerald-50 px-4 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1">
      <span class="material-symbols-outlined text-sm">refresh</span>${t("drive.retry")}
    </button>
  </div>`;
}

async function retryDrive() {
  driveReady = false;
  driveError = null;
  driveFolderMapReady = false;
  Object.keys(driveCache).forEach(k => delete driveCache[k]);
  render();
  await initDrive();
  render();
}

// === MAPPING VERIFICATION ===
function renderMappingVerification(indicatorId, catId, result) {
  const L = getLang();
  const isAdmin = typeof adminUnlocked !== "undefined" && adminUnlocked;
  const cat = CATS.find(c => c.id === catId);
  const catLabel = catName(cat.id);
  const catFolderFound = !!driveFolderMap[catId];
  const indicatorFolderFound = !!result?.matchedFolder;
  const folderName = result?.matchedFolder?.name || "—";
  const fileCount = result?.files?.length || 0;
  const subfolderCount = result?.subfolders?.length || 0;
  const hasEn = !!result?.hasEnglishVersion;

  // PUBLIC VIEW: simplified status badges only
  if (!isAdmin) {
    const mapped = catFolderFound && indicatorFolderFound;
    const statusIcon = mapped ? "check_circle" : "hourglass_empty";
    const statusColor = mapped ? "text-emerald-600" : "text-gray-400";
    const statusBg = mapped ? "bg-emerald-50" : "bg-gray-50";
    const statusLabel = mapped ? t('mapping.data.connected') : t('mapping.data.awaiting');
    return `<div class="flex items-center gap-3 p-3 rounded-xl ${statusBg}">
      <span class="material-symbols-outlined text-lg ${statusColor}">${statusIcon}</span>
      <div class="flex-1">
        <p class="text-xs font-bold text-on-surface">${t("detail.breadcrumb.cat")} ${catId}: ${catLabel}</p>
        <p class="text-[10px] text-on-surface-variant">${statusLabel}</p>
      </div>
      ${mapped ? `<span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">✓ ${t("detail.mapping.matched")}</span>` : `<span class="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">${t('mapping.pending')}</span>`}
    </div>`;
  }

  // ADMIN VIEW: full technical details
  return `<div class="space-y-3">
    <!-- Category Mapping -->
    <div class="flex items-center gap-3 p-3 rounded-xl ${catFolderFound ? "bg-emerald-50" : "bg-amber-50"}">
      <span class="material-symbols-outlined text-lg ${catFolderFound ? "text-emerald-600" : "text-amber-600"}">${catFolderFound ? "check_circle" : "warning"}</span>
      <div class="flex-1">
        <p class="text-xs font-bold text-on-surface">${t("detail.breadcrumb.cat")} ${catId}: ${catLabel}</p>
        <p class="text-[10px] text-on-surface-variant">${catFolderFound ? t('mapping.cat.found') : t('mapping.cat.notfound')}</p>
      </div>
      ${catFolderFound ? `<span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">${t("detail.mapping.matched")}</span>` : `<span class="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">${t("detail.mapping.notfound")}</span>`}
    </div>
    <!-- Indicator Mapping -->
    <div class="flex items-center gap-3 p-3 rounded-xl ${indicatorFolderFound ? "bg-emerald-50" : "bg-gray-50"}">
      <span class="material-symbols-outlined text-lg ${indicatorFolderFound ? "text-emerald-600" : "text-gray-400"}">${indicatorFolderFound ? "folder" : "folder_off"}</span>
      <div class="flex-1">
        <p class="text-xs font-bold text-on-surface">${t("detail.mapping.indicator")} ${indicatorId}</p>
        <p class="text-[10px] text-on-surface-variant">${indicatorFolderFound ? `${t("detail.mapping.folder")}: ${folderName}` : t("detail.mapping.notfound")}</p>
      </div>
      <div class="flex items-center gap-2">
        ${fileCount > 0 ? `<span class="text-[10px] font-bold text-river-blue bg-blue-50 px-2 py-0.5 rounded-full">${fileCount} ${t("cat.files")}</span>` : ""}
        ${subfolderCount > 0 ? `<span class="text-[10px] font-bold text-temple-gold bg-amber-50 px-2 py-0.5 rounded-full">${subfolderCount} ${t("subfolder.count")}</span>` : ""}
        ${indicatorFolderFound ? `<span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">${t("detail.mapping.matched")}</span>` : ""}
      </div>
    </div>
    <!-- English Version Status -->
    <div class="flex items-center gap-3 p-3 rounded-xl ${hasEn ? "bg-blue-50" : "bg-amber-50"}">
      <span class="material-symbols-outlined text-lg ${hasEn ? "text-blue-600" : "text-amber-500"}">${hasEn ? "translate" : "warning"}</span>
      <div class="flex-1">
        <p class="text-xs font-bold text-on-surface">English Version</p>
        <p class="text-[10px] text-on-surface-variant">${hasEn ? t("subfolder.enFound") : t("subfolder.enMissing")}</p>
      </div>
      ${hasEn ? `<span class="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">✓</span>` : `<span class="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">✗</span>`}
    </div>
    <!-- Validation Note -->
    ${indicatorFolderFound ? `<div class="flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
      <span class="material-symbols-outlined text-river-blue text-sm mt-0.5">info</span>
      <p class="text-[11px] text-river-blue leading-relaxed">${t('mapping.validation.note').replace('{folder}', folderName).replace('{id}', indicatorId).replace('{cat}', catId)}</p>
    </div>` : ""}
  </div>`;
}

// === SUBFOLDER TREE RENDERER ===
// Renders folder hierarchy preserving Drive structure. Files grouped under their subfolders.
function renderSubfolderTree(tree, allFiles) {
  if (!tree) return '';
  const L = getLang();

  // Build flat file index for modal navigation (ordered by subfolder)
  const orderedFiles = [];
  function collectFiles(node) {
    for (const f of node.files) orderedFiles.push(f);
    for (const child of node.children) collectFiles(child);
  }
  collectFiles(tree);
  currentEvidenceFiles = orderedFiles;

  // If no subfolders at all, render flat grid
  if (tree.children.length === 0) {
    if (tree.files.length === 0) return '';
    return `${renderFileSummary(tree.files)}
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        ${tree.files.map((f, idx) => renderFileThumbnail(f, getFileModalIndex(orderedFiles, f))).join("")}
      </div>`;
  }

  let html = `${renderFileSummary(orderedFiles)}`;

  // Root-level files (files directly in indicator folder, not in any subfolder)
  if (tree.files.length > 0) {
    html += `<div class="mb-4">
      <div class="flex items-center gap-2 mb-2 pb-1 border-b border-outline-variant/10">
        <span class="material-symbols-outlined text-sm text-on-surface-variant">description</span>
        <span class="text-xs font-bold text-on-surface-variant">${t('files.root')} (${tree.files.length})</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        ${tree.files.map(f => renderFileThumbnail(f, getFileModalIndex(orderedFiles, f))).join("")}
      </div>
    </div>`;
  }

  // Subfolders
  for (const child of tree.children) {
    html += renderFolderNode(child, orderedFiles, 0);
  }

  return html;
}

function renderFolderNode(node, orderedFiles, indent) {
  const L = getLang();
  const totalFiles = countNodeFiles(node);
  const indentPx = indent * 16;
  const isCollapsible = indent >= 2; // Collapse deeper than 2 levels by default

  let html = `<div class="mb-3" style="margin-left:${indentPx}px">
    <div class="flex items-center gap-2 mb-2 pb-1 border-b border-outline-variant/15 ${isCollapsible ? 'cursor-pointer' : ''}" ${isCollapsible ? `onclick="this.nextElementSibling.classList.toggle('hidden')"` : ''}>
      <span class="material-symbols-outlined text-sm text-temple-gold">folder</span>
      <span class="text-xs font-bold text-on-surface">${node.name}</span>
      <span class="text-[10px] text-on-surface-variant bg-surface-container-low px-1.5 py-0.5 rounded">${totalFiles} ${t('files.count')}</span>
      ${node._isEnglishVersion ? '<span class="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">EN</span>' : ''}
      ${isCollapsible ? '<span class="material-symbols-outlined text-xs text-on-surface-variant">expand_more</span>' : ''}
    </div>
    <div class="${isCollapsible ? 'hidden' : ''}">`;

  // Files in this folder
  if (node.files.length > 0) {
    html += `<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-2">
      ${node.files.map(f => renderFileThumbnail(f, getFileModalIndex(orderedFiles, f))).join("")}
    </div>`;
  }

  // Nested subfolders
  for (const child of node.children) {
    html += renderFolderNode(child, orderedFiles, indent + 1);
  }

  html += `</div></div>`;
  return html;
}

function countNodeFiles(node) {
  let count = node.files ? node.files.length : 0;
  if (node.children) {
    for (const child of node.children) count += countNodeFiles(child);
  }
  return count;
}

function getFileModalIndex(orderedFiles, file) {
  return orderedFiles.findIndex(f => f.id === file.id);
}

// === ASYNC POST-RENDER: Load Drive data after view renders ===
async function postRenderDrive() {
  if (currentView === "dashboard") {
    loadHeroImage();
  }
  if (currentView === "detail" && currentFilter.id) {
    await loadDriveForDetail(currentFilter.id);
  }
}

async function loadHeroImage() {
  const el = document.getElementById("hero-bg-img");
  if (!el || !driveReady) return;
  try {
    const imgs = await fetchDriveImages();
    if (imgs.length > 0) {
      const pick = imgs[Math.floor(Math.random() * imgs.length)];
      el.style.backgroundImage = `url(${pick.thumb})`;
    }
  } catch (e) { /* silent */ }
}

async function refreshSingleIndicator(indicatorId) {
  // Invalidate cached data for this indicator so loadDriveForDetail fetches fresh
  const cachePrefix = `ind_${indicatorId}_`;
  if (typeof driveCache !== "undefined") {
    Object.keys(driveCache).forEach(k => { if (k.startsWith(cachePrefix)) delete driveCache[k]; });
  }
  showToast(`${t('refresh.btn')} #${indicatorId}...`);
  await loadDriveForDetail(indicatorId);
}

async function loadDriveForDetail(indicatorId) {
  const evidenceEl = document.getElementById("drive-evidence");
  const docEl = document.getElementById("drive-doc-content");
  const mappingEl = document.getElementById("drive-mapping");
  if (!evidenceEl) return;

  if (!driveReady) {
    evidenceEl.innerHTML = renderDriveError(driveError || t('drive.not.ready'));
    if (mappingEl) mappingEl.innerHTML = renderDriveError(driveError || t('drive.not.ready'));
    return;
  }

  const item = getIndicators().find(i => i.id === indicatorId);
  if (!item) return;

  evidenceEl.innerHTML = renderDriveLoading();

  try {
    const isEn = typeof getLang === 'function' && getLang() === 'en';
    const result = await driveFilesForIndicator(indicatorId, item.cat, isEn);
    const L = getLang();

    // Update mapping verification
    if (mappingEl) {
      mappingEl.innerHTML = renderMappingVerification(indicatorId, item.cat, result);
    }

    const isAdmin = typeof adminUnlocked !== "undefined" && adminUnlocked;

    // STRICT RENDERING: Check validation status before showing data
    if (result.validation && result.validation.status === "error") {
      if (isAdmin) {
        // Admin: show full error details with issue list
        const issueList = result.validation.issues.map(i => `<li class="text-xs">${i}</li>`).join("");
        evidenceEl.innerHTML = `<div class="border-2 border-red-200 bg-red-50 rounded-xl p-6 text-center">
          <span class="material-symbols-outlined text-4xl text-red-400">error_outline</span>
          <p class="text-sm font-bold text-red-700 mt-2">${t("data.structure.issue")}</p>
          <ul class="text-red-600 mt-2 text-left list-disc list-inside space-y-1">${issueList}</ul>
          <button onclick="refreshDriveData()" class="mt-3 text-xs font-bold text-red-600 bg-white border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
            <span class="material-symbols-outlined text-xs align-middle mr-1">refresh</span>${t("refresh.btn")}
          </button>
        </div>`;
      } else {
        // Public: generic "data not ready" message, no technical details
        evidenceEl.innerHTML = `<div class="border-2 border-dashed border-outline-variant/30 rounded-xl p-8 text-center">
          <span class="material-symbols-outlined text-4xl text-on-surface-variant/30">hourglass_empty</span>
          <p class="text-sm text-on-surface-variant mt-2 font-thai">${t('evidence.preparing')}</p>
        </div>`;
      }
      if (docEl) docEl.innerHTML = "";
      return;
    }

    // Warning state: show data but with warning banner (admin only sees details)
    if (result.validation && result.validation.status === "warning" && isAdmin) {
      const warnMsg = result.validation.issues.join("; ");
      evidenceEl.insertAdjacentHTML("afterbegin", `<div class="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
        <span class="material-symbols-outlined text-amber-500 text-sm">warning</span>
        <p class="text-[11px] text-amber-700">${warnMsg}</p>
      </div>`);
    }

    // Update evidence panel — use subfolder tree renderer to preserve structure
    if (result.files.length === 0) {
      currentEvidenceFiles = [];
      const isEn2 = isEn;
      evidenceEl.innerHTML = `<div class="border-2 border-dashed border-outline-variant/30 rounded-xl p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant/30">${isEn2 ? 'translate' : 'cloud_done'}</span>
        <p class="text-sm text-on-surface-variant mt-2 font-thai">${isEn2 && result.hasEnglishVersion === false
          ? t('evidence.en.preparing')
          : t("detail.evidence.empty")
        }</p>
      </div>`;
    } else {
      // Warning banner: admin sees full details, public sees nothing
      const warningBanner = (isAdmin && result.validation && result.validation.status === "warning")
        ? `<div class="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            <span class="material-symbols-outlined text-amber-500 text-sm">warning</span>
            <p class="text-[11px] text-amber-700">${result.validation.issues.join("; ")}</p>
          </div>`
        : "";
      // Traversal info: admin only
      const traversalInfo = (isAdmin && result.traversal)
        ? `<div class="flex items-center gap-2 text-[10px] text-on-surface-variant mb-2">
            <span class="material-symbols-outlined" style="font-size:12px">account_tree</span>
            ${t('traversal.depth')}: ${result.traversal.depth} · ${t('traversal.folders')}: ${result.traversal.visitedCount}
            · ${t('traversal.subfolders')}: ${result.subfolders?.length || 0}
            ${result.hasEnglishVersion ? ' · <span class="text-blue-600 font-bold">EN ✓</span>' : ' · <span class="text-amber-500">EN ✗</span>'}
            ${result.traversal.errors.length > 0 ? ` · <span class="text-amber-500">${result.traversal.errors.length} error(s)</span>` : ""}
          </div>`
        : "";

      // Use tree renderer if tree structure is available, otherwise fallback to flat grid
      const treeHtml = result.tree
        ? renderSubfolderTree(result.tree, result.files)
        : `${renderFileSummary(result.files)}
           <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
             ${result.files.map((f, idx) => { currentEvidenceFiles = result.files; return renderFileThumbnail(f, idx); }).join("")}
           </div>`;

      evidenceEl.innerHTML = `${warningBanner}${traversalInfo}${treeHtml}`;
    }

    // Show Google Doc content if found
    if (docEl && result.docContent) {
      docEl.innerHTML = `<div class="prose prose-sm max-w-none text-on-surface-variant font-thai leading-relaxed drive-doc-body">${result.docContent}</div>`;
    } else if (docEl) {
      docEl.innerHTML = `<p class="text-on-surface-variant leading-relaxed font-thai italic">${t("detail.context.placeholder")}</p>`;
    }
  } catch (e) {
    evidenceEl.innerHTML = renderDriveError(t('drive.error.prefix') + e.message);
  }
}

// === API QUOTA UI ===
function renderQuotaCard() {
  if (typeof driveQuota === "undefined") return `<p class="text-xs text-on-surface-variant">Drive module not loaded</p>`;
  const q = driveQuota.getStats();
  const barColor = q.level === "danger" ? "bg-red-500" : q.level === "warning" ? "bg-amber-500" : "bg-emerald-500";
  const levelText = t("quota.level." + q.level);
  const levelCls = q.level === "danger" ? "text-red-600 bg-red-50" : q.level === "warning" ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50";
  return `
    <div class="flex items-center justify-between mb-1">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-river-blue text-lg">api</span>
        <h3 class="text-sm font-headline font-extrabold text-on-surface">${t("quota.title")}</h3>
      </div>
      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${levelCls}">${levelText}</span>
    </div>
    <!-- Progress Bar -->
    <div class="space-y-1">
      <div class="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all duration-500 ${barColor}" style="width:${q.pct}%"></div>
      </div>
      <div class="flex justify-between text-[10px] text-on-surface-variant">
        <span>${q.calls.toLocaleString()} / ${q.limit.toLocaleString()}</span>
        <span>${q.pct}%</span>
      </div>
    </div>
    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-2 mt-2">
      <div class="bg-blue-50 rounded-lg p-2 text-center">
        <div class="text-sm font-black text-river-blue">${q.calls.toLocaleString()}</div>
        <div class="text-[9px] text-on-surface-variant font-bold">${t("quota.calls")}</div>
      </div>
      <div class="bg-emerald-50 rounded-lg p-2 text-center">
        <div class="text-sm font-black text-emerald-600">${q.cacheHits.toLocaleString()}</div>
        <div class="text-[9px] text-on-surface-variant font-bold">${t("quota.cached")}</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-2 text-center">
        <div class="text-sm font-black text-on-surface">${q.remaining.toLocaleString()}</div>
        <div class="text-[9px] text-on-surface-variant font-bold">${t("quota.remaining")}</div>
      </div>
      <div class="${q.overFree > 0 ? "bg-red-50" : "bg-gray-50"} rounded-lg p-2 text-center">
        <div class="text-sm font-black ${q.overFree > 0 ? "text-red-600" : "text-emerald-600"}">${q.overFree > 0 ? "$" + q.estCost : t("quota.free")}</div>
        <div class="text-[9px] text-on-surface-variant font-bold">${t("quota.cost")}</div>
      </div>
    </div>
    ${q.errors > 0 ? `<div class="flex items-center gap-1 text-[10px] text-red-600 mt-1"><span class="material-symbols-outlined text-xs">error</span>${t("quota.errors")}: ${q.errors}</div>` : ""}
  `;
}

function updateQuotaBar() {
  // Update quota card on dashboard if visible
  const card = document.getElementById("quota-card");
  if (card) card.innerHTML = renderQuotaCard();
  // Update floating mini-bar
  renderFloatingQuota();
}

function renderFloatingQuota() {
  let bar = document.getElementById("floating-quota");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "floating-quota";
    bar.className = "fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-outline-variant/15 p-3 max-w-xs transition-all duration-300 no-print";
    bar.style.cursor = "pointer";
    bar.onclick = () => {
      const detail = bar.querySelector(".quota-detail");
      if (detail) detail.classList.toggle("hidden");
    };
    document.body.appendChild(bar);
  }
  if (typeof driveQuota === "undefined" || !adminUnlocked) { bar.style.display = "none"; return; }
  const q = driveQuota.getStats();
  if (q.calls === 0) { bar.style.display = "none"; return; }
  bar.style.display = "block";
  const barColor = q.level === "danger" ? "bg-red-500" : q.level === "warning" ? "bg-amber-500" : "bg-emerald-500";
  const dotColor = q.level === "danger" ? "bg-red-500" : q.level === "warning" ? "bg-amber-500" : "bg-emerald-500";
  bar.innerHTML = `
    <div class="flex items-center gap-2">
      <div class="w-2 h-2 rounded-full ${dotColor} ${q.level !== "ok" ? "animate-pulse" : ""}"></div>
      <span class="text-[10px] font-bold text-on-surface">API</span>
      <div class="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div class="h-full rounded-full ${barColor}" style="width:${q.pct}%"></div>
      </div>
      <span class="text-[10px] text-on-surface-variant font-bold">${q.calls}/${q.limit > 999 ? (q.limit / 1000).toFixed(0) + "k" : q.limit}</span>
      <span class="material-symbols-outlined text-xs text-on-surface-variant">expand_less</span>
    </div>
    <div class="quota-detail hidden mt-2 pt-2 border-t border-outline-variant/10 space-y-1.5">
      <div class="flex justify-between text-[10px]">
        <span class="text-on-surface-variant">${t("quota.calls")}</span>
        <span class="font-bold text-on-surface">${q.calls.toLocaleString()}</span>
      </div>
      <div class="flex justify-between text-[10px]">
        <span class="text-on-surface-variant">${t("quota.cached")}</span>
        <span class="font-bold text-emerald-600">${q.cacheHits.toLocaleString()}</span>
      </div>
      <div class="flex justify-between text-[10px]">
        <span class="text-on-surface-variant">${t("quota.remaining")}</span>
        <span class="font-bold text-on-surface">${q.remaining.toLocaleString()}</span>
      </div>
      <div class="flex justify-between text-[10px]">
        <span class="text-on-surface-variant">${t("quota.cost")}</span>
        <span class="font-bold ${q.overFree > 0 ? "text-red-600" : "text-emerald-600"}">${q.overFree > 0 ? "$" + q.estCost : t("quota.free")}</span>
      </div>
      ${q.errors > 0 ? `<div class="flex justify-between text-[10px]"><span class="text-on-surface-variant">${t("quota.errors")}</span><span class="font-bold text-red-600">${q.errors}</span></div>` : ""}
      <button onclick="event.stopPropagation();refreshDriveData()" class="w-full mt-1 text-[10px] font-bold text-river-blue bg-blue-50 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1">
        <span class="material-symbols-outlined text-xs">refresh</span>${t("refresh.btn")}
      </button>
    </div>
  `;
}

// === REFRESH DRIVE DATA ===
async function refreshDriveData() {
  if (typeof driveReady === "undefined") return;
  const btn = document.getElementById("refreshBtn");
  const icon = btn?.querySelector(".material-symbols-outlined");
  if (icon) icon.classList.add("refresh-pulse");

  // Clear all caches and invalidate stale data
  Object.keys(driveCache).forEach(k => delete driveCache[k]);
  driveFolderMapReady = false;
  driveReady = false;
  driveError = null;

  // Invalidate legacy globals to prevent stale data display
  window.INDICATOR_TH = {};
  window.INDICATOR_EN = {};

  render(); // Show loading state

  // Re-initialize Drive connection
  await initDrive();
  if (!driveReady) {
    if (icon) icon.classList.remove("refresh-pulse");
    rebuildDriveStatusMap();
    render();
    return;
  }

  // Run auto-discover to detect mapping changes
  try {
    const discovery = await autoDiscoverMapping();
    if (discovery.changes.length > 0 && typeof adminUnlocked !== "undefined" && adminUnlocked) {
      // Admin sees mapping change alert
      window._pendingMappingChanges = discovery;
      showToast(t("mapping.changes.detected") + ` (${discovery.changes.length})`);
    } else if (discovery.changes.length > 0) {
      // Non-admin: auto-apply changes silently
      lockMapping(discovery.mapping);
    }
    if (Object.keys(loadMapping()).length === 0) {
      lockMapping(discovery.mapping);
    }
  } catch (e) {
    console.warn("[Refresh] Auto-discover failed:", e.message);
  }

  // Force full sync with recursive traversal
  await fullSync({ force: true });

  // Rebuild language-aware status map after fresh sync
  rebuildDriveStatusMap();
  logRefreshAudit("manual");

  render();
  if (icon) icon.classList.remove("refresh-pulse");
  showToast(t("refresh.done"));
}

function showToast(msg) {
  let toast = document.getElementById("app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "app-toast";
    toast.className = "fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all duration-300 no-print";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="material-symbols-outlined text-sm">check_circle</span>${msg}`;
  toast.style.opacity = "1";
  toast.style.transform = "translate(-50%, 0)";
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translate(-50%, -20px)";
  }, 2500);
}

// === DRIVE STATUS MAP (populated from sync state) ===
let driveStatusMap = {}; // indicatorId -> { hasFiles, fileCount }

function rebuildDriveStatusMap() {
  const syncState = typeof loadSyncState === "function" ? loadSyncState() : {};
  const L = typeof getLang === "function" ? getLang() : "th";
  driveStatusMap = {};
  for (let i = 1; i <= 84; i++) {
    const s = syncState[i];
    if (s) {
      const fc = L === "en" ? (s.enFileCount || 0) : (s.thFileCount || 0);
      driveStatusMap[i] = {
        hasFiles: fc > 0,
        fileCount: fc,
        thFileCount: s.thFileCount || 0,
        enFileCount: s.enFileCount || 0,
        hasEnglishVersion: !!s.hasEnglishVersion,
        subfolderNames: s.subfolderNames || []
      };
    }
  }
}

// === DASHBOARD AUTO-REFRESH ===
let dashboardRefreshTimer = null;
let backgroundSyncTimer = null;
const BG_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

function startDashboardAutoRefresh() {
  if (dashboardRefreshTimer) clearInterval(dashboardRefreshTimer);
  dashboardRefreshTimer = setInterval(() => {
    if (currentView === "dashboard" && !document.hidden) {
      updateNavDriveStatus();
      const qc = document.getElementById("quota-card");
      if (qc) qc.innerHTML = renderQuotaCard();
      renderFloatingQuota();
    }
  }, 30000); // UI update every 30 seconds (only when tab visible)

  // Background full sync every 5 minutes (paused when tab hidden)
  if (backgroundSyncTimer) clearInterval(backgroundSyncTimer);
  backgroundSyncTimer = setInterval(async () => {
    if (document.hidden || !driveReady) return;
    try {
      console.log("[BG Sync] Starting background refresh...");
      if (typeof fullSync === "function") await fullSync();
      rebuildDriveStatusMap();
      logRefreshAudit("background");
      if (currentView === "dashboard") render();
    } catch (e) {
      console.warn("[BG Sync] Error:", e.message);
    }
  }, BG_SYNC_INTERVAL);
}

// === REFRESH AUDIT TRAIL (C-4) ===
function logRefreshAudit(trigger) {
  try {
    const trail = JSON.parse(localStorage.getItem("84_refresh_trail") || "[]");
    trail.push({ ts: new Date().toISOString(), trigger: trigger || "manual", lang: getLang() });
    // Keep only last 50 entries
    if (trail.length > 50) trail.splice(0, trail.length - 50);
    localStorage.setItem("84_refresh_trail", JSON.stringify(trail));
  } catch (e) { /* silent */ }
}
function getRefreshAuditTrail() {
  try { return JSON.parse(localStorage.getItem("84_refresh_trail") || "[]"); } catch (e) { return []; }
}

// === OFFLINE DETECTION (E-2) ===
function showOfflineBanner() {
  let banner = document.getElementById("offline-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "offline-banner";
    banner.className = "fixed top-0 left-0 right-0 z-[200] bg-red-600 text-white text-center py-2 text-sm font-bold flex items-center justify-center gap-2 no-print";
    document.body.appendChild(banner);
  }
  banner.innerHTML = `<span class="material-symbols-outlined text-sm">wifi_off</span>${t('offline.message')}<button onclick="location.reload()" class="ml-3 px-3 py-0.5 bg-white text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors">${t('offline.retry')}</button>`;
  banner.style.display = "flex";
}
function hideOfflineBanner() {
  const banner = document.getElementById("offline-banner");
  if (banner) banner.style.display = "none";
}
window.addEventListener("offline", showOfflineBanner);
window.addEventListener("online", () => { hideOfflineBanner(); showToast("✅ " + t('offline.retry')); });

// === INIT ===
document.addEventListener("DOMContentLoaded", async () => {
  if (!navigator.onLine) showOfflineBanner();
  document.documentElement.lang = getLang();
  initNavScroll();
  onHashChange();
  await initDrive();
  rebuildDriveStatusMap();
  render();
  renderFloatingQuota();
  startDashboardAutoRefresh();
});
