'use client';

import { MessageSquare, Sparkles, MessageSquarePlus, Send, Users } from 'lucide-react';
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
          <h3 className="text-xl sm:text-2xl font-semibold text-foreground">Welcome to Messages</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Connect with your course instructors. Start meaningful conversations and collaborate on
            your learning journey.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            onClick={onNewMessage}
            size="lg"
            className="w-full flex items-center justify-center text-base sm:text-lg bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            aria-label="Start new conversation"
          >
            <MessageSquarePlus className="w-5 h-5 mr-2" />
            Start New Conversation
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 pt-4 sm:pt-6">
          <Card>
            <CardContent className="p-3 sm:p-4 flex items-start gap-3 text-left">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-foreground text-xs sm:text-sm mb-1">
                  Connect with Instructors
                </h4>
                <p className="text-xs text-muted-foreground">
                  Ask questions, request feedback, or discuss assignments privately.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 flex items-start gap-3 text-left">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center shrink-0">
                <Send className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-foreground text-xs sm:text-sm mb-1">
                  Real-time Messaging
                </h4>
                <p className="text-xs text-muted-foreground">
                  Experience instant delivery and real-time updates for all your chats.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <div className="pt-3 sm:pt-4 border-t">
          <p className="text-xs text-muted-foreground text-left sm:text-center">
            💡 <strong>Tip:</strong> Press{' '}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> to
            send messages quickly and{' '}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Shift+Enter</kbd>{' '}
            for new lines.
          </p>
        </div>
      </div>
    </div>
  );
}
