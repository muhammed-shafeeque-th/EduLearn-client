'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, Loader2, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { TabId } from './tab-navigation';
import { Button } from '@/components/ui/button';

export interface ActionButtonsProps {
  activeTab: TabId;
  isLoading: boolean;
  onSave: () => void;
  onSaveAndNext: () => void;
  onSaveAndPreview: () => void;
  onPrevious: () => void;
  hasUnsavedChanges?: boolean;
  disabled?: boolean;
}

const labels: Record<Exclude<TabId, 'publish'>, string> = {
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
    hasUnsavedChanges = false,
    disabled = false,
  }) => {
    const nextButtonLabel = useMemo(() => {
      return labels[activeTab as keyof typeof labels] || 'Save & Next';
    }, [activeTab]);

    if (activeTab === 'publish') {
      return null;
    }

    const isPreviousDisabled = activeTab === 'basic';

    return (
      <div className="sticky bottom-8 left-0 right-0 z-40 px-6 mt-12 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="max-w-7xl mx-auto"
        >
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 ring-1 ring-black/5">
            {/* Left: Previous Button */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="lg"
                onClick={onPrevious}
                disabled={isPreviousDisabled || isLoading}
                className="h-12 px-6 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Step
              </Button>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                onClick={onSave}
                disabled={isLoading || disabled}
                className="h-12 px-6 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 relative group"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                )}
                Save Draft
                {hasUnsavedChanges && !isLoading && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={onSaveAndPreview}
                disabled={isLoading || disabled}
                className="h-12 px-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-none group"
              >
                <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Preview
              </Button>

              <Button
                size="lg"
                onClick={onSaveAndNext}
                disabled={isLoading || disabled}
                className="h-12 px-8 rounded-xl bg-linear-to-r from-primary via-blue-600 to-indigo-600 hover:opacity-90 transition-all shadow-lg shadow-primary/25 border-none font-bold"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    {nextButtonLabel}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Subtle info text */}
          <div className="flex justify-center mt-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Progress is automatically saved to your draft
            </p>
          </div>
        </motion.div>
      </div>
    );
  }
);

ActionButtons.displayName = 'ActionButtons';
