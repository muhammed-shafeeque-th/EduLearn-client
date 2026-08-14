'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  completed: boolean;
  hasError?: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) => {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => {
        const isCurrent = step.id === currentStep;
        // const isPast = index < currentStepIndex;
        const isCompleted = step.completed;
        const hasError = step.hasError;

        return (
          <React.Fragment key={step.id}>
            {/* Step */}
            <motion.button
              type="button"
              onClick={() => onStepClick?.(step.id)}
              disabled={!onStepClick}
              whileHover={onStepClick ? { scale: 1.05 } : {}}
              whileTap={onStepClick ? { scale: 0.95 } : {}}
              className={`flex flex-col items-center space-y-2 ${
                onStepClick ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              {/* Step Circle */}
              <div
                className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  isCurrent
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : isCompleted
                      ? 'border-green-500 bg-green-500 text-white'
                      : hasError
                        ? 'border-red-500 bg-red-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : hasError ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <span
                className={`text-xs font-medium text-center max-w-16 ${
                  isCurrent
                    ? 'text-orange-600 dark:text-orange-400'
                    : isCompleted
                      ? 'text-green-600 dark:text-green-400'
                      : hasError
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </motion.button>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 bg-gray-200 dark:bg-gray-700 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: index < currentStepIndex ? '100%' : '0%',
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-green-500"
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
