# SYSTEM DOCUMENTATION
## อุทัยธานี Green Destination — 84 Indicators Portfolio

> **Last updated:** Mar 2026 · Developed by: นักวิชาการคอมพิวเตอร์, เทศบาลเมืองอุทัยธานี  
> **Stack:** Vanilla JS + Tailwind CSS (CDN) · No build step · Served via HTTP

### Changelog (latest — 24 Mar 2026)
- **Public/Admin Separation**: "Status Criteria Card" and "Mapping Verification" sections hidden from public detail view — visible in Admin mode only. Public evaluators see only the evidence section and feedback form.
- **Staff Manual**: New `/manual` route added. Full bilingual guide (TH/EN) covering Drive upload rules, folder structure, English Version usage, subfolder nesting, and common mistakes. Three downloadable files generated client-side via Blob API: `.pdf` (read-only guide), `.doc` (RTF, editable in Word), `.xls` (SpreadsheetML template with all 84 indicators). Accessible from sidebar under "คู่มือเจ้าหน้าที่ / Staff Manual".
- **Data Integrity Debug Table**: Added EN Folder ID column (indigo, truncated with hover tooltip for full ID). Added "EN Folder ID mapped" counter badge showing how many indicators have `enFolderId` vs total mapped. Per-row force-resync button added. TH/EN file count columns clearly labelled. EN file count color-coded: indigo (>0), amber (EN folder exists but 0 files), gray (no EN folder).
- **Admin-Only Verification**: All technical verification data (folder IDs, mismatch badges, sync state, validation issues) restricted to Admin Panel and Admin-unlocked detail view. Public UI shows only status badges and evidence.

### Changelog (previous — 19 Mar 2026)
- **File Summary**: Evidence section shows file-type breakdown (PDF ×3, Image ×5, …) with colored pills + total size  
- **Thumbnails**: All file types (PDF, Doc, Sheets, etc.) now show Drive cover-page thumbnails — not just images  
- **Admin Status Override**: Admin can change indicator status (w→p→c) via dropdown in detail view; stored in `localStorage` key `84status`; "Overridden" badge + reset-to-original button  
- **Drive Reliability**: Exponential-backoff retry (max 3×) on 429/5xx/network errors; 15 s request timeout; quota guard blocks at ≥95 %; auto-reconnect health-check every 5 min  
- **Submit Workflow**: Modal now includes 5-step accordion explaining snapshot → lock → audit → feedback → result flow; `confirmSubmit()` saves real snapshot to `localStorage` key `84submit`  

### Changelog (previous)
- **Typography**: `font-size: 15px` base, `line-height: 1.75–1.85` for Thai text, antialiasing  
- **Accessibility**: Skip-nav link, `aria-*` on all interactive elements, `aria-hidden` on decorative icons, `focus-visible` outline, `prefers-reduced-motion` media query  
- **SEO**: Meta description, keywords, author, og:*, `theme-color`, JSON-LD structured data, `<link rel="preconnect">` for Google Fonts  
- **Performance**: Reduced font download (Manrope 700/800 + Noto Sans Thai only; removed unused Inter), Material Symbols optimized subset  
- **Auditor Feedback**: Functional localStorage form for committee members — rating (1–5 GSTC scale) + text + timestamp; admin-only write, public read-only  
- **Drive Mapping**: Fixed incorrect fallback that returned ALL category files; improved folder name regex to support spaces/dots/dashes; added try/catch on doc fetch

---

## Platform Specification (Merged)

The following section merges the latest product/system specification into this technical documentation, preserving existing implementation notes and adding scalable architecture guidance.

### 1. Overview

The Living Portfolio Platform is a web-based system designed to manage, track, and present structured project data, supporting multilingual content (Thai/English) and integration with external file storage (e.g., Google Drive).

The system is designed for:

- Administrators
- Officers / Staff
- Executives (read-only, insight-focused)

### 2. Objectives

