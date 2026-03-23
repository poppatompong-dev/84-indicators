# SKILL: 84-Indicators Portfolio Development
## สำหรับ AI Agent ที่จะพัฒนาโปรเจกต์นี้

> **ใช้ไฟล์นี้เป็นจุดเริ่มต้นทุกครั้งก่อนพัฒนา**
> อ่านให้ครบก่อนแตะโค้ดใดๆ

---

## 1. PROJECT IDENTITY

```
ชื่อโปรเจกต์:  อุทัยธานี Green Destination — 84 Indicators Portfolio
URL:           https://84-indicators.vercel.app/code
Stack:         Vanilla JS SPA + Tailwind CSS CDN (ไม่มี build step)
ข้อมูลหลัก:    Google Drive (ทีมงานอัปเดตรายวัน)
ภาษา:          ไทย (default) + อังกฤษ (สลับได้)
วัตถุประสงค์:  ติดตาม 84 ตัวชี้วัด GSTC เพื่อรับรอง Green Destination 2026
```

---

## 2. BEFORE YOU START — MANDATORY READS

ก่อนทำงานทุกครั้ง **ต้องอ่านทั้งสองไฟล์นี้ก่อน** (อยู่ใน workspace เดียวกัน):

```
1. SYSTEM.md          → technical spec, file structure, routing, admin mode
2. DEV_BLUEPRINT.md   → ground truth ของ Drive structure, algorithms, rules
```

> หมายเหตุ: SYSTEM.md มีบางส่วนที่ยังไม่อัปเดตตามโครงสร้าง Drive จริง
> ให้ DEV_BLUEPRINT.md เป็น source of truth เสมอเมื่อมีความขัดแย้ง

---

## 3. FILE MAP

```
84-indicators/           (Vercel project root)
├── code.html            HTML shell + Tailwind config + CSS
├── app.js               Router + State + Render dispatcher
├── data.js              Static: CATS[6] + D[84 indicators]
├── drive.js             Google Drive API layer
├── i18n.js              TH/EN translations
├── modal.js             File preview lightbox
├── SYSTEM.md            Technical documentation
├── DEV_BLUEPRINT.md     Development rules (THIS IS THE LAW)
└── SKILL.md             This file (AI agent guide)
```

---

## 4. GOOGLE DRIVE — THE CORE CHALLENGE

### 4.1 Root Folder

```
Root ID: 16SyUIAG8sHsgQDmlGjO5cB4-8nRGP1L9
URL: https://drive.google.com/drive/folders/16SyUIAG8sHsgQDmlGjO5cB4-8nRGP1L9
```

### 4.2 Actual Folder Structure (verified March 2026)

```
Root/
├── หมวด 1 การจัดการแหล่งท่องเที่ยว/   → catId=1 (indicators 1-20)
│   ├── 1ผู้ประสานงาน/                  → indicatorId=1
│   │   └── รูปภาพการฝึกอบรม/           → subfolder (any name)
│   ├── 2โครงสร้าง/
│   └── ...
├── หมวด 3 สิ่งแวดล้อมและสภาพภูมิอากาศ/ → catId=3
├── หมวด 4 วัฒนธรรมและประเพณี/          → catId=4
├── หมวด 6 การประกอบธุรกิจและการบริการ/ → catId=6
└── English Version/                     → EN root
    ├── 1.Visitor Management/            → EN catId=1
    │   ├── 1_English/                   → EN indicatorId=1
    │   └── ...9_English
    └── 3.Water management/
```

⚠️ หมวด 2 และ 5 ยังไม่มีใน Drive — ต้องรับมือด้วย graceful empty state

### 4.3 Folder Name → ID Matching Rules

| ระดับ | ภาษา | ตัวอย่างชื่อ | Regex | ผลลัพธ์ |
|-------|------|------------|-------|---------|
| Category | TH | `หมวด 1 ...` | `/หมวด\s*(\d+)/i` | catId=1 |
| Category | EN | `1.Visitor Management` | `/^(\d+)\./` | catId=1 |
| Indicator | TH | `10การติดตาม...` | `/^(\d+)/` | id=10 |
| Indicator | EN | `9_English` | `/^(\d+)/` | id=9 |
| Subfolder | ANY | ชื่ออะไรก็ได้ | ไม่ match | เก็บไฟล์ทั้งหมด |

**Critical:** อย่าใช้ `/^(\d+)/` กับ category folder ของ TH เพราะจะ fail!

### 4.4 File Collection Rule

ต้อง recursive scan ลึก **2 ชั้น** จาก indicator folder:
```
indicator folder/
├── [files at root level]
└── subfolder/ (ชื่ออะไรก็ได้)
    └── [files ใน subfolder]
```

---

## 5. BILINGUAL ARCHITECTURE

| สิ่งที่ต่างกัน | TH | EN |
|--------------|----|----|
| Drive root | ROOT_FOLDER_ID | EN_ROOT_FOLDER_ID |
| Category folders | `หมวด N ...` | `N.{name}` |
| Indicator folders | `N{ThaiTitle}` | `N_English` |
| Cache keys | `84drive_th_*` | `84drive_en_*` |
| Folder map | `driveFolderMap_th` | `driveFolderMap_en` |
| Content | title, desc (Thai) | titleEn, descEn |

เมื่อ user สลับภาษา → reload Drive data จาก folder ใหม่ทั้งหมด

---

## 6. DATA FRESHNESS (สำคัญมาก)

