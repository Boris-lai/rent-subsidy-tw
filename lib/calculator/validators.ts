// 表單驗證 schemas（React Hook Form + Zod）
// 對應 CalculatorInput 各步驟

import { z } from 'zod';

// ============================================================
// Step 1: 你是誰？ — 年齡、婚姻、子女
// ============================================================

const marriageStatusEnum = z.enum(['single', 'married', 'divorced', 'widowed']);

export const marriageSchema = z
  .object({
    status: marriageStatusEnum,
    registrationDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式錯誤')
      .optional()
      .or(z.literal('')),
    isRemarriageToSameSpouse: z.boolean().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.status === 'married' && !val.registrationDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['registrationDate'],
        message: '已婚需填寫結婚登記日期',
      });
    }
  });

export const childrenSchema = z.object({
  countBornBefore2026: z.coerce
    .number({ message: '請輸入有效數字' })
    .int('請輸入整數')
    .min(0, '不可為負數')
    .max(20, '人數不合理'),
  countBornAfter2026: z.coerce
    .number({ message: '請輸入有效數字' })
    .int('請輸入整數')
    .min(0, '不可為負數')
    .max(20, '人數不合理'),
  isPregnant: z.boolean(),
});

export const personalInfoSchema = z.object({
  applicantAge: z.coerce
    .number({ message: '請輸入年齡' })
    .int('請輸入整數')
    .min(18, '申請人需年滿 18 歲')
    .max(120, '年齡不合理'),
  marriage: marriageSchema,
  children: childrenSchema,
});

export type PersonalInfoForm = z.infer<typeof personalInfoSchema>;

// ============================================================
// Step 2: 你住哪？ — 租屋地
// ============================================================

export const cityEnum = z.enum([
  'taipei',
  'new_taipei',
  'taoyuan',
  'taichung',
  'tainan',
  'kaohsiung',
  'keelung',
  'hsinchu_city',
  'hsinchu_county',
  'miaoli',
  'changhua',
  'nantou',
  'yunlin',
  'chiayi_city',
  'chiayi_county',
  'pingtung',
  'yilan',
  'hualien',
  'taitung',
  'penghu',
  'kinmen',
  'lienchiang',
]);

export const householdSchema = z.object({
  rentalCity: cityEnum,
  rentalArea: z.string().optional().or(z.literal('')),
});

export type HouseholdForm = z.infer<typeof householdSchema>;

// ============================================================
// Step 3: 經濟狀況 — 家庭人數、所得、弱勢身分
// ============================================================

export const economicWeakSchema = z.object({
  isLowIncome: z.boolean(),
  isMidLowIncome: z.boolean(),
});

export const socialWeakSchema = z.object({
  isDisabled: z.boolean(),
  isElderly: z.boolean(),
  isIndigenous: z.boolean(),
  isHomeless: z.boolean(),
  isSpecialFamily: z.boolean(),
  isDisasterVictim: z.boolean(),
  isInstitutionLeaver: z.boolean(),
  isDomesticViolenceVictim: z.boolean(),
  isHivOrAids: z.boolean(),
  isPregnantMinor: z.boolean(),
});

export const economicSchema = z.object({
  householdSize: z.coerce
    .number({ message: '請輸入家庭人數' })
    .int('請輸入整數')
    .min(1, '至少 1 人（含申請人）')
    .max(30, '人數不合理'),
  annualIncome: z.coerce
    .number({ message: '請輸入家庭年所得' })
    .int('請輸入整數')
    .min(0, '所得不可為負數')
    .max(50_000_000, '所得不合理'),
  economicWeak: economicWeakSchema,
  socialWeak: socialWeakSchema,
});

export type EconomicForm = z.infer<typeof economicSchema>;

// ============================================================
// Step 4: 租屋資訊 — 月租金、房屋類型
// ============================================================

export const housingTypeEnum = z.enum(['legal', 'rooftop', 'ineligible']);

export const rentalSchema = z.object({
  monthlyRent: z.coerce
    .number({ message: '請輸入月租金' })
    .int('請輸入整數')
    .min(1, '月租金需大於 0')
    .max(200_000, '月租金不合理'),
  housingType: housingTypeEnum,
});

export type RentalForm = z.infer<typeof rentalSchema>;

// ============================================================
// 完整 form schema（4 步合一）
// ============================================================

export const calculatorInputSchema = z.object({
  applicantAge: personalInfoSchema.shape.applicantAge,
  marriage: personalInfoSchema.shape.marriage,
  children: personalInfoSchema.shape.children,
  rentalCity: householdSchema.shape.rentalCity,
  rentalArea: householdSchema.shape.rentalArea,
  householdSize: economicSchema.shape.householdSize,
  annualIncome: economicSchema.shape.annualIncome,
  economicWeak: economicSchema.shape.economicWeak,
  socialWeak: economicSchema.shape.socialWeak,
  monthlyRent: rentalSchema.shape.monthlyRent,
  housingType: rentalSchema.shape.housingType,
});

export type CalculatorInputForm = z.infer<typeof calculatorInputSchema>;
