import { CurriculumFormData, Section, Lesson, Quiz } from '../../../schemas/curriculum-schema';

export class CurriculumSnapshot {
  constructor(private readonly data: CurriculumFormData) {}

  getSection(id: string): Section | undefined {
    console.log('Snapshot sections : ' + JSON.stringify(this.data.sections, null, 2));
    return this.data.sections.find((s) => s.id === id);
  }

  getLesson(sectionId: string, lessonId: string): Lesson | undefined {
    console.log('Snapshot lessons : ' + JSON.stringify(this.data.sections, null, 2));
    const section = this.getSection(sectionId);
    return section?.lessons.find((l) => l.id === lessonId);
  }

  getQuiz(sectionId: string): Quiz | undefined {
    console.log('Snapshot quizzes : ' + JSON.stringify(this.data.sections, null, 2));
    return this.getSection(sectionId)?.quiz;
  }
}
