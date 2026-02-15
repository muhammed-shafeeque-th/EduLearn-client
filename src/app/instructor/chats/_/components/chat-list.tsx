'use client';

import { useMemo, useState, useCallback, memo } from 'react';
import Image from 'next/image';
import {
  Search,
  Pin,
  MoreVertical,
  MessageSquarePlus,
  BellOff,
  Trash2,
  Archive,
  X,
  SlidersHorizontal,
  MessageCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Chat } from '@/types/chat';
import type { UserInfo } from '@/types/user';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isToday, isYesterday } from 'date-fns';
import { getOtherUser, getUserDisplayName } from '@/lib/chat/chat-utils';
import { Skeleton } from '@/components/ui/skeleton';

type FilterType = 'all' | 'unread' | 'pinned' | 'archived' | 'groups';
type SortBy = 'recent' | 'name' | 'unread';

interface ChatListProps {
  chats: Chat[];
  selectedChat?: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onlineUsers: Set<string>;
  currentUser: UserInfo;
  onPin: (chatId: string) => void;
  onMute: (chatId: string) => void;
  onArchive: (chatId: string) => void;
  onDelete: (chatId: string) => void;
  isLoading?: boolean;
}

export function ChatList({
  chats,
  selectedChat,
  onSelectChat,
  onlineUsers,
  currentUser,
  onPin,
  onMute,
  onArchive,
  onDelete,
  isLoading = false,
}: ChatListProps) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  // const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    onlineOnly: false,
    unreadOnly: false,
    favoriteOnly: false,
  });

  const filtered = useMemo(() => {
    let list = [...chats];

    // Apply type filter
    if (type === 'pinned') list = list.filter((c) => c.isPinned);
    if (type === 'archived') list = list.filter((c) => c.isArchived);
    if (type === 'unread') list = list.filter((c) => (c.unreadCount ?? 0) > 0);

    // Apply additional filters
    if (filters.onlineOnly) {
      list = list.filter((c) => {
        const { otherUserId } = getOtherUser(c, currentUser.id);
        return otherUserId && onlineUsers.has(otherUserId);
      });
    }
    if (filters.unreadOnly) {
      list = list.filter((c) => (c.unreadCount ?? 0) > 0);
    }

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((chat) => {
        const { otherUser } = getOtherUser(chat, currentUser.id);
        const name = getUserDisplayName(otherUser).toLowerCase();
        const preview = chat.lastMessagePreview?.toLowerCase() ?? '';
        return name.includes(q) || preview.includes(q);
      });
    }

    // Sort
    list.sort((a, b) => {
      // Pinned always on top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === 'name') {
        const aName = getUserDisplayName(getOtherUser(a, currentUser.id).otherUser);
        const bName = getUserDisplayName(getOtherUser(b, currentUser.id).otherUser);
        return aName.localeCompare(bName);
      }

      if (sortBy === 'unread') {
        return (b.unreadCount ?? 0) - (a.unreadCount ?? 0);
      }

      return b.updatedAt - a.updatedAt;
    });

    return list;
  }, [chats, currentUser.id, search, type, sortBy, filters, onlineUsers]);

  const stats = useMemo(() => {
    const total = chats.length;
    const unread = chats.filter((c) => (c.unreadCount ?? 0) > 0).length;
    const pinned = chats.filter((c) => c.isPinned).length;
    const archived = chats.filter((c) => c.isArchived).length;
    const online = chats.filter((c) => {
      const { otherUserId } = getOtherUser(c, currentUser.id);
      return otherUserId && onlineUsers.has(otherUserId);
    }).length;

    return { total, unread, pinned, archived, online };
  }, [chats, currentUser.id, onlineUsers]);

  const handleClearSearch = useCallback(() => {
    setSearch('');
  }, []);

  return (
    <div className="w-full lg:w-[400px] bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Messages
            </h2>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {stats.total}
              </span>
              {stats.unread > 0 && (
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                  {stats.unread} unread
                </span>
              )}
              {stats.online > 0 && (
                <span className="flex items-center gap-1 text-green-600">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                  {stats.online} online
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuCheckboxItem
                  checked={filters.onlineOnly}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, onlineOnly: checked }))
                  }
                >
                  Online only
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.unreadOnly}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, unreadOnly: checked }))
                  }
                >
                  Unread only
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.favoriteOnly}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, favoriteOnly: checked }))
                  }
                >
                  Favorites only
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10 h-10 bg-background/50 backdrop-blur-sm border-border/50 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
          />
          {search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Button
            variant={type === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setType('all')}
            className={cn(
              'h-8 rounded-full px-3 flex-shrink-0',
              type === 'all' && 'bg-gradient-to-r from-blue-600 to-blue-700'
            )}
          >
            All
            {stats.total > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                {stats.total}
              </Badge>
            )}
          </Button>
          {stats.unread > 0 && (
            <Button
              variant={type === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType('unread')}
              className="h-8 rounded-full px-3 flex-shrink-0"
            >
              Unread
              <Badge variant="destructive" className="ml-1.5 h-4 px-1 text-[10px]">
                {stats.unread}
              </Badge>
            </Button>
          )}
          {stats.pinned > 0 && (
            <Button
              variant={type === 'pinned' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setType('pinned')}
              className="h-8 rounded-full px-3 flex-shrink-0"
            >
              <Pin className="w-3 h-3 mr-1" />
              Pinned
            </Button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={(v: SortBy) => setSortBy(v)}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="unread">Unread First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ChatItemSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
              <MessageSquarePlus className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">
                {search ? 'No chats found' : 'No conversations yet'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {search ? 'Try a different search term' : 'Start a new conversation to get started'}
              </p>
            </div>
            {search && (
              <Button variant="outline" onClick={handleClearSearch} className="mt-4">
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChat?.id === chat.id}
                onSelect={() => onSelectChat(chat)}
                currentUser={currentUser}
                onlineUsers={onlineUsers}
                onPin={() => onPin(chat.id)}
                onMute={() => onMute(chat.id)}
                onArchive={() => onArchive(chat.id)}
                onDelete={() => onDelete(chat.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

const ChatItem = memo(function ChatItem({
  chat,
  isSelected,
  onSelect,
  currentUser,
  onlineUsers,
  onPin,
  onMute,
  onArchive,
  onDelete,
}: {
  chat: Chat;
  isSelected: boolean;
  onSelect: () => void;
  currentUser: UserInfo;
  onlineUsers: Set<string>;
  onPin: () => void;
  onMute: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const { otherUser, otherUserId } = getOtherUser(chat, currentUser.id);
  const isOnline = otherUserId ? onlineUsers.has(otherUserId) : false;
  const displayName = getUserDisplayName(otherUser);
  const displayAvatar = otherUser?.avatar;
  const isMuted = typeof chat.mutedUntil === 'number' ? chat.mutedUntil > Date.now() : false;
  const hasUnread = (chat.unreadCount ?? 0) > 0;

  const formatLastMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full p-4 hover:bg-accent/50 transition-all duration-200 relative group',
        isSelected &&
          'bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border-l-4 border-l-blue-600',
        !isSelected && hasUnread && 'bg-blue-50/30 dark:bg-blue-950/10',
        isMuted && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar with Status */}
        <div className="relative flex-shrink-0">
          {displayAvatar ? (
            <Image
              src={displayAvatar}
              alt={displayName}
              width={56}
              height={56}
              className="rounded-full object-cover ring-2 ring-background shadow-sm"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl ring-2 ring-background shadow-sm">
              {displayName[0]?.toUpperCase()}
            </div>
          )}

          {isOnline && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-card rounded-full">
              <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
            </div>
          )}

          {hasUnread && !isSelected && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 border-2 border-card rounded-full flex items-center justify-center">
              <span className="text-[10px] text-white font-bold">
                {chat.unreadCount! > 9 ? '9+' : chat.unreadCount}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-start justify-between mb-1.5 gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h4
                className={cn(
                  'font-semibold truncate transition-colors',
                  hasUnread && 'text-blue-600 dark:text-blue-400',
                  isSelected && 'text-blue-700 dark:text-blue-300'
                )}
              >
                {displayName}
              </h4>
              {chat.isPinned && (
                <Pin className="w-3.5 h-3.5 text-blue-600 fill-blue-600 shrink-0" />
              )}
              {isMuted && <BellOff className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
            </div>

            <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
              {formatLastMessageTime(chat.updatedAt)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <p
              className={cn(
                'text-sm truncate flex-1',
                hasUnread ? 'font-medium text-foreground' : 'text-muted-foreground'
              )}
            >
              {chat.lastMessagePreview ?? <span className="italic">No messages yet</span>}
            </p>

            {/* Unread Badge */}
            {hasUnread && (
              <Badge
                variant="default"
                className="h-5 min-w-5 px-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] shrink-0 font-bold"
              >
                {chat.unreadCount! > 99 ? '99+' : chat.unreadCount}
              </Badge>
            )}
          </div>

          {/* Tags/Labels */}
          {chat.isArchived && (
            <Badge variant="secondary" className="mt-1.5 h-5 text-[10px]">
              <Archive className="w-2.5 h-2.5 mr-1" />
              Archived
            </Badge>
          )}
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onPin();
              }}
            >
              <Pin className="w-4 h-4 mr-2" />
              {chat.isPinned ? 'Unpin Conversation' : 'Pin Conversation'}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onMute();
              }}
            >
              <BellOff className="w-4 h-4 mr-2" />
              {isMuted ? 'Unmute' : 'Mute Notifications'}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onArchive();
              }}
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive Chat
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </button>
  );
});

function ChatItemSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4">
      <Skeleton className="w-14 h-14 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}
