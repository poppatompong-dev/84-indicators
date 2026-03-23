# DRIVE_STRUCTURE — โครงสร้างโฟลเดอร์ Google Drive
## คู่มือสำหรับ AI Agent พัฒนาระบบ 84 Indicators

> **สำรวจเมื่อ:** วันจันทร์ที่ 23 มีนาคม 2568 เวลา 15:32 น. (UTC+7)
> **Root URL:** https://drive.google.com/drive/folders/16SyUIAG8sHsgQDmlGjO5cB4-8nRGP1L9
> **หมายเหตุ:** ทีมงานยังเพิ่มข้อมูลอยู่ต่อเนื่อง โครงสร้างนี้อาจเปลี่ยนแปลงได้ — ควรสำรวจซ้ำทุกครั้งก่อนพัฒนา

---

## ภาพรวมโครงสร้าง

```
Root (16SyUIAG8sHsgQDmlGjO5cB4-8nRGP1L9)
├── [ภาษาไทย] หมวด 1 การจัดการแหล่งท่องเที่ยว/
├── [ภาษาไทย] หมวด 3 สิ่งแวดล้อมและสภาพภูมิอากาศ/
├── [ภาษาไทย] หมวด 4 วัฒนธรรมและประเพณี/
├── [ภาษาไทย] หมวด 6 การประกอบธุรกิจและการบริการ/
├── [ภาษาอังกฤษ] English Version/
│   ├── 1.Visitor Management/
│   └── 3.Water management/
│
│  ⚠️ ยังไม่มีใน Drive (คาดว่าจะเพิ่มในอนาคต):
├── [ภาษาไทย] หมวด 2 ธรรมชาติและทัศนียภาพ/     ← ข้อ 21-28
├── [ภาษาไทย] หมวด 5 สังคมและเศรษฐกิจ/          ← ข้อ 55-72
└── [ภาษาอังกฤษ] English Version หมวด 2, 4, 5, 6
```

---

## ความลึกของโครงสร้างโฟลเดอร์

```
ระดับ 0: Root
ระดับ 1: Category folder       (หมวด N / N.CategoryName)
ระดับ 2: Indicator folder      (Nชื่อตัวชี้วัด / N_English)
ระดับ 3: Subfolder             (ชื่ออิสระ — ตั้งโดยทีมงาน)
ระดับ 4: Sub-subfolder         (ชื่ออิสระ — อาจมีได้)
ระดับ 5: ไฟล์                   (ภาพ, PDF, เอกสาร)
```

**⚠️ Critical for Developer:**
ตรวจสอบพบโครงสร้างลึกถึง **4 ระดับจาก indicator folder**:
```
1ผู้ประสานงาน/
└── รูปภาพการฝึกอบรม/              ← subfolder ระดับ 1
    ├── ภาพการฝึกอบรม GSTC ปี 66/  ← subfolder ระดับ 2
    └── ภาพการฝึกอบรม GSTC ปี 68/  ← subfolder ระดับ 2
        └── [ไฟล์จะถูกเพิ่มในอนาคต]
```

ระบบต้อง **recursive scan ลึก ≥ 3 ชั้น** (ไม่ใช่แค่ 2) จาก indicator folder

---

## ⚠️ ความไม่สม่ำเสมอของชื่อโฟลเดอร์ที่ต้องรับมือ

Agent ต้องรู้ว่า **naming ของโฟลเดอร์ indicator ไม่ได้ใช้รูปแบบเดียวกันทั้งหมด**:

| หมวด | รูปแบบชื่อ indicator folder | ตัวอย่าง | Regex ที่ใช้ |
|------|--------------------------|---------|-------------|
| 1, 3, 4 | `{N}{ThaiTitle}` (ตัวเลขนำหน้า ไม่มี separator) | `1ผู้ประสานงาน`, `29มลภาวะทางเสียง` | `/^(\d+)/` |
| **6** | `{N}.{ThaiTitle}` (**มีจุดหลังตัวเลข**) | `73.การส่งเสริม...`, `84ข้อมูล...` | `/^(\d+)[.\s]?/` |

