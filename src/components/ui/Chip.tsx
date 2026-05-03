'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type ChipProps = {
  children: React.ReactNode;
  selected?: boolean;
  variant?: 'filter' | 'tag';
  onClick?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
};

export function Chip({
  children,
  selected = false,
  variant = 'tag',
  onClick,
  onRemove,
  disabled,
  className,
}: ChipProps) {
  const maxed = disabled && !selected;

  const styles = cn(
    'inline-flex max-w-full items-center gap-1 rounded-full border px-3.5 font-sans text-[13px] font-medium transition-colors',
    variant === 'tag' && 'min-h-[34px]',
    variant === 'filter' && 'min-h-9',
    variant === 'tag' &&
      (selected
        ? 'border-teal bg-teal text-cream dark:border-dark-teal dark:bg-dark-teal dark:text-dark-bg'
        : 'border-border bg-transparent text-ink-secondary dark:border-dark-border dark:text-dark-ink-secondary'),
    variant === 'filter' &&
      (selected
        ? 'border-teal bg-[rgba(26,95,90,0.12)] text-teal dark:border-dark-teal dark:bg-[rgba(91,168,158,0.14)] dark:text-dark-teal'
        : 'border-border bg-transparent text-ink-secondary dark:border-dark-border dark:text-dark-ink-secondary'),
    maxed && 'cursor-not-allowed opacity-45',
  );

  if (onRemove) {
    return (
      <span className={cn(styles, 'pr-1.5', className)}>
        <span className="min-w-0 truncate pl-0.5">{children}</span>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove filter"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-tertiary hover:bg-black/5 hover:text-ink-primary dark:text-dark-ink-tertiary dark:hover:bg-white/5 dark:hover:text-dark-ink-primary"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(styles, onClick && !disabled && 'cursor-pointer', className)}
    >
      <span className="min-w-0 truncate">{children}</span>
    </button>
  );
}
