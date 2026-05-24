import { describe, expect, it } from 'vitest';

import {
  childrenSchema,
  economicSchema,
  householdSchema,
  marriageSchema,
  personalInfoSchema,
  rentalSchema,
} from '@/lib/calculator/validators';

describe('marriageSchema', () => {
  it('已婚需填登記日期', () => {
    const r = marriageSchema.safeParse({ status: 'married' });
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.error.issues.some((i) => i.message.includes('結婚登記日期'))).toBe(true);
  });

  it('單身 不需登記日期', () => {
    const r = marriageSchema.safeParse({ status: 'single' });
    expect(r.success).toBe(true);
  });

  it('已婚 + 有效日期 → 通過', () => {
    const r = marriageSchema.safeParse({
      status: 'married',
      registrationDate: '2026-03-15',
    });
    expect(r.success).toBe(true);
  });

  it('日期格式錯誤 → 拒絕', () => {
    const r = marriageSchema.safeParse({
      status: 'married',
      registrationDate: '2026/3/15',
    });
    expect(r.success).toBe(false);
  });
});

describe('childrenSchema', () => {
  it('字串會被 coerce 成數字', () => {
    const r = childrenSchema.safeParse({
      countBornBefore2026: '2',
      countBornAfter2026: '0',
      isPregnant: false,
    });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.countBornBefore2026).toBe(2);
  });

  it('負數 → 拒絕', () => {
    const r = childrenSchema.safeParse({
      countBornBefore2026: -1,
      countBornAfter2026: 0,
      isPregnant: false,
    });
    expect(r.success).toBe(false);
  });

  it('小數 → 拒絕', () => {
    const r = childrenSchema.safeParse({
      countBornBefore2026: 1.5,
      countBornAfter2026: 0,
      isPregnant: false,
    });
    expect(r.success).toBe(false);
  });
});

describe('personalInfoSchema', () => {
  const validBase = {
    applicantAge: 30,
    marriage: { status: 'single' as const },
    children: {
      countBornBefore2026: 0,
      countBornAfter2026: 0,
      isPregnant: false,
    },
  };

  it('合理輸入通過', () => {
    expect(personalInfoSchema.safeParse(validBase).success).toBe(true);
  });

  it('17 歲未成年被拒，訊息含「需年滿 18 歲」', () => {
    const r = personalInfoSchema.safeParse({ ...validBase, applicantAge: 17 });
    expect(r.success).toBe(false);
    if (r.success) return;
    expect(r.error.issues.some((i) => i.message.includes('18 歲'))).toBe(true);
  });

  it('年齡 200 不合理 → 拒絕', () => {
    const r = personalInfoSchema.safeParse({ ...validBase, applicantAge: 200 });
    expect(r.success).toBe(false);
  });
});

describe('householdSchema', () => {
  it('合法縣市通過', () => {
    expect(
      householdSchema.safeParse({ rentalCity: 'taipei' }).success,
    ).toBe(true);
  });

  it('未知縣市拒絕', () => {
    expect(
      householdSchema.safeParse({ rentalCity: 'tokyo' }).success,
    ).toBe(false);
  });
});

describe('economicSchema', () => {
  const validBase = {
    householdSize: 1,
    annualIncome: 360000,
    economicWeak: { isLowIncome: false, isMidLowIncome: false },
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
  };

  it('合理輸入通過', () => {
    expect(economicSchema.safeParse(validBase).success).toBe(true);
  });

  it('家庭人數 0 → 拒絕', () => {
    const r = economicSchema.safeParse({ ...validBase, householdSize: 0 });
    expect(r.success).toBe(false);
  });

  it('所得負數 → 拒絕', () => {
    const r = economicSchema.safeParse({ ...validBase, annualIncome: -1 });
    expect(r.success).toBe(false);
  });
});

describe('rentalSchema', () => {
  it('合理輸入通過', () => {
    expect(
      rentalSchema.safeParse({ monthlyRent: 20000, housingType: 'legal' })
        .success,
    ).toBe(true);
  });

  it('租金 0 → 拒絕', () => {
    const r = rentalSchema.safeParse({
      monthlyRent: 0,
      housingType: 'legal',
    });
    expect(r.success).toBe(false);
  });

  it('housingType 必須為 legal / rooftop / ineligible 之一', () => {
    const r = rentalSchema.safeParse({
      monthlyRent: 20000,
      housingType: 'other',
    });
    expect(r.success).toBe(false);
  });
});
