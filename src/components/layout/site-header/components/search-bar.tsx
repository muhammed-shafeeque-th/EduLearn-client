'use client';

import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../hooks/use-search';

// Use more documented and flexible prop typing
type SearchBarProps = React.ComponentProps<'div'> & {
  className?: string;
};

export function SearchBar({ className, ...props }: SearchBarProps) {
  // Optionally expose focus state for future
  const [, setIsFocused] = useState(false);
  const { handleClear, handleSubmit, query, setQuery } = useSearch();

  // Stable event handlers using useCallback
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
    [setQuery]
  );

  // Accessibility: add aria-labels, button titles, roles where relevant
  return (
    <div className={className} {...props}>
      <form
        onSubmit={handleSubmit}
        className="relative"
        role="search"
        aria-label="Search courses form"
        autoComplete="off"
      >
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search courses"
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="pl-10 pr-10 w-full appearance-none"
            aria-label="Search courses"
            autoComplete="off"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                key="clear"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
                title="Clear search"
                tabIndex={0}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}