ทีมงานอัปเดตไฟล์ใน Drive **ทุกวัน** ระบบต้องสดใหม่เสมอ:

```
Cache TTL ที่กำหนด:
  Folder Map:          60 นาที
  Indicator file list: 5 นาที  ← สั้นที่สุดเพราะเปลี่ยนบ่อย
  Subfolder list:      10 นาที

Smart invalidation: ตรวจ modifiedTime ของโฟลเดอร์เทียบกับ cachedAt
Auto-detect changes: ทุก fetch ผ่าน isCacheStale() ก่อนใช้ cache
Manual refresh: ผู้ใช้กด 🔄 ในหน้า detail ได้โดยไม่ต้อง admin

Dashboard: refresh อัตโนมัติทุก 5 นาที แต่ pause เมื่อ tab hidden
```

---

## 7. ERROR HANDLING CHECKLIST

ทุก Drive operation ต้องผ่าน checklist นี้:

- [ ] มี try/catch ครอบทุก async call
- [ ] ใช้ fetchWithRetry() (exponential backoff: 1s, 2s, 4s)
- [ ] ตรวจ quota ก่อน fetch ถ้า quota ≥90% → หยุด
- [ ] Folder ไม่พบ → แสดง empty state ไม่ใช่ error
- [ ] Network offline → แสดง offline message ไม่ crash
- [ ] Cache key รวม lang: `84drive_{lang}_{folderId}`

---

## 8. i18n RULES

```
✅ t("key.name")                    — ถูก
❌ getLang() === 'en' ? "..." : "..."   — ผิด
❌ "ข้อความ hardcode"                  — ผิด
❌ key ที่มีแค่ th หรือแค่ en          — ผิด

ทุก key ต้องมีทั้ง th และ en เสมอ
ถ้า key หาย → แสดง [missing:key.name]
```

---

## 9. COMMON TASKS — HOW TO DO THEM

### เพิ่ม indicator ใหม่

1. เพิ่มแถวใน `D[]` ใน `data.js`: `[id, catId, sub, title, desc, "agency", "w", titleEn, descEn]`
2. สร้างโฟลเดอร์ใน Drive ตาม pattern: `{N}{ThaiTitle}` (TH) หรือ `{N}_English` (EN)
3. ระบบ map โดยอัตโนมัติ — ไม่ต้องแก้ drive.js

### เปลี่ยน status

1. แก้ field สุดท้ายใน `D[]` row นั้น: `"w"` → `"p"` → `"c"`
2. หรือใช้ Admin Override ใน UI (เก็บใน localStorage)

### เพิ่ม translation key

1. เพิ่มใน `i18n.js`:
```js
"my.new.key": { th: "ข้อความ", en: "Text" },
```
2. ใช้: `t("my.new.key")`
3. HTML static: `<span data-i18n="my.new.key"></span>`

### แก้ Drive matching ที่ผิด

1. อ่าน Section 1 และ Section 3 ของ DEV_BLUEPRINT.md
2. แก้ regex ใน `extractCatIdFromFolderName()` หรือ `extractIndicatorIdFromFolderName()`
3. Run checklist ใน Section 11 ของ DEV_BLUEPRINT.md

---

## 10. DO NOT TOUCH WITHOUT READING BLUEPRINT

รายการสิ่งที่ **ห้ามแก้** โดยไม่อ่าน DEV_BLUEPRINT.md ก่อน:

```
❌ DRIVE_CONFIG ใน drive.js
❌ buildDriveFolderMap() ใน drive.js
❌ driveFilesForIndicator() ใน drive.js
❌ Language switch logic
❌ Cache key naming
❌ data.js — D[] array structure
```

---

## 11. DEPLOY CHECKLIST

ก่อน push ทุกครั้ง:

```
[ ] Drive integration ทำงานกับ TH folder
[ ] Drive integration ทำงานกับ EN folder
[ ] Language switch โหลด Drive data ใหม่
[ ] Subfolder files แสดงถูกต้อง
[ ] หมวดที่ไม่มีใน Drive แสดง empty state (ไม่ error)
[ ] Cache key ทุกตัวมี lang prefix
[ ] Console ไม่มี unhandled error
[ ] Quota usage ไม่เกิน 10 calls ต่อ page load
```

---

## 12. QUICK REFERENCE — KEY IDs

```javascript
// Drive Root IDs (อย่า hardcode ใน source — ใส่ใน DRIVE_CONFIG เท่านั้น)
ROOT_FOLDER_ID    = "16SyUIAG8sHsgQDmlGjO5cB4-8nRGP1L9"
EN_ROOT_FOLDER_ID = "1hNi__LPENVWEbMMlTU2lOsrZsDLGGY4Y"

// localStorage keys ที่ใช้ในระบบ
"84_lang"                    // "th" | "en"
"84admin"                    // sessionStorage: admin session
"84_status_overrides"        // { indicatorId: status }
"84_feedback"                // { indicatorId: { text, rating, ts } }
"84catalogView"              // "grid" | "list" | "table"
"84last_refresh"             // { ts, lang, triggeredBy }
"84drive_{lang}_{folderId}"  // Drive API cache
"84foldermap_{lang}"         // Folder map cache
```

---

*Skill version 1.1 — มีนาคม 2026*
*ต้อง sync กับ DEV_BLUEPRINT.md เสมอเมื่อมีการเปลี่ยนแปลง*
