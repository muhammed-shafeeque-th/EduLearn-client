'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotFoundIllustration } from './not-found-illustration';
import { NotFoundSkeleton } from './skeletons/not-found-skeleton';
import Link from 'next/link';
import CommonHeader from '@/app/_/header';

export function NotFoundPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (isLoading) {
    return <NotFoundSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Common Header Only */}
      <CommonHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-16 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-6xl md:text-8xl font-bold text-gray-200 dark:text-gray-700"
                >
                  404
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
                >
                  Oops! Page not found
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed"
                >
                  Something went wrong. It looks like your requested page could not be found. The
                  link might be broken or the page may have been removed.
                </motion.p>
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="flex items-center gap-2 border-primary/20 dark:border-primary/80 hover:bg-primary/5 dark:hover:bg-primary/90"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </Button>

                <Button
                  onClick={handleGoHome}
                  className="flex items-center gap-2 bg-primary/80 hover:bg-primary/90 dark:text-white"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>

                <Button
                  onClick={handleRefresh}
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </motion.div>

              {/* Helpful Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-3"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Popular pages:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['All Courses', 'Web Development', 'Data Science', 'Mobile Development'].map(
                    (link, index) => (
                      <motion.a
                        key={link}
                        href={`/courses?categories=${link.toLowerCase().replace(/ /g, '-')}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="px-3 py-1 text-sm bg-primary/15 dark:bg-primary/50 text-primary/70 dark:text-white/70 rounded-full hover:bg-primary/20 dark:hover:bg-primary/80 transition-colors"
                      >
                        {link}
                      </motion.a>
                    )
                  )}
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-center lg:justify-end"
            >
              <NotFoundIllustration />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © 2024 . All rights reserved
            </div>
            <div className="flex space-x-6 text-sm">
              <Link
                href="/faqs"
                className="text-gray-600 dark:text-gray-400 hover:text-primary/50 transition-colors"
              >
                FAQs
              </Link>
              <Link
                href="/privacy"
                className="text-gray-600 dark:text-gray-400 hover:text-primary/50 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 dark:text-gray-400 hover:text-primary/50 transition-colors"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
