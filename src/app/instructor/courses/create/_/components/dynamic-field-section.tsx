/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, GripVertical, AlertCircle } from 'lucide-react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface Field {
  id: string;
  text: string;
}

interface DynamicFieldSectionProps {
  title: string;
  fields: Field[];
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  fieldName: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  placeholder: string;
  maxFields?: number;
  minFields?: number;
  description?: string;
  required?: boolean;
}

export const DynamicFieldSection: React.FC<DynamicFieldSectionProps> = ({
  title,
  fields,
  register,
  errors,
  fieldName,
  onAdd,
  onRemove,
  placeholder,
  maxFields = 8,
  minFields = 2,
  description,
  required = true,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const canRemove = fields.length > minFields;
  const canAdd = fields.length < maxFields;

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getCharacterCount = (index: number) => {
    const fieldValue = fields[index]?.text || '';
    return fieldValue.length;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
              {required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            <span
              className={`text-sm px-2 py-1 rounded-full ${
                fields.length >= minFields
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}
            >
              {fields.length}/{maxFields}
            </span>
          </div>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>

        <motion.button
          type="button"
          onClick={onAdd}
          disabled={!canAdd}
          whileHover={canAdd ? { scale: 1.02 } : {}}
          whileTap={canAdd ? { scale: 0.98 } : {}}
          className={`text-sm flex items-center px-3 py-2 rounded-lg font-medium transition-all ${
            canAdd
              ? 'text-primary dark:text-primary/70 hover:bg-primary/5 dark:hover:bg-primary border border-primary/20 dark:border-primary'
              : 'text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-gray-700'
          }`}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add new
        </motion.button>
      </div>

      {/* Field Validation Error */}
      {errors[fieldName] && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
        >
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>
            {typeof errors[fieldName]?.message === 'string' ? errors[fieldName]?.message : ''}
          </span>
        </motion.div>
      )}

      {/* Fields List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 0.2, ease: 'easeOut' },
              }}
              exit={{
                opacity: 0,
                y: -20,
                scale: 0.95,
                transition: { duration: 0.15, ease: 'easeIn' },
              }}
              className={`group relative bg-white dark:bg-gray-700 border rounded-md p-2 transition-all ${
                draggedIndex === index
                  ? 'border-primary/70 shadow-lg scale-102'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              } ${
                Array.isArray(errors[fieldName]) && errors[fieldName]?.[index]?.text
                  ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                  : ''
              }`}
            >
              <div className="flex items-start space-x-2">
                {/* Drag Handle */}
                <button
                  type="button"
                  tabIndex={0}
                  aria-label="Drag to reorder"
                  className="mt-2 cursor-move opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 bg-transparent border-none p-0"
                  onMouseDown={() => handleDragStart(index)}
                  onMouseUp={handleDragEnd}
                >
                  <GripVertical className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                </button>

                {/* Number Badge */}
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary to-blue-500 rounded-full flex items-center justify-center mt-1 shadow-sm">
                  <span className="text-sm font-bold text-white">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Input Field */}
                <div className="flex-1 space-y-2">
                  <div className="relative">
                    <textarea
                      {...register(`${fieldName}.${index}.text`, {
                        required: required ? 'This field is required' : false,
                        maxLength: {
                          value: 120,
                          message: 'Maximum 120 characters allowed',
                        },
                      })}
                      placeholder={`${placeholder} ${index + 1}`}
                      className={`w-full px-2 pt-2 pb-1 border rounded-md transition-colors focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white resize-none ${
                        Array.isArray(errors[fieldName]) && errors[fieldName]?.[index]?.text
                          ? 'border-red-300 dark:border-red-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      rows={2}
                      maxLength={120}
                    />

                    {/* Character Counter */}
                    <div className="absolute bottom-2 right-3">
                      <CharacterCounter
                        current={getCharacterCount(index)}
                        max={120}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {/* Field Error */}
                  <AnimatePresence>
                    {Array.isArray(errors[fieldName]) && errors[fieldName]?.[index]?.text && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-center text-red-600 dark:text-red-400 text-sm"
                      >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        <span>{errors[fieldName][index].text.message}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Remove Button */}
                <AnimatePresence>
                  {canRemove && index >= minFields && (
                    <motion.button
                      type="button"
                      onClick={() => onRemove(index)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex-shrink-0 mt-2 p-2 text-primary/80 hover:primary hover:bg-primary/5 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {fields.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl"
        >
          <div className="text-gray-400 mb-4">
            <Plus className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No {title.toLowerCase()} added yet
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="text-primary dark:text-primary/70 hover:underline"
          >
            Add your first {title.toLowerCase().replace(/s$/, '')}
          </button>
        </motion.div>
      )}

      {/* Add More Button (Bottom) */}
      {fields.length > 0 && canAdd && (
        <motion.button
          type="button"
          onClick={onAdd}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-primary/70 dark:hover:border-primary hover:text-primary dark:hover:text-primary/70 transition-all flex items-center justify-center space-x-2 group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Add another {title.toLowerCase().replace(/s$/, '')}</span>
        </motion.button>
      )}

      {/* Helper Text */}
      {fields.length < minFields && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center text-amber-600 dark:text-amber-400 text-sm bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          <span>
            Add at least {minFields - fields.length} more {title.toLowerCase().replace(/s$/, '')}
            {minFields - fields.length > 1 ? 's' : ''} to continue
          </span>
        </motion.div>
      )}
    </div>
  );
};

// Character Counter Component (used internally)
const CharacterCounter: React.FC<{
  current: number;
  max: number;
  className?: string;
}> = ({ current, max, className = '' }) => {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage > 80;
  const isOverLimit = current > max;

  return (
    <span
      className={`font-mono ${
        isOverLimit
          ? 'text-red-500'
          : isNearLimit
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-gray-500 dark:text-gray-400'
      } ${className}`}
    >
      {current}/{max}
    </span>
  );
};
