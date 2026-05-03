'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      disabled={!mounted}
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink-primary transition-colors hover:bg-teal-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 disabled:opacity-60 dark:border-dark-border dark:bg-dark-surface dark:text-dark-ink-primary dark:hover:bg-dark-teal-tint dark:focus-visible:ring-dark-teal/35',
        className,
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {!mounted ? <span className="h-5 w-5" aria-hidden /> : isDark ? <Sun className="h-5 w-5" strokeWidth={1.75} aria-hidden /> : <Moon className="h-5 w-5" strokeWidth={1.75} aria-hidden />}
    </button>
  );
}
