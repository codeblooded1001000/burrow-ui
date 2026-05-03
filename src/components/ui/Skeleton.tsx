import { cn } from '@/lib/utils/cn';

type SkeletonProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
  radius?: number;
};

export function Skeleton({ className, width = '100%', height = 14, radius = 6 }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-burrow-shimmer bg-[length:800px_100%] bg-[linear-gradient(90deg,#EDE8E0_25%,#F5F1EA_50%,#EDE8E0_75%)] dark:bg-[linear-gradient(90deg,#2A3936_25%,#1B2A28_50%,#2A3936_75%)]',
        className,
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: `${radius}px`,
      }}
    />
  );
}
