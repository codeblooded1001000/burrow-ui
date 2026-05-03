import { cn } from '@/lib/utils/cn';
import { BackArrow } from '@/components/ui/BackArrow';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { ReactNode } from 'react';

type PhoneShellProps = {
  children: ReactNode;
  progress?: number;
  showProgress?: boolean;
  back?: boolean;
  onBack?: () => void;
  className?: string;
};

export function PhoneShell({
  children,
  progress = 0,
  showProgress = true,
  back = false,
  onBack,
  className,
}: PhoneShellProps) {
  return (
    <div
      className={cn(
        'relative mx-auto flex min-h-[844px] w-full max-w-[390px] flex-col overflow-hidden rounded-sm bg-cream dark:bg-dark-bg',
        className,
      )}
    >
      {showProgress && typeof progress === 'number' ? (
        <div className="pt-4">
          <ProgressBar progress={progress} />
        </div>
      ) : null}
      {back ? (
        <div className="px-6 pt-5">
          <BackArrow onClick={onBack} />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col px-6 pb-10 pt-2">{children}</div>
    </div>
  );
}
