# DEV BLUEPRINT — 84 Indicators Portfolio
## คู่มือพัฒนาสำหรับ AI Agent

> **Project:** อุทัยธานี Green Destination — 84 GSTC Indicators Tracker
> **Stack:** Vanilla JS SPA · Tailwind CSS CDN · No build step · Vercel
> **Deploy:** https://84-indicators.vercel.app/code
> **Drive Root:** https://drive.google.com/drive/folders/16SyUIAG8sHsgQDmlGjO5cB4-8nRGP1L9
> **Last audited:** March 2026

---

## SECTION 0 — CRITICAL FACTS (อ่านก่อนทุกครั้ง)

ข้อเท็จจริงที่ต้องรู้ก่อนแตะโค้ดแม้แต่บรรทัดเดียว:

1. **ข้อมูลใน Drive เปลี่ยนได้ตลอดเวลา** — ทีมงานกำลังเติมข้อมูลอยู่ โค้ดต้องรองรับโครงสร้างที่ยืดหยุ่น ไม่ hardcode folder ID ของ indicator ใดๆ ทั้งสิ้น
2. **สองเวอร์ชันแยกกันสิ้นเชิง** — ภาษาไทยและภาษาอังกฤษใช้คนละโฟลเดอร์ คนละเนื้อหา คนละ root folder ID
3. **SYSTEM.md มีบางส่วนไม่ตรงกับความเป็นจริง** — ชื่อโฟลเดอร์จริงบน Drive ต่างจากที่ document ไว้ (ดู Section 1)
4. **ห้ามลบหรือเขียนทับไฟล์ใน Drive** — ระบบนี้อ่านอย่างเดียว (read-only) ไม่เคย write กลับ Drive
5. **Quota คือข้อจำกัดหลัก** — Google Drive API free tier มี 10,000 calls/วัน cache ให้ดีที่สุด

---

## SECTION 1 — ACTUAL GOOGLE DRIVE STRUCTURE (โครงสร้างจริง)

> ⚠️ โครงสร้างนี้คือสิ่งที่ค้นพบจากการ scan จริง ณ มีนาคม 2026
> ถ้าต้องการ re-verify ให้ list children ของ root folder ID ก่อนทำงานเสมอ

### 1.1 Root Folder (TH + EN อยู่ที่เดียวกัน)

```
Root (16SyUIAG8sHsgQDmlGjO5cB4-8nRGP1L9)
├── หมวด 1 การจัดการแหล่งท่องเที่ยว/    folderId: 1malneVFQVF9HN2xJ98JD6tnZWmHbTOQJ
├── หมวด 3 สิ่งแวดล้อมและสภาพภูมิอากาศ/ folderId: 1tmMplQc4_kdeOiVXHTTOmPkIb8qgetLw
├── หมวด 4 วัฒนธรรมและประเพณี/          folderId: 1VyXhDtmj4TrrYdZWWq2k8x0FLYQcWy28
├── หมวด 6 การประกอบธุรกิจและการบริการ/ folderId: 1IJ4zYe2eDMfqEpHFT7UQBcooxYBkXMT4
└── English Version/                     folderId: 1hNi__LPENVWEbMMlTU2lOsrZsDLGGY4Y
    (หมวด 2 และ หมวด 5 จะถูกเพิ่มในอนาคต)
```

### 1.2 Thai Category Folder → Naming Pattern

**Pattern:** `หมวด {N} {ThaiName}`
**Regex ที่ใช้ match catId:** `/หมวด\s*(\d+)/i`

```
"หมวด 1 การจัดการแหล่งท่องเที่ยว" → catId = 1
"หมวด 3 สิ่งแวดล้อมและสภาพภูมิอากาศ" → catId = 3
```

**ห้ามใช้ pattern เดิม** `/^(\d+)/` เพราะชื่อโฟลเดอร์เริ่มด้วยภาษาไทย ไม่ใช่ตัวเลข

### 1.3 Thai Indicator Folder → Naming Pattern

**Pattern:** `{N}{ThaiShortTitle}` (ตัวเลขแปะหน้า ไม่มี separator)
**Regex:** `/^(\d+)/`

```
"1ผู้ประสานงาน"                     → indicatorId = 1
"10การติดตามเฝ้าสังเกต"             → indicatorId = 10
"20การจัดซื้อและการแข่งขันอย่างเป็นธรรม" → indicatorId = 20
```

### 1.4 Thai Indicator Subfolder → Any Name

