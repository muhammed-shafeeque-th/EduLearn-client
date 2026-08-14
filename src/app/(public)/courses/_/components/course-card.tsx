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
import { useAuthSelector } from '@/states/client';
import { ROUTES } from '@/lib/constants/routes';

interface CourseCardProps {
  course: CourseMeta;
  /** Set true only for the first above-the-fold card in a list */
  priorityImage?: boolean;
}

function getDiscountPercentage(original: number, discounted: number) {
  if (!original || !discounted || original <= discounted) return null;
  return Math.round(((original - discounted) / original) * 100);
}

export function CourseCard({ course, priorityImage = false }: CourseCardProps) {
  const { wishlist, toggleWishlist, isToggling } = useWishlist({ enabled: true });

  const { cart, addToCart, addError, isAdding: isAddingToCart } = useCart({ enabled: true });

  const { isEnrolled } = useIsEnrolled(course.id);
  const { user } = useAuthSelector();
  const isInstructor =
    user && (user.userId === course.instructorId || user.userId === course.instructor?.id);

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
  // const courseLessonsCount = course.modules
  //   ? course.modules.reduce((acc, module) => acc + module.lessons.length, 0)
  //   : 0;

  // const courseInMinutes = course.modules
  //   ? course.modules.reduce(
  //       (sSum, module) =>
  //         sSum +
  //         module.lessons.reduce((lSum, lesson) => lSum + (lesson.estimatedDuration ?? 0), 0),
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
      Development: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
      Design: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      Marketing: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
      Business: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
      Photography: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
      'Web Development': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
    };
    return colors[category as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group"
    >
      <Card
        className={cn(
          'relative flex flex-col min-h-[480px] border border-border transition-all duration-300 bg-card hover:shadow-lg rounded-xl overflow-hidden'
        )}
      >
        <div className="relative w-full aspect-video bg-muted overflow-hidden">
          <Image
            fill
            src={course.thumbnail}
            alt={course.title}
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priorityImage}
            loading={priorityImage ? undefined : 'lazy'}
            draggable={false}
          />

          <Badge
            variant="secondary"
            className={cn(
              'absolute top-3 left-3 text-[10px] font-semibold uppercase px-2 py-0.5 z-10 border-0',
              getCategoryColor(course.category)
            )}
          >
            {course.category}
          </Badge>

          <div className="absolute top-3 right-3 z-10">
            <div className="bg-background/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border font-bold text-foreground flex items-center gap-1.5">
              {showDiscount && (
                <span className="text-destructive text-[10px] font-bold">-{discountPercent}%</span>
              )}
              <span className="text-xs">{formatPrice(course.discountPrice ?? 0)}</span>
            </div>
          </div>

          {!isEnrolled && !isInstructor && (
            <Button
              size="icon"
              variant="secondary"
              disabled={isToggling}
              className={cn(
                'absolute bottom-3 right-3 h-8 w-8 rounded-full shadow-sm z-20 bg-background/80 hover:bg-background backdrop-blur-sm border-0 transition-all active:scale-95'
              )}
              onClick={(e) => debouncedToggleWishlist(e)}
            >
              {isToggling ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              ) : (
                <Heart
                  className={cn(
                    'h-3.5 w-3.5 transition-colors',
                    isWishlisted ? 'fill-destructive text-destructive' : 'text-muted-foreground'
                  )}
                />
              )}
            </Button>
          )}
        </div>

        <CardContent className="flex flex-col flex-1 p-5">
          <div className="flex-1">
            <Link
              href={ROUTES.public.courses.course(course.slug)}
              className="block mb-1.5 overflow-hidden"
            >
              <h3
                className="font-bold text-base leading-tight text-foreground line-clamp-2 hover:text-primary transition-colors"
                title={course.title}
              >
                {course.title}
              </h3>
            </Link>
            {course.instructor?.name && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                <span>by</span>
                <span className="font-semibold text-foreground/80">{course.instructor.name}</span>
              </p>
            )}

            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-3 w-3',
                        i < Math.floor(course.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-muted/20 fill-muted/20'
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold ml-1">{course.rating?.toFixed(1)}</span>
              </div>

              {typeof course.students === 'number' && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{course.students.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground mb-4">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 opacity-60" />
                <span>
                  {course.durationValue} {course.durationUnit}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 opacity-60" />
                <span>{course.noOfLessons} lessons</span>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-semibold uppercase py-0 px-2 h-5 border-border text-muted-foreground"
              >
                {course.level}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 mt-auto">
            {isInstructor ? (
              <Link href={ROUTES.instructor.courses.course(course.id)} className="w-full">
                <Button className="w-full h-9 text-xs font-bold rounded-lg bg-primary/80 hover:bg-primary text-white flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Your Course
                </Button>
              </Link>
            ) : isEnrolled ? (
              <div className="flex gap-2">
                <Button
                  disabled
                  className="flex-1 bg-primary/10 text-primary font-bold rounded-lg h-9 text-xs border-0"
                >
                  Enrolled
                </Button>
                <Link href={ROUTES.student.courses.root}>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1">
                  {course.price === 0 ? (
                    <Link href={ROUTES.public.courses.course(course.slug)}>
                      <Button className="w-full h-9 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">
                        Enroll Free
                      </Button>
                    </Link>
                  ) : isInCart ? (
                    <Link href={ROUTES.student.cart}>
                      <Button className="w-full h-9 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2">
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Go to Cart
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                      className="w-full h-9 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
                    >
                      {isAddingToCart ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ShoppingCart className="h-3.5 w-3.5" />
                      )}
                      Add to Cart
                    </Button>
                  )}
                </div>
                <Link href={ROUTES.public.courses.course(course.slug)}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-lg border-border hover:bg-muted"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
