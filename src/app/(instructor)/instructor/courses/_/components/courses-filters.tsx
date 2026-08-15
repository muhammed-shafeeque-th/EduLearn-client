'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';

interface CoursesFiltersProps {
  searchParams: {
    search?: string;
    category?: string;
    sort?: string;
    rating?: string;
  };
}

const categories = [
  'All Category',
  'Development',
  'Business',
  'Design',
  'Marketing',
  'Photography',
  'Music',
  'Health & Fitness',
];

const sortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'students', label: 'Most Students' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'revenue', label: 'Highest Revenue' },
];

const ratingOptions = [
  { value: 'all', label: 'All Ratings' },
  { value: '4.5', label: '4.5 Star & Up' },
  { value: '4.0', label: '4.0 Star & Up' },
  { value: '3.5', label: '3.5 Star & Up' },
];

export function CoursesFilters({ searchParams }: CoursesFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.search || '');

  const debouncedSearch = useDebounce(searchQuery, 300);

  const updateSearchParams = useCallback(
    (key: string, value: string) => {
      const newParams = new URLSearchParams(params.toString());

      if (value && value !== 'all' && value !== 'All Category') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }

      // Reset to first page when filtering
      if (key !== 'page') {
        newParams.delete('page');
      }

      const newUrl = newParams.toString() ? `?${newParams.toString()}` : '';
      router.push(`/instructor/courses${newUrl}`);
    },
    [params, router]
  );

  // Handle search with debounce
  useEffect(() => {
    updateSearchParams('search', debouncedSearch);
  }, [debouncedSearch, updateSearchParams]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search in your courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={searchParams.category || 'All Category'}
          onValueChange={(value) => updateSearchParams('category', value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.sort || 'latest'}
          onValueChange={(value) => updateSearchParams('sort', value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.rating || 'all'}
          onValueChange={(value) => updateSearchParams('rating', value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            {ratingOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
