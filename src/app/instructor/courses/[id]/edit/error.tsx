'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Course editor error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>

        <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h2>

        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          We encountered an error while loading the course editor. Please try again.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/instructor/courses"
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-center rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Back to Courses
          </Link>
        </div>

        {error.digest && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
