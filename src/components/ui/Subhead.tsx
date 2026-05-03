import { cn } from '@/lib/utils/cn';

type SubheadProps = {
  className?: string;
  children: React.ReactNode;
};

export function Subhead({ className, children }: SubheadProps) {
  return (
    <p
      className={cn(
        'font-sans text-base font-normal leading-[1.55] text-ink-secondary dark:text-dark-ink-secondary',
        className,
      )}
    >
      {children}
    </p>
  );
}
