'use client';

import { useCurrentUser, useRegisterInstructor } from '@/states/server/user/use-current-user';
import { useAuthUserSelector } from '@/states/client';
import { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  Agreement,
  agreementSchema,
  PersonalInfo,
  personalInfoSchema,
  ProfessionalInfo,
  professionalInfoSchema,
  // SocialInfo,
  // socialInfoSchema,
} from '../schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { steps } from '../constants';
import { triggerClientRefresh } from '@/lib/auth/auth-client-apis';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';
import { Instructor } from '@/types/user';
import { useRouter } from 'next/navigation';

// Utility type for safe field triggering
// type PersonalFormFields = 'username' | 'headline' | 'biography' | 'tags' | `tags.${number}`;

export function useInstructorRegister() {
  const authUser = useAuthUserSelector();
  const router = useRouter();

  const { data } = useCurrentUser({ enabled: !!authUser?.userId });
  const user = data as Instructor | undefined;

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Default values are calculated via useMemo for performance and sync with user data
  // const defaultPersonalValues = useMemo<Partial<PersonalInfo>>(
  //   () => ({
  //     biography: user?.instructorProfile?.bio || user?.profile?.bio || '',
  //     headline: user?.instructorProfile?.headline || '',
  //     username: user?.username || '',
  //     tags: [],
  //   }),
  //   [user]
  // );

  // -- Forms (One per step, all using zod validation) --
  const personalForm = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    mode: 'onTouched', // Use onTouched to provide fast error feedback on blur (Best UX for multi-step)
    reValidateMode: 'onChange', // Re-validate on change after first error to clear errors immediately
    defaultValues: {
      biography: user?.instructorProfile?.bio || user?.profile?.bio || '',
      headline: user?.instructorProfile?.headline || '',
      username: user?.username || '',
      tags: [],
    },
    shouldFocusError: true,
  });

  const professionalForm = useForm<ProfessionalInfo>({
    resolver: zodResolver(professionalInfoSchema),
    mode: 'onTouched',
    reValidateMode: 'onChange', // Re-validate on change after first error to clear errors immediately
    defaultValues: {
      education: '',
      experience: '',
      expertise: '',
      language: '',
    },
    shouldFocusError: true,
  });

  const agreementForm = useForm<Agreement>({
    resolver: zodResolver(agreementSchema),
    defaultValues: {
      agreeToPrivacy: false,
      agreeToTerms: false,
      receiveUpdates: false,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  });

  // -- Progress calculation --
  const progress = useMemo(() => (currentStep / steps.length) * 100, [currentStep]);

  // -- Registration mutation --
  const {
    mutateAsync: registerInstructor,
    isPending: isSubmitting,
    isSuccess,
    isError,
    error,
  } = useRegisterInstructor();

  // Helper: This triggers all invalid fields to touch/show error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function touchAllFields(form: ReturnType<typeof useForm<any>>) {
    // Only attempt on valid form refs
    if (!form?.getFieldState) return;
    const values = form.getValues();
    Object.keys(values).forEach((field) => {
      form.setFocus(field, { shouldSelect: true });
      form.setError(field, {
        message: form?.formState?.errors?.[field]?.message as string,
        type: 'manual',
      });
    });
  }

  const nextStep = useCallback(async () => {
    let isValid = true;
    switch (currentStep) {
      case 1: {
        // Use all field names for safer typing than "all"
        // Instead of passing explicit field names, passing `undefined` (or no argument) to trigger()
        // will validate all fields in the form.
        isValid = await personalForm.trigger(undefined, { shouldFocus: true });
        break;
      }
      // Uncomment this block when/if socialForm is added in the future.
      // case 2:
      //   isValid = await socialForm.trigger();
      //   break;
      case 2:
        isValid = await professionalForm.trigger(undefined, { shouldFocus: true });
        break;
      case 3:
        isValid = await agreementForm.trigger(undefined, { shouldFocus: true });
        break;
      default:
        isValid = true;
    }

    if (isValid && currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, personalForm, professionalForm, agreementForm]);

  // Handle step backward
  const prevStep = useCallback(() => {
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const onSubmit = useCallback(async () => {
    // Always validate agreement step explicitly before submit
    const agreementValid = await agreementForm.trigger(undefined, { shouldFocus: true });

    if (!agreementValid) {
      touchAllFields(agreementForm);
      return;
    }

    try {
      // Combine all forms' values
      const formData = {
        ...personalForm.getValues(),
        // ...socialForm.getValues(),
        ...professionalForm.getValues(),
        ...agreementForm.getValues(),
      };

      const result = await registerInstructor(formData);

      if (result?.success || isSuccess) {
        toast.success({
          title: 'Instructor registration successful!',
          description: result?.message || 'Best of luck for instructor journey at EduLearn.',
        });
        let timer: NodeJS.Timeout | null = null;

        // Trigger a refresh token after 2 sec
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(async () => {
          await triggerClientRefresh();
          router.push('/instructor');
        }, 3000);
        return;
      }

      if (!result?.success || (isError && error)) {
        toast.error({
          title: 'Registration failed. Please try again.',
          description:
            error?.message ||
            result?.message ||
            'Something went wrong please check your credential.',
        });
        return;
      }

      // Redirect to verification page or dashboard
    } catch (error) {
      return toast.error({
        title: 'Registration failed. Please try again.!',
        description: getErrorMessage(error, 'Something went wrong .'),
      });
    }
  }, [
    personalForm,
    professionalForm,
    agreementForm,
    registerInstructor,
    isSuccess,
    isError,
    error,
    router,
  ]);

  return {
    onSubmit,
    nextStep,
    prevStep,
    personalForm,
    professionalForm,
    progress,
    isSubmitting,
    currentStep,
    agreementForm,
  };
}
