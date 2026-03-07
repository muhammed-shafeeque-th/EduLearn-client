'use client';

import React, { useState, useRef, useEffect, useCallback, use } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { useDiscussion } from '@/services/ws/chat/hooks/use-discussion';
import { useAuth } from '@/hooks/use-auth';

import { DiscussionBubble } from '@/components/discussion/discussion-bubble';
import {
  ConnectionStatus,
  EmptyDiscussion,
  MessagesLoader,
  DiscussionPageLoader,
  DiscussionError,
} from '@/components/discussion/discussion-ui';
import { MessageInput } from '@/components/discussion/message-input';

export default function InstructorDiscussionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params);
  const { user } = useAuth();
  const userId = user?.userId ?? '';

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoadingRoom,
    isLoadingMessages,
    isConnected,
    isSending,
    roomError,
    sendMessage,
    refetchMessages,
  } = useDiscussion({
    courseId,
    userId,
    enabled: !!userId,
  });

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput('');
  }, [input, sendMessage]);

  if (!user || isLoadingRoom) {
    return <DiscussionPageLoader />;
  }

  if (roomError) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <DiscussionError
          message="Could not load the discussion room. Please try again."
          onRetry={refetchMessages}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back navigation */}
      <Link
        href={`/instructor/courses/${courseId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Course
      </Link>

      <Card className="border border-border/50 shadow-sm overflow-hidden">
        {/* Header */}
        <CardHeader className="pb-3 border-b border-border/50 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Course Discussion</CardTitle>
            </div>
            <ConnectionStatus isConnected={isConnected} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            View and reply to student discussions about this course
          </p>
        </CardHeader>

        {/* Messages + Input */}
        <div className="flex flex-col h-[560px]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {isLoadingMessages ? (
              <MessagesLoader />
            ) : messages.length === 0 ? (
              <EmptyDiscussion message="Students haven't started a discussion yet. New messages will appear here in real-time." />
            ) : (
              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <DiscussionBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.senderId === userId}
                    instructorId={userId}
                    showAllRoleBadges
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          <MessageInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            isSending={isSending}
            placeholder="Reply to your students..."
          />
        </div>
      </Card>
    </div>
  );
}
