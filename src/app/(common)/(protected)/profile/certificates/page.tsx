import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { enrollmentService } from '@/services/enrollment.service';
import { requireAuth } from '@/lib/auth';
import { getServerQueryClient } from '@/lib/react-query/server';
import { CertificatesList } from './_/components/certificates-list';
import { CertificatesListSkeleton } from './_/components/skeletons/certificates-list-skeleton';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Certificates - EduLearn',
  description: 'View and download your course certificates',
};

export default async function CertificatesPage() {
  const queryClient = getServerQueryClient();
  const user = await requireAuth();

  // Prefetch certificates
  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.certificates.byUser(user!.id),
    queryFn: () => enrollmentService.getUserCertificates(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">My Certificates</h1>
            <p className="text-muted-foreground">Your achievements and certifications</p>
          </div>

          <Suspense fallback={<CertificatesListSkeleton />}>
            <CertificatesList />
          </Suspense>
        </div>
      </div>
    </HydrationBoundary>
  );
}
