// 租金補貼計算引擎
// 唯一公開 API：calculateSubsidy(input, [now])
// 法源：data/sources/ 內政部 115 年度作業規定（2026/1/9 修正）

import type {
  CalculatorInput,
  CalculatorResult,
  CentralBreakdown,
  IneligibilityReason,
  IneligibleResult,
  NextStep,
} from '@/lib/calculator/types';
import {
  calculateMultiplier,
  CITY_NAMES,
  determineTier,
  getBaseAmount,
  getIncomeThreshold,
  MIN_APPLICANT_AGE,
  perCapitaMonthlyIncome,
  POLICY_VERSION,
  qualifiesForExpandedIncomeThreshold,
  RENT_CAPS,
} from '@/lib/rules/central';

// ============================================================
// 主入口
// ============================================================

export function calculateSubsidy(
  input: CalculatorInput,
  now: Date = new Date(),
): CalculatorResult {
  // Step 1: 基本資格檢查
  const eligibility = checkEligibility(input);
  if (!eligibility.eligible) {
    return buildIneligibleResult(eligibility.reasons, now);
  }

  // Step 2: 中央分級
  const tier = determineTier(input);

  // Step 3: 基礎金額
  const baseAmount = getBaseAmount(input.rentalCity, input.rentalArea, tier);

  // Step 4: 加碼倍數
  const { multiplier, source, reason } = calculateMultiplier(input, now);

  // Step 5: 中央補貼月額（補貼金額不得高於實際租金支出）
  const calculatedAmount = Math.round(baseAmount * multiplier);
  const monthlyAmount = Math.min(calculatedAmount, input.monthlyRent);

  const central: CentralBreakdown = {
    tier,
    tierReason: tierReasonLabel(tier),
    baseAmount,
    multiplier,
    multiplierSource: source,
    multiplierReason: reason,
    monthlyAmount,
    steps: buildCentralSteps({
      baseAmount,
      multiplier,
      calculatedAmount,
      monthlyAmount,
      actualRent: input.monthlyRent,
    }),
  };

  return {
    eligible: true,
    central,
    totalMonthly: monthlyAmount,
    totalYearly: monthlyAmount * 12,
    warnings: buildWarnings(input),
    nextSteps: buildNextSteps(input),
    policyVersion: POLICY_VERSION,
    calculatedAt: now.toISOString(),
  };
}

// ============================================================
// 資格檢查
// ============================================================

export type EligibilityCheck = {
  eligible: boolean;
  reasons: IneligibilityReason[];
};

export function checkEligibility(input: CalculatorInput): EligibilityCheck {
  const reasons: IneligibilityReason[] = [];

  // 房屋類型 — 違建不可申請
  if (input.housingType === 'ineligible') {
    reasons.push('housing_ineligible');
  }

  // 年齡（成年）
  if (input.applicantAge < MIN_APPLICANT_AGE) {
    reasons.push('underage');
  }

  // 家庭成員數
  if (input.householdSize <= 0) {
    reasons.push('household_size_invalid');
  }

  // 月租金上限
  if (input.monthlyRent > RENT_CAPS[input.rentalCity]) {
    reasons.push('rent_exceeds_cap');
  }

  // 所得門檻
  if (!checkIncomeWithinThreshold(input)) {
    reasons.push('income_exceeds_threshold');
  }

  return { eligible: reasons.length === 0, reasons };
}

export function checkIncomeWithinThreshold(input: CalculatorInput): boolean {
  const useExpanded = qualifiesForExpandedIncomeThreshold(input);
  const threshold = getIncomeThreshold(input.rentalCity, useExpanded);
  const perCapita = perCapitaMonthlyIncome(input);
  return perCapita < threshold;
}

// ============================================================
// 不符合資格時的結果
// ============================================================

function buildIneligibleResult(
  reasons: IneligibilityReason[],
  now: Date,
): IneligibleResult {
  return {
    eligible: false,
    reasons,
    policyVersion: POLICY_VERSION,
    calculatedAt: now.toISOString(),
  };
}

// ============================================================
// 說明文字 helpers
// ============================================================

function tierReasonLabel(tier: 1 | 2 | 3): string {
  switch (tier) {
    case 1:
      return '第一級：家庭成員 2 人以上含低收入戶，或 3 人以上含中低收入戶';
    case 2:
      return '第二級：一般家庭';
    case 3:
      return '第三級：單身未滿 40 歲，無經濟或社會弱勢身分';
  }
}

function buildCentralSteps(args: {
  baseAmount: number;
  multiplier: number;
  calculatedAmount: number;
  monthlyAmount: number;
  actualRent: number;
}): string[] {
  const { baseAmount, multiplier, calculatedAmount, monthlyAmount, actualRent } =
    args;
  const steps: string[] = [];
  steps.push(`基礎金額：NT$ ${baseAmount.toLocaleString()} / 月`);
  if (multiplier !== 1.0) {
    steps.push(
      `加碼倍數：× ${multiplier}（= NT$ ${calculatedAmount.toLocaleString()}）`,
    );
  }
  if (calculatedAmount > actualRent) {
    steps.push(
      `補貼金額不得高於實際租金 NT$ ${actualRent.toLocaleString()}，故以實際租金為上限`,
    );
  }
  steps.push(`每月補貼：NT$ ${monthlyAmount.toLocaleString()}`);
  return steps;
}

// ============================================================
// 警示
// ============================================================

function buildWarnings(input: CalculatorInput): string[] {
  const warnings: string[] = [];

  // 頂加 — 目前可申請，但提醒
  if (input.housingType === 'rooftop') {
    warnings.push(
      '你的房屋為頂樓加蓋（無稅籍未保存登記建物）。目前可申請，須切結租賃事實並檢附水電費或門牌證明。',
    );
  }

  // 接近所得門檻（90% 以上）
  const useExpanded = qualifiesForExpandedIncomeThreshold(input);
  const threshold = getIncomeThreshold(input.rentalCity, useExpanded);
  const perCapita = perCapitaMonthlyIncome(input);
  if (perCapita > threshold * 0.9 && perCapita < threshold) {
    warnings.push(
      `你的平均每人每月所得接近門檻（${Math.round(perCapita).toLocaleString()} 元，門檻 ${threshold.toLocaleString()} 元），建議備齊所得證明文件以利審查。`,
    );
  }

  // 接近租金上限（90% 以上）
  const rentCap = RENT_CAPS[input.rentalCity];
  if (input.monthlyRent > rentCap * 0.9 && input.monthlyRent <= rentCap) {
    warnings.push(
      `你的月租金接近上限（${input.monthlyRent.toLocaleString()} / ${rentCap.toLocaleString()}），請確認租賃契約金額。`,
    );
  }

  return warnings;
}

// ============================================================
// 下一步建議
// ============================================================

function buildNextSteps(input: CalculatorInput): NextStep[] {
  const cityName = CITY_NAMES[input.rentalCity];

  return [
    {
      title: '線上申請',
      description: `透過內政部不動產資訊平台提出申請（${cityName}）`,
      url: 'https://pip.moi.gov.tw/V3/B/SCRB0102.aspx',
    },
    {
      title: '準備必要文件',
      description:
        '1) 申請書 2) 租賃契約影本 3) 申請人金融帳戶證明 4) 身分證明文件。低收／中低收／身障等弱勢身分若已有政府紀錄，免另檢附。',
    },
    {
      title: '諮詢專線',
      description: '02-7729-8003（週一至週五 8:00-18:00）',
    },
  ];
}
