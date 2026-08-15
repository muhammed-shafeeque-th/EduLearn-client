'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTab } from './tabs/overview-tabs';
import { CurriculumTab } from './tabs/curriculum-tab';
import { InstructorTab } from './tabs/instructor-tab';
import { CourseReviews } from './tabs/reviews-tab';
import { Course } from '@/types/course';

interface CourseContentProps {
  course: Course;
}

const TAB_MAP = [
  { id: 'overview', label: 'Overview', Component: OverviewTab },
  { id: 'curriculum', label: 'Curriculum', Component: CurriculumTab },
  { id: 'instructor', label: 'Instructor', Component: InstructorTab },
  { id: 'reviews', label: 'Reviews', Component: CourseReviews },
];

export function CourseContent({ course }: CourseContentProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Prevent unnecessary rerenderings of tab definitions
  const tabDefs = useMemo(() => TAB_MAP, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6">
          <TabsList className="h-auto bg-transparent gap-0 p-0">
            {tabDefs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={[
                  'relative px-4 py-4 text-sm font-medium',
                  'text-gray-600 dark:text-gray-400',
                  'hover:text-gray-900 dark:hover:text-white',
                  'data-[state=active]:text-primary dark:data-[state=active]:text-primary',
                  'data-[state=active]:bg-transparent border-b-2 border-transparent',
                  'data-[state=active]:border-primary data-[state=active]:rounded-lg',
                  'dark:data-[state=active]:border-primary rounded-none',
                ].join(' ')}
                aria-selected={activeTab === tab.id}
                tabIndex={activeTab === tab.id ? 0 : -1}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="p-4 sm:p-6">
          {/*
            IMPORTANT: all four panels are mounted every time (forceMount),
            not swapped via a JS switch. Radix controls visibility with
            data-state + CSS (see the data-[state=inactive]:hidden below),
            so the DOM Googlebot sees on first render already contains
            curriculum/instructor/reviews text — not just whichever tab
            happens to be active. This is the difference between that
            content being indexable and it silently not existing.
 
            The animation is now scoped inside each panel instead of
            wrapping a conditionally-rendered node, since all panels persist.
          */}
          <TabsContent value="overview" forceMount className="mt-0 data-[state=inactive]:hidden">
            <motion.div
              initial={false}
              animate={{ opacity: activeTab === 'overview' ? 1 : 0.6 }}
              transition={{ duration: 0.2 }}
            >
              <OverviewTab course={course} />
            </motion.div>
          </TabsContent>

          <TabsContent value="curriculum" forceMount className="mt-0 data-[state=inactive]:hidden">
            <motion.div
              initial={false}
              animate={{ opacity: activeTab === 'curriculum' ? 1 : 0.6 }}
              transition={{ duration: 0.2 }}
            >
              <CurriculumTab course={course} />
            </motion.div>
          </TabsContent>

          <TabsContent value="instructor" forceMount className="mt-0 data-[state=inactive]:hidden">
            <motion.div
              initial={false}
              animate={{ opacity: activeTab === 'instructor' ? 1 : 0.6 }}
              transition={{ duration: 0.2 }}
            >
              <InstructorTab course={course} />
            </motion.div>
          </TabsContent>

          <TabsContent value="reviews" forceMount className="mt-0 data-[state=inactive]:hidden">
            <motion.div
              initial={false}
              animate={{ opacity: activeTab === 'reviews' ? 1 : 0.6 }}
              transition={{ duration: 0.2 }}
            >
              <CourseReviews course={course} />
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
