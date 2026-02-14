'use client';

import { FC, memo, useCallback } from 'react';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface CourseHeaderProps {
  isLoading: boolean;
  clearFormData: () => void;
}

export const CourseHeader: FC<CourseHeaderProps> = memo(function CourseHeader({
  clearFormData,
  isLoading,
}) {
  const router = useRouter();

  // Memoize the back/clear handlers for performance and clean re-renders
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleClear = useCallback(() => {
    if (!isLoading) clearFormData();
  }, [clearFormData, isLoading]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              type="button"
              title="Go back"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" aria-hidden="true" />
            </button>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                Edit course
              </h2>
            </div>
          </div>
          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="flex items-center text-red-700 dark:text-red-300 px-3 py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/10 border border-red-200 dark:border-red-700 focus:outline-none text-base transition"
              title="Clear all course data"
              aria-label="Clear all course data"
            >
              <RefreshCw className="w-5 h-5 mr-2" aria-hidden="true" />
              Reset
            </button>
            {isLoading && (
              <div className="flex items-center space-x-2" aria-live="polite">
                <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
                <span className="text-base text-primary">Saving...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
});
