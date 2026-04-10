import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { UiDiscussionMessage } from '@/types/discussion';

interface DiscussionBubbleProps {
  message: UiDiscussionMessage;
  isOwn: boolean;
  instructorId?: string;
  /** Show role badges for both roles (instructor view) or instructor-only (student view) */
  showAllRoleBadges?: boolean;
}

function getRoleBadge(isInstructor: boolean, showAll: boolean) {
  if (isInstructor) {
    return (
      <Badge variant="default" className="text-[10px] px-1.5 py-0">
        Instructor
      </Badge>
    );
  }

  if (showAll) {
    return (
      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
        Student
      </Badge>
    );
  }

  return null;
}

function formatTimestamp(date: string) {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitials(name?: string) {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export const DiscussionBubble = React.memo(function DiscussionBubble({
  message,
  isOwn,
  instructorId,
  showAllRoleBadges = false,
}: DiscussionBubbleProps) {
  const isInstructor = message.senderId === instructorId || message.senderRole === 'instructor';
  const initials = getInitials(message.sender?.name || (isInstructor ? 'Instructor' : 'Student'));
  const roleBadge = getRoleBadge(isInstructor, showAllRoleBadges);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3 group', isOwn && 'flex-row-reverse')}
    >
      <Avatar className="h-8 w-8 shrink-0">
        {message.sender?.avatar && (
          <AvatarImage src={message.sender.avatar} alt={message.sender?.name || 'Avatar'} />
        )}
        <AvatarFallback
          className={cn(
            'text-xs font-medium',
            isInstructor ? 'bg-blue-500/20 text-blue-400' : 'bg-violet-500/20 text-violet-400'
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && message.sender?.name && (
          <span className="text-xs text-muted-foreground font-medium mb-1 ml-1 block">
            {message.sender?.name}
          </span>
        )}
        <div
          className={cn(
            'max-w-[85%] sm:max-w-[90%] rounded-2xl px-4 py-2.5',
            isOwn ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm',
            message.optimisticState === 'pending' && 'opacity-60',
            message.optimisticState === 'failed' && 'border border-red-500/50'
          )}
        >
          {roleBadge && <div className="mb-1">{roleBadge}</div>}

          <p className="text-sm whitespace-pre-wrap wrap-break-word leading-relaxed">
            {message.content}
          </p>

          <div
            className={cn(
              'flex items-center gap-1 mt-1 font-medium',
              isOwn
                ? 'justify-end text-primary-foreground/70'
                : 'justify-start text-muted-foreground'
            )}
          >
            <span className="text-[10px]">{formatTimestamp(message.createdAt)}</span>

            {message.optimisticState === 'pending' && (
              <Loader2 className="h-3 w-3 animate-spin opacity-50 ml-1" />
            )}
            {message.optimisticState === 'failed' && (
              <span className="text-[10px] text-red-400 ml-1">Failed</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});
