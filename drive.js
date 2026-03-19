// === GOOGLE DRIVE API MODULE ===
const DRIVE_CONFIG = {
  API_KEY: "AIzaSyCA2-JWG89Q8DzwnHKBUhb_P3arsd8GizI",
  ROOT_FOLDER_ID: "16SyUIAG8sHsgQDmlGjO5cB4-8nRGP1L9",
  API_BASE: "https://www.googleapis.com/drive/v3",
  CACHE_TTL: 5 * 60 * 1000 // 5 minutes
};

// === CACHE ===
const driveCache = {};
function cacheGet(key) {
  const entry = driveCache[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > DRIVE_CONFIG.CACHE_TTL) { delete driveCache[key]; return null; }
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
const DRIVE_MAX_RETRIES = 3;
const DRIVE_RETRY_BASE_MS = 1000;

async function driveApiFetch(endpoint, params = {}, _retryCount = 0) {
  // Quota guard: block calls when near daily limit
  const q = driveQuota.getStats();
  if (q.pct >= 95) {
    throw new Error('API quota ≥95% — หยุดเรียก API เพื่อป้องกันค่าใช้จ่าย (quota guard)');
  }
  params.key = DRIVE_CONFIG.API_KEY;
  const qs = new URLSearchParams(params).toString();
  const url = `${DRIVE_CONFIG.API_BASE}/${endpoint}?${qs}`;
  const cached = cacheGet(url);
  if (cached) { driveQuota.trackCacheHit(); return cached; }
  driveQuota.trackCall();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
    const res = await fetch(url, { referrerPolicy: 'no-referrer', signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) {
      driveQuota.trackError();
      const err = await res.json().catch(() => ({}));
      const reason = err.error?.details?.[0]?.reason || "";
      const msg = err.error?.message || `HTTP ${res.status}`;
      console.error("Drive API error:", res.status, err);
      if (reason === "API_KEY_HTTP_REFERRER_BLOCKED") {
        throw new Error("API Key ถูกบล็อก — กรุณาเพิ่ม " + window.location.origin + "/* เป็น Allowed Referrer ใน Google Cloud Console");
      }
      if (res.status === 404) {
        throw new Error("ไม่พบโฟลเดอร์ — ตรวจสอบ Folder ID");
      }
      if (res.status === 403) {
        throw new Error("ไม่มีสิทธิ์เข้าถึง — ตรวจสอบว่าโฟลเดอร์แชร์เป็น 'Anyone with the link' แล้ว");
      }
      // Retry on 429 (rate limit) or 5xx (server error)
      if ((res.status === 429 || res.status >= 500) && _retryCount < DRIVE_MAX_RETRIES) {
        const delay = DRIVE_RETRY_BASE_MS * Math.pow(2, _retryCount) + Math.random() * 500;
        console.warn(`[Drive] Retry ${_retryCount + 1}/${DRIVE_MAX_RETRIES} after ${Math.round(delay)}ms (HTTP ${res.status})`);
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
      if (_retryCount < DRIVE_MAX_RETRIES) {
        const delay = DRIVE_RETRY_BASE_MS * Math.pow(2, _retryCount) + Math.random() * 500;
        console.warn(`[Drive] Network retry ${_retryCount + 1}/${DRIVE_MAX_RETRIES} after ${Math.round(delay)}ms`);
        await new Promise(r => setTimeout(r, delay));
        return driveApiFetch(endpoint, { ...params, key: undefined }, _retryCount + 1);
      }
    }
    console.error("Drive fetch failed:", e);
    throw e;
  }
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
      } catch(e) {
        console.warn('[Drive] Health check failed:', e.message);
      }
    }
  }, 5 * 60 * 1000); // check every 5 min
}

// === LIST FOLDERS IN A PARENT ===
async function driveFolders(parentId) {
  const data = await driveApiFetch("files", {
    q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id,name,mimeType,createdTime,modifiedTime)",
    orderBy: "name",
    pageSize: "100"
  });
  return data.files || [];
}

