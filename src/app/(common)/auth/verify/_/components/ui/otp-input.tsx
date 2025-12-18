'use client';

import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  value: string[];
  onChange: (index: number, value: string) => void;
  onKeyDown?: (index: number, e: React.KeyboardEvent) => void;
  onPaste?: (e: React.ClipboardEvent) => void;
  className?: string;
  inputClassName?: string;
  error?: boolean;
}

export const OTPInput = forwardRef<HTMLDivElement, OTPInputProps>(
  (
    {
      length = 6,
      value,
      onChange,
      onKeyDown,
      onPaste,
      className,
      inputClassName,
      error = false,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('flex justify-center space-x-2', className)} {...props}>
        {Array.from({ length }, (_, index) => (
          <Input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => onChange(index, e.target.value)}
            onKeyDown={(e) => onKeyDown?.(index, e)}
            onPaste={onPaste}
            className={cn(
              'w-12 h-12 text-center text-lg font-bold border-2',
              value[index]
                ? 'border-green-500 bg-green-50 dark:bg-green-950'
                : 'border-gray-300 dark:border-gray-600',
              error && 'border-red-500',
              inputClassName
            )}
          />
        ))}
      </div>
    );
  }
);

OTPInput.displayName = 'OTPInput';
