import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
};

export function ErrorState({
  title = 'Something went wrong',
  description = 'Check your connection and try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={`flex min-h-[50vh] w-full flex-col items-center justify-center px-8 ${className ?? ''}`}
    >
      <div className="flex max-w-[280px] flex-col items-center gap-5 text-center">
        <svg
          width="88"
          height="88"
          viewBox="0 0 88 88"
          fill="none"
          className="text-terracotta dark:text-dark-terracotta"
          aria-hidden
        >
          <circle cx="44" cy="44" r="32" stroke="currentColor" strokeWidth="1.4" className="opacity-30" />
          <circle cx="44" cy="44" r="22" stroke="currentColor" strokeWidth="1.2" className="opacity-20" />
          <path d="M44 30v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="44" cy="54" r="1.5" fill="currentColor" />
          <path
            d="M24 68 Q44 56 64 68"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
            className="opacity-25"
          />
        </svg>
        <div className="flex flex-col gap-2">
          <Heading as="h2" size={22}>
            {title}
          </Heading>
          <p className="font-sans text-sm leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">
            {description}
          </p>
        </div>
        {onRetry ? (
          <div className="w-full pt-1">
            <Button type="button" variant="primary" onClick={onRetry}>
              Try again
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
