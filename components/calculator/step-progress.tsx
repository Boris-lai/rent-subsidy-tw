'use client';

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
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-2.5 text-sm">
          <span
            className="font-mono font-medium tabular-nums text-foreground tracking-tight"
            aria-hidden="true"
          >
            {String(safeCurrent).padStart(2, '0')}
          </span>
          <span className="font-mono tabular-nums text-muted-foreground/70">
            / {String(total).padStart(2, '0')}
          </span>
          {currentLabel && (
            <>
              <span aria-hidden="true" className="text-muted-foreground/50">
                ·
              </span>
              <span className="font-medium text-foreground">{currentLabel}</span>
            </>
          )}
        </div>
        <span className="font-mono text-xs tabular-nums text-muted-foreground/70">
          {percentage}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`步驟 ${safeCurrent}／${total}`}
        className="relative h-px w-full bg-border"
      >
        <div
          className="absolute inset-y-0 left-0 bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
