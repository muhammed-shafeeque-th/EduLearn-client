'use client';

import { useState, memo, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Users, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CartItem as CartItemType } from '@/types/cart';
import { cn, formatPrice } from '@/lib/utils';

// --- Helper Mappings ---
const LEVEL_COLORS: Record<string, string> = {
  Beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

interface CartItemProps {
  item: CartItemType;
  onRemove: () => void;
  isRemoving: boolean;
}

export const CartItem = memo(({ item, onRemove, isRemoving }: CartItemProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { course } = item;

  const formattedReviewCount = useMemo(() => {
    const count = course.students;
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${Math.round(count / 1_000)}K`;
    return count?.toString();
  }, [course.students]);

  const discountPercentage = useMemo(() => {
    if (course.price && course.price > course.discountPrice) {
      return Math.round(((course.price - course.discountPrice) / course.price) * 100);
    }
    return null;
  }, [course.price, course.discountPrice]);

  const levelColor = LEVEL_COLORS[course.level] || LEVEL_COLORS['Beginner'];

  const handleImageLoad = useCallback(() => setImageLoaded(true), []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, x: -50 }}
      transition={{ type: 'spring', stiffness: 150, damping: 20 }}
    >
      <Card className="overflow-hidden hover:shadow-md dark:hover:shadow-lg transition-all duration-300 rounded-2xl">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* --- Thumbnail --- */}
            <div className="relative w-full sm:w-48 h-36 overflow-hidden">
              <Link href={`/courses/${course.id}`} className="block relative w-full h-full">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-muted animate-pulse rounded-none" />
                )}
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  priority={false}
                  className={cn(
                    'object-cover transition-transform duration-500 ease-in-out hover:scale-105',
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                  onLoad={handleImageLoad}
                  sizes="(max-width: 640px) 100vw, 192px"
                />
              </Link>

              {/* --- Badges --- */}
              <div className="absolute bottom-2 left-2">
                <Badge variant="secondary" className={cn('text-xs font-medium', levelColor)}>
                  {course.level}
                </Badge>
              </div>

              {discountPercentage && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-red-500 text-white text-xs font-semibold">
                    {discountPercentage}% OFF
                  </Badge>
                </div>
              )}
            </div>

            {/* --- Details --- */}
            <div className="flex-1 p-4 flex flex-col">
              {/* --- Rating --- */}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-muted-foreground">({formattedReviewCount})</span>
              </div>

              {/* --- Title --- */}
              <Link
                href={`/courses/${course.id}`}
                className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 mb-2 text-sm sm:text-base"
              >
                {course.title}
              </Link>

              {/* --- Instructor --- */}
              <div className="flex items-center gap-2 mb-3">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                  <AvatarFallback className="bg-primary text-white text-xs">
                    {course.instructor.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">by</span>
                <span className="text-sm font-medium">{course.instructor.name}</span>
              </div>

              {/* --- Stats --- */}
              <div className="flex items-center gap-4 mb-3 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {course.durationValue} {course.durationUnit}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.students.toLocaleString()}</span>
                </div>
              </div>

              {/* --- Price & Action --- */}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(course.discountPrice)}
                  </span>
                  {course.price && (
                    <span className="text-sm line-through text-muted-foreground">
                      {formatPrice(course.price)}
                    </span>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                  disabled={isRemoving}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  {isRemoving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

CartItem.displayName = 'CartItem';
