'use client';
import React from 'react';
import { UseFormReturn, Controller } from 'react-hook-form';
import { BasicInfoFormData } from '../schemas/course-schemas';
import { categories, subCategories, languages, levels, durationUnits } from '../utils/constants';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DynamicFieldSection } from '../components/dynamic-field-section';

interface BasicInformationTabProps {
  form: UseFormReturn<BasicInfoFormData>;
  topicFields: Array<{ id: string; text: string }>;
  appendTopic: (data: { id: string; text: string }) => void;
  removeTopic: (index: number) => void;
}

export const BasicInformationTab: React.FC<BasicInformationTabProps> = ({
  form,
  topicFields,
  appendTopic,
  removeTopic,
}) => {
  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const selectedCategory = watch('category');
  const titleLength = watch('title')?.length || 0;
  const subtitleLength = watch('subTitle')?.length || 0;

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-8 space-y-10">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Basic Information</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Set the foundation for your course. These details will help students find your content.
        </p>
      </div>

      <div className="space-y-8">
        {/* Title & Subtitle Section */}
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/80">Course Title</Label>
            <div className="relative group">
              <Input
                {...register('title')}
                placeholder="e.g. Master the Art of Web Design from Scratch"
                className={`h-11 px-4 rounded-xl transition-all ${
                  errors.title
                    ? 'border-destructive focus-visible:ring-destructive'
                    : 'border-border'
                }`}
                maxLength={80}
              />
              <span
                className={`absolute right-4 top-2.5 text-[10px] font-semibold ${
                  titleLength > 70 ? 'text-amber-500' : 'text-muted-foreground/50'
                }`}
              >
                {titleLength}/80
              </span>
              {errors.title && (
                <p className="text-destructive text-xs mt-1.5 flex items-center gap-1 font-medium">
                  {errors.title.message}
                </p>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Your title should be catchy and contain keywords for better search results.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/80">Course Subtitle</Label>
            <div className="relative group">
              <Input
                {...register('subTitle')}
                placeholder="e.g. Learn UI/UX principles, typography, and modern design tools."
                className={`h-11 px-4 rounded-xl transition-all ${
                  errors.subTitle
                    ? 'border-destructive focus-visible:ring-destructive'
                    : 'border-border'
                }`}
                maxLength={120}
              />
              <span
                className={`absolute right-4 top-2.5 text-[10px] font-semibold ${
                  subtitleLength > 100 ? 'text-amber-500' : 'text-muted-foreground/50'
                }`}
              >
                {subtitleLength}/120
              </span>
              {errors.subTitle && (
                <p className="text-destructive text-xs mt-1.5 flex items-center gap-1 font-medium">
                  {errors.subTitle.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/80">Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    setValue('subCategory', ''); // Reset subcategory
                  }}
                  value={field.value}
                >
                  <SelectTrigger className="h-11 rounded-xl border-border">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="rounded-lg">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-destructive text-xs mt-1 font-medium">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/80">Sub-category</Label>
            <Controller
              name="subCategory"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedCategory}
                >
                  <SelectTrigger className="h-11 rounded-xl border-border">
                    <SelectValue
                      placeholder={
                        selectedCategory ? 'Select a sub-category' : 'Select a category first'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {selectedCategory &&
                      subCategories[selectedCategory]?.map((subCat) => (
                        <SelectItem key={subCat} value={subCat} className="rounded-lg">
                          {subCat}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.subCategory && (
              <p className="text-destructive text-xs mt-1 font-medium">
                {errors.subCategory.message}
              </p>
            )}
          </div>
        </div>

        {/* Topics Section */}
        <div className="pt-4">
          <DynamicFieldSection
            title="Course Topics"
            description="What are the specific topics covered in your course? (Max 10)"
            fields={topicFields}
            register={register}
            errors={errors}
            fieldName="topics"
            onAdd={() => appendTopic({ id: Date.now().toString(), text: '' })}
            onRemove={removeTopic}
            placeholder="e.g. React Hooks"
            maxFields={10}
            minFields={1}
          />
        </div>

        {/* Language & Level Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/80">Language</Label>
            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang} className="rounded-lg">
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.language && (
              <p className="text-destructive text-xs font-medium">{errors.language.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/80">Subtitle Language</Label>
            <Controller
              name="subtitleLanguage"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select (Optional)" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang} className="rounded-lg">
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/80">Level</Label>
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-11 rounded-xl capitalize">
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {levels.map((level) => (
                      <SelectItem
                        key={level}
                        value={level.toLowerCase()}
                        className="rounded-lg capitalize"
                      >
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.level && (
              <p className="text-destructive text-xs font-medium">{errors.level.message}</p>
            )}
          </div>
        </div>

        {/* Duration Section */}
        <div className="pt-2">
          <Label className="text-sm font-semibold text-foreground/80 mb-2 block">
            Estimated Course Duration
          </Label>
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <Input
                {...register('duration.value')}
                type="number"
                placeholder="Value"
                className={`h-11 rounded-xl ${errors.duration?.value ? 'border-destructive' : 'border-border'}`}
                min={1}
              />
              {errors.duration?.value && (
                <p className="text-destructive text-xs font-medium">
                  {errors.duration.value.message}
                </p>
              )}
            </div>
            <div className="w-40">
              <Controller
                name="duration.unit"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-11 rounded-xl capitalize">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {durationUnits.map((unit) => (
                        <SelectItem key={unit} value={unit} className="rounded-lg capitalize">
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
