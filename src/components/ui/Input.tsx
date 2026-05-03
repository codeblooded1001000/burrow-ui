'use client';

import { forwardRef, useId, useState, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { Spinner } from '@/components/ui/Spinner';

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label: string;
  microcopy?: string;
  error?: string;
  loading?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, microcopy, error, loading, className, id, disabled, onFocus, onBlur, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={inputId} className="font-sans text-sm font-normal leading-snug text-ink-secondary dark:text-dark-ink-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : microcopy ? `${inputId}-hint` : undefined}
          disabled={disabled || loading}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          className={cn(
            'h-14 w-full rounded-xl border bg-surface px-4 font-sans text-base text-ink-primary outline-none transition-[border-color,box-shadow] placeholder:text-ink-tertiary dark:bg-dark-surface dark:text-dark-ink-primary dark:placeholder:text-dark-ink-tertiary',
            loading && 'pr-12',
            hasError
              ? 'border-2 border-terracotta shadow-[0_0_0_4px_rgba(197,87,61,0.13)] dark:border-dark-terracotta dark:shadow-[0_0_0_4px_rgba(216,122,96,0.12)]'
              : focused
                ? 'border-2 border-teal shadow-[0_0_0_4px_rgba(26,95,90,0.30)] dark:border-dark-teal dark:shadow-[0_0_0_4px_rgba(91,168,158,0.35)]'
                : 'border border-border dark:border-dark-border',
          )}
          {...props}
        />
        {loading ? (
          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2" aria-hidden>
            <Spinner size={18} strokeClassName="text-teal dark:text-dark-teal" />
          </div>
        ) : null}
      </div>
      {hasError ? (
        <p id={errorId} className="flex items-start gap-1.5 font-sans text-xs leading-snug text-terracotta dark:text-dark-terracotta" role="alert">
          <svg className="mt-0.5 shrink-0" width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
            <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7 4.5v3.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="7" cy="10" r="0.8" fill="currentColor" />
          </svg>
          {error}
        </p>
      ) : microcopy ? (
        <span id={`${inputId}-hint`} className="font-sans text-xs leading-normal text-ink-tertiary dark:text-dark-ink-tertiary">
          {microcopy}
        </span>
      ) : null}
    </div>
  );
});
