import { CourseEditorSkeleton } from './_/components/skeletons/course-editor-skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <CourseEditorSkeleton />
      </div>
    </div>
  );
}
