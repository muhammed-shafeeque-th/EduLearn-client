import { AdvancedInfoFormData, BasicInfoFormData } from '../../schemas/course-schemas';
import { Lesson, Quiz, Section } from '../../schemas/curriculum-schema';

export type EntityId = string;
export type TempId = string;

export type CurriculumOp =
  | { type: 'SECTION_CREATE'; tempId: TempId; data: Section; order: number }
  | { type: 'SECTION_UPDATE'; id: EntityId; data: Partial<Section> }
  | { type: 'SECTION_DELETE'; id: EntityId }
  | { type: 'SECTION_REORDER'; id: EntityId; newOrder: number | number[] }
  | { type: 'LESSON_CREATE'; sectionId: EntityId; tempId: TempId; data: Lesson; order: number }
  | { type: 'LESSON_UPDATE'; id: EntityId; sectionId: EntityId; data: Partial<Lesson> }
  | { type: 'LESSON_DELETE'; id: EntityId; sectionId: EntityId }
  | { type: 'LESSON_REORDER'; id: EntityId; sectionId: EntityId; newOrder: number | number[] }
  | { type: 'QUIZ_CREATE'; sectionId: EntityId; tempId: TempId; data: Quiz }
  | { type: 'QUIZ_UPDATE'; id: EntityId; sectionId: EntityId; data: Partial<Quiz> }
  | { type: 'QUIZ_DELETE'; id: EntityId; sectionId: EntityId };

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
  sections: Map<TempId, EntityId>;
  lessons: Map<TempId, EntityId>;
  quizzes: Map<TempId, EntityId>;
}
