# 84 Indicators — Codebase Review & Refactoring Plan

> **Project:** Uthai Thani Green Destination — 84 Sustainability Indicators Tracker  
> **Date:** June 2025  
> **Files reviewed:** `code.html` (683 lines), `app.js` (1665 lines), `data.js` (96 lines), `drive.js` (633 lines), `modal.js` (153 lines), `i18n.js` (384 lines)  
> **Total:** ~3,614 lines across 6 files

---

## 1. Architecture Overview

### Module Structure

| File | Role | Lines | Responsibility |
|------|------|-------|---------------|
| `code.html` | Shell | 683 | HTML skeleton, Tailwind config, CSS, welcome portal, script loading |
| `app.js` | Core | 1665 | Routing, rendering (5 views), state, admin, Drive UI helpers, init |
| `data.js` | Data | 96 | Static `CATS` (6 categories) and `D` (84 indicators) arrays |
| `drive.js` | API | 633 | Google Drive integration, caching, quota tracking, metadata sync |
| `modal.js` | UI | 153 | File preview lightbox with navigation |
| `i18n.js` | i18n | 384 | Thai/English translations, language toggle, static element updates |

### Pattern
- **Vanilla JS SPA** — No framework, no build system, no bundler
- **Hash-based routing** — `#dashboard`, `#catalog/3`, `#detail/42`, `#admin`, `#audit`
- **CDN-loaded Tailwind** — Runtime compilation via `tailwind.config` in `<script>`
- **String template rendering** — All HTML generated via ES6 template literals + `innerHTML`
- **Global state** — All state lives in module-scoped variables and `localStorage`

### Rendering Pipeline
```
User action → navigate(view, filter)
  → window.location.hash update
  → onHashChange()
  → currentView / currentFilter set
  → render()
    → getElementById('app').innerHTML = renderXxx()
    → updateSidebar(), updateNavActive(), updateStaticI18n()
  → postRenderDrive()  (async: loads Drive data for detail view)
```

---

## 2. Data Flow

### Static Data (`data.js`)
- `CATS`: Array of 6 category objects `{ id, n (Thai name), en (English name), cl (color hex) }`
- `D`: Array of 84 indicator tuples `[id, catId, subCategory, title, desc, agencies, status]`
- Status codes: `"c"` (complete), `"p"` (in progress), `"w"` (waiting)

### Runtime Data Transformations (`app.js`)
1. **`getIndicators()`** — Maps raw `D` array into objects, applies `localStorage` status overrides
2. **`getCatStats(catId)`** — Aggregates indicator counts by status per category
3. **`totalStats()`** — Aggregates global counts + percentages for dashboard
4. **Status overrides** — Stored in `localStorage("84_status_overrides")` as `{ id: newStatus }` JSON
5. **Auditor feedback** — Stored in `localStorage("84_feedback")` as `{ id: { text, rating, author, ts } }`

### Drive Data Flow (`drive.js`)
```
initDrive()
  → buildDriveFolderMap()        // Maps category IDs to Drive folder IDs
  → syncThaiMetadata()           // Populates INDICATOR_TH global
  → syncEnglishMetadata()        // Populates INDICATOR_EN global
  → driveReady = true

loadDriveForDetail(indicatorId)
  → driveFilesForIndicator()     // Fetches files from matched folder
  → renderMappingVerification()  // Shows folder mapping status
  → renderFileThumbnail()        // Renders evidence grid
```

### Caching Strategy
| Cache | Storage | TTL | Purpose |
|-------|---------|-----|---------|
| `driveCache` | Memory (object) | Session | API response cache (folders, files) |
| `84th_metadata` | localStorage | 15 min | Thai indicator metadata from Drive |
| `84en_metadata` | localStorage | 15 min | English indicator metadata from Drive |
| `84_status_overrides` | localStorage | Permanent | Admin status overrides |
| `84_feedback` | localStorage | Permanent | Auditor feedback entries |

---

## 3. State Management

