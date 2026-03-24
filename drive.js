// === GOOGLE DRIVE API MODULE ===
const DRIVE_CONFIG = {
  API_KEY: "AIzaSyCA2-JWG89Q8DzwnHKBUhb_P3arsd8GizI",
  // ROOT_FOLDER_ID = ROOT_2: หมวด 1 (1-20 TH), หมวด 3 (29-48 TH), หมวด 4 (49-54 TH), หมวด 6 (73-84 TH)
  ROOT_FOLDER_ID: "16SyUIAG8sHsgQDmlGjO5cB4-8nRGP1L9",
  // ROOT_FOLDER_ID_1 = ROOT_1: หมวด 2 (21-28 TH), หมวด 5 (55-72 TH)
  ROOT_FOLDER_ID_1: "1DV9mWwelboVzVJI6L5iTke1l0Pnq6INg",
  // EN_ROOT_FOLDER_ID_2 (ROOT_2 English Version): EN indicators 1-9, 29-48
  EN_ROOT_FOLDER_ID: "1hNi__LPENVWEbMMlTU2lOsrZsDLGGY4Y",
  EN_ROOT_FOLDER_ID_2: "1hNi__LPENVWEbMMlTU2lOsrZsDLGGY4Y",
  // EN_ROOT_FOLDER_ID_1 (ROOT_1 English Version): EN indicators 10-28, 49-84
  EN_ROOT_FOLDER_ID_1: "1NTDzSOmI16OEt0hePUc-sgWT2LSKJ93H",
  API_BASE: "https://www.googleapis.com/drive/v3",
  CACHE_TTL: 5 * 60 * 1000,              // default fallback (5 min)
  CACHE_TTL_MAP: 60 * 60 * 1000,         // folder map: 60 min
  CACHE_TTL_FILES: 5 * 60 * 1000,        // file list: 5 min
  CACHE_TTL_SUBFOLDERS: 10 * 60 * 1000,  // subfolders: 10 min
  SUBFOLDER_DEPTH: 3,                    // max recursion depth from indicator folder (DRIVE_STRUCTURE requires depth≥3)
  QUOTA_GUARD_THRESHOLD: 0.90,           // stop at 90% quota
  REQUEST_TIMEOUT: 15000,                // 15s timeout
  MAX_RETRIES: 3,
  RETRY_BASE_MS: 1000,
  DAILY_QUOTA: 10000
};

