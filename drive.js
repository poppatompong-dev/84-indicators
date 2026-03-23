// === GOOGLE DRIVE API MODULE ===
const DRIVE_CONFIG = {
  API_KEY: "AIzaSyCA2-JWG89Q8DzwnHKBUhb_P3arsd8GizI",
  ROOT_FOLDER_ID: "16SyUIAG8sHsgQDmlGjO5cB4-8nRGP1L9",
  EN_ROOT_FOLDER_ID: "1hNi__LPENVWEbMMlTU2lOsrZsDLGGY4Y",
  API_BASE: "https://www.googleapis.com/drive/v3",
  CACHE_TTL: 5 * 60 * 1000,              // default fallback (5 min)
  CACHE_TTL_MAP: 60 * 60 * 1000,         // folder map: 60 min
  CACHE_TTL_FILES: 5 * 60 * 1000,        // file list: 5 min
  CACHE_TTL_SUBFOLDERS: 10 * 60 * 1000,  // subfolders: 10 min
  SUBFOLDER_DEPTH: 2,                    // max recursion depth from indicator folder
  QUOTA_GUARD_THRESHOLD: 0.90,           // stop at 90% quota
  REQUEST_TIMEOUT: 15000,                // 15s timeout
  MAX_RETRIES: 3,
  RETRY_BASE_MS: 1000,
  DAILY_QUOTA: 10000
};

// === CACHE ===
const driveCache = {};
function cacheGet(key, ttl) {
  const entry = driveCache[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > (ttl || DRIVE_CONFIG.CACHE_TTL)) { delete driveCache[key]; return null; }
  return entry.data;
}
function cacheSet(key, data) {
  driveCache[key] = { data, ts: Date.now() };
}

// === API QUOTA TRACKING ===
const DRIVE_QUOTA = {
  DAILY_FREE_LIMIT: 10000,
  COST_PER_1000: 0.01, // USD per 1000 requests after free tier
  WARNING_PCT: 70,
  DANGER_PCT: 90
};

const driveQuota = {
  _key() { return "driveQuota_" + new Date().toISOString().slice(0, 10); },
  _load() {
    try {
      const raw = localStorage.getItem(this._key());
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return { calls: 0, cacheHits: 0, errors: 0, firstCall: null, lastCall: null };
  },
  _save(d) { try { localStorage.setItem(this._key(), JSON.stringify(d)); } catch (e) { } },
  trackCall() {
    const d = this._load();
    d.calls++;
    if (!d.firstCall) d.firstCall = Date.now();
    d.lastCall = Date.now();
    this._save(d);
    this._notifyUI();
  },
  trackCacheHit() {
    const d = this._load();
    d.cacheHits++;
    this._save(d);
  },
  trackError() {
    const d = this._load();
    d.errors++;
    this._save(d);
  },
  getStats() {
    const d = this._load();
    const pct = Math.min(100, Math.round((d.calls / DRIVE_QUOTA.DAILY_FREE_LIMIT) * 100));
    const overFree = Math.max(0, d.calls - DRIVE_QUOTA.DAILY_FREE_LIMIT);
    const estCost = (overFree / 1000) * DRIVE_QUOTA.COST_PER_1000;
    let level = "ok";
    if (pct >= DRIVE_QUOTA.DANGER_PCT) level = "danger";
    else if (pct >= DRIVE_QUOTA.WARNING_PCT) level = "warning";
    return {
      calls: d.calls,
      cacheHits: d.cacheHits,
      errors: d.errors,
      remaining: Math.max(0, DRIVE_QUOTA.DAILY_FREE_LIMIT - d.calls),
      pct,
      level,
      estCost: estCost.toFixed(4),
      overFree,
      limit: DRIVE_QUOTA.DAILY_FREE_LIMIT,
      firstCall: d.firstCall,
      lastCall: d.lastCall,
      savedByCaching: d.cacheHits
    };
  },
  reset() {
    try { localStorage.removeItem(this._key()); } catch (e) { }
    this._notifyUI();
  },
  _notifyUI() {
    // Trigger UI update if quota bar exists
    if (typeof updateQuotaBar === "function") updateQuotaBar();
  }
};

// === CORE API CALL (with retry + quota guard) ===

async function driveApiFetch(endpoint, params = {}, _retryCount = 0) {
  // Quota guard: block calls when near daily limit
  const q = driveQuota.getStats();
  if (q.pct >= DRIVE_CONFIG.QUOTA_GUARD_THRESHOLD * 100 + 5) {
    throw new Error('DRIVE_QUOTA_EXCEEDED');
  }
  params.key = DRIVE_CONFIG.API_KEY;
  const qs = new URLSearchParams(params).toString();
  const url = `${DRIVE_CONFIG.API_BASE}/${endpoint}?${qs}`;
  const cached = cacheGet(url);
  if (cached) { driveQuota.trackCacheHit(); return cached; }
  driveQuota.trackCall();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DRIVE_CONFIG.REQUEST_TIMEOUT);
    const res = await fetch(url, { referrerPolicy: 'no-referrer', signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      driveQuota.trackError();
      const err = await res.json().catch(() => ({}));
      const reason = err.error?.details?.[0]?.reason || "";
      const msg = err.error?.message || `HTTP ${res.status}`;
      console.error("Drive API error:", res.status, err);
      if (reason === "API_KEY_HTTP_REFERRER_BLOCKED") {
        throw new Error("DRIVE_API_KEY_BLOCKED");
      }
      if (res.status === 404) {
        throw new Error("DRIVE_FOLDER_NOT_FOUND");
      }
      if (res.status === 403) {
        throw new Error("DRIVE_ACCESS_DENIED");
      }
      // Retry on 429 (rate limit) or 5xx (server error)
      if ((res.status === 429 || res.status >= 500) && _retryCount < DRIVE_CONFIG.MAX_RETRIES) {
        const delay = DRIVE_CONFIG.RETRY_BASE_MS * Math.pow(2, _retryCount) + Math.random() * 500;
        console.warn(`[Drive] Retry ${_retryCount + 1}/${DRIVE_CONFIG.MAX_RETRIES} after ${Math.round(delay)}ms (HTTP ${res.status})`);
        await new Promise(r => setTimeout(r, delay));
        return driveApiFetch(endpoint, { ...params, key: undefined }, _retryCount + 1);
      }
      throw new Error(msg);
    }
    const data = await res.json();
    cacheSet(url, data);
    driveLastSuccess = Date.now();
    return data;
  } catch (e) {
    // Retry on network errors (timeout, offline)
    if (e.name === 'AbortError' || e.message === 'Failed to fetch') {
      if (_retryCount < DRIVE_CONFIG.MAX_RETRIES) {
        const delay = DRIVE_CONFIG.RETRY_BASE_MS * Math.pow(2, _retryCount) + Math.random() * 500;
        console.warn(`[Drive] Network retry ${_retryCount + 1}/${DRIVE_CONFIG.MAX_RETRIES} after ${Math.round(delay)}ms`);
        await new Promise(r => setTimeout(r, delay));
        return driveApiFetch(endpoint, { ...params, key: undefined }, _retryCount + 1);
      }
    }
    console.error("Drive fetch failed:", e);
    throw e;
  }
}

