import { cn } from '@/lib/utils/cn';

const SIZE_CLASS = {
  16: 'text-base',
  24: 'text-2xl',
  32: 'text-[32px]',
  48: 'text-[48px]',
  72: 'text-[72px]',
} as const;

export type WordmarkSize = keyof typeof SIZE_CLASS;

type WordmarkProps = {
  size?: WordmarkSize;
  /** Tailwind color class, e.g. `text-teal` or `text-cream`. */
  colorClassName?: string;
  className?: string;
};

export function Wordmark({ size = 32, colorClassName = 'text-teal dark:text-dark-teal', className }: WordmarkProps) {
  return (
    <span
      className={cn(
        'block font-serif font-medium leading-none tracking-[-0.02em]',
        SIZE_CLASS[size],
        colorClassName,
        className,
      )}
    >
      burrow
    </span>
  );
}
