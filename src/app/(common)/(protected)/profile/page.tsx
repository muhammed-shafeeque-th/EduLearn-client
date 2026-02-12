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
      <div className="max-w-4xl mx-auto">
        {/* Desktop Header */}
        <header className="hidden lg:block mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">Update your profile information and preferences</p>
        </header>

        {/* Form Container */}
        <section className="bg-card rounded-lg shadow-sm border">
          <Suspense fallback={<ProfileFormSkeleton />}>
            <ProfileForm />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
