'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';

import { HouseholdStep } from '@/components/calculator/household-step';
import { PersonalInfoStep } from '@/components/calculator/personal-info-step';
import { StepProgress } from '@/components/calculator/step-progress';
import {
  FORM_INITIAL_VALUES,
  loadFormState,
  saveFormState,
} from '@/components/calculator/use-calculator-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  calculatorInputSchema,
  type CalculatorInputForm,
} from '@/lib/calculator/validators';

const STEP_LABELS = ['你是誰？', '你住哪？', '經濟狀況', '租屋資訊'] as const;

// 每一步要驗證的欄位（Next 時觸發 trigger）
type CalculatorFieldName = keyof CalculatorInputForm;
const STEP_FIELDS: Record<number, CalculatorFieldName[]> = {
  1: ['applicantAge', 'marriage', 'children'],
  2: ['rentalCity', 'rentalArea'],
  3: ['householdSize', 'annualIncome', 'economicWeak', 'socialWeak'],
  4: ['monthlyRent', 'housingType'],
};

export default function CalculatorPage() {
  const [step, setStep] = useState(1);
  const [hasHydrated, setHasHydrated] = useState(false);

  const form = useForm<CalculatorInputForm>({
    // 強轉：zodResolver 的輸入型別 (unknown) 與 form 期待的 (number) 因 z.coerce 而不同
    resolver: zodResolver(calculatorInputSchema) as unknown as Resolver<CalculatorInputForm>,
    defaultValues: FORM_INITIAL_VALUES,
    mode: 'onSubmit',
  });

  // 從 localStorage 還原（client-only，避免 SSR mismatch）
  useEffect(() => {
    const saved = loadFormState();
    if (saved) {
      form.reset({ ...FORM_INITIAL_VALUES, ...saved });
    }
    setHasHydrated(true);
  }, [form]);

  // 表單變動 → 自動寫入 localStorage
  useEffect(() => {
    const subscription = form.watch((values) => {
      saveFormState(values as Partial<CalculatorInputForm>);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function handleNext() {
    const fields = STEP_FIELDS[step] ?? [];
    const valid = await form.trigger(fields);
    if (valid && step < 4) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          租金補貼試算
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          依 2026 年 300 億元中央擴大租金補貼專案計算
        </p>
      </div>

      <div className="mb-8">
        <StepProgress current={step} total={4} stepLabels={STEP_LABELS} />
      </div>

      {!hasHydrated ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            載入中…
          </CardContent>
        </Card>
      ) : (
        <FormProvider {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Day 4 才會實作最終提交
            }}
          >
            {step === 1 && <PersonalInfoStep />}
            {step === 2 && <HouseholdStep />}
            {step === 3 && <PlaceholderStep title="經濟狀況" />}
            {step === 4 && <PlaceholderStep title="租屋資訊" />}

            <div className="mt-6 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                上一步
              </Button>

              {step < 4 ? (
                <Button type="button" onClick={handleNext}>
                  下一步
                </Button>
              ) : (
                <Button type="submit" disabled>
                  試算（Day 4 完成）
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      )}

      <p className="mt-12 text-center text-xs text-muted-foreground">
        本工具計算結果僅供參考，最終以政府公告為準
      </p>
    </div>
  );
}

function PlaceholderStep({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          這一步將在 Day 4 完成。
        </p>
      </CardContent>
    </Card>
  );
}
