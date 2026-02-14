'use client';

import React from 'react';

export const FormSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="animate-pulse">
        {/* Title */}
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>

        {/* Form fields */}
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}

          {/* Grid fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>

          {/* Textarea field */}
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="flex space-x-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TabSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="py-4 px-2">
              <div className="animate-pulse flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const HeaderSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="animate-pulse">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </div>
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
