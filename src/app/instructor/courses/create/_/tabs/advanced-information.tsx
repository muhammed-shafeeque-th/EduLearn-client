/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { UseFormReturn, UseFieldArrayReturn } from 'react-hook-form';
import { Upload, Video, Sparkles, BookOpen } from 'lucide-react';
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
    <div className="bg-card rounded-xl shadow-sm border border-border p-8 space-y-10">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Advanced Information</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Enhance your course with media, detailed descriptions, and learning targets.
        </p>
      </div>

      <div className="space-y-10">
        {/* Media Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Upload className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground/80">Course Thumbnail</h3>
            </div>
            <FileUpload
              title=""
              description="High-quality images (1200x1000px) perform 80% better. Supported: JPG, PNG."
              accept="image/*"
              courseId={courseId!}
              value={thumbnail}
              onUpload={(url) => setValue('thumbnail', url)}
              error={errors.thumbnail?.message}
              icon={Upload}
              buttonText="Choose Image"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Video className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground/80">Course Trailer</h3>
            </div>
            <FileUpload
              title=""
              description="A great trailer can increase enrollments by 5X. Keep it under 2 minutes."
              accept="video/*"
              icon={Video}
              value={trailer}
              courseId={courseId!}
              error={errors.trailer?.message}
              onUpload={(url) => setValue('trailer', url)}
              buttonText="Upload Trailer"
            />
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-3 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground/80">Course Description</h3>
            </div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Markdown Supported
            </div>
          </div>
          <MarkdownEditor
            value={description || ''}
            onChange={(value) => setValue('description', value)}
            placeholder="Detailed course description, syllabus overview, and what makes it unique..."
            error={errors.description?.message}
            height={400}
          />
        </div>

        {/* Learning Targets */}
        <div className="grid grid-cols-1 gap-10 pt-8 border-t border-border">
          <DynamicFieldSection
            title="Learning Outcomes"
            description="What will students be able to do after completing your course?"
            fields={learningFields}
            register={register}
            errors={errors}
            fieldName="learningOutcomes"
            onAdd={() => appendLearning({ id: Date.now().toString(), text: '' })}
            onRemove={removeLearning}
            placeholder="e.g. Build a complete Next.js application"
          />

          <DynamicFieldSection
            title="Target Audience"
            description="Who is this course for? Be specific for better student matching."
            fields={audienceFields}
            register={register}
            errors={errors}
            fieldName="targetAudience"
            onAdd={() => appendAudience({ id: Date.now().toString(), text: '' })}
            onRemove={removeAudience}
            placeholder="e.g. Beginner developers curious about Backend"
          />

          <DynamicFieldSection
            title="Course Requirements"
            description="What do students need to know or have before starting?"
            fields={requirementFields}
            register={register}
            errors={errors}
            fieldName="requirements"
            onAdd={() => appendRequirement({ id: Date.now().toString(), text: '' })}
            onRemove={removeRequirement}
            placeholder="e.g. Basic understanding of JavaScript"
          />
        </div>
      </div>
    </div>
  );
};
