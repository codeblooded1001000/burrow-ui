import { cn } from '@/lib/utils/cn';

type PhotoUploaderProps = {
  label?: string;
  className?: string;
  inputId?: string;
};

export function PhotoUploader({ label = 'Add photo', className, inputId = 'photo-upload' }: PhotoUploaderProps) {
  return (
    <label
      htmlFor={inputId}
      className={cn(
        'flex h-[120px] w-[120px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-full border-2 border-dashed border-teal/90 bg-transparent dark:border-dark-teal/90',
        className,
      )}
    >
      <input id={inputId} type="file" accept="image/*" className="sr-only" />
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-teal opacity-60 dark:text-dark-teal" aria-hidden>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="font-sans text-xs font-medium text-teal dark:text-dark-teal">{label}</span>
    </label>
  );
}
