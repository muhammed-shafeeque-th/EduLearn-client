import { CoursePayload, QuizPayload } from '@/types/course';
import { Lesson, Quiz, Section } from '../../../schemas/curriculum-schema';
import { AdvancedInfoFormData, BasicInfoFormData } from '../../../schemas/course-schemas';

export function buildCoursePayload(
  basic: Partial<BasicInfoFormData>,
  advanced: Partial<AdvancedInfoFormData>
): Partial<CoursePayload> {
  return {
    courseId: basic.courseId,
    title: basic.title,
    category: basic.category,
    subCategory: basic.subCategory,
    language: basic.language,
    durationUnit: basic.duration?.unit,
    durationValue: basic.duration?.value,
    level: basic.level,
    subTitle: basic.subTitle,
    subtitleLanguage: basic.subtitleLanguage,
    topics: basic.topics,
    price: basic.price!,
    discountPrice: basic.discountPrice,
    currency: basic.currency,
    description: advanced.description,
    learningOutcomes: advanced?.learningOutcomes?.map((o) => o.text),
    targetAudience: advanced?.targetAudience?.map((o) => o.text),
    requirements: advanced?.requirements?.map((o) => o.text),
    thumbnail: advanced.thumbnail,
    trailer: advanced.trailer,
  };
}

export function buildSectionPayload(section: Partial<Section>) {
  return {
    title: section.title,
    description: section.description,
    order: section.order,
    isPublished: section.isPublished,
  };
}

export function buildLessonPayload(lesson: Partial<Lesson>) {
  return {
    title: lesson.title,
    description: lesson.description,
    order: lesson.order,
    isPublished: lesson.isPublished,
    estimatedDuration: lesson.estimatedDuration,
    contentType: lesson.content?.type,
    contentUrl: lesson.content?.file?.url,
    isPreview: lesson.content?.isPreview,
    metadata: {
      fileName: lesson.content?.file?.name,
      mimeType: lesson.content?.file?.type,
      fileSize: lesson.content?.file?.size ? parseInt(lesson.content?.file?.size) : undefined,
      title: lesson.content?.file?.name,
      url: lesson.content?.file?.url,
    },
  };
}

export function mapToQuizPayload(quiz: Partial<Quiz>): QuizPayload {
  return {
    title: quiz.title!,
    description: quiz.description,
    maxAttempts: quiz.maxAttempts,
    showResults: quiz.showResults,
    isRequired: quiz.isRequired,
    passingScore: quiz.passingScore,
    timeLimit: quiz.timeLimit,
    questions:
      quiz.questions?.map((q) => ({
        question: q.question,
        type: q.type,
        explanation: q.explanation,
        points: q.points,
        required: q.required,
        timeLimit: q.timeLimit,
        options: q.options?.map((opt) => ({ value: opt.text!, isCorrect: opt.isCorrect })),
      })) || [],
  };
}