- Provide a centralized platform for project tracking and documentation
- Enable real-time progress monitoring
- Support bilingual interface (Thai as default, English as secondary)
- Ensure user-friendly experience for non-technical users
- Allow integration with external file storage (Google Drive)
- Enable scalable architecture for future AI and analytics features

### 3. System Scope

Included:

- Welcome Page (bilingual)
- Dashboard (project tracking)
- Document integration (Google Drive)
- Progress tracking system
- Reporting (basic)

Excluded (future scope):

- AI analytics engine
- Advanced reporting automation
- External API integrations beyond Google Drive

### 4. User Roles

#### 4.1 Administrator

- Manage system configuration
- Manage users
- Define project structure

#### 4.2 Officer / Staff

- Upload documents
- Update project progress
- Manage assigned data

#### 4.3 Executive

- View dashboard
- Monitor progress
- Access reports

### 5. Core Features

#### 5.1 Bilingual System (Thai / English)

- Thai is default language
- English is secondary
- Language toggle available globally
- Language preference stored (localStorage or DB)
- No mixed-language UI allowed

#### 5.2 Welcome Page

- Displays system introduction
- Fully bilingual
- Includes:
  - Title
  - Description
  - Call-to-action
- Language switcher (`TH | EN`)

#### 5.3 Dashboard System

- Displays project overview
- Visual progress indicators (`0 / 25 / 50 / 75 / 100`)
- Filter and search functionality
- Categorization by project type

#### 5.4 Document Management (Google Drive Integration)

- Files stored externally in Google Drive
- System reads folder structure as data source
- Supports:
  - File preview (thumbnails)
  - Metadata display
- Must handle:
  - Missing files
  - Nested folders (subfolder edge cases)

#### 5.5 Progress Tracking

- Each project has progress percentage
- Defined in 5 stages:
  - `0%`
  - `25%`
  - `50%`
  - `75%`
  - `100%`
- Visual representation required

#### 5.6 Reporting System

- Generate summary reports
- Export as PDF
- Multi-dimensional view (by project, status, category)

### 6. System Architecture

#### 6.1 Frontend

- Framework: React / Next.js (recommended for future major refactor)
- Current implementation in this repo: Vanilla JS SPA
- State Management:
  - Context-style centralized state patterns are preferred
- UI:
  - Responsive design
  - Executive-friendly dashboard

#### 6.2 Backend (Optional / Hybrid)

Can be:

- Serverless
- Lightweight API layer

Responsibilities:

- Data aggregation
- Authentication (if implemented later)

#### 6.3 Data Source

Primary:

- Google Drive (file-based structure)

Optional:

- Database (for metadata, logs, user data)

### 7. Data Structure (Conceptual)

Project:

- `id`
- `name`
- `category`
- `progress` (`0–100`)
- `driveFolderId`
- `lastUpdated`

Document:

- `id`
- `projectId`
- `fileName`
- `fileUrl`
- `fileType`

### 8. UX/UI Principles

- Simple and intuitive
- Designed for non-technical users
- Minimal clicks to access key data
- Executive dashboard should be:
  - Clear
  - Insightful
  - Visually appealing

### 9. Localization Strategy

- Centralized translation file (JSON or JS/TS)
- No hardcoded text
- Fallback strategy:
  - Missing key -> English
- Scalable for future languages

### 10. Edge Cases & Risks

- Google Drive folder structure inconsistency
- Missing or duplicated files
- Language mismatch issues
- Performance when loading large file sets

### 11. Security Considerations

- Secure access to Google Drive (API scopes)
- Role-based access (future)
- Prevent unauthorized file access

### 12. Future Enhancements

- AI-based document analysis
- Smart reporting system
- Notification system (e.g., deadline alerts)
- Data validation automation

### 13. Success Criteria

- Users can navigate system without training
- All data reflects correctly from Google Drive
- Language switching works flawlessly
- Dashboard provides actionable insights
- System is stable and scalable

### 14. Notes for Reviewers

- Focus on architecture scalability
- Evaluate Google Drive as primary data source
- Validate UX for executive users
- Suggest improvements for long-term maintainability

---

## 1. Project Overview

