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

  // === STATUS GUIDE / CRITERIA ===
  "status.guide.title": { th: "เกณฑ์การกำหนดสถานะตัวชี้วัด", en: "Indicator Status Criteria" },
  "status.guide.subtitle": { th: "สถานะถูกกำหนดจากหลักฐาน GSTC 3 ระดับ", en: "Status is determined by GSTC evidence across 3 levels" },
  "status.guide.c.title": { th: "ดำเนินการแล้ว (Completed)", en: "Completed" },
  "status.guide.c.desc": { th: "หลักฐานครบถ้วน อัปโหลดลง Google Drive แล้ว เอกสารผ่านการตรวจสอบ และสอดคล้องกับเกณฑ์ GSTC/Green Destinations อย่างสมบูรณ์", en: "Evidence complete, uploaded to Google Drive, documents verified, and fully compliant with GSTC/Green Destinations criteria." },
  "status.guide.c.needs": { th: "ต้องการ: ไฟล์หลักฐาน + บริบทท้องถิ่น + หน่วยงานรับรอง", en: "Requires: Evidence files + Local context + Agency confirmation" },
  "status.guide.p.title": { th: "กำลังดำเนินการ (In Progress)", en: "In Progress" },
  "status.guide.p.desc": { th: "เริ่มดำเนินการแล้ว มีไฟล์หลักฐานบางส่วนใน Drive แต่ยังไม่ครบ หรือรอการยืนยันจากหน่วยงานที่รับผิดชอบ", en: "Work has started, some evidence files exist in Drive but not complete, or awaiting confirmation from responsible agencies." },
  "status.guide.p.needs": { th: "รอ: หลักฐานเพิ่มเติม / การยืนยันจากหน่วยงาน / เอกสารทางการ", en: "Waiting for: Additional evidence / Agency confirmation / Official documents" },
  "status.guide.w.title": { th: "รอดำเนินการ (Pending)", en: "Pending" },
  "status.guide.w.desc": { th: "ยังไม่เริ่มดำเนินการ ไม่มีไฟล์หลักฐานใน Drive โฟลเดอร์ว่างเปล่า หรือยังไม่มีการมอบหมายงาน", en: "Not yet started, no evidence files in Drive, folder is empty, or task has not been assigned." },
  "status.guide.w.needs": { th: "ต้องการ: มอบหมายหน่วยงาน + เริ่มรวบรวมหลักฐาน + อัปโหลดเข้า Drive", en: "Requires: Agency assignment + Begin evidence collection + Upload to Drive" },
  "status.guide.criteria.title": { th: "เกณฑ์การเปลี่ยนสถานะ", en: "Status Transition Criteria" },
  "status.guide.w2p": { th: "รอ → กำลังทำ: มีไฟล์อย่างน้อย 1 ไฟล์ใน Drive + หน่วยงานได้รับมอบหมายแล้ว", en: "Pending → In Progress: At least 1 file in Drive + Agency assigned" },
  "status.guide.p2c": { th: "กำลังทำ → สำเร็จ: หลักฐานครบ + หน่วยงานยืนยัน + ผ่านการตรวจ GSTC", en: "In Progress → Completed: Evidence complete + Agency confirmed + GSTC verified" },

  // === VIEW SWITCHER ===
  "view.grid": { th: "กริด", en: "Grid" },
  "view.list": { th: "รายการ", en: "List" },
  "view.table": { th: "ตาราง", en: "Table" },
  "view.switch": { th: "เปลี่ยนมุมมอง", en: "Switch View" },

  // === ADMIN PANEL ===
  "admin.title": { th: "Admin Panel", en: "Admin Panel" },
  "admin.subtitle": { th: "เข้าถึงได้เฉพาะผู้ดูแลระบบ", en: "Restricted to system administrators" },
  "admin.back": { th: "กลับ Dashboard", en: "Back to Dashboard" },
  "admin.lock": { th: "ล็อก Admin", en: "Lock Admin" },
  "admin.drive.title": { th: "สถานะ Google Drive", en: "Google Drive Status" },
  "admin.drive.folders": { th: "หมวดใน Drive", en: "Categories in Drive" },
  "admin.drive.scanned": { th: "ตัวชี้วัดที่ Scan แล้ว", en: "Indicators Scanned" },
  "admin.drive.completed": { th: "สำเร็จแล้ว", en: "Completed" },
  "admin.drive.pending": { th: "รอดำเนินการ", en: "Pending" },
  "admin.drive.rescan": { th: "สแกน Drive ใหม่", en: "Re-scan Drive" },
  "admin.folder.title": { th: "แผนผังโฟลเดอร์ Drive", en: "Drive Folder Map" },
  "admin.folder.empty": { th: "ยังไม่มีข้อมูลโฟลเดอร์ — กด \"สแกน Drive ใหม่\"", en: "No folder data — click \"Re-scan Drive\"" },

  // === SUBMIT MODAL ===
  "submit.title": { th: "ส่งผลงาน", en: "Submit Portfolio" },
  "submit.subtitle": { th: "อุทัยธานี — Green Destination Top 100", en: "Uthai Thani — Green Destination Top 100" },
  "submit.ready": { th: "พร้อมส่งแล้ว!", en: "Ready to submit!" },
  "submit.not_ready": { th: "ยังมีตัวชี้วัดที่ยังค้างอยู่", en: "Some indicators still pending" },
  "submit.info": { th: "ระบบจะส่งหลักฐานทั้งหมดจาก Google Drive ไปยังคณะกรรมการ Green Destinations", en: "System will send all evidence from Google Drive to the Green Destinations committee" },
  "submit.deadline": { th: "กำหนดส่งผลงาน", en: "Submission deadline" },
  "submit.cancel": { th: "ยกเลิก", en: "Cancel" },
  "submit.confirm": { th: "ยืนยันส่งผลงาน", en: "Confirm Submission" },
  "submit.toast": { th: "✅ บันทึกการส่งแล้ว — ติดต่อผู้ประสานงานของท่าน", en: "✅ Submission recorded — contact your coordinator" },

  // === FOOTER DEV CREDIT ===
  "footer.dev": { th: "พัฒนาโดย นักวิชาการคอมพิวเตอร์ • เทศบาลเมืองอุทัยธานี", en: "Developed by IT Officer • Uthai Thani Municipality" },
  "footer.slogan": { th: "\"ข้อมูลที่ดี คือรากฐานของป่าที่แข็งแรง\"", en: "\"Good data is the root of a resilient forest\"" },
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
  const footerPs = document.querySelectorAll("footer p");
  const f2 = document.querySelector("footer span#adminTrigger");
  if (footerPs[0]) footerPs[0].textContent = t("app.footer.copy");
  if (f2) f2.textContent = t("app.footer.org");
  if (footerPs[1]) {
    footerPs[1].innerHTML = t("footer.dev").replace("นักวิชาการคอมพิวเตอร์", `<span class="text-emerald-forest font-bold">นักวิชาการคอมพิวเตอร์</span>`).replace("IT Officer", `<span class="text-emerald-forest font-bold">IT Officer</span>`);
  }
  const sloganEl = document.querySelector("footer p.italic");
  if (sloganEl) sloganEl.textContent = t("footer.slogan");
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
