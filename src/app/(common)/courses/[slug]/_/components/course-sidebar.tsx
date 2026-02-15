'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ShoppingCart,
  Heart,
  Share2,
  Gift,
  Clock,
  Trophy,
  Smartphone,
  Download,
  Infinity,
  Users,
  Globe,
  // CreditCard,
  Shield,
  Timer,
  Zap,
  Check,
  X,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  ArrowRight,
  GraduationCap,
  Eye,
} from 'lucide-react';
import { Course } from '@/types/course';
import { toast } from '@/hooks/use-toast';
import { useCart } from '@/states/server/cart/use-cart';
import { useWishlist } from '@/states/server/wishlist/use-wishlists';
import { getNavigator, getWindow } from '@/lib/utils';
import Link from 'next/link';
import { useIsEnrolled } from '@/states/server/enrollment/use-enrollment';
import { useAuthSelector } from '@/states/client';

interface CourseSidebarProps {
  course: Course;
}

// Helper to generate a pseudo-random initial timer per render , TODO: update later
function generateRandomInitialTime() {
  // Range: 2h to 24h (in seconds; 7200 to 86400)
  // (To feel realistic: most users won't see full 24:00:00 on every course.)
  const min = 7200; // 2 hours
  const max = 86400; // 24 hours
  // Use window.crypto if available for more randomness; else fallback to Math.random
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    const rand = arr[0] / 0xffffffff;
    return Math.floor(rand * (max - min + 1) + min);
  }
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function CourseSidebar({ course }: CourseSidebarProps) {
  const { cart, addToCart, addError, isAdding } = useCart({ enabled: true });
  const { wishlist, toggleWishlist, isToggleError, toggleError } = useWishlist({
    enabled: true,
  });
  const { user } = useAuthSelector(); // Get the logged in user

  // Determine if the logged in user is the course instructor
  const isInstructor =
    user && (user.id === course.instructorId || user.id === course.instructor?.id);

  const isInCart = cart?.items.some((item) => item.courseId === course.id);
  const isInWishlist = wishlist?.items.some((item) => item.courseId === course.id);
  const { isEnrolled } = useIsEnrolled(course.id);

  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Later, this should be replaced by real per-user/per-offer logic from backend.
  const [timeLeft, setTimeLeft] = useState<number>(() => generateRandomInitialTime());
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Countdown timer for discount
  useEffect(() => {
    // do not run timer in SSR
    if (typeof window === 'undefined') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const features = [
    { icon: Clock, text: `${course.durationValue} on-demand video`, color: 'text-blue-600' },
    { icon: Download, text: 'Downloadable resources', color: 'text-green-600' },
    { icon: Infinity, text: 'Full lifetime access', color: 'text-purple-600' },
    { icon: Smartphone, text: 'Access on mobile and TV', color: 'text-orange-600' },
    { icon: Trophy, text: 'Certificate of completion', color: 'text-yellow-600' },
    { icon: Users, text: 'Join study groups', color: 'text-indigo-600' },
  ];

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

    // Simulate API call
    await addToCart({ courseId: course.id });
    if (addError) {
      toast.error({ title: addError.message });
    } else {
      toast.success({ title: 'Course added to cart!' });
    }
  }, [addToCart, course, cart, addError, isEnrolled]);

  const handleWishlist = useCallback(async () => {
    if (isEnrolled) {
      return toast.error({
        title: 'Already Enrolled',
        description: 'You cannot add a course you are already enrolled in to your wishlist.',
      });
    }
    if (!wishlist?.id) {
      return toast.error({ title: 'Please log in first to add this course to your wishlist.' });
    }

    await toggleWishlist({ courseId: course.id });
    if (isToggleError && toggleError) {
      toast.error({ title: toggleError.message || 'Something went wrong' });
    } else {
      toast.success({ title: isInWishlist ? 'Removed from wishlist' : 'Added to wishlist!' });
    }
  }, [toggleWishlist, isToggleError, toggleError, course, wishlist, isInWishlist, isEnrolled]);

  const handleShare = (platform?: string) => {
    const url = getWindow()?.location.href;
    if (!url) return;

    const title = course.title;

    if (platform) {
      let shareUrl = '';
      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
          break;
        case 'email':
          shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this course: ${url}`)}`;
          break;
      }

      if (shareUrl) {
        getWindow()?.open(shareUrl, '_blank', 'width=600,height=400');
        setShowShareDialog(false);
        toast.success({ title: 'Shared successfully!' });
      }
    } else {
      getNavigator()?.clipboard.writeText(url);
      toast.success({ title: 'Course link copied to clipboard!' });
    }
  };

  /**
   * const handleShare = async () => {
    try {
      const shareData = {
        title: course.title,
        text: course.shortDescription || course.description,
        url: getWindow()?.location.href,
      };

      if (getNavigator!~()?.share &&!~ getNavigator()?.canShare!~ && getNavigator()?.canShare(shareData)) {
        await getNavigator()?.share(shareData);
      } else {
        // Fallback!~ to clipboard
        await getNavigator()?.!~clipboard.writeText(getWindow()?.location.href);
        // Note: In a real app, show a toast notification here
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: try to copy to clipboard
      try {
        await getNavigator()?.clipboard!~.writeText(getWindow()?.location.href);
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
      }
    }
  };
   */

  const handleApplyCoupon = () => {
    const validCoupons = ['SAVE20', 'STUDENT50', 'NEWUSER'];

    if (validCoupons.includes(couponCode.toUpperCase())) {
      setAppliedCoupon(couponCode.toUpperCase());
      setShowCouponInput(false);
      setCouponCode('');
      toast.success({ title: 'Coupon applied successfully!' });
    } else {
      toast.error({ title: 'Invalid coupon code' });
    }
  };

  const getDiscountedPrice = () => {
    if (!appliedCoupon) return course.discountPrice;

    const discounts: { [key: string]: number } = {
      SAVE20: 0.8,
      STUDENT50: 0.5,
      NEWUSER: 0.7,
    };

    return course.discountPrice * (discounts[appliedCoupon] || 1);
  };

  const calculateSavings = () => {
    if (!course.price) return 0;
    return course.price - getDiscountedPrice();
  };

  // Course overview redirect
  const courseOverviewUrl = `instructor/courses/${course.id}/analytics`;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 sticky top-6">
        <CardHeader className="space-y-4">
          {/* Price Section */}
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ${getDiscountedPrice()?.toFixed(2) ?? 0}
              </span>
              {course.price && (
                <span className="text-lg text-gray-500 line-through">${course.price}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {course.price && (
                <Badge variant="destructive">
                  {Math.round((1 - getDiscountedPrice() / course.price) * 100)}% off
                </Badge>
              )}
              {appliedCoupon && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Gift className="w-3 h-3 mr-1" />
                  {appliedCoupon} Applied
                </Badge>
              )}
            </div>

            {/* Savings Display */}
            {calculateSavings() > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    You save ${calculateSavings().toFixed(2)}!
                  </span>
                </div>
              </div>
            )}

            {/* Countdown Timer */}
            {timeLeft > 0 && (
              <motion.div
                className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity as unknown as number }}
              >
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-2">
                  <Timer className="w-4 h-4" />
                  <span className="text-sm font-medium">Limited Time Offer!</span>
                </div>
                <div className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Price increases after this offer expires
                </div>
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Show instructor options if logged in user is the course instructor */}
            <AnimatePresence mode="wait">
              {isInstructor ? (
                <Button
                  asChild
                  className="w-full h-10 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <Link href={courseOverviewUrl}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 w-full"
                    >
                      <Eye className="w-4 h-4" />
                      View Course Overview
                    </motion.div>
                  </Link>
                </Button>
              ) : isEnrolled ? (
                <Button
                  asChild
                  className="w-full h-10 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <Link href="/profile/my-courses">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 w-full"
                    >
                      <GraduationCap className="w-4 h-4" />
                      Enrolled &mdash; Go to My Courses
                    </motion.div>
                  </Link>
                </Button>
              ) : isInCart ? (
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-10 flex items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary hover:text-primary"
                  size="lg"
                >
                  <Link href="/cart">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 w-full"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Go to Cart
                    </motion.div>
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full bg-primary/90 hover:bg-primary text-white relative overflow-hidden"
                  size="lg"
                >
                  {isAdding ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to cart
                    </motion.div>
                  )}
                </Button>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Actions */}
          {/* Hide wishlist/coupon if instructor or enrolled */}
          <div className="flex gap-2">
            {!isEnrolled && !isInstructor && (
              <Button
                variant="outline"
                size="sm"
                className={`flex-1 ${isInWishlist ? 'bg-pink-50 border-pink-200 text-pink-600 hover:border-primary hover:text-primary' : ''}`}
                onClick={handleWishlist}
              >
                <Heart className={`w-4 h-4 mr-1 ${isInWishlist ? 'fill-current' : ''}`} />
                Wishlist
              </Button>
            )}
            <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 hover:border-primary hover:text-primary"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          {/* Coupon Section */}
          {/* Hide coupon if enrolled or instructor */}
          {!isEnrolled && !isInstructor && (
            <div className="text-center">
              <AnimatePresence>
                {!showCouponInput && !appliedCoupon ? (
                  <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary"
                      onClick={() => setShowCouponInput(true)}
                    >
                      <Gift className="w-4 h-4 mr-1" />
                      Apply Coupon
                    </Button>
                  </motion.div>
                ) : !appliedCoupon ? (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="text-sm"
                      />
                      <Button size="sm" onClick={handleApplyCoupon}>
                        Apply
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCouponInput(false)}
                      className="w-full text-xs"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                    <div className="text-xs text-gray-500 mt-2">
                      Try: SAVE20, STUDENT50, NEWUSER
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <Gift className="w-4 h-4" />
                        <span className="text-sm font-medium">{appliedCoupon} Applied</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAppliedCoupon(null)}
                        className="text-green-600 hover:text-green-700 p-1"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Money Back Guarantee */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">30-Day Money-Back Guarantee</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Full refund if you&apos;re not satisfied
            </p>
          </div>
        </CardContent>

        <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="w-full space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              This course includes:
            </h4>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <feature.icon className={`w-4 h-4 ${feature.color}`} />
                  <span>{feature.text}</span>
                </motion.li>
              ))}
            </ul>

            {/* Course Stats */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {course.students?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Students Enrolled</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {course.rating}★
                  </div>
                  <div className="text-xs text-gray-500">Average Rating</div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-2 pt-4">
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Globe className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <div className="text-xs text-gray-600 dark:text-gray-400">Online</div>
              </div>
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Users className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <div className="text-xs text-gray-600 dark:text-gray-400">Community</div>
              </div>
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Trophy className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <div className="text-xs text-gray-600 dark:text-gray-400">Certificate</div>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share this Course</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Social Share Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleShare('facebook')}
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
              </Button>

              <Button
                variant="outline"
                onClick={() => handleShare('twitter')}
                className="flex items-center gap-2 hover:bg-sky-50 hover:border-sky-200"
              >
                <Twitter className="w-4 h-4 text-sky-500" />
                Twitter
              </Button>

              <Button
                variant="outline"
                onClick={() => handleShare('linkedin')}
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200"
              >
                <Linkedin className="w-4 h-4 text-blue-700" />
                LinkedIn
              </Button>

              <Button
                variant="outline"
                onClick={() => handleShare('email')}
                className="flex items-center gap-2 hover:bg-gray-50 hover:border-gray-200"
              >
                <Mail className="w-4 h-4 text-gray-600" />
                Email
              </Button>
            </div>

            {/* Copy Link */}
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Input value={getWindow()?.location?.href || ''} readOnly className="text-sm" />
                <Button onClick={() => handleShare()} variant="outline" size="sm">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Copy link to share with others</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
