// === INTERNATIONALIZATION (i18n) MODULE ===
let currentLang = localStorage.getItem("lang") || "th";

const T = {
  // === GLOBAL ===
  "app.title": { th: "อุทัยธานี Green Destination", en: "Uthai Thani Green Destination" },
  "app.subtitle": { th: "Green Destination • 84 ตัวชี้วัด", en: "Green Destination • 84 Indicators" },
  "app.brand": { th: "The Living Portfolio", en: "The Living Portfolio" },
  "app.footer.copy": { th: "© 2569 (2026) อุทัยธานี Green Destination Portfolio — GSTC", en: "© 2026 Uthai Thani Green Destination Portfolio — GSTC" },
  "app.footer.org": { th: "เทศบาลเมืองอุทัยธานี • Green Destinations Standard", en: "Uthai Thani Municipality • Green Destinations Standard" },
  "nav.dashboard": { th: "แดชบอร์ด", en: "Dashboard" },
  "nav.indicators": { th: "ตัวชี้วัด 84 ข้อ", en: "84 Indicators" },
  "search.placeholder": { th: "ค้นหาตัวชี้วัด...", en: "Search indicators..." },

  // === STATUS ===
  "status.completed": { th: "ดำเนินการแล้ว", en: "Completed" },
  "status.in_progress": { th: "กำลังดำเนินการ", en: "In Progress" },
  "status.pending": { th: "รอดำเนินการ", en: "Pending" },
  "status.success": { th: "สำเร็จ", en: "Success" },
  "status.done": { th: "สำเร็จแล้ว", en: "Completed" },

  // === DASHBOARD ===
  "dash.cycle": { th: "2026 TOP100 CYCLE", en: "2026 TOP100 CYCLE" },
  "dash.hero.title1": { th: "ผลงานอุทัยธานี", en: "Uthai Thani Portfolio" },
  "dash.hero.title2": { th: "กำลังเติบโต", en: "Growing Strong" },
  "dash.hero.desc": { th: "การจัดเก็บหลักฐาน Top100 Green Destination กำลังดำเนินไปด้วยดี", en: "Evidence collection for Top100 Green Destination is progressing well" },
  "dash.hero.done": { th: "ดำเนินการแล้ว", en: "completed" },
  "dash.hero.of": { th: "จาก", en: "of" },
  "dash.hero.indicators": { th: "ตัวชี้วัด", en: "indicators" },
  "dash.hero.remaining": { th: "เหลืออีก", en: "remaining" },
  "dash.hero.items": { th: "ข้อ", en: "items" },
  "dash.btn.viewall": { th: "ดูตัวชี้วัดทั้งหมด", en: "View All Indicators" },
  "dash.btn.pending": { th: "รอดำเนินการ", en: "Pending" },
  "dash.progress.title": { th: "เส้นทางสู่ Top 100 Green Destination", en: "Journey to Top 100 Green Destination" },
  "dash.progress.done": { th: "เสร็จสิ้น", en: "complete" },
  "dash.progress.start": { th: "เริ่มต้น", en: "Start" },
  "dash.progress.goal": { th: "Top 100", en: "Top 100" },
  "dash.cats.title": { th: "ผลการดำเนินงานรายหมวด", en: "Performance by Category" },
  "dash.cats.subtitle": { th: "ความก้าวหน้าตามเสาหลักด้านความยั่งยืน 6 หมวด", en: "Progress across 6 sustainability pillars" },
  "dash.cats.viewall": { th: "ดูทั้ง 84 ข้อ →", en: "View all 84 →" },
  "dash.cats.progress": { th: "ความก้าวหน้า", en: "Progress" },
  "dash.summary.title": { th: "สรุปสถานะตัวชี้วัด", en: "Indicator Status Summary" },
  "dash.summary.cat": { th: "หมวด", en: "Category" },
  "dash.summary.completed": { th: "สำเร็จ", en: "Done" },
  "dash.summary.inprogress": { th: "กำลังทำ", en: "WIP" },
  "dash.summary.waiting": { th: "รอ", en: "Wait" },
  "dash.submit.title": { th: "ส่งผลงาน", en: "Submit Portfolio" },
  "dash.submit.desc": { th: "พร้อมส่งหลักฐานทั้งหมดแล้วหรือยัง?", en: "Ready to submit all evidence?" },
  "dash.submit.btn": { th: "ส่งหลักฐานทั้งหมด", en: "Submit All Evidence" },
  "dash.health.title": { th: "สุขภาพผลงาน", en: "Portfolio Health" },
  "dash.health.done": { th: "ตัวชี้วัดสำเร็จ", en: "Completed Indicators" },
  "dash.health.evidence": { th: "รอหลักฐาน", en: "Awaiting Evidence" },
  "dash.health.deadline": { th: "กำหนดส่ง", en: "Deadline" },

  // === CATALOG ===
  "cat.title": { th: "บัญชีตัวชี้วัด 84 ข้อ", en: "84 Indicator Catalog" },
  "cat.subtitle": { th: "Green Destinations / GSTC Standard — อุทัยธานี", en: "Green Destinations / GSTC Standard — Uthai Thani" },
  "cat.all": { th: "ทั้งหมด", en: "All" },
  "cat.showing": { th: "แสดง", en: "Showing" },
  "cat.of": { th: "จาก", en: "of" },
  "cat.search.placeholder": { th: "ค้นหาตัวชี้วัด ชื่อ หมายเลข หรือคำอธิบาย...", en: "Search by name, number, or description..." },
  "cat.noresult": { th: "ไม่พบตัวชี้วัดที่ตรงกับเงื่อนไข", en: "No indicators match your criteria" },
  "cat.files": { th: "ไฟล์", en: "files" },
  "cat.mapping.ok": { th: "จับคู่ถูกต้อง", en: "Mapped correctly" },
  "cat.mapping.warn": { th: "ยังไม่มีโฟลเดอร์ใน Drive", en: "No Drive folder" },

  // === DETAIL ===
  "detail.breadcrumb.home": { th: "แดชบอร์ด", en: "Dashboard" },
  "detail.breadcrumb.cat": { th: "หมวด", en: "Category" },
  "detail.breadcrumb.item": { th: "ข้อ", en: "Item" },
  "detail.desc.title": { th: "คำอธิบาย / เกณฑ์ GSTC", en: "Description / GSTC Criteria" },
  "detail.context.title": { th: "บริบทท้องถิ่น — อุทัยธานี", en: "Local Context — Uthai Thani" },
  "detail.context.placeholder": { th: "เนื้อหาบริบทท้องถิ่นของจังหวัดอุทัยธานีที่เกี่ยวข้องกับตัวชี้วัดนี้ จะถูกเพิ่มเติมโดยทีมงานเทศบาลเมืองอุทัยธานี", en: "Local context content for Uthai Thani related to this indicator will be added by the municipality team." },
  "detail.agencies.title": { th: "หน่วยงานที่รับผิดชอบ", en: "Responsible Agencies" },
  "detail.evidence.title": { th: "หลักฐาน / เอกสารประกอบ", en: "Evidence / Supporting Documents" },
  "detail.evidence.found": { th: "ไฟล์จาก Google Drive", en: "files from Google Drive" },
  "detail.evidence.empty": { th: "ยังไม่มีไฟล์ในโฟลเดอร์ Drive สำหรับตัวชี้วัดนี้", en: "No files in Drive folder for this indicator" },
  "detail.feedback.title": { th: "ข้อเสนอแนะจากผู้ตรวจประเมิน", en: "Auditor Feedback" },
  "detail.feedback.empty": { th: "ยังไม่มีข้อเสนอแนะ — ส่วนนี้จะแสดงผลหลังการประเมิน", en: "No feedback yet — this section will be displayed after assessment." },
  "detail.nav.back": { th: "กลับหมวด", en: "Back to Cat" },
  "detail.related.title": { th: "ตัวชี้วัดอื่นในหมวดเดียวกัน", en: "Related Indicators in Same Category" },
  "detail.mapping.title": { th: "การจับคู่ข้อมูล (Mapping Verification)", en: "Data Mapping Verification" },
  "detail.mapping.indicator": { th: "ตัวชี้วัดข้อ", en: "Indicator #" },
  "detail.mapping.folder": { th: "โฟลเดอร์ Drive", en: "Drive Folder" },
  "detail.mapping.matched": { th: "จับคู่สำเร็จ ✓", en: "Matched ✓" },
  "detail.mapping.notfound": { th: "ไม่พบโฟลเดอร์", en: "Folder not found" },

  // === DRIVE ===
  "drive.connecting": { th: "กำลังเชื่อมต่อ Drive...", en: "Connecting to Drive..." },
  "drive.connected": { th: "Drive เชื่อมต่อแล้ว", en: "Drive connected" },
  "drive.notready": { th: "Drive ไม่พร้อม", en: "Drive not ready" },
  "drive.loading": { th: "กำลังโหลดไฟล์จาก Google Drive...", en: "Loading files from Google Drive..." },
  "drive.error": { th: "ไม่สามารถเชื่อมต่อ Google Drive ได้", en: "Cannot connect to Google Drive" },
  "drive.retry": { th: "ลองใหม่", en: "Retry" },
  "drive.cats": { th: "หมวด", en: "categories" },

  // === MODAL ===
  "modal.close": { th: "ปิด", en: "Close" },
  "modal.open_drive": { th: "เปิดใน Google Drive", en: "Open in Google Drive" },
  "modal.prev": { th: "ก่อนหน้า", en: "Previous" },
  "modal.next": { th: "ถัดไป", en: "Next" },

  // === API QUOTA ===
  "quota.title": { th: "การใช้งาน Google API วันนี้", en: "Google API Usage Today" },
  "quota.calls": { th: "เรียก API", en: "API Calls" },
  "quota.cached": { th: "ประหยัดจาก Cache", en: "Saved by Cache" },
  "quota.remaining": { th: "เหลือ", en: "Remaining" },
  "quota.limit": { th: "โควต้าฟรีต่อวัน", en: "Free daily quota" },
  "quota.cost": { th: "ค่าใช้จ่ายโดยประมาณ", en: "Estimated cost" },
  "quota.free": { th: "ฟรี", en: "Free" },
  "quota.level.ok": { th: "ปลอดภัย", en: "Safe" },
  "quota.level.warning": { th: "ใกล้ถึงขีดจำกัด", en: "Nearing limit" },
  "quota.level.danger": { th: "ใกล้เกินโควต้าฟรี!", en: "Near free quota limit!" },
  "quota.over": { th: "เกินโควต้าฟรีแล้ว!", en: "Over free quota!" },
  "quota.errors": { th: "ข้อผิดพลาด", en: "Errors" },

  // === REFRESH ===
  "refresh.btn": { th: "ดึงข้อมูลใหม่", en: "Refresh Data" },
  "refresh.title": { th: "รีเฟรชข้อมูล Drive", en: "Refresh Drive Data" },
  "refresh.desc": { th: "ล้างแคชและดึงข้อมูลใหม่จาก Google Drive", en: "Clear cache and re-fetch data from Google Drive" },
  "refresh.loading": { th: "กำลังดึงข้อมูลใหม่...", en: "Refreshing data..." },
  "refresh.done": { th: "ดึงข้อมูลใหม่สำเร็จ", en: "Data refreshed successfully" },

  // === CONTENT STATUS ===
  "content.status.title": { th: "สถานะเนื้อหา", en: "Content Status" },
  "content.status.preparing": { th: "กำลังจัดทำ", en: "In Preparation" },
  "content.status.en_version": { th: "English Version กำลังจัดทำเพิ่ม ยังไม่ครบทุกข้อ", en: "English Version being prepared, not yet complete for all items" },
  "content.status.auto_update": { th: "ระบบจะดึงข้อมูลใหม่อัตโนมัติเมื่อทีมงานอัปเดต Drive", en: "System will pull new data automatically when team updates Drive" },
  "content.status.last_refresh": { th: "อัปเดตล่าสุด", en: "Last refresh" },
};

