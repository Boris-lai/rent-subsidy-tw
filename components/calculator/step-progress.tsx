'use client';

import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';

type StepProgressProps = {
  current: number; // 1-based
  total?: number;
  stepLabels?: readonly string[];
};

export function StepProgress({
  current,
  total = 4,
  stepLabels,
}: StepProgressProps) {
  const safeCurrent = Math.max(1, Math.min(current, total));
  const percentage = Math.round((safeCurrent / total) * 100);
  const currentLabel = stepLabels?.[safeCurrent - 1];

  return (
    <Progress value={percentage} className="flex flex-col gap-2">
      <div className="flex w-full items-center justify-between">
        <ProgressLabel>
          步驟 {safeCurrent} / {total}
          {currentLabel ? `　${currentLabel}` : ''}
        </ProgressLabel>
        <ProgressValue />
      </div>
    </Progress>
  );
}
