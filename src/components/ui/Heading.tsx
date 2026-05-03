import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

const SIZE_CLASS = {
  32: 'text-[32px] leading-[1.2]',
  28: 'text-[28px] leading-[1.2]',
  24: 'text-[24px] leading-[1.2]',
  22: 'text-[22px] leading-[1.25]',
  18: 'text-[18px] leading-[1.25]',
} as const;

export type HeadingSize = keyof typeof SIZE_CLASS;

type HeadingProps = {
  as?: 'h1' | 'h2' | 'h3';
  size?: HeadingSize;
  className?: string;
  children: ReactNode;
};

export function Heading({ as: Tag = 'h1', size = 28, className, children }: HeadingProps) {
  return (
    <Tag
      className={cn(
        'font-serif font-medium tracking-[-0.02em] text-ink-primary dark:text-dark-ink-primary',
        SIZE_CLASS[size],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
