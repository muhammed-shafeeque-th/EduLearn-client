'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { TabId } from './tab-navigation';

export interface ActionButtonsProps {
  activeTab: TabId;
  isLoading: boolean;
  onSave: () => void;
  onSaveAndNext: () => void;
  onSaveAndPreview: () => void;
  onPrevious: () => void;
  hasUnsavedChanges?: () => boolean;
  disabled?: boolean;
}

const labels: Record<Exclude<TabId, 'submit'>, string> = {
  basic: 'Save & Continue',
  advanced: 'Save & Continue',
  curriculum: 'Review Course',
};

export const ActionButtons: React.FC<ActionButtonsProps> = React.memo(
  ({
    activeTab,
    isLoading,
    onSave,
    onSaveAndNext,
    onSaveAndPreview,
    onPrevious,
    hasUnsavedChanges = () => false,
    disabled = false,
  }) => {
    // Hide action buttons when on the submit tab
    // Memoize the label for the next button
    const nextButtonLabel = useMemo(() => {
      // Although this can't hit 'submit', defensively fallback
      return labels[activeTab as keyof typeof labels] || 'Save & Next';
    }, [activeTab]);

    if (activeTab === 'submit') {
      return null;
    }

    const isPreviousDisabled = activeTab === 'basic';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700 gap-4"
      >
        {/* Previous Button */}
        <motion.button
          type="button"
          whileHover={!isPreviousDisabled && !isLoading ? { scale: 1.02 } : {}}
          whileTap={!isPreviousDisabled && !isLoading ? { scale: 0.98 } : {}}
          onClick={onPrevious}
          disabled={isPreviousDisabled || isLoading}
          className={`inline-flex items-center px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            isPreviousDisabled || isLoading
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
              : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
          }`}
          aria-label="Previous step"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </motion.button>

        {/* Right: Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Save Draft Button */}
          <motion.button
            type="button"
            whileHover={!isLoading && !disabled ? { scale: 1.02 } : {}}
            whileTap={!isLoading && !disabled ? { scale: 0.98 } : {}}
            onClick={onSave}
            disabled={isLoading || disabled}
            className="relative w-full sm:w-auto px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center font-medium"
            aria-label="Save draft"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Draft
            {hasUnsavedChanges() && !isLoading && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
            )}
          </motion.button>

          {/* Preview Button */}
          <motion.button
            type="button"
            whileHover={!isLoading && !disabled ? { scale: 1.02 } : {}}
            whileTap={!isLoading && !disabled ? { scale: 0.98 } : {}}
            onClick={onSaveAndPreview}
            disabled={isLoading || disabled}
            className="w-full sm:w-auto px-6 py-2.5 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:border-blue-300 dark:hover:border-blue-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center font-medium"
            aria-label="Preview course"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            Preview
          </motion.button>

          {/* Primary Action: Save & Next */}
          {nextButtonLabel && (
            <motion.button
              type="button"
              whileHover={!isLoading && !disabled ? { scale: 1.02 } : {}}
              whileTap={!isLoading && !disabled ? { scale: 0.98 } : {}}
              onClick={onSaveAndNext}
              disabled={isLoading || disabled}
              className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-primary/80 to-blue-600 hover:from-primary hover:to-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold inline-flex items-center justify-center shadow-lg hover:shadow-xl"
              aria-label={nextButtonLabel}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  {nextButtonLabel}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }
);
ActionButtons.displayName = 'ActionButtons';
