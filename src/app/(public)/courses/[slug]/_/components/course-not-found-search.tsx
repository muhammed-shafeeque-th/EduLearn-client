'use client';

import { ROUTES } from '@/lib/constants/routes';

export function CourseNotFoundSearchBox() {
  return (
    <div className="max-w-md mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search courses..."
          className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const query = (e.target as HTMLInputElement).value;
              window.location.href = `${ROUTES.public.courses.root}?q=${encodeURIComponent(query)}`;
            }
          }}
        />
      </div>
    </div>
  );
}
