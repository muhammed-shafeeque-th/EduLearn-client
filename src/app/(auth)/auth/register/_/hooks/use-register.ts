import { useAppDispatch, useAuthIsAuthenticated, useAuthSelector } from '@/states/client';
import { clearError as handleClearError, register } from '@/states/client/slices/auth-slice';
import { RegisterData } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { AuthType } from '@/types/auth';
import { SignupFormData } from '../schemas';
import { useToast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';

export const useRegister = () => {
  const dispatch = useAppDispatch();
  const { common, toast } = useToast();
  const router = useRouter();
  const { error, isLoading } = useAuthSelector();
  const isAuthenticated = useAuthIsAuthenticated();

  const handleSubmit = async (data: SignupFormData) => {
    try {
      const registerCredentials: RegisterData = {
        // confirmPassword: credentials.confirmPassword,
        ...data,
        avatar: '',
        role: 'student',
        authType: AuthType.EMAIL,
      };
      const result = await dispatch(register(registerCredentials)).unwrap();
      console.log(JSON.stringify(result, null, 2));

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success({
        title: 'OTP has sent',
        description: 'Please check your registered email address.',
      });

      // Redirect to email verification page
      router.push(
        `/auth/verify/?email=${data.email}&name=${data.firstName}&_id=${(result as { data: { userId: string } }).data.userId}`
      );
    } catch (error) {
      common.registerError(getErrorMessage(error));
      return;
    }
  };

  const clearError = () => dispatch(handleClearError());

  return { error, isAuthenticated, isLoading, handleSubmit, clearError };
};
