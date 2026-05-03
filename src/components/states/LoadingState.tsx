import { Spinner } from '@/components/ui/Spinner';

type LoadingStateProps = {
  message?: string;
  className?: string;
};

export function LoadingState({ message = 'Loading…', className }: LoadingStateProps) {
  return (
    <div className={`flex min-h-[50vh] flex-col items-center justify-center gap-4 px-8 ${className ?? ''}`}>
      <Spinner size={48} strokeClassName="text-teal dark:text-dark-teal" />
      <p className="font-sans text-sm text-ink-secondary dark:text-dark-ink-secondary">{message}</p>
    </div>
  );
}
