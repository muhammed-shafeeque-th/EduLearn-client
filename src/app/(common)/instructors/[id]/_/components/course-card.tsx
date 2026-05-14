'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Clock, Video, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CourseMeta } from '@/types/course';

interface CourseCardProps {
  course: CourseMeta;
  onCourseClick?: (course: CourseMeta) => void;
  showInstructor?: boolean;
}

export function CourseCard({ course, onCourseClick, showInstructor = false }: CourseCardProps) {
  // const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // const handleWishlist = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   setIsWishlisted(!isWishlisted);
  // };

  const handleCardClick = () => {
    onCourseClick?.(course);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group cursor-pointer relative"
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-500 hover:border-blue-500/30">
        {/* Thumbnail Container */}
        <div className="relative h-48 overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 animate-pulse" />
          )}
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className={cn(
              'object-cover transition-transform duration-700 group-hover:scale-110',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Wishlist Button */}
          {/* <Button
            variant="secondary"
            size="icon"
            onClick={handleWishlist}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-transparent shadow-lg shadow-black/10 transition-transform active:scale-90"
          >
            <Heart
              className={cn(
                'w-4 h-4 transition-colors',
                isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
              )}
            />
          </Button> */}

          {/* Level Badge */}
          <div className="absolute bottom-4 left-4">
            <Badge
              className={cn(
                'text-[10px] font-black uppercase tracking-widest px-3 py-1 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-transparent',
                course.level === 'beginner'
                  ? 'text-emerald-600'
                  : course.level === 'intermediate'
                    ? 'text-amber-600'
                    : 'text-rose-600'
              )}
            >
              {course.level}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
              {course.title}
            </h3>
            {showInstructor && course.instructor && (
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                By {course.instructor.name}
              </p>
            )}
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-1.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-slate-900 dark:text-white">{course.rating.toFixed(1)}</span>
              <span>({course.numberOfRating})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              <span>{course.students?.toLocaleString()} students</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {course.durationValue} {course.durationUnit}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" />
              <span>{course.noOfLessons} Lessons</span>
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col">
              {course.price && course.price > (course?.discountPrice ?? 0) && (
                <span className="text-[10px] text-slate-400 line-through font-bold decoration-rose-500/50">
                  ₹{course.price}
                </span>
              )}
              <span className="text-xl font-black text-slate-900 dark:text-white">
                ₹{course.discountPrice}
              </span>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] px-6 rounded-xl shadow-lg shadow-blue-500/20">
              Enroll
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
