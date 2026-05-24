// 計算機表單狀態 — localStorage 暫存（避免重整失去資料）

import type { CalculatorInputForm } from '@/lib/calculator/validators';

const STORAGE_KEY = 'rent-calc-form-v1';

// 表單預設值（空欄位用 undefined，避免初始化即觸發驗證錯誤）
export const FORM_INITIAL_VALUES: CalculatorInputForm = {
  applicantAge: undefined as unknown as number,
  marriage: { status: 'single' },
  children: {
    countBornBefore2026: 0,
    countBornAfter2026: 0,
    isPregnant: false,
  },
  rentalCity: 'taipei',
  rentalArea: '',
  householdSize: 1,
  annualIncome: undefined as unknown as number,
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
  monthlyRent: undefined as unknown as number,
  housingType: 'legal',
};

export function loadFormState(): Partial<CalculatorInputForm> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object'
      ? (parsed as Partial<CalculatorInputForm>)
      : null;
  } catch {
    return null;
  }
}

export function saveFormState(state: Partial<CalculatorInputForm>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage quota exceeded 或 disabled — 靜默失敗（不影響功能）
  }
}

export function clearFormState(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