Single-page application (SPA) for tracking the **84 Green Destinations / GSTC indicators** required for the Uthai Thani municipality's Top 100 Green Destination certification (2026 cycle). The app:

- Displays progress across 6 sustainability categories
- Links each indicator to evidence files stored in **Google Drive**
- Provides bilingual (Thai/English) UI via i18n module
- Has a locked Admin Panel for system administrators

---

## 2. File Structure

```
84-indicators/
├── code.html       — Entry point: HTML shell, Tailwind config, CSS, footer, script loader
├── app.js          — Main SPA logic: router, render functions, admin mode, modals
├── data.js         — Static data: CATS[] category metadata + D[] 84 indicator rows
├── drive.js        — Google Drive API integration: fetch, cache, quota tracking
├── i18n.js         — Internationalization: all UI strings (TH/EN), setLang(), t()
├── modal.js        — File preview lightbox: images, PDFs, Google Docs, video
└── SYSTEM.md       — This document
```

---

## 3. Data Model (`data.js`)

### 3.1 Categories — `CATS[]`

```js
{ id, n, en, loc, locEn, ic, cl }
```

| Field  | Description |
|--------|-------------|
| `id`   | Category ID (1–6) |
| `n`    | Thai name |
| `en`   | English name |
| `loc`  | Thai poetic location name |
| `locEn`| English poetic location name |
| `ic`   | Material Symbols icon name |
| `cl`   | Brand hex colour |

### 3.2 Indicators — `D[]`

```
[id, catId, sub, title, desc, agencies(pipe-sep), status]
```

| Index | Field | Values |
|-------|-------|--------|
| 0 | `id` | 1–84 |
| 1 | `catId` | 1–6 |
| 2 | `sub` | Thai sub-section name |
| 3 | `title` | Thai indicator title |
| 4 | `desc` | Thai description / GSTC criteria |
| 5 | `agencies` | Pipe-separated responsible agencies |
| 6 | `status` | `"c"` / `"p"` / `"w"` |

### 3.3 Status Values & Criteria

| Code | Thai | English | Criteria |
|------|------|---------|----------|
| `c` | ดำเนินการแล้ว | Completed | Evidence files uploaded to Drive + local context documented + agency confirmed + fully GSTC compliant |
| `p` | กำลังดำเนินการ | In Progress | Work started, ≥1 file in Drive, but not complete OR awaiting agency confirmation |
| `w` | รอดำเนินการ | Pending | Not started, Drive folder empty, no agency assigned |

**Transition rules:**
- `w → p`: At least 1 file uploaded to Drive + responsible agency assigned
- `p → c`: All required evidence uploaded + agency confirmed + GSTC criteria fully met + auditor verification passed

**To update a status:** Edit the last field of the relevant row in `data.js` D array.

---

## 4. Routing (`app.js`)

Hash-based SPA router. No framework, no server-side routing.

| Hash | View | Guard |
|------|------|-------|
| `#dashboard` | Dashboard overview | Public |
| `#catalog` | 84 indicator catalog | Public |
| `#detail/{id}` | Single indicator detail | Public |
| `#admin` | Admin panel | `adminUnlocked === true` required |

```js
// State
let currentView = "dashboard";
let currentFilter = { cat: 0, status: "", search: "" };
let suppressHash = false;
let catalogView = "grid";  // "grid" | "list" | "table" — persisted in localStorage

// Navigation
navigate(view, params?)   // programmatic navigate
onHashChange()            // hash listener
```

---

## 5. Admin Mode (`app.js`)

**Trigger:** Click footer text `"เทศบาลเมืองอุทัยธานี • Green Destinations Standard"` **5 times** within 3 seconds.

**Password:** `admin123` (stored in session only, never in URL)

**State:** `sessionStorage['84admin'] = '1'` — cleared on tab close

**Flow:**
1. 5-click trigger → `promptAdmin()` → password prompt
2. Correct → `adminUnlocked = true` → `navigate('admin')`
3. Admin Panel shows: Drive status, API quota, content status, folder map
4. Dashboard: Admin shortcut button only (no quota data leaks to public view)
5. Lock: `lockAdmin()` → clears session → `navigate('dashboard')`

