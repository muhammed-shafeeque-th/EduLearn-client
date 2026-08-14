import { memo } from 'react';
import { CourseMeta } from '@/types/course';
import { CourseCard } from './course-card';

type CourseListProps = {
  courses: CourseMeta[];
};

const CourseList = memo(({ courses }: CourseListProps) => {
  return (
    <div className="flex-1">
      <div className="container mx-auto px-4 py-2 max-w-none">
        <div className="flex flex-col gap-2">
          {courses.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-gray-500 text-base mb-1">No courses found</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {courses.map((course) => (
                <div key={course.id}>
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
CourseList.displayName = 'CourseList';

export default CourseList;