// === STATIC DETERMINISTIC INDICATOR MAP ===
// Source of truth: DRIVE_STRUCTURE.md — all folder IDs hardcoded, no name-guessing.
// TH: one folderId per indicator (from their respective category folder in ROOT_1 or ROOT_2)
// EN: one enFolderId per indicator (from N_English subfolder inside EN root category folder)
// Indicator 47 EN is intentionally null — folder not yet created in Drive (see DRIVE_STRUCTURE.md note)
const STATIC_INDICATOR_MAP = {
  th: {
    // ROOT_2: หมวด 1 การจัดการแหล่งท่องเที่ยว (cat=1, indicators 1-20)
    1: "1T8wPeKmEpy6Yb0yQPCzopSuluNqXml3P",
    2: "1YwQeS_2tg8_cpShue49PkBfrcjHOqWmi",
    3: "1Tt_IzyjvODLkVSXO4bPh_VKqVCEwrbpN",
    4: "1cxy6OFuCcCkQXkI0dO8RuuFa2K_3PB2I",
    5: "1Uiz8su7e1EZrtoUbU_WCY_f1VLASizy2",
    6: "1lEpEf-haHktrQKNErKUagxaiMpDAmVnB",
    7: "1uR4apMxow_AsQhABkoFEMRfP2R2OPc9r",
    8: "1w4lpkBrMx_Vv8qu5juafRhNDQAL5AKqR",
    9: "1-QHPfCT-_AEdMo5DweVZRDck0gKKaVfy",
    10: "1aNNqM4pd2h-a5Q-a_uqig2o0lYUwJ5lQ",
    11: "14uFqGCtyG4lPNKILQM7XIgLJDQF58JRE",
    12: "1ztDba22HIH_EkdZ9gQ0gMZmYil1_o_JB",
    13: "15OTMsAZOaN9cfJ0sbxSBLGS4Jw7el-1p",
    14: "184TSMDDDJe-ArJaPipFoWJ0VXuThztjQ",
    15: "1uxfJIQHK_oERyLsD2xrJCOMzMm61zyun",
    16: "1uFw0WK724hxVif5hst2jxXT4U2TKm_hX",
    17: "1pz24KpA12DFOUib7KSSQwlAgLG8pYpKr",
    18: "1gn-4PQE7VLIvkx74WAOzRp8KSByCujzw",
    19: "1RpxGsPB3wrbNdlx_5YThYn4h3Kk6WPU3",
    20: "1N39AJ_CS8tPwPpfyoIEB_ECnfpNDjok7",
    // ROOT_1: หมวด 2 ธรรมชาติและทัศนียภาพ (cat=2, indicators 21-28)
    21: "1NQIs2wAu4DAmTP4a4s8coONB9fprJBdR",
    22: "1vXsboZkgZlAi9te6OoCAJkVXcrNIY7ip",
    23: "1TnVN5-uOEw7VeUCBl2d15nQJHWWSvg8p",
    24: "1zBWk5aAqWJ2WM20yI63LVpbjyYH5gF8n",
    25: "1TUfexcayVF8tKV6xFAQnYj467h_nKHvN",
    26: "13uZ2JxzHDRS7QjkBn6mCFSKl8kEytiyS",
    27: "1QxtpJ8pn6dZRsrd7itFQoAMSwjhQpIUa",
    28: "19zslqHsbJE_-0zxgXlwZulrBy9dAX81r",
    // ROOT_2: หมวด 3 สิ่งแวดล้อมและสภาพภูมิอากาศ (cat=3, indicators 29-48)
    29: "1ikUcn1XZKHEyib0cizjP458QUHJuPyZU",
    30: "1vmaoa9QdsIs72qJ1ANzSGnZRT_faGi32",
    31: "16fzs0dx2OeRpOFAfU_iBK2L1s9U5AWCE",
    32: "10C5KNlWAPACjRlgKLUPwkoD25rMOzllJ",
    33: "1T10UfW7TK8HuepOl4uQuajv364lpKQUa",
    34: "1OaaWATu7X-PAbTgQCbdij8AWLT1PMSPw",
    35: "1Gbv587wcOubHY3beLmHUXKIZzK16jLYD",
    36: "1jh3Y9Wa_TaE_82ja9djiFdO6Ow6ZwYmJ",
    37: "1bUqBUDiI_2kukD8Rsj6-kBZh8ZerV9ha",
    38: "1y9TW_r14tzr2JLSHzfJMPAyFjZ4_HhCx",
    39: "1614i8VIyWRtEmiEMrvx24zOL4kP_t1EA",
    40: "1lFV0dTIuo59YnTnDwB3SDYL6SeEDhXC3",
    41: "1JS9cPgMKZg7LhVyYc6vMlaDl6FyCj2xW",
    42: "1iXxmmnNr6mIA6odycr08R9F5uIWod6aQ",
    43: "1BTlsOnscyQC-EUdcWsA32huxXonMboCF",
    44: "1ImRQ-lyVjHyg-5OXJeB5yyPdvAm-KPDi",
    45: "1eV-QZlxugWQeJB6shimIsFhKhrCo5j76",
    46: "1QL2YX16Nabc0yZ5VOc9F6vSRXzdYikwA",
    47: "1MUqj4DiR8_V65kewEQSG5IpqBdGDLNnO",
    48: "1J8nb3J-dlrwOX24XQKoA1ZmnNufqi_-z",
    // ROOT_2: หมวด 4 วัฒนธรรมและประเพณี (cat=4, indicators 49-54)
    49: "1GSVL7t91NjuRv7D3yuddoYVm-6iQsWwQ",
    50: "1Dd-N_mZStWeb5LawBrAUToMZ07-ZpI3W",
    51: "1eipL9UZqn7GyCDtzV0J-9grY8igd5ZX9",
    52: "1EHVO8nHVFMN-ICfxjp-cjh-T_QZ5Hzic",
    53: "1ZEKEyeR-WyAIzGyz7udXX2-sHjbVLrOL",
    54: "1U3qMh3pM1FGHaqTUexlwpnuU7dMZf9oQ",
    // ROOT_1: หมวด 5 ความเป็นอยู่ที่ดีของคนในสังคม (cat=5, indicators 55-72)
    55: "15bNNs3rPQXX_jvug5RdlF9Ej-zFy3g4g",
    56: "1-RcC6q5gkA69HHIOuEpZnzCJlIhyUw5k",
    57: "1s3pCfbcfmP-i8HVLLPz61Jf3CMJ6by1O",
    58: "1arVbUV8rZp-_Uzr-qdIvtUAkvyn8bnxj",
    59: "1o4OFUeXWpabsrbQVtbdiZYbEBFhhXfyX",
    60: "1UHNsZzahePmWjQL4hg7pA0uYnD8lxmOW",
    61: "1eM3bHfj1WIGp1paEYyY_5hEgjVQYlzSX",
    62: "1CahUU-STaVuED2915B68KLXZSb6COOps",
    63: "1EMLn-HDGnsytf9BIQT1o8tGeshqxtRdj",
    64: "1yDyQDHl1kPUCUttJoaPk7Khy-brEL9Sd",
    65: "1nfuOpQkpWiASgcz771dKDvD6IX87LT3N",
    66: "1th0J0owMU1juZZzOiWZuNkq_8B4os_0b",
    67: "1Ss-wIydXSU34_hnaZEpc0tSMZTP6GqGl",
    68: "1K5arTRwtfQigkO3bjXdVDgVNw9eCZ9Gn",
    69: "1ijBk_DTupJF4Cu14XvXsWxbrNni883U_",
    70: "1bY8scN4FKqCP53RFottI7h6BvPaqX4Td",
    71: "1Vcsc2lp42qgi1OwX2pdTBFJmpcntREVo",
    72: "1PEZxoVVr2Kd7MIWLQ7GZ97c-JVlsph0D",
    // ROOT_2: หมวด 6 การประกอบธุรกิจและการบริการ (cat=6, indicators 73-84)
    73: "1qcyyOB6GjpH-x74Tc8sjNF19Z9n6WfXz",
    74: "1w7I4R4slU45EE0MJkqzACHYPWy3fTlP2",
    75: "17dOOJn32MAp-4nCE74fRkPWttoIiyn5L",
    76: "1Jh0JlyjlxYRfjWUSNedGg0mILjBA6vEQ",
    77: "1ED-EPfnAX7Gl5CW_u0SdyWuJUri_D7pw",
    78: "1AM7a1qRxS4c2kQaL55Yxgc-7hLU30Tzu",
    79: "1svn9LLb27HqsqJ-lN0VSygo8F1hnKGFo",
    80: "1ciPz38p517gmmM7YE0ft0Ycpc4G8_0pF",
    81: "1Gm5_iCOQRMCOYPBL0cgU2FSFnFe0wgZP",
    82: "1hIOdi3y2RNI7BFpfPN4K6VpsnyN-ZX-q",
    83: "1YgI-rUUhzyoPCziKdlSQ-nrcUlsAYHkU",
    84: "1L94NnSpLckT_9PfrmuT1sPx_WtNWETZo"
  },
  en: {
    // ROOT_2 EN (1hNi__LP…): indicators 1-9 (1.Visitor Management)
    1: "1WA7CAABRYC74ck6FopgarzrlDMr4zi-r",
    2: "1GSRq-zWHFJ0_rPfCGVgh52t7WOeh0-ks",
    3: "1GZ7DqwGIrGfDtXzLQgDo9zU5_AVCa9nA",
    4: "1BR67k-pUgbS5NREQdZK15yay3SABQXko",
    5: "1dTt3iWqKW7SyFd1oJ5y51sNrnwyT1-UT",
    6: "14lth7VKwiu0dDJxewvJP5WMD-roaac4G",
    7: "1RVEBKzX7KSdtiyFkmXt0inoYzcKJ1jzC",
    8: "1xgOezKrefEgtql8AU34nkFk__0rfFo5T",
    9: "16W0952z_uD8IJQnfZlDWTdtAo31Cw7zS",
    // ROOT_1 EN (1NTDzSO…): indicators 10-20 (1.Visitor Management)
    10: "1Jbaf4t4UI-3OJOrUWNrmR3Ldlb7wBWU6",
    11: "1Zl0g5aGghTDaCQ9x3QpCfudDZFCiLrNH",
    12: "10_IBrt6K_HKwEKnkCcipG5LIMkJgsdsB",
    13: "1So_buldLpSs221vzsLcaao5fPJ2hTA7v",
    14: "1l_kixv3tEVV5ph1sIff61yIuyt52CrIu",
    15: "1qVYz5J4m5ltYuMk-B_WGRQothMcP23H7",
    16: "1qYf-40dkkHxMW1xEnCvp3oheIeD25xbc",
    17: "1ECS2ZtvtCeV9OvEcyjm6NeSX8YbglI-H",
    18: "19uWX2IriJpjkUpM-RQ_05rHnyt4u8ZJT",
    19: "15TJW2vGHPM6FCpSJOJl_uBcjFRG8FNQj",
    20: "1N9QIShcVOV-7ShgXF-DNAJM_hEyCMPcM",
    // ROOT_1 EN (1NTDzSO…): indicators 21-28 (2.Nature&conservation)
    21: "1nW7x-ltQ8T_CZ9i9_o9TifMf92c_AMoj",
    22: "158ZtEzs0YFLFKzmsC379P-Z8K6KdhUBM",
    23: "1F8gCnRjfcCeXMVNY-ReEDEBOo6br56jn",
    24: "1-LgzvN2Khvot2iWcVZczE8SpWBHSN6Ep",
    25: "1JdVkbxvYLLiChpAH5GbMjGU9z__PtRbG",
    26: "1rAbTiIMqAoIxvAocdzU00g09TmF15j9O",
    27: "15rAz4-6isAbdS_prShmvFAFnmjnppS9j",
    28: "1Ttedx0XBsSdXynogMPGXqKdZirDlyWZB",
    // ROOT_2 EN (1hNi__LP…): indicators 29-48 (3.Water management)
    29: "1tmC_DUk-sQGP12pOpaQIU5Ctr7rl99RK",
    30: "1nWR2iIsiBSpvj8Y9eoV9DoxL9f9h9UwJ",
    31: "1MhthimWC4HBFS8OI0cPV5tffPZHqhDxR",
    32: "13tbMgNKKQt9hthExqtmB3DF62geJCRKm",
    33: "1WMMQIELGYVMKlRtVmG75pgFUT_rUGBy3",
    34: "1lwvNvlRhBespyGNQVlRHuAO4ozGx4aS_",
    35: "1j56snYOjN8Qas0fR0yZXwDOcs4voxPIS",
    36: "15D0SRAZwHGbExjnBlxtTNXJ-SvtVUc-d",
    37: "1hhzR4DDrCDlrirA9qS6ItisZEHQIVhl-",
    38: "1QWlwNWfZoBPwaVYti9nkKCoAedO0dopy",
    39: "1be5KI5AwGkKAU3ev0omAbcPw1yCF3koF",
    40: "1Xt5_ITl-tfLBMbEKDzLi2W6Bzc84KBG6",
    41: "1n3ondJKnYs7eUiPhvvrEzrwiqQ0mqo7_",
    42: "1rPAZMYxEqJNqhUkBHWOXq__OPEZ8fX2P",
    43: "1R3NS_rjq2jlfEOozAt8gluJ3RQTfxktR",
    44: "102ILy5rNX99FPOjr5_XrCKZ4C-_s0hF4",
    45: "1Bp2PNC13XdKwsidTtogZpQSHiPrw7GoH",
    46: "1D_-Cz_RCQZRhcy41697PHiVyZJVNCuLP",
    47: null, // 47_English not yet created in Drive (expected missing — WARNING only)
    48: "1Hqc_UhPmpgvqdJ-AvxwIRZLasNarscv0",
    // ROOT_1 EN (1NTDzSO…): indicators 49-54 (4.People&Tradition)
    49: "1esUgW8QXgPdFI1WGniuEp7hXXxWYKv1C",
    50: "1lB9veY4eT7dO18dZ-UBi2K88IKurPLEE",
    51: "1Q-xS3xvwPVK6K9enqzPk4udDhkdDuG-l",
    52: "1KG4HtgBzLtxqLHtbp5C-ZNi_XYgaCGlb",
    53: "1VhIM6VRRbLuuANL_Kero_Y-iP82sVcNi",
    54: "1a2hb66bt79iwt5k30ob_sRl9ntJElMJN",
    // ROOT_1 EN (1NTDzSO…): indicators 55-72 (5.Socio-Economic Impact)
    55: "1GiA31jsBVJ2MLnOgdspHNru_LK0gtqx9",
    56: "1jg4CqMWsyyHW2WUMhModAFomn8l2t5Ab",
    57: "1mcCAqHdcprRfW2ZPZ2laeeS18_QirpuW",
    58: "17vjZcTf1AIin_X-8pFomOevmjf1mGDgy",
    59: "184aTA9XFw7R3AwSF_vwPY3A0bVDSqZHi",
    60: "1O24NwvcuoY7Xmrw_IQmX9qvsnYgoS8t9",
    61: "12i8u9ePGGO-FEdTPO02g9HpKfwIRlgQF",
    62: "14DumhZp1JxFds_oThzeW1EMhfvPF5h5R",
    63: "1JnVEugrFEaWOPMjmTXI-GUCpzmOHuvgU",
    64: "1d9WpKH1i-R__-U9M6lEGejWfubhpq7ou",
    65: "1Ip4DfttjO9aHtQUPyajprGPkHpNTRgJ_",
    66: "1Qu69Ft9YDXtt2QP36SboDAyptWRafQVV",
    67: "1jALsLi2YRimf3M9EKrjAywB0fM_8tYeV",
    68: "1bBVg3qtUG9Gsv6BViRqQ88lwi3TfHrAv",
    69: "19i8_rMrU4Hg--kgdnwLtR0hGozl2do4U",
    70: "1po5NLtc1vWzxdfYBgnoH4E-EoOSwj7pV",
    71: "1cW1BJRjJYEBB-8ZCeGg9hksD58-vziw5",
    72: "1U8F5DT1S2Pd6g7Jg7kFgU7pt6Ny28g5I",
    // ROOT_1 EN (1NTDzSO…): indicators 73-84 (6.Information & marketing)
    73: "1LeGhc9gdcGtvyadc9rIEeQeRjvYNXwOt",
    74: "1TtezbyXhH8zfIMerB_v8CBJSlQhC9MJm",
    75: "17Yp2urUizEzMKsPJxL2MkAIxdeW0Pw5t",
    76: "1VwWFgfbZoo0nIHLFnqQYnicrZuEfp7t8",
    77: "1RmTPCRXQMDX-zyeMoVJtBvWzJgAYaL3e",
    78: "1W0ud1JqMeVaFiYwHCyaqLin9O-RNTucu",
    79: "1ps3Hc1d4WeD1nOTKcmQ9FGlougz55J4r",
    80: "1nRKWoFMS6OBSLYhraUoxrZm7aXIpAzsW",
    81: "1owyUSgV_tBJJnx7tQDvsjo5CGJYmWEHq",
    82: "1sH7WG2GZCNkQFJ6qEyyXZqIV0laIKvgk",
    83: "1kEU47ce00ST5uK2Opz2rhfiEPSa-t3B6",
    84: "1PxX-m4dLf8ZDoqUYHZMj6TLI4xNOYtPU"
  }
};

