'use client';

import { useCallback, useMemo } from 'react';
import { CourseFilters } from '../types';

interface UseOptimizedFiltersOptions {
  filters: CourseFilters;
  onFiltersChange: (filters: Partial<CourseFilters>) => void;
}

export function useOptimizedFilters({ filters, onFiltersChange }: UseOptimizedFiltersOptions) {
  const handleCategoryChange = useCallback(
    (category: string) => {
      const newCategories = filters.categories.includes(category)
        ? filters.categories.filter((c) => c !== category)
        : [...filters.categories, category];
      onFiltersChange({ categories: newCategories });
    },
    [filters.categories, onFiltersChange]
  );

  const handleRatingChange = useCallback(
    (rating: string) => {
      const newRatings = filters.rating.includes(rating)
        ? filters.rating.filter((r) => r !== rating)
        : [...filters.rating, rating];
      onFiltersChange({ rating: newRatings });
    },
    [filters.rating, onFiltersChange]
  );

  const handleLevelChange = useCallback(
    (level: string) => {
      const newLevels = filters.level.includes(level)
        ? filters.level.filter((l) => l !== level)
        : [...filters.level, level];
      onFiltersChange({ level: newLevels });
    },
    [filters.level, onFiltersChange]
  );

  const handlePriceChange = useCallback(
    (min: number, max: number) => {
      onFiltersChange({
        price: { ...filters.price, min, max },
      });
    },
    [filters.price, onFiltersChange]
  );

  const handlePriceToggle = useCallback(
    (type: 'free' | 'paid', value: boolean) => {
      onFiltersChange({
        price: { ...filters.price, [type]: value },
      });
    },
    [filters.price, onFiltersChange]
  );

  const activeFiltersCount = useMemo(() => {
    return (
      filters.categories.length +
      filters.rating.length +
      filters.level.length +
      (filters.price.free ? 1 : 0) +
      (filters.price.paid ? 1 : 0)
    );
  }, [filters]);

  return {
    handleCategoryChange,
    handleRatingChange,
    handleLevelChange,
    handlePriceChange,
    handlePriceToggle,
    activeFiltersCount,
  };
}