ภายในโฟลเดอร์ indicator อาจมี **subfolder ชื่ออะไรก็ได้** เช่น:
```
1ผู้ประสานงาน/
└── รูปภาพการฝึกอบรม/    ← subfolder ที่ทีมตั้งชื่อเอง
    └── [files]
```

ต้อง **recursive scan ลึก 2 ชั้น** (indicator folder + 1 ชั้น subfolder) เพื่อดึงไฟล์ให้ครบ

### 1.5 English Version Structure

```
English Version (1hNi__LPENVWEbMMlTU2lOsrZsDLGGY4Y)
├── 1.Visitor Management/    folderId: 1vF4kPToGgh1pBgQWYolOgbVvFWV357fg
│   ├── 1_English/           → EN indicator 1
│   ├── 2_English/           → EN indicator 2
│   └── ... up to 9_English
├── 3.Water management/      folderId: 1KjIyMAepZ3aDH5sd6hzdMdMg-miTbakb
└── (หมวดอื่นๆ จะถูกเพิ่มในอนาคต)
```

**English Category Folder Pattern:** `{N}.{EnglishName}`
**Regex:** `/^(\d+)\./`

**English Indicator Folder Pattern:** `{N}_English`
**Regex:** `/^(\d+)_/`

### 1.6 โครงสร้างเปรียบเทียบ TH vs EN

| ระดับ | TH Format | EN Format | Regex extract catId/indId |
|-------|-----------|-----------|--------------------------|
| Category | `หมวด N {name}` | `N.{name}` | TH: `/หมวด\s*(\d+)/` · EN: `/^(\d+)\./` |
| Indicator | `N{ThaiTitle}` | `N_English` | Both: `/^(\d+)/` |
| Subfolder | ชื่ออะไรก็ได้ | ชื่ออะไรก็ได้ | ไม่ match — เก็บไฟล์ทั้งหมด |

---

## SECTION 2 — DRIVE CONFIGURATION (การตั้งค่า)

### 2.1 DRIVE_CONFIG ที่ถูกต้อง

```javascript
const DRIVE_CONFIG = {
  API_KEY: "<your-restricted-api-key>",
  ROOT_FOLDER_ID: "16SyUIAG8sHsgQDmlGjO5cB4-8nRGP1L9",  // root เดียวกัน
  EN_ROOT_FOLDER_ID: "1hNi__LPENVWEbMMlTU2lOsrZsDLGGY4Y", // English Version subfolder

  // ⚠️ ไม่ควร hardcode folder ID ของแต่ละหมวด/ตัวชี้วัด
  // ให้ build dynamically จาก root แทน

  API_BASE: "https://www.googleapis.com/drive/v3",
  CACHE_TTL: 5 * 60 * 1000,   // 5 นาที
  SUBFOLDER_DEPTH: 2,          // ลึกสูงสุด 2 ชั้นจาก indicator folder
  DAILY_QUOTA: 10000,
  QUOTA_GUARD_THRESHOLD: 0.90, // หยุดเมื่อใช้ quota ถึง 90%
  REQUEST_TIMEOUT: 15000,      // 15s timeout
  MAX_RETRIES: 3,
};
```

### 2.2 Language-Aware Root Resolution

```javascript
function getDriveRoot(lang) {
  // lang = "th" | "en"
  if (lang === "en") return DRIVE_CONFIG.EN_ROOT_FOLDER_ID;
  return DRIVE_CONFIG.ROOT_FOLDER_ID; // สำหรับ TH จะ list แล้ว filter "English Version" ออก
}
```

---

## SECTION 3 — FOLDER MATCHING ALGORITHM (อัลกอริทึมจับคู่โฟลเดอร์)

### 3.1 Category Matching

```javascript
/**
 * จับคู่โฟลเดอร์ระดับ category กับ catId
 * รองรับทั้ง TH ("หมวด N ...") และ EN ("N. ...")
 */
function extractCatIdFromFolderName(folderName, lang) {
  let match;
  if (lang === "th") {
    // Pattern: "หมวด 1 ..." หรือ "หมวด1..."
    match = folderName.match(/หมวด\s*(\d+)/i);
  } else {
    // Pattern: "1. ..." หรือ "1 ..."
    match = folderName.match(/^(\d+)[.\s]/);
    if (!match) match = folderName.match(/^(\d+)$/);
  }
  return match ? parseInt(match[1], 10) : null;
}
```

### 3.2 Indicator Matching

