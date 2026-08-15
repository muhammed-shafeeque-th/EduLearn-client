/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';

const STORAGE_KEY = 'course-creator-draft';
const AUTO_SAVE_DELAY = 1000; // 1 second
const DATA_EXPIRY = 60 * 60 * 1000; // 1 hour

interface SavedFormData {
  basic: any;
  advanced: any;
  curriculum: any;
  timestamp: number;
  version: number;
}

const SCHEMA_VERSION = 1;

export const useFormPersistence = (
  basicForm: UseFormReturn<any>,
  advancedForm: UseFormReturn<any>,
  curriculumForm: UseFormReturn<any>
) => {
  const hasLoadedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Validate saved data structure
  const validateSavedData = (data: unknown): data is SavedFormData => {
    if (!data || typeof data !== 'object') return false;
    const d = data as Record<string, unknown>;
    return (
      d.version === SCHEMA_VERSION &&
      typeof d.basic === 'object' &&
      typeof d.advanced === 'object' &&
      typeof d.curriculum === 'object'
    );
  };

  // Load saved data on mount
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored) as SavedFormData;

      if (!validateSavedData(parsed)) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      // Check expiry
      if (Date.now() - parsed.timestamp > DATA_EXPIRY) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      // Restore data with fallbacks
      if (parsed.basic) {
        Object.entries(parsed.basic).forEach(([key, value]) => {
          basicForm.setValue(key as any, value);
        });
      }

      if (parsed.advanced) {
        Object.entries(parsed.advanced).forEach(([key, value]) => {
          advancedForm.setValue(key as any, value);
        });
      }

      if (parsed.curriculum) {
        Object.entries(parsed.curriculum).forEach(([key, value]) => {
          curriculumForm.setValue(key as any, value);
        });
      }
    } catch (error) {
      console.warn('Failed to restore form data:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [advancedForm, basicForm, curriculumForm]);

  // Debounced save function
  const saveFormData = useCallback(() => {
    clearTimeout(saveTimeoutRef.current!);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const data: SavedFormData = {
          basic: basicForm.getValues(),
          advanced: advancedForm.getValues(),
          curriculum: curriculumForm.getValues(),
          timestamp: Date.now(),
          version: SCHEMA_VERSION,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.warn('Failed to save form data:', error);
      }
    }, AUTO_SAVE_DELAY);
  }, [basicForm, advancedForm, curriculumForm]);

  const loadFormData = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load form data:', error);
      return null;
    }
  }, []);

  const clearSavedData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    clearTimeout(saveTimeoutRef.current!);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeout(saveTimeoutRef.current!);
  }, []);

  return { saveFormData, clearSavedData, loadFormData };
};
