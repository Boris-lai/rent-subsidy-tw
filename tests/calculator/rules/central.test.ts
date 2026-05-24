import { describe, expect, it } from 'vitest';

import type { CalculatorInput } from '@/lib/calculator/types';
import {
  calculateMultiplier,
  determineTier,
  getBaseAmount,
  getIncomeThreshold,
  perCapitaMonthlyIncome,
  qualifiesForExpandedIncomeThreshold,
  RENT_CAPS,
} from '@/lib/rules/central';

// 預設 input 工廠 — 測試用最小可申請 case
function makeInput(overrides: Partial<CalculatorInput> = {}): CalculatorInput {
  return {
    applicantAge: 30,
    marriage: { status: 'single' },
    householdSize: 1,
    annualIncome: 0,
    children: {
      countBornBefore2026: 0,
      countBornAfter2026: 0,
      isPregnant: false,
    },
    rentalCity: 'taipei',
    monthlyRent: 20000,
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

const APR_2026 = new Date('2026-04-15');

describe('getBaseAmount', () => {
  it('臺北市 第一級/第二級/第三級', () => {
    expect(getBaseAmount('taipei', undefined, 1)).toBe(8000);
    expect(getBaseAmount('taipei', undefined, 2)).toBe(5000);
    expect(getBaseAmount('taipei', undefined, 3)).toBe(3000);
  });

  it('新北市 內圈（板橋）vs 外圈（雙溪）', () => {
    expect(getBaseAmount('new_taipei', '板橋區', 1)).toBe(5000);
    expect(getBaseAmount('new_taipei', '板橋區', 3)).toBe(2400);
    expect(getBaseAmount('new_taipei', '雙溪區', 1)).toBe(3600);
    expect(getBaseAmount('new_taipei', '雙溪區', 3)).toBe(2000);
  });

  it('臺南市 內圈（永康）vs 外圈（楠西）', () => {
    expect(getBaseAmount('tainan', '永康區', 1)).toBe(4000);
    expect(getBaseAmount('tainan', '永康區', 2)).toBe(3600);
    expect(getBaseAmount('tainan', '楠西區', 1)).toBe(3600);
  });

  it('高雄市 內圈（三民）vs 外圈（桃源）', () => {
    expect(getBaseAmount('kaohsiung', '三民區', 1)).toBe(4000);
    expect(getBaseAmount('kaohsiung', '桃源區', 1)).toBe(3600);
  });

  it('其餘 14 縣市（基隆、宜蘭等）— D 級 3600/3200/2000', () => {
    expect(getBaseAmount('keelung', undefined, 1)).toBe(3600);
    expect(getBaseAmount('yilan', undefined, 2)).toBe(3200);
    expect(getBaseAmount('penghu', undefined, 3)).toBe(2000);
  });

  it('未提供 area 的新北市 / 台中市 fallback 為外圈', () => {
    expect(getBaseAmount('new_taipei', undefined, 1)).toBe(3600);
    expect(getBaseAmount('taichung', undefined, 1)).toBe(3600);
  });
});

describe('determineTier', () => {
  it('第一級：2 人家庭含低收', () => {
    const input = makeInput({
      householdSize: 2,
      economicWeak: { isLowIncome: true, isMidLowIncome: false },
    });
    expect(determineTier(input)).toBe(1);
  });

  it('第一級：3 人家庭含中低收', () => {
    const input = makeInput({
      householdSize: 3,
      economicWeak: { isLowIncome: false, isMidLowIncome: true },
    });
    expect(determineTier(input)).toBe(1);
  });

  it('非第一級：2 人含中低收（不足 3 人）→ 第二級', () => {
    const input = makeInput({
      householdSize: 2,
      economicWeak: { isLowIncome: false, isMidLowIncome: true },
    });
    expect(determineTier(input)).toBe(2);
  });

  it('第三級：單身 30 歲未婚無弱勢', () => {
    const input = makeInput({ applicantAge: 30 });
    expect(determineTier(input)).toBe(3);
  });

  it('第三級邊界：39 歲（< 40 適用）', () => {
    const input = makeInput({ applicantAge: 39 });
    expect(determineTier(input)).toBe(3);
  });

  it('非第三級：40 歲單身（年齡上限不含）→ 第二級', () => {
    const input = makeInput({ applicantAge: 40 });
    expect(determineTier(input)).toBe(2);
  });

  it('非第三級：單身有身障 → 第二級', () => {
    const input = makeInput({
      applicantAge: 30,
      socialWeak: { ...makeInput().socialWeak, isDisabled: true },
    });
    expect(determineTier(input)).toBe(2);
  });

  it('第二級：已婚無弱勢', () => {
    const input = makeInput({
      householdSize: 2,
      marriage: { status: 'married', registrationDate: '2024-06-01' },
    });
    expect(determineTier(input)).toBe(2);
  });
});

describe('calculateMultiplier', () => {
  it('單身青年（30 歲）→ 1.2x', () => {
    const m = calculateMultiplier(makeInput({ applicantAge: 30 }), APR_2026);
    expect(m.multiplier).toBe(1.2);
    expect(m.source).toBe('single_youth');
  });

  it('40 歲單身不算單身青年 → 無加碼 1.0x', () => {
    const m = calculateMultiplier(makeInput({ applicantAge: 40 }), APR_2026);
    expect(m.multiplier).toBe(1.0);
    expect(m.source).toBe('none');
  });

  it('新婚 2026/3 登記 → 1.5x', () => {
    const m = calculateMultiplier(
      makeInput({
        marriage: { status: 'married', registrationDate: '2026-03-01' },
      }),
      APR_2026,
    );
    expect(m.multiplier).toBe(1.5);
    expect(m.source).toBe('newlywed_post_2026');
  });

  it('新婚 2024/12 登記 → 1.3x', () => {
    const m = calculateMultiplier(
      makeInput({
        marriage: { status: 'married', registrationDate: '2024-12-30' },
      }),
      APR_2026,
    );
    expect(m.multiplier).toBe(1.3);
    expect(m.source).toBe('newlywed_pre_2026');
  });

  it('結婚超過 2 年（2023/01）→ 不算新婚', () => {
    const m = calculateMultiplier(
      makeInput({
        marriage: { status: 'married', registrationDate: '2023-01-01' },
      }),
      APR_2026,
    );
    expect(m.source).toBe('none');
  });

  it('復婚不適用新婚', () => {
    const m = calculateMultiplier(
      makeInput({
        marriage: {
          status: 'married',
          registrationDate: '2026-03-01',
          isRemarriageToSameSpouse: true,
        },
      }),
      APR_2026,
    );
    expect(m.source).toBe('none');
  });

  it('只有 2026 年後 1 名新生兒 → 2.0x', () => {
    const m = calculateMultiplier(
      makeInput({
        children: { countBornBefore2026: 0, countBornAfter2026: 1, isPregnant: false },
      }),
      APR_2026,
    );
    expect(m.multiplier).toBe(2.0);
    expect(m.source).toBe('children_post_2026');
  });

  it('只有 2026 年後 2 名新生兒 → 2.5x', () => {
    const m = calculateMultiplier(
      makeInput({
        children: { countBornBefore2026: 0, countBornAfter2026: 2, isPregnant: false },
      }),
      APR_2026,
    );
    expect(m.multiplier).toBe(2.5);
  });

  it('懷孕視同 2026 後新生兒：1 個胎兒 → 2.0x', () => {
    const m = calculateMultiplier(
      makeInput({
        children: { countBornBefore2026: 0, countBornAfter2026: 0, isPregnant: true },
      }),
      APR_2026,
    );
    expect(m.multiplier).toBe(2.0);
    expect(m.source).toBe('children_post_2026');
  });

  it('只有 2024 年前 2 名子女 → 1.6x（舊表）', () => {
    const m = calculateMultiplier(
      makeInput({
        children: { countBornBefore2026: 2, countBornAfter2026: 0, isPregnant: false },
      }),
      APR_2026,
    );
    expect(m.multiplier).toBe(1.6);
    expect(m.source).toBe('children_pre_2026');
  });

  it('混合（1 pre + 1 post）→ 套用舊表，count = 2 → 1.6x', () => {
    const m = calculateMultiplier(
      makeInput({
        children: { countBornBefore2026: 1, countBornAfter2026: 1, isPregnant: false },
      }),
      APR_2026,
    );
    expect(m.multiplier).toBe(1.6);
    expect(m.source).toBe('children_pre_2026');
  });

  it('擇高：單身青年 + 經濟弱勢 → 取 1.4x（經濟弱勢勝出）', () => {
    const m = calculateMultiplier(
      makeInput({
        applicantAge: 30,
        economicWeak: { isLowIncome: true, isMidLowIncome: false },
      }),
      APR_2026,
    );
    expect(m.multiplier).toBe(1.4);
    expect(m.source).toBe('economic_weak');
  });

  it('擇高：新婚 + 經濟弱勢 → 取 1.5x（新婚 2026 勝出）', () => {
    const m = calculateMultiplier(
      makeInput({
        marriage: { status: 'married', registrationDate: '2026-03-01' },
        economicWeak: { isLowIncome: true, isMidLowIncome: false },
      }),
      APR_2026,
    );
    expect(m.multiplier).toBe(1.5);
  });

  it('擇高：1 名 2026 新生兒 + 新婚 → 取 2.0x（新生兒勝出）', () => {
    const m = calculateMultiplier(
      makeInput({
        marriage: { status: 'married', registrationDate: '2026-03-01' },
        children: { countBornBefore2026: 0, countBornAfter2026: 1, isPregnant: false },
      }),
      APR_2026,
    );
    expect(m.multiplier).toBe(2.0);
    expect(m.source).toBe('children_post_2026');
  });
});

describe('income threshold helpers', () => {
  it('臺北市 一般所得門檻 61,137', () => {
    expect(getIncomeThreshold('taipei', false)).toBe(61137);
  });

  it('臺北市 婚育家庭門檻 71,327', () => {
    expect(getIncomeThreshold('taipei', true)).toBe(71327);
  });

  it('金門/連江 同等門檻 43,023 / 50,194', () => {
    expect(getIncomeThreshold('kinmen', false)).toBe(43023);
    expect(getIncomeThreshold('lienchiang', true)).toBe(50194);
  });

  it('其餘縣市 46,545 / 54,303', () => {
    expect(getIncomeThreshold('keelung', false)).toBe(46545);
    expect(getIncomeThreshold('yilan', true)).toBe(54303);
  });

  it('perCapitaMonthlyIncome: 600,000 / 2 人 / 12 = 25,000', () => {
    const input = makeInput({ annualIncome: 600000, householdSize: 2 });
    expect(perCapitaMonthlyIncome(input)).toBe(25000);
  });

  it('qualifiesForExpandedIncomeThreshold: 有子女 → true', () => {
    const input = makeInput({
      children: { countBornBefore2026: 1, countBornAfter2026: 0, isPregnant: false },
    });
    expect(qualifiesForExpandedIncomeThreshold(input)).toBe(true);
  });

  it('qualifiesForExpandedIncomeThreshold: 單身無子女 → false', () => {
    expect(qualifiesForExpandedIncomeThreshold(makeInput())).toBe(false);
  });
});

describe('RENT_CAPS', () => {
  it('臺北市 55,000；新北 / 桃園 / 台中 / 新竹 45,000', () => {
    expect(RENT_CAPS.taipei).toBe(55000);
    expect(RENT_CAPS.new_taipei).toBe(45000);
    expect(RENT_CAPS.taoyuan).toBe(45000);
    expect(RENT_CAPS.taichung).toBe(45000);
    expect(RENT_CAPS.hsinchu_city).toBe(45000);
  });

  it('台南 / 高雄 40,000；其餘 39,000', () => {
    expect(RENT_CAPS.tainan).toBe(40000);
    expect(RENT_CAPS.kaohsiung).toBe(40000);
    expect(RENT_CAPS.keelung).toBe(39000);
    expect(RENT_CAPS.kinmen).toBe(39000);
  });
});