```javascript
/**
 * จับคู่โฟลเดอร์ระดับ indicator กับ indicatorId
 * รองรับ "27การมีปฏิสัมพันธ์" และ "27_English"
 */
function extractIndicatorIdFromFolderName(folderName) {
  const match = folderName.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}
```

### 3.3 Subfolder File Collection

```javascript
/**
 * ดึงไฟล์จาก indicator folder รวมถึง subfolders ทั้งหมด
 * depth = จำนวนชั้นที่จะ recurse ลงไป (default: SUBFOLDER_DEPTH = 2)
 */
async function collectFilesRecursive(folderId, depth = DRIVE_CONFIG.SUBFOLDER_DEPTH) {
  const items = await listFolderContents(folderId);
  let files = items.filter(item => item.mimeType !== "application/vnd.google-apps.folder");
  const subfolders = items.filter(item => item.mimeType === "application/vnd.google-apps.folder");

  if (depth > 0) {
    for (const subfolder of subfolders) {
      const subFiles = await collectFilesRecursive(subfolder.id, depth - 1);
      // แนบ subfolder name เพื่อแสดง grouping ใน UI
      subFiles.forEach(f => f._subfolderName = f._subfolderName || subfolder.name);
      files = files.concat(subFiles);
    }
  }
  return files;
}
```

### 3.4 buildDriveFolderMap ที่ถูกต้อง

```javascript
/**
 * สร้าง map: catId → folderId
 * เรียกครั้งเดียวต่อ session แล้ว cache
 */
async function buildDriveFolderMap(lang) {
  const rootId = getDriveRoot(lang);
  const items = await listFolderContents(rootId);

  const map = {}; // { catId: folderId }

  for (const item of items) {
    if (item.mimeType !== "application/vnd.google-apps.folder") continue;

    // สำหรับ TH: ข้ามโฟลเดอร์ "English Version"
    if (lang === "th" && item.name === "English Version") continue;

    const catId = extractCatIdFromFolderName(item.name, lang);
    if (catId !== null) {
      map[catId] = item.id;
    } else {
      console.warn(`[Drive] Cannot extract catId from folder: "${item.name}"`);
    }
  }

  return map; // e.g. { 1: "1malneVFQ...", 3: "1tmMplQc...", 4: "...", 6: "..." }
}
```

### 3.5 driveFilesForIndicator ที่ถูกต้อง

```javascript
async function driveFilesForIndicator(indicatorId, catId, lang) {
  // 1. ดึง folderMap ของ language นั้น (ใช้ cache)
  const folderMap = await getFolderMap(lang); // cached version of buildDriveFolderMap

  // 2. หา category folder
  const catFolderId = folderMap[catId];
  if (!catFolderId) {
    return { files: [], matched: false, reason: `catId ${catId} not found in Drive` };
  }

  // 3. List indicator folders ภายใน category
  const indicatorFolders = await listFolderContents(catFolderId);

  // 4. หา indicator folder ที่ตรง
  const indicatorFolder = indicatorFolders.find(f => {
    if (f.mimeType !== "application/vnd.google-apps.folder") return false;
    const id = extractIndicatorIdFromFolderName(f.name);
    return id === indicatorId;
  });

  if (!indicatorFolder) {
    return { files: [], matched: false, reason: `Indicator ${indicatorId} folder not found` };
  }

  // 5. Collect files รวม subfolders
  const files = await collectFilesRecursive(indicatorFolder.id);
  return { files, matched: true, folderName: indicatorFolder.name };
}
```

---

## SECTION 4 — BILINGUAL ARCHITECTURE (สถาปัตยกรรม 2 ภาษา)

### 4.1 หลักการ

- ภาษาไทยและอังกฤษแยกกัน **สิ้นเชิง** ทั้งเนื้อหาและ Drive folder
- เมื่อผู้ใช้สลับภาษา ระบบต้อง: (1) เปลี่ยน UI strings, (2) โหลด Drive files จาก folder ของภาษานั้น
- cache แยกกันต่างหาก: `driveCache_th` และ `driveCache_en`
- folder map แยกกัน: `driveFolderMap_th` และ `driveFolderMap_en`

### 4.2 State ที่ต้องมี

```javascript
// drive.js — state ที่ควรมี
const driveState = {
  th: {
    ready: false,
    folderMap: {},        // catId → folderId
    cache: {},            // folderId → { data, timestamp }
    quota: { calls: 0 },
  },
  en: {
    ready: false,
    folderMap: {},
    cache: {},
    quota: { calls: 0 },
  },
};
```

### 4.3 Language Switch Flow