**หมวด 6 ใช้ period ต่อท้ายเลข** → regex ต้องรองรับทั้งสองแบบ
Regex ที่ถูกต้อง: `/^(\d+)[.\s]*/` หรือ `/^(\d+)/` (จับเลขอย่างเดียวก็พอ)

---

## เวอร์ชันภาษาไทย — โครงสร้างสมบูรณ์

### 📁 หมวด 1 — การจัดการแหล่งท่องเที่ยว
**Folder ID:** `1malneVFQVF9HN2xJ98JD6tnZWmHbTOQJ`
**ตัวชี้วัด:** ข้อ 1–20 (20 ตัวชี้วัด) | **สถานะ:** ✅ มีครบ

| ข้อ | ชื่อโฟลเดอร์ | Folder ID | มี Subfolder |
|-----|-------------|-----------|-------------|
| 1  | `1ผู้ประสานงาน` | `1T8wPeKmEpy6Yb0yQPCzopSuluNqXml3P` | ✅ `รูปภาพการฝึกอบรม/` → `ภาพการฝึกอบรม GSTC ปี 66/`, `ภาพ GSTC ปี 68/` |
| 2  | `2โครงสร้าง` | `1YwQeS_2tg8_cpShue49PkBfrcjHOqWmi` | — |
| 3  | `3ทีมงานที่ผ่านการอบรม` | `1Tt_IzyjvODLkVSXO4bPh_VKqVCEwrbpN` | — |
| 4  | `4การมีส่วนร่วมของผู้มีส่วนได้ส่วนเสียที่เกี่ยวข้อง` | `1cxy6OFuCcCkQXkI0dO8RuuFa2K_3PB2I` | — |
| 5  | `5คลังข้อมูลสินทรัพย์` | `1Uiz8su7e1EZrtoUbU_WCY_f1VLASizy2` | — |
| 6  | `6ประเมินผลกระทบ` | `1lEpEf-haHktrQKNErKUagxaiMpDAmVnB` | — |
| 7  | `7นโยบายหรือยุทธศาสตร์` | `1uR4apMxow_AsQhABkoFEMRfP2R2OPc9r` | — |
| 8  | `8แผนปฏิบัติการด้านการท่องเที่ยว` | `1w4lpkBrMx_Vv8qu5juafRhNDQAL5AKqR` | — |
| 9  | `9ความโปร่งใสและการบังคับใช้กฎระเบียบ` | `1-QHPfCT-_AEdMo5DweVZRDck0gKKaVfy` | — |
| 10 | `10การติดตามเฝ้าสังเกต` | `1aNNqM4pd2h-a5Q-a_uqig2o0lYUwJ5lQ` | — |
| 11 | `11ความพึงพอใจ` | `14uFqGCtyG4lPNKILQM7XIgLJDQF58JRE` | — |
| 12 | `12การบริหารจำนวนนักท่องเที่ยว` | `1ztDba22HIH_EkdZ9gQ0gMZmYil1_o_JB` | — |
| 13 | `13การเคลื่อนตัวของนักท่องเที่ยว` | `15OTMsAZOaN9cfJ0sbxSBLGS4Jw7el-1p` | — |
| 14 | `14พฤติกรรมในพื้นที่เปราะบาง` | `184TSMDDDJe-ArJaPipFoWJ0VXuThztjQ` | — |
| 15 | `15ตัวชี้วัดและการติดตามด้านความยั่งยืน` | `1uxfJIQHK_oERyLsD2xrJCOMzMm61zyun` | — |
| 16 | `16การทบทวนและประเมินผล` | `1uFw0WK724hxVif5hst2jxXT4U2TKm_hX` | — |
| 17 | `17การรายงานความยั่งยืนสู่สาธารณะ` | `1pz24KpA12DFOUib7KSSQwlAgLG8pYpKr` | — |
| 18 | `18ข้อร้องเรียนจากการเข้าการรับรองมาตรฐาน` | `1gn-4PQE7VLIvkx74WAOzRp8KSByCujzw` | — |
| 19 | `19หลักจริยธรรมและการป้องกันการทุจริต` | `1RpxGsPB3wrbNdlx_5YThYn4h3Kk6WPU3` | — |
| 20 | `20การจัดซื้อและการแข่งขันอย่างเป็นธรรม` | `1N39AJ_CS8tPwPpfyoIEB_ECnfpNDjok7` | — |