### Global Variables in `app.js`
| Variable | Type | Purpose |
|----------|------|---------|
| `currentView` | string | Active view: dashboard/catalog/detail/admin/audit |
| `currentFilter` | object | Route params: `{ cat, status, id, q }` |
| `adminUnlocked` | boolean | Whether admin mode is active |
| `searchQuery` | string | Global search text |
| `currentEvidenceFiles` | array | Files for current detail view (modal navigation) |
| `driveStatusMap` | object | `{ indicatorId: { hasFiles, fileCount } }` |
| `dashboardRefreshTimer` | number | setInterval ID for 30s dashboard refresh |

### Global Variables in `drive.js`
| Variable | Type | Purpose |
|----------|------|---------|
| `driveReady` | boolean | Drive API initialized |
| `driveError` | string/null | Last Drive error |
| `driveFolderMap` | object | `{ catId: folderId }` |
| `driveFolderMapReady` | boolean | Folder map built |
| `driveCache` | object | In-memory API response cache |
| `driveQuota` | object | API usage tracker |
| `INDICATOR_TH` / `INDICATOR_EN` | object | Synced metadata per indicator |

### Issues
- **No encapsulation** — All state is globally accessible and mutable from any script
- **Race conditions** — `scanDriveStatuses()` mutates `D[i][6]` (original data array) directly at line 1614
- **No change tracking** — State mutations don't trigger targeted re-renders; full `render()` calls required
- **Timer leak risk** — `dashboardRefreshTimer` cleared only on new start, not on view change

---

## 4. Security Concerns

### Critical
1. **API key in client-side code** (`drive.js`) — Google Drive API key is exposed in the source. Anyone can extract it and make requests against the quota.
2. **Client-side admin auth** — `promptAdmin()` checks a hardcoded password against user input. This is trivially bypassable via DevTools.
3. **innerHTML everywhere** — All rendering uses `innerHTML` with template literals. While `data.js` data is static, feedback text uses `.replace(/</g, '&lt;')` (basic escaping), but there's no systematic sanitization.

### Moderate
4. **localStorage tampering** — Status overrides and feedback can be freely modified via DevTools.
5. **No CORS restrictions** — Drive API requests are made directly from the browser with no server proxy.
6. **No CSP headers** — The HTML has no Content-Security-Policy meta tag.

### Recommendations
- Move API key to a server-side proxy or use OAuth with user tokens
- Implement server-side admin authentication
- Use `textContent` or a DOM-building approach instead of `innerHTML` where possible
- Add CSP meta tag to restrict inline scripts

---

## 5. Internationalization (i18n)

### Current Implementation
- `i18n.js` defines a `TRANSLATIONS` object with ~150 keys for TH/EN
- `t(key)` returns the translated string for the current language
- `getLang()` / `setLang(lang)` / `toggleLang()` manage language in `localStorage("84_lang")`
- `updateStaticI18n()` updates all `[data-i18n]` elements in the DOM

### Inconsistencies Found
The codebase uses **three different patterns** for bilingual text:

| Pattern | Example | Count |
|---------|---------|-------|
| `t("key")` | `t("detail.mapping.title")` | ~60 uses |
| Ternary `getLang() === 'en' ? "EN" : "TH"` | Lines 1055, 1141-1147, 1156, etc. | ~40 uses |
| Hardcoded Thai only | Sidebar "แดชบอร์ด", admin labels | ~10 uses |

### Recommendations
- Migrate all ternary patterns to `t()` calls with proper translation keys
- Add missing keys for hardcoded Thai strings
- Extract rating labels (lines 1141-1147) into translation keys
- Consider plural forms for file counts

---

## 6. Performance Analysis

### Strengths
- **Drive API caching** — Both in-memory and localStorage caching reduce redundant API calls
- **Quota tracking** — `driveQuota` module prevents exceeding Google's free tier
- **Lazy loading** — Drive data loaded after initial render via `postRenderDrive()`
- **Thumbnail lazy loading** — `loading="lazy"` on images

