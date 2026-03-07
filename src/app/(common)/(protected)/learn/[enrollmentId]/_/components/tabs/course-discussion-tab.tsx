'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Loader2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useDiscussion } from '@/services/ws/chat/hooks/use-discussion';

import { DiscussionBubble } from '@/components/discussion/discussion-bubble';
import {
  ConnectionStatus,
  EmptyDiscussion,
  MessagesLoader,
} from '@/components/discussion/discussion-ui';
import { MessageInput } from '@/components/discussion/message-input';

interface CourseDiscussionTabProps {
  courseId: string;
  enrollmentId: string;
  userId: string;
  userName: string;
  instructorId?: string;
}

export function CourseDiscussionTab({
  courseId,
  enrollmentId: _enrollmentId,
  userId,
  userName: _userName,
  instructorId,
}: CourseDiscussionTabProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, isLoadingRoom, isLoadingMessages, isConnected, isSending, sendMessage } =
    useDiscussion({
      courseId,
      instructorId,
      userId,
    });

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

  if (isLoadingRoom) {
    return (
      <Card className="border-0 shadow-none">
        <CardContent className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading discussion room...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
          Ask questions and discuss with your instructor and fellow students
        </p>
      </CardHeader>

      {/* Messages + Input */}
      <div className="flex flex-col h-[460px]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {isLoadingMessages ? (
            <MessagesLoader />
          ) : messages.length === 0 ? (
            <EmptyDiscussion message="Be the first to start the discussion! Ask a question or share your thoughts about this course." />
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <DiscussionBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.senderId === userId}
                  instructorId={instructorId}
                  showAllRoleBadges={false}
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
          placeholder="Type your message..."
        />
      </div>
    </Card>
  );
}