---

### 📁 หมวด 2 — ธรรมชาติและทัศนียภาพ
**ตัวชี้วัด:** ข้อ 21–28 (8 ตัวชี้วัด) | **สถานะ:** ❌ ยังไม่มีโฟลเดอร์ใน Drive

> ระบบต้องแสดง graceful empty state สำหรับข้อ 21-28

---

### 📁 หมวด 3 — สิ่งแวดล้อมและสภาพภูมิอากาศ
**Folder ID:** `1tmMplQc4_kdeOiVXHTTOmPkIb8qgetLw`
**ตัวชี้วัด:** ข้อ 29–48 (20 ตัวชี้วัด) | **สถานะ:** ✅ มีครบ

| ข้อ | ชื่อโฟลเดอร์ | Folder ID |
|-----|-------------|-----------|
| 29 | `29มลภาวะทางเสียง` | `1ikUcn1XZKHEyib0cizjP458QUHJuPyZU` |
| 30 | `30มลภาวะทางแสง` | `1vmaoa9QdsIs72qJ1ANzSGnZRT_faGi32` |
| 31 | `31การวางแผนและการใช้ที่ดิน` | `16fzs0dx2OeRpOFAfU_iBK2L1s9U5AWCE` |
| 32 | `32แหล่งน้ำ` | `10C5KNlWAPACjRlgKLUPwkoD25rMOzllJ` |
| 33 | `33การลดใช้น้ำ` | `1T10UfW7TK8HuepOl4uQuajv364lpKQUa` |
| 34 | `34การติดตามตรวจสอบต่อคุณภาพน้ำ` | `1OaaWATu7X-PAbTgQCbdij8AWLT1PMSPw` |
| 35 | `35การบำบัดน้ำเสีย` | `1Gbv587wcOubHY3beLmHUXKIZzK16jLYD` |
| 36 | `36การลดปริมาณขยะ` | `1jh3Y9Wa_TaE_82ja9djiFdO6Ow6ZwYmJ` |
| 37 | `37การแยกและรีไซเคิลขยะ` | `1bUqBUDiI_2kukD8Rsj6-kBZh8ZerV9ha` |
| 38 | `38การกำจัดขยะ` | `1y9TW_r14tzr2JLSHzfJMPAyFjZ4_HhCx` |
| 39 | `39การทิ้งขยะในที่สาธารณะ` | `1614i8VIyWRtEmiEMrvx24zOL4kP_t1EA` |
| 40 | `40พลังงาน พาหนะ และสภาพภูมิอากาศ` | `1lFV0dTIuo59YnTnDwB3SDYL6SeEDhXC3` |
| 41 | `41ลดการปล่อยมลพิษจากการเดินทาง` | `1JS9cPgMKZg7LhVyYc6vMlaDl6FyCj2xW` |
| 42 | `42การเดินทางที่มีผลกระทบต่ำ` | `1iXxmmnNr6mIA6odycr08R9F5uIWod6aQ` |
| 43 | `43ขนส่งสาธารณะ` | `1BTlsOnscyQC-EUdcWsA32huxXonMboCF` |
| 44 | `44ลดการใช้พลังงาน` | `1ImRQ-lyVjHyg-5OXJeB5yyPdvAm-KPDi` |
| 45 | `45พลังงานหมุนเวียน` | `1eV-QZlxugWQeJB6shimIsFhKhrCo5j76` |
| 46 | `46การชดเชยการปลดปล่อยคาร์บอน` | `1QL2YX16Nabc0yZ5VOc9F6vSRXzdYikwA` |
| 47 | `47ความเสี่ยงจากสภาพภูมิอากาศ` | `1MUqj4DiR8_V65kewEQSG5IpqBdGDLNnO` |
| 48 | `48การเปลี่ยนแปลงสภาพภูมิอากาศ` | `1J8nb3J-dlrwOX24XQKoA1ZmnNufqi_-z` |

