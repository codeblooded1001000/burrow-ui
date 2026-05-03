import { cn } from '@/lib/utils/cn';

const SIZE_MAP = {
  14: 14,
  18: 18,
  24: 24,
  48: 48,
} as const;

export type SpinnerSize = keyof typeof SIZE_MAP;

type SpinnerProps = {
  size?: SpinnerSize;
  className?: string;
  /** Tailwind text color class for stroke (e.g. text-cream on primary button). */
  strokeClassName?: string;
};

export function Spinner({ size = 18, className, strokeClassName = 'text-ink-primary' }: SpinnerProps) {
  const px = SIZE_MAP[size];
  const sw = size >= 24 ? 2.5 : 2;
  return (
    <svg
      className={cn('shrink-0 animate-burrow-spin', strokeClassName, className)}
      width={px}
      height={px}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
    >
      <circle cx="9" cy="9" r="7" className="stroke-current" strokeWidth={sw} strokeOpacity="0.25" />
      <path
        d="M9 2 A7 7 0 0 1 16 9"
        className="stroke-current"
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </svg>
  );
}
