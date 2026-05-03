'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { getNameInitials } from '@/lib/utils/name-initials';

const SIZE_MAP = {
  32: 'h-8 w-8 text-xs',
  48: 'h-12 w-12 text-sm',
  64: 'h-16 w-16 text-base',
  80: 'h-20 w-20 text-lg',
  96: 'h-24 w-24 text-xl',
  120: 'h-[120px] w-[120px] text-2xl',
} as const;

export type AvatarSize = keyof typeof SIZE_MAP;

type AvatarProps = {
  src?: string | null;
  alt: string;
  fallbackLetter?: string;
  size?: AvatarSize;
  className?: string;
};

/** Uses `<img>` so user media works without Next/Image `remotePatterns` for every R2/CDN host. */
export function Avatar({ src, alt, fallbackLetter, size = 48, className }: AvatarProps) {
  const source = (fallbackLetter ?? alt).trim();
  const initials = source ? getNameInitials(source) : '?';
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [src]);

  if (src && !imgFailed) {
    return (
      <span
        className={cn(
          'relative inline-block overflow-hidden rounded-full bg-teal-tint ring-1 ring-border dark:bg-dark-teal-tint dark:ring-dark-border',
          SIZE_MAP[size],
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded URLs / blob previews */}
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-teal-tint font-serif font-medium text-teal ring-1 ring-border dark:bg-dark-teal-tint dark:text-dark-teal dark:ring-dark-border',
        SIZE_MAP[size],
        className,
      )}
      role="img"
      aria-label={alt}
    >
      {initials}
    </span>
  );
}
