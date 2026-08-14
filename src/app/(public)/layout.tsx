import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AuthSessionProvider } from '@/lib/providers/auth-session-provider';
import { SiteHeader } from '@/components/layout/site-header';
import SiteFooter from '@/components/layout/site-footer';
import { RouteFallback } from '@/components/ui/route-fallback';
import { getServerAuthSession } from '@/lib/auth/get-server-auth-session';

const OneTapProvider = dynamic(() => import('@/lib/providers/one-tap-provider'), {
  ssr: true,
});

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  return (
    <AuthSessionProvider session={session}>
      <main className="min-h-screen flex flex-col bg-background text-foreground">
        <SiteHeader />
        <Suspense fallback={<RouteFallback />}>
          <div className="flex-1">{children}</div>
        </Suspense>
        <SiteFooter />
      </main>
      <OneTapProvider />
    </AuthSessionProvider>
  );
}