```
User clicks TH|EN toggle
  → setLang("en")                    // i18n.js
  → localStorage["84_lang"] = "en"
  → render()                         // app.js — re-renders all views
  → if currentView === "detail"
      → postRenderDrive(lang="en")   // โหลด Drive files จาก EN folder
```

### 4.4 ข้อมูลที่แตกต่างกันระหว่าง TH และ EN

| ส่วน | TH | EN |
|------|----|----|
| UI strings | i18n.js (key.th) | i18n.js (key.en) |
| Indicator title | D[].title (ภาษาไทย) | data_en.js หรือ D[].titleEn |
| Indicator description | D[].desc (ภาษาไทย) | D[].descEn |
| Evidence files | Drive: หมวด N/... | Drive: English Version/N.Name/N_English/ |
| Drive root | ROOT_FOLDER_ID | EN_ROOT_FOLDER_ID |

### 4.5 data.js — เพิ่มฟิลด์ภาษาอังกฤษ

```javascript
// D array ควรมี structure:
// [id, catId, sub, title, desc, agencies, status, titleEn, descEn]
//  0   1      2    3      4     5         6        7         8

// ถ้ายังไม่มี EN content ให้ใส่ "" เป็น placeholder แล้วค่อยเติม
[1, 1, "ข้อตกลง", "ผู้ประสานงาน", "...", "เทศบาล", "c", "Coordinator", "..."],
```

---

## SECTION 5 — ERROR HANDLING RULES (กฎการจัดการข้อผิดพลาด)

### 5.1 กฎทองที่ต้องปฏิบัติตามเสมอ

```
1. ไม่เคย throw error ให้ผู้ใช้เห็น — ทุก Drive call ต้องอยู่ใน try/catch
2. ถ้าโฟลเดอร์ไม่พบ → แสดง "ยังไม่มีหลักฐาน" ไม่ใช่ error
3. ถ้า API timeout → retry ด้วย exponential backoff (1s, 2s, 4s)
4. ถ้า 429 (quota exceeded) → หยุดทันที แสดง quota warning
5. ถ้า network offline → แสดง offline indicator ไม่ crash
```

### 5.2 Retry Logic

```javascript
async function fetchWithRetry(url, options, retries = DRIVE_CONFIG.MAX_RETRIES) {
  const delay = (attempt) => new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), DRIVE_CONFIG.REQUEST_TIMEOUT);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);

      if (res.status === 429 || res.status >= 500) {
        if (attempt < retries) { await delay(attempt); continue; }
      }
      return res;
    } catch (err) {
      if (attempt < retries && err.name !== "AbortError") {
        await delay(attempt); continue;
      }
      throw err;
    }
  }
}
```

### 5.3 UI States ที่ต้องรองรับ

| สถานะ | UI ที่แสดง |
|-------|-----------|
| Drive กำลังโหลด | Skeleton / spinner |
| ไฟล์ไม่พบ (folder empty) | "ยังไม่มีไฟล์หลักฐาน" |
| Folder ไม่พบ | "ยังไม่ได้สร้างโฟลเดอร์ใน Drive" |
| API Error | "ไม่สามารถเชื่อมต่อ Google Drive" + retry button |
| Quota เกิน | "API quota หมดวันนี้ กรุณาลองใหม่พรุ่งนี้" |
| ออฟไลน์ | "ขาดการเชื่อมต่ออินเทอร์เน็ต" |

---

## SECTION 6 — CACHING STRATEGY (กลยุทธ์การ cache)

### 6.1 Cache Layers

```
Layer 1: Memory cache (driveState.th.cache / driveState.en.cache)
  - ชีวิต: ตลอด session (ถึงปิด tab)
  - ใช้: ดักทุก API call ซ้ำ

Layer 2: localStorage cache
  - Key: "84drive_th_{folderId}" / "84drive_en_{folderId}"
  - TTL: 15 นาที
  - ใช้: เก็บผลลัพธ์ข้ามการ reload

Layer 3: folderMap cache
  - Key: "84foldermap_th" / "84foldermap_en"
  - TTL: 30 นาที (map เปลี่ยนบ่อยกว่า)
```

### 6.2 Cache Key Rules

```javascript
// ต้องรวม lang ใน cache key เสมอ
const cacheKey = `84drive_${lang}_${folderId}`;
// ไม่ใช่แค่ folderId — มิฉะนั้น TH กับ EN จะ share cache กัน!
```

### 6.3 Cache Invalidation

