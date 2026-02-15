'use client';

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  MutableRefObject,
  useLayoutEffect,
} from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  MoreHorizontal,
  Video,
  Phone,
  Search,
  FileText,
  X,
  ChevronDown,
  Archive,
  Bell,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { VideoCall } from './video-call';
import { cn } from '@/lib/utils';
import type { Chat, Message } from '@/types/chat';
import type { UserInfo } from '@/types/user';
import {
  format,
  isToday,
  isYesterday,
  startOfDay,
  isThisWeek,
  isThisYear,
} from 'date-fns';
import { getOtherUser, getUserDisplayName, TypingIndicator } from '@/lib/chat/chat-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

/**
 * A custom ScrollArea replacement for precise message scroll control and containment.
 */
function ChatScrollArea(props: {
  children: React.ReactNode;
  messagesContainerRef: MutableRefObject<HTMLDivElement | null>;
  onScroll: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      ref={props.messagesContainerRef}
      onScroll={props.onScroll}
      className={cn('overflow-y-auto w-full transition-all', props.className)}
      style={props.style}
    >
      {props.children}
    </div>
  );
}

interface ChatInterfaceProps {
  chat: Chat;
  messages: Message[];
  currentUser: UserInfo;
  typingUsers: string[];
  onSendMessage: (content: string) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, reactionId: string) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  onBack?: () => void;
  onlineUsers: ReadonlySet<string>;
  className?: string;
  isLoading?: boolean;
  hasMoreMessages?: boolean;
  onLoadMore?: () => void;
}