---

### 📁 หมวด 4 — วัฒนธรรมและประเพณี
**Folder ID:** `1VyXhDtmj4TrrYdZWWq2k8x0FLYQcWy28`
**ตัวชี้วัด:** ข้อ 49–54 (6 ตัวชี้วัด) | **สถานะ:** ✅ มีครบ

| ข้อ | ชื่อโฟลเดอร์ | Folder ID | มี Subfolder |
|-----|-------------|-----------|-------------|
| 49 | `49มรดกวัฒนธรรมที่จับต้องได้` | `1GSVL7t91NjuRv7D3yuddoYVm-6iQsWwQ` | ว่าง |
| 50 | `50ผลกระทบทางวัฒนธรรม` | `1Dd-N_mZStWeb5LawBrAUToMZ07-ZpI3W` | — |
| 51 | `51การปกป้องสิ่งประดิษฐ์ทางวัฒนธรรม` | `1eipL9UZqn7GyCDtzV0J-9grY8igd5ZX9` | ✅ `รูปภาพโครงการอบรมอาสาสมัครนำเที่ยว/` (ว่าง) |
| 52 | `52มรดกวัฒนธรรมที่จับต้องไม่ได้` | `1EHVO8nHVFMN-ICfxjp-cjh-T_QZ5Hzic` | — |
| 53 | `53เคารพในความจริงแท้` | `1ZEKEyeR-WyAIzGyz7udXX2-sHjbVLrOL` | — |
| 54 | `54ทรัพย์สินทางปัญญาของชาวพื้นเมือง` | `1U3qMh3pM1FGHaqTUexlwpnuU7dMZf9oQ` | — |

---

### 📁 หมวด 5 — สังคมและเศรษฐกิจ
**ตัวชี้วัด:** ข้อ 55–72 (18 ตัวชี้วัด) | **สถานะ:** ❌ ยังไม่มีโฟลเดอร์ใน Drive

> ระบบต้องแสดง graceful empty state สำหรับข้อ 55-72

---

### 📁 หมวด 6 — การประกอบธุรกิจและการบริการ
**Folder ID:** `1IJ4zYe2eDMfqEpHFT7UQBcooxYBkXMT4`
**ตัวชี้วัด:** ข้อ 73–84 (12 ตัวชี้วัด) | **สถานะ:** ✅ มีครบ

⚠️ **naming พิเศษ:** ตัวเลขบางข้อมีจุดหลังเลข เช่น `73.การส่งเสริม...` — Regex `/^(\d+)/` ยังดึงตัวเลขได้ถูกต้อง

