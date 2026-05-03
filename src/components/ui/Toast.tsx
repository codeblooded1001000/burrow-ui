'use client';

import { Toaster as SonnerToaster, toast } from 'sonner';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export { toast };

export function Toaster() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SonnerToaster
      theme={mounted ? (resolvedTheme === 'dark' ? 'dark' : 'light') : 'light'}
      position="top-center"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex w-full max-w-[342px] items-center gap-2.5 rounded-xl px-4 py-3 font-sans text-sm shadow-[0_4px_16px_rgba(0,0,0,0.10)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.35)]',
          title: 'font-normal leading-snug text-ink-primary dark:text-dark-ink-primary',
          description: 'text-ink-secondary dark:text-dark-ink-secondary',
          actionButton:
            'shrink-0 rounded-lg border border-border bg-cream px-3 py-1.5 text-sm font-medium text-teal hover:bg-[#E2EBE9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 dark:border-dark-border dark:bg-[#243432] dark:text-dark-teal dark:hover:bg-[#2D4542]',
          cancelButton: 'hidden',
          closeButton: 'hidden',
          default:
            'border border-border border-l-[3px] border-l-ink-tertiary bg-surface text-ink-primary dark:border-dark-border dark:border-l-dark-ink-tertiary dark:bg-dark-surface dark:text-dark-ink-primary',
          success:
            '!border-forest/25 !border-l-forest border border-l-[3px] !bg-[#EAF4EF] text-ink-primary dark:!border-dark-forest/35 dark:!border-l-dark-forest dark:!bg-[#1A2A24] dark:text-dark-ink-primary',
          error:
            '!border-terracotta/25 !border-l-terracotta border border-l-[3px] !bg-[#FCEEEB] text-ink-primary dark:!border-dark-terracotta/35 dark:!border-l-dark-terracotta dark:!bg-[#2A1F1C] dark:text-dark-ink-primary',
          info:
            '!border-teal/25 !border-l-teal border border-l-[3px] !bg-[#ECF3F2] text-ink-primary dark:!border-dark-teal/35 dark:!border-l-dark-teal dark:!bg-[#1A2524] dark:text-dark-ink-primary',
          warning:
            '!border-ink-tertiary/40 !border-l-ink-secondary border border-l-[3px] !bg-cream text-ink-primary dark:!border-dark-ink-tertiary/50 dark:!border-l-dark-ink-secondary dark:!bg-[#252018] dark:text-dark-ink-primary',
          loading:
            '!border-border border !bg-surface text-ink-primary dark:!border-dark-border dark:!bg-dark-surface dark:text-dark-ink-primary',
        },
      }}
    />
  );
}