```javascript
// refresh button ใน admin panel ควร clear ทั้ง 2 ภาษา
function clearAllCache() {
  ["th", "en"].forEach(lang => {
    driveState[lang].cache = {};
    driveState[lang].folderMap = {};
    Object.keys(localStorage)
      .filter(k => k.startsWith(`84drive_${lang}_`) || k.startsWith(`84foldermap_${lang}`))
      .forEach(k => localStorage.removeItem(k));
  });
}
```

---

## SECTION 7 — i18n RULES (กฎการแปลภาษา)

### 7.1 กฎที่ห้ามละเมิด

```
1. ห้าม hardcode ข้อความภาษาไทยหรืออังกฤษในโค้ด
2. ทุก string ที่แสดงให้ผู้ใช้เห็น ต้องผ่าน t("key") เสมอ
3. ทุก key ต้องมีทั้ง th และ en — ห้ามมี key ที่มีแค่ภาษาเดียว
4. ห้ามใช้ getLang() === 'en' ? "EN text" : "TH text" ในโค้ด render
5. ถ้า key หายไป → แสดง key name ใน bracket [missing:key.name] เพื่อ debug
```

### 7.2 Pattern ที่ถูกต้อง

```javascript
// ✅ ถูก
t("detail.evidence.empty")

// ❌ ผิด
getLang() === 'en' ? "No evidence files" : "ไม่มีไฟล์หลักฐาน"

// ❌ ผิด
"ไม่มีไฟล์หลักฐาน"  // hardcoded
```

### 7.3 Indicator Title/Description

```javascript
// เมื่อแสดง title และ description ของ indicator
function getIndicatorTitle(indicator) {
  const lang = getLang();
  if (lang === "en") return indicator.titleEn || indicator.title; // fallback ถ้า EN ยังไม่มี
  return indicator.title;
}
```

---

## SECTION 8 — DATA INTEGRITY RULES (กฎความถูกต้องของข้อมูล)

### 8.1 Status Determination Priority

```
Priority 1: Admin override (localStorage "84_status_overrides")
Priority 2: Drive file count (auto-detect)
Priority 3: data.js static value

Logic:
  if (adminOverride[id]) return adminOverride[id];
  if (driveFileCount[id] > 0) return driveFileCount[id] >= COMPLETE_THRESHOLD ? "p" : "p";
  return D[].status;
```

### 8.2 GSTC Indicator Categories (ข้อมูลจาก PDF มาตรฐาน)

จากไฟล์ "คำอธิบายมาตรฐานการประเมินมาตรฐานยั่งยืน- .pdf":

| หมวด | ชื่อ (TH) | ชื่อ (EN) | จำนวนตัวชี้วัด |
|------|----------|----------|----------------|
| 1 | การจัดการแหล่งท่องเที่ยว | Destination Management | 20 (ข้อ 1-20) |
| 2 | ธรรมชาติและทัศนียภาพ | Nature and Scenery | ข้อ 21-28 |
| 3 | สิ่งแวดล้อมและสภาพภูมิอากาศ | Environment and Climate | ข้อ 29-36+ |
| 4 | วัฒนธรรมและประเพณี | Culture and Heritage | ต่อจากหมวด 3 |
| 5 | สังคมและเศรษฐกิจ | Social and Economy | — |
| 6 | การประกอบธุรกิจและการบริการ | Business and Services | — |

**หน่วยงานหลักที่รับผิดชอบ:**
- เทศบาลเมืองอุทัยธานี
- สำนักงานจังหวัดอุทัยธานี
- สำนักงานทรัพยากรธรรมชาติและสิ่งแวดล้อมจังหวัด
- สำนักงานการท่องเที่ยวและกีฬาจังหวัด

---

## SECTION 9 — CODE ARCHITECTURE RULES (กฎโครงสร้างโค้ด)

### 9.1 File Responsibilities

```
code.html   → HTML shell, Tailwind config, CSS only — ห้าม logic
app.js      → Routing, state, render dispatcher
data.js     → Static arrays CATS[] และ D[] เท่านั้น
drive.js    → Google Drive API ทุกอย่าง ห้ามมี UI logic
i18n.js     → Translation strings เท่านั้น
modal.js    → File preview lightbox เท่านั้น
```

### 9.2 กฎห้าม (Anti-patterns)

