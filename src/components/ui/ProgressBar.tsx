import { cn } from '@/lib/utils/cn';

type ProgressBarProps = {
  progress: number;
  className?: string;
};

export function ProgressBar({ progress, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, progress));
  return (
    <div
      className={cn('mx-auto h-0.5 w-[calc(100%-3rem)] overflow-hidden rounded-sm bg-border dark:bg-dark-border', className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-sm bg-teal transition-[width] duration-300 ease-out dark:bg-dark-teal"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