### Concerns
1. **Tailwind CDN** — Runtime compilation of the full Tailwind CSS framework (~300KB+ CSS). Should use a build step with purging.
2. **Full DOM replacement** — Every `render()` call replaces `#app` innerHTML entirely, destroying and recreating all DOM nodes.
3. **Heavy init scan** — `scanDriveStatuses()` iterates ALL categories × ALL folders × ALL files on page load. For 84 indicators across 6 categories, this is potentially dozens of API calls.
4. **No code splitting** — All JS loaded synchronously on page load.
5. **No virtual scrolling** — Catalog view renders all indicators in a category at once (up to 84 cards).
6. **30s auto-refresh** — Dashboard timer runs even when tab is not visible.

### Recommendations
- Replace Tailwind CDN with build-time compilation
- Implement targeted DOM updates instead of full innerHTML replacement
- Defer `scanDriveStatuses()` or run it incrementally
- Use `requestIdleCallback` or `IntersectionObserver` for off-screen rendering
- Add `document.visibilitychange` check for auto-refresh

---

## 7. Code Quality & Readability Issues

### Primary Issue: `app.js` Monolith (1665 lines)
`app.js` is doing too much. It contains:
- Routing logic (lines 1-50)
- Data helpers (lines 50-120)
- Admin mode (lines 120-200)
- Status override system (lines 200-260)
- Feedback storage (lines 260-310)
- Navigation UI (lines 310-420)
- Global search (lines 420-470)
- `renderDashboard()` — ~170 lines of HTML template
- `renderCatalog()` — ~130 lines of HTML template
- `renderDetail()` — ~240 lines of HTML template
- `renderAdmin()` — ~90 lines of HTML template
- `renderAudit()` — ~130 lines of HTML template
- Drive UI helpers — ~200 lines
- Mapping verification — ~40 lines
- Async Drive loaders — ~80 lines
- Quota UI — ~100 lines
- Toast, refresh, init — ~90 lines

### Specific Readability Problems

1. **Giant inline HTML** — `renderDetail()` is a single function returning a ~240-line template literal with deeply nested conditional logic, IIFEs, and inline event handlers.

2. **Single-line monsters** — Line 1056 is a single line containing the entire status changer dropdown component (~800 characters), making it impossible to read or debug.

3. **IIFEs in templates** — Lines 1063-1083 and 1137-1205 use `${(function(){ ... })()}` patterns inside template literals for complex conditional rendering. This is clever but hard to follow.

4. **Mixed concerns in render functions** — `renderDetail()` handles data processing (finding categories, computing prev/next IDs, filtering related items) AND generates HTML.

5. **Duplicated patterns** — `driveStatusHTML()` and `driveStatusHTMLLight()` are nearly identical with only color differences.

6. **Inconsistent event binding** — Mix of `onclick="..."` inline handlers, `addEventListener` in `<script>` blocks, and function references.

---

## 8. Refactoring Recommendations

### Phase 1: Extract View Renderers (Immediate — High Impact)
Extract each view's render function into a dedicated file:

```
app.js (core: routing, state, helpers)    → ~400 lines
views/dashboard.js                         → ~200 lines
views/catalog.js                           → ~160 lines
views/detail.js                            → ~300 lines
views/admin.js                             → ~100 lines
views/audit.js                             → ~150 lines
ui/drive-ui.js                             → ~250 lines
ui/quota-ui.js                             → ~120 lines
```

### Phase 2: Decompose Large Render Functions (Medium Impact)
Break `renderDetail()` into composable pieces:

```javascript
// Instead of one 240-line function:
function renderDetail(id) {
  const item = getIndicators().find(i => i.id === id);
  const cat = CATS.find(c => c.id === item.cat);
  return `
    ${renderDetailHeader(item, cat)}
    ${renderStatusCriteria(item)}
    ${renderMappingSection(item)}
    ${renderDescriptionSection(item)}
    ${renderContextSection(item)}
    ${renderAgenciesSection(item)}
    ${renderEvidenceSection(item)}
    ${renderFeedbackSection(item)}
    ${renderDetailNavigation(item)}
    ${renderRelatedIndicators(item, cat)}
  `;
}
```

### Phase 3: Standardize i18n (Medium Impact)
- Replace all `getLang() === 'en' ? ... : ...` ternaries with `t()` calls
- Add ~40 missing translation keys to `i18n.js`
- Consolidate rating labels into translation system

