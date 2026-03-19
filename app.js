// === HELPERS ===
const STATUS_RAW = { c: { th: "ดำเนินการแล้ว", en: "Completed", cls: "bg-emerald-100 text-emerald-800" }, p: { th: "กำลังดำเนินการ", en: "In Progress", cls: "bg-amber-100 text-amber-800" }, w: { th: "รอดำเนินการ", en: "Pending", cls: "bg-gray-100 text-gray-600" } };
function stLabel(key) { const s = STATUS_RAW[key]; return s ? s[getLang()] || s.th : key; }
const STATUS_MAP = new Proxy(STATUS_RAW, { get(target, prop) { const s = target[prop]; if (!s) return undefined; return { ...s, label: s[getLang()] || s.th }; } });
function getIndicators() { return D.map(d => ({ id: d[0], cat: d[1], sub: d[2], title: d[3], desc: d[4], agencies: d[5].split("|"), status: d[6] })); }
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

// === ROUTER ===
let currentView = "dashboard";
let currentFilter = { cat: 0, status: "", search: "" };
let suppressHash = false;

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
    const isActive = n === currentView || (currentView === "detail" && n === "catalog");
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
    ${stats.map(c => `
      <a class="flex items-center space-x-3 px-3 py-2.5 ${currentView === "catalog" && currentFilter.cat === c.id ? "bg-white/80 text-emerald-800 font-bold rounded-lg" : "text-on-surface-variant hover:bg-white/50 rounded-lg"} cursor-pointer transition-all group" onclick="navigate('catalog',{cat:${c.id},status:'',search:''})">
        <span class="material-symbols-outlined text-xl" style="color:${c.cl}">${c.ic}</span>
        <div class="flex-1 min-w-0">
          <span class="text-sm block truncate">${L === "en" ? c.en : c.n}</span>
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
  return `<div data-view="dashboard" class="px-4 md:px-8 py-6 max-w-7xl w-full mx-auto space-y-8">
    <!-- Hero -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 lg:p-10 relative overflow-hidden">
      <div id="hero-bg-img" class="hero-img-bg"></div>
      <div class="lg:col-span-7 space-y-5 relative z-10">
        <div class="flex items-center gap-3 flex-wrap">
          <span class="px-3 py-1 bg-secondary-container text-emerald-800 rounded-full text-[10px] font-bold uppercase tracking-widest">${t("dash.cycle")}</span>
          <span class="flex items-center gap-1 px-2 py-0.5 bg-white/80 rounded-full">${driveStatusHTML()}</span>
        </div>
        <h1 class="text-4xl lg:text-5xl font-headline font-extrabold text-on-surface tracking-tight leading-tight">
          ${t("dash.hero.title1")}<br/><span class="text-emerald-forest">${t("dash.hero.title2")}</span>
        </h1>
        <p class="text-on-surface-variant text-base max-w-lg leading-relaxed font-thai">
          ${t("dash.hero.desc")} — ${t("dash.hero.done")} <strong>${s.done}</strong> ${t("dash.hero.of")} <strong>${s.total}</strong> ${t("dash.hero.indicators")} — ${t("dash.hero.remaining")} <strong>${s.total - s.done}</strong> ${t("dash.hero.items")}
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <button onclick="navigate('catalog')" class="bg-velvet text-white px-5 py-2.5 rounded-xl font-bold flex items-center space-x-2 hover:scale-105 transition-transform text-sm">
            <span class="material-symbols-outlined text-lg">visibility</span><span>${t("dash.btn.viewall")}</span>
          </button>
          <button onclick="navigate('catalog',{status:'w'})" class="text-primary font-bold px-5 py-2.5 rounded-xl border border-primary/10 hover:bg-surface-container-low transition-colors text-sm">
            ${t("dash.btn.pending")} (${s.pend})
          </button>
        </div>
      </div>
      <div class="lg:col-span-5 flex justify-center items-center relative py-4">
        <div class="relative w-56 h-56 flex items-center justify-center">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 256 256">
            <circle cx="128" cy="128" r="110" fill="transparent" stroke="#e8f0eb" stroke-width="3"/>
            <circle cx="128" cy="128" r="110" fill="transparent" stroke="#0D6B3F" stroke-width="12" stroke-linecap="round"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" style="transition:stroke-dashoffset 1s ease"/>
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-5xl font-headline font-black text-on-surface">${s.pct}%</span>
            <span class="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">${t("dash.progress.done")}</span>
          </div>
        </div>
      </div>
      <div class="absolute bottom-3 right-8 opacity-20 raft-float">
        <svg width="80" height="40" viewBox="0 0 80 40"><rect x="5" y="15" width="70" height="8" rx="4" fill="#6B3E26"/><rect x="10" y="10" width="60" height="5" rx="2" fill="#8B5E3C"/><polygon points="40,0 45,10 35,10" fill="#0D6B3F"/><line x1="40" y1="0" x2="40" y2="15" stroke="#6B3E26" stroke-width="1.5"/><path d="M0,30 Q20,25 40,30 Q60,35 80,30" fill="none" stroke="#2B6CB0" stroke-width="1" opacity="0.5"/></svg>
      </div>
      <div class="absolute -bottom-16 -right-16 w-64 h-64 bg-emerald-forest/5 rounded-full blur-3xl"></div>
    </section>

    <!-- Raft Progress Bar -->
    <section class="bg-white rounded-2xl p-5 relative overflow-hidden">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-headline font-bold text-sm text-on-surface">${t("dash.progress.title")}</h3>
        <span class="text-xs text-on-surface-variant font-bold">${s.pct}% ${t("dash.progress.done")}</span>
      </div>
      <div class="relative h-12 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl overflow-hidden">
        <div class="absolute inset-0 wave-bg opacity-50"></div>
        <div class="absolute top-0 left-0 h-full bg-gradient-to-r from-river-blue/20 to-emerald-forest/20 rounded-xl transition-all duration-1000" style="width:${s.pct}%"></div>
        <div class="absolute top-1/2 -translate-y-1/2 raft-float transition-all duration-1000" style="left:calc(${s.pct}% - 20px)">
          <svg width="40" height="24" viewBox="0 0 40 24"><rect x="3" y="8" width="34" height="6" rx="3" fill="#6B3E26"/><polygon points="20,0 23,8 17,8" fill="#0D6B3F"/><line x1="20" y1="0" x2="20" y2="10" stroke="#6B3E26" stroke-width="1"/></svg>
        </div>
        <div class="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-forest">
          <span class="material-symbols-outlined text-lg">flag</span>
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
          <h3 class="font-headline font-bold text-on-surface mb-1 text-sm">${L === "en" ? c.en : c.n}</h3>
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
                <td class="py-2.5 font-medium"><span class="material-symbols-outlined text-sm mr-1 align-middle" style="color:${c.cl}">${c.ic}</span>${L === "en" ? c.en : c.n}</td>
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
        <!-- API Quota Meter -->
        <div id="quota-card" class="bg-white p-6 rounded-2xl space-y-4">
          ${renderQuotaCard()}
        </div>
        <!-- Content Status -->
        <div class="bg-amber-50 border border-amber-200/50 p-5 rounded-2xl space-y-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-600">edit_note</span>
            <h3 class="text-sm font-headline font-extrabold text-amber-800">${t("content.status.title")}</h3>
            <span class="ml-auto px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">${t("content.status.preparing")}</span>
          </div>
          <p class="text-xs text-amber-700 leading-relaxed font-thai">${t("content.status.en_version")}</p>
          <p class="text-[10px] text-amber-600 leading-relaxed font-thai">${t("content.status.auto_update")}</p>
          <button onclick="refreshDriveData()" class="w-full bg-white/80 text-amber-800 font-bold py-2.5 rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2 text-xs border border-amber-200">
            <span class="material-symbols-outlined text-sm">refresh</span>${t("refresh.btn")}
          </button>
        </div>
        <!-- Submit -->
        <div class="bg-velvet text-white p-6 rounded-2xl relative overflow-hidden">
          <div class="relative z-10 space-y-3">
            <h3 class="text-xl font-headline font-extrabold tracking-tight">${t("dash.submit.title")}</h3>
            <p class="text-emerald-200 text-sm leading-relaxed font-thai">${t("dash.submit.desc")}</p>
            <button class="w-full bg-white/90 text-primary font-bold py-3 rounded-xl hover:scale-105 transition-transform flex items-center justify-center space-x-2 text-sm">
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
        ${activeCat ? `<span class="material-symbols-outlined align-middle mr-1" style="color:${activeCat.cl}">${activeCat.ic}</span>${L === "en" ? activeCat.en : activeCat.n}` : t("cat.title")}
      </h1>
      ${activeCat ? `<p class="text-on-surface-variant text-sm font-thai mt-1">${activeCat.loc} — ${L === "en" ? activeCat.n : activeCat.en}</p>`
      : `<p class="text-on-surface-variant text-sm font-thai mt-1">${t("cat.subtitle")}</p>`}
    </div>
    ${L === "en" ? `<div class="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
      <span class="material-symbols-outlined text-river-blue text-sm">translate</span>
      <p class="text-[11px] text-river-blue leading-relaxed">${t("content.status.en_version")} — ${t("content.status.auto_update")}</p>
    </div>` : ""}
    <div class="flex flex-wrap gap-2 items-center">
      <button onclick="currentFilter.cat=0;currentFilter.status='';render()" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!currentFilter.cat && !currentFilter.status ? "bg-primary text-white" : "bg-white text-on-surface-variant hover:bg-gray-100"}">${t("cat.all")} (84)</button>
      ${cats.map(c => `<button onclick="currentFilter.cat=${c.id};currentFilter.status='';render()" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentFilter.cat === c.id ? "text-white" : "bg-white text-on-surface-variant hover:bg-gray-100"}" style="${currentFilter.cat === c.id ? `background:${c.cl}` : ""}">${(L === "en" ? c.en : c.n).substring(0, 10)}… (${c.total})</button>`).join("")}
      <div class="ml-auto flex gap-2">
        ${["c", "p", "w"].map(st => `<button onclick="currentFilter.status=currentFilter.status==='${st}'?'':'${st}';render()" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentFilter.status === st ? STATUS_MAP[st].cls : "bg-white text-on-surface-variant hover:bg-gray-100"}">${STATUS_MAP[st].label}</button>`).join("")}
      </div>
    </div>
    <div class="flex items-center bg-white px-4 py-2.5 rounded-xl">
      <span class="material-symbols-outlined text-on-surface-variant mr-2">search</span>
      <input class="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant" placeholder="${t("cat.search.placeholder")}" value="${currentFilter.search || ""}" oninput="currentFilter.search=this.value;render()"/>
      ${currentFilter.search ? `<button onclick="currentFilter.search='';document.getElementById('globalSearch').value='';render()" class="text-on-surface-variant hover:text-error"><span class="material-symbols-outlined text-lg">close</span></button>` : ""}
    </div>
    <p class="text-xs text-on-surface-variant font-bold">${t("cat.showing")} ${items.length} ${t("cat.of")} 84</p>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${items.map(i => {
        const cat = CATS.find(c => c.id === i.cat);
        const st = STATUS_MAP[i.status];
        return `<div class="bg-white p-5 rounded-2xl hover:translate-y-[-2px] transition-all cursor-pointer group" onclick="navigate('detail',{id:${i.id}})">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center space-x-2">
              <span class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style="background:${cat.cl}">${i.id}</span>
              <span class="text-[10px] text-on-surface-variant font-bold">${(L === "en" ? cat.en : cat.n).substring(0, 12)}</span>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${st.cls}">${st.label}</span>
          </div>
          <h3 class="font-headline font-bold text-sm text-on-surface mb-2 group-hover:text-emerald-forest transition-colors leading-snug">${i.title}</h3>
          <p class="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">${i.desc}</p>
          <div class="flex flex-wrap gap-1 mt-3 items-center">
            ${driveStatusMap[i.id]?.fileCount ? `<span class="text-[9px] bg-blue-50 text-river-blue px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5"><span class="material-symbols-outlined" style="font-size:10px">folder</span>${driveStatusMap[i.id].fileCount} ${t("cat.files")}</span>` : ""}
            ${i.agencies.slice(0, 2).map(a => `<span class="text-[9px] bg-surface-container-low px-2 py-0.5 rounded-full text-on-surface-variant">${a.length > 20 ? a.substring(0, 18) + "…" : a}</span>`).join("")}
            ${i.agencies.length > 2 ? `<span class="text-[9px] bg-surface-container-low px-2 py-0.5 rounded-full text-on-surface-variant">+${i.agencies.length - 2}</span>` : ""}
          </div>
        </div>`;
      }).join("")}
    </div>
    ${items.length === 0 ? `<div class="text-center py-16"><span class="material-symbols-outlined text-5xl text-on-surface-variant/30">search_off</span><p class="text-on-surface-variant mt-3 font-thai">${t("cat.noresult")}</p></div>` : ""}
  </div>`;
}

// === DETAIL ===
function renderDetail() {
  const item = getIndicators().find(i => i.id === currentFilter.id);
  const L = getLang();
  if (!item) return `<div data-view="detail" class="p-8 text-center"><p>${L === "en" ? "Indicator not found" : "ไม่พบตัวชี้วัด"}</p></div>`;
  const cat = CATS.find(c => c.id === item.cat);
  const st = STATUS_MAP[item.status];
  const catLabel = L === "en" ? cat.en : cat.n;
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
        <span class="px-3 py-1 rounded-full text-xs font-bold ${st.cls}">${st.label}</span>
      </div>
      <h1 class="text-2xl md:text-3xl font-headline font-extrabold text-on-surface leading-tight mb-4">${item.title}</h1>
      <div class="absolute -bottom-8 -right-8 w-32 h-32 rounded-full blur-3xl" style="background:${cat.cl}10"></div>
    </div>
    <!-- Mapping Verification -->
    <div class="bg-white rounded-2xl p-6 md:p-8 space-y-4">
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
    </div>
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
        <div class="flex items-center gap-1">${driveStatusHTML()}</div>
      </div>
      <div id="drive-evidence">${renderDriveLoading()}</div>
    </div>
    <!-- Auditor Feedback -->
    <div class="bg-white rounded-2xl p-6 md:p-8 space-y-4">
      <div class="flex items-center space-x-2 mb-2">
        <span class="material-symbols-outlined text-purple-600">rate_review</span>
        <h2 class="font-headline font-bold text-on-surface">${t("detail.feedback.title")}</h2>
      </div>
      <div class="bg-purple-50 rounded-xl p-4">
        <p class="text-sm text-purple-800 font-thai italic">${t("detail.feedback.empty")}</p>
      </div>
    </div>
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

// Store current evidence files for modal navigation
let currentEvidenceFiles = [];

function renderFileThumbnail(f, idx) {
  const info = driveFileInfo(f.mimeType);
  const isImage = f.mimeType?.startsWith("image/");
  const thumbUrl = isImage && f.thumbnailLink ? f.thumbnailLink.replace(/=s\d+/, "=s400") : null;
  return `<div class="group cursor-pointer rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/30 hover:shadow-md transition-all" onclick="openFileModal(currentEvidenceFiles, ${idx})">
    <div class="aspect-[4/3] bg-surface-container-low flex items-center justify-center relative overflow-hidden">
      ${thumbUrl
      ? `<img src="${thumbUrl}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<span class=\\'material-symbols-outlined text-4xl\\' style=\\'color:${info.color}\\'>${info.icon}</span>'" alt="${f.name}"/>`
      : `<span class="material-symbols-outlined text-4xl" style="color:${info.color}">${info.icon}</span>`}
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <span class="material-symbols-outlined text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">visibility</span>
      </div>
    </div>
    <div class="p-2.5">
      <p class="text-xs font-medium text-on-surface truncate">${f.name}</p>
      <p class="text-[10px] text-on-surface-variant">${info.label}${f.size ? " • " + formatFileSize(f.size) : ""}</p>
    </div>
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
  const cat = CATS.find(c => c.id === catId);
  const catLabel = L === "en" ? cat.en : cat.n;
  const catFolderFound = !!driveFolderMap[catId];
  const indicatorFolderFound = !!result?.matchedFolder;
  const folderName = result?.matchedFolder?.name || "—";
  const fileCount = result?.files?.length || 0;

  return `<div class="space-y-3">
    <!-- Category Mapping -->
    <div class="flex items-center gap-3 p-3 rounded-xl ${catFolderFound ? "bg-emerald-50" : "bg-amber-50"}">
      <span class="material-symbols-outlined text-lg ${catFolderFound ? "text-emerald-600" : "text-amber-600"}">${catFolderFound ? "check_circle" : "warning"}</span>
      <div class="flex-1">
        <p class="text-xs font-bold text-on-surface">${t("detail.breadcrumb.cat")} ${catId}: ${catLabel}</p>
        <p class="text-[10px] text-on-surface-variant">${catFolderFound ? (L === "en" ? "Category folder found in Drive" : "พบโฟลเดอร์หมวดใน Drive") : (L === "en" ? "Category folder NOT found in Drive" : "ไม่พบโฟลเดอร์หมวดใน Drive")}</p>
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
        ${indicatorFolderFound ? `<span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">${t("detail.mapping.matched")}</span>` : ""}
      </div>
    </div>
    <!-- Validation Note -->
    ${indicatorFolderFound ? `<div class="flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
      <span class="material-symbols-outlined text-river-blue text-sm mt-0.5">info</span>
      <p class="text-[11px] text-river-blue leading-relaxed">${L === "en"
        ? `Files in folder "${folderName}" are mapped to Indicator #${indicatorId} in Category ${catId}. Auditors will review these files for this specific indicator.`
        : `ไฟล์ในโฟลเดอร์ "${folderName}" ถูกจับคู่กับตัวชี้วัดข้อ ${indicatorId} หมวด ${catId} กรรมการจะตรวจประเมินไฟล์เหล่านี้สำหรับตัวชี้วัดนี้โดยเฉพาะ`}</p>
    </div>` : ""}
  </div>`;
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

async function loadDriveForDetail(indicatorId) {
  const evidenceEl = document.getElementById("drive-evidence");
  const docEl = document.getElementById("drive-doc-content");
  const mappingEl = document.getElementById("drive-mapping");
  if (!evidenceEl) return;

  if (!driveReady) {
    evidenceEl.innerHTML = renderDriveError(driveError || (getLang() === "en" ? "Drive not ready" : "Drive ยังไม่พร้อม"));
    if (mappingEl) mappingEl.innerHTML = renderDriveError(driveError || (getLang() === "en" ? "Drive not ready" : "Drive ยังไม่พร้อม"));
    return;
  }

  const item = getIndicators().find(i => i.id === indicatorId);
  if (!item) return;

  evidenceEl.innerHTML = renderDriveLoading();

  try {
    const result = await driveFilesForIndicator(indicatorId, item.cat);

    // Update mapping verification
    if (mappingEl) {
      mappingEl.innerHTML = renderMappingVerification(indicatorId, item.cat, result);
    }

    // Update evidence panel with thumbnail grid
    currentEvidenceFiles = result.files;
    if (result.files.length === 0) {
      evidenceEl.innerHTML = `<div class="border-2 border-dashed border-outline-variant/30 rounded-xl p-8 text-center">
        <span class="material-symbols-outlined text-4xl text-on-surface-variant/30">cloud_done</span>
        <p class="text-sm text-on-surface-variant mt-2 font-thai">${t("detail.evidence.empty")}</p>
      </div>`;
    } else {
      evidenceEl.innerHTML = `
        <p class="text-xs text-on-surface-variant font-bold mb-3">${result.files.length} ${t("detail.evidence.found")}</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          ${result.files.map((f, idx) => renderFileThumbnail(f, idx)).join("")}
        </div>`;
    }

    // Show Google Doc content if found
    if (docEl && result.docContent) {
      docEl.innerHTML = `<div class="prose prose-sm max-w-none text-on-surface-variant font-thai leading-relaxed drive-doc-body">${result.docContent}</div>`;
    } else if (docEl) {
      docEl.innerHTML = `<p class="text-on-surface-variant leading-relaxed font-thai italic">${t("detail.context.placeholder")}</p>`;
    }
  } catch (e) {
    evidenceEl.innerHTML = renderDriveError((getLang() === "en" ? "Error: " : "เกิดข้อผิดพลาด: ") + e.message);
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
  if (typeof driveQuota === "undefined") { bar.style.display = "none"; return; }
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
  // Clear all caches
  Object.keys(driveCache).forEach(k => delete driveCache[k]);
  driveFolderMapReady = false;
  driveReady = false;
  driveError = null;
  // Show loading state
  render();
  // Re-initialize
  await initDrive();
  // Re-render with fresh data
  render();
  // Show success toast
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

// === AUTO-STATUS UPDATE FROM DRIVE ===
// When Drive has files for an indicator, auto-update its status
let driveStatusMap = {}; // indicatorId -> { hasFiles, fileCount }

async function scanDriveStatuses() {
  if (!driveReady) return;
  try {
    await buildDriveFolderMap();
    const catIds = [...new Set(D.map(d => d[1]))];
    for (const catId of catIds) {
      const folderId = driveFolderMap[catId];
      if (!folderId) continue;
      const allItems = await driveListAll(folderId);
      const folders = allItems.filter(f => f.mimeType === "application/vnd.google-apps.folder");
      for (const folder of folders) {
        const num = matchIndicatorNumber(folder.name);
        if (num && num >= 1 && num <= 84) {
          const files = await driveFiles(folder.id);
          driveStatusMap[num] = { hasFiles: files.length > 0, fileCount: files.length, folderName: folder.name };
          // Auto-update original D array: d[6] is status field
          // waiting -> in progress if files exist in Drive
          const row = D.find(d => d[0] === num);
          if (row && files.length > 0 && row[6] === "w") {
            row[6] = "p";
          }
        }
      }
    }
    console.log("Drive status scan complete:", Object.keys(driveStatusMap).length, "indicators mapped");
  } catch (e) {
    console.warn("Drive status scan failed:", e);
  }
}

// === DASHBOARD AUTO-REFRESH ===
let dashboardRefreshTimer = null;
function startDashboardAutoRefresh() {
  if (dashboardRefreshTimer) clearInterval(dashboardRefreshTimer);
  dashboardRefreshTimer = setInterval(() => {
    if (currentView === "dashboard") {
      updateNavDriveStatus();
      const qc = document.getElementById("quota-card");
      if (qc) qc.innerHTML = renderQuotaCard();
      renderFloatingQuota();
    }
  }, 30000); // Update every 30 seconds
}

// === REFRESH WITH ANIMATION ===
const _origRefresh = refreshDriveData;
refreshDriveData = async function () {
  const btn = document.getElementById("refreshBtn");
  const icon = btn?.querySelector(".material-symbols-outlined");
  if (icon) icon.classList.add("refresh-pulse");
  await _origRefresh();
  if (icon) icon.classList.remove("refresh-pulse");
};

// === INIT ===
document.addEventListener("DOMContentLoaded", async () => {
  document.documentElement.lang = getLang();
  initNavScroll();
  onHashChange();
  await initDrive();
  render();
  renderFloatingQuota();
  // Scan Drive for auto-status updates in background
  scanDriveStatuses().then(() => {
    render(); // Re-render with updated statuses
    renderFloatingQuota();
  });
  startDashboardAutoRefresh();
});
