'use client';

import React, { useState, useRef, useCallback, memo } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  Download,
  Reply,
  MoreHorizontal,
  Check,
  CheckCheck,
  Copy,
  Forward,
  Trash2,
  Edit2,
  Pin,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';
import { UserInfo } from '@/types/user';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// ------------ Types/interfaces -----------------
interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  showTimestamp?: boolean;
  sender: UserInfo;
  onReply?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, reactionId: string) => void;
  onDelete?: (messageId: string) => void;
  className?: string;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onSelect?: () => void;
}

// ----------------- Helper constants ---------------
const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

// -------- Main Component --------------
export const MessageBubble = memo(function MessageBubble({
  message,
  isOwn,
  showAvatar,
  showTimestamp = true,
  sender,
  onReply,
  onAddReaction,
  onRemoveReaction,
  onEdit,
  onDelete,
  className,
  isSelected = false,
  isSelectionMode = false,
  onSelect,
}: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // -------- Get currentUserId safely ---------
  // For demo: get current user from message object or fallback (Replace to your logic)
  // In best practice, current user's id should be provided by context or hook.
  const currentUserId =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem('currentUserId') || 'current-user'
      : 'current-user';

  // ---------- Group reactions by emoji and track if currentUser reacted ---------
  const reactionGroups = React.useMemo(() => {
    if (!message.reactions) return {};
    return message.reactions.reduce<
      Record<string, { count: number; reactionIds: string[]; reactedByCurrentUser: string | null }>
    >((acc, r) => {
      if (!acc[r.emoji]) {
        acc[r.emoji] = { count: 0, reactionIds: [], reactedByCurrentUser: null };
      }
      acc[r.emoji].count += 1;
      acc[r.emoji].reactionIds.push(r.id);
      if (r.userId === currentUserId) {
        acc[r.emoji].reactedByCurrentUser = r.id;
      }
      return acc;
    }, {});
  }, [message.reactions, currentUserId]);

  // ----------- Audio/Voice message handlers ---------------
  const handlePlayVoice = useCallback(async () => {
    if (!message.fileUrl) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(message.fileUrl);

      audioRef.current.ontimeupdate = () => {
        if (audioRef.current && audioRef.current.duration > 0) {
          setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      };

      audioRef.current.onended = () => {
        setIsPlaying(false);
        setAudioProgress(0);
      };

      audioRef.current.onerror = () => {
        setIsPlaying(false);
        setAudioProgress(0);
        toast.error('Failed to play audio');
      };
    }

    setIsPlaying(true);
    try {
      await audioRef.current.play();
    } catch (error) {
      setIsPlaying(false);

      console.error('Error playing audio:', error);
      toast.error('Failed to play audio');
    }
  }, [message.fileUrl, isPlaying]);

  // -------------- Copy handlers ---------------
  const handleCopyMessage = useCallback(() => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    toast.success('Message copied');
  }, [message.content]);

  // -------------- Download handler ---------------
  const handleDownload = useCallback(() => {
    if (!message.fileUrl) return;

    const link = document.createElement('a');
    link.href = message.fileUrl;
    link.download = message.fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  }, [message.fileUrl, message.fileName]);

  // -------------- Reaction handler -----------------
  const handleReaction = useCallback(
    (emoji: string) => {
      // Check if current user already reacted with this emoji
      const currentReaction = (message.reactions || []).find(
        (r) => r.emoji === emoji && r.userId === currentUserId
      );
      if (currentReaction) {
        // Remove reaction
        onRemoveReaction(message.id, currentReaction.id);
        toast.info('Reaction removed');
      } else {
        // Add reaction
        onAddReaction(message.id, emoji);
        toast.success('Reaction added');
      }
    },
    [message.reactions, currentUserId, message.id, onRemoveReaction, onAddReaction]
  );

  // -------------- Long press for selection ---------------
  const handleLongPress = useCallback(() => {
    longPressTimerRef.current = setTimeout(() => {
      if (onSelect) {
        onSelect();
      }
    }, 500);
  }, [onSelect]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // ------------------ Render message content -------------
  const renderMessageContent = useCallback(() => {
    switch (message.type) {
      case 'voice':
        return (
          <div className="flex items-center gap-3 min-w-[240px] max-w-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayVoice}
              className="flex-shrink-0 h-10 w-10 rounded-full hover:bg-white/20"
              aria-label={isPlaying ? 'Pause voice message' : 'Play voice message'}
              type="button"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>
            <div className="flex-1 min-w-0">
              {/* Waveform visualization */}
              <div className="flex items-center gap-0.5 h-8 mb-1.5">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-1 rounded-full transition-all duration-200',
                      isPlaying ? 'bg-white animate-pulse' : 'bg-white/60',
                      i < (audioProgress / 100) * 32 ? 'opacity-100' : 'opacity-40'
                    )}
                    style={{
                      height: `${Math.random() * 60 + 20}%`,
                      animationDelay: `${i * 50}ms`,
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-xs opacity-80">
                <span>
                  {message.voiceDuration ? `${Math.floor(message.voiceDuration)}s` : '0:00'}
                </span>
                <Volume2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center gap-3 min-w-[240px] max-w-sm p-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl" aria-label="File">
                📎
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.fileName || 'File'}</p>
              <p className="text-xs opacity-80">
                {message.fileSize
                  ? `${(message.fileSize / 1024 / 1024).toFixed(1)} MB`
                  : 'Unknown size'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 h-9 w-9 hover:bg-white/20"
              onClick={handleDownload}
              aria-label="Download file"
              type="button"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        );
      case 'image':
        return (
          <div className="max-w-sm">
            <div className="rounded-2xl overflow-hidden bg-muted/20 group cursor-pointer">
              <Image
                src={message.fileUrl || ''}
                alt="Shared image"
                width={400}
                height={300}
                className="object-cover w-full transition-transform group-hover:scale-105"
                onClick={() => window.open(message.fileUrl, '_blank')}
              />
            </div>
            {message.content && (
              <p className="mt-2 text-sm whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
        );
      default: {
        // Linkify URLs in text
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = message.content?.split(urlRegex) || [];

        return (
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {parts.map((part, i) =>
              urlRegex.test(part) ? (
                <a
                  key={i}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-200 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {part}
                </a>
              ) : (
                part
              )
            )}
          </p>
        );
      }
    }
  }, [message, isPlaying, handlePlayVoice, audioProgress, handleDownload]);

  // ------------- Message status -------------
  const MessageStatus = useCallback(() => {
    if (!isOwn) return null;

    return (
      <div className="flex items-center gap-1">
        {message.status === 'sending' && (
          <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
        )}
        {message.status === 'sent' && <Check className="w-3.5 h-3.5" />}
        {message.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5" />}
        {message.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-blue-400" />}
      </div>
    );
  }, [isOwn, message.status]);

  // ------------- Render -------------
  return (
    <div
      className={cn(
        'flex gap-2 transition-all duration-200',
        isOwn ? 'flex-row-reverse' : 'flex-row',
        isSelected && 'bg-blue-50/50 dark:bg-blue-950/20 -mx-2 px-2 py-1 rounded-lg',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleLongPress}
      onTouchEnd={handleLongPressEnd}
      onMouseDown={handleLongPress}
      onMouseUp={handleLongPressEnd}
      onClick={isSelectionMode ? onSelect : undefined}
      aria-selected={isSelected}
      role="listitem"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-8">
        {showAvatar && !isOwn ? (
          sender.avatar ? (
            <Image
              src={sender.avatar}
              alt={`${sender.name ?? ''}`}
              width={32}
              height={32}
              className="rounded-full object-cover ring-2 ring-background"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-background">
              {sender.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )
        ) : null}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'group relative flex flex-col max-w-[75%] md:max-w-md lg:max-w-lg',
          isOwn ? 'items-end' : 'items-start'
        )}
      >
        {/* Message Bubble */}
        <div className="relative">
          <div
            className={cn(
              'px-4 py-2.5 rounded-2xl shadow-sm backdrop-blur-sm transition-all duration-200',
              isOwn
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md'
                : 'bg-card border border-border text-foreground rounded-bl-md hover:shadow-md',
              isHovered && !isSelectionMode && 'shadow-lg',
              message.status === 'sending' && 'opacity-70',
              isSelected && 'ring-2 ring-blue-500'
            )}
          >
            {renderMessageContent()}
          </div>

          {/* Reactions Display */}
          {Object.keys(reactionGroups).length > 0 && (
            <div className="absolute -bottom-2 left-2 flex gap-1 bg-background border border-border rounded-full px-2 py-0.5 shadow-md">
              {Object.entries(reactionGroups).map(([emoji, info]) => {
                const reacted = !!info.reactedByCurrentUser;
                return (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleReaction(emoji)}
                    className={cn(
                      'flex items-center gap-1 text-xs rounded-full px-2 py-0.5 transition-all',
                      reacted
                        ? 'bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 font-semibold scale-110 border border-blue-400'
                        : 'bg-transparent hover:bg-muted'
                    )}
                    aria-pressed={reacted}
                    aria-label={
                      reacted
                        ? `Remove your ${emoji} reaction (${info.count})`
                        : `React with ${emoji} (${info.count})`
                    }
                  >
                    <span>{emoji}</span>
                    {info.count > 1 && (
                      <span className="text-[10px] text-muted-foreground">{info.count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Message Info */}
        {showTimestamp && (
          <div
            className={cn(
              'flex items-center gap-1.5 mt-1 px-1',
              isOwn ? 'flex-row-reverse' : 'flex-row',
              Object.keys(reactionGroups).length > 0 && 'mt-3'
            )}
          >
            <span className="text-[10px] text-muted-foreground font-medium">
              {format(new Date(message.createdAt), 'h:mm a')}
            </span>
            <MessageStatus />
            {message.updatedAt > message.createdAt && (
              <span className="text-[10px] text-muted-foreground italic">(edited)</span>
            )}
          </div>
        )}

        {/* Quick Reactions (on hover) */}
        {isHovered && !isSelectionMode && (
          <div
            className={cn(
              'absolute top-0 flex items-center gap-1 bg-background/95 backdrop-blur-md border border-border rounded-full shadow-xl p-1 animate-in fade-in slide-in-from-bottom-2 z-10',
              isOwn ? '-left-2 -translate-x-full' : '-right-2 translate-x-full'
            )}
          >
            {QUICK_REACTIONS.map((emoji) => {
              const reacted = !!reactionGroups[emoji]?.reactedByCurrentUser;
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleReaction(emoji)}
                  className={cn(
                    'w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-125',
                    reacted && 'bg-blue-100 dark:bg-blue-800/80 scale-110 ring-2 ring-blue-400'
                  )}
                  aria-pressed={reacted}
                  aria-label={reacted ? `Remove your ${emoji} reaction` : `React with ${emoji}`}
                >
                  {emoji}
                </button>
              );
            })}

            {/* More Options Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  aria-label="More options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? 'end' : 'start'} className="w-48">
                {onReply && (
                  <DropdownMenuItem onClick={() => onReply(message)}>
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleCopyMessage}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info('Forward feature')}>
                  <Forward className="w-4 h-4 mr-2" />
                  Forward
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info('Pin feature')}>
                  <Pin className="w-4 h-4 mr-2" />
                  Pin Message
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isOwn && onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(message)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {isOwn && onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(message.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Selection Checkbox (for selection mode) */}
        {isSelectionMode && (
          <div className="absolute top-1 left-1">
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                isSelected
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-muted-foreground/40 bg-background'
              )}
            >
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
