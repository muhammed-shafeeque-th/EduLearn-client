import { useAppDispatch, useAuthIsAuthenticated, useAuthSelector } from '@/states/client';
import { clearError as handleClearError, register } from '@/states/client/slices/auth-slice';
import { RegisterData } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { AuthType } from '@/types/auth';
import { SignupFormData } from '../schemas';
import { useToast } from '@/hooks/use-toast';

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
      const result = await dispatch(register(registerCredentials));
      console.log(JSON.stringify(result, null, 2));

      if (result.meta.requestStatus === 'rejected') {
        common.registerError(result.payload as string);
        return;
      }

      toast.success({
        title: 'OTP has sent',
        description: 'Please check your registered email address.',
      });

      // Redirect to email verification page
      router.push(
        `/auth/verify/?email=${data.email}&name=${data.firstName}&_id=${(result.payload as { data: { userId: string } }).data.userId}`
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error({ title: error.message });
        return;
      }
    }
  };

  const clearError = () => dispatch(handleClearError());

  return { error, isAuthenticated, isLoading, handleSubmit, clearError };
};