// TH root per indicator: ROOT_1 holds cat 2 (21-28) and cat 5 (55-72); ROOT_2 holds the rest
function getThRootForIndicator(indicatorId) {
  if ((indicatorId >= 21 && indicatorId <= 28) || (indicatorId >= 55 && indicatorId <= 72)) {
    return DRIVE_CONFIG.ROOT_FOLDER_ID_1;
  }
  return DRIVE_CONFIG.ROOT_FOLDER_ID;
}

// EN root per indicator: ROOT_2 EN holds 1-9 and 29-48; ROOT_1 EN holds 10-28 and 49-84
function getEnRootForIndicator(indicatorId) {
  if ((indicatorId >= 1 && indicatorId <= 9) || (indicatorId >= 29 && indicatorId <= 48)) {
    return DRIVE_CONFIG.EN_ROOT_FOLDER_ID_2;
  }
  return DRIVE_CONFIG.EN_ROOT_FOLDER_ID_1;
}

// === getFolderSource — deterministic, no name-guessing ===
// Returns { rootFolderId, folderId } from static table.
// Falls back to localStorage mapping if static entry is missing.
function getFolderSource(indicatorId, lang) {
  const id = parseInt(indicatorId);
  if (lang === 'en') {
    const folderId = STATIC_INDICATOR_MAP.en[id] || null;
    return { rootFolderId: getEnRootForIndicator(id), folderId };
  }
  const folderId = STATIC_INDICATOR_MAP.th[id] || null;
  return { rootFolderId: getThRootForIndicator(id), folderId };
}

