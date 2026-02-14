'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, ArrowLeft, Home, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface CourseErrorFallbackProps {
  slug: string;
  error?: string;
  onRetry?: () => void;
}

export function CourseErrorFallback({ slug, error, onRetry }: CourseErrorFallbackProps) {
  const isNotFound = error?.includes('404') || error?.includes('not found');
  const isNetworkError = error?.includes('network') || error?.includes('fetch');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl">
            {isNotFound ? 'Course Not Found' : 'Course Unavailable'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              {isNotFound
                ? "This course doesn't exist or has been removed."
                : isNetworkError
                  ? "We're having trouble connecting to our servers."
                  : "We're having trouble loading this course right now."}
            </p>
            <p className="text-sm text-muted-foreground">
              Course : <code className="bg-muted px-1 py-0.5 rounded text-xs">{slug}</code>
            </p>
            {error && (
              <details className="text-xs text-muted-foreground mt-2">
                <summary className="cursor-pointer hover:text-foreground">Error details</summary>
                <p className="mt-1 p-2 bg-muted rounded text-left font-mono">{error}</p>
              </details>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && !isNotFound && (
              <Button onClick={onRetry} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}

            <Button variant="outline" asChild>
              <Link href="/courses" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Browse Courses
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Home
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t space-y-3">
            <p className="text-xs text-muted-foreground">Need help? Contact our support team.</p>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/support" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Contact Support
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
