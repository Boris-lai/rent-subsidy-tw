import { describe, expect, it } from 'vitest';

import { calculateSubsidy, checkEligibility } from '@/lib/calculator/engine';
import type { CalculatorInput } from '@/lib/calculator/types';

// 預設可申請的最小 case（單身 30 歲住台北，無弱勢、無新婚、無小孩）
function makeInput(overrides: Partial<CalculatorInput> = {}): CalculatorInput {
  return {
    applicantAge: 30,
    marriage: { status: 'single' },
    householdSize: 1,
    annualIncome: 360000, // 30,000/月 < 61,137 門檻
    children: {
      countBornBefore2026: 0,
      countBornAfter2026: 0,
      isPregnant: false,
    },
    rentalCity: 'taipei',
    monthlyRent: 20000, // < 55,000 上限
    housingType: 'legal',
    economicWeak: {
      isLowIncome: false,
      isMidLowIncome: false,
    },
    socialWeak: {
      isDisabled: false,
      isElderly: false,
      isIndigenous: false,
      isHomeless: false,
      isSpecialFamily: false,
      isDisasterVictim: false,
      isInstitutionLeaver: false,
      isDomesticViolenceVictim: false,
      isHivOrAids: false,
      isPregnantMinor: false,
    },
    ...overrides,
  };
}

const NOW = new Date('2026-04-15');

describe('checkEligibility — 拒絕情境', () => {
  it('違建 → housing_ineligible', () => {
    const r = checkEligibility(makeInput({ housingType: 'ineligible' }));
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain('housing_ineligible');
  });

  it('未成年 17 歲 → underage', () => {
    const r = checkEligibility(makeInput({ applicantAge: 17 }));
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain('underage');
  });

  it('月租 60,000 (超過台北 55,000 上限) → rent_exceeds_cap', () => {
    const r = checkEligibility(makeInput({ monthlyRent: 60000 }));
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain('rent_exceeds_cap');
  });

  it('所得 100 萬/年單身 (83,333/月 > 61,137) → income_exceeds_threshold', () => {
    const r = checkEligibility(makeInput({ annualIncome: 1000000 }));
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain('income_exceeds_threshold');
  });

  it('家庭人數 0 → household_size_invalid', () => {
    const r = checkEligibility(makeInput({ householdSize: 0 }));
    expect(r.eligible).toBe(false);
    expect(r.reasons).toContain('household_size_invalid');
  });

  it('多重不符合 → 多項 reason 並存', () => {
    const r = checkEligibility(
      makeInput({ housingType: 'ineligible', applicantAge: 16 }),
    );
    expect(r.reasons).toEqual(
      expect.arrayContaining(['housing_ineligible', 'underage']),
    );
  });
});

describe('calculateSubsidy — 第三級 typical cases', () => {
  it('30 歲單身住台北 → 第三級 base 3000 × 1.2 (單身青年) = 3,600', () => {
    const r = calculateSubsidy(makeInput(), NOW);
    expect(r.eligible).toBe(true);
    if (!r.eligible) return;
    expect(r.central.tier).toBe(3);
    expect(r.central.baseAmount).toBe(3000);
    expect(r.central.multiplier).toBe(1.2);
    expect(r.central.monthlyAmount).toBe(3600);
    expect(r.totalMonthly).toBe(3600);
    expect(r.totalYearly).toBe(3600 * 12);
  });

  it('30 歲單身住基隆 → 第三級 base 2000 × 1.2 = 2,400', () => {
    const r = calculateSubsidy(makeInput({ rentalCity: 'keelung' }), NOW);
    expect(r.eligible).toBe(true);
    if (!r.eligible) return;
    expect(r.central.baseAmount).toBe(2000);
    expect(r.central.monthlyAmount).toBe(2400);
  });

  it('30 歲單身住新北板橋 → 內圈 base 2400 × 1.2 = 2,880', () => {
    const r = calculateSubsidy(
      makeInput({ rentalCity: 'new_taipei', rentalArea: '板橋區' }),
      NOW,
    );
    expect(r.eligible).toBe(true);
    if (!r.eligible) return;
    expect(r.central.baseAmount).toBe(2400);
    expect(r.central.monthlyAmount).toBe(2880);
  });

  it('30 歲單身住新北雙溪 → 外圈 base 2000 × 1.2 = 2,400', () => {
    const r = calculateSubsidy(
      makeInput({ rentalCity: 'new_taipei', rentalArea: '雙溪區' }),
      NOW,
    );
    expect(r.eligible).toBe(true);
    if (!r.eligible) return;
    expect(r.central.baseAmount).toBe(2000);
    expect(r.central.monthlyAmount).toBe(2400);
  });
});

