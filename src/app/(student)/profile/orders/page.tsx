import { Suspense } from 'react';
import { Metadata } from 'next';
import { OrdersContent } from './_/components/orders-content';
import OrdersSkeleton from './loading';

export const metadata: Metadata = {
  title: 'My Orders - EduLearn',
  description: 'View and manage your course purchases and order history',
};

// interface OrdersPageProps {
//   searchParams: Promise<{
//     // status?: string;
//     page?: string;
//   }>;
// }

export default async function OrdersPage() {
  // const params = await searchParams;
  // const status = params.status;
  // const page = params.page ? parseInt(params.page) : 1;

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersContent />
      </Suspense>
    </div>
  );
}
