'use client';

import React, { useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, BookOpen, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useCourses } from '@/states/server/course/use-courses';
import { CourseMeta } from '@/types/course';
import { CoursesSkeleton } from './loading-skeletons';
import { ROUTES } from '@/lib/constants/routes';

const MOCK_COURSES = [
  {
    id: 'mock1',
    title: "Beginner's Guide to Design",
    instructor: { name: 'Ronald Richards' },
    rating: 5,
    totalRatings: 12,
    hours: 22,
    lessons: 15,
    level: 'beginner',
    price: 1699,
    discountPrice: 1499,
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
    slug: 'mock-beginner-design',
  },
  {
    id: 'mock2',
    title: 'Advanced Photography',
    instructor: { name: 'Annette Black' },
    rating: 4.8,
    totalRatings: 9,
    hours: 19,
    lessons: 14,
    level: 'advanced',
    price: 1990,
    discountPrice: 1980,
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
    slug: 'mock-advanced-photography',
  },
  {
    id: 'mock3',
    title: 'Illustration Masterclass',
    instructor: { name: 'Darrell Steward' },
    rating: 4.7,
    totalRatings: 7,
    hours: 15,
    lessons: 10,
    level: 'intermediate',
    price: 1299,
    discountPrice: 1298,
    thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=250&fit=crop',
    slug: 'mock-illustration-masterclass',
  },
  {
    id: 'mock4',
    title: 'Web Design 101',
    instructor: { name: 'Eleanor Pena' },
    rating: 4.9,
    totalRatings: 16,
    hours: 28,
    lessons: 18,
    level: 'Beginner',
    price: 899,
    discountPrice: 899,
    thumbnail: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400&h=250&fit=crop',
    slug: 'mock-web-design-101',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const CoursesSection = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true });

  const { courses: fetchedCourses = [], isLoading } = useCourses({ page: 1, pageSize: 5 });

  const displayCourses = useMemo(() => {
    const list = Array.isArray(fetchedCourses) ? fetchedCourses.slice(0, 4) : [];
    if (list.length < 4) {
      const needed = 4 - list.length;
      // Only use as many mock courses as needed and ensure unique IDs
      return [...list, ...MOCK_COURSES.slice(0, needed)];
    }
    return list;
  }, [fetchedCourses]);

  if (isLoading) {
    return <CoursesSkeleton />;
  }

  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Top Courses
          </h2>
          <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
            <Link href={ROUTES.public.courses.root}>
              See All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {displayCourses.map((course) => {
            const totalLessons =
              (course as (typeof MOCK_COURSES)[0]).lessons || (course as CourseMeta).noOfLessons;
            const courseUrl =
              typeof course.slug === 'string'
                ? ROUTES.public.courses.course(course.slug)
                : `${ROUTES.public.courses.root}/${course.id}`;
            return (
              <motion.div
                key={course.id}
                variants={cardVariants}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={courseUrl} className="block h-full group">
                  <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer h-full">
                    <div className="relative">
                      <Image
                        src={course.thumbnail || '/placeholder-course.jpg'}
                        alt={course.title || 'Course'}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover"
                      />
                      {course.level && (
                        <Badge className="absolute top-3 left-3 bg-white/90 text-gray-800 hover:bg-white/90">
                          {course.level}
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          By {course.instructor.name || 'Unknown'}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{course.rating || 0}</span>
                          <span>{course.rating} </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{/* {course.} */}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{totalLessons || '-'} Lessons</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {typeof course.discountPrice !== 'undefined'
                            ? `₹${course.discountPrice}`
                            : `₹${course.price}`}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-10 text-center">
          <Button asChild variant="outline" className="text-primary">
            <Link href={ROUTES.public.courses.root}>
              View All Courses
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
