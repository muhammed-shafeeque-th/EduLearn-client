import { Metadata } from 'next';
// import { SigninForm } from './_/components/login-form';
import { SigninHero } from './_/components/signin-hero';
import dynamic from 'next/dynamic';
import { FormSkeleton } from './_/components/skeletons/form-skeleton';
import { Suspense } from 'react';

const SigninForm = dynamic(() => import('./_/components/login-form').then((mod) => mod.SigninForm));

export const metadata: Metadata = {
  title: 'Sign In ',
  description: 'Sign in to your EduLearn account to continue learning',
};

export default function SigninPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Hero Section  */}
      <div className="hidden lg:flex lg:w-1/2">
        <SigninHero />
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Sign in to your account
            </h1>
            <p className="text-muted-foreground">Welcome back! Please enter your details</p>
          </div>
          <Suspense fallback={<FormSkeleton />}>
            <SigninForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
