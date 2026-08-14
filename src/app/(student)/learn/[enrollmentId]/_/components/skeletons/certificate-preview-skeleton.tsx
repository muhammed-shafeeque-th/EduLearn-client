import { Card } from '@/components/ui/card';

export function CertificatePreviewSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="relative p-8 md:p-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="absolute inset-4 border-2 border-slate-300 dark:border-slate-600 rounded-lg" />
        <div className="absolute inset-6 border border-slate-200 dark:border-slate-700 rounded-lg" />

        <div className="relative z-10 text-center space-y-6 animate-pulse">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>

          {/* Title */}
          <div className="space-y-3">
            <div className="h-12 bg-slate-300 dark:bg-slate-700 rounded mx-auto max-w-md" />
            <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded mx-auto max-w-xs" />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded mx-auto max-w-32" />
            <div className="h-10 bg-slate-300 dark:bg-slate-700 rounded mx-auto max-w-sm" />
            <div className="h-0.5 bg-slate-300 dark:bg-slate-700 rounded mx-auto max-w-64" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded mx-auto max-w-2xl" />
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded mx-auto max-w-xl" />
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-8 max-w-2xl mx-auto">
            <div className="space-y-2">
              <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-24" />
              <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-32" />
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-32" />
              <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-24" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
