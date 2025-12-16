'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Hook to detect if the device is mobile based on window width.
 * @returns { isMobile: boolean }
 */
export function useMobile(): { isMobile: boolean } {
  const [isMobile, setIsMobile] = useState(false);

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return { isMobile };
}
