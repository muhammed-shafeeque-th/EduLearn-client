import { Textarea } from '@/components/ui/textarea';
import { memo, useCallback, useEffect, useState } from 'react';

interface BlurTextareaProps extends Omit<React.ComponentProps<'textarea'>, 'onChange' | 'value'> {
  value: string;
  onSave: (value: string) => void;
}

export const BlurTextarea = memo(({ value: initialValue, onSave, ...props }: BlurTextareaProps) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleBlur = useCallback(() => {
    if (value !== initialValue) {
      onSave(value);
    }
  }, [value, initialValue, onSave]);

  return (
    <Textarea
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
    />
  );
});

BlurTextarea.displayName = 'BlurTextarea';
