'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Review } from '@/types/review';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHelpful, setIsHelpful] = useState(false);

  const handleHelpfulClick = () => {
    setIsHelpful(!isHelpful);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-blue-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[32px] shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-500 hover:border-blue-500/30">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar Area */}
          <div className="shrink-0">
            <div className="relative group/avatar">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-0 group-hover/avatar:opacity-20 transition-opacity" />
              <div className="relative w-16 h-16 rounded-full p-1 border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-lg">
                {review.avatar && !imageError ? (
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover rounded-full"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                    <User size={24} className="text-slate-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {review.name}
                </h4>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-3 h-3',
                          i < Math.floor(review.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 dark:text-slate-700'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {review.verified && (
                <div className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-800">
                  <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                  Verified Student
                </div>
              )}
            </div>

            <div className="relative">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-base">
                &ldquo;{review.comment.replace(/'/g, '&apos;')}&rdquo;
              </p>
            </div>

            {review.courseName && (
              <div className="pt-2">
                <Badge
                  variant="secondary"
                  className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest"
                >
                  Course: {review.courseName}
                </Badge>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHelpfulClick}
                className={cn(
                  'h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest transition-all',
                  isHelpful
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                )}
              >
                <ThumbsUp className={cn('w-3.5 h-3.5 mr-2', isHelpful && 'fill-white')} />
                Helpful {review.helpfulCount > 0 && `(${review.helpfulCount})`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
