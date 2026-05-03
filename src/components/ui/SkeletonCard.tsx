import { cn } from '@/lib/utils/cn';
import { Skeleton } from '@/components/ui/Skeleton';

type SkeletonCardProps = {
  className?: string;
};

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'flex gap-3.5 rounded-xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface',
        className,
      )}
    >
      <Skeleton width={52} height={52} radius={26} className="shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
        <Skeleton width="65%" height={14} radius={6} />
        <Skeleton width="40%" height={11} radius={6} />
        <div className="mt-1 flex gap-2">
          <Skeleton width={72} height={24} radius={100} />
          <Skeleton width={60} height={24} radius={100} />
        </div>
      </div>
    </div>
  );
}
