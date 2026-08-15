import { CurriculumFormData, Module, Lesson, Quiz } from '../../../schemas/curriculum-schema';

export class CurriculumSnapshot {
  constructor(private readonly data: CurriculumFormData) {}

  getModule(id: string): Module | undefined {
    console.log('Snapshot modules : ' + JSON.stringify(this.data.modules, null, 2));
    return this.data.modules.find((s) => s.id === id);
  }

  getLesson(moduleId: string, lessonId: string): Lesson | undefined {
    console.log('Snapshot lessons : ' + JSON.stringify(this.data.modules, null, 2));
    const $module = this.getModule(moduleId);
    return $module?.lessons.find((l) => l.id === lessonId);
  }

  getQuiz(moduleId: string): Quiz | undefined {
    console.log('Snapshot quizzes : ' + JSON.stringify(this.data.modules, null, 2));
    return this.getModule(moduleId)?.quiz;
  }
}