// === PAGINATED LIST HELPER ===
// Auto-pages through all results using nextPageToken. Max safety cap prevents runaway.
const DRIVE_PAGE_MAX_ITEMS = 1000;

async function driveListPaginated(query, fields, orderBy = "name", maxItems = DRIVE_PAGE_MAX_ITEMS) {
  let allFiles = [];
  let pageToken = null;
  const baseFields = fields.startsWith("files(") ? `nextPageToken,${fields}` : `nextPageToken,files(${fields})`;
  do {
    const params = { q: query, fields: baseFields, orderBy, pageSize: "100" };
    if (pageToken) params.pageToken = pageToken;
    const data = await driveApiFetch("files", params);
    if (data.files) allFiles = allFiles.concat(data.files);
    pageToken = data.nextPageToken || null;
    if (allFiles.length >= maxItems) {
      console.warn(`[Drive] Pagination capped at ${maxItems} items for query: ${query.substring(0, 60)}...`);
      break;
    }
  } while (pageToken);
  return allFiles;
}

// === RECURSIVE FOLDER TRAVERSAL (hierarchy-preserving) ===
const ENGLISH_VERSION_FOLDER = "English Version";

// Returns { tree, allFiles[], allSubfolders[], depth, visitedIds, errors[], hasEnglishVersion, englishVersionId }
// opts.lang: "th" | "en" — controls language filtering
//   "th" → excludes any folder named "English Version"
//   "en" → at root level, ONLY enters "English Version"; skips everything else
// opts.maxDepth: max recursion depth (default 10)
async function driveTraverseRecursive(rootFolderId, opts = {}) {
  const maxDepth = opts.maxDepth || DRIVE_CONFIG.SUBFOLDER_DEPTH;
  const lang = opts.lang || null; // null = traverse everything
  const visited = new Set();
  const allFiles = [];
  const allSubfolders = [];
  const errors = [];
  let maxDepthReached = 0;
  let hasEnglishVersion = false;
  let englishVersionId = null;

  // Build tree node for a folder
  async function traverse(folderId, folderName, parentId, depth) {
    if (depth > maxDepth) return null;
    if (visited.has(folderId)) return null; // Cycle protection
    visited.add(folderId);
    if (depth > maxDepthReached) maxDepthReached = depth;

    const node = {
      id: folderId,
      name: folderName,
      parentId: parentId,
      depth: depth,
      files: [],     // Files directly in this folder
      children: [],  // Subfolder tree nodes
      _isEnglishVersion: false
    };

    try {
      const items = await driveListPaginated(
        `'${folderId}' in parents and trashed=false`,
        "id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,iconLink",
        "folder,name"
      );

      for (const item of items) {
        if (item.mimeType === "application/vnd.google-apps.folder") {
          const isEnFolder = item.name.trim() === ENGLISH_VERSION_FOLDER;
          if (isEnFolder) {
            hasEnglishVersion = true;
            englishVersionId = item.id;
          }

          // Language filtering logic
          if (lang === "th" && isEnFolder) continue;        // TH: skip English Version
          if (lang === "en" && depth === 0 && !isEnFolder) continue; // EN at root: only enter English Version

          allSubfolders.push({ ...item, _parentId: folderId, _depth: depth + 1 });
          const childNode = await traverse(item.id, item.name, folderId, depth + 1);
          if (childNode) {
            childNode._isEnglishVersion = isEnFolder;
            node.children.push(childNode);
          }
        } else {
          // EN mode at root level: skip root-level files (only EN folder content matters)
          if (lang === "en" && depth === 0) continue;

          const fileEntry = { ...item, _parentId: folderId, _depth: depth, _folderName: folderName };
          node.files.push(fileEntry);
          allFiles.push(fileEntry);
        }
      }
    } catch (e) {
      errors.push({ folderId, folderName, depth, message: e.message });
      console.warn(`[Drive] Traversal error at depth ${depth}, folder ${folderId} (${folderName}):`, e.message);
    }

    return node;
  }

  const tree = await traverse(rootFolderId, "Root", null, 0);
  return {
    tree,
    files: allFiles,
    subfolders: allSubfolders,
    depth: maxDepthReached,
    visitedIds: visited,
    visitedCount: visited.size,
    errors,
    hasEnglishVersion,
    englishVersionId
  };
}

