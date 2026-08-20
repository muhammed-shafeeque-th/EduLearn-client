'use client';

import { useState } from 'react';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="
        min-w-0 w-full
        overflow-hidden
        rounded-xl
        border border-gray-200
        bg-white
        shadow-sm
        dark:border-gray-700
        dark:bg-gray-800
      "
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-0">
        {/* Tabs navigation */}
        <div
          className="
            w-full
            min-w-0
            overflow-x-auto
            border-b border-gray-200
            dark:border-gray-700
          "
        >
          <TabsList
            className="
              inline-flex
              h-auto
              min-w-max
              justify-start
              gap-0
              bg-transparent
              p-0
            "
          >
            {TAB_MAP.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="
                  shrink-0
                  rounded-none
                  border-b-2
                  border-transparent
                  px-3 py-3
                  text-sm
                  font-medium
                  text-gray-600
                  whitespace-nowrap
                  sm:px-4 sm:py-4
                  dark:text-gray-400
                  hover:text-gray-900
                  dark:hover:text-white

                  data-[state=active]:border-primary
                  data-[state=active]:bg-transparent
                  data-[state=active]:text-primary
                "
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab content */}
        <div className="min-w-0 p-4 sm:p-6">
          <TabsContent
            value="overview"
            forceMount
            className="mt-0 min-w-0 data-[state=inactive]:hidden"
          >
            <OverviewTab course={course} />
          </TabsContent>

          <TabsContent
            value="curriculum"
            forceMount
            className="mt-0 min-w-0 data-[state=inactive]:hidden"
          >
            <CurriculumTab course={course} />
          </TabsContent>

          <TabsContent
            value="instructor"
            forceMount
            className="mt-0 min-w-0 data-[state=inactive]:hidden"
          >
            <InstructorTab course={course} />
          </TabsContent>

          <TabsContent
            value="reviews"
            forceMount
            className="mt-0 min-w-0 data-[state=inactive]:hidden"
          >
            <CourseReviews course={course} />
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
