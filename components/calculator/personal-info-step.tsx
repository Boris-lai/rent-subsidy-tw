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
  return <p className="mt-1 text-sm text-destructive">{message}</p>;
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
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">你是誰？</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 年齡 */}
        <div>
          <Label htmlFor="applicantAge">年齡（申請人）</Label>
          <Input
            id="applicantAge"
            type="number"
            inputMode="numeric"
            min={18}
            max={120}
            placeholder="例：30"
            className="mt-1"
            {...register('applicantAge')}
          />
          <FieldError message={errors.applicantAge?.message} />
        </div>

        {/* 婚姻狀態 */}
        <div>
          <Label htmlFor="marriage-status">婚姻狀態</Label>
          <Controller
            name="marriage.status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="marriage-status" className="mt-1 w-full">
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
          <>
            <div>
              <Label htmlFor="reg-date">結婚登記日期</Label>
              <Input
                id="reg-date"
                type="date"
                className="mt-1"
                {...register('marriage.registrationDate')}
              />
              <FieldError
                message={errors.marriage?.registrationDate?.message}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                115/1/1（含）後登記新婚加碼 1.5 倍；之前 1.3 倍
              </p>
            </div>

            <div className="flex items-start gap-2">
              <Controller
                name="marriage.isRemarriageToSameSpouse"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="remarriage"
                    checked={field.value ?? false}
                    onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  />
                )}
              />
              <Label htmlFor="remarriage" className="cursor-pointer leading-tight">
                我是與原配偶復婚（不適用新婚加碼）
              </Label>
            </div>
          </>
        )}

        {/* 子女 */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-sm font-medium">子女與胎兒（用於育兒加碼）</h3>

          <div>
            <Label htmlFor="kids-pre">114/12/31 以前出生的未成年子女數</Label>
            <Input
              id="kids-pre"
              type="number"
              inputMode="numeric"
              min={0}
              max={20}
              className="mt-1"
              {...register('children.countBornBefore2026')}
            />
            <FieldError
              message={errors.children?.countBornBefore2026?.message}
            />
          </div>

          <div>
            <Label htmlFor="kids-post">115/1/1 以後出生的新生兒數</Label>
            <Input
              id="kids-post"
              type="number"
              inputMode="numeric"
              min={0}
              max={20}
              className="mt-1"
              {...register('children.countBornAfter2026')}
            />
            <FieldError
              message={errors.children?.countBornAfter2026?.message}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              115 年後出生子女加碼倍數較高：1 人 2 倍／2 人 2.5 倍／3 人 3 倍
            </p>
          </div>

          <div className="flex items-start gap-2">
            <Controller
              name="children.isPregnant"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="pregnant"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                />
              )}
            />
            <Label htmlFor="pregnant" className="cursor-pointer leading-tight">
              申請人或配偶現懷孕中（胎兒視同 115 年後新生兒）
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
