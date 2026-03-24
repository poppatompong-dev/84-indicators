// === INTERNATIONALIZATION (i18n) MODULE ===
const SUPPORTED_LANGS = ["th", "en"];

function normalizeLang(lang) {
  return SUPPORTED_LANGS.includes(lang) ? lang : "th";
}

let currentLang = normalizeLang(localStorage.getItem("84_lang") || localStorage.getItem("lang") || "th");
localStorage.setItem("84_lang", currentLang);
document.documentElement.lang = currentLang;

const T = {
  // === GLOBAL ===
  "app.title": { th: "อุทัยธานี Green Destination", en: "Uthai Thani Green Destination" },
  "app.subtitle": { th: "Green Destination • 84 ตัวชี้วัด", en: "Green Destination • 84 Indicators" },
  "app.brand": { th: "The Living Portfolio", en: "The Living Portfolio" },
  "app.footer.copy": { th: "© 2569 (2026) อุทัยธานี Green Destination Portfolio — GSTC", en: "© 2026 Uthai Thani Green Destination Portfolio — GSTC" },
  "app.footer.org": { th: "เทศบาลเมืองอุทัยธานี • Green Destinations Standard", en: "Uthai Thani Municipality • Green Destinations Standard" },
  "nav.dashboard": { th: "แดชบอร์ด", en: "Dashboard" },
  "nav.manual": { th: "คู่มือเจ้าหน้าที่", en: "Staff Manual" },
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
  "admin.mapped": { th: "Mapped แล้ว", en: "Mapped" },
  "admin.locked": { th: "Locked แล้ว", en: "Locked" },
  "admin.autoDiscover": { th: "Auto-Discover", en: "Auto-Discover" },
  "admin.lockAll": { th: "ล็อกทั้งหมด", en: "Lock All" },
  "admin.exportMapping": { th: "Export Mapping", en: "Export Mapping" },
  "admin.importMapping": { th: "Import Mapping", en: "Import Mapping" },
  "admin.debug.title": { th: "Data Integrity Debug Table", en: "Data Integrity Debug Table" },
  "admin.debug.subtitle": { th: "ทุก 84 ตัวชี้วัด — mapping + sync + validation", en: "All 84 indicators — mapping + sync + validation" },
  "admin.debug.validation": { th: "สถานะ", en: "Status" },
  "admin.debug.errorLog": { th: "Sync Error Log", en: "Sync Error Log" },
  "admin.debug.resync": { th: "ซิงค์ซ้ำ", en: "Resync" },
  // === STAFF MANUAL ===
  "manual.title": { th: "คู่มือเจ้าหน้าที่", en: "Staff Manual" },
  "manual.subtitle": { th: "คู่มืออัปโหลดหลักฐาน 84 ตัวชี้วัด — Google Drive", en: "Evidence Upload Guide for 84 Indicators — Google Drive" },
  "manual.download.title": { th: "ดาวน์โหลดเอกสาร", en: "Download Documents" },
  "manual.download.desc": { th: "ดาวน์โหลดคู่มือและแบบฟอร์มสำหรับการอัปโหลดหลักฐาน", en: "Download guides and templates for evidence upload" },
  "manual.download.pdf": { th: "ดาวน์โหลด PDF", en: "Download PDF" },
  "manual.download.doc": { th: "ดาวน์โหลด DOC", en: "Download DOC" },
  "manual.download.xls": { th: "ดาวน์โหลด XLS", en: "Download XLS" },
  "manual.download.started": { th: "กำลังดาวน์โหลด", en: "Downloading" },
  "manual.file.pdf.desc": { th: "คู่มือฉบับสมบูรณ์", en: "Complete guide" },
  "manual.file.doc.desc": { th: "แก้ไขได้ใน Word", en: "Editable in Word" },
  "manual.file.xls.desc": { th: "แบบฟอร์มตัวชี้วัดทั้งหมด", en: "All indicators template" },
  "manual.section.upload.title": { th: "วิธีอัปโหลดไฟล์", en: "How to Upload Files" },
  "manual.step.upload.1": { th: "เปิด Google Drive และเข้าสู่โฟลเดอร์ Root (16SyUIAG…)", en: "Open Google Drive and navigate to the Root folder (16SyUIAG…)" },
  "manual.step.upload.2": { th: "เลือกโฟลเดอร์หมวดที่ตรงกับตัวชี้วัด (เช่น หมวด 1, หมวด 3)", en: "Select the category folder matching the indicator (e.g. หมวด 1, หมวด 3)" },
  "manual.step.upload.3": { th: "เปิดโฟลเดอร์ตัวชี้วัด (เช่น 1ผู้ประสานงาน) แล้วอัปโหลดไฟล์", en: "Open the indicator folder (e.g. 1ผู้ประสานงาน) then upload files" },
  "manual.step.upload.4": { th: "สร้างโฟลเดอร์ย่อย (Subfolder) ได้สูงสุด 3 ระดับ เพื่อจัดระเบียบหลักฐาน", en: "Create subfolders up to 3 levels deep to organize evidence" },
  "manual.section.structure.title": { th: "กฎโครงสร้างโฟลเดอร์", en: "Folder Structure Rules" },
  "manual.step.struct.1": { th: "ระดับ 1: โฟลเดอร์หมวด (หมวด 1–6) — ห้ามเปลี่ยนชื่อ", en: "Level 1: Category folder (หมวด 1–6) — do NOT rename" },
  "manual.step.struct.2": { th: "ระดับ 2: โฟลเดอร์ตัวชี้วัด — ต้องขึ้นต้นด้วยเลข เช่น 1ผู้ประสานงาน", en: "Level 2: Indicator folder — must start with number e.g. 1ผู้ประสานงาน" },
  "manual.step.struct.3": { th: "ระดับ 3–5: โฟลเดอร์ย่อย — ตั้งชื่อเองได้ ไม่เกิน 3 ชั้น", en: "Level 3–5: Subfolders — any name, max 3 levels deep" },
  "manual.step.struct.4": { th: "ระดับสุดท้าย: ไฟล์หลักฐาน — PDF, DOCX, XLSX, JPG, PNG", en: "Final level: Evidence files — PDF, DOCX, XLSX, JPG, PNG" },
  "manual.section.english.title": { th: "การใช้ English Version", en: "English Version Usage" },
  "manual.step.en.1": { th: "ไฟล์ภาษาอังกฤษต้องอยู่ใน English Version > หมวด EN > โฟลเดอร์ตัวชี้วัด EN", en: "EN files must go in: English Version > EN category folder > EN indicator folder" },
  "manual.step.en.2": { th: "ตัวอย่าง: English Version / 1.Visitor Management / 1_English / file.pdf", en: "Example: English Version / 1.Visitor Management / 1_English / file.pdf" },
  "manual.step.en.3": { th: "ห้ามวางไฟล์ EN ไว้ในโฟลเดอร์หมวดภาษาไทย ระบบจะไม่นับ", en: "Do NOT place EN files inside TH category folders — system will not count them" },
  "manual.section.subfolder.title": { th: "การใช้โฟลเดอร์ย่อย", en: "Subfolder Usage" },
  "manual.step.sub.1": { th: "สร้างโฟลเดอร์ย่อยภายในโฟลเดอร์ตัวชี้วัดเพื่อจัดหมวดหมู่หลักฐาน", en: "Create subfolders inside the indicator folder to categorize evidence" },
  "manual.step.sub.2": { th: "ระบบ recursive scan ลึก 3 ชั้น — ไฟล์ทุกชั้นจะถูกนับ", en: "System recursively scans 3 levels deep — files at any level are counted" },
  "manual.step.sub.3": { th: "ตัวอย่าง: 1ผู้ประสาน → รูปภาพ → GSTC ปี 66 → ภาพ.jpg", en: "Example: 1ผู้ประสาน → Photos → GSTC Year 66 → image.jpg" },
  "manual.section.mistakes.title": { th: "ข้อผิดพลาดที่พบบ่อย", en: "Common Mistakes" },
  "manual.step.mistake.1": { th: "อัปโหลดหลักฐาน EN ไว้ในโฟลเดอร์หมวดภาษาไทย (ระบบจะไม่นับ EN)", en: "Uploading EN evidence inside TH category folders (system won't count as EN)" },
  "manual.step.mistake.2": { th: "สร้างโฟลเดอร์ตัวชี้วัดซ้ำกัน ทำให้ระบบ mapping ผิดพลาด", en: "Creating duplicate indicator folders, causing mapping errors" },
  "manual.step.mistake.3": { th: "ชื่อโฟลเดอร์ตัวชี้วัดไม่ขึ้นต้นด้วยเลข ระบบจะไม่รู้จัก", en: "Indicator folder name not starting with a number — system won't recognize it" },
  "manual.step.mistake.4": { th: "โฟลเดอร์ย่อยลึกเกิน 3 ชั้น ไฟล์ในชั้นลึกกว่านั้นจะไม่ถูกนับ", en: "Subfolders deeper than 3 levels — files beyond that depth won't be counted" },
  "manual.section.structure.ref": { th: "โครงสร้าง Drive อ้างอิงฉบับย่อ", en: "Drive Structure Quick Reference" },

  // === DATA INTEGRITY ===
  "data.integrity.ok": { th: "ข้อมูลถูกต้อง", en: "Data OK" },
  "data.integrity.warning": { th: "ไม่สมบูรณ์", en: "Incomplete" },
  "data.integrity.error": { th: "ข้อผิดพลาด", en: "Error" },
  "data.integrity.unknown": { th: "ยังไม่ซิงก์", en: "Not Synced" },
  "data.structure.issue": { th: "พบปัญหาโครงสร้างข้อมูล", en: "Data Structure Issue Detected" },

  // === MAPPING ===
  "mapping.locked": { th: "Mapping ล็อกแล้ว", en: "Mapping Locked" },
  "mapping.unlocked": { th: "Mapping ยังไม่ล็อก", en: "Mapping Unlocked" },
  "mapping.changed": { th: "Mapping เปลี่ยนแปลง", en: "Mapping Changed" },
  "mapping.changes.detected": { th: "พบการเปลี่ยนแปลง mapping", en: "Mapping changes detected" },
  "mapping.alert.title": { th: "พบการเปลี่ยนแปลง Folder Mapping", en: "Folder Mapping Changes Detected" },
  "mapping.alert.changed": { th: "โฟลเดอร์ที่เปลี่ยนแปลง", en: "Changed Folders" },
  "mapping.alert.apply": { th: "อัปเดต Mapping", en: "Apply Changes" },

  // === SYNC STATUS ===
  "sync.lastSynced": { th: "ซิงก์ล่าสุด", en: "Last Synced" },
  "sync.running": { th: "กำลังซิงก์...", en: "Syncing..." },
  "sync.complete": { th: "ซิงก์เสร็จสิ้น", en: "Sync Complete" },

  // === VALIDATION ===
  "validation.folderMissing": { th: "ไม่พบโฟลเดอร์", en: "Folder Not Found" },
  "validation.traversalFailed": { th: "สำรวจโฟลเดอร์ล้มเหลว", en: "Folder Traversal Failed" },
  "validation.duplicateFiles": { th: "พบไฟล์ซ้ำกันข้ามตัวชี้วัด", en: "Duplicate Files Across Indicators" },
  "validation.emptySubfolder": { th: "พบโฟลเดอร์ย่อยว่าง", en: "Empty Subfolder Detected" },
  "validation.rootFilesWithSubfolders": { th: "พบไฟล์ที่ระดับรูทร่วมกับโฟลเดอร์ย่อย", en: "Root-level files exist alongside subfolders" },

  // === SUBFOLDER ===
  "subfolder.title": { th: "โครงสร้างโฟลเดอร์", en: "Folder Structure" },
  "subfolder.rootFiles": { th: "ไฟล์ระดับรูท", en: "Root files" },
  "subfolder.files": { th: "ไฟล์", en: "files" },
  "subfolder.depth": { th: "ระดับ", en: "Depth" },
  "subfolder.count": { th: "โฟลเดอร์ย่อย", en: "Subfolders" },
  "subfolder.enMissing": { th: "ข้อมูลภาษาอังกฤษไม่สมบูรณ์ — ไม่พบโฟลเดอร์ \"English Version\"", en: "Incomplete English data — no \"English Version\" subfolder found" },
  "subfolder.enFound": { th: "พบโฟลเดอร์ English Version", en: "English Version folder found" },

  // === AUDIT VIEW ===
  "audit.title": { th: "ภาพรวมสถานะหลักฐาน", en: "Evidence Status Overview" },
  "audit.subtitle": { th: "สถานะตัวชี้วัดทั้ง 84 ข้อ จากข้อมูลจริงใน Google Drive", en: "Status of all 84 indicators based on actual Google Drive data." },
  "audit.evidence.available": { th: "มีหลักฐาน", en: "Evidence Available" },
  "audit.pending": { th: "รอหลักฐาน", en: "Pending" },
  "audit.mismatch": { th: "สถานะขัดแย้ง", en: "Status Mismatch" },
  "audit.total": { th: "ตัวชี้วัดทั้งหมด", en: "Total Indicators" },
  "audit.indicator": { th: "ตัวชี้วัด", en: "Indicator" },
  "audit.files": { th: "ไฟล์", en: "Files" },
  "audit.evidence.sample": { th: "ตัวอย่างหลักฐาน", en: "Evidence Sample" },
  "audit.status": { th: "สถานะ", en: "Status" },
  "audit.evidence": { th: "หลักฐาน", en: "Evidence" },
  "audit.mismatch.label": { th: "ขัดแย้ง", en: "Mismatch" },
  "audit.override.label": { th: "ปรับแล้ว", en: "Override" },
  "audit.nodata": { th: "ไม่มีข้อมูล", en: "No Data" },
  "audit.verified": { th: "ตรวจแล้ว", en: "Verified" },
  "audit.lang.th": { th: "🇹🇭 ไทย", en: "🇹🇭 Thai" },
  "audit.lang.en": { th: "🌐 อังกฤษ", en: "🌐 English" },

  // === ADMIN PANEL ===
  "admin.back": { th: "กลับ Dashboard", en: "Back" },
  "admin.lock.btn": { th: "ล็อก Admin", en: "Lock Admin" },
  "admin.indicator": { th: "ตัวชี้วัด", en: "Indicator" },
  "admin.subfolders": { th: "โฟลเดอร์ย่อย", en: "Subfolders" },
  "admin.depth": { th: "ระดับ", en: "Depth" },
  "admin.status.header": { th: "สถานะ", en: "Status" },
  "admin.lock.header": { th: "ล็อก", en: "Lock" },
  "admin.mismatch.alert": { th: "สถานะขัดแย้ง", en: "Status Mismatch" },
  "admin.missing.en": { th: "ไม่มี EN Version", en: "Missing EN Version" },
  "admin.new.found": { th: "พบโฟลเดอร์ใหม่", en: "New folders found" },
  "admin.missing.folder": { th: "โฟลเดอร์หายไป", en: "Missing folders" },
  "admin.dismiss": { th: "ปิด", en: "Dismiss" },

  // === CATALOG TABLE ===
  "cat.indicator": { th: "ตัวชี้วัด", en: "Indicator" },
  "cat.category": { th: "หมวด", en: "Category" },
  "cat.agency": { th: "หน่วยงาน", en: "Agency" },
  "cat.files.header": { th: "ไฟล์", en: "Files" },
  "cat.status.header": { th: "สถานะ", en: "Status" },

  // === DETAIL VIEW ===
  "detail.notfound": { th: "ไม่พบตัวชี้วัด", en: "Indicator not found" },
  "detail.rating.select": { th: "— เลือกระดับ —", en: "— Select rating —" },
  "detail.rating.5": { th: "5 — สอดคล้องอย่างสมบูรณ์", en: "5 — Fully compliant" },
  "detail.rating.4": { th: "4 — สอดคล้องเป็นส่วนใหญ่", en: "4 — Mostly compliant" },
  "detail.rating.3": { th: "3 — สอดคล้องบางส่วน", en: "3 — Partially compliant" },
  "detail.rating.2": { th: "2 — มีช่องว่างเล็กน้อย", en: "2 — Minor gaps" },
  "detail.rating.1": { th: "1 — ไม่สอดคล้อง", en: "1 — Non-compliant" },

  // === STATUS ACTIONS ===
  "status.change.confirm": { th: "เปลี่ยนสถานะเป็น", en: "Change status to" },
  "status.change.toast": { th: "เปลี่ยนสถานะตัวชี้วัด", en: "Changed indicator status" },
  "status.reset.confirm": { th: "รีเซ็ตกลับเป็นสถานะจากข้อมูลต้นฉบับ?", en: "Reset to original status from data?" },
  "status.reset.toast": { th: "รีเซ็ตสถานะแล้ว", en: "Status reset complete" },
  "status.reset.btn": { th: "รีเซ็ตสถานะเดิม", en: "Reset original" },

  // === DRIVE MESSAGES ===
  "drive.not.ready": { th: "Drive ยังไม่พร้อม", en: "Drive not ready" },
  "DRIVE_QUOTA_EXCEEDED": { th: "API quota เกินขีดจำกัด — หยุดเรียก API ชั่วคราว", en: "API quota exceeded — calls paused (quota guard)" },
  "DRIVE_API_KEY_BLOCKED": { th: "API Key ถูกบล็อก — กรุณาตรวจสอบ Allowed Referrer ใน Google Cloud Console", en: "API Key blocked — check Allowed Referrer in Google Cloud Console" },
  "DRIVE_FOLDER_NOT_FOUND": { th: "ไม่พบโฟลเดอร์ — ตรวจสอบ Folder ID", en: "Folder not found — check Folder ID" },
  "DRIVE_ACCESS_DENIED": { th: "ไม่มีสิทธิ์เข้าถึง — ตรวจสอบว่าโฟลเดอร์แชร์เป็น 'Anyone with the link'", en: "Access denied — ensure folder is shared as 'Anyone with the link'" },
  "drive.error.prefix": { th: "เกิดข้อผิดพลาด: ", en: "Error: " },
  "drive.scanning": { th: "กำลังสแกน Drive...", en: "Scanning Drive..." },
  "drive.not.connected": { th: "Drive ยังไม่เชื่อมต่อ", en: "Drive not connected" },
  "drive.no.mapping": { th: "ยังไม่มี mapping — กด Auto-Discover ก่อน", en: "No mapping to lock — run Auto-Discover first" },
  "drive.mapping.applied": { th: "อัปเดต mapping แล้ว", en: "Mapping changes applied & locked" },
  "drive.just_now": { th: "เมื่อสักครู่", en: "Just now" },
  "drive.updated_x_min_ago": { th: "อัปเดตเมื่อ {x} นาทีที่แล้ว", en: "Updated {x} min ago" },
  "drive.never_refreshed": { th: "ยังไม่เคยอัปเดต", en: "Never refreshed" },

  // === DASHBOARD HERO ===
  "dash.hero.completed": { th: "สำเร็จแล้ว", en: "Completed" },
  "dash.hero.inprogress": { th: "กำลังดำเนินการ", en: "In Progress" },
  "dash.hero.pending": { th: "รอดำเนินการ", en: "Pending" },
  "dash.hero.mapped": { th: "จับคู่แล้ว", en: "Mapped" },

  // === MISMATCH (catalog) ===
  "mismatch.label": { th: "ขัดแย้ง", en: "Mismatch" },

  // === OFFLINE ===
  "offline.message": { th: "ขาดการเชื่อมต่ออินเทอร์เน็ต", en: "No internet connection" },
  "offline.retry": { th: "ลองใหม่", en: "Retry" },

  // === SUBMIT MODAL WORKFLOW ===
  "submit.indicators.completed": { th: "ตัวชี้วัดสำเร็จแล้ว", en: "indicators completed" },
  "submit.workflow.title": { th: "หลังกดยืนยันแล้วจะเกิดอะไรขึ้น?", en: "What happens after I confirm?" },
  "submit.step1.title": { th: "บันทึก Snapshot", en: "Snapshot Saved" },
  "submit.step1.desc": { th: "สถานะปัจจุบันและไฟล์หลักฐานทั้งหมดจะถูกบันทึกเป็น snapshot ลงใน localStorage", en: "Current progress and all evidence files are recorded as a submission snapshot in localStorage." },
  "submit.step2.title": { th: "ล็อกสถานะ", en: "Status Locked" },
  "submit.step2.desc": { th: "สถานะตัวชี้วัดจะถูกตรึงไว้ ณ เวลาที่ส่ง ยังคงดูข้อมูลได้แต่ไม่สามารถแก้ไขได้", en: "Indicator statuses are frozen at submission time. You can still view but not change data." },
  "submit.step3.title": { th: "พร้อมให้ตรวจประเมิน", en: "Ready for Audit" },
  "submit.step3.desc": { th: "แดชบอร์ดจะเข้าสู่โหมดอ่านอย่างเดียวสำหรับคณะกรรมการตรวจประเมิน Green Destinations", en: "The portfolio dashboard enters read-only mode for the Green Destinations evaluation committee." },
  "submit.step4.title": { th: "ข้อเสนอแนะจากกรรมการ", en: "Auditor Feedback" },
  "submit.step4.desc": { th: "กรรมการตรวจแต่ละตัวชี้วัด ให้คะแนนความสอดคล้อง (1-5) และบันทึกข้อเสนอแนะในระบบ", en: "Evaluators review each indicator, rate compliance (1-5), and record feedback in the system." },
  "submit.step5.title": { th: "ผลการประเมิน", en: "Final Result" },
  "submit.step5.desc": { th: "Green Destinations ประกาศผล หากผ่านการรับรอง อุทัยธานีจะเข้าสู่ Top 100 อย่างเป็นทางการ", en: "Results are announced by Green Destinations. If certified, Uthai Thani enters the Top 100 list." },

  // === ADMIN PROMPTS / TOASTS ===
  "admin.prompt.password": { th: "🔐 รหัสผ่าน Admin:", en: "🔐 Admin Password:" },
  "admin.mode.opened": { th: "🔓 Admin Mode เปิดแล้ว", en: "🔓 Admin Mode enabled" },
  "admin.mode.locked": { th: "🔒 Admin Mode ปิดแล้ว", en: "🔒 Admin Mode locked" },
  "admin.wrong.password": { th: "รหัสผิด", en: "Incorrect password" },

  // === FEEDBACK FORM ===
  "feedback.required": { th: "กรุณากรอกข้อความ", en: "Please enter feedback text" },
  "feedback.author": { th: "ผู้ตรวจประเมิน", en: "Evaluator" },
  "feedback.saved": { th: "✅ บันทึกข้อเสนอแนะแล้ว", en: "✅ Feedback saved" },
  "feedback.confirm.delete": { th: "ลบข้อเสนอแนะนี้?", en: "Delete this feedback?" },
  "feedback.deleted": { th: "ลบข้อเสนอแนะแล้ว", en: "Feedback deleted" },

  // === ARIA LABELS (accessibility) ===
  "skip.nav": { th: "ข้ามไปยังเนื้อหาหลัก", en: "Skip to main content" },
  "sidebar.aria": { th: "หมวดหมู่ตัวชี้วัด", en: "Indicator categories" },
  "nav.open.menu": { th: "เปิดเมนู", en: "Open menu" },
  "nav.brand.aria": { th: "The Living Portfolio — ไปยังหน้าแรก", en: "The Living Portfolio — Go to home" },
  "nav.main.aria": { th: "เมนูหลัก", en: "Main navigation" },
  "nav.sidebar.aria": { th: "หมวดหมู่", en: "Categories" },
  "search.aria": { th: "ค้นหาตัวชี้วัด", en: "Search indicators" },
  "refresh.btn.aria": { th: "ดึงข้อมูลใหม่จาก Drive", en: "Refresh Drive data" },
  "lang.toggle.aria": { th: "เปลี่ยนภาษา", en: "Switch language" },
  "org.aria": { th: "เทศบาลเมืองอุทัยธานี", en: "Uthai Thani Municipality" },
  "status.change.aria": { th: "เปลี่ยนสถานะ", en: "Change status" },

  // === MANUAL FOLDER DIAGRAM ===
  "manual.diagram.cat1": { th: "หมวด 1 การจัดการแหล่งท่องเที่ยว/", en: "Category 1 Destination Management/" },
  "manual.diagram.indicator": { th: "1ผู้ประสานงาน/", en: "1_Coordinator/" },
  "manual.diagram.subfolder": { th: "รูปภาพ/ → ภาพ ปี 66/ → ไฟล์", en: "Photos/ → GSTC Year 66/ → file" },
  "manual.diagram.cats346": { th: "หมวด 3, 4, 6 …", en: "Categories 3, 4, 6 …" },

  // === FEEDBACK ===
  "detail.feedback.recorded": { th: "มีข้อเสนอแนะแล้ว", en: "Feedback recorded" },
  "detail.feedback.rating.aria": { th: "คะแนน", en: "Rating" },
  "detail.feedback.delete": { th: "ลบ", en: "Delete" },
  "detail.feedback.edit": { th: "แก้ไขข้อเสนอแนะ", en: "Edit feedback" },
  "detail.feedback.update.placeholder": { th: "แก้ไขข้อเสนอแนะ...", en: "Update feedback..." },
  "detail.feedback.save.changes": { th: "บันทึกการแก้ไข", en: "Save changes" },
  "detail.feedback.compliance.label": { th: "ระดับความสอดคล้อง", en: "Compliance rating" },
  "detail.feedback.recommendations.label": { th: "ข้อเสนอแนะและความคิดเห็น", en: "Feedback & recommendations" },
  "detail.feedback.recommendations.placeholder": { th: "ระบุผลการประเมิน ช่องว่างที่พบ และแนวทางการดำเนินการแนะนำ...", en: "Enter evaluation findings, gaps found, and recommended actions..." },
  "detail.feedback.save": { th: "บันทึกข้อเสนอแนะ", en: "Save feedback" },
  "detail.feedback.locked": { th: "ข้อเสนอแนะสำหรับผู้ตรวจประเมินเท่านั้น — เข้าสู่ระบบ Admin เพื่อบันทึกผลการประเมิน", en: "Feedback is restricted to evaluators. Please sign in as Admin to record findings." },

  // === MAPPING VERIFICATION ===
  "mapping.data.connected": { th: "เชื่อมต่อแหล่งข้อมูลแล้ว", en: "Data source connected" },
  "mapping.data.awaiting": { th: "รอการเชื่อมต่อข้อมูล", en: "Awaiting data synchronization" },
  "mapping.pending": { th: "รอข้อมูล", en: "Pending" },
  "mapping.cat.found": { th: "พบโฟลเดอร์หมวดใน Drive", en: "Category folder found in Drive" },
  "mapping.cat.notfound": { th: "ไม่พบโฟลเดอร์หมวดใน Drive", en: "Category folder NOT found in Drive" },
  "mapping.validation.note": { th: "ไฟล์ในโฟลเดอร์ \"{folder}\" ถูกจับคู่กับตัวชี้วัดข้อ {id} หมวด {cat} กรรมการจะตรวจประเมินไฟล์เหล่านี้สำหรับตัวชี้วัดนี้โดยเฉพาะ", en: "Files in folder \"{folder}\" are mapped to Indicator #{id} in Category {cat}. Auditors will review these files for this specific indicator." },

  // === FILE SUMMARY ===
  "files.count": { th: "ไฟล์", en: "files" },
  "files.root": { th: "ไฟล์ระดับรูท", en: "Root files" },

  // === EVIDENCE STATES ===
  "evidence.preparing": { th: "กำลังจัดเตรียมข้อมูลหลักฐาน จะพร้อมแสดงในเร็วๆ นี้", en: "Evidence data is being prepared and will be available soon." },
  "evidence.en.preparing": { th: "กำลังจัดเตรียมข้อมูลภาษาอังกฤษ จะแสดงอัตโนมัติเมื่อพร้อม", en: "English evidence is being prepared. Content will appear automatically once available." },
  "traversal.depth": { th: "ระดับ", en: "Depth" },
  "traversal.folders": { th: "โฟลเดอร์", en: "Folders" },
  "traversal.subfolders": { th: "โฟลเดอร์ย่อย", en: "Subfolders" },

  // === SNAPSHOT TOAST ===
  "submit.snapshot.detail": { th: "Snapshot: {done}/{total} สำเร็จ, {fb} ข้อเสนอแนะ", en: "Snapshot: {done}/{total} completed, {fb} feedback recorded" },

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

  // === WELCOME PORTAL ===
  "welcome.title": { th: "ยินดีต้อนรับสู่ Living Portfolio", en: "Welcome to the Living Portfolio" },
  "welcome.subtitle": { th: "Uthai Thani Green Destination • ระบบตัวชี้วัด 84 ข้อ", en: "Uthai Thani Green Destination • 84 Indicators System" },
  "welcome.staff.title": { th: "สำหรับเจ้าหน้าที่", en: "For Staff" },
  "welcome.staff.desc": { th: "โปรดตรวจสอบว่าไฟล์ประเมินทั้งหมดถูกอัปโหลดไปยัง Google Drive อย่างถูกต้อง ระบบจะบังคับใช้ความถูกต้องของข้อมูล และลดสถานะอัตโนมัติเมื่อหลักฐานไม่ครบถ้วน", en: "Ensure all evaluation files are correctly uploaded to Google Drive. The system strictly enforces Data Accuracy and will auto-downgrade incomplete statuses." },
  "welcome.staff.item1": { th: "อัปโหลดหลักฐานลง Google Drive Folder ที่ถูกต้องโดยตรง", en: "Upload evidence directly to exact Google Drive Folders." },
  "welcome.staff.item2": { th: "ข้อมูลจะซิงก์อัตโนมัติเมื่อกดปุ่มรีเฟรช", en: "Data syncs automatically upon pressing Refresh." },
  "welcome.staff.item3": { th: "สถานะ \"สำเร็จ\" ต้องพบไฟล์อย่างน้อย 1 ไฟล์", en: "\"Complete\" status requires at least 1 file to be found." },
  "welcome.evaluator.title": { th: "สำหรับกรรมการ", en: "For Evaluators" },
  "welcome.evaluator.desc": { th: "ตรวจสอบหลักฐานเชิงโครงสร้างอย่างเป็นทางการของอุทัยธานี ระบบแยกภาษา (TH/EN) และช่วยลดความคลาดเคลื่อนในการตรวจหลักฐาน", en: "Review the official Uthai Thani structural evidence. Our system isolates languages (TH/EN) and helps minimize false-positives in evidence checks." },
  "welcome.evaluator.item1": { th: "สลับติดตามภาษาไทย/อังกฤษได้ทันที", en: "Switch instantly between Thai/English tracking." },
  "welcome.evaluator.item2": { th: "ใช้แท็บ Data Verification เพื่อตรวจเช็กลิสต์ไฟล์ที่ขาดแบบโปร่งใส", en: "Use the Data Verification audit tab to see a transparent checklist of missing files." },
  "welcome.evaluator.item3": { th: "คลิกไฟล์ในแคตตาล็อกเพื่อเปิดภาพปกความละเอียดสูงอย่างปลอดภัย", en: "Click any catalog file to open high-res thumbnail covers securely." },
  "welcome.noshow": { th: "ไม่ต้องแสดงอีก (ไม่ติดตามแคชของฉัน)", en: "Do not show again (Don't track my cache)" },
  "welcome.enter": { th: "เข้าสู่ระบบ", en: "Enter System" },

  // === STATIC METADATA (100% EN) ===
  "ข้อตกลงและการจัดองค์กร": { en: "Agreements & Organization" },
  "การวางแผนและการพัฒนา": { en: "Planning & Development" },
  "การจัดการนักท่องเที่ยว": { en: "Visitor Management" },
  "การติดตามตรวจสอบและการรายงาน": { en: "Monitoring & Reporting" },
  "การปฏิบัติตามกฎหมายและจริยธรรม": { en: "Legal & Ethical Compliance" },
  "ธรรมชาติและการอนุรักษ์": { en: "Nature & Conservation" },
  "ประสบการณ์ด้านสัตว์และธรรมชาติ": { en: "Animal & Nature Experience" },
  "การใช้ที่ดินและมลพิษ": { en: "Land Use & Pollution" },
  "การจัดการน้ำ": { en: "Water Management" },
  "ขยะและการรีไซเคิล": { en: "Waste & Recycling" },
  "พลังงานและการเปลี่ยนแปลงสภาพภูมิอากาศ": { en: "Energy & Climate Change" },
  "การปรับตัวกับการเปลี่ยนแปลงสภาพภูมิอากาศ": { en: "Climate Change Adaptation" },
  "มรดกทางวัฒนธรรม": { en: "Cultural Heritage" },
  "ผู้คนและประเพณี": { en: "People & Traditions" },
  "การเคารพในความเป็นมนุษย์": { en: "Respect for Human Rights" },
  "การมีส่วนร่วมของชุมชน": { en: "Community Involvement" },
  "เศรษฐกิจชุมชน": { en: "Community Economy" },
  "ผลกระทบทางสังคม-เศรษฐกิจ": { en: "Socio-Economic Impacts" },
  "สุขภาพและความปลอดภัย": { en: "Health & Safety" },
  "การมีส่วนร่วมของภาคธุรกิจ": { en: "Business Sector Involvement" },
  "การจ้างงานและมาตรฐานธุรกิจ": { en: "Employment & Business Standards" },
  "การให้ข้อมูลและการทำการตลาด": { en: "Information & Marketing" },
  "เทศบาลเมืองอุทัยธานี": { en: "Uthai Thani Municipality" },
  "สำนักงานจังหวัดอุทัยธานี": { en: "Uthai Thani Provincial Office" },
  "สำนักงานวัฒนธรรมจังหวัดอุทัยธานี": { en: "Uthai Thani Provincial Cultural Office" },
  "ททท.สำนักงานอุทัยธานี": { en: "TAT Uthai Thani Office" },
  "สำนักงานสถิติจังหวัดอุทัยธานี": { en: "Uthai Thani Provincial Statistical Office" },
  "สำนักงานท่องเที่ยวและกีฬาจังหวัดอุทัยธานี": { en: "Uthai Thani Provincial Tourism and Sports Office" },
  "สำนักงานทรัพยากรธรรมชาติฯ": { en: "Office of Natural Resources and Environment" },
  "สำนักงานการท่องเที่ยวและกีฬาฯ": { en: "Office of Tourism and Sports" },
  "สำนักงานประชาสัมพันธ์จังหวัดอุทัยธานี": { en: "Uthai Thani Provincial Public Relations Office" },
  "โครงการชลประทานอุทัยธานี": { en: "Uthai Thani Irrigation Project" },
  "สำนักงานป้องกันฯ": { en: "Office of Disaster Prevention and Mitigation" },
  "สนง.โยธาธิการและผังเมือง": { en: "Office of Public Works and Town & Country Planning" },
  "สำนักงานประมงจังหวัดอุทัยธานี": { en: "Uthai Thani Provincial Fisheries Office" },
  "โครงการชลประทาน": { en: "Irrigation Project" },
  "สำนักงานประมงฯ": { en: "Fisheries Office" },
  "สำนักงานปศุสัตว์จังหวัดอุทัยธานี": { en: "Uthai Thani Provincial Livestock Office" },
  "สำนักงานส่งเสริมการปกครองท้องถิ่นฯ": { en: "Office of Local Administration" },
  "อำเภอเมืองอุทัยธานี": { en: "Mueang Uthai Thani District" },
  "สนง.โยธาธิการฯ": { en: "Office of Public Works" },
  "สำนักงานเกษตรและสหกรณ์ฯ": { en: "Office of Agriculture and Cooperatives" },
  "ผู้ประกอบการ/สมาคมธุรกิจท่องเที่ยว": { en: "Entrepreneurs / Tourism Business Assoc." },
  "สำนักงานสิ่งแวดล้อมฯ ที่ 4": { en: "Regional Environment Office 4" },
  "องค์การบำบัดน้ำเสีย": { en: "Wastewater Management Authority" },
  "สำนักงานท่องเที่ยวฯ": { en: "Tourism Office" },
  "สำนักงานขนส่งจังหวัดอุทัยธานี": { en: "Uthai Thani Provincial Transport Office" },
  "สำนักงานพลังงานจังหวัดอุทัยธานี": { en: "Uthai Thani Provincial Energy Office" },
  "สำนักงานพระพุทธศาสนาฯ": { en: "Office of Buddhism" },
  "สำนักศิลปากรที่ 4 ลพบุรี": { en: "Fine Arts Department Region 4 Lopburi" },
  "สำนักศิลปากรที่ 4": { en: "Fine Arts Department Region 4" },
  "สำนักงานพัฒนาสังคมฯ": { en: "Office of Social Development & Human Security" },
  "สำนักงานโยธาธิการฯ": { en: "Office of Public Works" },
  "สำนักงานพาณิชย์ฯ": { en: "Provincial Commercial Office" },
  "ที่ทำการปกครองจังหวัดอุทัยธานี": { en: "Uthai Thani Provincial Admin Office" },
  "ผู้ประกอบการ/หอการค้าจังหวัดอุทัยธานี": { en: "Entrepreneurs / Chamber of Commerce" },
  "สำนักงานเกษตรฯ": { en: "Provincial Agriculture Office" },
  "สำนักงานการท่องเที่ยวฯ": { en: "Provincial Tourism Office" },
  "สำนักงานสาธารณสุขฯ": { en: "Provincial Public Health Office" },
  "สถานีตำรวจภูธรเมืองอุทัยธานี": { en: "Mueang Uthai Thani Police Station" },
  "ที่ทำการปกครองฯ": { en: "Administrative Office" },
  "สำนักงานสิ่งแวดล้อมฯ": { en: "Regional Environment Office" },
  "สำนักงานประชาสัมพันธ์ฯ": { en: "Provincial Public Relations Office" },
  "การประปาส่วนภูมิภาคฯ": { en: "Provincial Waterworks Authority" },
  "ผู้ประกอบการ": { en: "Entrepreneurs" },
  "สำนักงานพลังงานฯ": { en: "Provincial Energy Office" },
  "สำนักงานขนส่งฯ": { en: "Provincial Transport Office" },
  "สำนักงานแรงงานจังหวัดอุทัยธานี": { en: "Uthai Thani Provincial Labour Office" },
  "สำนักงานวัฒนธรรมฯ": { en: "Provincial Cultural Office" }
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

// === INDICATOR ENGLISH TITLES ===
// Now dynamically loaded via drive.js EN Sync Engine

function t(key) {
  const entry = T[key];
  if (!entry) return key;
  return entry[currentLang] || entry["en"] || entry["th"] || key;
}

function setLang(lang) {
  currentLang = normalizeLang(lang);
  localStorage.setItem("84_lang", currentLang);
  document.documentElement.lang = currentLang;

  // Invalidate Drive cache so data reloads for the new language
  if (typeof driveCache !== 'undefined') {
    Object.keys(driveCache).forEach(k => delete driveCache[k]);
  }

  // Rebuild language-aware status map
  if (typeof rebuildDriveStatusMap === 'function') rebuildDriveStatusMap();

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
  // === data-i18n: update textContent for all tagged elements ===
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (key) el.textContent = t(key);
  });

  // === data-i18n-aria: update aria-label for all tagged elements ===
  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    const key = el.getAttribute("data-i18n-aria");
    if (key) el.setAttribute("aria-label", t(key));
  });

  // === data-i18n-aria-key: sync aria-label with same key as textContent ===
  document.querySelectorAll("[data-i18n-aria-key]").forEach(el => {
    const key = el.getAttribute("data-i18n-aria-key");
    if (key) el.setAttribute("aria-label", t(key));
  });

  // === Sidebar brand title (bilingual, not a translation key) ===
  const brandTitle = document.querySelector("[data-i18n-sidebar-brand]");
  if (brandTitle) brandTitle.textContent = currentLang === "en" ? "Uthai Thani" : "อุทัยธานี";

  // === Footer developer credit (language-aware, contains bold span) ===
  const footerDevEl = document.querySelector("[data-i18n-footer-dev]");
  if (footerDevEl) {
    const raw = t("footer.dev");
    // Wrap the job title portion in bold span regardless of language
    const boldified = raw
      .replace("นักวิชาการคอมพิวเตอร์", `<span class="text-emerald-forest font-bold">นักวิชาการคอมพิวเตอร์</span>`)
      .replace("IT Officer", `<span class="text-emerald-forest font-bold">IT Officer</span>`);
    footerDevEl.innerHTML = boldified;
  }

  // === Global search placeholder + aria-label ===
  const gs = document.getElementById("globalSearch");
  if (gs) {
    gs.placeholder = t("search.placeholder");
    gs.setAttribute("aria-label", t("search.aria"));
  }

  // Welcome language switcher state
  const welcomeLangTh = document.getElementById("welcomeLangTH");
  const welcomeLangEn = document.getElementById("welcomeLangEN");
  if (welcomeLangTh && welcomeLangEn) {
    const activeCls = ["text-white", "font-bold"];
    const inactiveCls = ["text-white/70", "font-medium"];
    welcomeLangTh.classList.remove(...activeCls, ...inactiveCls);
    welcomeLangEn.classList.remove(...activeCls, ...inactiveCls);
    if (currentLang === "th") {
      welcomeLangTh.classList.add(...activeCls);
      welcomeLangEn.classList.add(...inactiveCls);
    } else {
      welcomeLangEn.classList.add(...activeCls);
      welcomeLangTh.classList.add(...inactiveCls);
    }
  }
}

// Get category name in current language
function catName(catId) {
  const cat = typeof CATS !== "undefined" ? CATS.find(c => c.id === catId) : null;
  if (currentLang === "en" && cat) return cat.en;
  if (cat) return cat.n;
  const cn = CAT_NAMES[catId];
  return cn ? cn[currentLang] : `Category ${catId}`;
}

// Apply i18n on first load
document.addEventListener("DOMContentLoaded", updateStaticI18n);

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
