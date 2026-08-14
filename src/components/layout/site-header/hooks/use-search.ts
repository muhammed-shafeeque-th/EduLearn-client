'use client';

import { useDebounce } from '@/hooks/use-debounce';
import { ROUTES } from '@/lib/constants/routes';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

export function useSearch() {
  const [query, setQuery] = useState('');
  // const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleClear = () => {
    setQuery('');
  };

  // Debounce the search value (e.g., 400ms)
  const debouncedSearch = useDebounce(query, 400);

  // Debounced submit handler
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (debouncedSearch.trim()) {
        router.push(
          `${ROUTES.public.courses.root}?q=${encodeURIComponent(debouncedSearch.trim())}`
        );
      }
    },
    [debouncedSearch, router]
  );

  return { handleClear, handleSubmit, setQuery, query };
}