```
❌ ห้าม hardcode folderId ของ indicator หรือ category ใน drive.js
❌ ห้าม drive.js เรียก render() หรือ navigate() โดยตรง
❌ ห้าม app.js เรียก Google Drive API โดยตรง
❌ ห้าม mutate D[] array ต้นฉบับ (ใช้ getIndicators() แทน)
❌ ห้าม mix ภาษาใน UI — ถ้า TH ทุกอย่างต้อง TH, ถ้า EN ทุกอย่างต้อง EN
❌ ห้าม localStorage.setItem โดยไม่มี try/catch (อาจ throw ถ้า storage เต็ม)
```

### 9.3 กฎต้องทำ (Must-do)

```
✅ ทุก async function ต้องมี try/catch
✅ ทุก Drive API call ต้องผ่าน fetchWithRetry()
✅ ทุก cache key ต้องรวม lang prefix
✅ ทุก render function ต้อง return HTML string (ไม่ mutate DOM โดยตรง)
✅ ทุกครั้งที่ query Drive → ตรวจ quota ก่อน
✅ เมื่อ lang เปลี่ยน → invalidate หน้า detail view แล้ว reload Drive data
```

---

## SECTION 10 — QUOTA MANAGEMENT (การจัดการ Quota)

### 10.1 Quota Budget per Page Load

```
Goal: ใช้ไม่เกิน 200 calls ต่อ session (2% ของ 10,000/วัน)

Breakdown:
  buildDriveFolderMap(th): ~1 call (list root)
  buildDriveFolderMap(en): ~1 call (list EN root)
  loadCategory(catId): ~1 call per category = max 6 calls
  loadIndicator(id): ~1-3 calls (list + subfolders)
  scanDriveStatuses(): ⚠️ อันตราย — อาจ 84 × 3 = 252 calls
```

### 10.2 scanDriveStatuses — ใช้อย่างระวัง

```javascript
// ❌ อย่าเรียก scanDriveStatuses() ทุกครั้งที่โหลดหน้า
// ✅ เรียกแค่เมื่อ:
//    1. User กด "Refresh" ใน admin panel
//    2. ผ่านไปมากกว่า 30 นาทีนับจากครั้งสุดท้าย
//    3. คนที่มี admin session เท่านั้น
```

### 10.3 Lazy Loading Pattern

```javascript
// โหลด Drive data เฉพาะ indicator ที่ user เปิดดู
// ไม่ใช่โหลดทั้ง 84 ตัวตั้งแต่ต้น

// ใน renderDetail(id):
//   1. render HTML skeleton ก่อน
//   2. postRenderDrive(id) โหลด async หลัง DOM ready
//   3. inject ผลลัพธ์เข้า #evidence-section โดยไม่ re-render ทั้งหน้า
```

---

## SECTION 11 — TESTING CHECKLIST (checklist ก่อน deploy)

ก่อน deploy ทุกครั้ง ต้องตรวจสิ่งเหล่านี้:

### Drive Integration
- [ ] Category folder ทุกหมวดที่มีอยู่ใน Drive map ได้ถูกต้อง
- [ ] Indicator folder ทุกข้อที่มีไฟล์ใน Drive แสดงไฟล์ได้
- [ ] Subfolder ที่ซ้อนอยู่ข้างในแสดงไฟล์ได้ (ไม่หายไป)
- [ ] หมวดที่ยังไม่มีโฟลเดอร์ใน Drive แสดง "ยังไม่มีหลักฐาน" ไม่ใช่ error

### Bilingual
- [ ] สลับภาษา TH → EN แล้ว evidence files เปลี่ยนเป็น EN folder
- [ ] สลับภาษา EN → TH แล้ว evidence files กลับเป็น TH folder
- [ ] ไม่มีข้อความไทยหลงเหลือเมื่อ EN mode
- [ ] ไม่มีข้อความอังกฤษหลงเหลือเมื่อ TH mode

### Error Handling
- [ ] ตัด internet แล้ว app ไม่ crash — แสดง offline message
- [ ] API key ผิดแล้ว app ไม่ crash — แสดง error gracefully
- [ ] Indicator ที่ folder ว่างแสดง empty state ถูกต้อง

### Performance
- [ ] First load ใช้ Drive API calls ≤ 10 calls
- [ ] Navigate ไปหน้า detail และกลับมา Dashboard ไม่ทำ API call ซ้ำ (cache ทำงาน)

---

## SECTION 12 — KNOWN ISSUES AND ROADMAP

### Issues ที่รู้อยู่แล้ว (ณ มีนาคม 2026)