describe('calculateSubsidy — 第二級 + 加碼', () => {
  it('已婚 2 人住台北，2024 結婚 (1.3x) → 5000 × 1.3 = 6,500', () => {
    const r = calculateSubsidy(
      makeInput({
        householdSize: 2,
        marriage: { status: 'married', registrationDate: '2024-06-15' },
        annualIncome: 720000, // 30,000/月/人 < 61,137 (但要看 useExpanded)
      }),
      NOW,
    );
    expect(r.eligible).toBe(true);
    if (!r.eligible) return;
    expect(r.central.tier).toBe(2);
    expect(r.central.baseAmount).toBe(5000);
    expect(r.central.multiplier).toBe(1.3);
    expect(r.central.monthlyAmount).toBe(6500);
  });

  it('已婚 2 人住台北，2026/3 結婚 (1.5x) → 5000 × 1.5 = 7,500', () => {
    const r = calculateSubsidy(
      makeInput({
        householdSize: 2,
        marriage: { status: 'married', registrationDate: '2026-03-01' },
        annualIncome: 720000,
      }),
      NOW,
    );
    expect(r.eligible).toBe(true);
    if (!r.eligible) return;
    expect(r.central.multiplier).toBe(1.5);
    expect(r.central.monthlyAmount).toBe(7500);
  });

  it('已婚 + 1 個 2026 新生兒住台北 → 取最高 2.0x = 10,000', () => {
    const r = calculateSubsidy(
      makeInput({
        householdSize: 3,
        marriage: { status: 'married', registrationDate: '2026-03-01' },
        children: {
          countBornBefore2026: 0,
          countBornAfter2026: 1,
          isPregnant: false,
        },
        annualIncome: 1500000, // 41,666/月/人 — 須婚育家庭 3.5x 門檻才過
      }),
      NOW,
    );
    expect(r.eligible).toBe(true);
    if (!r.eligible) return;
    expect(r.central.multiplier).toBe(2.0);
    expect(r.central.monthlyAmount).toBe(10000);
  });

  it('已婚 + 2 名 2024 子女住台北 → 1.6x = 8,000', () => {
    const r = calculateSubsidy(
      makeInput({
        householdSize: 4,
        marriage: { status: 'married', registrationDate: '2023-06-15' }, // 不算新婚（>2年）
        children: {
          countBornBefore2026: 2,
          countBornAfter2026: 0,
          isPregnant: false,
        },
        annualIncome: 1600000,
      }),
      NOW,
    );
    expect(r.eligible).toBe(true);
    if (!r.eligible) return;
    expect(r.central.multiplier).toBe(1.6);
    expect(r.central.monthlyAmount).toBe(8000);
  });

  it('混合 1 pre + 1 post 子女台北 → 套舊表，2 人 → 1.6x', () => {
    const r = calculateSubsidy(
      makeInput({
        householdSize: 3,
        children: {
          countBornBefore2026: 1,
          countBornAfter2026: 1,
          isPregnant: false,
        },
        marriage: { status: 'married', registrationDate: '2023-01-01' },
        annualIncome: 1200000,
      }),
      NOW,
    );
    expect(r.eligible).toBe(true);
    if (!r.eligible) return;
    expect(r.central.multiplier).toBe(1.6);
  });
});

describe('calculateSubsidy — 第一級 (低收/中低收)', () => {
  it('2 人含低收住台北 → 第一級 base 8000，經濟弱勢 1.4x = 11,200', () => {
    const r = calculateSubsidy(
      makeInput({
        householdSize: 2,
        economicWeak: { isLowIncome: true, isMidLowIncome: false },
        annualIncome: 240000,
      }),
      NOW,
    );
    expect(r.eligible).toBe(true);
    if (!r.eligible) return;
    expect(r.central.tier).toBe(1);
    expect(r.central.baseAmount).toBe(8000);
    expect(r.central.multiplier).toBe(1.4);
    expect(r.central.monthlyAmount).toBe(11200);
  });

  it('3 人含中低收 + 1 個 2026 新生兒住台北 → 第一級 8000 × 2.0 = 16,000，但若 cap 至租金 12,000', () => {
    const r = calculateSubsidy(
      makeInput({
        householdSize: 3,
        economicWeak: { isLowIncome: false, isMidLowIncome: true },
        children: {
          countBornBefore2026: 0,
          countBornAfter2026: 1,
          isPregnant: false,
        },
        marriage: { status: 'married', registrationDate: '2024-06-15' },
        monthlyRent: 12000, // 故意設低於計算金額
        annualIncome: 600000,
      }),
      NOW,
    );
    expect(r.eligible).toBe(true);
    if (!r.eligible) return;
    expect(r.central.tier).toBe(1);
    expect(r.central.multiplier).toBe(2.0); // 擇高：post-2026 子女 vs 新婚 1.3 vs 經濟 1.4
    expect(r.central.monthlyAmount).toBe(12000); // capped to actual rent
  });
});

