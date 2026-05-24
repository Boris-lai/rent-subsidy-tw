'use client';

import { Controller, useFormContext } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { City } from '@/lib/calculator/types';
import type { CalculatorInputForm } from '@/lib/calculator/validators';
import { CITY_NAMES } from '@/lib/rules/central';
import { getAreasForCity } from '@/lib/constants/city-areas';

const CITY_OPTIONS: readonly City[] = [
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
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-destructive">{message}</p>;
}

export function HouseholdStep() {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CalculatorInputForm>();

  const rentalCity = watch('rentalCity');
  const areas = getAreasForCity(rentalCity);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">你住哪？</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 租屋縣市 */}
        <div>
          <Label htmlFor="rental-city">租屋所在縣市</Label>
          <Controller
            name="rentalCity"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  // 換縣市時清掉舊的 area，避免帶到不存在的選項
                  setValue('rentalArea', '');
                }}
              >
                <SelectTrigger id="rental-city" className="mt-1 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CITY_OPTIONS.map((city) => (
                    <SelectItem key={city} value={city}>
                      {CITY_NAMES[city]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError message={errors.rentalCity?.message} />
          <p className="mt-1 text-xs text-muted-foreground">
            補貼金額與所得門檻會依「租屋縣市」認定
          </p>
        </div>

        {/* 鄉鎮市區 — 僅 4 個有分區的城市顯示 */}
        {areas && (
          <div>
            <Label htmlFor="rental-area">鄉鎮市區</Label>
            <Controller
              name="rentalArea"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="rental-area" className="mt-1 w-full">
                    <SelectValue placeholder="請選擇鄉鎮市區" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.rentalArea?.message} />
            <p className="mt-1 text-xs text-muted-foreground">
              新北、台中、台南、高雄分為「內圈／外圈」兩種金額，選擇正確區別影響補貼金額
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
