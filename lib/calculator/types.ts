// 租金補貼計算機 — 共用型別
// 依據：data/sources/ 內政部 115 年度租金補貼官方文件

// ============================================================
// 基本列舉
// ============================================================

// 全國 22 縣市
export type City =
  | 'taipei'
  | 'new_taipei'
  | 'taoyuan'
  | 'taichung'
  | 'tainan'
  | 'kaohsiung'
  | 'keelung'
  | 'hsinchu_city'
  | 'hsinchu_county'
  | 'miaoli'
  | 'changhua'
  | 'nantou'
  | 'yunlin'
  | 'chiayi_city'
  | 'chiayi_county'
  | 'pingtung'
  | 'yilan'
  | 'hualien'
  | 'taitung'
  | 'penghu'
  | 'kinmen'
  | 'lienchiang';

// 房屋類型（用於資格判定，附表二＋作業規定第五點）
export type HousingType =
  | 'legal' // 合法住宅（房屋稅住家用稅率，或已保存登記建物住宅用途）
  | 'rooftop' // 頂樓加蓋（無稅籍但可切結申請）
  | 'ineligible'; // 違建／商業用／不符規定 → 無法申請

// 中央補貼分級
export type SubsidyTier = 1 | 2 | 3;

// 婚姻狀態
export type MaritalStatusValue = 'single' | 'married' | 'divorced' | 'widowed';

// ============================================================
// 輸入資料 shape
// ============================================================

// 經濟弱勢身分（加碼 1.4 倍）
export type EconomicWeakStatus = {
  isLowIncome: boolean; // 低收入戶
  isMidLowIncome: boolean; // 中低收入戶
};

// 社會弱勢身分（加碼 1.2 倍）— 附表三
// 註：「育有 2 名以上未成年子女」這一類由 engine 從 children info 推導，不在此 input
export type SocialWeakStatus = {
  isDisabled: boolean; // 身心障礙者
  isElderly: boolean; // 65 歲以上（限申請人）
  isIndigenous: boolean; // 原住民
  isHomeless: boolean; // 遊民
  isSpecialFamily: boolean; // 特殊境遇家庭
  isDisasterVictim: boolean; // 災民
  isInstitutionLeaver: boolean; // 安置教養機構結束安置且未滿 25 歲
  isDomesticViolenceVictim: boolean; // 家暴／性侵受害者及其子女
  isHivOrAids: boolean; // 感染 HIV／AIDS
  isPregnantMinor: boolean; // 因懷孕生育遭困境之未成年人（限申請人）
};

// 子女資訊（用於育兒加碼，胎兒視同未成年子女）
export type ChildrenInfo = {
  // 114/12/31 前出生（含）的未成年子女數
  countBornBefore2026: number;
  // 115/1/1 後出生（含）的新生兒數
  countBornAfter2026: number;
  // 申請人或配偶現懷孕中（胎兒視同新生兒，套用 115 年加碼）
  isPregnant: boolean;
};

// 婚姻資訊
export type MarriageInfo = {
  status: MaritalStatusValue;
  // 結婚登記日期（ISO yyyy-mm-dd）— 判定新婚 2 年內 + 1.3x vs 1.5x
  registrationDate?: string;
  // 離婚再與原配偶復婚（不適用新婚加碼）
  isRemarriageToSameSpouse?: boolean;
};

// 計算機輸入
export type CalculatorInput = {
  // 申請人
  applicantAge: number;
  marriage: MarriageInfo;

  // 家庭組成
  householdSize: number; // 家庭成員人數（含申請人）
  annualIncome: number; // 家庭成員年所得總額（元）

  // 子女
  children: ChildrenInfo;

  // 居住地
  rentalCity: City;
  rentalArea?: string; // 鄉鎮市區（影響 12 級基礎金額分區）

  // 弱勢身分
  economicWeak: EconomicWeakStatus;
  socialWeak: SocialWeakStatus;

  // 租屋
  monthlyRent: number; // 月租金（元）
  housingType: HousingType;
};

// ============================================================
// 輸出資料 shape
// ============================================================

// 不符合資格的原因
export type IneligibilityReason =
  | 'housing_ineligible' // 房屋類型違建
  | 'rent_exceeds_cap' // 月租金超過附表二上限
  | 'income_exceeds_threshold' // 平均所得超過最低生活費 3 倍／3.5 倍
  | 'underage' // 未成年且不符特殊例外
  | 'household_size_invalid'; // 家庭成員數異常（≤ 0）

export type IneligibleResult = {
  eligible: false;
  reasons: IneligibilityReason[];
  policyVersion: string;
  calculatedAt: string;
};

// 倍數加碼來源（用於說明文字）
export type MultiplierSource =
  | 'single_youth' // 單身青年 1.2x
  | 'newlywed_pre_2026' // 新婚 (114/12/31 前結婚) 1.3x
  | 'newlywed_post_2026' // 新婚 (115/1/1 後結婚) 1.5x
  | 'children_pre_2026' // 育有 2024 年底前出生子女 1.4-1.8x+
  | 'children_post_2026' // 育有 2026/1/1 後出生新生兒 2-3x+
  | 'economic_weak' // 經濟弱勢 1.4x
  | 'social_weak' // 社會弱勢 1.2x
  | 'none'; // 不加碼 (1.0x)

export type CentralBreakdown = {
  tier: SubsidyTier;
  tierReason: string; // 分級理由
  baseAmount: number; // 基礎金額 (附表四)
  multiplier: number; // 套用的加碼倍數
  multiplierSource: MultiplierSource;
  multiplierReason: string; // 倍數來源說明
  monthlyAmount: number; // 中央補貼月額 = round(baseAmount × multiplier)，且不得超過月租金
  steps: string[]; // 計算過程
};

export type LocalSubsidyBreakdown = {
  cityName: string; // 縣市中文名稱
  amount: number;
  notes: string[];
};

export type NextStep = {
  title: string;
  description: string;
  url?: string;
};

export type EligibleResult = {
  eligible: true;
  central: CentralBreakdown;
  local?: LocalSubsidyBreakdown; // MVP 後期再實作
  totalMonthly: number;
  totalYearly: number;
  warnings: string[];
  nextSteps: NextStep[];
  policyVersion: string;
  calculatedAt: string;
};

export type CalculatorResult = IneligibleResult | EligibleResult;
