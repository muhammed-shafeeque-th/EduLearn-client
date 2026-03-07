import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getServerQueryClient } from '@/lib/react-query/server';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { serverAdminService } from '@/services/server-service-clients';
import { RevenueChart } from './_/revenue-chart';

export default async function RevenuePage() {
  const queryClient = getServerQueryClient();
  const year = new Date().getFullYear().toString();

  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.admin.revenueStats(year),
    queryFn: () => serverAdminService.getRevenueStats(year),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RevenueChart />
    </HydrationBoundary>
  );
}