| # | ปัญหา | ความรุนแรง | วิธีแก้ |
|---|-------|-----------|---------|
| 1 | Category matching regex เดิมใช้ `/^(\d+)/` จะ fail กับ "หมวด N..." | Critical | ใช้ `/หมวด\s*(\d+)/` แทน |
| 2 | EN folder อยู่ใน root เดียวกับ TH ต้อง filter ออก | High | ข้าม folder ชื่อ "English Version" ตอน build TH map |
| 3 | Subfolder ภายใน indicator ไม่ถูก scan | High | ใช้ collectFilesRecursive() depth=2 |
| 4 | หมวด 2 และ 5 ยังไม่มีใน Drive | Medium | รับมือด้วย graceful empty state |
| 5 | Submit workflow ยัง demo mode | Medium | ต้อง implement จริงก่อน deadline |
| 6 | API key โชว์ใน client-side code | Low (scope จำกัด) | จำกัด domain ใน Google Console |

### Roadmap ที่แนะนำ

```
Phase 1 (ด่วน): แก้ category/indicator folder matching
Phase 2: เพิ่ม recursive subfolder scanning
Phase 3: แยก Drive state ให้ language-aware
Phase 4: เพิ่ม EN data fields ใน data.js
Phase 5: Implement real submit workflow
```

---

## SECTION 13 — GOOGLE DRIVE FOLDER IDs (Known IDs ณ มีนาคม 2026)

> ⚠️ ใช้เป็น reference เท่านั้น ห้าม hardcode ใน source code
> ควร build dynamically จาก root เสมอ

| โฟลเดอร์ | Folder ID |
|---------|-----------|
| Root (TH+EN) | `16SyUIAG8sHsgQDmlGjO5cB4-8nRGP1L9` |
| หมวด 1 การจัดการแหล่งท่องเที่ยว | `1malneVFQVF9HN2xJ98JD6tnZWmHbTOQJ` |
| หมวด 3 สิ่งแวดล้อมและสภาพภูมิอากาศ | `1tmMplQc4_kdeOiVXHTTOmPkIb8qgetLw` |
| หมวด 4 วัฒนธรรมและประเพณี | `1VyXhDtmj4TrrYdZWWq2k8x0FLYQcWy28` |
| หมวด 6 การประกอบธุรกิจและการบริการ | `1IJ4zYe2eDMfqEpHFT7UQBcooxYBkXMT4` |
| English Version (root EN) | `1hNi__LPENVWEbMMlTU2lOsrZsDLGGY4Y` |
| EN: 1.Visitor Management | `1vF4kPToGgh1pBgQWYolOgbVvFWV357fg` |
| EN: 3.Water management | `1KjIyMAepZ3aDH5sd6hzdMdMg-miTbakb` |

---

## SECTION 14 — DATA FRESHNESS (ข้อมูลสดใหม่รายวัน)

> ทีมงานอัปเดตไฟล์ใน Drive ทุกวัน ระบบต้องดึงข้อมูลล่าสุดเสมอ

### 14.1 หลักการ "Fresh by Default"

```
ข้อมูลที่แสดงในหน้า Detail ต้องมาจาก Drive โดยตรง ไม่ใช่จาก cache เก่า
ผู้ใช้ต้องมั่นใจว่า: "ไฟล์ที่เห็นคือไฟล์ที่ทีมงานอัปเดตล่าสุด ณ วันนี้"
```

### 14.2 Cache TTL Strategy

| Cache ชนิด | TTL | เหตุผล |
|-----------|-----|--------|
| Folder Map (catId → folderId) | 60 นาที | โครงสร้างหมวดเปลี่ยนน้อย |
| Indicator Folder List | 15 นาที | โฟลเดอร์ indicator เพิ่มได้ |
| **File List (ภายใน indicator)** | **5 นาที** | ทีมอัปเดตไฟล์รายวัน — ต้องสั้น |
| Subfolder List | 10 นาที | subfolder เพิ่มได้แต่ไม่บ่อย |

### 14.3 Smart Cache Invalidation

```javascript
// ตรวจสอบ modifiedTime ของโฟลเดอร์เทียบกับ cache timestamp
async function isCacheStale(folderId, cachedAt) {
  // ถ้า cache อายุ > TTL → stale แน่ๆ (ไม่ต้องเรียก API)
  if (Date.now() - cachedAt > CACHE_TTL) return true;

  // ถ้าอยู่ใน TTL → ตรวจ modifiedTime เพิ่มเติม (เรียก 1 API call)
  const meta = await fetchFolderMetadata(folderId); // fields=modifiedTime
  return new Date(meta.modifiedTime).getTime() > cachedAt;
}

// ใช้ใน driveFilesForIndicator():
const cacheKey = `84drive_${lang}_${indicatorFolderId}`;
const cached = getFromCache(cacheKey);
if (cached && !(await isCacheStale(indicatorFolderId, cached.timestamp))) {
  return cached.data; // ข้อมูล fresh — ใช้ cache ได้
}
// ไม่ fresh → fetch ใหม่
```

