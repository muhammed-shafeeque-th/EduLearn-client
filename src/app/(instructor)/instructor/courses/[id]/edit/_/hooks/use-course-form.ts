/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useForm, useFieldArray, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { basicInfoSchema, advancedInfoSchema, BasicInfoFormData } from '../schemas/course-schemas';
import { CurriculumFormData, curriculumSchema } from '../schemas/curriculum-schema';
import { useFormPersistence } from './use-form-persistence';
import { Course } from '@/types/course';
import { useEffect, useMemo } from 'react';
import { generateTempId } from '../utils/course-controller/utils/utils';

export const useCourseForm = ({ course }: { course: Course }) => {
  const basicDefaults = useMemo(
    () =>
      ({
        courseId: course.id!,
        title: course.title || '',
        subTitle: course.subTitle || '',
        category: course.category || '',
        subCategory: course.subCategory || '',
        topics: course.topics?.slice() || [],
        language: course.language || '',
        subtitleLanguage: course.subtitleLanguage || '',
        level: (course.level?.toLowerCase() as any) || '',
        duration: {
          value: course.durationValue?.toString() || '',
          unit: (course.durationUnit as any) || 'days',
        },
        currency: course.currency as any,
        discountPrice: course.discountPrice ? Number(course.discountPrice) : undefined,
        price: course.price ? Number(course.price) : undefined,
      })!,
    [course]
  );

  const basicForm = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: basicDefaults,
    mode: 'onChange',
  });

  const advancedDefaults = useMemo(
    () =>
      ({
        description: course.description || '',
        thumbnail: course.thumbnail || '',
        trailer: course.trailer || '',
        learningOutcomes:
          course.learningOutcomes.length > 0
            ? course.learningOutcomes.map((outcome, idx) => ({ id: idx.toString(), text: outcome }))
            : [
                { id: '1', text: '' },
                { id: '2', text: '' },
              ],
        targetAudience:
          course.targetAudience.length > 0
            ? course.targetAudience.map((outcome, idx) => ({ id: idx.toString(), text: outcome }))
            : [
                { id: '1', text: '' },
                { id: '2', text: '' },
              ],
        requirements:
          course.requirements.length > 0
            ? course.requirements.map((outcome, idx) => ({ id: idx.toString(), text: outcome }))
            : [
                { id: '1', text: '' },
                { id: '2', text: '' },
              ],
      })!,
    [course]
  );

  const advancedForm = useForm({
    resolver: zodResolver(advancedInfoSchema),
    defaultValues: advancedDefaults,
    mode: 'onChange',
  });

  // Calculate Curriculum Defaults
  const curriculumDefaults: CurriculumFormData = useMemo(
    () =>
      ({
        modules: course.modules.map((module) => ({
          id: module.id,
          title: module.title,
          description: module.description,
          isPublished: !!module.isPublished,
          order: module.order,
          lessons: module.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            order: lesson.order,
            description: lesson.description,
            isPublished: !!lesson.isPublished,
            estimatedDuration: lesson.estimatedDuration,
            content: {
              id: generateTempId('content'),
              isPreview: lesson.isPreview,
              isPublished: !!lesson.isPublished,
              type: lesson.contentType,
              file: {
                id: generateTempId('file'),
                url: lesson.metadata?.url,
                fileSize: lesson.metadata?.fileSize,
                fileName: lesson.metadata?.fileName,
                type: lesson.metadata?.mimeType,
              },
            },
          })),
          ...(module.quiz
            ? {
                quiz: {
                  id: module.quiz.id || '',
                  title: module.quiz.title || '',
                  description: module.quiz.description || '',
                  questions:
                    module.quiz.questions.map((question) => ({
                      id: generateTempId('question'),
                      type: question.type,
                      question: question.question,
                      ...(question.options
                        ? {
                            options: question.options.map((option) => ({
                              id: generateTempId('option'),
                              text: option.value || '',
                              isCorrect: !!option.isCorrect,
                            })),
                          }
                        : undefined),
                      correctAnswer: question.correctAnswer,
                      explanation: question.explanation || '',

                      points: question.points ? Number(question.points) : undefined,
                      timeLimit: question.timeLimit ? Number(question.timeLimit) : 0,
                      required: question.required ? Boolean(question.required) : false,
                    })) || '',
                  timeLimit: module.quiz.timeLimit ? Number(module.quiz.timeLimit) : 10,
                  passingScore: module.quiz.passingScore ? Number(module.quiz.passingScore) : 70,
                  maxAttempts: module.quiz.maxAttempts ? Number(module.quiz.maxAttempts) : 3,
                  randomizeQuestions: module.quiz.randomizeQuestions
                    ? Boolean(module.quiz.randomizeQuestions)
                    : false,
                  showResults: module.quiz.showResults ? Boolean(module.quiz.showResults) : false,
                  isRequired: module.quiz.isRequired ? Boolean(module.quiz.isRequired) : false,
                },
              }
            : undefined),
          // module.quiz,
        })),
        totalDuration: 0,
        totalLessons: 0,
        totalQuizzes: 0,
      }) as unknown as CurriculumFormData,
    [course]
  );

  const curriculumForm = useForm({
    resolver: zodResolver(curriculumSchema),
    defaultValues: curriculumDefaults,
    mode: 'onChange',
  });

  // 2. CRITICAL FIX: Reset forms when server data (course prop) changes
  // This ensures 'isDirty' works correctly after a save/refetch
  useEffect(() => {
    basicForm.reset(basicDefaults);
  }, [basicDefaults, basicForm]);

  useEffect(() => {
    advancedForm.reset(advancedDefaults);
  }, [advancedDefaults, advancedForm]);

  useEffect(() => {
    curriculumForm.reset(curriculumDefaults);
  }, [curriculumDefaults, curriculumForm]);

  // Basic form instance
  // const basicForm = useForm({
  //   resolver: zodResolver(basicInfoSchema),
  //   defaultValues: {
  //     courseId: course.id!,
  //     title: course.title || '',
  //     subTitle: course.subTitle || '',
  //     category: course.category || '',
  //     subCategory: course.subCategory || '',
  //     topics: course.topics.slice() || [''],
  //     language: course.language || '',
  //     subtitleLanguage: course.subtitleLanguage || '',
  //     level: (course.level?.toLowerCase() as any) || '',
  //     duration: {
  //       value: course.durationValue?.toString() || '',
  //       unit: (course.durationUnit as any) || 'days',
  //     },
  //     currency: course.currency as any,
  //     discountPrice: course.discountPrice,
  //     price: course.price,
  //   },
  // });

  // // Advanced form instance
  // const advancedForm = useForm({
  //   resolver: zodResolver(advancedInfoSchema),
  //   defaultValues: {
  //     description: course.description || '',
  //     thumbnail: course.thumbnail || '',
  //     trailer: course.trailer || '',
  //     learningOutcomes:
  //       course.learningOutcomes.length !== 0
  //         ? course.learningOutcomes.map((outcome, idx) => ({ id: idx.toString(), text: outcome }))
  //         : [
  //             { id: '1', text: '' },
  //             { id: '2', text: '' },
  //           ],
  //     targetAudience:
  //       course.targetAudience.length !== 0
  //         ? course.targetAudience.map((outcome, idx) => ({ id: idx.toString(), text: outcome }))
  //         : [
  //             { id: '1', text: '' },
  //             { id: '2', text: '' },
  //           ],
  //     requirements:
  //       course.requirements.length !== 0
  //         ? course.requirements.map((outcome, idx) => ({ id: idx.toString(), text: outcome }))
  //         : [
  //             { id: '1', text: '' },
  //             { id: '2', text: '' },
  //           ],
  //   },
  // });

  // const CURRICULUM_DEFAULT: CurriculumFormData = {
  //   modules: course.modules.map((module) => ({
  //     id: module.id,
  //     title: module.title,
  //     description: module.description,
  //     isPublished: !!module.isPublished,
  //     order: module.order,
  //     lessons: module.lessons.map((lesson) => ({
  //       id: lesson.id,
  //       title: lesson.title,
  //       order: lesson.order,
  //       description: lesson.description,
  //       isPublished: !!lesson.isPublished,
  //       estimatedDuration: lesson.estimatedDuration,
  //       content: {
  //         id: generateTempId(),
  //         isPreview: lesson.isPreview,
  //         isPublished: !!lesson.isPublished,
  //         type: lesson.contentType,
  //         file: {
  //           id: generateId(),
  //           url: lesson.metadata?.url,
  //           fileSize: lesson.metadata?.fileSize,
  //           fileName: lesson.metadata?.fileName,
  //           type: lesson.metadata?.mimeType,
  //         },
  //       },
  //     })),
  //     ...(module.quiz
  //       ? {
  //           quiz: {
  //             id: module.quiz.id || '',
  //             title: module.quiz.title || '',
  //             description: module.quiz.description || '',
  //             questions:
  //               module.quiz.questions.map((question) => ({
  //                 id: generateId(),
  //                 type: question.type,
  //                 question: question.question,
  //                 ...(question.options
  //                   ? {
  //                       options: question.options.map((option) => ({
  //                         id: generateId(),
  //                         text: option.value || '',
  //                         isCorrect: !!option.isCorrect,
  //                       })),
  //                     }
  //                   : undefined),
  //                 correctAnswer: question.correctAnswer,
  //                 explanation: question.explanation || '',

  //                 points: question.points ? Number(question.points) : undefined,
  //                 timeLimit: question.timeLimit ? Number(question.timeLimit) : 0,
  //                 required: question.required ? Boolean(question.required) : false,
  //               })) || '',
  //             timeLimit: module.quiz.timeLimit ? Number(module.quiz.timeLimit) : 10,
  //             passingScore: module.quiz.passingScore ? Number(module.quiz.passingScore) : 70,
  //             maxAttempts: module.quiz.maxAttempts ? Number(module.quiz.maxAttempts) : 3,
  //             randomizeQuestions: module.quiz.randomizeQuestions
  //               ? Boolean(module.quiz.randomizeQuestions)
  //               : false,
  //             showResults: module.quiz.showResults ? Boolean(module.quiz.showResults) : false,
  //             isRequired: module.quiz.isRequired ? Boolean(module.quiz.isRequired) : false,
  //           },
  //         }
  //       : undefined),
  //     // module.quiz,
  //   })),
  //   totalDuration: 0,
  //   totalLessons: 0,
  //   totalQuizzes: 0,
  // } as unknown as CurriculumFormData;

  // // Curriculum form instance
  // const curriculumForm = useForm({
  //   resolver: zodResolver(curriculumSchema),
  //   defaultValues: CURRICULUM_DEFAULT,
  // });

  const { clearSavedData, saveFormData } = useFormPersistence(
    basicForm as unknown as UseFormReturn<BasicInfoFormData>,
    advancedForm,
    curriculumForm as any
  );

  // Field arrays for advanced form
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

  return {
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
  };
};
