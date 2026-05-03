'use client';

import { cn } from '@/lib/utils/cn';

type BackArrowProps = {
  onClick?: () => void;
  className?: string;
  label?: string;
};

export function BackArrow({ onClick, className, label = 'Go back' }: BackArrowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        '-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-sm text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 dark:text-dark-ink-primary dark:focus-visible:ring-dark-teal/35',
        className,
      )}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M13 16L7 10L13 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
