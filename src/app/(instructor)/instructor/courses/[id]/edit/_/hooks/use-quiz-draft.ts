import { useEffect, useRef, useState, useCallback } from 'react';
import { quizSchema, Quiz } from '../schemas/curriculum-schema';
import { ZodError } from 'zod';

interface UseQuizDraftOptions {
  quiz: Quiz | undefined;
  active: boolean;
  onCommit: (quiz: Quiz) => void;
  autoCommitDelay?: number;
}

interface ValidationError {
  path: string;
  message: string;
}

export function useQuizDraft({
  quiz,
  active,
  onCommit,
  autoCommitDelay = 3000,
}: UseQuizDraftOptions) {
  const [draft, setDraft] = useState<Quiz | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const lastCommittedRef = useRef<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isCommittingRef = useRef(false);

  useEffect(() => {
    if (!active || !quiz) {
      setDraft(null);
      setValidationErrors([]);
      setIsDirty(false);
      return;
    }

    const cloned = structuredClone(quiz);
    setDraft(cloned);
    lastCommittedRef.current = JSON.stringify(cloned);
    setIsDirty(false);
    setValidationErrors([]);
  }, [active, quiz]);

  const validateDraft = useCallback(
    (
      draftToValidate: Quiz
    ): {
      isValid: boolean;
      errors: ValidationError[];
    } => {
      const parsed = quizSchema.safeParse(draftToValidate);

      if (parsed.success) {
        return { isValid: true, errors: [] };
      }

      const errors: ValidationError[] = [];
      if (parsed.error instanceof ZodError) {
        parsed.error.errors.forEach((err) => {
          errors.push({
            path: err.path.join('.'),
            message: err.message,
          });
        });
      }

      return { isValid: false, errors };
    },
    []
  );

  const commitDraft = useCallback(
    (force = false) => {
      if (!draft || isCommittingRef.current) return false;

      const current = JSON.stringify(draft);

      if (!force && current === lastCommittedRef.current) {
        return false;
      }

      const { isValid, errors } = validateDraft(draft);
      setValidationErrors(errors);

      if (!isValid && !force) {
        console.warn('Quiz draft invalid, not committing', errors);
        return false;
      }

      isCommittingRef.current = true;
      try {
        onCommit(draft);
        lastCommittedRef.current = current;
        setIsDirty(false);
        setValidationErrors([]);
        return true;
      } catch (error) {
        console.error('Quiz commit failed', error);
        return false;
      } finally {
        isCommittingRef.current = false;
      }
    },
    [draft, onCommit, validateDraft]
  );

  useEffect(() => {
    if (!active || !draft || !isDirty || !autoCommitDelay) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      commitDraft(false);
    }, autoCommitDelay);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [draft, isDirty, active, autoCommitDelay, commitDraft]);

  useEffect(() => {
    if (!active) return;

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      commitDraft(false);
    };
  }, [active, commitDraft]);

  const updateDraft = useCallback((updater: (prev: Quiz) => Quiz) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const updated = updater(prev);
      setIsDirty(true);
      return updated;
    });
  }, []);

  const commit = useCallback(() => {
    return commitDraft(false);
  }, [commitDraft]);

  const forceCommit = useCallback(() => {
    return commitDraft(true);
  }, [commitDraft]);

  const resetDraft = useCallback(() => {
    if (!quiz) return;
    const cloned = structuredClone(quiz);
    setDraft(cloned);
    lastCommittedRef.current = JSON.stringify(cloned);
    setIsDirty(false);
    setValidationErrors([]);
  }, [quiz]);

  return {
    draft,
    setDraft,
    updateDraft,
    commit,
    forceCommit,
    resetDraft,
    isDirty,
    validationErrors,
    hasErrors: validationErrors.length > 0,
  };
}