| ข้อ | ชื่อโฟลเดอร์ | Folder ID |
|-----|-------------|-----------|
| 73 | `73.การส่งเสริมความยั่งยืนในหมู่ผู้ประกอบการ` | `1qcyyOB6GjpH-x74Tc8sjNF19Z9n6WfXz` |
| 74 | `74.มาตรฐานความยั่งยืน` | `1w7I4R4slU45EE0MJkqzACHYPWy3fTlP2` |
| 75 | `75การประชาสัมพันธ์ให้สถานประกอบการที่ได้รับการรับรองมาตรฐาน` | `17dOOJn32MAp-4nCE74fRkPWttoIiyn5L` |
| 76 | `76การใช้น้ำ(ผู้ประกอบการ)` | `1Jh0JlyjlxYRfjWUSNedGg0mILjBA6vEQ` |
| 77 | `77การจัดการขยะ(ผู้ประกอบการ)` | `1ED-EPfnAX7Gl5CW_u0SdyWuJUri_D7pw` |
| 78 | `78การใช้พลังงาน(ผู้ประกอบการ)` | `1AM7a1qRxS4c2kQaL55Yxgc-7hLU30Tzu` |
| 79 | `79การปลดปล่อยก๊าซเรือนกระจก(ผู้ประกอบการ)` | `1svn9LLb27HqsqJ-lN0VSygo8F1hnKGFo` |
| 80 | `80การจ้างงานที่เท่าเทียมและเป็นธรรม(ผู้ประกอบการ)` | `1ciPz38p517gmmM7YE0ft0Ycpc4G8_0pF` |
| 81 | `81หลักปฏิบัติของผู้บริการกิจกรรมการท่องเที่ยว` | `1Gm5_iCOQRMCOYPBL0cgU2FSFnFe0wgZP` |
| 82 | `82การส่งเสริมการขายที่ถูกต้องและให้ความเคารพ` | `1hIOdi3y2RNI7BFpfPN4K6VpsnyN-ZX-q` |
| 83 | `83การให้ข้อมูลด้านความยั่งยืนแก่นักท่องเที่ยว` | `1YgI-rUUhzyoPCziKdlSQ-nrcUlsAYHkU` |
| 84 | `84ข้อมูลการสื่อความหมาย` | `1L94NnSpLckT_9PfrmuT1sPx_WtNWETZo` |

---

## เวอร์ชันภาษาอังกฤษ — โครงสร้างสมบูรณ์

**EN Root Folder ID:** `1hNi__LPENVWEbMMlTU2lOsrZsDLGGY4Y`
ตั้งอยู่ **ภายใน Root เดียวกัน** กับโฟลเดอร์ภาษาไทย

### สถานะโดยรวม

| หมวด (EN) | ชื่อโฟลเดอร์ | ตัวชี้วัด | สถานะ |
|-----------|-------------|----------|-------|
| 1 | `1.Visitor Management` | 1–9 | ✅ มีโครงสร้าง |
| 2 | (ยังไม่มี) | 10–20 (หรือตามระบบ EN) | ❌ ยังไม่สร้าง |
| 3 | `3.Water management` | 29–48 (ขาด 47) | ⚠️ เกือบครบ |
| 4–6 | (ยังไม่มี) | ที่เหลือ | ❌ ยังไม่สร้าง |

---

### 📁 EN: 1.Visitor Management
**Folder ID:** `1vF4kPToGgh1pBgQWYolOgbVvFWV357fg`

| ข้อ (EN) | ชื่อโฟลเดอร์ | Folder ID |
|---------|-------------|-----------|
| 1 | `1_English` | `1WA7CAABRYC74ck6FopgarzrlDMr4zi-r` |
| 2 | `2_English` | `1GSRq-zWHFJ0_rPfCGVgh52t7WOeh0-ks` |
| 3 | `3_English` | `1GZ7DqwGIrGfDtXzLQgDo9zU5_AVCa9nA` |
| 4 | `4_English` | `1BR67k-pUgbS5NREQdZK15yay3SABQXko` |
| 5 | `5_English` | `1dTt3iWqKW7SyFd1oJ5y51sNrnwyT1-UT` |
| 6 | `6_English` | `14lth7VKwiu0dDJxewvJP5WMD-roaac4G` |
| 7 | `7_English` | `1RVEBKzX7KSdtiyFkmXt0inoYzcKJ1jzC` |
| 8 | `8_English` | `1xgOezKrefEgtql8AU34nkFk__0rfFo5T` |
| 9 | `9_English` | `16W0952z_uD8IJQnfZlDWTdtAo31Cw7zS` |

