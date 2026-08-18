import { Suspense } from 'react';
import { ProfileLayoutClient } from './_/components/profile-layout-client';
import { ProfileSkeleton } from './_/components/skeletons/profile-skeleton';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default async function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <>
      <div className="min-h-screen bg-background">
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileLayoutClient>{children}</ProfileLayoutClient>
        </Suspense>
      </div>
    </>
  );
}
