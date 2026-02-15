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
import type { UserMeta } from '@/types/user';
import { ScrollArea } from '@/components/ui/scroll-area';
import { userService } from '@/services/user.service';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@/components/ui/skeleton';

interface NewMessageDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (userId: string) => Promise<void>;
}

const analyzeSearchQuery = (query: string) => {
  const normalized = query.trim().replace(/\s+/g, ' ');
  const lowered = normalized.toLowerCase();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  return { lowered, isEmail };
};

export function NewMessageDialog({ open, onClose, onCreate }: NewMessageDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 350);
  const [users, setUsers] = useState<UserMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserMeta | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch students of the logged-in instructor
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setUsers([]);
      setSelectedUser(null);
      setFetchError(null);
      setIsLoading(false);
      return;
    }

    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const { signal } = abortController;

    setFetchError(null);
    setIsLoading(true);

    async function fetchStudents() {
      try {
        const analyzed = analyzeSearchQuery(debouncedSearchQuery);

        const params: {
          page: number;
          pageSize: number;
          name?: string;
          email?: string;
        } = { page: 1, pageSize: 50 };

        if (debouncedSearchQuery.trim()) {
          if (analyzed.isEmail) {
            params.email = analyzed.lowered;
          } else {
            params.name = analyzed.lowered;
          }
        }

        // This service correctly fetches students of the logged-in instructor
        const response = await userService.getStudentsOfInstructor(params);

        if (signal.aborted) return;
        if (!response.success || !response.data) {
          throw new Error(response.message ?? 'Failed to fetch students');
        }

        setUsers(response.data);
        setFetchError(null);
      } catch (error: any) {
        if (
          (error instanceof DOMException && error.name === 'AbortError') ||
          (typeof error === 'object' && error && 'name' in error && error.name === 'AbortError')
        ) {
          return;
        }
        let message = 'Failed to load students';
        if (
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof error.message === 'string'
        ) {
          message = error.message;
        }
        setFetchError(message);
        setUsers([]);
        // Only log in development or as needed
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching students:', error);
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchStudents();

    return () => {
      abortController.abort();
    };
  }, [open, debouncedSearchQuery]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Filter students client-side if needed (especially for debounce/search)
  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;

    const { isEmail, lowered } = analyzeSearchQuery(query);

    if (isEmail) {
      return users.filter((user) => user.email?.toLowerCase().includes(lowered));
    }

    return users.filter((user) => {
      const name = (user.firstName ?? '') + ' ' + (user.lastName ?? '');
      return (
        name.toLowerCase().includes(lowered) ||
        user.email?.toLowerCase().includes(lowered) ||
        (user.role?.toLowerCase?.() ?? '').includes(lowered)
      );
    });
  }, [users, searchQuery]);

  const handleCreate = useCallback(async () => {
    if (!selectedUser || isCreating) return;
    setIsCreating(true);
    try {
      await onCreate(selectedUser.id);
      // parent handles dialog close
    } catch (e) {
      // Parent should handle error appropriately
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating chat:', e);
      }
    } finally {
      setIsCreating(false);
    }
  }, [selectedUser, isCreating, onCreate]);

  const handleUserSelect = useCallback((user: UserMeta) => {
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl">New Message</DialogTitle>
          <DialogDescription>Search for your students to start a conversation</DialogDescription>
        </DialogHeader>

        <div className="px-6 space-y-4">
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
              aria-label="Search Students"
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
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {selectedUser.username?.[0]?.toUpperCase() ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate text-foreground">
                    {selectedUser.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{selectedUser.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedUser(null)}
                disabled={isCreating}
                className="flex-shrink-0"
                aria-label="Deselect user"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Users List */}
        <ScrollArea className="h-[320px] px-6">
          {isLoading ? (
            <div className="space-y-2 py-2" aria-label="Loading students">
              {Array.from({ length: 5 }).map((_, i) => (
                <UserItemSkeleton key={i} />
              ))}
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-sm font-medium mb-1">Failed to load students</p>
              <p className="text-xs text-muted-foreground mb-4">{fetchError}</p>
              <Button onClick={handleRetry} size="sm" variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
                <UsersIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium mb-1">
                {searchQuery ? 'No students found' : 'No students available'}
              </p>
              <p className="text-xs text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'You have no students to message'}
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
                  aria-selected={selectedUser?.id === user.id}
                  tabIndex={0}
                >
                  <Avatar className="h-11 w-11 flex-shrink-0">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {user.firstName?.[0]?.toUpperCase() ?? '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-sm truncate text-foreground">
                        {user.firstName + ' ' + user.lastName}
                      </p>
                      {'isOnline' in user && !!(user as any).isOnline && (
                        <div
                          className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"
                          title="Online"
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  {/* <Badge
                    variant={user.role === 'student' ? 'default' : 'secondary'}
                    className="flex-shrink-0"
                  >
                    {user.role}
                  </Badge> */}
                  {selectedUser?.id === user.id && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-end gap-2 p-6 pt-4 border-t border-border bg-muted/30">
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

function UserItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg">
      <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
}
