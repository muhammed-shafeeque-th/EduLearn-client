/* eslint-disable @typescript-eslint/no-explicit-any */
import { AdvancedInfoFormData, BasicInfoFormData } from '../schemas/course-schemas';

export interface CourseFormData extends BasicInfoFormData, AdvancedInfoFormData {}

export interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  completed: boolean;
}

export interface FileUploadConfig {
  accept: string;
  maxSize: number;
  allowedTypes: string[];
}

export interface FormStepConfig {
  id: string;
  title: string;
  description?: string;
  isOptional?: boolean;
  validationSchema: any;
}
