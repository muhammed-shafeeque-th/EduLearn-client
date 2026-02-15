export function SuccessPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="w-24 h-24 bg-muted rounded-full mx-auto mb-4" />
        <div className="h-8 bg-muted rounded w-64 mx-auto mb-2" />
        <div className="h-4 bg-muted rounded w-48 mx-auto" />
      </div>
    </div>
  );
}
