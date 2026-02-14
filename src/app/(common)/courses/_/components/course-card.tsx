'use client';

import { motion } from 'framer-motion';
import { Star, Clock, Users, BookOpen, Heart, Loader2, ShoppingCart, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, debounce, getErrorMessage } from '@/lib/utils';
import Image from 'next/image';
import type { CourseMeta } from '@/types/course';
import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/states/server/wishlist/use-wishlists';
import { toast } from '@/hooks/use-toast';

import { useCart } from '@/states/server/cart/use-cart';
import { useIsEnrolled } from '@/states/server/enrollment/use-enrollment';

interface CourseCardProps {
  course: CourseMeta;
}

function getDiscountPercentage(original: number, discounted: number) {
  if (!original || !discounted || original <= discounted) return null;
  return Math.round(((original - discounted) / original) * 100);
}

export function CourseCard({ course }: CourseCardProps) {
  const { wishlist, toggleWishlist, isToggling } = useWishlist({ enabled: true });

  const { cart, addToCart, addError, isAdding: isAddingToCart } = useCart({ enabled: true });

  const { isEnrolled } = useIsEnrolled(course.id);

  const isInCart = cart?.items.some((item) => item.course?.id === course.id);

  const handleAddToCart = useCallback(async () => {
    if (isEnrolled) {
      return toast.error({
        title: 'Cannot Add to Cart',
        description: 'You cannot add a course you are already enrolled in to your cart.',
      });
    }

    if (!cart?.id) {
      return toast.error({ title: 'Please log in first to add to cart.' });
    }
    await addToCart({ courseId: course.id });
    if (addError) {
      toast.error({ title: addError.message });
    } else {
      toast.success({ title: 'Course added to cart!' });
    }
  }, [addToCart, course, cart, addError, isEnrolled]);

  const isWishlisted = Boolean(
    wishlist?.items?.some((item) => item.courseId === course.id) ?? false
  );

  // Pricing display
  const showDiscount =
    typeof course.discountPrice === 'number' &&
    typeof course.price === 'number' &&
    course.price > course.discountPrice;

  const discountPercent = showDiscount
    ? getDiscountPercentage(course.price, course.discountPrice || 0)
    : null;

  const formatPrice = (price: number) =>
    price === 0 ? (
      <span className="text-green-600 font-semibold">Free</span>
    ) : (
      <span className="font-bold">{`₹${price.toLocaleString()}`}</span>
    );

  // Lessons and duration
  // const courseLessonsCount = course.sections
  //   ? course.sections.reduce((acc, section) => acc + section.lessons.length, 0)
  //   : 0;

  // const courseInMinutes = course.sections
  //   ? course.sections.reduce(
  //       (sSum, section) =>
  //         sSum +
  //         section.lessons.reduce((lSum, lesson) => lSum + (lesson.estimatedDuration ?? 0), 0),
  //       0
  //     )
  //   : 0;

  const handleWishlistToggle = useCallback(
    async (
      { courseId, wishlistId }: { courseId: string; wishlistId: string },
      e?: React.MouseEvent
    ) => {
      e?.stopPropagation?.();
      e?.preventDefault?.();
      try {
        if (isEnrolled) {
          return toast.error({
            title: 'Already Enrolled',
            description: 'You cannot add a course you are already enrolled in to your wishlist.',
          });
        }

        if (!courseId || !wishlistId) {
          return toast.error({
            title: 'Authentication Required',
            description: 'You must be logged in to add courses to your wishlist.',
          });
        }

        await toggleWishlist({ courseId });

        if (isWishlisted) {
          toast.success({
            title: 'Removed from Wishlist',
            description: `${course.title} has been removed from your wishlist.`,
          });
        } else {
          toast.success({
            title: 'Added to Wishlist',
            description: `${course.title} has been added to your wishlist.`,
          });
        }
      } catch (error) {
        toast.error({
          title: 'Error',
          description: getErrorMessage(error, 'Something went wrong. Please try again.'),
        });
      }
    },
    [toggleWishlist, isWishlisted, course.title, isEnrolled]
  );

  const debouncedToggleWishlist = useMemo(
    () =>
      debounce(
        (e?: React.MouseEvent) =>
          handleWishlistToggle(
            {
              courseId: course.id,
              wishlistId: wishlist?.id || '',
            },
            e
          ),
        400
      ),
    [handleWishlistToggle, course.id, wishlist?.id]
  );

  // const formatDuration = (minutes: number) => {
  //   if (minutes < 60) return `${minutes}m`;
  //   const hours = Math.floor(minutes / 60);
  //   const remainingMinutes = minutes % 60;
  //   return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  // };

  const getCategoryColor = (category: string) => {
    const colors = {
      Development: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      Design: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      Marketing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      Business: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      Photography: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      'Web Development': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
    };
    return (
      colors[category as keyof typeof colors] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    );
  };

  // Unified hover & glass style, better sized image, more polished
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.18 }}
      className="group"
    >
      <Card
        className={cn(
          'relative flex flex-col min-h-[460px] shadow-sm border transition-all duration-300 bg-white dark:bg-gray-900 hover:shadow-xl rounded-2xl overflow-hidden'
        )}
      >
        {/* 
          The image container below is set with an explicit 'aspect-video' ratio,
          and the image uses absolute positioning and object-cover to strictly
          fill the set bounds without growing the div due to its natural image height,
          ensuring all cards line up nicely.
        */}
        <div className="relative w-full aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden group">
          <Image
            fill
            src={course.thumbnail}
            alt={course.title}
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 480px"
            priority
            draggable={false}
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors rounded-t-2xl pointer-events-none" />
          <Badge
            variant="outline"
            className={cn(
              'absolute top-4 left-4 text-xs font-medium shadow-md px-3 py-1 pointer-events-none z-10',
              getCategoryColor(course.category)
            )}
          >
            {course.category}
          </Badge>
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10 pointer-events-none">
            {/* Pricing, with discount if present */}
            <div className="flex items-baseline gap-1 bg-white/90 px-3 py-1 rounded-full shadow font-bold text-gray-800 border">
              {showDiscount && (
                <span className="text-red-600 text-sm font-semibold mr-1">-{discountPercent}%</span>
              )}
              <span className="text-lg leading-none">{formatPrice(course.discountPrice ?? 0)}</span>
              {showDiscount && (
                <span className="line-through text-gray-500 text-xs ml-1">
                  ₹{course.price?.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          {/* Wishlist Button - Hide if enrolled.
              Now placed in the bottom-right of the image (overlapping) */}
          {!isEnrolled && (
            <Button
              size="icon"
              variant="ghost"
              disabled={isToggling}
              className={cn(
                'absolute bottom-4 right-4 h-10 w-10 rounded-full p-0 z-20 bg-white/80 hover:bg-white/100 backdrop-blur-sm border border-white drop-shadow transition'
              )}
              aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              onClick={(e) => debouncedToggleWishlist(e)}
              tabIndex={0}
              // Prevent link navigation on click
            >
              {isToggling ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <Heart
                  className={cn(
                    'h-5 w-5 transition',
                    isWishlisted ? 'fill-red-500 text-red-500' : 'text-primary'
                  )}
                />
              )}
            </Button>
          )}
        </div>
        <CardContent className="flex flex-col h-full p-5">
          {/* Title and Instructor */}
          <div>
            <Link
              href={`/courses/${course.slug}`}
              className="inline-block w-full group/title"
              tabIndex={0}
              aria-label={course.title}
            >
              <h3
                className="font-bold text-lg text-foreground mb-2 line-clamp-2 transition-colors group-hover:text-primary group-hover/title:text-primary"
                title={course.title}
                style={{ cursor: 'pointer' }}
              >
                {course.title}
              </h3>
            </Link>
            {course.instructor?.name && (
              <p className="text-xs text-muted-foreground mb-3">
                by <span className="font-medium">{course.instructor.name}</span>
              </p>
            )}
          </div>
          {/* Rating & students */}
          <div className="flex items-center gap-3 mb-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4',
                      i < Math.floor(course.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
              <span className="font-medium text-foreground ml-1">{course.rating?.toFixed(1)}</span>
            </div>
            {/* Students */}
            {typeof course.students === 'number' && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{course.students.toLocaleString()} enrolled</span>
              </div>
            )}
          </div>
          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {course.durationValue} {course.durationUnit}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.noOfLessons} lessons</span>
            </div>
            <Badge variant="outline" className="text-xs py-0.5 px-2 ml-1">
              {course.level}
            </Badge>
          </div>
          {/* Topics */}
          {course.topics && course.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {course.topics.slice(0, 3).map((topic) => (
                <Badge
                  key={topic}
                  variant="secondary"
                  className="bg-primary/10 text-primary hover:bg-primary/20 text-xs px-2 py-1 rounded"
                >
                  {topic}
                </Badge>
              ))}
              {course.topics.length > 3 && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary hover:bg-primary/20 text-xs px-2 py-1 rounded"
                >
                  +{course.topics.length - 3} more
                </Badge>
              )}
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-auto">
            <div className="flex gap-2">
              {/* If enrolled: show Enrolled + Go to My Courses */}
              {isEnrolled ? (
                <>
                  <span className="flex-1">
                    <Button
                      disabled
                      variant="outline"
                      className="w-full bg-primary/10 dark:bg-primary text-primary dark:text-white font-semibold rounded-lg py-2 text-sm shadow flex items-center justify-center gap-2 cursor-default"
                    >
                      Enrolled
                    </Button>
                  </span>
                  <Link href="/profile/my-courses" className="flex-0" tabIndex={-1}>
                    <Button
                      variant="outline"
                      className="px-4 py-2 rounded-lg text-sm border-muted-foreground/30 flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      My Courses
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {/* Not enrolled: old add to cart or go to cart or enroll free logic */}
                  {course.price === 0 ? (
                    <Link href={`/courses/${course.slug}`} className="flex-1" tabIndex={-1}>
                      <Button
                        variant="outline"
                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-semibold shadow"
                      >
                        Enroll Free
                      </Button>
                    </Link>
                  ) : isInCart ? (
                    <Link href="/cart" className="flex-1" tabIndex={-1}>
                      <Button className="w-full bg-primary/90 hover:bg-primary text-white rounded-lg py-2 text-sm font-semibold shadow flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Go to Cart
                      </Button>
                    </Link>
                  ) : isAddingToCart ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <Button
                      onClick={handleAddToCart}
                      className="flex-1 bg-primary/90 hover:bg-primary text-white rounded-lg py-2 text-sm font-semibold shadow flex items-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  )}
                  {/* View Course */}
                  <Link href={`/courses/${course.slug}`} className="flex-0" tabIndex={-1}>
                    <Button
                      variant="outline"
                      className="px-4 py-2 rounded-lg text-sm border-muted-foreground/30 flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
