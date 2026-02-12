'use client';

import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-4 mb-8"
        >
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1">
            <Skeleton className="h-8 w-40 mb-2" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-px w-8" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-px w-8" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Courses Section */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Coupon Section */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Skeleton */}
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
                <Skeleton className="h-px w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-12 w-full rounded-md" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSkeleton;
