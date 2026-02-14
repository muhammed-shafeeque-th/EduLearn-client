import { ChevronDown, ChevronUp, Star, X } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { CourseFilters } from '../types';
import { CourseLevel } from '@/types/course';

const categories = [
  { name: 'Development', count: 12 },
  { name: 'Web Development', count: 8 },
  { name: 'Data Science', count: 6 },
  { name: 'Mobile Development', count: 10 },
  { name: 'Software Testing', count: 2 },
  { name: 'Programming Languages', count: 4 },
];

const ratings = [
  { name: '4 Star & Up', value: '4' },
  { name: '3 Star & Up', value: '3' },
  { name: '2 Star & Up', value: '2' },
  { name: '1 Star & Up', value: '1' },
];

const levels: { name: string; value: CourseLevel }[] = [
  { name: 'All Level', value: 'all levels' },
  { name: 'Beginner', value: 'beginner' },
  { name: 'Intermediate', value: 'intermediate' },
  { name: 'Advanced', value: 'advanced' },
];

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

const FilterSection = memo(({ title, children, isExpanded, onToggle }: FilterSectionProps) => (
  <div className="mb-6">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center font-semibold text-sm mb-3 hover:text-blue-600 transition-colors"
    >
      {title}
      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </button>
    {isExpanded && <div className="space-y-2">{children}</div>}
  </div>
));

FilterSection.displayName = 'FilterSection';

interface CoursesSidebarProps {
  filters: CourseFilters;
  onFiltersChange: (filters: Partial<CourseFilters>) => void;
  onClearAll: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export const CoursesSidebar = memo(function CoursesSidebar({
  filters,
  onFiltersChange,
  onClearAll,
  isMobile,
  onClose,
}: CoursesSidebarProps) {
  const [expanded, setExpanded] = useState({
    category: true,
    rating: true,
    level: true,
    price: true,
  });

  const toggleSection = useCallback((section: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

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
    (level: CourseLevel) => {
      const newLevels = filters.level.includes(level)
        ? filters.level.filter((l) => l !== level)
        : [...filters.level, level];
      onFiltersChange({ level: newLevels });
    },
    [filters.level, onFiltersChange]
  );

  const handlePriceChange = useCallback(
    (values: number[]) => {
      onFiltersChange({
        price: { ...filters.price, min: values[0], max: values[1] },
      });
    },
    [filters.price, onFiltersChange]
  );

  return (
    <div
      className={`${isMobile ? 'fixed inset-0 z-50 bg-white' : 'w-80 border-r'} p-6 overflow-y-auto`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Filters</span>
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            {filters.categories.length + filters.rating.length + filters.level.length}
          </span>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <FilterSection
        title="CATEGORY"
        isExpanded={expanded.category}
        onToggle={() => toggleSection('category')}
      >
        {categories.map((cat) => (
          <label
            key={cat.name}
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat.name)}
                onChange={() => handleCategoryChange(cat.name)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">{cat.name}</span>
            </div>
            <span className="text-xs text-gray-500">{cat.count}</span>
          </label>
        ))}
      </FilterSection>

      <div className="border-t my-4" />

      <FilterSection
        title="RATING"
        isExpanded={expanded.rating}
        onToggle={() => toggleSection('rating')}
      >
        {ratings.map((rating) => (
          <label
            key={rating.value}
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.rating.includes(rating.value)}
                aria-label={`Filter by ${rating.name} rating`}
                onChange={() => handleRatingChange(rating.value)}
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < parseInt(rating.value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-sm ml-1">{rating.name}</span>
              </div>
            </div>
          </label>
        ))}
      </FilterSection>

      <div className="border-t my-4" />

      <FilterSection
        title="COURSE LEVEL"
        isExpanded={expanded.level}
        onToggle={() => toggleSection('level')}
      >
        {levels.map((level) => (
          <label
            key={level.name}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
          >
            <input
              type="checkbox"
              checked={filters.level.includes(level.value)}
              onChange={() => handleLevelChange(level.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">{level.name}</span>
          </label>
        ))}
      </FilterSection>

      <div className="border-t my-4" />

      <FilterSection
        title="PRICE"
        isExpanded={expanded.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>${filters.price.min}</span>
              <span>${filters.price.max}+</span>
            </div>
            <input
              type="range"
              min="0"
              max="4500"
              value={filters.price.max}
              onChange={(e) => handlePriceChange([filters.price.min, parseInt(e.target.value)])}
              className="w-full"
            />
          </div>
          {/* <label className="flex items-center justify-between">
            <span className="text-sm">Free</span>
            <input
              type="checkbox"
              checked={filters.price.free}
              onChange={(e) =>
                onFiltersChange({
                  price: { ...filters.price, free: e.target.checked },
                })
              }
              className="w-4 h-4 text-blue-600"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm">Paid</span>
            <input
              type="checkbox"
              checked={filters.price.paid}
              onChange={(e) =>
                onFiltersChange({
                  price: { ...filters.price, paid: e.target.checked },
                })
              }
              className="w-4 h-4 text-blue-600"
            />
          </label> */}
        </div>
      </FilterSection>

      <button
        onClick={onClearAll}
        className="w-full mt-8 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
});
