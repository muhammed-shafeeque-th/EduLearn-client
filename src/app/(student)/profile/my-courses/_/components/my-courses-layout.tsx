'use client';

import { useCurrentUser } from '@/states/server/user/use-current-user';
import { MyCoursesPageSkeleton } from './skeletons/my-course-page-skeletons';
import { getWindow } from '@/lib/utils';
import { ProfileSidebar } from '../../../_/components/profile-sidebar';
import { MobileSidebar } from '../../../_/components/mobile-sidebar';

interface MyCoursesLayoutClientProps {
  children: React.ReactNode;
}

export function MyCoursesLayoutClient({ children }: MyCoursesLayoutClientProps) {
  const { data: userData, isLoading, error } = useCurrentUser();

  if (isLoading) {
    return <MyCoursesPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Unable to load courses</h2>
          <p className="text-muted-foreground">Please check your connection and try again.</p>
          <button
            onClick={() => getWindow()?.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to view your courses.</p>
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
          <h1 className="text-lg font-semibold text-foreground">My Courses</h1>
          <MobileSidebar user={userData} />
        </div>

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
