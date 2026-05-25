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
import { Card, CardContent } from '@/components/ui/card';
import { POLICY_VERSION } from '@/lib/rules/central';
import {
  calculatorInputSchema,
  type CalculatorInputForm,
} from '@/lib/calculator/validators';

const STEP_LABELS = ['你是誰？', '你住哪？', '經濟狀況', '租屋資訊'] as const;

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
    resolver: zodResolver(
      calculatorInputSchema,
    ) as unknown as Resolver<CalculatorInputForm>,
    defaultValues: FORM_INITIAL_VALUES,
    mode: 'onSubmit',
  });

  useEffect(() => {
    const saved = loadFormState();
    if (saved) {
      form.reset({ ...FORM_INITIAL_VALUES, ...saved });
    }
    setHasHydrated(true);
  }, [form]);

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
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top wordmark */}
      <header className="mx-auto w-full max-w-3xl px-6 pt-8">
        <div className="flex items-baseline justify-between">
          <a
            href="/"
            className="font-mono text-sm font-medium tracking-tight text-foreground hover:text-primary transition-colors"
          >
            rentsub<span className="text-muted-foreground/60">.tw</span>
          </a>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground/60">
            v{POLICY_VERSION}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 sm:py-14">
        <div className="mb-10 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            租金補貼試算
          </h1>
          <p className="text-sm text-muted-foreground">
            依內政部 2026 年 300 億元租金補貼專案計算 ·
            填完約 30 秒，結果可分享
          </p>
        </div>

        <div className="mb-10">
          <StepProgress current={step} total={4} stepLabels={STEP_LABELS} />
        </div>

        {!hasHydrated ? (
          <Card className="border-border/80 shadow-none">
            <CardContent className="py-16 text-center">
              <p className="text-sm text-muted-foreground">載入中…</p>
            </CardContent>
          </Card>
        ) : (
          <FormProvider {...form}>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                {step === 1 && <PersonalInfoStep />}
                {step === 2 && <HouseholdStep />}
                {step === 3 && <PlaceholderStep title="經濟狀況" />}
                {step === 4 && <PlaceholderStep title="租屋資訊" />}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ← 上一步
                </Button>

                {step < 4 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="h-11 px-6 font-medium"
                  >
                    下一步 →
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled
                    className="h-11 px-6 font-medium"
                  >
                    試算（Day 4 完成）
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        )}
      </main>

      <footer className="mx-auto w-full max-w-3xl px-6 pb-10 pt-8">
        <div className="border-t border-border/60 pt-6">
          <p className="text-[11px] leading-relaxed text-muted-foreground/80">
            本工具計算結果僅供參考，最終以政府公告為準。
            <br />
            政策依據：內政部國土管理署「300 億元中央擴大租金補貼專案計畫」(2026 年版)
          </p>
        </div>
      </footer>
    </div>
  );
}

function PlaceholderStep({ title }: { title: string }) {
  return (
    <Card className="border-dashed border-border/80 bg-secondary/30 shadow-none">
      <CardContent className="py-16 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground/60">
          Coming in Day 4
        </p>
        <p className="mt-3 text-base font-medium text-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}
