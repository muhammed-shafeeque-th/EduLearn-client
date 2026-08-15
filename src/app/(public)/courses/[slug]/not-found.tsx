import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Search, ArrowLeft, Home } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import { CourseNotFoundSearchBox } from './_/components/course-not-found-search';

export const metadata: Metadata = {
  title: 'Course Not Found',
  robots: { index: false, follow: true },
};

export default function CourseNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-3xl font-bold mb-2">Course Not Found</CardTitle>
          <p className="text-muted-foreground text-lg">
            The course you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-4">
            <p className="text-muted-foreground">This might have happened because:</p>
            <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
              <li>• The course has been unpublished or removed</li>
              <li>• The URL was typed incorrectly</li>
              <li>• You followed an outdated link</li>
              <li>• The course is temporarily unavailable</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="flex items-center gap-2">
              <Link href={ROUTES.public.courses.root}>
                <Search className="w-4 h-4" />
                Browse All Courses
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href={ROUTES.public.home} className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href={ROUTES.public.courses.root} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Link>
            </Button>
          </div>

          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              Looking for something specific? Try searching our course catalog.
            </p>
            <CourseNotFoundSearchBox />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
