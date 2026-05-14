'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, X, Users as UsersIcon, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { UserInfo } from '@/types/user';

import { userService } from '@/services/user';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@/components/ui/skeleton';
import type { ChatRole } from '@/services/ws/chat/hooks/use-messaging';
import { instructorService } from '@/services/instructor';

// Props

interface NewMessageDialogProps {
  open: boolean;
  userId: string;
  onClose: () => void;
  onCreate: (userId: string) => Promise<void>;
  role: ChatRole;
}

// Helpers

const analyzeSearchQuery = (query: string) => {
  const normalized = query.trim().replace(/\s+/g, ' ');
  const lowered = normalized.toLowerCase();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  return { lowered, isEmail };
};

const ROLE_CONFIG = {
  instructor: {
    description: 'Search for your students to start a conversation',
    searchAriaLabel: 'Search Students',
    emptyLabel: 'students',
    fetchFn: (params: Record<string, unknown>) => instructorService.getStudentsOfInstructor(params),
  },
  student: {
    description: 'Search for your instructors to start a conversation',
    searchAriaLabel: 'Search Instructors',
    emptyLabel: 'instructors',
    fetchFn: (params: Record<string, unknown>) => userService.getInstructorsOfStudent(params),
  },
} as const;

// Component
export function NewMessageDialog({ open, userId, onClose, onCreate, role }: NewMessageDialogProps) {
  const cfg = ROLE_CONFIG[role];

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 350);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  //  Fetch users

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setUsers([]);
      setSelectedUser(null);
      setFetchError(null);
      setIsLoading(false);
      return;
    }

    // Abort previous request
    abortControllerRef.current?.abort();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const { signal } = abortController;

    setFetchError(null);
    setIsLoading(true);

    async function fetchUsers() {
      try {
        const analyzed = analyzeSearchQuery(debouncedSearchQuery);

        const params: Record<string, unknown> = { page: 1, pageSize: 50 };

        if (debouncedSearchQuery.trim()) {
          if (analyzed.isEmail) {
            params.email = analyzed.lowered;
          } else {
            params.name = analyzed.lowered;
          }
        }

        const response = await cfg.fetchFn(params);

        if (signal.aborted) return;
        if (!response.success || !response.data) {
          throw new Error(response.message ?? `Failed to fetch ${cfg.emptyLabel}`);
        }

        setUsers(response.data.filter((user) => user.id !== userId));
        setFetchError(null);
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        const message = error instanceof Error ? error.message : `Failed to load ${cfg.emptyLabel}`;

        setFetchError(message);
        setUsers([]);

        if (process.env.NODE_ENV === 'development') {
          console.error(`Error fetching ${cfg.emptyLabel}:`, error);
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      abortController.abort();
    };
  }, [open, debouncedSearchQuery, cfg, userId]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  //  Client-side filter

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;

    const { isEmail, lowered } = analyzeSearchQuery(query);

    if (isEmail) {
      return users.filter((u) => u.email?.toLowerCase().includes(lowered));
    }

    return users.filter(
      (u) => u.name.toLowerCase().includes(lowered) || u.email?.toLowerCase().includes(lowered)
    );
  }, [users, searchQuery]);

  //  Handlers

  const handleCreate = useCallback(async () => {
    if (!selectedUser || isCreating) return;
    setIsCreating(true);
    try {
      await onCreate(selectedUser.id);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating chat:', e);
      }
    } finally {
      setIsCreating(false);
    }
  }, [selectedUser, isCreating, onCreate]);

  const handleUserSelect = useCallback((user: UserInfo) => {
    setSelectedUser(user);
  }, []);

  const handleClose = useCallback(() => {
    if (isCreating) return;
    onClose();
  }, [isCreating, onClose]);

  const handleRetry = useCallback(() => {
    setFetchError(null);
    setSearchQuery('');
  }, []);

  //  Render
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[540px] max-h-[85vh] p-0 gap-0 overflow-hidden"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle className="text-xl">New Message</DialogTitle>
          <DialogDescription>{cfg.description}</DialogDescription>
        </DialogHeader>

        <div className="px-6 space-y-4 shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              ref={inputRef}
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
              disabled={isCreating}
              spellCheck={false}
              autoComplete="off"
              aria-label={cfg.searchAriaLabel}
            />
            {!!searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isCreating}
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Selected User Preview */}
          {!!selectedUser && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white">
                    {selectedUser.name?.[0]?.toUpperCase() ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate text-foreground">
                    {selectedUser.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{selectedUser.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedUser(null)}
                disabled={isCreating}
                className="shrink-0"
                aria-label="Deselect user"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Users List — scrollable, takes remaining space */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6">
          {isLoading ? (
            <div className="space-y-2 py-2" aria-label={`Loading ${cfg.emptyLabel}`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <UserItemSkeleton key={i} />
              ))}
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-sm font-medium mb-1">Failed to load {cfg.emptyLabel}</p>
              <p className="text-xs text-muted-foreground mb-4">{fetchError}</p>
              <Button onClick={handleRetry} size="sm" variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
                <UsersIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium mb-1">
                {searchQuery ? `No ${cfg.emptyLabel} found` : `No ${cfg.emptyLabel} available`}
              </p>
              <p className="text-xs text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : `You have no ${cfg.emptyLabel} to message`}
              </p>
            </div>
          ) : (
            <div className="space-y-1 py-2">
              {filteredUsers.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  disabled={isCreating}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-all',
                    'hover:bg-accent focus:bg-accent focus:outline-none',
                    selectedUser?.id === user.id &&
                      'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800',
                    isCreating && 'opacity-50 cursor-not-allowed'
                  )}
                  tabIndex={0}
                >
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white">
                      {user.name?.[0]?.toUpperCase() ?? '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-sm truncate text-foreground">{user.name}</p>
                      {'isOnline' in user &&
                        !!(user as UserInfo & { isOnline?: boolean }).isOnline && (
                          <div
                            className="w-2 h-2 bg-green-500 rounded-full shrink-0"
                            title="Online"
                          />
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  {selectedUser?.id === user.id && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions — always visible at bottom */}
        <div className="flex justify-end gap-2 p-6 pt-4 border-t border-border bg-muted/30 shrink-0">
          <Button variant="outline" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedUser || isCreating}
            className="min-w-[120px]"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Start Chat'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Skeleton
function UserItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg">
      <Skeleton className="h-11 w-11 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
}