// === initStaticMapping — seed localStorage mapping from STATIC_INDICATOR_MAP ===
// Merges into existing mapping without overwriting admin-locked TH entries.
// Always sets enFolderId from static table (never name-guessed).
function initStaticMapping() {
  const existing = loadMapping();
  let changed = 0;
  for (let i = 1; i <= 84; i++) {
    const thId = STATIC_INDICATOR_MAP.th[i] || null;
    const enId = STATIC_INDICATOR_MAP.en[i] || null; // null for indicator 47
    if (!existing[i]) existing[i] = {};
    // TH folder: only overwrite if not locked by admin
    if (thId && !existing[i].locked && existing[i].folderId !== thId) {
      existing[i].folderId = thId;
      existing[i].source = "static";
      changed++;
    }
    // EN folder: always set from static table (authoritative)
    if (enId && existing[i].enFolderId !== enId) {
      existing[i].enFolderId = enId;
      existing[i].hasEnglishVersion = true;
      changed++;
    }
    // Indicator 47 EN is intentionally missing — mark but don't set enFolderId
    if (i === 47 && !enId) {
      existing[i]._en47missing = true;
      // hasEnglishVersion stays false for 47 EN (no folder exists)
    }
    // Ensure cat is set correctly
    const catForIndicator = i <= 20 ? 1 : i <= 28 ? 2 : i <= 48 ? 3 : i <= 54 ? 4 : i <= 72 ? 5 : 6;
    if (!existing[i].cat) { existing[i].cat = catForIndicator; changed++; }
  }
  if (changed > 0) {
    saveMapping(existing);
    console.log(`[StaticMapping] Seeded ${changed} mapping entries from STATIC_INDICATOR_MAP`);
  } else {
    console.log("[StaticMapping] Mapping already up-to-date");
  }
  return existing;
}

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
  _mem: null, // in-memory cache — avoids localStorage round-trip on every call
  _dirty: false,
  _flushThreshold: 10, // flush to localStorage every N calls
  _load() {
    if (this._mem) return this._mem;
    try {
      const raw = localStorage.getItem(this._key());
      if (raw) { this._mem = JSON.parse(raw); return this._mem; }
    } catch (e) { }
    this._mem = { calls: 0, cacheHits: 0, errors: 0, firstCall: null, lastCall: null };
    return this._mem;
  },
  _save(force) {
    if (!this._mem) return;
    // Flush to localStorage every _flushThreshold calls or when forced
    if (force || this._mem.calls % this._flushThreshold === 0) {
      try { localStorage.setItem(this._key(), JSON.stringify(this._mem)); this._dirty = false; } catch (e) { }
    } else {
      this._dirty = true;
    }
  },
  _flush() {
    if (this._dirty && this._mem) {
      try { localStorage.setItem(this._key(), JSON.stringify(this._mem)); this._dirty = false; } catch (e) { }
    }
  },
  trackCall() {
    const d = this._load();
    d.calls++;
    if (!d.firstCall) d.firstCall = Date.now();
    d.lastCall = Date.now();
    this._save();
    this._notifyUI();
  },
  trackCacheHit() {
    const d = this._load();
    d.cacheHits++;
    this._dirty = true; // defer flush — cache hits are low-value writes
  },
  trackError() {
    const d = this._load();
    d.errors++;
    this._save(true); // always flush errors immediately
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
    this._mem = null;
    this._dirty = false;
    try { localStorage.removeItem(this._key()); } catch (e) { }
    this._notifyUI();
  },
  _notifyUI() {
    if (typeof updateQuotaBar === "function") updateQuotaBar();
  }
};

