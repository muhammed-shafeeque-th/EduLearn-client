import { debounce } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

export function useMediaQuery(query: string, options?: { debounce?: number }): boolean {
  const { debounce: debounceMs = 100 } = options || {};
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches
  );
  const mediaQueryListRef = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    mediaQueryListRef.current = media;

    const update = () => setMatches(media.matches);
    const debouncedUpdate = debounce(update, debounceMs);

    // Set state initially
    setMatches(media.matches);

    if (media.addEventListener) {
      media.addEventListener('change', debouncedUpdate);
    } else {
      // For older browsers
      media.addListener(debouncedUpdate);
    }

    return () => {
      media.removeEventListener('change', debouncedUpdate);
    };
    // Only rerun effect if query or debounceMs changes
  }, [query, debounceMs]);

  return matches;
}
