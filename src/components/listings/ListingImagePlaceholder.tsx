import { cn } from '@/lib/utils/cn';

type ListingImagePlaceholderProps = {
  className?: string;
  /** Visually hidden label for screen readers */
  label?: string;
};

/** Flat / building illustration when a listing has no photos. */
export function ListingImagePlaceholder({ className, label = 'No listing photo' }: ListingImagePlaceholderProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-teal-tint to-surface dark:from-dark-teal-tint dark:to-dark-surface',
        className,
      )}
      role="img"
      aria-label={label}
    >
      <svg
        viewBox="0 0 120 88"
        className="h-[42%] w-[55%] max-w-[200px] text-teal/35 dark:text-dark-teal/40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M8 78V38l22-14 20 12 18-10 22 14v38H8Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M30 78V52h16v26H30Zm44 0V58h16v20H74Z" fill="currentColor" opacity="0.45" />
        <path d="M52 78V44h16v34H52Z" fill="currentColor" opacity="0.28" />
        <path d="M24 32 60 10l36 22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      </svg>
    </div>
  );
}
