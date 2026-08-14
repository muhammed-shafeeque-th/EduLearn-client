'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Review } from '@/types/review';
import { ReviewCard } from './instructor-review-card';

interface InstructorReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export function InstructorReviews({
  reviews,
  averageRating,
  totalReviews,
}: InstructorReviewsProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [filterRating, setFilterRating] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const ratingDistribution = useMemo(() => {
    const distribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: reviews.filter((review) => Math.floor(review.rating) === stars).length,
      percentage:
        (reviews.filter((review) => Math.floor(review.rating) === stars).length / reviews.length) *
        100,
    }));
    return distribution;
  }, [reviews]);

  const filteredAndSortedReviews = useMemo(() => {
    let filtered = [...reviews];

    // Filter by rating
    if (filterRating !== 'all') {
      const rating = parseInt(filterRating);
      filtered = filtered.filter((review) => Math.floor(review.rating) === rating);
    }

    // Sort reviews
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [reviews, filterRating, sortBy]);

  const displayedReviews = showAllReviews
    ? filteredAndSortedReviews
    : filteredAndSortedReviews.slice(0, 6);

  if (!reviews || reviews.length === 0) {
    return (
      <div className="py-20 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
            <Star className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Student Feedback
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            No reviews available yet for this instructor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-24 border-t border-slate-200 dark:border-slate-800 relative">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Rating Summary */}
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-blue-500" />
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                  Student Feedback
                </h2>
              </div>

              <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <div className="text-center space-y-2 mb-8">
                  <p className="text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    {averageRating.toFixed(1)}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 py-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-6 h-6',
                          i < Math.floor(averageRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 dark:text-slate-700'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Instructor Rating ({totalReviews.toLocaleString()} REVIEWS)
                  </p>
                </div>

                <div className="space-y-4">
                  {ratingDistribution.map((item) => (
                    <div key={item.stars} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                          {item.stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </span>
                        <span className="text-slate-400">{item.count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-blue-600 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-600" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                  Filter Reviews
                </h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
                    htmlFor="filter-rating"
                  >
                    Rating
                  </label>
                  <Select value={filterRating} onValueChange={setFilterRating}>
                    <SelectTrigger
                      id="filter-rating"
                      className="h-14 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-700 dark:text-slate-200"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2">
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
                    htmlFor="sort-by"
                  >
                    Sort Sequence
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger
                      id="sort-by"
                      className="h-14 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-700 dark:text-slate-200"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2">
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="highest">Highest Rated</SelectItem>
                      <SelectItem value="lowest">Lowest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-8 space-y-12">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-8">
              <div className="space-y-1">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Showing
                </p>
                <p className="text-xl font-black text-slate-900 dark:text-white">
                  {displayedReviews.length} of {filteredAndSortedReviews.length} Reviews
                </p>
              </div>
              {filterRating !== 'all' && (
                <Badge className="bg-blue-600 text-white border-transparent px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
                  {filterRating} star{filterRating !== '1' ? 's' : ''} only
                </Badge>
              )}
            </div>

            <div className="space-y-8">
              {displayedReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ReviewCard review={review} />
                </motion.div>
              ))}
            </div>

            {!showAllReviews && filteredAndSortedReviews.length > 6 && (
              <div className="pt-12 flex justify-center">
                <Button
                  onClick={() => setShowAllReviews(true)}
                  size="lg"
                  className="h-14 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/20"
                >
                  Load All Reviews ({filteredAndSortedReviews.length - 6} Remaining)
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
