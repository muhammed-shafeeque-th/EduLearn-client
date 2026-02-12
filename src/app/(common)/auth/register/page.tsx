import { Metadata } from 'next';
// import { SignupForm } from './_components/signup-form';
import { SignupHero } from './_/components/signup-hero';
import dynamic from 'next/dynamic';
import { FormSkeleton } from './_/components/skeletons/form-skeleton';

export const metadata: Metadata = {
  title: 'Sign Up ',
  description: 'Create your EduLearn account to start learning',
};

const SignupForm = dynamic(() => import('./_/components/signup-form'), {
  loading: () => <FormSkeleton />,
});

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
<<<<<<< HEAD
      {/* Hero Section - Hidden on mobile, visible on desktop */}
=======
      {/* Hero Section */}
>>>>>>> cart
      <div className="hidden lg:flex lg:w-1/2 min-w-0">
        <SignupHero />
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 min-w-0">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Create Your Account</h1>
            <p className="text-muted-foreground">Join thousands of learners on EduLearn</p>
          </div>

          <SignupForm />
        </div>
      </div>
    </div>
  );
}