// === CATEGORY NAMES (bilingual) ===
const CAT_NAMES = {
  1: { th: "การจัดการแหล่งท่องเที่ยว", en: "Destination Management" },
  2: { th: "ความยั่งยืนทางวัฒนธรรม", en: "Cultural Sustainability" },
  3: { th: "สิ่งแวดล้อมและสภาพภูมิอากาศ", en: "Environment & Climate" },
  4: { th: "วัฒนธรรมและประเพณี", en: "Culture & Tradition" },
  5: { th: "สังคมและเศรษฐกิจ", en: "Social & Economic" },
  6: { th: "การประกอบธุรกิจและการบริการ", en: "Business & Services" },
};

// === INDICATOR ENGLISH TITLES (mapped from CATS[].en and data) ===
// Will be populated from data.js CATS array
const INDICATOR_EN = {};

function t(key) {
  const entry = T[key];
  if (!entry) return key;
  return entry[currentLang] || entry["th"] || key;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  document.documentElement.lang = lang;
  // Re-render entire UI
  if (typeof render === "function") render();
  // Update static elements
  updateStaticI18n();
}

function toggleLang() {
  setLang(currentLang === "th" ? "en" : "th");
}

function getLang() { return currentLang; }

function updateStaticI18n() {
  // Footer
  const f1 = document.querySelector("footer p");
  const f2 = document.querySelector("footer span");
  if (f1) f1.textContent = t("app.footer.copy");
  if (f2) f2.textContent = t("app.footer.org");
  // Global search
  const gs = document.getElementById("globalSearch");
  if (gs) gs.placeholder = t("search.placeholder");
  // Nav pill catalog label (uses data-i18n span)
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });
  // Sidebar brand
  const brandTitle = document.querySelector("#sidebar h2");
  const brandSub = document.querySelector("#sidebar h2 + p");
  if (brandTitle) brandTitle.textContent = currentLang === "en" ? "Uthai Thani" : "อุทัยธานี";
  if (brandSub) brandSub.textContent = t("app.subtitle");
  // Sidebar bottom button
  const sideBtn = document.querySelector("#sidebar .border-t button");
  if (sideBtn) sideBtn.textContent = t("nav.dashboard");
}

// Get category name in current language
function catName(catId) {
  const cat = typeof CATS !== "undefined" ? CATS.find(c => c.id === catId) : null;
  if (currentLang === "en" && cat) return cat.en;
  if (cat) return cat.n;
  const cn = CAT_NAMES[catId];
  return cn ? cn[currentLang] : `Category ${catId}`;
}

// Language toggle button HTML
function langToggleHTML() {
  const cls = currentLang === "th" ? "th" : "en";
  const label = currentLang === "th" ? "EN" : "TH";
  const flag = currentLang === "th" ? "🇬🇧" : "🇹🇭";
  return `<button onclick="toggleLang()" class="lang-chip ${cls}" title="Switch language">
    <span style="font-size:14px;line-height:1">${flag}</span>
    <span>${label}</span>
  </button>`;
}
