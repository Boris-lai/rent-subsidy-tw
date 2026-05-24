// 中央租金補貼規則 — 2026 年（民國 115 年）版
// 法源：data/sources/115年度三百億元中央擴大租金補貼作業規定修正-行政院公報.pdf
//      data/sources/300億元中央擴大租金補貼專案計畫修正-計畫核定本.pdf

import type {
  CalculatorInput,
  City,
  MultiplierSource,
  SubsidyTier,
} from '@/lib/calculator/types';

// ============================================================
// 政策版本與生效日
// ============================================================

export const POLICY_VERSION = '2026-01-09';
export const POLICY_AMENDMENT_DATE = '2026-01-09'; // 行政院公報修正日
export const APPLICATION_OPEN_DATE = '2026-01-01';
export const APPLICATION_CLOSE_DATE = '2026-12-31';

// 子女出生日期分界（影響加碼倍數）
export const CHILDREN_MULTIPLIER_BOUNDARY = '2026-01-01';
// 結婚登記日期分界
export const MARRIAGE_MULTIPLIER_BOUNDARY = '2026-01-01';

// 申請人最低年齡
export const MIN_APPLICANT_AGE = 18;
// 單身青年年齡上限（< 40）
export const SINGLE_YOUTH_AGE_LIMIT = 40;
// 新婚 2 年內
export const NEWLYWED_YEARS_LIMIT = 2;

// ============================================================
// 縣市中文名稱
// ============================================================

export const CITY_NAMES: Record<City, string> = {
  taipei: '臺北市',
  new_taipei: '新北市',
  taoyuan: '桃園市',
  taichung: '臺中市',
  tainan: '臺南市',
  kaohsiung: '高雄市',
  keelung: '基隆市',
  hsinchu_city: '新竹市',
  hsinchu_county: '新竹縣',
  miaoli: '苗栗縣',
  changhua: '彰化縣',
  nantou: '南投縣',
  yunlin: '雲林縣',
  chiayi_city: '嘉義市',
  chiayi_county: '嘉義縣',
  pingtung: '屏東縣',
  yilan: '宜蘭縣',
  hualien: '花蓮縣',
  taitung: '臺東縣',
  penghu: '澎湖縣',
  kinmen: '金門縣',
  lienchiang: '連江縣',
};

// ============================================================
// 附表一：所得門檻 — 每人每月平均所得上限
// regular = 最低生活費 × 3；expanded = 最低生活費 × 3.5（新婚或育兒家庭）
// ============================================================

const INCOME_THRESHOLD_OTHER = { regular: 46545, expanded: 54303 } as const;
const INCOME_THRESHOLD_OFFSHORE = { regular: 43023, expanded: 50194 } as const;

export const INCOME_THRESHOLDS: Record<
  City,
  { regular: number; expanded: number }
> = {
  taipei: { regular: 61137, expanded: 71327 },
  new_taipei: { regular: 50700, expanded: 59150 },
  taoyuan: { regular: 50304, expanded: 58688 },
  taichung: { regular: 48231, expanded: 56270 },
  tainan: { regular: 46545, expanded: 54303 },
  kaohsiung: { regular: 48120, expanded: 56140 },
  kinmen: INCOME_THRESHOLD_OFFSHORE,
  lienchiang: INCOME_THRESHOLD_OFFSHORE,
  // 其餘 14 縣市同等門檻
  keelung: INCOME_THRESHOLD_OTHER,
  hsinchu_city: INCOME_THRESHOLD_OTHER,
  hsinchu_county: INCOME_THRESHOLD_OTHER,
  miaoli: INCOME_THRESHOLD_OTHER,
  changhua: INCOME_THRESHOLD_OTHER,
  nantou: INCOME_THRESHOLD_OTHER,
  yunlin: INCOME_THRESHOLD_OTHER,
  chiayi_city: INCOME_THRESHOLD_OTHER,
  chiayi_county: INCOME_THRESHOLD_OTHER,
  pingtung: INCOME_THRESHOLD_OTHER,
  yilan: INCOME_THRESHOLD_OTHER,
  hualien: INCOME_THRESHOLD_OTHER,
  taitung: INCOME_THRESHOLD_OTHER,
  penghu: INCOME_THRESHOLD_OTHER,
};

// ============================================================
// 附表二：月租金上限（超過則不可申請）
// ============================================================