// === LIST FILES IN A FOLDER (non-folder items) ===
async function driveFiles(folderId) {
  const data = await driveApiFetch("files", {
    q: `'${folderId}' in parents and mimeType!='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,iconLink)",
    orderBy: "name",
    pageSize: "200"
  });
  return data.files || [];
}

// === LIST ALL ITEMS (folders + files) ===
async function driveListAll(folderId) {
  const data = await driveApiFetch("files", {
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink,iconLink)",
    orderBy: "folder,name",
    pageSize: "200"
  });
  return data.files || [];
}

// === GET GOOGLE DOC CONTENT (as HTML) ===
async function driveDocContent(fileId) {
  const cacheKey = `doc_html_${fileId}`;
  const cached = cacheGet(cacheKey);
  if (cached) { driveQuota.trackCacheHit(); return cached; }
  driveQuota.trackCall();
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/html&key=${DRIVE_CONFIG.API_KEY}`;
  try {
    const res = await fetch(url, { referrerPolicy: 'no-referrer' });
    if (!res.ok) { driveQuota.trackError(); throw new Error(`Export failed: ${res.status}`); }
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
    const res = await fetch(url, { referrerPolicy: 'no-referrer' });
    if (!res.ok) { driveQuota.trackError(); throw new Error(`Export failed: ${res.status}`); }
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
    const res = await fetch(url, { referrerPolicy: 'no-referrer' });
    if (!res.ok) { driveQuota.trackError(); throw new Error(`Sheet export failed: ${res.status}`); }
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

// === MAP DRIVE FOLDERS TO CATEGORIES ===
// Matches folder names like "หมวด 1 ..." to category IDs 1-6
const driveFolderMap = {}; // catId -> folderId
let driveFolderMapReady = false;

async function buildDriveFolderMap() {
  if (driveFolderMapReady) return driveFolderMap;
  try {
    const folders = await driveFolders(DRIVE_CONFIG.ROOT_FOLDER_ID);
    folders.forEach(f => {
      // Match "หมวด X" or "Category X" pattern
      const m = f.name.match(/หมวด\s*(\d+)/i) || f.name.match(/cat(?:egory)?\s*(\d+)/i);
      if (m) {
        const catId = parseInt(m[1]);
        if (catId >= 1 && catId <= 6) driveFolderMap[catId] = f.id;
      }
    });
    driveFolderMapReady = true;
    console.log("Drive folder map built:", driveFolderMap);
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

// === GET FILES FOR A SPECIFIC INDICATOR ===
// Supported folder naming patterns:
//   "1ผู้ประสานงาน"   — digit(s) immediately followed by Thai text
//   "10 การติดตาม"    — digit(s) then space
//   "1.ผู้ประสานงาน"  — digit(s) then dot
//   "1-ผู้ประสานงาน"  — digit(s) then dash
//   "ตัวชี้วัดที่ 1"  — Thai with trailing digit (fallback)
function matchIndicatorNumber(name) {
  // Primary: leading digits (with optional separator)
  const m = name.match(/^(\d+)[\s.\-_]*/);
  if (m) return parseInt(m[1]);
  // Secondary: Thai pattern "ข้อ N" or "ที่ N"
  const m2 = name.match(/(?:ข้อ|ที่)\s*(\d+)/);
  if (m2) return parseInt(m2[1]);
  return null;
}

// Exact match check: folder number must equal indicatorId exactly (no prefix collision e.g. 1 vs 10)
function folderMatchesIndicator(folderName, indicatorId) {
  return matchIndicatorNumber(folderName) === indicatorId;
}

async function driveFilesForIndicator(indicatorId, catId) {
  await buildDriveFolderMap();
  const catFolderId = driveFolderMap[catId];
  if (!catFolderId) return { files: [], subfolders: [], docContent: null, matchedFolder: null };

  const allItems = await driveListAll(catFolderId);
  const folders = allItems.filter(f => f.mimeType === "application/vnd.google-apps.folder");
  const rootFiles = allItems.filter(f => f.mimeType !== "application/vnd.google-apps.folder");

  // Find subfolder whose leading number matches indicatorId exactly
  const matchFolder = folders.find(f => folderMatchesIndicator(f.name, indicatorId));

  let indicatorFiles = [];
  let docContent = null;

  if (matchFolder) {
    // ✅ Matched: list files inside the indicator subfolder
    indicatorFiles = await driveFiles(matchFolder.id);
  } else {
    // Fallback: match root-level files whose name starts with indicatorId
    indicatorFiles = rootFiles.filter(f => matchIndicatorNumber(f.name) === indicatorId);
    // NOTE: Do NOT fall back to ALL category files — that would show wrong evidence
  }

  // Try to get Google Doc content for the first doc found
  const firstDoc = indicatorFiles.find(f => f.mimeType === "application/vnd.google-apps.document");
  if (firstDoc) {
    try {
      docContent = await driveDocContent(firstDoc.id);
    } catch(e) {
      console.warn(`[Drive] Could not fetch doc content for indicator ${indicatorId}:`, e.message);
    }
  }

  return { files: indicatorFiles, subfolders: folders, docContent, matchedFolder: matchFolder };
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
