'use client';

import { useCallback, useEffect, useId, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils/cn';

type OtpInputProps = {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  /** Called once when the code reaches 6 digits (controlled or uncontrolled). */
  onComplete?: (code: string) => void;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
};

const LEN = 6;

function toCells(raw: string): string[] {
  const digits = raw.replace(/\D/g, '').slice(0, LEN).split('');
  while (digits.length < LEN) digits.push('');
  return digits;
}

export function OtpInput({
  label,
  value: controlledValue,
  onChange,
  onComplete,
  className,
  disabled,
  'aria-label': ariaLabel = 'One-time code',
}: OtpInputProps) {
  const id = useId();
  const [internal, setInternal] = useState('');
  const isControlled = controlledValue !== undefined;
  const valueStr = isControlled ? (controlledValue ?? '') : internal;
  const cells = toCells(valueStr);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const lastCompleteRef = useRef<string | null>(null);

  useEffect(() => {
    if (!onComplete || valueStr.length !== LEN) {
      if (valueStr.length < LEN) lastCompleteRef.current = null;
      return;
    }
    if (lastCompleteRef.current === valueStr) return;
    lastCompleteRef.current = valueStr;
    onComplete(valueStr);
  }, [valueStr, onComplete]);

  const setValue = useCallback(
    (next: string) => {
      const normalized = next.replace(/\D/g, '').slice(0, LEN);
      if (!isControlled) setInternal(normalized);
      onChange?.(normalized);
    },
    [isControlled, onChange],
  );

  const handleChange = (i: number, raw: string) => {
    const v = raw.replace(/\D/g, '').slice(-1);
    const nextCells = [...cells];
    nextCells[i] = v;
    setValue(nextCells.join(''));
    if (v && i < LEN - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !cells[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LEN);
    if (!pasted) return;
    setValue(pasted);
    const last = Math.min(pasted.length, LEN) - 1;
    refs.current[Math.max(0, last)]?.focus();
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label ? (
        <span id={`${id}-label`} className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">
          {label}
        </span>
      ) : null}
      <div className="flex gap-2" role="group" aria-label={ariaLabel}>
        {Array.from({ length: LEN }, (_, i) => {
          const v = cells[i] ?? '';
          const filled = Boolean(v);
          return (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              disabled={disabled}
              value={v}
              aria-label={`Digit ${i + 1} of ${LEN}`}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className={cn(
                'h-14 min-w-0 flex-1 rounded-[10px] border bg-surface text-center font-sans text-xl font-medium text-ink-primary caret-teal outline-none transition-colors dark:bg-dark-surface dark:text-dark-ink-primary dark:caret-dark-teal',
                filled ? 'border-2 border-teal dark:border-dark-teal' : 'border border-border dark:border-dark-border',
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
