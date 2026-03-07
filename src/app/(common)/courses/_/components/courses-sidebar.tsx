import { ChevronDown, ChevronUp, Star, X } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { CourseFilters } from '../types';
import { CourseLevel } from '@/types/course';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
  <div className="mb-6 last:mb-0">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground/70 mb-4 hover:text-primary transition-colors group"
    >
      {title}
      <div className="p-1 rounded-md group-hover:bg-primary/10 transition-colors">
        {isExpanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </div>
    </button>
    {isExpanded && (
      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
        {children}
      </div>
    )}
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

  const totalActiveFilters =
    filters.categories.length + filters.rating.length + filters.level.length;

  return (
    <div
      className={cn(
        'h-full flex flex-col',
        isMobile ? 'fixed inset-0 z-50 bg-background' : 'w-72 bg-card/30'
      )}
    >
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-lg tracking-tight">Filters</h2>
          {totalActiveFilters > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm shadow-primary/20">
              {totalActiveFilters}
            </span>
          )}
        </div>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <FilterSection
          title="Categories"
          isExpanded={expanded.category}
          onToggle={() => toggleSection('category')}
        >
          {categories.map((cat) => (
            <label
              key={cat.name}
              className="group flex items-center justify-between cursor-pointer py-1.5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat.name)}
                    onChange={() => handleCategoryChange(cat.name)}
                    className="peer h-4 w-4 shrink-0 rounded border border-border bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 accent-primary! cursor-pointer text-primary"
                  />
                </div>
                <span
                  className={cn(
                    'text-sm transition-colors',
                    filters.categories.includes(cat.name)
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {cat.name}
                </span>
              </div>
              {/* <span className="text-[10px] font-bold text-muted-foreground/50 bg-muted/50 px-1.5 py-0.5 rounded uppercase">
                {cat.count}
              </span> */}
            </label> 
          ))}
        </FilterSection>

        <div className="h-px bg-border/50 my-6" />

        <FilterSection
          title="Rating"
          isExpanded={expanded.rating}
          onToggle={() => toggleSection('rating')}
        >
          {ratings.map((rating) => (
            <label
              key={rating.value}
              className="group flex items-center gap-3 cursor-pointer py-1.5"
            >
              <input
                type="checkbox"
                checked={filters.rating.includes(rating.value)}
                onChange={() => handleRatingChange(rating.value)}
                className="h-4 w-4 shrink-0 rounded border border-border accent-primary! cursor-pointer"
              />
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3.5 w-3.5 transition-all',
                      i < parseInt(rating.value)
                        ? 'fill-yellow-400 text-yellow-400 group-hover:scale-110'
                        : 'text-muted-foreground/30'
                    )}
                  />
                ))}
                <span
                  className={cn(
                    'text-sm ml-1',
                    filters.rating.includes(rating.value)
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {rating.name}
                </span>
              </div>
            </label>
          ))}
        </FilterSection>

        <div className="h-px bg-border/50 my-6" />

        <FilterSection
          title="Course Level"
          isExpanded={expanded.level}
          onToggle={() => toggleSection('level')}
        >
          {levels.map((level) => (
            <label key={level.name} className="group flex items-center gap-3 cursor-pointer py-1.5">
              <input
                type="checkbox"
                checked={filters.level.includes(level.value)}
                onChange={() => handleLevelChange(level.value)}
                className="h-4 w-4 shrink-0 rounded border border-border accent-primary! cursor-pointer"
              />
              <span
                className={cn(
                  'text-sm',
                  filters.level.includes(level.value)
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              >
                {level.name}
              </span>
            </label>
          ))}
        </FilterSection>

        <div className="h-px bg-border/50 my-6" />

        <FilterSection
          title="Price Range"
          isExpanded={expanded.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="pt-2 px-1">
            <div className="flex justify-between items-end mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                  Min Price
                </span>
                <span className="text-sm font-bold text-primary">₹{filters.price.min}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                  Max Price
                </span>
                <span className="text-sm font-bold">₹{filters.price.max}+</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="4500"
              step="50"
              value={filters.price.max}
              onChange={(e) => handlePriceChange([filters.price.min, parseInt(e.target.value)])}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </FilterSection>
      </div>

      <div className="p-6 border-t border-border/50 bg-background/50">
        <Button
          variant="outline"
          onClick={onClearAll}
          className="w-full font-bold text-xs uppercase tracking-widest border-2 hover:bg-muted"
        >
          Reset All Filters
        </Button>
      </div>
    </div>
  );
});