⚠️ **ข้อ 10–20 ยังไม่มีโฟลเดอร์ใน EN**

---

### 📁 EN: 3.Water management
**Folder ID:** `1KjIyMAepZ3aDH5sd6hzdMdMg-miTbakb`

| ข้อ (EN) | ชื่อโฟลเดอร์ | Folder ID |
|---------|-------------|-----------|
| 29 | `29_English` | `1tmC_DUk-sQGP12pOpaQIU5Ctr7rl99RK` |
| 30 | `30_English` | `1nWR2iIsiBSpvj8Y9eoV9DoxL9f9h9UwJ` |
| 31 | `31_English` | `1MhthimWC4HBFS8OI0cPV5tffPZHqhDxR` |
| 32 | `32_English` | `13tbMgNKKQt9hthExqtmB3DF62geJCRKm` |
| 33 | `33_English` | `1WMMQIELGYVMKlRtVmG75pgFUT_rUGBy3` |
| 34 | `34_English` | `1lwvNvlRhBespyGNQVlRHuAO4ozGx4aS_` |
| 35 | `35_English` | `1j56snYOjN8Qas0fR0yZXwDOcs4voxPIS` |
| 36 | `36_English` | `15D0SRAZwHGbExjnBlxtTNXJ-SvtVUc-d` |
| 37 | `37_English` | `1hhzR4DDrCDlrirA9qS6ItisZEHQIVhl-` |
| 38 | `38_English` | `1QWlwNWfZoBPwaVYti9nkKCoAedO0dopy` |
| 39 | `39_English` | `1be5KI5AwGkKAU3ev0omAbcPw1yCF3koF` |
| 40 | `40_English` | `1Xt5_ITl-tfLBMbEKDzLi2W6Bzc84KBG6` |
| 41 | `41_English` | `1n3ondJKnYs7eUiPhvvrEzrwiqQ0mqo7_` |
| 42 | `42_English` | `1rPAZMYxEqJNqhUkBHWOXq__OPEZ8fX2P` |
| 43 | `43_English` | `1R3NS_rjq2jlfEOozAt8gluJ3RQTfxktR` |
| 44 | `44_English` | `102ILy5rNX99FPOjr5_XrCKZ4C-_s0hF4` |
| 45 | `45_English` | `1Bp2PNC13XdKwsidTtogZpQSHiPrw7GoH` |
| 46 | `46_English` | `1D_-Cz_RCQZRhcy41697PHiVyZJVNCuLP` |
| ~~47~~ | ⚠️ **ขาด** `47_English` | — |
| 48 | `48_English` | `1Hqc_UhPmpgvqdJ-AvxwIRZLasNarscv0` |

---

## การแมปตัวชี้วัด TH ↔ EN

| TH | TH Folder | EN Category | EN Folder | หมายเหตุ |
|----|-----------|-------------|-----------|---------|
| ข้อ 1–9 | หมวด 1 | 1.Visitor Management | 1_English–9_English | ✅ มีทั้งคู่ |
| ข้อ 10–20 | หมวด 1 | (ยังไม่มี EN) | — | ⚠️ |
| ข้อ 21–28 | (ยังไม่มี TH) | — | — | ❌ ทั้งคู่ขาด |
| ข้อ 29–46 | หมวด 3 | 3.Water management | 29_English–46_English | ✅ มีทั้งคู่ |
| ข้อ 47 | หมวด 3 | 3.Water management | ⚠️ ขาด 47_English | ⚠️ |
| ข้อ 48 | หมวด 3 | 3.Water management | 48_English | ✅ |
| ข้อ 49–54 | หมวด 4 | (ยังไม่มี EN) | — | ⚠️ |
| ข้อ 55–72 | (ยังไม่มี TH) | — | — | ❌ ทั้งคู่ขาด |
| ข้อ 73–84 | หมวด 6 | (ยังไม่มี EN) | — | ⚠️ |