export const RENT_CAPS: Record<City, number> = {
  taipei: 55000,
  new_taipei: 45000,
  taoyuan: 45000,
  taichung: 45000,
  hsinchu_city: 45000,
  hsinchu_county: 45000,
  tainan: 40000,
  kaohsiung: 40000,
  // 其餘 14 縣市
  keelung: 39000,
  miaoli: 39000,
  changhua: 39000,
  nantou: 39000,
  yunlin: 39000,
  chiayi_city: 39000,
  chiayi_county: 39000,
  pingtung: 39000,
  yilan: 39000,
  hualien: 39000,
  taitung: 39000,
  penghu: 39000,
  kinmen: 39000,
  lienchiang: 39000,
};

// ============================================================
// 附表四：基礎金額表 — 分縣市區位 × 分級
// ============================================================

// 新北市 — 內圈（共 18 區，金額 5000/4000/2400）
const NEW_TAIPEI_INNER_AREAS = new Set([
  '三重區',
  '土城區',
  '中和區',
  '永和區',
  '汐止區',
  '板橋區',
  '新店區',
  '新莊區',
  '蘆洲區',
  '八里區',
  '三峽區',
  '五股區',
  '林口區',
  '泰山區',
  '淡水區',
  '深坑區',
  '樹林區',
  '鶯歌區',
]);
// 其餘 11 區為外圈（金額 3600/3200/2000）

// 臺中市 — 內圈（共 17 區）
const TAICHUNG_INNER_AREAS = new Set([
  '中區',
  '北區',
  '北屯區',
  '西區',
  '西屯區',
  '東區',
  '南區',
  '南屯區',
  '大里區',
  '大雅區',
  '潭子區',
  '龍井區',
  '豐原區',
  '大甲區',
  '太平區',
  '沙鹿區',
  '烏日區',
]);

// 臺南市 — 內圈（共 19 區）
const TAINAN_INNER_AREAS = new Set([
  '中西區',
  '北區',
  '安平區',
  '東區',
  '南區',
  '永康區',
  '善化區',
  '新市區',
  '安南區',
  '仁德區',
  '安定區',
  '西港區',
  '佳里區',
  '柳營區',
  '麻豆區',
  '新化區',
  '新營區',
  '歸仁區',
  '鹽水區',
]);

// 高雄市 — 內圈（共 30 區）
const KAOHSIUNG_INNER_AREAS = new Set([
  '小港區',
  '旗津區',
  '大社區',
  '大寮區',
  '大樹區',
  '仁武區',
  '岡山區',
  '林園區',
  '梓官區',
  '鳥松區',
  '茄萣區',
  '湖內區',
  '路竹區',
  '旗山區',
  '鳳山區',
  '橋頭區',
  '燕巢區',
  '三民區',
  '左營區',
  '前金區',
  '前鎮區',
  '苓雅區',
  '新興區',
  '楠梓區',
  '鼓山區',
  '鹽埕區',
  '永安區',
  '阿蓮區',
  '美濃區',
  '彌陀區',
]);

// 基礎金額查表（依分級索引 0/1/2 對應 tier 1/2/3）
const BASE_AMOUNTS_TAIPEI = [8000, 5000, 3000] as const;
const BASE_AMOUNTS_TIER_B = [5000, 4000, 2400] as const; // 新北內、桃園、新竹、台中內
const BASE_AMOUNTS_TIER_C = [4000, 3600, 2200] as const; // 台南內、高雄內
const BASE_AMOUNTS_TIER_D = [3600, 3200, 2000] as const; // 其餘

export function getBaseAmount(
  city: City,
  area: string | undefined,
  tier: SubsidyTier,
): number {
  const idx = tier - 1;

  if (city === 'taipei') return BASE_AMOUNTS_TAIPEI[idx];

  if (city === 'new_taipei') {
    return area && NEW_TAIPEI_INNER_AREAS.has(area)
      ? BASE_AMOUNTS_TIER_B[idx]
      : BASE_AMOUNTS_TIER_D[idx];
  }

  if (city === 'taoyuan' || city === 'hsinchu_city' || city === 'hsinchu_county') {
    return BASE_AMOUNTS_TIER_B[idx];
  }

  if (city === 'taichung') {
    return area && TAICHUNG_INNER_AREAS.has(area)
      ? BASE_AMOUNTS_TIER_B[idx]
      : BASE_AMOUNTS_TIER_D[idx];
  }

  if (city === 'tainan') {
    return area && TAINAN_INNER_AREAS.has(area)
      ? BASE_AMOUNTS_TIER_C[idx]
      : BASE_AMOUNTS_TIER_D[idx];
  }

  if (city === 'kaohsiung') {
    return area && KAOHSIUNG_INNER_AREAS.has(area)
      ? BASE_AMOUNTS_TIER_C[idx]
      : BASE_AMOUNTS_TIER_D[idx];
  }

  // 其餘 14 縣市
  return BASE_AMOUNTS_TIER_D[idx];
}

