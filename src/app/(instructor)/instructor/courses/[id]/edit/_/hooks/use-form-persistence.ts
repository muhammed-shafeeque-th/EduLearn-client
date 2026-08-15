/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { getFromLocalStorage, removeFromLocalStorage, saveToLocalStorage } from '@/lib/utils';
import { useCallback, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AdvancedInfoFormData, BasicInfoFormData } from '../schemas/course-schemas';
import { CurriculumFormData } from '../schemas/curriculum-schema';

const STORAGE_KEY = 'course-creator-draft';
const DATA_EXPIRY = 60 * 60 * 1000; // 1hr expiry

export const useFormPersistence = (
  basicForm: UseFormReturn<BasicInfoFormData>,
  advancedForm: UseFormReturn<AdvancedInfoFormData>,
  curriculumForm: UseFormReturn<CurriculumFormData>
) => {
  // Load saved data on mount
  useEffect(() => {
    const savedData = getFromLocalStorage(STORAGE_KEY);
    if (savedData) {
      try {
        const { basic, advanced, curriculum } = savedData;
        if (basic) {
          Object.keys(basic).forEach((key) => {
            basicForm.setValue(key as any, basic[key]);
          });
        }
        if (advanced) {
          Object.keys(advanced).forEach((key) => {
            advancedForm.setValue(key as any, advanced[key]);
          });
        }
        if (curriculum) {
          Object.keys(curriculum)?.forEach((key) => {
            curriculumForm?.setValue(key as any, curriculum[key]);
          });
        }
      } catch (error) {
        console.warn('Failed to load saved course data:', error);
      }
    }
  }, [basicForm, advancedForm, curriculumForm]);

  // Save data on form changes
  const saveFormData = useCallback(() => {
    const basicData = basicForm.getValues();
    const advancedData = advancedForm.getValues();
    const curriculumData = curriculumForm.getValues();

    const dataToSave = {
      basic: basicData,
      advanced: advancedData,
      curriculum: curriculumData,
      timestamp: Date.now(),
    };

    saveToLocalStorage(STORAGE_KEY, dataToSave, Date.now() + DATA_EXPIRY);
  }, [basicForm, advancedForm, curriculumForm]);

  const clearSavedData = useCallback(() => {
    removeFromLocalStorage(STORAGE_KEY);
  }, []);

  return {
    saveFormData,
    clearSavedData,
  };
};
