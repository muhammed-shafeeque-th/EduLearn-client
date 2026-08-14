import { Skeleton } from '@/components/ui/skeleton';
import { Container } from '@/components/ui/container';

const ProfileSkeleton = () => {
  return (
    <Container variant="page" padding="lg">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Skeleton */}
        <div className="lg:w-80 flex-shrink-0">
          <Container variant="card" padding="md">
            {/* Profile Header */}
            <div className="text-center mb-6">
              <Skeleton className="w-32 h-32 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-32 mx-auto mb-2" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>

            {/* Navigation Items */}
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </Container>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1">
          <Container variant="card" padding="lg">
            {/* Form Fields */}
            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>

              {/* Headline */}
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Description */}
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-24 w-full" />
              </div>

              {/* Image Upload */}
              <div>
                <Skeleton className="h-4 w-24 mb-4" />
                <div className="flex items-start gap-4">
                  <Skeleton className="w-32 h-32 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-10 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <Skeleton className="h-4 w-24 mb-4" />
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-3 w-16 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </Container>
        </div>
      </div>
    </Container>
  );
};

export { ProfileSkeleton as default };
