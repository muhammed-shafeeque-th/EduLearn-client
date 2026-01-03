import { useState, useRef, useCallback } from 'react';
import { VerifyEmailFormData, verifyEmailSchema } from '../schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { resendOtp, verify } from '@/store/slices/auth-slice';
import { useRouter } from 'next/navigation';
import { getErrorMessage } from '@/lib/utils';

// Helper to generate the correct array length
const createEmptyArray = (length: number) => Array.from({ length }, () => '');

export function useOTP(length: number = 6) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array.from({ length }, () => null));
  const [otpValues, setOtpValues] = useState<string[]>(Array.from({ length }, () => ''));
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [shakeError, setShakeError] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  // Dynamically create default values for the form
  const defaultValues: VerifyEmailFormData = {} as VerifyEmailFormData;
  for (let i = 1; i <= length; i++) {
    defaultValues[`digit${i}` as keyof VerifyEmailFormData] = '';
  }

  const useFormReturn = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    mode: 'onChange',
    defaultValues,
  });

  // Safely focus input at given index
  const focusInput = useCallback(
    (index: number) => {
      if (index >= 0 && index < length) {
        inputRefs.current[index]?.focus();
        setFocusedIndex(index);
      }
    },
    [length]
  );

  // Avoid direct state mutation, use functional update style
  const updateOtpValue = useCallback(
    (index: number, value: string) => {
      setOtpValues((prev) => {
        const next = [...prev];
        next[index] = value;
        return next;
      });
      useFormReturn.setValue(`digit${index + 1}` as keyof VerifyEmailFormData, value);
      useFormReturn.trigger(`digit${index + 1}` as keyof VerifyEmailFormData);
    },
    [useFormReturn]
  );

  // Change event: Insert only first digit and auto-move
  const handleInputChange = useCallback(
    (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      // Accept only digits (first one if pasted multiple)
      value = value.replace(/\D/g, '').slice(0, 1);

      if (!value) {
        updateOtpValue(index, '');
        return;
      }

      updateOtpValue(index, value);

      // Move focus to next only if input not empty and not at the last field
      if (index < length - 1 && value !== '') {
        // Use setTimeout to let value propagate, for accessibility
        setTimeout(() => focusInput(index + 1), 0);
      }
    },
    [updateOtpValue, focusInput, length]
  );

  // Ensure robust key handling (incl. select & navigation)
  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'Backspace':
          if (otpValues[index]) {
            updateOtpValue(index, '');
          } else if (index > 0) {
            focusInput(index - 1);
            updateOtpValue(index - 1, '');
          }
          e.preventDefault();
          break;
        case 'Delete':
          updateOtpValue(index, '');
          e.preventDefault();
          break;
        case 'ArrowLeft':
          if (index > 0) focusInput(index - 1);
          e.preventDefault();
          break;
        case 'ArrowRight':
          if (index < length - 1) focusInput(index + 1);
          e.preventDefault();
          break;
        case 'Home':
          focusInput(0);
          e.preventDefault();
          break;
        case 'End':
          focusInput(length - 1);
          e.preventDefault();
          break;
        case 'Tab':
          // Convert shift-tab (reverse tab)
          break;
        default:
          if (!/^\d$/.test(e.key)) {
            e.preventDefault();
          }
          break;
      }
    },
    [otpValues, updateOtpValue, focusInput, length]
  );

  // Modern robust paste handler: Fills the OTP field-by-field, focuses last filled
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text').replace(/\D/g, '');
      if (!pastedText) return;

      const digits = pastedText.slice(0, length).split('');
      setOtpValues((prev) => {
        const newVals = [...prev];
        for (let i = 0; i < length; i++) {
          newVals[i] = digits[i] || '';
          useFormReturn.setValue(`digit${i + 1}` as keyof VerifyEmailFormData, digits[i] || '');
        }
        return newVals;
      });

      // Focus on the first empty, or last field if filled
      const focusIdx = digits.length < length ? digits.length : length - 1;
      setTimeout(() => focusInput(focusIdx), 0);

      toast.success({ title: 'Code pasted successfully!' });
    },
    [useFormReturn, focusInput, length, toast]
  );

  // Update focused field index onFocus for styling/cursor movement
  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  // Reset all OTP fields & focus first; for accessibility
  const clearAllInputs = useCallback(() => {
    setOtpValues(createEmptyArray(length));
    for (let i = 1; i <= length; i++) {
      useFormReturn.setValue(`digit${i}` as keyof VerifyEmailFormData, '');
    }
    setTimeout(() => focusInput(0), 0);
    setShakeError(false);
  }, [useFormReturn, focusInput, length]);

  const triggerErrorShake = useCallback(() => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 600);
  }, []);

  // Robust onSubmit handling, disables interaction during processing
  const onSubmit = async (
    data: VerifyEmailFormData,
    email: string,
    username: string,
    userId?: string
  ) => {
    setIsLoading(true);

    const code = Object.values(data).join('');

    try {
      const result = await dispatch(verify({ code, email, userId, username }));

      if (result.meta.requestStatus === 'rejected') {
        toast.error({ title: result.payload as string });
        triggerErrorShake();
        clearAllInputs();
        return;
      }

      setIsVerified(true);
      toast.success({
        title: 'Email verified successfully!',
        description: 'Welcome to EduLearn! Your account is now active.',
        options: { duration: 5000 },
      });
      setTimeout(() => {
        router.push('/?message=welcome to EduLearn');
      }, 3000);
    } catch (error) {
      triggerErrorShake();
      clearAllInputs();

      if (error instanceof Error) {
        toast.error({ title: error.message, description: 'Please check the code and try again.' });
      } else {
        toast.error({
          title: 'Verification failed',
          description: 'Please try again or request a new code.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code, clear all fields, reset timer
  const handleResendCode = async (email: string, userId: string, username: string) => {
    setIsResending(true);

    try {
      const result = await dispatch(resendOtp({ email, userId, username }));
      if (result.meta.requestStatus === 'rejected') {
        toast.error({ title: result.payload as string });
        return;
      }

      setTimeLeft(60);
      setCanResend(false);
      clearAllInputs();

      toast.success({
        title: 'New code sent!',
        description: 'Check your email for the new verification code.',
      });
    } catch (error) {
      toast.error({
        title: 'Failed to resend code',
        description: getErrorMessage(error, 'Please try again later.'),
      });
    } finally {
      setIsResending(false);
    }
  };

  // Helper: formats time left as m:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Expose only necessary functions & state for the Form
  return {
    otpValues,
    timeLeft,
    canResend,
    focusedIndex,
    shakeError,
    isLoading,
    isResending,
    isVerified,

    setOtpValues,
    setTimeLeft,
    setCanResend,
    setFocusedIndex,
    setShakeError,
    setIsLoading,
    setIsResending,
    setIsVerified,

    inputRefs,
    handleKeyDown,
    handlePaste,
    updateOtpValue,
    focusInput,
    formatTime,
    handleResendCode,
    onSubmit,
    handleFocus,
    handleInputChange,
    useFormReturn,
    clearAllInputs,
  };
}
