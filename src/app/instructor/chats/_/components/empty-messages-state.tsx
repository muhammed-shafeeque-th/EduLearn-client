'use client';

import { MessageSquare, Sparkles, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyMessagesStateProps {
  onNewMessage: () => void;
}

export function EmptyMessagesState({ onNewMessage }: EmptyMessagesStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted/20 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-sm sm:max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative inline-flex">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
            No Conversations Yet
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Start a conversation with your instructor or student.
            <br className="hidden sm:inline" />
            Direct messaging lets you ask course questions, request feedback, or discuss assignments
            privately.
          </p>
        </div>

        {/* Action */}
        <div className="space-y-3">
          <Button
            onClick={onNewMessage}
            size="lg"
            className="w-full flex items-center justify-center text-base sm:text-lg"
            aria-label="Start new direct chat"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Start New Conversation
          </Button>
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
                  Direct Instructor/Student Chat
                </h4>
                <p className="text-xs text-muted-foreground">
                  Exchange messages directly with your course instructor
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-foreground text-xs sm:text-sm mb-1">
                  Find Contacts
                </h4>
                <p className="text-xs text-muted-foreground">
                  Search for your assigned instructor or student with ease
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <div className="pt-3 sm:pt-4 border-t">
          <p className="text-xs text-muted-foreground text-left sm:text-center">
            💡 <strong>Tip:</strong> You can also start a 1-on-1 chat from the course page by
            clicking the instructor&apos;s profile.
          </p>
        </div>
      </div>
    </div>
  );
}
