import { Metadata } from 'next';
// import { ForgotPasswordForm } from './_/components/forgot-password-form';
import { Mail } from 'lucide-react';
import Loading from './loading';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Forgot Password ',
  description: 'Reset your EduLearn account password',
};

const ForgotPasswordForm = dynamic(
  () => import('./_/components/forgot-password-form').then((mod) => mod.ForgotPasswordForm),
  {
    loading: () => <Loading />,
  }
);

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Forgot your password?</h1>
          <p className="text-muted-foreground">
            Don&apos;t worry, we&apos;ll send you reset instructions
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
