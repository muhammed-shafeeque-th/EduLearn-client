'use client';

import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Star, Clock, Users, Heart, ShoppingCart, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
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

interface CourseCardProps {
  course: CourseInfo;
  wishlistId: string;
}

const formatReviewCount = (count: number) => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`;
  return count.toLocaleString();
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'Beginner':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Intermediate':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'Advanced':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const CourseCardComponent: React.FC<CourseCardProps> = ({ course }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const controls = useAnimation();
  const audioManagerRef = useRef<AudioManager | null>(null);
  const { isEnrolled } = useIsEnrolled(course.id);

  const { cart, addError, addToCart, isAdding: isAddingToCart } = useCart({ enabled: true });
  const { isToggling, toggleWishlist } = useWishlist({ enabled: true });
  const isInCart = Boolean(cart?.items.some((item) => item.courseId === course.id));

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
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-0 shadow-md">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Course Image */}
            <div className="relative w-full md:w-40 h-28 md:h-40 overflow-hidden bg-muted">
              <Link
                href={`/courses/${course.slug}`}
                className="block relative w-full h-full"
                tabIndex={0}
              >
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-100 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
                )}
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className={cn(
                    'object-cover transition-all duration-500 group-hover:scale-105',
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                  onLoad={() => setImageLoaded(true)}
                  sizes="(max-width: 768px) 100vw, 160px"
                  priority={false}
                />
              </Link>
              {/* Wishlist Button with Enhanced Animation */}
              <motion.button
                whileHover={{
                  scale: 1.11,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.22 },
                }}
                whileTap={{
                  scale: 0.93,
                  rotate: 15,
                  transition: { duration: 0.1 },
                }}
                onClick={handleRemoveFromWishlist}
                disabled={isToggling}
                type="button"
                className="absolute top-2 right-2 w-7 h-7 bg-white/95 dark:bg-gray-900/95 rounded-full flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-gray-900 transition-all duration-200 backdrop-blur-sm border border-red-200 hover:border-red-300"
                aria-label="Remove from wishlist"
              >
                {isToggling ? (
                  <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                ) : (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                  >
                    <Heart className="w-4 h-4 text-red-500 fill-current drop-shadow-sm" />
                  </motion.div>
                )}
              </motion.button>
              {/* Level Badge */}
              <div className="absolute bottom-2 left-2">
                <Badge
                  variant="secondary"
                  className={cn('text-xs font-semibold shadow-sm', getLevelColor(course.level))}
                >
                  {course.level}
                </Badge>
              </div>
              {/* Discount Badge */}
              {!!course.price && course.price > course.discountPrice && (
                <motion.div
                  className="absolute top-2 left-2"
                  initial={{ scale: 0, rotate: -12 }}
                  animate={{ scale: 1, rotate: -12 }}
                  transition={{ delay: 0.15, type: 'spring' }}
                >
                  <Badge className="bg-red-500 text-white font-semibold shadow-lg text-xs px-2 py-1">
                    {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% OFF
                  </Badge>
                </motion.div>
              )}
            </div>
            {/* Course Details */}
            <div className="flex-1 p-3 flex flex-col min-h-[140px]">
              {/* Rating and Reviews */}
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                  <span className="text-xs font-semibold text-foreground">
                    {course.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({formatReviewCount(course.totalRatings)} reviews)
                </span>
              </div>
              {/* Title */}
              <Link href={`/courses/${course.slug}`}>
                <h3 className="text-base font-bold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2 cursor-pointer">
                  {course.title}
                </h3>
              </Link>
              {/* Description */}
              {/* <p className="text-xs text-muted-foreground line-clamp-2 mb-3 grow">
                {course.description}
              </p> */}
              {/* Instructor */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">by</span>
                <div className="flex items-center gap-1.5">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                    <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary/90 to-blue-500 text-white">
                      {course.instructor.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Link
                    href={`/instructors/${course.instructor.id}`}
                    className="text-xs font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {course.instructor.name}
                  </Link>
                </div>
              </div>
              {/* Course Stats */}
              <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {course.durationValue} {course.durationUnit}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{course.students?.toLocaleString()} students</span>
                </div>
              </div>
              {/* Price and Actions */}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(course.discountPrice)}
                  </span>
                  {!!course.price && course.price > course.discountPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(course.price)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Buy Now Button - Hidden on mobile */}
                  {!isEnrolled && (
                    <Button variant="outline" size="sm" className="hidden lg:flex" asChild>
                      <Link href={`/checkout?course=${course.id}`}>Buy Now</Link>
                    </Button>
                  )}
                  {/* Main Action Button Depending on Enrollment */}
                  {isEnrolled ? (
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        asChild
                        size="sm"
                        // variant="success"
                        className={cn(
                          'min-w-[120px] transition-all duration-200 bg-green-600 hover:bg-green-700 text-white'
                        )}
                      >
                        <Link href={`/profile/my-courses`} className="flex items-center">
                          {/* Could change icon if desired */}
                          <span className="mr-2">&#10003;</span>
                          Already Enrolled
                        </Link>
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        onClick={handleAddToCartAndRemoveFromWishlist}
                        disabled={isAddingToCart || isInCart || isToggling}
                        size="sm"
                        type="button"
                        className={cn(
                          'min-w-[120px] transition-all duration-200',
                          isInCart
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-primary/80 hover:bg-primary text-white'
                        )}
                      >
                        {isAddingToCart || isToggling ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : isInCart ? (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            In Cart
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                  {/* Mobile Wishlist Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFromWishlist}
                    disabled={isToggling}
                    type="button"
                    className="md:hidden hover:bg-red-50 dark:hover:bg-red-950"
                    aria-label="Remove from wishlist"
                  >
                    {isToggling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Heart className="w-4 h-4 text-red-500 fill-current" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const CourseCard = memo(CourseCardComponent);
