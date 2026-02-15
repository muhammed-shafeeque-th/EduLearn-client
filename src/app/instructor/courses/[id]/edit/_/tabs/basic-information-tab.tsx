'use client';
import React from 'react';
import { UseFormReturn, FieldErrors, FieldError } from 'react-hook-form';
import { BasicInfoFormData } from '../schemas/course-schemas';
import { categories, subCategories, languages, levels, durationUnits } from '../utils/constants';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Helper function to get nested field errors
const getNestedError = (errors: FieldErrors, field: string): FieldError | undefined => {
  const parts = field.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = errors;
  for (const part of parts) {
    if (!current) return undefined;
    current = current[part];
  }
  return current as FieldError | undefined;
};

interface BasicInformationTabProps {
  form: UseFormReturn<BasicInfoFormData>;
}

export const BasicInformationTab: React.FC<BasicInformationTabProps> = ({ form }) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;

  // Watch state
  const selectedCategory = watch('category');
  const titleLength = watch('title')?.length || 0;
  const subtitleLength = watch('subTitle')?.length || 0;
  const subCategory = watch('subCategory');
  const topics = watch('topics') || [];

  // Error helpers for nested duration fields and topics
  const durationValueError = getNestedError(errors, 'duration.value');
  const durationUnitError = getNestedError(errors, 'duration.unit');
  const topicsError: FieldError | undefined = errors.topics as FieldError | undefined;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Basic Information
      </h2>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </Label>
          <div className="relative">
            <Input
              {...register('title')}
              type="text"
              placeholder="Your course title"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              maxLength={80}
              autoComplete="off"
            />
            <span className="absolute right-3 top-2 text-sm text-gray-400">{titleLength}/80</span>
          </div>
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        {/* Subtitle */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subtitle
          </Label>
          <div className="relative">
            <Input
              {...register('subTitle')}
              type="text"
              placeholder="Your course subtitle"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              maxLength={120}
              autoComplete="off"
            />
            <span className="absolute right-3 top-2 text-sm text-gray-400">
              {subtitleLength}/120
            </span>
          </div>
          {errors.subTitle && (
            <p className="text-red-500 text-sm mt-1">{errors.subTitle.message}</p>
          )}
        </div>

        {/* Category and Sub-category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Course Category
            </Label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Sub-category */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Course Sub-category
            </Label>
            <select
              {...register('subCategory')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              disabled={!selectedCategory && !subCategory}
            >
              <option value="">Select...</option>
              {selectedCategory &&
                subCategories[selectedCategory]?.map((subCat) => (
                  <option key={subCat} value={subCat}>
                    {subCat}
                  </option>
                ))}
            </select>
            {errors.subCategory && (
              <p className="text-red-500 text-sm mt-1">{errors.subCategory.message}</p>
            )}
          </div>
        </div>

        {/* Course topics */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Course Topics
          </Label>
          <div className="space-y-2">
            {topics && Array.isArray(topics) && topics.length > 0
              ? topics.map((objective: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={objective}
                      onChange={(e) => {
                        const newObjectives = [...topics];
                        newObjectives[index] = e.target.value;
                        setValue('topics', newObjectives, { shouldValidate: true });
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      placeholder={`Course topic ${index + 1}`}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newObjectives = topics.filter((_: string, i: number) => i !== index);
                        setValue('topics', newObjectives, { shouldValidate: true });
                      }}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      aria-label="Remove topic"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              : null}
            <button
              type="button"
              onClick={() => {
                setValue('topics', [...(topics || []), ''], { shouldValidate: true });
              }}
              className="text-sm text-primary dark:text-primary-foreground hover:underline"
            >
              + Add Course topic
            </button>
          </div>
          {/* Show errors for topics array itself, and for empty individual topics */}
          {topicsError && typeof topicsError.message === 'string' && (
            <p className="text-red-500 text-sm mt-1">{topicsError.message}</p>
          )}
          {Array.isArray(errors.topics) &&
            errors.topics.map(
              (topicErr, i) =>
                topicErr &&
                topicErr.message && (
                  <p key={i} className="text-red-500 text-sm mt-1">
                    Topic {i + 1}: {topicErr.message}
                  </p>
                )
            )}
        </div>

        {/* Language Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Language */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Course Language
            </Label>
            <select
              {...register('language')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select...</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            {errors.language && (
              <p className="text-red-500 text-sm mt-1">{errors.language.message}</p>
            )}
          </div>
          {/* Subtitle Language */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subtitle Language (Optional)
            </Label>
            <select
              {...register('subtitleLanguage')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select...</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            {errors.subtitleLanguage && (
              <p className="text-red-500 text-sm mt-1">{errors.subtitleLanguage.message}</p>
            )}
          </div>
          {/* Level */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Course Level
            </Label>
            <select
              {...register('level')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select...</option>
              {levels.map((level) => (
                <option key={level} value={level.toLowerCase()}>
                  {level}
                </option>
              ))}
            </select>
            {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level.message}</p>}
          </div>
        </div>

        {/* Duration */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Duration
          </Label>
          <div className="flex space-x-2">
            <Input
              {...register('duration.value')}
              type="number"
              placeholder="Course duration"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              min={0}
            />
            <select
              {...register('duration.unit')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            >
              {durationUnits.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
          {/* Show errors for duration */}
          {durationValueError && (
            <p className="text-red-500 text-sm mt-1">{durationValueError.message}</p>
          )}
          {durationUnitError && (
            <p className="text-red-500 text-sm mt-1">{durationUnitError.message}</p>
          )}
          {errors.duration && typeof errors.duration.message === 'string' && (
            <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};
