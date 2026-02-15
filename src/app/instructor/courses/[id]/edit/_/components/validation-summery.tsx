'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';

interface ValidationItem {
  id: string;
  label: string;
  status: 'valid' | 'invalid' | 'warning' | 'info';
  message?: string;
}

interface ValidationGroup {
  title: string;
  items: ValidationItem[];
}

interface ValidationSummaryProps {
  groups: ValidationGroup[];
  className?: string;
  showOnlyErrors?: boolean;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  groups,
  className = '',
  showOnlyErrors = false,
}) => {
  const getStatusIcon = (status: ValidationItem['status']) => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'invalid':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: ValidationItem['status']) => {
    switch (status) {
      case 'valid':
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20';
      case 'invalid':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const filteredGroups = showOnlyErrors
    ? groups
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) => item.status === 'invalid' || item.status === 'warning'
          ),
        }))
        .filter((group) => group.items.length > 0)
    : groups;

  if (filteredGroups.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence>
        {filteredGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">{group.title}</h3>

            <div className="space-y-2">
              {group.items.map((item, itemIndex) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (groupIndex * group.items.length + itemIndex) * 0.05 }}
                  className={`flex items-start space-x-3 p-3 border rounded-lg ${getStatusColor(item.status)}`}
                >
                  {getStatusIcon(item.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </p>
                    {item.message && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {item.message}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
