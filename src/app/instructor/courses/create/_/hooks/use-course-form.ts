import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { basicInfoSchema, advancedInfoSchema } from '../schemas/course-schemas';
import { curriculumSchema } from '../schemas/curriculum-schema';
import { useFormPersistence } from './use-form-persistence';

const DEFAULT_BASIC_VALUES = {
  title: '',
  subTitle: '',
  category: '',
  subCategory: '',
  topics: [''],
  language: '',
  subtitleLanguage: '',
  level: 'beginner',
  duration: { value: '', unit: 'days' as const },
  price: 0,
  discountPrice: undefined,
  currency: 'INR' as const,
};

const DEFAULT_ADVANCED_VALUES = {
  description: '',
  learningOutcomes: [
    { id: '1', text: '' },
    { id: '2', text: '' },
  ],
  targetAudience: [
    { id: '1', text: '' },
    { id: '2', text: '' },
  ],
  requirements: [
    { id: '1', text: '' },
    { id: '2', text: '' },
  ],
  thumbnail: '',
  trailer: '',
};

const DEFAULT_CURRICULUM_VALUES = {
  sections: [
    {
      id: `section_${Date.now()}`,
      title: 'Section 1: Introduction',
      description: '',
      lessons: [],
      quiz: undefined,
      isPublished: true,
      order: 0,
    },
  ],
  totalDuration: 0,
  totalLessons: 0,
  totalQuizzes: 0,
};

export const useCourseForm = () => {
  const basicForm = useForm<typeof DEFAULT_BASIC_VALUES>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(basicInfoSchema) as any,
    defaultValues: DEFAULT_BASIC_VALUES,
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const advancedForm = useForm<typeof DEFAULT_ADVANCED_VALUES>({
    resolver: zodResolver(advancedInfoSchema),
    defaultValues: DEFAULT_ADVANCED_VALUES,
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const curriculumForm = useForm({
    resolver: zodResolver(curriculumSchema),
    defaultValues: DEFAULT_CURRICULUM_VALUES,
    mode: 'onChange',
    reValidateMode: 'onChange',
    criteriaMode: 'all',
  });

  const { saveFormData, clearSavedData, loadFormData } = useFormPersistence(
    basicForm,
    advancedForm,
    curriculumForm
  );

  const {
    fields: learningFields,
    append: appendLearning,
    remove: removeLearning,
  } = useFieldArray({
    control: advancedForm.control,
    name: 'learningOutcomes',
  });

  const {
    fields: audienceFields,
    append: appendAudience,
    remove: removeAudience,
  } = useFieldArray({
    control: advancedForm.control,
    name: 'targetAudience',
  });

  const {
    fields: requirementFields,
    append: appendRequirement,
    remove: removeRequirement,
  } = useFieldArray({
    control: advancedForm.control,
    name: 'requirements',
  });

  return useMemo(
    () => ({
      basicForm,
      advancedForm,
      curriculumForm,
      learningFields,
      audienceFields,
      requirementFields,
      appendLearning,
      appendAudience,
      appendRequirement,
      removeLearning,
      removeAudience,
      removeRequirement,
      saveFormData,
      clearSavedData,
      loadFormData,
      triggerBasic: basicForm.trigger,
      triggerAdvanced: advancedForm.trigger,
      triggerCurriculum: curriculumForm.trigger,
    }),
    [
      basicForm,
      advancedForm,
      curriculumForm,
      learningFields,
      audienceFields,
      requirementFields,
      appendLearning,
      appendAudience,
      appendRequirement,
      removeLearning,
      removeAudience,
      removeRequirement,
      saveFormData,
      clearSavedData,
      loadFormData,
    ]
  );
};
