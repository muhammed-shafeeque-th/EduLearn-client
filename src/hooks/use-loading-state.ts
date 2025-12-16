'use client';

import { useState, useEffect } from 'react';

interface UseLoadingStateOptions {
  initialLoading?: boolean;
  minLoadingTime?: number; // Minimum time to show loading
  delay?: number; // Delay before showing loading
}

export function useLoadingState({
  initialLoading = false,
  minLoadingTime = 1000,
  delay = 200,
}: UseLoadingStateOptions = {}) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let delayTimer: NodeJS.Timeout;
    let minTimer: NodeJS.Timeout;

    if (isLoading) {
      // Delay showing loading to prevent flash
      delayTimer = setTimeout(() => {
        setShowLoading(true);
      }, delay);

      // Ensure minimum loading time
      minTimer = setTimeout(() => {
        setShowLoading(false);
      }, delay + minLoadingTime);
    } else {
      setShowLoading(false);
    }

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(minTimer);
    };
  }, [isLoading, delay, minLoadingTime]);

  return {
    isLoading: showLoading,
    setLoading: setIsLoading,
    startLoading: () => setIsLoading(true),
    stopLoading: () => setIsLoading(false),
  };
}
