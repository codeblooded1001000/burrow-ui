'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { cn } from '@/lib/utils/cn';
import { Spinner } from '@/components/ui/Spinner';

const buttonVariants = cva(
  'inline-flex w-full items-center justify-center gap-2 rounded-xl font-sans font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 disabled:cursor-not-allowed dark:focus-visible:ring-dark-teal/35 active:brightness-95 dark:active:brightness-110',
  {
    variants: {
      variant: {
        primary:
          'bg-teal text-cream hover:bg-teal-hover disabled:bg-[#D4CEC8] disabled:text-ink-tertiary disabled:hover:bg-[#D4CEC8] dark:bg-dark-teal dark:text-dark-bg dark:hover:bg-dark-teal-hover dark:disabled:bg-dark-border dark:disabled:text-dark-ink-tertiary dark:disabled:hover:bg-dark-border',
        secondary:
          'border border-teal bg-transparent text-teal hover:bg-teal-tint dark:border-dark-teal dark:text-dark-teal dark:hover:bg-dark-teal-tint',
        tertiary:
          'w-auto border-0 bg-transparent px-0 py-1 text-sm font-normal text-teal hover:underline disabled:no-underline dark:text-dark-teal',
      },
      size: {
        default: 'text-base',
        sm: 'text-sm',
      },
    },
    compoundVariants: [
      { variant: ['primary', 'secondary'], size: 'default', class: 'h-[52px] px-4' },
      { variant: ['primary', 'secondary'], size: 'sm', class: 'h-10 px-4' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

type Common = VariantProps<typeof buttonVariants> & {
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export type ButtonProps<T extends ElementType = 'button'> = Common &
  Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'> & {
    as?: T;
  };

export function Button<T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'default',
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps<T>) {
  const Comp = (as ?? 'button') as ElementType;
  const isNativeButton = Comp === 'button';
  const resolvedDisabled = Boolean(disabled || loading);

  const spinnerClass =
    variant === 'primary'
      ? 'text-cream dark:text-dark-bg'
      : 'text-teal dark:text-dark-teal';

  return (
    <Comp
      {...(rest as Record<string, unknown>)}
      className={cn(
        buttonVariants({ variant, size }),
        !isNativeButton && resolvedDisabled && 'pointer-events-none opacity-50',
        className,
      )}
      disabled={isNativeButton ? resolvedDisabled : undefined}
      aria-busy={loading || undefined}
      aria-disabled={!isNativeButton && resolvedDisabled ? true : undefined}
    >
      {loading && variant !== 'tertiary' ? <Spinner size={18} strokeClassName={spinnerClass} /> : null}
      {loading && variant === 'tertiary' ? (
        <span className="inline-flex items-center gap-2">
          <Spinner size={14} strokeClassName={spinnerClass} />
          {children}
        </span>
      ) : !loading ? (
        children
      ) : null}
    </Comp>
  );
}