// Helper to lock scroll on messages area
const useLockBodyScroll = (dep: boolean) => {
  useEffect(() => {
    if (!dep) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [dep]);
};

/**
 * Returns formatted date as 'Today', 'Yesterday', weekday, or full date.
 */
function formatMessageDate(date: Date) {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';

  // If it's in the last week but not today or yesterday, show 'Monday', 'Tuesday', etc.
  if (isThisWeek(date, { weekStartsOn: 1 })) {
    return format(date, 'EEEE'); // full weekday name
  }
  if (isThisYear(date)) {
    return format(date, 'MMM d');
  }
  return format(date, 'MMMM d, yyyy');
}

function sortMessages(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => {
    // Prefer sequence
    if (typeof a.sequence === 'number' && typeof b.sequence === 'number') {
      return a.sequence - b.sequence;
    }

    // Fallback to createdAt
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

function groupMessagesByDate(messages: Message[]) {
  if (!messages.length) return [];

  const groups: {
    date: string;
    messages: Message[];
    raw: number;
  }[] = [];

  let currentGroup: (typeof groups)[0] | null = null;

  for (const msg of messages) {
    const d = startOfDay(new Date(msg.createdAt));
    const label = formatMessageDate(d);
    const ts = d.getTime();

    if (!currentGroup || currentGroup.raw !== ts) {
      currentGroup = {
        date: label,
        raw: ts,
        messages: [msg],
      };

      groups.push(currentGroup);
    } else {
      currentGroup.messages.push(msg);
    }
  }

  return groups;
}

export function ChatInterface({
  chat,
  messages,
  onAddReaction,
  onRemoveReaction,
  currentUser,
  typingUsers,
  onSendMessage,
  onStartTyping,
  onStopTyping,
  onBack,
  onlineUsers,
  className,
  isLoading = false,
  hasMoreMessages = false,
  onLoadMore,
}: ChatInterfaceProps) {
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const prevCount = useRef(0);

  // States
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Derived
  const { otherUser, otherUserId } = useMemo(
    () => getOtherUser(chat, currentUser.id),
    [chat, currentUser.id]
  );
  const isOnline = otherUserId ? onlineUsers.has(otherUserId) : false;
  const displayName = getUserDisplayName(otherUser);

  // Focus chat area on conversation change
  useEffect(() => {
    messagesContainerRef.current?.focus();
  }, [otherUserId]);

  // Auto scroll on new messages, only if user is at or near bottom.

  useEffect(() => {
    const diff = messages.length - prevCount.current;

    prevCount.current = messages.length;

    // Only scroll on NEW messages at bottom
    if (diff > 0 && shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [messages, shouldAutoScroll]);
  // Handle scroll position, infinite scroll, and auto-scroll toggle
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      const target = e.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = target;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const isNearBottom = distanceFromBottom < 150;
      setShouldAutoScroll(isNearBottom);
      setShowScrollToBottom(!isNearBottom && distanceFromBottom > 300);
      // Infinite scroll if at top
      if (scrollTop <= 100 && hasMoreMessages && !isLoading && onLoadMore) {
        scrollPositionRef.current = scrollHeight;
        onLoadMore();
      }
    },
    [hasMoreMessages, isLoading, onLoadMore]
  );

  // Restore scroll after loading historical messages
  useLayoutEffect(() => {
    if (!scrollPositionRef.current) return;

    const el = messagesContainerRef.current;
    if (!el) return;

    const diff = el.scrollHeight - scrollPositionRef.current;

    el.scrollTop = diff;

    scrollPositionRef.current = 0;
  }, [messages.length]);

  // Utility to scroll to bottom and enable auto-scroll
  const scrollToBottom = useCallback(() => {
    setShouldAutoScroll(true);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    messagesContainerRef.current?.focus();
  }, []);

  const orderedMessages = useMemo(() => {
    return sortMessages(messages);
  }, [messages]);

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return orderedMessages;

    const q = searchQuery.toLowerCase();

    return orderedMessages.filter((m) => m.content?.toLowerCase().includes(q));
  }, [orderedMessages, searchQuery]);

  const groupedMessages = useMemo(() => {
    return groupMessagesByDate(filteredMessages);
  }, [filteredMessages]);

  // Optionally show avatar for last in group not sent by user (still appears at the bottom per group)
  const shouldShowAvatar = (message: Message, index: number, groupMessages: Message[]) => {
    if (message.senderId === currentUser.id) return false;
    return index === groupMessages.length - 1;
  };

  // Show timestamp on first or last message in date-group
  const shouldShowTimestamp = (message: Message, index: number, groupMessages: Message[]) => {
    return index === 0 || index === groupMessages.length - 1;
  };

  const handleMessageSelect = (messageId: string) => {
    if (!isSelectionMode) return;
    setSelectedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    toast.success(`Deleted ${selectedMessages.size} messages`);
    setSelectedMessages(new Set());
    setIsSelectionMode(false);
  };

  // Lock body scroll if video call modal open
  useLockBodyScroll(showVideoCall);

  // Show empty state if no conversation selected
  if (!otherUserId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background h-full min-h-0">
        <div className="text-center space-y-4 max-w-md px-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-4xl">💬</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Select a conversation</h3>
            <p className="text-sm text-muted-foreground">
              Choose from your existing conversations or start a new one
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col bg-background relative h-full w-full min-h-0', className)}
      style={{ minHeight: 0, height: '100%' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Back Button - Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden -ml-2 hover:bg-accent"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* Avatar with Online Status */}
          <button
            onClick={() => toast.info('View profile')}
            className="relative group cursor-pointer"
            tabIndex={-1}
          >
            {otherUser?.avatar ? (
              <Image
                src={otherUser.avatar}
                alt={displayName}
                width={44}
                height={44}
                className="rounded-full object-cover ring-2 ring-background group-hover:ring-blue-500 transition-all"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg ring-2 ring-background group-hover:ring-blue-500 transition-all">
                {displayName[0]?.toUpperCase()}
              </div>
            )}
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full">
                <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
              </div>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-base truncate hover:text-blue-600 transition-colors cursor-pointer"
              tabIndex={-1}
            >
              {displayName}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              {isOnline ? (
                <>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Active now
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  Offline
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={showSearch ? 'secondary' : 'ghost'}
              size="icon"
              className="h-9 w-9"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hidden sm:flex"
              onClick={() => setShowVideoCall(true)}
            >
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 hidden sm:flex">
              <Phone className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setShowVideoCall(true)} className="sm:hidden">
                  <Video className="w-4 h-4 mr-2" />
                  Video Call
                </DropdownMenuItem>
                <DropdownMenuItem className="sm:hidden">
                  <Phone className="w-4 h-4 mr-2" />
                  Voice Call
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsSelectionMode(!isSelectionMode)}>
                  <FileText className="w-4 h-4 mr-2" />
                  {isSelectionMode ? 'Cancel Selection' : 'Select Messages'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Search className="w-4 h-4 mr-2" />
                  Search in Conversation
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Bell className="w-4 h-4 mr-2" />
                  Mute Notifications
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Chat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {!!showSearch && (
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        {isSelectionMode && (
          <div className="mt-3 flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {selectedMessages.size} selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" onClick={handleDeleteSelected}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedMessages(new Set());
                  setIsSelectionMode(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Messages Area - fills all vertical space between header and input */}
      <div className="flex-1 flex flex-col min-h-0 w-full relative">
        <ChatScrollArea
          messagesContainerRef={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 px-4 py-6 min-h-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.02) 1px, transparent 0)',
            backgroundSize: '32px 32px',
            minHeight: 0,
            maxHeight: '100%',
            overscrollBehavior: 'contain',
          }}
        >
          {/* Loading Indicator at Top */}
          {isLoading && hasMoreMessages && (
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Loading messages...
              </div>
            </div>
          )}

          {/* Messages */}
          <div
            className="space-y-6 max-w-4xl mx-auto flex flex-col"
            style={{ flexDirection: 'column' }}
          >
            {groupedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-2">
                  <span className="text-5xl">👋</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Start your conversation</h3>
                  <p className="text-muted-foreground max-w-sm text-sm">
                    Say hello to {otherUser?.name ?? displayName} and begin your chat!
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  <Button variant="outline" size="sm" onClick={() => onSendMessage('Hello! 👋')}>
                    Say Hello
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onSendMessage('How are you?')}>
                    Ask How They Are
                  </Button>
                </div>
              </div>
            ) : (
              groupedMessages.map((group, groupIndex) => (
                <div key={`${group.date}-${groupIndex}`} className="space-y-4">
                  {/* Date Divider */}
                  <div className="flex items-center justify-center my-8">
                    <div className="bg-card/80 backdrop-blur-sm border border-border px-4 py-1.5 rounded-full shadow-sm">
                      <span className="text-xs font-medium text-muted-foreground">
                        {group.date}
                      </span>
                    </div>
                  </div>
                  {/* Message Group */}
                  <div className="space-y-1">
                    {group.messages.map((message, index) => {
                      // Messages in each group are already ordered oldest (index 0) to newest (index last)
                      const isOwn = message.senderId === currentUser.id;
                      const showAvatar = shouldShowAvatar(message, index, group.messages);
                      const showTime = shouldShowTimestamp(message, index, group.messages);
                      return (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          onAddReaction={onAddReaction}
                          onRemoveReaction={onRemoveReaction}
                          isOwn={isOwn}
                          showAvatar={showAvatar}
                          showTimestamp={showTime}
                          sender={isOwn ? currentUser : (otherUser as UserInfo)}
                          onReply={setReplyingTo}
                          isSelected={selectedMessages.has(message.id)}
                          isSelectionMode={isSelectionMode}
                          onSelect={() => handleMessageSelect(message.id)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-start gap-3 ml-3 animate-in fade-in slide-in-from-bottom-2">
                {otherUser?.avatar ? (
                  <Image
                    src={otherUser.avatar}
                    alt={displayName}
                    width={32}
                    height={32}
                    className="rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex-shrink-0" />
                )}
                <TypingIndicator isVisible userName={displayName} />
              </div>
            )}
            {/* scrolling anchor at the bottom, so last message is truly at the bottom */}
            <div ref={messagesEndRef} />
          </div>
        </ChatScrollArea>

        {/* Scroll to Bottom Button */}
        {showScrollToBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 z-10 bg-card hover:bg-accent border border-border rounded-full p-3 shadow-lg transition-all hover:scale-110 active:scale-95"
            aria-label="Scroll to latest message"
            tabIndex={0}
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}
      </div>
      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-3 bg-muted/50 border-t border-border">
          <div className="flex items-start gap-3 max-w-4xl mx-auto">
            <div className="w-1 h-full bg-blue-500 rounded-full" />
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Replying to {replyingTo.senderId === currentUser.id ? 'yourself' : displayName}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setReplyingTo(null)}
                  className="h-6 w-6 -mt-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm truncate text-muted-foreground">{replyingTo.content}</p>
            </div>
          </div>
        </div>
      )}
      {/* Message Input - sticky bottom */}
      <div className="sticky bottom-0 left-0 right-0 z-10 bg-background border-t border-border">
        <MessageInput
          onSendMessage={onSendMessage}
          onStartTyping={onStartTyping}
          onStopTyping={onStopTyping}
          placeholder={`Message ${otherUser?.name ?? displayName}...`}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      </div>
      {/* Video Call Modal */}
      {showVideoCall && otherUser && (
        <VideoCall
          chat={chat}
          currentUser={currentUser}
          otherUser={otherUser}
          onClose={() => setShowVideoCall(false)}
        />
      )}
    </div>
  );
}
