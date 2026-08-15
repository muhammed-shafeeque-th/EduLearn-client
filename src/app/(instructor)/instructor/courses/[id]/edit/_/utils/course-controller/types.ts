import { AdvancedInfoFormData, BasicInfoFormData } from '../../schemas/course-schemas';
import { Lesson, Quiz, Module } from '../../schemas/curriculum-schema';

export type EntityId = string;
export type TempId = string;

export type CurriculumOp =
  | { type: 'MODULE_CREATE'; tempId: TempId; data: Module; order: number }
  | { type: 'MODULE_UPDATE'; id: EntityId; data: Partial<Module> }
  | { type: 'MODULE_DELETE'; id: EntityId }
  | { type: 'MODULE_REORDER'; id: EntityId; newOrder: number | number[] }
  | { type: 'LESSON_CREATE'; moduleId: EntityId; tempId: TempId; data: Lesson; order: number }
  | { type: 'LESSON_UPDATE'; id: EntityId; moduleId: EntityId; data: Partial<Lesson> }
  | { type: 'LESSON_DELETE'; id: EntityId; moduleId: EntityId }
  | { type: 'LESSON_REORDER'; id: EntityId; moduleId: EntityId; newOrder: number | number[] }
  | { type: 'QUIZ_CREATE'; moduleId: EntityId; tempId: TempId; data: Quiz }
  | { type: 'QUIZ_UPDATE'; id: EntityId; moduleId: EntityId; data: Partial<Quiz> }
  | { type: 'QUIZ_DELETE'; id: EntityId; moduleId: EntityId };

export type BasicAdvancedOp =
  | { type: 'BASIC_UPDATE'; data: Partial<BasicInfoFormData> }
  | { type: 'ADVANCED_UPDATE'; data: Partial<AdvancedInfoFormData> };

export type CourseOp = CurriculumOp | BasicAdvancedOp;

export interface OpResult {
  success: boolean;
  op: CourseOp;
  error?: string;
  newId?: EntityId;
}

export interface IdMapping {
  modules: Map<TempId, EntityId>;
  lessons: Map<TempId, EntityId>;
  quizzes: Map<TempId, EntityId>;
}
