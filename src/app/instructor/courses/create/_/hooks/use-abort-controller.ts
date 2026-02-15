import { useCallback, useRef, useEffect } from 'react';

export const useAbortController = () => {
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    controllerRef.current = new AbortController();
    return () => controllerRef.current?.abort();
  }, []);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
  }, []);

  return {
    signal: controllerRef.current?.signal || new AbortController().signal,
    abort,
  };
};
