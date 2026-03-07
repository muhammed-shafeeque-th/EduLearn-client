'use client';

import { useEffect, useRef, useState } from 'react';

export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestValue = useRef<T>(value);

  useEffect(() => {
    latestValue.current = value;
    const now = Date.now();
    const remaining = delay - (now - lastExecuted.current);

    if (remaining <= 0) {
      setThrottledValue(latestValue.current);
      lastExecuted.current = now;
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setThrottledValue(latestValue.current);
        lastExecuted.current = Date.now();
        timeoutRef.current = null;
      }, remaining);
    }

    // Cleanup timer on unmount or value/delay change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [value, delay]);

  return throttledValue;
}
