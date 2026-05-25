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
import { getAreasForCity } from '@/lib/constants/city-areas';
import { CITY_NAMES } from '@/lib/rules/central';

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
    <Card className="border-border/80 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
          你住哪？
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          補貼金額與所得門檻依「租屋地」認定，不是戶籍地
        </p>
      </CardHeader>
      <CardContent className="space-y-8 pt-2">
        <div className="space-y-5">
          <SectionHeading>租屋地</SectionHeading>

          <div>
            <Label htmlFor="rental-city" className="text-sm font-medium">
              縣市
            </Label>
            <Controller
              name="rentalCity"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue('rentalArea', '');
                  }}
                >
                  <SelectTrigger id="rental-city" className="mt-2 h-11 w-full">
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
          </div>

          {areas && (
            <div>
              <Label htmlFor="rental-area" className="text-sm font-medium">
                鄉鎮市區
              </Label>
              <Controller
                name="rentalArea"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="rental-area" className="mt-2 h-11 w-full">
                      <SelectValue placeholder="請選擇" />
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
              <FieldHint>
                新北 / 台中 / 台南 / 高雄 內外圈金額不同
              </FieldHint>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
