'use client';

import { Controller, useFormContext } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CalculatorInputForm } from '@/lib/calculator/validators';

const MARITAL_OPTIONS = [
  { value: 'single', label: '單身（未婚）' },
  { value: 'married', label: '已婚' },
  { value: 'divorced', label: '離婚' },
  { value: 'widowed', label: '喪偶' },
] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-destructive">{message}</p>;
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs text-muted-foreground">{children}</p>;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
      {children}
    </h3>
  );
}

export function PersonalInfoStep() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<CalculatorInputForm>();

  const maritalStatus = watch('marriage.status');

  return (
    <Card className="border-border/80 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          你是誰？
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          基本資料用來判定中央分級與加碼資格
        </p>
      </CardHeader>
      <CardContent className="space-y-8 pt-2">
        <div className="space-y-5">
          <SectionHeading>個人</SectionHeading>

          {/* 年齡 */}
          <div>
            <Label htmlFor="applicantAge" className="text-sm font-medium">
              年齡
            </Label>
            <Input
              id="applicantAge"
              type="number"
              inputMode="numeric"
              min={18}
              max={120}
              placeholder="例：30"
              className="mt-2 h-11 tabular-nums"
              {...register('applicantAge')}
            />
            <FieldError message={errors.applicantAge?.message} />
          </div>

          {/* 婚姻狀態 */}
          <div>
            <Label htmlFor="marriage-status" className="text-sm font-medium">
              婚姻狀態
            </Label>
            <Controller
              name="marriage.status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="marriage-status"
                    className="mt-2 h-11 w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MARITAL_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* 結婚登記日期 — 已婚才顯示 */}
          {maritalStatus === 'married' && (
            <div className="space-y-5 rounded-md border border-border/60 bg-secondary/40 p-4">
              <div>
                <Label htmlFor="reg-date" className="text-sm font-medium">
                  結婚登記日期
                </Label>
                <Input
                  id="reg-date"
                  type="date"
                  className="mt-2 h-11 tabular-nums"
                  {...register('marriage.registrationDate')}
                />
                <FieldError
                  message={errors.marriage?.registrationDate?.message}
                />
                <FieldHint>
                  115/1/1（含）後登記，新婚加碼 1.5 倍；之前 1.3 倍
                </FieldHint>
              </div>

              <label
                htmlFor="remarriage"
                className="flex items-start gap-3 cursor-pointer"
              >
                <Controller
                  name="marriage.isRemarriageToSameSpouse"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="remarriage"
                      checked={field.value ?? false}
                      onCheckedChange={(c) => field.onChange(Boolean(c))}
                      className="mt-0.5"
                    />
                  )}
                />
                <span className="text-sm leading-snug text-foreground">
                  與原配偶復婚（依規定不適用新婚加碼）
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="space-y-5 border-t border-border/60 pt-8">
          <SectionHeading>子女與胎兒</SectionHeading>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="kids-pre" className="text-sm font-medium">
                114/12/31 前出生
              </Label>
              <Input
                id="kids-pre"
                type="number"
                inputMode="numeric"
                min={0}
                max={20}
                placeholder="0"
                className="mt-2 h-11 tabular-nums"
                {...register('children.countBornBefore2026')}
              />
              <FieldError
                message={errors.children?.countBornBefore2026?.message}
              />
            </div>

            <div>
              <Label htmlFor="kids-post" className="text-sm font-medium">
                115/1/1 後出生
              </Label>
              <Input
                id="kids-post"
                type="number"
                inputMode="numeric"
                min={0}
                max={20}
                placeholder="0"
                className="mt-2 h-11 tabular-nums"
                {...register('children.countBornAfter2026')}
              />
              <FieldError
                message={errors.children?.countBornAfter2026?.message}
              />
            </div>
          </div>
          <FieldHint>
            115 年後出生加碼較高（1 人 2 倍 / 2 人 2.5 倍 / 3 人 3 倍）
          </FieldHint>

          <label
            htmlFor="pregnant"
            className="flex items-start gap-3 cursor-pointer"
          >
            <Controller
              name="children.isPregnant"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="pregnant"
                  checked={field.value}
                  onCheckedChange={(c) => field.onChange(Boolean(c))}
                  className="mt-0.5"
                />
              )}
            />
            <span className="text-sm leading-snug text-foreground">
              申請人或配偶現懷孕中（胎兒視同 115 年後新生兒）
            </span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