// ============================================================
// 分級判定 — 計畫核定本第伍點 + 附表四
// ============================================================

function hasAnySocialWeakStatus(input: CalculatorInput): boolean {
  const s = input.socialWeak;
  return (
    s.isDisabled ||
    s.isElderly ||
    s.isIndigenous ||
    s.isHomeless ||
    s.isSpecialFamily ||
    s.isDisasterVictim ||
    s.isInstitutionLeaver ||
    s.isDomesticViolenceVictim ||
    s.isHivOrAids ||
    s.isPregnantMinor ||
    countTotalChildren(input) >= 2 // 育有 2 名以上未成年子女（含胎兒）
  );
}

function hasAnyEconomicWeakStatus(input: CalculatorInput): boolean {
  return input.economicWeak.isLowIncome || input.economicWeak.isMidLowIncome;
}

export function determineTier(input: CalculatorInput): SubsidyTier {
  const { householdSize, applicantAge, marriage, economicWeak } = input;

  // 第一級：家庭成員 2+ 含低收，或 3+ 含中低收
  if (
    (householdSize >= 2 && economicWeak.isLowIncome) ||
    (householdSize >= 3 && economicWeak.isMidLowIncome)
  ) {
    return 1;
  }

  // 第三級：單身、未滿 40、無經濟或社會弱勢
  if (
    householdSize === 1 &&
    applicantAge < SINGLE_YOUTH_AGE_LIMIT &&
    marriage.status === 'single' &&
    !hasAnyEconomicWeakStatus(input) &&
    !hasAnySocialWeakStatus(input)
  ) {
    return 3;
  }

  // 第二級：其餘
  return 2;
}

// ============================================================
// 附表五：加碼倍數
// ============================================================

// 子女總數（含胎兒）
function countTotalChildren(input: CalculatorInput): number {
  const { countBornBefore2026, countBornAfter2026, isPregnant } = input.children;
  return countBornBefore2026 + countBornAfter2026 + (isPregnant ? 1 : 0);
}

// 115/1/1 後出生的新生兒（含胎兒，視為新生兒）
function countPostBoundaryChildren(input: CalculatorInput): number {
  const { countBornAfter2026, isPregnant } = input.children;
  return countBornAfter2026 + (isPregnant ? 1 : 0);
}

// 育兒加碼 — 附表五 + 註 2
// 規則：若 ALL children 都是 post-2026，套用新表（2 / 2.5 / 3，每多 1 個 +0.5）
//      若有任何 pre-2026 子女，套用舊表（1.4 / 1.6 / 1.8，每多 1 個 +0.2），count 為總數
function childMultiplier(input: CalculatorInput): {
  multiplier: number;
  source: MultiplierSource;
} {
  const total = countTotalChildren(input);
  if (total === 0) return { multiplier: 0, source: 'none' };

  const preCount = input.children.countBornBefore2026;
  const postCount = countPostBoundaryChildren(input);

  // 所有子女皆為 post-2026 新生兒
  if (preCount === 0 && postCount > 0) {
    // 新表：1 人 2x、2 人 2.5x、3 人 3x、每多 1 個 +0.5
    let multiplier: number;
    if (postCount === 1) multiplier = 2.0;
    else if (postCount === 2) multiplier = 2.5;
    else if (postCount === 3) multiplier = 3.0;
    else multiplier = 3.0 + (postCount - 3) * 0.5;
    return { multiplier, source: 'children_post_2026' };
  }

  // 含任何 pre-2026 子女 — 套用舊表，count 為總數
  let multiplier: number;
  if (total === 1) multiplier = 1.4;
  else if (total === 2) multiplier = 1.6;
  else if (total === 3) multiplier = 1.8;
  else multiplier = 1.8 + (total - 3) * 0.2;
  return { multiplier, source: 'children_pre_2026' };
}

// 新婚加碼 — 附表五 + 註 2
function marriageMultiplier(
  input: CalculatorInput,
  referenceDate: Date,
): { multiplier: number; source: MultiplierSource } {
  const { marriage } = input;

  if (marriage.status !== 'married' || !marriage.registrationDate) {
    return { multiplier: 0, source: 'none' };
  }

  // 復婚不適用
  if (marriage.isRemarriageToSameSpouse) {
    return { multiplier: 0, source: 'none' };
  }

  const regDate = new Date(marriage.registrationDate);
  if (Number.isNaN(regDate.getTime())) {
    return { multiplier: 0, source: 'none' };
  }

  // 2 年內 — referenceDate - regDate < 2 years
  const twoYearsAgo = new Date(referenceDate);
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - NEWLYWED_YEARS_LIMIT);
  if (regDate < twoYearsAgo) {
    return { multiplier: 0, source: 'none' };
  }

  // 115/1/1 後登記結婚 → 1.5x；否則 1.3x
  const boundary = new Date(MARRIAGE_MULTIPLIER_BOUNDARY);
  if (regDate >= boundary) {
    return { multiplier: 1.5, source: 'newlywed_post_2026' };
  }
  return { multiplier: 1.3, source: 'newlywed_pre_2026' };
}