describe('calculateSubsidy — 補貼上限 = 實際租金', () => {
  it('計算結果高於月租金 → 取月租金', () => {
    const r = calculateSubsidy(
      makeInput({
        householdSize: 2,
        economicWeak: { isLowIncome: true, isMidLowIncome: false },
        annualIncome: 200000,
        monthlyRent: 5000, // 故意設低
      }),
      NOW,
    );
    expect(r.eligible).toBe(true);
    if (!r.eligible) return;
    // 8000 × 1.4 = 11,200 but capped at 5,000
    expect(r.central.monthlyAmount).toBe(5000);
    expect(r.central.steps.some((s) => s.includes('不得高於實際租金'))).toBe(true);
  });
});

describe('calculateSubsidy — 所得門檻 expanded', () => {
  it('婚育家庭享 3.5x 門檻：4 萬/月/人台北 (新婚 + 育兒) 過關', () => {
    const r = calculateSubsidy(
      makeInput({
        householdSize: 2,
        marriage: { status: 'married', registrationDate: '2026-03-01' },
        annualIncome: 960000, // 40,000/月/人 — 在 61,137 (3x) 之上，但 71,327 (3.5x) 之下
      }),
      NOW,
    );
    expect(r.eligible).toBe(true);
  });

  it('一般家庭 3x 門檻：4 萬/月/人台北 (單身) 不過', () => {
    const r = calculateSubsidy(
      makeInput({
        householdSize: 1,
        annualIncome: 800000, // 66,666/月 — 高於 61,137 3x 門檻
      }),
      NOW,
    );
    expect(r.eligible).toBe(false);
    if (r.eligible) return;
    expect(r.reasons).toContain('income_exceeds_threshold');
  });
});

describe('calculateSubsidy — 警示與下一步', () => {
  it('頂加應出現 warning', () => {
    const r = calculateSubsidy(makeInput({ housingType: 'rooftop' }), NOW);
    expect(r.eligible).toBe(true);
    if (!r.eligible) return;
    expect(r.warnings.some((w) => w.includes('頂樓加蓋'))).toBe(true);
  });

  it('所得接近門檻 (90% 以上) 應出現 warning', () => {
    // 台北單身 一般門檻 61,137；56,000/月 落在 0.9-1.0 區間
    const r = calculateSubsidy(
      makeInput({ annualIncome: 56000 * 12 }),
      NOW,
    );
    expect(r.eligible).toBe(true);
    if (!r.eligible) return;
    expect(r.warnings.some((w) => w.includes('所得接近門檻'))).toBe(true);
  });

  it('月租金接近上限 (90% 以上) 應出現 warning', () => {
    // 台北上限 55,000；50,000 落在 0.9-1.0 區間
    const r = calculateSubsidy(makeInput({ monthlyRent: 50000 }), NOW);
    expect(r.eligible).toBe(true);
    if (!r.eligible) return;
    expect(r.warnings.some((w) => w.includes('租金接近上限'))).toBe(true);
  });

  it('結果包含 nextSteps（線上申請 + 文件 + 諮詢專線）', () => {
    const r = calculateSubsidy(makeInput(), NOW);
    expect(r.eligible).toBe(true);
    if (!r.eligible) return;
    expect(r.nextSteps).toHaveLength(3);
    expect(r.nextSteps[0].url).toContain('moi.gov.tw');
  });

  it('result 包含 policyVersion 與 calculatedAt', () => {
    const r = calculateSubsidy(makeInput(), NOW);
    expect(r.policyVersion).toBe('2026-01-09');
    expect(r.calculatedAt).toBe(NOW.toISOString());
  });
});

describe('calculateSubsidy — 邊界 case', () => {
  it('40 歲單身住台北 → 第二級（不算單身青年）', () => {
    const r = calculateSubsidy(
      makeInput({ applicantAge: 40, annualIncome: 360000 }),
      NOW,
    );
    expect(r.eligible).toBe(true);
    if (!r.eligible) return;
    expect(r.central.tier).toBe(2);
    expect(r.central.baseAmount).toBe(5000);
    expect(r.central.multiplier).toBe(1.0); // 無加碼
    expect(r.central.monthlyAmount).toBe(5000);
  });

  it('39 歲單身住台北 → 第三級 + 單身青年 1.2x', () => {
    const r = calculateSubsidy(
      makeInput({ applicantAge: 39, annualIncome: 360000 }),
      NOW,
    );
    expect(r.eligible).toBe(true);
    if (!r.eligible) return;
    expect(r.central.tier).toBe(3);
    expect(r.central.multiplier).toBe(1.2);
  });
});
