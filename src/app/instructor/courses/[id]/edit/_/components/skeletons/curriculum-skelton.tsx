'use client';

import React from 'react';

export const CurriculumSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          </div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 mt-4 sm:mt-0"></div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {[...Array(3)].map((_, sectionIndex) => (
            <div
              key={sectionIndex}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Section Header */}
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-750">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded mr-3"></div>
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded mr-4"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>

              {/* Lessons */}
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {[...Array(Math.floor(Math.random() * 3) + 1)].map((_, lessonIndex) => (
                  <div key={lessonIndex} className="flex items-center p-4">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Lesson Button Skeleton */}
              <div className="p-4 bg-gray-50 dark:bg-gray-750">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Section Button Skeleton */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
        </div>
      </div>
    </div>
  );
};