// Flush quota to localStorage on page unload so counts are never lost
window.addEventListener("beforeunload", () => driveQuota._flush());

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
  // TH: "หมวด 1 ..." or "หมวด1..."
  const mTh = name.match(/หมวด\s*(\d+)/i);
  if (mTh) return parseInt(mTh[1]);
  // EN: "1.Visitor Management" or "3.Water management" (DRIVE_STRUCTURE.md EN root pattern)
  const mEn = name.match(/^(\d+)\./);
  if (mEn) return parseInt(mEn[1]);
  // Generic fallback: "category N" or "cat N"
  const mCat = name.match(/cat(?:egory)?\s*(\d+)/i);
  if (mCat) return parseInt(mCat[1]);
  return null;
}
function folderMatchesIndicator(folderName, indicatorId) {
  return matchIndicatorNumber(folderName) === indicatorId;
}

// === EN INDICATOR FOLDER MAP ===
// Scans BOTH EN roots → EN category folders → N_English indicator folders.
// ROOT_2 EN (1hNi__LP…): indicators 1-9, 29-48
// ROOT_1 EN (1NTDzSO…): indicators 10-28, 49-84
// Returns { indicatorId -> { enFolderId, enFolderName, enCatId, enRoot } }
async function discoverEnIndicatorMap() {
  const enMap = {};
  const enRoots = [
    { id: DRIVE_CONFIG.EN_ROOT_FOLDER_ID_2, label: "ROOT_2-EN" },
    { id: DRIVE_CONFIG.EN_ROOT_FOLDER_ID_1, label: "ROOT_1-EN" }
  ];

  for (const enRoot of enRoots) {
    try {
      const enCatFolders = await driveFolders(enRoot.id);
      for (const catFolder of enCatFolders) {
        const catId = matchCategoryNumber(catFolder.name) ||
          (function () { const m = catFolder.name.match(/^(\d+)[.\s]/); return m ? parseInt(m[1]) : null; })();
        if (!catId) continue;
        try {
          const items = await driveListAll(catFolder.id);
          const folders = items.filter(f => f.mimeType === "application/vnd.google-apps.folder");
          for (const folder of folders) {
            // EN indicator folders: "1_English", "29_English"
            const m = folder.name.match(/^(\d+)[_\s]/);
            const num = m ? parseInt(m[1]) : matchIndicatorNumber(folder.name);
            if (num && num >= 1 && num <= 84) {
              if (!enMap[num]) {
                enMap[num] = { enFolderId: folder.id, enFolderName: folder.name, enCatId: catId, enRoot: enRoot.label };
                console.log(`[EN Discovery][${enRoot.label}] Indicator ${num} → ${folder.name} (${folder.id})`);
              } else {
                console.warn(`[EN Discovery] Duplicate EN folder for indicator ${num}: ignoring ${folder.name} from ${enRoot.label} (already mapped from ${enMap[num].enRoot})`);
              }
            }
          }
        } catch (e) {
          console.warn(`[EN Discovery][${enRoot.label}] Failed to list EN cat folder ${catFolder.name}:`, e.message);
        }
      }
    } catch (e) {
      console.warn(`[EN Discovery] Failed to list EN root ${enRoot.label}:`, e.message);
    }
  }

  console.log(`[EN Discovery] Found ${Object.keys(enMap).length} EN indicator folders across both EN roots`);
  return enMap;
}

