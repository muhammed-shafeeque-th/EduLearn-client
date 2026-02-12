import { useState, useRef, useCallback, useEffect } from 'react';
import { VerifyEmailFormData, verifyEmailSchema } from '../schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '@/states/client';
import { useToast } from '@/hooks/use-toast';
import { resendOtp, verify } from '@/states/client/slices/auth-slice';
import { useRouter } from 'next/navigation';
import { getErrorMessage } from '@/lib/utils';

const createEmptyArray = (length: number) => Array.from({ length }, () => '');

export function useOTP(length: number = 6, email: string, username: string, userId?: string) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array.from({ length }, () => null));
  const [otpValues, setOtpValues] = useState<string[]>(() => createEmptyArray(length));
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

  const hasAutoSubmittedRef = useRef(false);

  const allDigits = otpValues.join('');
  const isComplete =
    otpValues.length === length && otpValues.every((digit) => digit !== '' && /^\d$/.test(digit));

  const defaultValues: VerifyEmailFormData = {} as VerifyEmailFormData;
  for (let i = 1; i <= length; i++) {
    defaultValues[`digit${i}` as keyof VerifyEmailFormData] = '';
  }

  const useFormReturn = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    mode: 'onChange',
    defaultValues,
  });

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (!isLoading && !isVerified) {
      hasAutoSubmittedRef.current = false;
    }
  }, [otpValues, isLoading, isVerified, allDigits]);

  useEffect(() => {
    if (
      isComplete &&
      allDigits.length === length &&
      !isLoading &&
      !isVerified &&
      !hasAutoSubmittedRef.current
    ) {
      otpValues.forEach((digit, idx) => {
        useFormReturn.setValue(`digit${idx + 1}` as keyof VerifyEmailFormData, digit);
      });
      hasAutoSubmittedRef.current = true;
      const timer = setTimeout(() => {
        useFormReturn.handleSubmit(onSubmit)();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isComplete, allDigits, otpValues, useFormReturn, isLoading, isVerified, length]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const setInputRef = useCallback(
    (index: number) => (el: HTMLInputElement | null) => {
      inputRefs.current[index] = el;
    },
    []
  );

  const focusInput = useCallback(
    (index: number) => {
      if (index >= 0 && index < length) {
        inputRefs.current[index]?.focus();
        setFocusedIndex(index);
      }
    },
    [length]
  );

  const updateOtpValue = useCallback(
    (index: number, value: string) => {
      setOtpValues((prev) => {
        const newArr = [...prev];
        newArr[index] = value;
        return newArr;
      });
      useFormReturn.setValue(`digit${index + 1}` as keyof VerifyEmailFormData, value);
      useFormReturn.trigger(`digit${index + 1}` as keyof VerifyEmailFormData);
    },
    [useFormReturn]
  );

  const handleInputChange = useCallback(
    (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, '').slice(0, 1);
      updateOtpValue(index, value);
      if (value !== '' && index < length - 1) {
        setTimeout(() => focusInput(index + 1), 0);
      }
    },
    [updateOtpValue, focusInput, length]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
        navigator.clipboard.readText().then((clipText) => {
          const pastedText = clipText.replace(/\D/g, '');
          if (!pastedText) return;
          const digits = pastedText.slice(0, length).split('');
          setOtpValues(() => {
            const arr = createEmptyArray(length);
            for (let i = 0; i < length; i++) {
              arr[i] = digits[i] || '';
              useFormReturn.setValue(`digit${i + 1}` as keyof VerifyEmailFormData, digits[i] || '');
            }
            return arr;
          });
          const focusIdx = digits.length < length ? digits.length : length - 1;
          setTimeout(() => focusInput(focusIdx), 0);
          toast.success({ title: 'Code pasted successfully!' });

          if (
            digits.length === length &&
            !isLoading &&
            !isVerified &&
            !hasAutoSubmittedRef.current
          ) {
            hasAutoSubmittedRef.current = true;
            setTimeout(() => {
              useFormReturn.handleSubmit(onSubmit)();
            }, 200);
          }
        });
        e.preventDefault();
        return;
      }

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
          break;
        default:
          if (!/^\d$/.test(e.key)) {
            e.preventDefault();
          }
          break;
      }
    },
    [otpValues, updateOtpValue, focusInput, length, toast, useFormReturn, isLoading, isVerified]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text').replace(/\D/g, '');
      if (!pastedText) return;

      const digits = pastedText.slice(0, length).split('');
      setOtpValues(() => {
        const arr = createEmptyArray(length);
        for (let i = 0; i < length; i++) {
          arr[i] = digits[i] || '';
          useFormReturn.setValue(`digit${i + 1}` as keyof VerifyEmailFormData, digits[i] || '');
        }
        return arr;
      });

      const focusIdx = digits.length < length ? digits.length : length - 1;
      setTimeout(() => focusInput(focusIdx), 0);

      toast.success({ title: 'Code pasted successfully!' });

      if (digits.length === length && !isLoading && !isVerified && !hasAutoSubmittedRef.current) {
        hasAutoSubmittedRef.current = true;
        setTimeout(() => {
          useFormReturn.handleSubmit(onSubmit)();
        }, 200);
      }
    },
    [useFormReturn, focusInput, length, toast, isLoading, isVerified]
  );

  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

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

  const onSubmit = useCallback(
    async (data: VerifyEmailFormData) => {
      setIsLoading(true);

      const code = Object.values(data).join('');

      try {
        const result = await dispatch(verify({ code, email, userId, username })).unwrap();
        if (!result.success) throw new Error(result.message);

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
        toast.error({
          title: 'Verification failed',
          description: getErrorMessage(error, 'Please try again or request a new code.'),
        });
      } finally {
        setIsLoading(false);
        hasAutoSubmittedRef.current = false;
      }
    },
    [clearAllInputs, dispatch, email, router, toast, triggerErrorShake, userId, username]
  );

  const handleResendCode = useCallback(
    async (emailParam: string, userIdParam: string, usernameParam: string) => {
      setIsResending(true);

      try {
        const result = await dispatch(
          resendOtp({ email: emailParam, userId: userIdParam, username: usernameParam })
        ).unwrap();
        if (!result.success) {
          throw new Error(result.message);
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
    },
    [dispatch, clearAllInputs, toast]
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    otpValues,
    timeLeft,
    canResend,
    focusedIndex,
    shakeError,
    isLoading,
    isResending,
    isVerified,
    isComplete,

    setOtpValues,
    setTimeLeft,
    setCanResend,
    setFocusedIndex,
    setShakeError,
    setIsLoading,
    setIsResending,
    setIsVerified,
    setInputRef,

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
