import { Suspense } from 'react';
import { ProfileFormSkeleton } from './_/components/skeletons/profile-form-skeleton';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Edit Profile',
  description: 'Update your profile information and preferences',
};

const ProfileForm = dynamic(
  () => import('./_/components/profile-form').then((mod) => mod.ProfileForm),
  {
    ssr: true,
    loading: () => <ProfileFormSkeleton />,
  }
);

export default function ProfilePage() {
  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Desktop Header */}
        <header className="hidden lg:block">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Account Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage your public profile and account preferences.
          </p>
        </header>

        {/* Form Container */}
        <section className="pb-20">
          <Suspense fallback={<ProfileFormSkeleton />}>
            <ProfileForm />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
