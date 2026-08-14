'use client';

import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Star, Clock, Users, Heart, ShoppingCart, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AudioManager, triggerHapticFeedback } from '../utils';
import { cn, formatPrice, getErrorMessage } from '@/lib/utils';
import { CourseInfo } from '@/types/course';
import { useWishlist } from '@/states/server/wishlist/use-wishlists';
import { useCart } from '@/states/server/cart/use-cart';
import { toast } from '@/hooks/use-toast';
import { useIsEnrolled } from '@/states/server/enrollment/use-enrollment';
import { useAuthSelector } from '@/states/client';
import { ROUTES } from '@/lib/constants/routes';

interface CourseCardProps {
  course: CourseInfo;
  wishlistId: string;
}

const formatReviewCount = (count: number) => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`;
  return count.toLocaleString();
};

const CourseCardComponent: React.FC<CourseCardProps> = ({ course }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const controls = useAnimation();
  const audioManagerRef = useRef<AudioManager | null>(null);
  const { isEnrolled } = useIsEnrolled(course.id);

  const { cart, addError, addToCart, isAdding: isAddingToCart } = useCart({ enabled: true });
  const { isToggling, toggleWishlist } = useWishlist({ enabled: true });
  const isInCart = Boolean(cart?.items.some((item) => item.courseId === course.id));
  const { user } = useAuthSelector();
  const isInstructor =
    user && (user.id === course.instructor.id || user.id === course.instructor.id);

  useEffect(() => {
    audioManagerRef.current = AudioManager.getInstance();
    audioManagerRef.current.initialize();
  }, []);

  const handleRemoveFromWishlist = useCallback(async () => {
    controls.start({
      x: [-2, 2, -2, 2, 0],
      transition: { duration: 0.4, ease: 'easeInOut' },
    });
    audioManagerRef.current?.playRemoveSound();
    triggerHapticFeedback('medium');
    try {
      await toggleWishlist({ courseId: course.id });
      toast.success({ title: 'Removed from wishlist' });
    } catch (e) {
      toast.error({ title: getErrorMessage(e, 'Something went wrong') });
    }
  }, [controls, toggleWishlist, course.id]);

  const handleAddToCartAndRemoveFromWishlist = useCallback(async () => {
    if (isEnrolled) {
      return toast.error({
        title: 'Cannot Add to Cart',
        description: 'You cannot add a course you are already enrolled in to your cart.',
      });
    }
    try {
      await addToCart({ courseId: course.id });
      // Only remove from wishlist after successful add to cart
      await toggleWishlist({ courseId: course.id });
      toast.success({ title: 'Course added to cart' });
    } catch (e) {
      toast.error({
        title: getErrorMessage(e, addError?.message || 'Could not add to cart'),
      });
    }
  }, [addToCart, course.id, addError, toggleWishlist, isEnrolled]);

  return (
    <motion.div
      animate={controls}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <div className="group relative bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="flex flex-col md:flex-row">
          {/* Course Image */}
          <div className="relative w-full md:w-64 h-44 overflow-hidden bg-muted shrink-0">
            <Link
              href={ROUTES.public.courses.course(course.slug)}
              className="block relative w-full h-full"
              tabIndex={0}
            >
              {!imageLoaded && <div className="absolute inset-0 bg-primary/5 animate-pulse" />}
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className={cn(
                  'object-cover transition-transform duration-500 group-hover:scale-105',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                sizes="(max-width: 768px) 100vw, 256px"
                priority={false}
              />
            </Link>

            {/* Remove Button */}
            <Button
              variant="secondary"
              size="icon"
              onClick={handleRemoveFromWishlist}
              disabled={isToggling}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove from wishlist"
            >
              {isToggling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              )}
            </Button>

            {/* Level Badge */}
            <div className="absolute bottom-2 left-2">
              <Badge
                variant="secondary"
                className={cn(
                  'text-[10px] font-semibold uppercase px-2 py-0.5 bg-background/80 backdrop-blur-sm border-0',
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
          </div>

          {/* Course Details */}
          <div className="flex-1 p-5 md:p-6 flex flex-col">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold">{course.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({formatReviewCount(course.totalRatings)})
                  </span>
                </div>

                {/* Title */}
                <Link href={ROUTES.public.courses.course(course.slug)}>
                  <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {course.title}
                  </h3>
                </Link>

                {/* Instructor */}
                <div className="flex items-center gap-2">
                  <Avatar className="w-5 h-5 border">
                    <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                    <AvatarFallback className="text-[8px]">
                      {course.instructor.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Link
                    href={ROUTES.public.instructors.profile(course.instructor.id)}
                    className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    By <span className="text-foreground">{course.instructor.name}</span>
                  </Link>
                </div>
              </div>

              {/* Price */}
              <div className="flex flex-col lg:items-end">
                <span className="text-xl font-bold text-primary">
                  {formatPrice(course.discountPrice)}
                </span>
                {!!course.price && course.price > course.discountPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(course.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Course Stats */}
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
                  {course.students?.toLocaleString()} Students
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive h-8 px-2"
                onClick={handleRemoveFromWishlist}
              >
                Remove
              </Button>

              <div className="flex items-center gap-2">
                {isInstructor ? (
                  <Button
                    variant="default"
                    size="sm"
                    className="h-9 px-4 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                    asChild
                  >
                    <Link href={ROUTES.instructor.courses.analytics(course.id)}>
                      View Course Overview
                    </Link>
                  </Button>
                ) : (
                  <>
                    {/* {!isEnrolled && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-4 rounded-lg text-xs font-semibold"
                        asChild
                      >
                        <Link href={`ROUTES.student.checkout?course=${course.id}`}>Buy Now</Link>
                      </Button>
                    )} */}

                    {isEnrolled ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-9 px-4 rounded-lg text-xs font-semibold"
                        asChild
                      >
                        <Link href={ROUTES.student.courses.root}>Enrolled</Link>
                      </Button>
                    ) : (
                      <Button
                        onClick={handleAddToCartAndRemoveFromWishlist}
                        disabled={isAddingToCart || isInCart || isToggling}
                        size="sm"
                        className={cn(
                          'h-9 px-4 rounded-lg text-xs font-semibold transition-all',
                          isInCart ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''
                        )}
                      >
                        {isAddingToCart || isToggling ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : isInCart ? (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                            In Cart
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const CourseCard = memo(CourseCardComponent);
