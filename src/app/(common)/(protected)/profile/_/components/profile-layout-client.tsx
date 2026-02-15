'use client';

import { useCurrentUser } from '@/states/server/user/use-current-user';
import { ProfileSidebar } from './profile-sidebar';
import { MobileSidebar } from './mobile-sidebar';
import { ProfileSkeleton } from './skeletons/profile-skeleton';

interface ProfileLayoutClientProps {
  children: React.ReactNode;
}

export function ProfileLayoutClient({ children }: ProfileLayoutClientProps) {
  const { data: userData, isLoading, error } = useCurrentUser({ enabled: true });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">Failed to load profile</h2>
          <p className="text-muted-foreground">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">Profile not found</h2>
          <p className="text-muted-foreground">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <ProfileSidebar user={userData} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-card border-b">
          <h1 className="text-lg font-semibold text-foreground">Profile</h1>
          <MobileSidebar user={userData} />
        </div>

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
