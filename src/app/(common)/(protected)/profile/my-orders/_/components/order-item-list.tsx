'use client';

import { memo } from 'react';
import type { CourseInfo } from '@/types/course';
import Link from 'next/link';
import { OrderItems } from '@/types/order';
import Image from 'next/image';

interface OrderListProps {
  orderItems: OrderItems[];
}

export const OrderList = memo(function OrderList({ orderItems }: OrderListProps) {
  return (
    <div className="space-y-2 mb-4" role="list" aria-label="Courses in order">
      {orderItems.map((item) => (
        <CourseItem key={item.courseId} course={item.course} />
      ))}
    </div>
  );
});

interface CourseItemProps {
  course: CourseInfo;
}

// Expecting course.thumbnail as a url string
const CourseItem = memo(function CourseItem({ course }: CourseItemProps) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="flex items-center gap-3 p-2 bg-muted/70 rounded-md w-full text-left hover:bg-muted transition-colors shadow-sm"
      aria-label={`Open ${course.title} course`}
    >
      <div className="shrink-0 w-12 h-12 rounded overflow-hidden bg-muted">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            width={48}
            height={48}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        ) : (
          <div className="w-12 h-12 flex items-center justify-center bg-muted-foreground text-muted rounded">
            <span className="text-xs">No Image</span>
          </div>
        )}
      </div>
      <span className="flex-1 min-w-0">
        <p className="text-base font-medium text-foreground truncate">{course.title}</p>
        <p className="text-sm text-muted-foreground">${course.price.toFixed(2)}</p>
      </span>
    </Link>
  );
});