// === CONNECTION HEALTH ===
let driveLastSuccess = 0;
let driveHealthTimer = null;

function startDriveHealthCheck() {
  if (driveHealthTimer) return;
  driveHealthTimer = setInterval(async () => {
    if (!driveReady) return;
    // Auto-reconnect if no successful call in 10 minutes
    if (driveLastSuccess && Date.now() - driveLastSuccess > 10 * 60 * 1000) {
      console.log('[Drive] Health check: reconnecting...');
      try {
        const test = await testDriveConnection();
        if (!test.ok) {
          driveError = test.error;
          driveReady = false;
          if (typeof render === 'function') render();
        } else {
          driveLastSuccess = Date.now();
        }
      } catch (e) {
        console.warn('[Drive] Health check failed:', e.message);
      }
    }
  }, 5 * 60 * 1000); // check every 5 min
}

// === LIST FOLDERS IN A PARENT ===
async function driveFolders(parentId) {
  return driveListPaginated(
    `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    "id,name,mimeType,createdTime,modifiedTime",
    "name"
  );
}

// === LIST FILES IN A FOLDER (non-folder items) ===
async function driveFiles(folderId) {
  return driveListPaginated(
    `'${folderId}' in parents and mimeType!='application/vnd.google-apps.folder' and trashed=false`,
    "id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,iconLink",
    "name"
  );
}

// === LIST ALL ITEMS (folders + files) ===
async function driveListAll(folderId) {
  return driveListPaginated(
    `'${folderId}' in parents and trashed=false`,
    "id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,iconLink",
    "folder,name"
  );
}

// === RETRY-AWARE EXPORT FETCH (E-1) ===
async function retryExportFetch(url, _retryCount = 0) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DRIVE_CONFIG.REQUEST_TIMEOUT);
  const res = await fetch(url, { referrerPolicy: 'no-referrer', signal: controller.signal });
  clearTimeout(timeout);
  if (!res.ok) {
    driveQuota.trackError();
    if ((res.status === 429 || res.status >= 500) && _retryCount < DRIVE_CONFIG.MAX_RETRIES) {
      const delay = DRIVE_CONFIG.RETRY_BASE_MS * Math.pow(2, _retryCount) + Math.random() * 500;
      console.warn(`[Export] Retry ${_retryCount + 1}/${DRIVE_CONFIG.MAX_RETRIES} after ${Math.round(delay)}ms (HTTP ${res.status})`);
      await new Promise(r => setTimeout(r, delay));
      return retryExportFetch(url, _retryCount + 1);
    }
    throw new Error(`Export failed: ${res.status}`);
  }
  return res;
}

// === GET GOOGLE DOC CONTENT (as HTML) ===
async function driveDocContent(fileId) {
  const cacheKey = `doc_html_${fileId}`;
  const cached = cacheGet(cacheKey);
  if (cached) { driveQuota.trackCacheHit(); return cached; }
  driveQuota.trackCall();
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/html&key=${DRIVE_CONFIG.API_KEY}`;
  try {
    const res = await retryExportFetch(url);
    let html = await res.text();
    // Strip Google's wrapper styles, keep only body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) html = bodyMatch[1];
    cacheSet(cacheKey, html);
    return html;
  } catch (e) {
    console.error("Doc export failed:", e);
    return null;
  }
}

// === GET GOOGLE DOC CONTENT (as plain text) ===
async function driveDocText(fileId) {
  const cacheKey = `doc_text_${fileId}`;
  const cached = cacheGet(cacheKey);
  if (cached) { driveQuota.trackCacheHit(); return cached; }
  driveQuota.trackCall();
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain&key=${DRIVE_CONFIG.API_KEY}`;
  try {
    const res = await retryExportFetch(url);
    const text = await res.text();
    cacheSet(cacheKey, text);
    return text;
  } catch (e) {
    console.error("Doc text export failed:", e);
    return null;
  }
}

// === GET GOOGLE SHEETS DATA (as CSV) ===
async function driveSheetCSV(fileId) {
  const cacheKey = `sheet_csv_${fileId}`;
  const cached = cacheGet(cacheKey);
  if (cached) { driveQuota.trackCacheHit(); return cached; }
  driveQuota.trackCall();
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv&key=${DRIVE_CONFIG.API_KEY}`;
  try {
    const res = await retryExportFetch(url);
    const csv = await res.text();
    cacheSet(cacheKey, csv);
    return csv;
  } catch (e) {
    console.error("Sheet CSV export failed:", e);
    return null;
  }
}

// === PARSE CSV TO ARRAY OF OBJECTS ===
function parseCSV(csv) {
  const lines = csv.split("\n").filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map(line => {
    const vals = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === ',' && !inQuotes) { vals.push(current.trim()); current = ""; }
      else { current += ch; }
    }
    vals.push(current.trim());
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = vals[idx] || ""; });
    return obj;
  });
}

