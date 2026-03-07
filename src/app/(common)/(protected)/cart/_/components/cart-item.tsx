'use client';

import { useState, memo, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Users, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CartItem as CartItemType } from '@/types/cart';
import { cn, formatPrice } from '@/lib/utils';

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
    if (course.price && course.discountPrice && course.price > course.discountPrice) {
      return Math.round(((course.price - course.discountPrice) / course.price) * 100);
    }
    return null;
  }, [course.price, course.discountPrice]);

  const handleImageLoad = useCallback(() => setImageLoaded(true), []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, x: -50 }}
      transition={{ type: 'spring', stiffness: 150, damping: 20 }}
    >
      <div className="group relative bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col md:flex-row">
          {/*  Thumbnail  */}
          <div className="relative w-full md:w-64 h-44 overflow-hidden shrink-0">
            <Link href={`/courses/${course.slug}`} className="block relative w-full h-full">
              {!imageLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                priority={false}
                className={cn(
                  'object-cover transition-transform duration-500 group-hover:scale-105',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={handleImageLoad}
                sizes="(max-width: 640px) 100vw, 256px"
              />
            </Link>

            {/*  Badges  */}
            <div className="absolute bottom-2 left-2 flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  'text-[10px] uppercase font-semibold px-2 py-0.5 bg-background/80 backdrop-blur-sm border-0',
                  course.level === 'beginner'
                    ? 'text-emerald-500'
                    : course.level === 'intermediate'
                      ? 'text-amber-500'
                      : 'text-rose-500'
                )}
              >
                {course.level}
              </Badge>
            </div>

            {discountPercentage && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-rose-500 text-white text-[10px] font-semibold uppercase px-2 py-0.5 border-0 shadow-sm">
                  {discountPercentage}% OFF
                </Badge>
              </div>
            )}
          </div>

          {/*  Details  */}
          <div className="flex-1 p-5 md:p-6 flex flex-col">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                {/*  Rating  */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold">{course.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({formattedReviewCount} Students)
                  </span>
                </div>

                {/*  Title  */}
                <Link
                  href={`/courses/${course.slug}`}
                  className="block font-bold text-lg md:text-xl text-foreground hover:text-primary transition-colors line-clamp-2 leading-tight"
                >
                  {course.title}
                </Link>

                {/*  Instructor  */}
                <div className="flex items-center gap-2">
                  <Avatar className="w-5 h-5 border">
                    <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                    <AvatarFallback className="text-[8px]">
                      {course.instructor.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-muted-foreground">
                    By <span className="text-foreground">{course.instructor.name}</span>
                  </span>
                </div>
              </div>

              {/*  Price Section  */}
              <div className="flex flex-col items-end shrink-0">
                <span className="text-xl font-bold text-primary">
                  {formatPrice(course.discountPrice)}
                </span>
                {course.price && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(course.price)}
                  </span>
                )}
              </div>
            </div>

            {/*  Stats  */}
            <div className="flex items-center gap-4 text-muted-foreground mb-4">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold uppercase">
                  {course.durationValue} {course.durationUnit}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold uppercase">
                  {course.students.toLocaleString()}
                </span>
              </div>
            </div>

            {/*  Action  */}
            <div className="flex items-center justify-end mt-auto pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                disabled={isRemoving}
                className="h-8 px-2 text-muted-foreground hover:text-destructive transition-colors text-xs font-medium"
              >
                {isRemoving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Remove
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

CartItem.displayName = 'CartItem';
