'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibleRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  readOnly?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function AccessibleRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = true,
  readOnly = true,
  onRatingChange,
  className,
}: AccessibleRatingProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5

  const handleKeyDown = (event: React.KeyboardEvent, starValue: number) => {
    if (readOnly || !onRatingChange) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRatingChange(starValue);
    }
  };

  const handleClick = (starValue: number) => {
    if (readOnly || !onRatingChange) return;
    onRatingChange(starValue);
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div
        className={cn('flex items-center', !readOnly && 'gap-1')}
        role={readOnly ? 'img' : 'radiogroup'}
        aria-label={readOnly ? `${rating} out of ${maxRating} stars` : 'Rate this course'}
      >
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.floor(roundedRating);
          const isHalfFilled = starValue === Math.ceil(roundedRating) && roundedRating % 1 !== 0;

          return (
            <button
              key={index}
              type="button"
              className={cn(
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded',
                readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
              )}
              disabled={readOnly}
              onClick={() => handleClick(starValue)}
              onKeyDown={(e) => handleKeyDown(e, starValue)}
              aria-label={
                readOnly ? undefined : `Rate ${starValue} star${starValue !== 1 ? 's' : ''}`
              }
              role={readOnly ? undefined : 'radio'}
              aria-checked={readOnly ? undefined : starValue <= rating}
              tabIndex={readOnly ? -1 : 0}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled || isHalfFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 dark:text-gray-600',
                  !readOnly && 'hover:text-yellow-400 transition-colors'
                )}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium ml-1" aria-hidden="true">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
