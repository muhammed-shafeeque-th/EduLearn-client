'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';

interface BlurInputProps extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value'> {
  value: string | number;
  onSave: (value: string) => void;
}

export const BlurInput = React.memo(({ value: initialValue, onSave, ...props }: BlurInputProps) => {
  const [value, setValue] = useState(initialValue);

  // Sync internal state if external parent (React Hook Form) updates
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleBlur = useCallback(() => {
    // Only fire update if value actually changed
    if (value !== initialValue) {
      onSave(value.toString());
    }
  }, [value, initialValue, onSave]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <Input
      {...props}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        props.onKeyDown?.(e);
      }}
    />
  );
});

BlurInput.displayName = 'BlurInput';