// === AUTO-DISCOVER ENGINE ===
// Scans BOTH TH roots → category folders → indicator folders.
// ROOT_2: หมวด 1 (1-20), หมวด 3 (29-48), หมวด 4 (49-54), หมวด 6 (73-84)
// ROOT_1: หมวด 2 (21-28), หมวด 5 (55-72)
// Also scans BOTH EN roots for EN indicator folders (N_English pattern).
// Returns { mapping, changes[], newFolders[], missingFolders[], catFolderMap } for admin review.
async function autoDiscoverMapping() {
  const existingMapping = loadMapping();
  const newMapping = {};
  const changes = [];
  const newFolders = [];
  const missingFolders = [];
  const catFolderMap = {}; // catId -> folderId (intermediate)

  // 1. Discover category folders under BOTH TH roots (skip "English Version" folder)
  const thRoots = [
    { id: DRIVE_CONFIG.ROOT_FOLDER_ID, label: "ROOT_2" },
    { id: DRIVE_CONFIG.ROOT_FOLDER_ID_1, label: "ROOT_1" }
  ];
  for (const thRoot of thRoots) {
    try {
      const rootFolders = await driveFolders(thRoot.id);
      for (const f of rootFolders) {
        if (f.name.trim() === ENGLISH_VERSION_FOLDER) continue;
        const catId = matchCategoryNumber(f.name);
        if (catId && catId >= 1 && catId <= 6) {
          if (!catFolderMap[catId]) {
            catFolderMap[catId] = f.id;
            driveFolderMap[catId] = f.id; // Legacy compat
            console.log(`[AutoDiscover][${thRoot.label}] Cat ${catId} → ${f.name} (${f.id})`);
          } else {
            console.warn(`[AutoDiscover] Duplicate category ${catId} found in ${thRoot.label}: ignoring ${f.name}`);
          }
        }
      }
    } catch (e) {
      console.warn(`[AutoDiscover] Failed to list TH root ${thRoot.label}:`, e.message);
    }
  }
  driveFolderMapReady = true;

  // 2. Discover TH indicator folders within each category
  for (const catId of Object.keys(catFolderMap)) {
    const catFolderId = catFolderMap[catId];
    try {
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
    } catch (e) {
      console.warn(`[AutoDiscover] Failed to list cat ${catId} folder:`, e.message);
    }
  }

  // 3. Seed from static table for any indicators not found by auto-discover
  for (let i = 1; i <= 84; i++) {
    if (!newMapping[i] || !newMapping[i].folderId) {
      const staticThId = STATIC_INDICATOR_MAP.th[i];
      if (staticThId) {
        const catForIndicator = i <= 20 ? 1 : i <= 28 ? 2 : i <= 48 ? 3 : i <= 54 ? 4 : i <= 72 ? 5 : 6;
        newMapping[i] = { folderId: staticThId, folderName: `Indicator ${i} (static)`, cat: catForIndicator, source: "static" };
        console.log(`[AutoDiscover] Indicator ${i}: using static TH folderId (not found by discovery)`);
      }
    }
    // Always attach EN from static table (authoritative for EN)
    const staticEnId = STATIC_INDICATOR_MAP.en[i];
    if (staticEnId) {
      if (!newMapping[i]) newMapping[i] = { folderId: null, folderName: null, cat: i <= 20 ? 1 : i <= 28 ? 2 : i <= 48 ? 3 : i <= 54 ? 4 : i <= 72 ? 5 : 6 };
      newMapping[i].enFolderId = staticEnId;
      newMapping[i].hasEnglishVersion = true;
    }
  }

  // 4. Supplement EN from live discovery (fills any gaps not in static table)
  try {
    const enMap = await discoverEnIndicatorMap();
    for (const [numStr, enEntry] of Object.entries(enMap)) {
      const num = parseInt(numStr);
      if (!newMapping[num]) newMapping[num] = { folderId: null, folderName: null, cat: enEntry.enCatId };
      if (!newMapping[num].enFolderId) {
        newMapping[num].enFolderId = enEntry.enFolderId;
        newMapping[num].enFolderName = enEntry.enFolderName;
        newMapping[num].hasEnglishVersion = true;
      }
    }
  } catch (e) {
    console.warn("[AutoDiscover] EN discovery failed:", e.message);
  }

  // 5. Compare with existing mapping to detect changes
  for (let i = 1; i <= 84; i++) {
    const old = existingMapping[i];
    const neu = newMapping[i];
    if (!neu || !neu.folderId) {
      missingFolders.push({ indicatorId: i, reason: "Folder not found in Drive or static table" });
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
      // Carry over lock status if TH folder unchanged
      if (old.locked && old.folderId === neu.folderId) {
        newMapping[i].locked = old.locked;
        newMapping[i].source = old.source || "auto";
        newMapping[i].hasEnglishVersion = neu.hasEnglishVersion || old.hasEnglishVersion;
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
// Scans BOTH TH roots to populate driveFolderMap[catId] for all 6 categories.
async function buildDriveFolderMap(lang) {
  if (driveFolderMapReady && Object.keys(driveFolderMap).filter(k => !k.startsWith('_')).length >= 6) return driveFolderMap;
  try {
    const [r2folders, r1folders] = await Promise.all([
      driveFolders(DRIVE_CONFIG.ROOT_FOLDER_ID),
      driveFolders(DRIVE_CONFIG.ROOT_FOLDER_ID_1)
    ]);
    for (const f of [...r2folders, ...r1folders]) {
      if (f.name.trim() === ENGLISH_VERSION_FOLDER) continue;
      const catId = matchCategoryNumber(f.name);
      if (catId && catId >= 1 && catId <= 6 && !driveFolderMap[catId]) {
        driveFolderMap[catId] = f.id;
      }
    }
    driveFolderMap._folderMapReady_th = true;
    driveFolderMapReady = true;
    console.log(`Drive folder map built (both roots):`, driveFolderMap);
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

// === INDICATOR RESULT CACHE ===
// Caches driveFilesForIndicator results per indicator+lang to avoid re-traversal on re-open.
// Invalidated by refreshSingleIndicator() or force resync.
const _indicatorResultCache = {}; // { `${id}_th` | `${id}_en`: { result, ts } }
const _INDICATOR_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function _clearIndicatorCache(indicatorId) {
  delete _indicatorResultCache[`${indicatorId}_th`];
  delete _indicatorResultCache[`${indicatorId}_en`];
}
function _clearAllIndicatorCache() {
  Object.keys(_indicatorResultCache).forEach(k => delete _indicatorResultCache[k]);
}

// === GET FILES FOR A SPECIFIC INDICATOR (deterministic mapping + recursive + language-aware) ===
// Returns { files[], tree, subfolders[], docContent, matchedFolder, traversal, validation, hasEnglishVersion }
// EN model: uses enFolderId from mapping (separate EN root folder N_English), NOT a subfolder of TH folder.
async function driveFilesForIndicator(indicatorId, catId, useEnglish = false) {
  const cacheKey = `${indicatorId}_${useEnglish ? 'en' : 'th'}`;
  const cached = _indicatorResultCache[cacheKey];
  if (cached && Date.now() - cached.ts < _INDICATOR_CACHE_TTL) {
    console.log(`[Drive] Indicator ${indicatorId} ${useEnglish ? 'EN' : 'TH'}: serving from result cache`);
    return cached.result;
  }

  const mapping = getMappingForIndicator(indicatorId);

  async function _fetch() {
    if (useEnglish) {
      // --- ENGLISH MODE: use enFolderId from mapping (EN root → N_English folder) ---
      const enFolderId = mapping?.enFolderId || null;

      if (enFolderId) {
        try {
          const result = await driveTraverseRecursive(enFolderId, { lang: null }); // full traversal inside EN indicator folder
          console.log(`[Drive] Indicator ${indicatorId} EN: folder=${mapping.enFolderName}, files=${result.files.length}, depth=${result.depth}`);
          let docContent = null;
          const firstDoc = result.files.find(f => f.mimeType === "application/vnd.google-apps.document");
          if (firstDoc) {
            try { docContent = await driveDocContent(firstDoc.id); } catch (e) { console.warn(`[Drive] EN doc fetch failed for ${indicatorId}:`, e.message); }
          }
          return {
            files: result.files,
            tree: result.tree,
            subfolders: result.subfolders,
            docContent,
            matchedFolder: { name: mapping.enFolderName || `${indicatorId}_English`, id: enFolderId },
            traversal: { depth: result.depth, errors: result.errors, visitedCount: result.visitedCount },
            validation: result.errors.length > 0
              ? { status: "warning", issues: result.errors.map(e => `Traversal error: ${e.message}`) }
              : null,
            hasEnglishVersion: true
          };
        } catch (e) {
          return {
            files: [], tree: null, subfolders: [], docContent: null, matchedFolder: null,
            traversal: { depth: 0, errors: [{ folderId: enFolderId, depth: 0, message: e.message }], visitedCount: 0 },
            validation: { status: "error", issues: [`EN traversal failed: ${e.message}`] },
            hasEnglishVersion: false
          };
        }
      }

      // enFolderId not in mapping — check legacy English Version subfolder inside TH folder
      const thFolderId = mapping?.folderId || null;
      if (thFolderId) {
        try {
          const thFolderItems = await driveFolders(thFolderId);
          const enSubfolder = thFolderItems.find(f => f.name.trim() === ENGLISH_VERSION_FOLDER);
          if (enSubfolder) {
            console.log(`[Drive] Indicator ${indicatorId} EN: legacy subfolder found (${enSubfolder.id})`);
            const result = await driveTraverseRecursive(enSubfolder.id, { lang: null });
            return {
              files: result.files,
              tree: result.tree,
              subfolders: result.subfolders,
              docContent: null,
              matchedFolder: { name: ENGLISH_VERSION_FOLDER, id: enSubfolder.id },
              traversal: { depth: result.depth, errors: result.errors, visitedCount: result.visitedCount },
              validation: null,
              hasEnglishVersion: true
            };
          }
        } catch (e) {
          console.warn(`[Drive] EN legacy subfolder check failed for ${indicatorId}:`, e.message);
        }
      }

      // No EN data found for this indicator
      console.log(`[Drive] Indicator ${indicatorId}: no EN folder found (enFolderId=${enFolderId}, hasEnglishVersion=${mapping?.hasEnglishVersion})`);
      return {
        files: [], tree: null, subfolders: [], docContent: null,
        matchedFolder: mapping?.folderName ? { name: mapping.folderName, id: mapping.folderId } : null,
        traversal: { depth: 0, errors: [], visitedCount: 0 },
        validation: { status: "error", issues: ["Incomplete English data — no English folder found for this indicator"] },
        hasEnglishVersion: false
      };
    }

    // --- THAI MODE: use folderId from mapping, traverse excluding English Version ---
    const folderId = mapping?.folderId || null;
    if (folderId) {
      try {
        const result = await driveTraverseRecursive(folderId, { lang: "th" });
        console.log(`[Drive] Indicator ${indicatorId} TH: folder=${mapping.folderName}, files=${result.files.length}, depth=${result.depth}`);
        let docContent = null;
        const firstDoc = result.files.find(f => f.mimeType === "application/vnd.google-apps.document");
        if (firstDoc) {
          try { docContent = await driveDocContent(firstDoc.id); } catch (e) { console.warn(`[Drive] TH doc fetch failed for ${indicatorId}:`, e.message); }
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
          hasEnglishVersion: result.hasEnglishVersion || !!mapping.enFolderId
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

    // No mapping at all
    return {
      files: [], tree: null, subfolders: [], docContent: null, matchedFolder: null,
      traversal: null,
      validation: { status: "error", issues: ["No folder mapping for this indicator — run Auto-Discover in Admin panel"] },
      hasEnglishVersion: false
    };
  }

  const result = await _fetch();
  _indicatorResultCache[cacheKey] = { result, ts: Date.now() };
  return result;
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
        issues.push("No English folder found (no enFolderId in mapping and no \"English Version\" subfolder)");
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
// Dual-root model: each indicator has one TH folderId and optionally one enFolderId.
// TH: traverses m.folderId with lang="th" (excludes any English Version subfolder).
// EN: traverses m.enFolderId directly (separate EN root folder per DRIVE_STRUCTURE.md).
// Falls back to legacy "English Version" subfolder inside TH folder if enFolderId not set.
// Stores subfolder tree metadata, hasEnglishVersion flag, and per-subfolder file counts.
let syncInProgress = false;
let lastFullSyncAt = null;

async function fullSync(options = {}) {
  if (syncInProgress) { console.warn("[Sync] Already in progress, skipping"); return null; }
  syncInProgress = true;
  const force = options.force || false;
  const syncState = force ? {} : loadSyncState();

  // STEP 1: Always seed from static table first (deterministic, no name-guessing)
  let mapping = initStaticMapping();
  console.log(`[Sync] Static mapping seeded: ${Object.keys(mapping).length} indicators`);

  // STEP 2: Supplement with live auto-discover (both TH roots + both EN roots)
  // Always run on force, or if any indicator is missing TH or EN folderId
  const needsAutoDiscover = force ||
    Object.values(mapping).some(m => m && !m.folderId) ||
    Object.values(mapping).some(m => m && m.folderId && !m.enFolderId && !m._en47missing);
  if (needsAutoDiscover) {
    console.log("[Sync] Running auto-discover to supplement static mapping...");
    try {
      const discovery = await autoDiscoverMapping();
      // Merge discovered mapping into static-seeded mapping (never overwrite static EN IDs)
      let merged = 0;
      for (const [numStr, entry] of Object.entries(discovery.mapping)) {
        const num = parseInt(numStr);
        if (!mapping[num]) mapping[num] = {};
        // TH folder: use discovered if not locked and we got a real name (not "static")
        if (entry.folderId && !mapping[num].locked && entry.source !== "static") {
          if (mapping[num].folderId !== entry.folderId) {
            mapping[num].folderId = entry.folderId;
            mapping[num].folderName = entry.folderName;
            mapping[num].cat = entry.cat;
            merged++;
          }
        }
        // EN folder: only fill in if static table had no entry (static is authoritative)
        if (entry.enFolderId && !mapping[num].enFolderId) {
          mapping[num].enFolderId = entry.enFolderId;
          mapping[num].enFolderName = entry.enFolderName;
          mapping[num].hasEnglishVersion = true;
          merged++;
        }
      }
      if (merged > 0) {
        saveMapping(mapping);
        console.log(`[Sync] Auto-discover merged ${merged} additional entries`);
      }
    } catch (e) {
      console.warn("[Sync] Auto-discover failed, using static mapping:", e.message);
    }
  } else {
    console.log("[Sync] Static mapping complete — skipping auto-discover");
  }

  const results = {};
  const errors = [];
  const SYNC_CONCURRENCY = 8; // indicators fetched in parallel per chunk

  // Helper: sync a single indicator (TH + EN in parallel)
  async function syncSingleIndicator(indicatorId, m) {
    const entry = {
      lastSyncedAt: Date.now(),
      thFileCount: 0, enFileCount: 0,
      thFiles: [], enFiles: [],
      validationStatus: "ok", validationIssues: [],
      hasEnglishVersion: false,
      subfolderNames: [],
      thSubfolders: 0, enSubfolders: 0,
      thDepth: 0, enDepth: 0,
      subfolderFileCount: {}
    };

    const enFolderId = m.enFolderId || null;

    // TH and EN traverse in parallel per indicator
    const [thResult, enResult] = await Promise.all([
      driveTraverseRecursive(m.folderId, { lang: "th" }).catch(e => {
        entry.validationStatus = "error";
        entry.validationIssues.push(`TH traversal failed: ${e.message}`);
        errors.push({ indicatorId, lang: "th", message: e.message });
        return null;
      }),
      enFolderId
        ? driveTraverseRecursive(enFolderId, { lang: null }).catch(e => {
          if (entry.validationStatus === "ok") entry.validationStatus = "warning";
          entry.validationIssues.push(`EN traversal failed: ${e.message}`);
          errors.push({ indicatorId, lang: "en", message: e.message });
          return null;
        })
        : Promise.resolve(null)
    ]);

    // Process TH result
    if (thResult) {
      entry.thFileCount = thResult.files.length;
      entry.thFiles = thResult.files.map(f => ({ id: f.id, name: f.name, mimeType: f.mimeType, link: f.webViewLink, _folderName: f._folderName }));
      entry.thDepth = thResult.depth;
      entry.thSubfolders = thResult.subfolders.length;
      entry.hasEnglishVersion = thResult.hasEnglishVersion;
      if (thResult.tree) {
        for (const child of thResult.tree.children) {
          entry.subfolderNames.push(child.name);
          entry.subfolderFileCount[child.name] = countTreeFiles(child);
        }
        if (thResult.tree.files.length > 0) {
          entry.subfolderFileCount["(root)"] = thResult.tree.files.length;
        }
      }
      if (thResult.errors.length > 0) {
        entry.validationIssues.push(`TH traversal: ${thResult.errors.length} error(s)`);
        if (entry.validationStatus === "ok") entry.validationStatus = "warning";
      }
    }

    // Process EN result
    if (enFolderId) {
      entry.hasEnglishVersion = true;
      if (enResult) {
        entry.enFileCount = enResult.files.length;
        entry.enFiles = enResult.files.map(f => ({ id: f.id, name: f.name, mimeType: f.mimeType, link: f.webViewLink, _folderName: f._folderName }));
        entry.enDepth = enResult.depth;
        entry.enSubfolders = enResult.subfolders.length;
        if (enResult.errors.length > 0) {
          entry.validationIssues.push(`EN traversal: ${enResult.errors.length} error(s)`);
          if (entry.validationStatus === "ok") entry.validationStatus = "warning";
        }
        console.log(`[Sync] Indicator ${indicatorId} EN: folder=${m.enFolderName}, files=${entry.enFileCount}, depth=${entry.enDepth}`);
      }
    } else {
      if (indicatorId === 47) {
        entry.validationIssues.push("47_English folder not yet created in Drive (expected missing)");
        if (entry.validationStatus === "ok") entry.validationStatus = "warning";
      } else if (entry.hasEnglishVersion && thResult && thResult.englishVersionId) {
        // Legacy: EN as subfolder inside TH folder
        try {
          const legacyEn = await driveTraverseRecursive(thResult.englishVersionId, { lang: null });
          entry.enFileCount = legacyEn.files.length;
          entry.enFiles = legacyEn.files.map(f => ({ id: f.id, name: f.name, mimeType: f.mimeType, link: f.webViewLink, _folderName: f._folderName }));
          entry.enDepth = legacyEn.depth;
        } catch (e) {
          entry.validationIssues.push(`EN subfolder traversal failed: ${e.message}`);
        }
      } else {
        entry.validationIssues.push("No English folder found for this indicator");
        if (entry.validationStatus === "ok") entry.validationStatus = "warning";
      }
    }

    if (entry.thFileCount === 0) {
      if (entry.validationStatus === "ok") entry.validationStatus = "warning";
      entry.validationIssues.push("Folder exists but has no TH files");
    }

    return entry;
  }

  // Collect indicator IDs to sync; fill errors for unmapped indicators
  const indicatorIds = [];
  for (let i = 1; i <= 84; i++) {
    const m = mapping[i];
    if (!m || !m.folderId) {
      results[i] = {
        lastSyncedAt: null, thFileCount: 0, enFileCount: 0, thFiles: [], enFiles: [],
        validationStatus: "error", validationIssues: ["No mapping"],
        hasEnglishVersion: false, subfolderNames: [], thDepth: 0, enDepth: 0
      };
    } else {
      indicatorIds.push(i);
    }
  }

  // Process in chunks of SYNC_CONCURRENCY with quota guard between chunks
  const syncStartTime = Date.now();
  for (let offset = 0; offset < indicatorIds.length; offset += SYNC_CONCURRENCY) {
    const q = driveQuota.getStats();
    if (q.pct >= 90) {
      console.warn(`[Sync] Quota at ${q.pct}% — stopping sync to protect budget`);
      const remaining = indicatorIds.slice(offset);
      remaining.forEach(id => errors.push({ indicatorId: id, message: `Sync stopped: API quota at ${q.pct}%` }));
      break;
    }
    const chunk = indicatorIds.slice(offset, offset + SYNC_CONCURRENCY);
    const chunkResults = await Promise.all(chunk.map(i => syncSingleIndicator(i, mapping[i])));
    chunkResults.forEach((entry, idx) => {
      const id = chunk[idx];
      results[id] = entry;
      if (mapping[id]) mapping[id].hasEnglishVersion = entry.hasEnglishVersion;
    });
  }

  const totalThFiles = Object.values(results).reduce((s, e) => s + (e.thFileCount || 0), 0);
  const totalEnFiles = Object.values(results).reduce((s, e) => s + (e.enFileCount || 0), 0);
  console.log(`[Sync] Parallel sync finished in ${Date.now() - syncStartTime}ms`);

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
    const [r2folders, r1folders] = await Promise.all([
      driveFolders(DRIVE_CONFIG.ROOT_FOLDER_ID),
      driveFolders(DRIVE_CONFIG.ROOT_FOLDER_ID_1)
    ]);
    return {
      ok: true,
      folders: r2folders.length + r1folders.length,
      root2: { folders: r2folders.length, names: r2folders.map(f => f.name) },
      root1: { folders: r1folders.length, names: r1folders.map(f => f.name) }
    };
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
    // Seed static mapping immediately (synchronous, no API calls)
    initStaticMapping();

    const test = await testDriveConnection();
    if (test.ok) {
      console.log(`Drive connected: ROOT_2=${test.root2?.folders ?? 0} folders, ROOT_1=${test.root1?.folders ?? 0} folders`);
      await buildDriveFolderMap();
      driveReady = true;
      driveLastSuccess = Date.now();
      startDriveHealthCheck();

      // Run unified sync in background (static mapping already seeded; auto-discover supplements)
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
