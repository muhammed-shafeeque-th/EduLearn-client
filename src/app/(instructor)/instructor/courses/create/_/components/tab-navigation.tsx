/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export type TabId = 'basic' | 'advanced' | 'curriculum' | 'publish';

interface Tabs {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  completed: boolean;
}

interface TabNavigationPropss {
  tabs: Tabs[];
  activeTab: string;
  onTabChange: (tabId: TabId) => void;
}

export const TabNavigations: React.FC<TabNavigationPropss> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isCompleted = tab.completed;
            const isPassed = tabs.findIndex((t) => t.id === activeTab) > index;

            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id as TabId)}
                className={`relative flex items-center space-x-6 py-4 px-2 border-b-2 whitespace-nowrap text-sm font-medium transition-all ${
                  isActive
                    ? 'border-primary text-primary dark:text-primary'
                    : isPassed || isCompleted
                      ? 'border-transparent text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
              >
                <div className={`relative ${isCompleted || isPassed ? 'text-green-500' : ''}`}>
                  <Icon className="w-5 h-5" />
                  {(isCompleted || isPassed) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <span className="hidden sm:inline">{tab.label}</span>

                {/* Progress indicator */}
                {/* {index < tabs.length - 1 && (
                  <span
                    className={`hidden md:inline ml-2 text-xs px-2 py-2 rounded-full ${
                      isActive
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                        : isPassed || isCompleted
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {index === 0 ? '7/12' : index === 1 ? '7/12' : '7/12'}
                  </span>
                )} */}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface Tab {
  id: 'basic' | 'advanced' | 'curriculum' | 'publish';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: 'basic' | 'advanced' | 'curriculum' | 'publish') => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const TabNavigation = React.memo<TabNavigationProps>(
  ({ tabs, activeTab, onTabChange, isLoading = false, disabled = false }) => {
    const activeIndex = useMemo(() => tabs.findIndex((t) => t.id === activeTab), [tabs, activeTab]);

    const handleTabClick = useCallback(
      (tabId: 'basic' | 'advanced' | 'curriculum' | 'publish', index: number) => {
        if (isLoading || disabled) return;

        // Allow navigation to previous tabs or current tab
        if (index <= activeIndex) {
          onTabChange(tabId);
        }
      },
      [activeIndex, onTabChange, isLoading, disabled]
    );

    return (
      <div className="bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            className="flex space-x-1 sm:space-x-8 overflow-x-auto scrollbar-hide"
            aria-label="Course creation steps"
          >
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isCompleted = tab.completed;
              const isPassed = activeIndex > index;
              const isAccessible = index <= activeIndex;
              const isLocked = index > activeIndex && !isCompleted;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id, index)}
                  disabled={isLocked || isLoading}
                  className={`relative flex items-center space-x-2 sm:space-x-3 py-4 px-3 sm:px-4 border-b-4 whitespace-nowrap text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'border-primary text-primary dark:text-white bg-primary/5 dark:bg-primary'
                      : isCompleted || isPassed
                        ? 'border-transparent text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                        : isAccessible
                          ? 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                          : 'border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                  whileHover={isAccessible && !isLoading ? { y: -2 } : {}}
                  whileTap={isAccessible && !isLoading ? { y: 0 } : {}}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`${tab.label} - ${isCompleted ? 'Completed' : isActive ? 'Current' : isLocked ? 'Locked' : 'Available'}`}
                >
                  {/* Icon with completion indicator */}
                  <div className="relative flex-shrink-0">
                    <Icon className="w-5 h-5" />
                    {(isCompleted || isPassed) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800"
                      >
                        <CheckCircle className="w-2.5 h-2.5 text-white" fill="currentColor" />
                      </motion.div>
                    )}

                    {isLocked && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gray-400 dark:bg-gray-600 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800"
                      >
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </div>

                  {/* Label */}
                  <span className="hidden sm:inline">{tab.label}</span>

                  {/* Mobile: Step number */}
                  <span className="sm:hidden text-xs">{index + 1}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>
      </div>
    );
  }
);

TabNavigation.displayName = 'TabNavigation';
