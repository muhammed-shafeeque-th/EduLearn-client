/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { UseFormReturn, UseFieldArrayReturn } from 'react-hook-form';
import { Upload, Video } from 'lucide-react';
import { AdvancedInfoFormData } from '../schemas/course-schemas';
import { MarkdownEditor } from '../components/markdown-editor';
import { DynamicFieldSection } from '../components/dynamic-field-section';
import { FileUpload } from '../components/file-upload';

interface AdvancedInformationTabProps {
  form: UseFormReturn<AdvancedInfoFormData>;
  learningFields: UseFieldArrayReturn<AdvancedInfoFormData, 'learningOutcomes', 'id'>['fields'];
  audienceFields: UseFieldArrayReturn<AdvancedInfoFormData, 'targetAudience', 'id'>['fields'];
  requirementFields: UseFieldArrayReturn<AdvancedInfoFormData, 'requirements', 'id'>['fields'];
  appendLearning: (data: any) => void;
  appendAudience: (data: any) => void;
  appendRequirement: (data: any) => void;
  removeLearning: (index: number) => void;
  removeAudience: (index: number) => void;
  removeRequirement: (index: number) => void;
  courseId?: string;
}

export const AdvancedInformationTab: React.FC<AdvancedInformationTabProps> = ({
  form,
  learningFields,
  audienceFields,
  requirementFields,
  appendLearning,
  appendAudience,
  appendRequirement,
  removeLearning,
  removeAudience,
  removeRequirement,
  courseId,
}) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;
  const description = watch('description');
  const thumbnail = watch('thumbnail');
  const trailer = watch('trailer');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Advanced Informations
      </h2>

      <div className="space-y-8">
        {/* Thumbnail and Trailer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FileUpload
            title="Course Thumbnail"
            description="Upload your course Thumbnail here. Important guidelines: 1200-1000 pixels in 12:8 Ratio. Supported format: jpg, jpeg, or png"
            accept="image/*"
            courseId={courseId!}
            value={thumbnail}
            onUpload={(url) => setValue('thumbnail', url)}
            error={errors.thumbnail?.message}
            icon={Upload}
            buttonText="Upload Image"
          />

          <FileUpload
            title="Course Trailer"
            description="Students who watch a well-made promo video are 5X more likely to enroll in your course. We've seen that statistic go up to 10X for exceptionally awesome videos."
            accept="video/*"
            icon={Video}
            value={trailer}
            courseId={courseId!}
            error={errors.trailer?.message}
            onUpload={(url) => setValue('trailer', url)}
            buttonText="Upload Video"
          />
        </div>

        {/* Course Description with Markdown Editor */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Course Descriptions
          </h3>
          <MarkdownEditor
            value={description || ''}
            onChange={(value) => setValue('description', value)}
            placeholder="Enter you course descriptions"
            error={errors.description?.message}
          />
        </div>

        {/* Learning Outcomes */}
        <DynamicFieldSection
          title="What you will teach in this course"
          fields={learningFields}
          register={register}
          errors={errors}
          fieldName="learningOutcomes"
          onAdd={() => appendLearning({ id: Date.now().toString(), text: '' })}
          onRemove={removeLearning}
          placeholder="What you will teach in this course..."
        />

        {/* Target Audience */}
        <DynamicFieldSection
          title="Target Audience"
          fields={audienceFields}
          register={register}
          errors={errors}
          fieldName="targetAudience"
          onAdd={() => appendAudience({ id: Date.now().toString(), text: '' })}
          onRemove={removeAudience}
          placeholder="Who this course is for..."
        />

        {/* Course Requirements */}
        <DynamicFieldSection
          title="Course requirements"
          fields={requirementFields}
          register={register}
          errors={errors}
          fieldName="requirements"
          onAdd={() => appendRequirement({ id: Date.now().toString(), text: '' })}
          onRemove={removeRequirement}
          placeholder="What is you course requirements..."
        />
      </div>
    </div>
  );
};
