import { Lesson, Quiz, Module } from '../schemas/curriculum-schema';
import { hasChanged } from './change-detector';

export type ChangeType = 'create' | 'update' | 'delete';

export interface EntityChange<T> {
  type: ChangeType;
  data: T;
  parentId?: string; // for lessons/quizzes inside a module
}

export interface CurriculumChanges {
  modules: EntityChange<Module>[];
  lessons: EntityChange<Lesson>[];
  quizzes: EntityChange<Quiz>[];
}

export function detectCurriculumChanges(
  originalModules: Module[],
  currentModules: Module[]
): CurriculumChanges {
  const moduleChanges: EntityChange<Module>[] = [];
  const lessonChanges: EntityChange<Lesson>[] = [];
  const quizChanges: EntityChange<Quiz>[] = [];

  const origMap = new Map(originalModules.map((s) => [s.id, s]));

  // Handle create + update
  for (const curr of currentModules) {
    const orig = origMap.get(curr.id);
    if (!orig) {
      moduleChanges.push({ type: 'create', data: curr });
    } else if (hasChanged(orig, curr, ['title', 'description'])) {
      moduleChanges.push({ type: 'update', data: curr });
    }

    // Lessons
    const origLessons = orig?.lessons ?? [];
    const currLessons = curr.lessons ?? [];
    const lessonOrigMap = new Map(origLessons.map((l) => [l.id, l]));

    for (const lesson of currLessons) {
      const origLesson = lessonOrigMap.get(lesson.id);
      if (!origLesson) {
        lessonChanges.push({ type: 'create', data: lesson, parentId: curr.id });
      } else if (
        hasChanged(origLesson, lesson, ['title', 'description', 'content', 'estimatedDuration'])
      ) {
        lessonChanges.push({ type: 'update', data: lesson, parentId: curr.id });
      }
    }

    for (const origLesson of origLessons) {
      if (!currLessons.find((l) => l.id === origLesson.id)) {
        lessonChanges.push({ type: 'delete', data: origLesson, parentId: curr.id });
      }
    }

    // Quizzes
    const origQuizzes = orig?.quizzes ?? [];
    const currQuizzes = curr.quizzes ?? [];
    const quizOrigMap = new Map(origQuizzes.map((q) => [q.id, q]));

    for (const quiz of currQuizzes) {
      const origQuiz = quizOrigMap.get(quiz.id);
      if (!origQuiz) {
        quizChanges.push({ type: 'create', data: quiz, parentId: curr.id });
      } else if (hasChanged(origQuiz, quiz, ['title', 'description', 'questions'])) {
        quizChanges.push({ type: 'update', data: quiz, parentId: curr.id });
      }
    }

    for (const origQuiz of origQuizzes) {
      if (!currQuizzes.find((q) => q.id === origQuiz.id)) {
        quizChanges.push({ type: 'delete', data: origQuiz, parentId: curr.id });
      }
    }
  }

  // Handle deletes for modules
  for (const orig of originalModules) {
    if (!currentModules.find((s) => s.id === orig.id)) {
      moduleChanges.push({ type: 'delete', data: orig });
    }
  }

  return { modules: moduleChanges, lessons: lessonChanges, quizzes: quizChanges };
}
