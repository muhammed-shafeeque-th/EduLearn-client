'use client';

import { motion } from 'framer-motion';
import { CourseCard } from './course-card';
import { CourseMeta } from '@/types/course';

interface CourseGridProps {
  courses: CourseMeta[];
}

export function CourseGrid({ courses }: CourseGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
      {courses.map((course, index) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <CourseCard course={course} />
        </motion.div>
      ))}
    </div>
  );
}
