'use client';

import { MessageSquare, Sparkles, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyMessagesStateProps {
  // No actions are available, as user must be enrolled to start a chat
}

export function EmptyMessagesState({}: EmptyMessagesStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted/20 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-sm sm:max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative inline-flex">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-semibold text-foreground">No Available Chats</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            You have no active conversations because you are not enrolled in any courses yet.
            <br className="hidden sm:inline" />
            To start chatting, please enroll in a course. Once enrolled, you can connect directly
            with your instructor .
          </p>
        </div>

        {/* Enrollment action */}
        <div className="space-y-2">
          <p className="text-base text-muted-foreground">
            Go to your{' '}
            <a href="/profile/my-courses" className="text-primary underline">
              Enrollments
            </a>{' '}
            page to view or enroll in courses.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 pt-4 sm:pt-6">
          <Card>
            <CardContent className="p-3 sm:p-4 flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-foreground text-xs sm:text-sm mb-1">
                  Enrollment Required
                </h4>
                <p className="text-xs text-muted-foreground">
                  Course enrollment is required to start a direct chat with instructors.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <div className="pt-3 sm:pt-4 border-t">
          <p className="text-xs text-muted-foreground text-left sm:text-center">
            💡 <strong>Tip:</strong> If you've already joined a course, select it from your
            enrollments, then you can message your instructor.
          </p>
        </div>
      </div>
    </div>
  );
}
