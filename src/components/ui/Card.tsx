import { cn } from '@/lib/utils/cn';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

type Common = {
  className?: string;
  children?: ReactNode;
};

type DefaultCardProps = Common &
  HTMLAttributes<HTMLDivElement> & {
    variant?: 'default';
    selected?: never;
    onSelect?: never;
  };

type SelectableCardProps = Common &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
    variant: 'selectable';
    selected?: boolean;
    onSelect?: () => void;
  };

export type CardProps = DefaultCardProps | SelectableCardProps;

export function Card(props: CardProps) {
  if (props.variant === 'selectable') {
    const { variant: _v, selected, onSelect, className, children, ...btnProps } = props;
    return (
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className={cn(
          'min-h-[7rem] w-full rounded-xl p-4 text-left font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 dark:focus-visible:ring-dark-teal/35',
          'bg-surface dark:bg-dark-surface',
          selected
            ? 'border-2 border-teal bg-teal-tint dark:border-dark-teal dark:bg-dark-teal-tint'
            : 'border border-border dark:border-dark-border',
          className,
        )}
        {...btnProps}
      >
        {children}
      </button>
    );
  }

  const { className, children, variant: _variant, ...divProps } = props as DefaultCardProps;
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface',
        className,
      )}
      {...divProps}
    >
      {children}
    </div>
  );
}