---

## กฎ Matching สำหรับ Agent — สรุปสมบูรณ์

### กฎ 1: Category Folder Matching

```javascript
function extractCatIdFromFolderName(name, lang) {
  if (lang === "th") {
    // "หมวด 1 ..." → 1 | "หมวด 3 ..." → 3
    const m = name.match(/หมวด\s*(\d+)/i);
    return m ? parseInt(m[1]) : null;
  } else {
    // "1.Visitor Management" → 1 | "3.Water management" → 3
    const m = name.match(/^(\d+)[.\s]/);
    return m ? parseInt(m[1]) : null;
  }
}
```

### กฎ 2: Indicator Folder Matching

```javascript
function extractIndicatorIdFromFolderName(name) {
  // รองรับ: "1ผู้ประสาน" | "73.การส่งเสริม" | "1_English" | "29_English"
  const m = name.match(/^(\d+)/);
  return m ? parseInt(m[1]) : null;
}
```

### กฎ 3: Recursive File Collection (depth = 3 ขั้น)

```javascript
async function collectFiles(folderId, depth = 3, path = "") {
  const items = await listFolder(folderId);
  let files = [];
  for (const item of items) {
    if (item.mimeType === "application/vnd.google-apps.folder") {
      if (depth > 0) {
        const sub = await collectFiles(item.id, depth - 1, path + item.name + "/");
        files = files.concat(sub);
      }
    } else {
      files.push({ ...item, _path: path }); // เก็บ path เพื่อแสดง breadcrumb ใน UI
    }
  }
  return files;
}
```

**เปลี่ยน depth จาก 2 → 3** เพราะตรวจพบ 3 ระดับใน indicator 1 จริง

### กฎ 4: TH Root vs EN Root Selection

```javascript
function getCategoryRootId(lang) {
  if (lang === "th") return "16SyUIAG8sHsgQDmlGjO5cB4-8nRGP1L9";
  // lang === "en" → ใช้ EN subfolder เป็น root
  return "1hNi__LPENVWEbMMlTU2lOsrZsDLGGY4Y";
}
```

สำหรับ TH → list root แล้ว **ข้าม** folder ที่ชื่อ `"English Version"`
สำหรับ EN → list EN root โดยตรง

---

## สิ่งที่ยังขาดและต้องติดตาม

| รายการ | TH | EN | ความสำคัญ |
|-------|----|----|----------|
| หมวด 2 (ข้อ 21-28) | ❌ | ❌ | สูง — ขาดทั้งสองภาษา |
| หมวด 5 (ข้อ 55-72) | ❌ | ❌ | สูง — ขาดทั้งสองภาษา |
| EN หมวด 1 ข้อ 10-20 | ✅ | ❌ | กลาง |
| EN หมวด 4 (ข้อ 49-54) | ✅ | ❌ | กลาง |
| EN หมวด 6 (ข้อ 73-84) | ✅ | ❌ | กลาง |
| EN ข้อ 47 (_English) | ✅ | ❌ | ต่ำ |
| ไฟล์จริงในโฟลเดอร์ | ว่างส่วนใหญ่ | ว่างทั้งหมด | — |

**Graceful Empty State Rules:**
- หมวดที่ยังไม่มีใน Drive → แสดง `"ยังไม่มีโฟลเดอร์หลักฐาน"` ไม่ใช่ error
- โฟลเดอร์ว่าง → แสดง `"ยังไม่มีไฟล์หลักฐาน กำลังเตรียมข้อมูล"`
- ข้อ 47 EN ขาด → แสดง empty state เหมือนกัน

---

*อัปเดตล่าสุด: มีนาคม 2026 — ตรวจสอบจาก Google Drive API โดยตรง*
