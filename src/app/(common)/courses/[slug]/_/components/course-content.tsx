'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Only pass reviews for reviews tab
  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'overview':
        return <OverviewTab course={course} />;
      case 'curriculum':
        return <CurriculumTab course={course} />;
      case 'instructor':
        return <InstructorTab course={course} />;
      case 'reviews':
        return <CourseReviews course={course} />;
      default:
        return null;
    }
  };

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
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value={activeTab} className="mt-0" forceMount>
                {renderTabContent(activeTab)}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>
    </motion.div>
  );
}