### 14.4 Folder Structure Change Detection

ระบบต้องฉลาดพอที่รับมือได้เมื่อ:

**กรณีที่ 1: เพิ่มโฟลเดอร์ indicator ใหม่**
```
ทีมงานสร้าง "21ใหม่/" ใน Drive
→ ระบบ re-scan ตอน TTL หมด
→ map ใหม่ได้ indicator 21 โดยอัตโนมัติ
→ ไม่ต้องแก้โค้ด
```

**กรณีที่ 2: เพิ่ม subfolder ใหม่ภายใน indicator**
```
ทีมงานสร้าง "เอกสารเพิ่มเติม/" ใน "1ผู้ประสานงาน/"
→ collectFilesRecursive() จะ pickup โดยอัตโนมัติ
→ ไฟล์ใน subfolder ใหม่จะปรากฏใน UI
```

**กรณีที่ 3: เปลี่ยนชื่อ indicator folder**
```
ทีมงานเปลี่ยน "1ผู้ประสานงาน" เป็ น "1ผู้ประสานงานการท่องเที่ยว"
→ extractIndicatorIdFromFolderName() ดึงเลข "1" ได้เหมือนเดิม
→ map ยังถูกต้อง เพราะ match จากตัวเลขนำหน้า ไม่ใช่ชื่อเต็ม
```

**กรณีที่ 4: เพิ่ม category folder ใหม่ (หมวด 2, 5)**
```
ทีมงานสร้าง "หมวด 2 ธรรมชาติและทัศนียภาพ/" ใน root
→ buildDriveFolderMap() re-run ตอน TTL หมด
→ catId=2 → folderId mapping ใหม่โดยอัตโนมัติ
→ ไม่ต้องแก้โค้ด
```

### 14.5 Manual Refresh ที่ผู้ใช้ทำได้

```javascript
// ปุ่ม Refresh ใน Detail view (ไม่ใช่แค่ใน Admin)
// เพราะผู้ใช้อาจต้องการดูไฟล์ที่เพิ่งอัปโหลด
async function refreshCurrentIndicator(indicatorId, catId) {
  // Clear cache เฉพาะ indicator นี้
  const lang = getLang();
  const cacheKey = `84drive_${lang}_ind_${indicatorId}`;
  localStorage.removeItem(cacheKey);

  // Reload
  await loadDriveForDetail(indicatorId, catId);
}
```

UI: ปุ่มเล็กๆ "รีเฟรชหลักฐาน" หรือ icon 🔄 ในหน้า detail

### 14.6 Background Refresh (Dashboard)

```javascript
// Dashboard refresh ทุก 5 นาที (ไม่ใช่ 30 วินาที — ลด quota burn)
// Pause เมื่อ tab ไม่ได้ active
let dashboardTimer = null;

function startDashboardRefresh() {
  stopDashboardRefresh();
  dashboardTimer = setInterval(() => {
    if (document.visibilityState === "visible") {
      refreshDashboardStats(); // scan เฉพาะ summary — ไม่ scan ทุก file
    }
  }, 5 * 60 * 1000); // 5 นาที
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") stopDashboardRefresh();
  else startDashboardRefresh();
});
```

### 14.7 Audit Trail ของการ Refresh

```javascript
// เก็บ log ว่า refresh ล่าสุดเมื่อไหร่
localStorage.setItem("84last_refresh", JSON.stringify({
  ts: Date.now(),
  lang: getLang(),
  triggeredBy: "auto" | "user" | "admin"
}));

// แสดงใน UI: "อัปเดตล่าสุด: 5 นาทีที่แล้ว"
function getLastRefreshLabel() {
  const data = JSON.parse(localStorage.getItem("84last_refresh") || "null");
  if (!data) return t("drive.never_refreshed");
  const minutes = Math.floor((Date.now() - data.ts) / 60000);
  if (minutes < 1) return t("drive.just_now");
  return t("drive.updated_x_min_ago").replace("{x}", minutes);
}
```

---

*Blueprint version 1.1 — เพิ่ม Data Freshness (Section 14) — มีนาคม 2026*
*ควร update ทุกครั้งที่โครงสร้าง Drive หรือ requirements เปลี่ยน*