// === HELPER: FILE TYPE INFO ===
function driveFileInfo(mimeType) {
  const map = {
    "application/vnd.google-apps.document": { icon: "description", label: "Google Doc", color: "#4285F4", canExport: true },
    "application/vnd.google-apps.spreadsheet": { icon: "table_chart", label: "Google Sheet", color: "#0F9D58", canExport: true },
    "application/vnd.google-apps.presentation": { icon: "slideshow", label: "Google Slides", color: "#F4B400", canExport: false },
    "application/vnd.google-apps.form": { icon: "quiz", label: "Google Form", color: "#7627BB", canExport: false },
    "application/pdf": { icon: "picture_as_pdf", label: "PDF", color: "#EA4335", canExport: false },
    "image/jpeg": { icon: "image", label: "JPEG", color: "#34A853", canExport: false },
    "image/png": { icon: "image", label: "PNG", color: "#34A853", canExport: false },
    "image/gif": { icon: "gif", label: "GIF", color: "#34A853", canExport: false },
    "image/webp": { icon: "image", label: "WebP", color: "#34A853", canExport: false },
    "video/mp4": { icon: "movie", label: "MP4", color: "#EA4335", canExport: false },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { icon: "description", label: "Word", color: "#4285F4", canExport: false },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { icon: "table_chart", label: "Excel", color: "#0F9D58", canExport: false },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": { icon: "slideshow", label: "PowerPoint", color: "#F4B400", canExport: false },
    "application/zip": { icon: "folder_zip", label: "ZIP", color: "#5F6368", canExport: false }
  };
  return map[mimeType] || { icon: "insert_drive_file", label: mimeType?.split("/").pop() || "File", color: "#5F6368", canExport: false };
}

// === FORMAT FILE SIZE ===
function formatFileSize(bytes) {
  if (!bytes) return "";
  const b = parseInt(bytes);
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}

// === DETERMINISTIC INDICATOR MAPPING ===
// Mapping table: indicatorId -> { folderId, cat, locked, source, folderName, hasEnglishVersion }
// Each indicator has ONE root folder. "English Version" subfolder is detected at sync time.
// Stored in localStorage("84_drive_mapping"), populated by auto-discover, locked by admin.
const MAPPING_STORAGE_KEY = "84_drive_mapping";
const SYNC_STATE_KEY = "84_sync_state";

// Legacy compat: driveFolderMap still used by some UI helpers
const driveFolderMap = {}; // catId -> folderId (populated from mapping)
let driveFolderMapReady = false;

function loadMapping() {
  try { return JSON.parse(localStorage.getItem(MAPPING_STORAGE_KEY)) || {}; } catch (e) { return {}; }
}
function saveMapping(mapping) {
  try { localStorage.setItem(MAPPING_STORAGE_KEY, JSON.stringify(mapping)); } catch (e) { console.error("[Mapping] Save failed:", e); }
}
function getMappingForIndicator(indicatorId) {
  const mapping = loadMapping();
  return mapping[indicatorId] || null;
}

function loadSyncState() {
  try { return JSON.parse(localStorage.getItem(SYNC_STATE_KEY)) || {}; } catch (e) { return {}; }
}
function saveSyncState(state) {
  try { localStorage.setItem(SYNC_STATE_KEY, JSON.stringify(state)); } catch (e) { console.error("[SyncState] Save failed:", e); }
}

// === NAME MATCHING (used only during auto-discover) ===
function matchIndicatorNumber(name) {
  const m = name.match(/^(\d+)[\s.\-_]*/);
  if (m) return parseInt(m[1]);
  const m2 = name.match(/(?:ข้อ|ที่)\s*(\d+)/);
  if (m2) return parseInt(m2[1]);
  return null;
}
function matchCategoryNumber(name) {
  const m = name.match(/หมวด\s*(\d+)/i) || name.match(/cat(?:egory)?\s*(\d+)/i);
  if (m) return parseInt(m[1]);
  return null;
}
function folderMatchesIndicator(folderName, indicatorId) {
  return matchIndicatorNumber(folderName) === indicatorId;
}

// === AUTO-DISCOVER ENGINE ===
// Scans Drive root → category folders → indicator folders.
// Each indicator maps to ONE root folder (folderId).
// "English Version" subfolder is detected during sync, not discovery.
// Returns { mapping, changes[], newFolders[], missingFolders[], catFolderMap } for admin review.
async function autoDiscoverMapping() {
  const existingMapping = loadMapping();
  const newMapping = {};
  const changes = [];
  const newFolders = [];
  const missingFolders = [];
  const catFolderMap = {}; // catId -> folderId (intermediate)

  // 1. Discover category folders under Drive root
  const rootFolders = await driveFolders(DRIVE_CONFIG.ROOT_FOLDER_ID);
  for (const f of rootFolders) {
    const catId = matchCategoryNumber(f.name);
    if (catId && catId >= 1 && catId <= 6) {
      catFolderMap[catId] = f.id;
      driveFolderMap[catId] = f.id; // Legacy compat
    }
  }
  driveFolderMapReady = true;

  // 2. Discover indicator folders within each category
  for (const catId of Object.keys(catFolderMap)) {
    const catFolderId = catFolderMap[catId];
    const items = await driveListAll(catFolderId);
    const folders = items.filter(f => f.mimeType === "application/vnd.google-apps.folder");
    for (const folder of folders) {
      const num = matchIndicatorNumber(folder.name);
      if (num && num >= 1 && num <= 84) {
        newMapping[num] = {
          folderId: folder.id,
          folderName: folder.name,
          cat: parseInt(catId)
        };
      }
    }
  }

  // 3. Compare with existing mapping to detect changes
  for (let i = 1; i <= 84; i++) {
    const old = existingMapping[i];
    const neu = newMapping[i];
    if (!neu || !neu.folderId) {
      missingFolders.push({ indicatorId: i, reason: "Folder not found in Drive" });
      // Preserve existing mapping if it was locked
      if (old && old.locked) {
        newMapping[i] = { ...old, _discoveryMissing: true };
      }
      continue;
    }
    if (!old) {
      newFolders.push({ indicatorId: i, folderId: neu.folderId, folderName: neu.folderName });
    } else {
      if (old.folderId !== neu.folderId) {
        changes.push({ indicatorId: i, field: "folderId", oldValue: old.folderId, newValue: neu.folderId, oldName: old.folderName, newName: neu.folderName });
      }
      // Carry over lock status if unchanged
      if (old.locked && old.folderId === neu.folderId) {
        newMapping[i].locked = old.locked;
        newMapping[i].source = old.source;
        newMapping[i].hasEnglishVersion = old.hasEnglishVersion;
      }
    }
  }

  return { mapping: newMapping, changes, newFolders, missingFolders, catFolderMap };
}

