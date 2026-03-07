'use client';

import { Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface RatingChartProps {
  averageRating: number;
  ratingsBreakdown: { [key: number]: number };
  totalRatings: number;
}

export function RatingChart({ averageRating, ratingsBreakdown, totalRatings }: RatingChartProps) {
  return (
    <div className="space-y-4">
      {/* Rating Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.floor(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : star === Math.ceil(averageRating) && averageRating % 1 >= 0.5
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {totalRatings.toLocaleString()} {totalRatings === 1 ? 'rating' : 'ratings'}
        </div>
      </div>

      {/* Rating Breakdown */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingsBreakdown[rating] || 0;
          const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

          return (
            <div key={rating} className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-1 w-12">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{rating}</span>
              </div>
              <Progress value={percentage} className="flex-1 h-2" />
              <span className="w-16 text-right text-muted-foreground">
                {count} ({percentage.toFixed(0)}%)
              </span>
            </div>
          );
        })}
      </div>

      {totalRatings === 0 && (
        <p className="text-center text-sm text-muted-foreground pt-2">No ratings yet.</p>
      )}
    </div>
  );
}