**To change password:** Edit the string `'admin123'` in `promptAdmin()` in `app.js`.

---

## 6. Google Drive Integration (`drive.js`)

### 6.1 Configuration

```js
const DRIVE_CONFIG = {
  API_KEY:         "<your-key>",           // Google API key (restricted to domain)
  ROOT_FOLDER_ID:  "<root-folder-id>",     // GDrive root folder for all categories
  API_BASE:        "https://www.googleapis.com/drive/v3",
  CACHE_TTL:       5 * 60 * 1000,          // 5 min cache TTL
  DAILY_QUOTA:     10000,                   // Free API calls/day
};
```

### 6.2 Folder Structure Expected in Drive

```
Root Folder
├── 1{ThaiName}/        — Category 1 folder
│   ├── 1{IndicatorName}/   — Indicator sub-folder
│   ├── 2{IndicatorName}/
│   └── ...
├── 2{ThaiName}/        — Category 2 folder
└── ...
```

Indicator folders are matched by **leading number** in folder name (e.g. `"27การมีปฏิสัมพันธ์"` → indicator #27).

### 6.3 Key Functions

| Function | Purpose |
|----------|---------|
| `initDrive()` | Connect and test Drive API on app load |
| `buildDriveFolderMap()` | Map catId → folderId into `driveFolderMap` |
| `driveFilesForIndicator(id, catId)` | Get files + subfolders + doc content for one indicator |
| `refreshDriveData()` | Clear cache and re-fetch (called by Refresh button) |
| `driveQuota.getStats()` | API call count, cache hits, cost estimate |

### 6.4 Drive Status Map (`driveStatusMap`)

Populated asynchronously after render. Structure:
```js
driveStatusMap[indicatorId] = { fileCount: N, files: [], matched: true/false }
```

### 6.5 File Types Handled

| MIME type | Preview |
|-----------|---------|
| `image/*` | Inline image thumbnail + lightbox |
| `application/pdf` | PDF iframe in modal |
| `application/vnd.google-apps.document` | Exported as HTML, rendered inline |
| `application/vnd.google-apps.spreadsheet` | Exported as CSV |
| `video/*` | Video player in modal |

---

## 7. Internationalization (`i18n.js`)

### 7.1 Usage

```js
t("key")          // Get current-language string
setLang("en")     // Switch language (re-renders full UI)
getLang()         // Returns "th" | "en"
toggleLang()      // Toggle between TH ↔ EN
```

### 7.2 Adding New Strings

Add entries to the `T` object in `i18n.js`:

```js
"my.new.key": { th: "ข้อความภาษาไทย", en: "English text" },
```

**Rule: Always add BOTH `th` and `en` values for every key.** Never add TH-only keys.

### 7.3 Static Elements

Elements with `data-i18n="key"` attribute are auto-updated by `updateStaticI18n()` on language switch.

```html
<span data-i18n="nav.indicators">ตัวชี้วัด 84 ข้อ</span>
```

---

## 8. Catalog Views (`app.js`)

Three view modes for the indicator catalog, persisted in `localStorage['84catalogView']`:

| Mode | Renderer | Best for |
|------|----------|---------|
| `"grid"` | `renderCatalogItemGrid()` | Visual browsing, image-rich |
| `"list"` | `renderCatalogItemList()` | Compact scanning, mobile |
| `"table"` | `renderCatalogItemTable()` | Data comparison, bulk review |

**Switch:** `setCatalogView("grid"|"list"|"table")` — re-renders catalog.

---

## 9. Render Architecture (`app.js`)

```
render()
├── updateNav()             — highlight active nav pill
├── updateSidebar()         — populate sidebar category links
├── langToggleHTML()        — render lang toggle button
├── updateNavDriveStatus()  — update compact Drive status in navbar
├── renderDashboard()       — if currentView === "dashboard"
│   ├── driveStatusHTMLLight()
│   ├── renderQuotaCard()   (admin only: shortcut button)
│   └── openSubmitModal()   (submit button)
├── renderCatalog()         — if currentView === "catalog"
│   ├── renderStatusGuide(collapsed=true)
│   ├── viewSwitcherHTML()
│   └── renderCatalogItem{Grid|List|Table}()
├── renderDetail()          — if currentView === "detail"
│   ├── Status criteria card (per-indicator)
│   └── Evidence + mapping (postRenderDrive)
├── renderAdmin()           — if currentView === "admin" && adminUnlocked
│   ├── Drive status overview
│   ├── renderQuotaCard()
│   ├── Content status
│   └── Folder map
└── postRenderDrive()       — async Drive data injection after DOM is ready
```

---

## 10. Modal System (`modal.js`)

File preview lightbox triggered from evidence cards.

```js
openFileModal(files[], index)   // Open modal at file index
closeModal()                    // Close
```

Supports keyboard navigation (← →), Escape to close, "Open in Drive" link.

---

## 11. Submit Workflow

Current state: **Demo mode** — no actual API submission.

```js
openSubmitModal()   // Opens confirmation modal with progress summary
confirmSubmit()     // Shows toast, no real API call yet
```

**To implement real submission:** Replace `confirmSubmit()` body with actual API call or Google Form redirect.

---

## 12. CSS Architecture (`code.html`)

- **Tailwind CSS** via CDN with custom config (theme extension)
- Custom classes: `.navbar-glass`, `.nav-pill`, `.brand-leaf`, `.filter-scroll`, `.hero-img-bg`, `.raft-float`
- Custom colour tokens: `primary`, `emerald-forest`, `river-blue`, `temple-gold`, `deep-teak`, `velvet`
- **Responsive breakpoints:** sm (640px), md (768px), lg (1024px)
- `.no-print` class hides elements in print mode

---

## 13. Development Guidelines

### Adding a New Indicator
1. Add a row to `D[]` in `data.js`: `[id, catId, sub, title, desc, "agency1|agency2", "w"]`
2. Create matching folder in Drive under correct category folder

### Changing Indicator Status
1. Edit last field of the row in `D[]`: `"w"` → `"p"` → `"c"`
2. No redeployment needed if served statically — just update file

### Adding a New i18n Key
1. Add `"key": { th: "...", en: "..." }` to `T` object in `i18n.js`
2. Use `t("key")` in any template literal
3. For static HTML elements, add `data-i18n="key"` attribute

### Adding a New View/Page
1. Create `renderMyView()` function in `app.js` returning HTML string with `data-view="myview"`
2. Add route in `onHashChange()` 
3. Add case in `render()`
4. Update `updateNav()` if it needs a nav pill

### Updating Drive Config
1. Edit `DRIVE_CONFIG` at top of `drive.js`
2. Replace `API_KEY` if rotating keys
3. Replace `ROOT_FOLDER_ID` if restructuring Drive

---

## 14. Known Limitations & Future Work

| Item | Priority | Notes |
|------|----------|-------|
| Submit → real API | High | Currently shows toast only; integrate Google Forms or REST endpoint |
| Status auto-detect from Drive | Medium | Could auto-set `p` when files exist in Drive folder |
| English descriptions | Medium | `desc` field in `D[]` is Thai-only; needs EN column or translation |
| Offline mode | Low | Service Worker for Drive cache persistence across reloads |
| Edit mode (Admin) | Low | Allow status updates from UI instead of editing `data.js` directly |
| Audit trail | Low | Log status changes with timestamp and user |

---

## 15. Environment & Deployment

| Setting | Value |
|---------|-------|
| Dev server | `http://localhost:8080` |
| Deployment | Static files only (no backend) |
| Browser support | Modern browsers (ES2020+) |
| API key restriction | Restrict to deployed domain in Google Console |

No npm, no build step, no bundler. All dependencies loaded via CDN in `code.html`:
- Tailwind CSS (CDN)
- Google Fonts (Noto Serif Thai, Noto Sans Thai)
- Material Symbols (Google Icons CDN)
