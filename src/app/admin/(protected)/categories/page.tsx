import { Suspense } from 'react';
import { CategoriesHeader } from './_/components/categories-header';
import { CategoriesContent } from './_/components/categories-content';
import { CategoriesStats } from './_/components/categories-stats';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Categories Management | Edulearn Admin',
  description: 'Manage course categories and subcategories',
};

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <CategoriesHeader />

      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <CategoriesStats />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}