// === MAPPING LOCK/UNLOCK/EXPORT ===
function lockMapping(mapping) {
  const ts = new Date().toISOString();
  const locked = {};
  for (const [id, entry] of Object.entries(mapping)) {
    locked[id] = { ...entry, locked: ts, source: entry.source || "auto" };
  }
  saveMapping(locked);
  console.log(`[Mapping] Locked ${Object.keys(locked).length} indicator mappings at ${ts}`);
  return locked;
}

function lockSingleMapping(indicatorId, entry) {
  const mapping = loadMapping();
  mapping[indicatorId] = { ...entry, locked: new Date().toISOString(), source: entry.source || "manual" };
  saveMapping(mapping);
}

function unlockMapping(indicatorId) {
  const mapping = loadMapping();
  if (mapping[indicatorId]) {
    delete mapping[indicatorId].locked;
    mapping[indicatorId].source = "unlocked";
    saveMapping(mapping);
  }
}

function exportMappingManifest() {
  const mapping = loadMapping();
  const manifest = {
    version: 2,
    exportedAt: new Date().toISOString(),
    rootFolderId: DRIVE_CONFIG.ROOT_FOLDER_ID,
    model: "single-root",
    indicators: mapping
  };
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `84-indicators-mapping-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importMappingManifest(jsonString) {
  try {
    const manifest = JSON.parse(jsonString);
    if (!manifest.indicators || typeof manifest.indicators !== "object") {
      throw new Error("Invalid manifest: missing 'indicators' object");
    }
    const count = Object.keys(manifest.indicators).length;
    if (count < 1 || count > 84) {
      throw new Error(`Invalid manifest: ${count} indicators (expected 1-84)`);
    }
    saveMapping(manifest.indicators);
    console.log(`[Mapping] Imported ${count} indicators from manifest`);
    return { ok: true, count };
  } catch (e) {
    console.error("[Mapping] Import failed:", e);
    return { ok: false, error: e.message };
  }
}

// === BUILD FOLDER MAP (legacy compat + new mapping aware) ===
// lang param: "th" uses ROOT_FOLDER_ID, "en" uses EN_ROOT_FOLDER_ID
async function buildDriveFolderMap(lang) {
  const effectiveLang = lang || "th";
  const rootId = effectiveLang === "en" ? DRIVE_CONFIG.EN_ROOT_FOLDER_ID : DRIVE_CONFIG.ROOT_FOLDER_ID;
  // Use language-specific ready flag to avoid rebuilding unnecessarily
  const readyKey = `_folderMapReady_${effectiveLang}`;
  if (driveFolderMapReady && driveFolderMap[readyKey] && Object.keys(driveFolderMap).length > 1) return driveFolderMap;
  try {
    const folders = await driveFolders(rootId);
    folders.forEach(f => {
      // For TH: skip "English Version" folders at category level
      if (effectiveLang === "th" && f.name.trim() === ENGLISH_VERSION_FOLDER) return;
      const catId = matchCategoryNumber(f.name);
      if (catId && catId >= 1 && catId <= 6) driveFolderMap[catId] = f.id;
    });
    driveFolderMap[readyKey] = true;
    driveFolderMapReady = true;
    console.log(`Drive folder map built (${effectiveLang}):`, driveFolderMap);
    return driveFolderMap;
  } catch (e) {
    console.error("Failed to build folder map:", e);
    return driveFolderMap;
  }
}

// === GET FILES FOR A CATEGORY ===
async function driveFilesForCategory(catId) {
  await buildDriveFolderMap();
  const folderId = driveFolderMap[catId];
  if (!folderId) return [];
  return driveListAll(folderId);
}

// === GET FILES FOR A SPECIFIC INDICATOR (deterministic mapping + recursive + language-aware) ===
// Returns { files[], tree, subfolders[], docContent, matchedFolder, traversal, validation, hasEnglishVersion }
async function driveFilesForIndicator(indicatorId, catId, useEnglish = false) {
  const mapping = getMappingForIndicator(indicatorId);
  const lang = useEnglish ? "en" : "th";
  const folderId = mapping?.folderId || null;

  // If we have a locked/discovered mapping, use it with language-filtered recursive traversal
  if (folderId) {
    try {
      const result = await driveTraverseRecursive(folderId, { lang });

      // EN mode: if no "English Version" subfolder exists, return clear error
      if (useEnglish && !result.hasEnglishVersion) {
        return {
          files: [], tree: null, subfolders: [], docContent: null,
          matchedFolder: { name: mapping.folderName || "Mapped Folder", id: folderId },
          traversal: { depth: 0, errors: [], visitedCount: result.visitedCount },
          validation: { status: "error", issues: ["Incomplete English data — no \"English Version\" subfolder found"] },
          hasEnglishVersion: false
        };
      }

      let docContent = null;
      const firstDoc = result.files.find(f => f.mimeType === "application/vnd.google-apps.document");
      if (firstDoc) {
        try { docContent = await driveDocContent(firstDoc.id); } catch (e) { console.warn(`[Drive] Doc fetch failed for indicator ${indicatorId}:`, e.message); }
      }

      return {
        files: result.files,
        tree: result.tree,
        subfolders: result.subfolders,
        docContent,
        matchedFolder: { name: mapping.folderName || "Mapped Folder", id: folderId },
        traversal: { depth: result.depth, errors: result.errors, visitedCount: result.visitedCount },
        validation: result.errors.length > 0
          ? { status: "warning", issues: result.errors.map(e => `Traversal error: ${e.message}`) }
          : null,
        hasEnglishVersion: result.hasEnglishVersion
      };
    } catch (e) {
      return {
        files: [], tree: null, subfolders: [], docContent: null, matchedFolder: null,
        traversal: { depth: 0, errors: [{ folderId, depth: 0, message: e.message }], visitedCount: 0 },
        validation: { status: "error", issues: [`Traversal failed: ${e.message}`] },
        hasEnglishVersion: false
      };
    }
  }

  // No mapping exists — return explicit error (NO fallback guessing)
  return {
    files: [], tree: null, subfolders: [], docContent: null, matchedFolder: null,
    traversal: null,
    validation: { status: "error", issues: ["No folder mapping for this indicator — run Auto-Discover in Admin panel"] },
    hasEnglishVersion: false
  };
}

// === VALIDATION LAYER ===
function validateIndicatorResult(indicatorId, result, mapping) {
  const issues = [];
  let status = "ok";

  // Check mapping exists
  if (!mapping || !mapping.folderId) {
    return { status: "error", issues: ["No mapping found for this indicator"], fileCount: 0, folderExists: false, traversalComplete: false, subfolderIssues: [] };
  }

  const folderExists = true;

  // Check traversal
  let traversalComplete = true;
  if (result && result.traversal) {
    if (result.traversal.errors && result.traversal.errors.length > 0) {
      issues.push(`Traversal had ${result.traversal.errors.length} error(s)`);
      traversalComplete = false;
      if (status !== "error") status = "warning";
    }
  } else if (result && !result.matchedFolder) {
    traversalComplete = false;
    issues.push("Folder not accessible or not found");
    status = "error";
  }

  // Check file count
  const fileCount = result ? result.files.length : 0;
  if (fileCount === 0 && folderExists) {
    issues.push("Folder exists but contains no files (TH)");
    if (status !== "error") status = "warning";
  }

  // Check English Version presence
  if (!result?.hasEnglishVersion) {
    issues.push("No \"English Version\" subfolder");
    if (status !== "error") status = "warning";
  }

  // Subfolder structure analysis
  const subfolderIssues = [];
  if (result && result.tree) {
    analyzeSubfolderStructure(result.tree, subfolderIssues);
    if (subfolderIssues.length > 0) {
      issues.push(...subfolderIssues.map(s => s.message));
      if (status === "ok") status = "warning";
    }
  }

  return { status, issues, fileCount, folderExists, traversalComplete, subfolderIssues };
}

// Detect structural issues in folder tree
function analyzeSubfolderStructure(node, issues, path = "") {
  const currentPath = path ? `${path}/${node.name}` : node.name;

  // Empty subfolder (has no files AND no children with files)
  if (node.depth > 0 && node.files.length === 0 && node.children.length === 0) {
    issues.push({ type: "empty_subfolder", path: currentPath, message: `Empty subfolder: ${currentPath}` });
  }

  // Files at root level when subfolders exist (potential misplacement)
  if (node.depth === 0 && node.files.length > 0 && node.children.length > 0) {
    issues.push({ type: "root_files_with_subfolders", path: currentPath, message: `${node.files.length} file(s) at root level alongside subfolders` });
  }

  for (const child of node.children) {
    analyzeSubfolderStructure(child, issues, currentPath);
  }
}

// Count all files recursively in a tree node
function countTreeFiles(node) {
  let count = node.files ? node.files.length : 0;
  if (node.children) {
    for (const child of node.children) count += countTreeFiles(child);
  }
  return count;
}

async function validateAllIndicators() {
  const mapping = loadMapping();
  const syncState = loadSyncState();
  const results = {};
  const allFileIds = {}; // fileId -> [indicatorIds] for duplicate detection
  const globalIssues = [];

  for (let i = 1; i <= 84; i++) {
    const m = mapping[i];
    const cached = syncState[i];

    const fileCount = cached ? (cached.thFileCount || 0) : 0;
    const enFileCount = cached ? (cached.enFileCount || 0) : 0;
    const issues = [];
    let status = "ok";

    if (!m || !m.folderId) {
      status = "error";
      issues.push("No mapping");
    } else {
      if (m._discoveryMissing) { status = "error"; issues.push("Folder missing during last discovery"); }
      if (!cached?.hasEnglishVersion) {
        if (status !== "error") status = "warning";
        issues.push("No \"English Version\" subfolder");
      }
    }

    if (cached && cached.validationStatus === "error") {
      status = "error";
      if (cached.validationIssues) issues.push(...cached.validationIssues);
    }

    if (fileCount === 0 && m && m.folderId) {
      if (status !== "error") status = "warning";
      issues.push("No TH files found");
    }

    // Track file IDs for duplicate detection
    if (cached && cached.thFiles) {
      for (const f of cached.thFiles) {
        if (!allFileIds[f.id]) allFileIds[f.id] = [];
        allFileIds[f.id].push(i);
      }
    }

    results[i] = { status, issues, fileCount, enFileCount, lastSyncedAt: cached?.lastSyncedAt || null };
  }

  // Detect duplicate files across indicators
  const duplicates = {};
  for (const [fileId, indicators] of Object.entries(allFileIds)) {
    if (indicators.length > 1) {
      duplicates[fileId] = indicators;
      for (const ind of indicators) {
        if (results[ind].status !== "error") results[ind].status = "warning";
        results[ind].issues.push(`File ${fileId} also in indicator(s) ${indicators.filter(x => x !== ind).join(", ")}`);
      }
    }
  }

  if (Object.keys(duplicates).length > 0) {
    globalIssues.push(`${Object.keys(duplicates).length} file(s) appear in multiple indicators`);
  }

  const unmapped = Object.values(results).filter(r => r.issues.includes("No mapping")).length;
  if (unmapped > 0) globalIssues.push(`${unmapped} indicator(s) have no folder mapping`);

  const summary = {
    ok: Object.values(results).filter(r => r.status === "ok").length,
    warning: Object.values(results).filter(r => r.status === "warning").length,
    error: Object.values(results).filter(r => r.status === "error").length
  };

  return { results, globalIssues, summary, duplicates };
}

// === UNIFIED SYNC ENGINE ===
// Single-root model: each indicator has one folderId.
// Traverses with lang="th" (excludes English Version) and lang="en" (only English Version).
// Stores subfolder tree metadata, hasEnglishVersion flag, and per-subfolder file counts.
let syncInProgress = false;
let lastFullSyncAt = null;

async function fullSync(options = {}) {
  if (syncInProgress) { console.warn("[Sync] Already in progress, skipping"); return null; }
  syncInProgress = true;
  const force = options.force || false;
  const syncState = force ? {} : loadSyncState();
  let mapping = loadMapping();

  // If no mapping exists, auto-discover first
  if (Object.keys(mapping).length === 0) {
    console.log("[Sync] No mapping found — running auto-discover...");
    const discovery = await autoDiscoverMapping();
    mapping = lockMapping(discovery.mapping);
  }

  const results = {};
  let totalThFiles = 0;
  let totalEnFiles = 0;
  const errors = [];

  for (let i = 1; i <= 84; i++) {
    const m = mapping[i];
    if (!m || !m.folderId) {
      results[i] = {
        lastSyncedAt: null, thFileCount: 0, enFileCount: 0, thFiles: [], enFiles: [],
        validationStatus: "error", validationIssues: ["No mapping"],
        hasEnglishVersion: false, subfolderNames: [], thDepth: 0, enDepth: 0
      };
      continue;
    }

    // Check quota before each indicator
    const q = driveQuota.getStats();
    if (q.pct >= 90) {
      console.warn(`[Sync] Quota at ${q.pct}% — stopping sync to protect budget`);
      errors.push({ indicatorId: i, message: `Sync stopped: API quota at ${q.pct}%` });
      break;
    }

    const entry = {
      lastSyncedAt: Date.now(),
      thFileCount: 0, enFileCount: 0,
      thFiles: [], enFiles: [],
      validationStatus: "ok", validationIssues: [],
      hasEnglishVersion: false,
      subfolderNames: [],   // All subfolder names (excluding English Version)
      thSubfolders: 0, enSubfolders: 0,
      thDepth: 0, enDepth: 0,
      subfolderFileCount: {} // { folderName: fileCount }
    };

    // TH traversal (excludes "English Version")
    try {
      const thResult = await driveTraverseRecursive(m.folderId, { lang: "th" });
      entry.thFileCount = thResult.files.length;
      entry.thFiles = thResult.files.map(f => ({ id: f.id, name: f.name, mimeType: f.mimeType, link: f.webViewLink, _folderName: f._folderName }));
      entry.thDepth = thResult.depth;
      entry.thSubfolders = thResult.subfolders.length;
      entry.hasEnglishVersion = thResult.hasEnglishVersion;

      // Extract subfolder names and per-subfolder file counts from tree
      if (thResult.tree) {
        for (const child of thResult.tree.children) {
          entry.subfolderNames.push(child.name);
          entry.subfolderFileCount[child.name] = countTreeFiles(child);
        }
        // Root-level files
        if (thResult.tree.files.length > 0) {
          entry.subfolderFileCount["(root)"] = thResult.tree.files.length;
        }
      }

      if (thResult.errors.length > 0) {
        entry.validationIssues.push(`TH traversal: ${thResult.errors.length} error(s)`);
        if (entry.validationStatus === "ok") entry.validationStatus = "warning";
      }
      totalThFiles += thResult.files.length;
    } catch (e) {
      entry.validationStatus = "error";
      entry.validationIssues.push(`TH traversal failed: ${e.message}`);
      errors.push({ indicatorId: i, lang: "th", message: e.message });
    }

    // EN traversal (only "English Version" subfolder)
    try {
      const enResult = await driveTraverseRecursive(m.folderId, { lang: "en" });
      entry.enFileCount = enResult.files.length;
      entry.enFiles = enResult.files.map(f => ({ id: f.id, name: f.name, mimeType: f.mimeType, link: f.webViewLink, _folderName: f._folderName }));
      entry.enDepth = enResult.depth;
      entry.enSubfolders = enResult.subfolders.length;
      if (!entry.hasEnglishVersion) entry.hasEnglishVersion = enResult.hasEnglishVersion;

      if (enResult.errors.length > 0) {
        entry.validationIssues.push(`EN traversal: ${enResult.errors.length} error(s)`);
        if (entry.validationStatus === "ok") entry.validationStatus = "warning";
      }
      totalEnFiles += enResult.files.length;
    } catch (e) {
      if (entry.validationStatus === "ok") entry.validationStatus = "warning";
      entry.validationIssues.push(`EN traversal failed: ${e.message}`);
      errors.push({ indicatorId: i, lang: "en", message: e.message });
    }

    // Validation: no English Version subfolder
    if (!entry.hasEnglishVersion) {
      if (entry.validationStatus === "ok") entry.validationStatus = "warning";
      entry.validationIssues.push("No \"English Version\" subfolder");
    }

    // Validation: TH folder has no files
    if (entry.thFileCount === 0) {
      if (entry.validationStatus === "ok") entry.validationStatus = "warning";
      entry.validationIssues.push("Folder exists but has no TH files");
    }

    // Update mapping with hasEnglishVersion flag
    if (mapping[i]) {
      mapping[i].hasEnglishVersion = entry.hasEnglishVersion;
    }

    results[i] = entry;
  }

  // Save updated mapping (with hasEnglishVersion flags)
  saveMapping(mapping);

  // Update sync state
  const fullState = { ...syncState, ...results, _lastFullSync: Date.now(), _errors: errors };
  saveSyncState(fullState);
  lastFullSyncAt = Date.now();

  // Update legacy INDICATOR_TH / INDICATOR_EN for backward compat
  const thMeta = {};
  const enMeta = {};
  for (const [id, entry] of Object.entries(results)) {
    if (typeof entry !== "object" || !entry.lastSyncedAt) continue;
    thMeta[id] = { id: parseInt(id), filesCount: entry.thFileCount, files: entry.thFiles || [], fetchedAt: entry.lastSyncedAt };
    if (entry.enFileCount > 0 || entry.hasEnglishVersion) {
      enMeta[id] = { id: parseInt(id), folderId: mapping[id]?.folderId, filesCount: entry.enFileCount, files: entry.enFiles || [], fetchedAt: entry.lastSyncedAt };
    }
  }
  window.INDICATOR_TH = thMeta;
  window.INDICATOR_EN = enMeta;
  try {
    localStorage.setItem("84th_metadata", JSON.stringify(thMeta));
    localStorage.setItem("84en_metadata", JSON.stringify(enMeta));
    localStorage.setItem("84th_last_sync", Date.now().toString());
    localStorage.setItem("84en_last_sync", Date.now().toString());
  } catch (e) { console.warn("[Sync] localStorage save failed:", e.message); }

  syncInProgress = false;
  console.log(`[Sync] Complete: ${Object.keys(results).length} indicators, TH=${totalThFiles} files, EN=${totalEnFiles} files, ${errors.length} errors`);

  return { results, errors, totalThFiles, totalEnFiles, timestamp: lastFullSyncAt };
}

// === DRIVE CONNECTION TEST ===
async function testDriveConnection() {
  try {
    const folders = await driveFolders(DRIVE_CONFIG.ROOT_FOLDER_ID);
    return { ok: true, folders: folders.length, names: folders.map(f => f.name) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// === DECORATIVE IMAGES FROM DRIVE ===
let driveHeroImages = []; // cached hero/decorative images

async function fetchDriveImages() {
  if (driveHeroImages.length > 0) return driveHeroImages;
  if (!driveReady) return [];
  try {
    // Look for an "images" or "ภาพ" folder in root, or collect images from all category folders
    const rootFolders = await driveFolders(DRIVE_CONFIG.ROOT_FOLDER_ID);
    const imgFolder = rootFolders.find(f => /^(images|ภาพ|photos|รูปภาพ|decoration)/i.test(f.name));
    let images = [];
    if (imgFolder) {
      const files = await driveFiles(imgFolder.id);
      images = files.filter(f => f.mimeType?.startsWith("image/"));
    }
    // If no dedicated folder, collect thumbnail-worthy images from category folders
    if (images.length === 0) {
      for (const catId of Object.keys(driveFolderMap)) {
        const items = await driveListAll(driveFolderMap[catId]);
        const catImages = items.filter(f => f.mimeType?.startsWith("image/") && f.thumbnailLink);
        images.push(...catImages.slice(0, 3)); // max 3 per category
        if (images.length >= 12) break;
      }
    }
    driveHeroImages = images.map(f => ({
      id: f.id,
      name: f.name,
      thumb: f.thumbnailLink ? f.thumbnailLink.replace(/=s\d+/, "=s800") : null,
      full: f.webContentLink || f.webViewLink,
      mimeType: f.mimeType
    })).filter(i => i.thumb);
    console.log("Decorative images found:", driveHeroImages.length);
    return driveHeroImages;
  } catch (e) {
    console.warn("Failed to fetch decorative images:", e);
    return [];
  }
}

// === INITIALIZE ===
let driveReady = false;
let driveError = null;

async function initDrive() {
  try {
    const test = await testDriveConnection();
    if (test.ok) {
      console.log(`Drive connected: ${test.folders} folders found:`, test.names);
      await buildDriveFolderMap();
      driveReady = true;
      driveLastSuccess = Date.now();
      startDriveHealthCheck();

      // Run unified sync in background (auto-discovers mapping if none exists)
      fullSync().then(() => {
        if (typeof render === 'function') render();
        console.log("[Drive] Background sync complete");
      }).catch(e => console.warn("[Drive] Background sync failed:", e.message));
    } else {
      driveError = test.error;
      console.warn("Drive connection failed:", test.error);
    }
  } catch (e) {
    driveError = e.message;
    console.warn("Drive init failed:", e);
  }
  return driveReady;
}

// === LEGACY COMPAT: Load cached metadata on script load ===
window.INDICATOR_EN = (function () { try { return JSON.parse(localStorage.getItem('84en_metadata')) || {}; } catch (e) { return {}; } })();
window.INDICATOR_TH = (function () { try { return JSON.parse(localStorage.getItem('84th_metadata')) || {}; } catch (e) { return {}; } })();

// Legacy sync stubs — now delegate to fullSync
async function syncThaiMetadata() { if (driveReady && !syncInProgress) await fullSync(); }
async function syncEnglishMetadata() { if (driveReady && !syncInProgress) await fullSync(); }