// 單身青年加碼
function singleYouthMultiplier(
  input: CalculatorInput,
): { multiplier: number; source: MultiplierSource } {
  if (
    input.applicantAge >= MIN_APPLICANT_AGE &&
    input.applicantAge < SINGLE_YOUTH_AGE_LIMIT &&
    input.marriage.status === 'single'
  ) {
    return { multiplier: 1.2, source: 'single_youth' };
  }
  return { multiplier: 0, source: 'none' };
}

// 經濟弱勢加碼
function economicWeakMultiplier(input: CalculatorInput): {
  multiplier: number;
  source: MultiplierSource;
} {
  if (hasAnyEconomicWeakStatus(input)) {
    return { multiplier: 1.4, source: 'economic_weak' };
  }
  return { multiplier: 0, source: 'none' };
}

// 社會弱勢加碼
function socialWeakMultiplier(input: CalculatorInput): {
  multiplier: number;
  source: MultiplierSource;
} {
  if (hasAnySocialWeakStatus(input)) {
    return { multiplier: 1.2, source: 'social_weak' };
  }
  return { multiplier: 0, source: 'none' };
}

// 加碼倍數計算 — 註 1: 同時符合二種以上補貼金額加碼身分者，補貼金額擇高補貼
export function calculateMultiplier(
  input: CalculatorInput,
  referenceDate: Date,
): { multiplier: number; source: MultiplierSource; reason: string } {
  const candidates = [
    singleYouthMultiplier(input),
    marriageMultiplier(input, referenceDate),
    childMultiplier(input),
    economicWeakMultiplier(input),
    socialWeakMultiplier(input),
  ];

  const best = candidates.reduce(
    (max, curr) => (curr.multiplier > max.multiplier ? curr : max),
    { multiplier: 1.0, source: 'none' as MultiplierSource },
  );

  return {
    multiplier: best.multiplier,
    source: best.source,
    reason: multiplierReasonLabel(best.source, input),
  };
}

function multiplierReasonLabel(source: MultiplierSource, input: CalculatorInput): string {
  switch (source) {
    case 'single_youth':
      return '單身青年（成年未滿 40 歲）加碼 1.2 倍';
    case 'newlywed_pre_2026':
      return '新婚 2 年內（114/12/31 前登記結婚）加碼 1.3 倍';
    case 'newlywed_post_2026':
      return '新婚 2 年內（115/1/1 後登記結婚）加碼 1.5 倍';
    case 'children_pre_2026': {
      const total = countTotalChildren(input);
      return `育有 ${total} 名未成年子女（含 114 年前出生子女）加碼`;
    }
    case 'children_post_2026': {
      const post = countPostBoundaryChildren(input);
      return `育有 ${post} 名 115 年後出生新生兒（含胎兒）加碼`;
    }
    case 'economic_weak':
      return '經濟弱勢（低收或中低收）加碼 1.4 倍';
    case 'social_weak':
      return '社會弱勢加碼 1.2 倍';
    case 'none':
    default:
      return '無加碼身分';
  }
}

// ============================================================
// 所得門檻判定
// ============================================================

// 判斷申請人是否屬於「婚育家庭」（享受 3.5 倍門檻）
export function qualifiesForExpandedIncomeThreshold(input: CalculatorInput): boolean {
  // 新婚 2 年內 或 育有未成年子女（含胎兒）
  if (countTotalChildren(input) > 0) return true;
  if (input.marriage.status === 'married' && input.marriage.registrationDate) {
    // 簡化：只看是否已婚有登記日期；engine 可進一步比對 2 年內
    return true;
  }
  return false;
}

export function getIncomeThreshold(
  city: City,
  useExpanded: boolean,
): number {
  const row = INCOME_THRESHOLDS[city];
  return useExpanded ? row.expanded : row.regular;
}

// ============================================================
// 所得計算 — 平均每人每月所得
// ============================================================

export function perCapitaMonthlyIncome(input: CalculatorInput): number {
  if (input.householdSize <= 0) return Number.POSITIVE_INFINITY;
  return input.annualIncome / input.householdSize / 12;
}
