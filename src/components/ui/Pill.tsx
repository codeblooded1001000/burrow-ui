'use client';

import { cn } from '@/lib/utils/cn';

type PillProps = {
  options: string[];
  value: string | string[];
  onChange: (next: string | string[]) => void;
  label?: string;
  multi?: boolean;
  className?: string;
  disabled?: boolean;
};

export function Pill({ options, value, onChange, label, multi = false, className, disabled }: PillProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label ? (
        <span className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">{label}</span>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = multi ? (value as string[]).includes(opt) : value === opt;
          return (
            <button
              key={opt}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => {
                if (disabled) return;
                if (multi) {
                  const cur = (value as string[]) ?? [];
                  onChange(selected ? cur.filter((v) => v !== opt) : [...cur, opt]);
                } else {
                  onChange(opt);
                }
              }}
              className={cn(
                'h-10 min-w-0 shrink rounded-full border px-2 font-sans text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 dark:focus-visible:ring-dark-teal/35',
                selected
                  ? 'border-teal bg-teal font-medium text-cream dark:border-dark-teal dark:bg-dark-teal dark:text-dark-bg'
                  : 'border-border bg-transparent font-normal text-ink-secondary dark:border-dark-border dark:text-dark-ink-secondary',
                disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <span className="block max-w-full truncate px-2">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
