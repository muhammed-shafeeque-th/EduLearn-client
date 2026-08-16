import React, { Suspense } from 'react';
import { AuthSessionProvider } from '@/lib/providers/auth-session-provider';
import { RealtimeProviders } from '@/lib/providers';
import { SiteHeader } from '@/components/layout/site-header';
import SiteFooter from '@/components/layout/site-footer';
import { RouteFallback } from '@/components/ui/route-fallback';
import { authGuard } from '@/lib/auth';
import { getServerAuthSession } from '@/lib/auth/get-server-auth-session';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Student Dashboard',
  description: 'Edulearn student dashboard - view your profile information and preferences',
  robots: { index: false, follow: false },
};

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await authGuard({
    roles: ['instructor', 'student'],
    redirectTo: '/',
  });

  const session = await getServerAuthSession();

  return (
    <AuthSessionProvider session={session}>
      <RealtimeProviders>
        <main className="min-h-screen flex flex-col bg-background text-foreground relative">
          <SiteHeader />
          <Suspense fallback={<RouteFallback />}>
            <div className="flex-1">{children}</div>
          </Suspense>
          <SiteFooter />
          <div id="student-modal-root" />
        </main>
      </RealtimeProviders>
    </AuthSessionProvider>
  );
}
