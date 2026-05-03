'use client';

import * as Slider from '@radix-ui/react-slider';
import { cn } from '@/lib/utils/cn';

type RangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onValueChange: (v: [number, number]) => void;
  className?: string;
};

export function RangeSlider({ min, max, step = 1000, value, onValueChange, className }: RangeSliderProps) {
  return (
    <Slider.Root
      className={cn('relative flex h-8 w-full touch-none select-none items-center', className)}
      min={min}
      max={max}
      step={step}
      value={value}
      minStepsBetweenThumbs={1}
      onValueChange={(v: number[]) => {
        if (v.length === 2) onValueChange([v[0] ?? min, v[1] ?? max]);
      }}
    >
      <Slider.Track className="relative h-1.5 grow rounded-full bg-border dark:bg-dark-border">
        <Slider.Range className="absolute h-full rounded-full bg-teal dark:bg-dark-teal" />
      </Slider.Track>
      <Slider.Thumb
        className="block h-4 w-4 rounded-full border-2 border-teal bg-surface shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 dark:border-dark-teal dark:bg-dark-surface dark:focus-visible:ring-dark-teal/40"
        aria-label="Minimum"
      />
      <Slider.Thumb
        className="block h-4 w-4 rounded-full border-2 border-teal bg-surface shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 dark:border-dark-teal dark:bg-dark-surface dark:focus-visible:ring-dark-teal/40"
        aria-label="Maximum"
      />
    </Slider.Root>
  );
}