### Phase 4: State Module (Lower Priority)
Create a simple state manager:
```javascript
// state.js
const State = {
  view: 'dashboard',
  filter: {},
  admin: false,
  search: '',
  onChange(cb) { ... }
};
```

### Phase 5: Build Tooling (Future)
- Add Vite or esbuild for bundling
- Compile Tailwind at build time with purging
- Add ESLint for code consistency
- Consider migrating to a lightweight framework (Preact, Alpine.js, or Lit)

---

## 9. Actionable Next Steps (Priority Order)

| # | Action | Effort | Impact | Risk |
|---|--------|--------|--------|------|
| 1 | Extract render functions from `app.js` into separate files | Medium | High — Makes code navigable | Low |
| 2 | Break `renderDetail()` into 10+ sub-functions | Medium | High — Each piece testable | Low |
| 3 | Break `renderDashboard()` and `renderCatalog()` into sub-functions | Medium | High | Low |
| 4 | Extract Drive UI helpers into `ui/drive-ui.js` | Small | Medium — Separates concerns | Low |
| 5 | Extract quota UI into `ui/quota-ui.js` | Small | Medium | Low |
| 6 | Standardize all i18n to use `t()` consistently | Medium | Medium — Maintainability | Low |
| 7 | Deduplicate `driveStatusHTML()` / `driveStatusHTMLLight()` | Small | Small — DRY | Low |
| 8 | Format single-line HTML monsters into readable multi-line | Small | High — Readability | Low |
| 9 | Move API key to environment/proxy | Medium | High — Security | Medium |
| 10 | Add build tooling (Vite + Tailwind CLI) | Large | High — Performance | Medium |

### Recommended Starting Point
**Step 1 + 2 combined:** Extract `renderDetail()` into `views/detail.js` and immediately decompose it into sub-functions. This single action addresses the biggest readability bottleneck (~240 lines of the most complex rendering logic) and establishes the pattern for all other extractions.

---

## Appendix: Function Index (`app.js`)

| Function | Line | Purpose |
|----------|------|---------|
| `STATUS_MAP` | ~1 | Status code → label/class mapping |
| `getIndicators()` | ~20 | Transform D array into objects with overrides |
| `getCatStats(catId)` | ~45 | Category statistics aggregation |
| `totalStats()` | ~60 | Global statistics |
| `promptAdmin()` | ~80 | Admin login prompt |
| `changeIndicatorStatus()` | ~100 | Override indicator status |
| `resetIndicatorStatus()` | ~115 | Reset to original status |
| `saveFeedbackFromForm()` | ~135 | Save auditor feedback |
| `getFeedback()` / `clearFeedback()` | ~150 | Feedback CRUD |
| `navigate()` | ~170 | Hash-based navigation |
| `onHashChange()` | ~180 | Route parser |
| `render()` | ~210 | Main render dispatcher |
| `renderDashboard()` | ~240 | Dashboard view (~170 lines) |
| `renderCatalog()` | ~420 | Catalog view (~130 lines) |
| `renderDetail()` | ~560 | Detail view (~240 lines) |
| `renderAdmin()` | ~810 | Admin panel (~90 lines) |
| `renderAudit()` | ~910 | Audit view (~130 lines) |
| `driveStatusHTML()` | 1237 | Drive status indicator |
| `renderFileThumbnail()` | 1256 | File card component |
| `renderFileSummary()` | 1277 | File type summary pills |
| `renderDriveLoading/Error()` | 1298 | Drive loading states |
| `renderMappingVerification()` | 1328 | Folder mapping display |
| `postRenderDrive()` | 1370 | Async Drive data loader |
| `loadDriveForDetail()` | 1391 | Detail view Drive integration |
| `renderQuotaCard()` | 1444 | API quota display |
| `renderFloatingQuota()` | 1499 | Floating quota mini-bar |
| `refreshDriveData()` | 1554 | Clear cache + re-init Drive |
| `scanDriveStatuses()` | 1596 | Background Drive scan |
| `DOMContentLoaded` handler | 1651 | Application init |
