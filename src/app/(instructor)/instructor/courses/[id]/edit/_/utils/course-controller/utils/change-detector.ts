/* eslint-disable @typescript-eslint/no-explicit-any */

import { FormState, UseFormReturn } from 'react-hook-form';
import { AdvancedInfoFormData, BasicInfoFormData } from '../../../schemas/course-schemas';

/**
 * Integrates with React Hook Form's built-in dirty tracking
 * No need to manually diff - RHF already knows what changed
 */
export class FormChangeDetector {
  /**
   * Check if basic/advanced forms have changes
   */
  static hasBasicAdvancedChanges(
    basicForm: UseFormReturn<BasicInfoFormData>,
    advancedForm: UseFormReturn<AdvancedInfoFormData>
  ): boolean {
    return basicForm.formState.isDirty || advancedForm.formState.isDirty;
  }

  /**
   * Get dirty fields from React Hook Form
   */
  static getDirtyFields<T extends Record<string, any>>(
    values: T,
    formState: FormState<T>
  ): Partial<T> {
    const dirtyFields = formState.dirtyFields;

    const changes: Partial<T> = {};
    for (const key in dirtyFields) {
      if (dirtyFields[key]) {
        changes[key] = values[key];
      }
    }
    return changes;
  }

  static getDirtyPayload<T extends Record<string, any>>(
    values: T,
    dirtyFields: FormState<T>['dirtyFields']
  ): Partial<T> {
    const result: Partial<T> = {};

    for (const key in dirtyFields) {
      if (dirtyFields[key]) {
        result[key] = values[key];
      }
    }

    return result;
  }
}
