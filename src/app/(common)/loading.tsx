import { Skeleton } from '@/components/ui/skeleton';
import {
  CategoriesSkeleton,
  CoursesSkeleton,
  HeroSkeleton,
  InstructorsSkeleton,
  StatsSkeleton,
} from './_/components/landing/components/loading-skeletons';

export default function UserLoading() {
  return (
    <main>
      {/* Hero Section */}

      <HeroSkeleton />

      {/* Stats Section */}

      <StatsSkeleton />

      {/* Categories Section */}

      <CategoriesSkeleton />

      {/* Courses Section */}

      <CoursesSkeleton />

      {/* Instructors Section */}

      <InstructorsSkeleton />

      {/* Testimonials Section */}

      <module className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-80 mx-auto mb-4" />
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                  <Skeleton className="h-8 w-8 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </module>

      {/* CTA Section */}

      <module className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-12 w-48" />
            </div>
            <div className="relative">
              <Skeleton className="w-full max-w-md h-80 rounded-full mx-auto" />
            </div>
          </div>
        </div>
      </module>
    </main>
  );
}
