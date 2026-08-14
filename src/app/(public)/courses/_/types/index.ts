import { CourseLevel } from '@/types/course';

export type ViewMode = 'grid' | 'list';

export interface CourseFilters {
  categories: string[];
  rating: string[];
  level: CourseLevel[];
  price: {
    min: number;
    max: number;
    free: boolean;
    paid: boolean;
  };
}

export const mockSuggestions = [
  'user interface',
  'user experience',
  'web design',
  'interface',
  'ux',
];

export const categories = [
  { name: 'Development', count: 12, color: 'text-blue-600' },
  { name: 'Web Development', count: 8 },
  { name: 'Data Science', count: 6 },
  { name: 'Mobile Development', count: 10 },
  { name: 'Software Testing', count: 2 },
  { name: 'Programming Languages', count: 4 },
];

export const ratings = [
  { name: '4 Star & Up', count: 1245, value: 4 },
  { name: '3 Star & Up', count: 1456, value: 3 },
  { name: '2 Star & Up', count: 1456, value: 2 },
  { name: '1 Star & Up', count: 1456, value: 1 },
];

export const levels = [
  { name: 'All Level', count: 1456 },
  { name: 'Beginner', count: 1456 },
  { name: 'Intermediate', count: 1034 },
  { name: 'Expert', count: 1456 },
];

export const sortOptions = [
  { value: 'trending', label: 'Trending' },
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];
