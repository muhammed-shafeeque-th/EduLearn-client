/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { messageService, MessagesParams } from '@/services/messaging.service';
import { Message, MessageReaction } from '@/types/chat';

// --- Queries ---

export function useStudentChats(
  filters: Partial<MessagesParams> = {},
  options?: { enabled?: boolean }
) {
  const pageSize = filters.pageSize || 20;

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.chat.studentChats(),
    queryFn: async ({ pageParam = 1, signal }) => {
      const response = await messageService.getStudentChats(
        {
          ...filters,
          page: pageParam,
          pageSize,
        },
        { signal }
      );

      if (!response.success) throw new Error(response.message || 'Failed to fetch messages');

      return {
        chats: response.data,
        pagination: response.pagination,
        page: pageParam,
      };
    },
    initialPageParam: 1,
    enabled: options?.enabled ?? true,
    getNextPageParam: (lastPage) => (lastPage.pagination?.hasNext ? lastPage.page + 1 : undefined),
    getPreviousPageParam: (firstPage) =>
      firstPage.pagination?.hasPrev ? firstPage.page - 1 : undefined,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    meta: {
      errorMessage: 'Failed to load chats',
    },
  });
}

export function useInstructorChats(
  filters: Partial<MessagesParams> = {},
  options?: { enabled?: boolean }
) {
  const pageSize = filters.pageSize || 20;

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.chat.instructorChats(),
    queryFn: async ({ pageParam = 1, signal }) => {
      const response = await messageService.getInstructorChats(
        {
          ...filters,
          page: pageParam,
          pageSize,
        },
        { signal }
      );

      if (!response.success) throw new Error(response.message || 'Failed to fetch messages');

      return {
        chats: response.data ?? [],
        pagination: response.pagination,
        page: pageParam,
      };
    },
    initialPageParam: 1,
    enabled: options?.enabled ?? true,
    getNextPageParam: (lastPage) => (lastPage.pagination?.hasNext ? lastPage.page + 1 : undefined),
    getPreviousPageParam: (firstPage) =>
      firstPage.pagination?.hasPrev ? firstPage.page - 1 : undefined,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    meta: {
      errorMessage: 'Failed to load chats',
    },
  });
}

export function useMessages(chatId: string, filters: Partial<MessagesParams> = {}) {
  const pageSize = filters.pageSize || 20;

  return useInfiniteQuery({
    queryKey: QUERY_KEYS.chat.chat(chatId),
    enabled: !!chatId,
    queryFn: async ({ pageParam = 1, signal }) => {
      const response = await messageService.getMessages(
        chatId,
        {
          ...filters,
          page: pageParam,
          pageSize,
        },
        { signal }
      );

      if (!response.success) throw new Error(response.message || 'Failed to fetch messages');

      return {
        messages: response.data,
        pagination: response.pagination,
        page: pageParam,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.pagination?.hasNext ? lastPage.page + 1 : undefined),
    getPreviousPageParam: (firstPage) =>
      firstPage.pagination?.hasPrev ? firstPage.page - 1 : undefined,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    meta: {
      errorMessage: 'Failed to load chats',
    },
  });
}

// --- List Flatteners ---

export function useStudentChatList(
  filters: Partial<MessagesParams> = {},
  options?: { enabled?: boolean }
) {
  const query = useStudentChats(filters, options);
  const chats = query.data?.pages.flatMap((page) => page.chats) || [];
  const unreadCount = query.data?.pages[0]?.pagination?.total;
  const hasMore = query.hasNextPage ?? false;

  return { ...query, chats, unreadCount, hasMore };
}

export function useInstructorChatList(
  filters: Partial<MessagesParams> = {},
  options?: { enabled?: boolean }
) {
  const query = useInstructorChats(filters, options);
  const chats = query.data?.pages.flatMap((page) => page.chats) ?? [];
  const total = query.data?.pages[0]?.pagination?.total;
  const unreadCount = total || chats.length;
  const hasMore = query.hasNextPage ?? false;

  return { ...query, chats, unreadCount, hasMore };
}

export function useMessageList(chatId: string, filters: Partial<MessagesParams> = {}) {
  const query = useMessages(chatId, filters);
  const messages = query.data?.pages.flatMap((page) => page.messages) ?? [];
  const unreadCount = messages.length;
  const hasMore = query.hasNextPage ?? false;
  return { ...query, messages, unreadCount, hasMore };
}

// --- Mutations ---

export function useMarkChatAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await messageService.markAsRead(id);
      if (!response.success) throw new Error(response.message || 'Failed to mark as read');
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.chat.all });

      const previousMessaging = queryClient.getQueriesData({
        queryKey: QUERY_KEYS.chat.all,
      });

      queryClient.setQueriesData<{ messages: Message[] }>(
        { queryKey: QUERY_KEYS.chat.chat(id) },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: old.messages.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
          };
        }
      );

      // queryClient.setQueriesData({ queryKey: QUERY_KEYS.chat.instructorChats() }, (old: any) => {
      //   if (!old?.pages) return old;
      //   return {
      //     ...old,
      //     pages: old.pages.map((page: any) => ({
      //       ...page,
      //       messages: page.messages.map((n: Message) => (n.id === id ? { ...n, isRead: true } : n)),
      //     })),
      //   };
      // });

      return { previousMessaging };
    },
    onError: (_err, _id, context) => {
      if (context?.previousMessaging) {
        context.previousMessaging.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to mark notification as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chat.unreadCount() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chat.all });
    },
  });
}

/**
 * Hook to optimistically add a reaction to a message.
 * Usage: mutate({ chatId, messageId, emoji, userId });
 */
export function useAddMessageReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    // payload: { chatId, messageId, emoji, userId }
    mutationFn: async (payload: {
      chatId: string;
      messageId: string;
      emoji: string;
      userId: string;
    }) => {
      const { chatId, messageId, emoji } = payload;
      const response = await messageService.reactMessage(chatId, messageId, emoji);
      if (!response.success) throw new Error(response.message || 'Failed to add reaction');
      return response.data; // may be undefined if backend doesn't return reaction, but we optimistically constructed it on mutate
    },
    onMutate: async (payload) => {
      const { chatId, messageId, emoji, userId } = payload;

      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.chat.chat(chatId) });

      const previousData = queryClient.getQueryData<any>(QUERY_KEYS.chat.chat(chatId));

      // Optimistically update
      queryClient.setQueryData(QUERY_KEYS.chat.chat(chatId), (old: any) => {
        if (!old?.pages) return old;
        const reaction: MessageReaction = {
          id: crypto.randomUUID(),
          userId,
          emoji,
          timestamp: Date.now(),
        };
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            messages: page.messages.map((m: Message) =>
              m.id === messageId
                ? {
                    ...m,
                    reactions: [
                      ...(m.reactions?.filter((r) => r.userId !== payload.userId) ?? []),
                      reaction,
                    ],
                  }
                : m
            ),
          })),
        };
      });

      return { previousData, chatId };
    },
    onError: (_err, _payload, context) => {
      if (context?.chatId && context?.previousData) {
        queryClient.setQueryData(QUERY_KEYS.chat.chat(context.chatId), context.previousData);
      }
      toast.error('Failed to add reaction');
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chat.chat(variables.chatId) });
    },
    // onSettled: (_data, _error, variables) => {
    //   if (variables?.chatId) {
    //     queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chat.chat(variables.chatId) });
    //   }
    // },
  });
}

/**
 * Hook to optimistically remove a reaction from a message.
 * Usage: mutate({ chatId, messageId, reactionId });
 */
export function useRemoveMessageReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    // payload: { chatId, messageId, reactionId }
    mutationFn: async (payload: { chatId: string; messageId: string; reactionId: string }) => {
      const { chatId, messageId, reactionId } = payload;
      await messageService.removeReaction(chatId, messageId, reactionId);
      // if (!response.success) throw new Error(response.message || 'Failed to remove reaction');
      // return response.data;
    },
    onMutate: async (payload) => {
      const { chatId, messageId, reactionId } = payload;

      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.chat.chat(chatId) });

      const previousData = queryClient.getQueryData<any>(QUERY_KEYS.chat.chat(chatId));

      // Optimistically update
      queryClient.setQueryData(QUERY_KEYS.chat.chat(chatId), (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            messages: page.messages.map((m: Message) =>
              m.id === messageId
                ? {
                    ...m,
                    reactions: (m.reactions ?? []).filter((r) => r.id !== reactionId),
                  }
                : m
            ),
          })),
        };
      });
      return { previousData, chatId };
    },
    onError: (_err, _payload, context) => {
      if (context?.chatId && context?.previousData) {
        queryClient.setQueryData(QUERY_KEYS.chat.chat(context.chatId), context.previousData);
      }
      toast.error('Failed to remove reaction');
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chat.chat(variables.chatId) });
    },
    onSettled: (_data, _error, variables) => {
      if (variables?.chatId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chat.chat(variables.chatId) });
      }
    },
  });
}

export function useDeleteMessage(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await messageService.deleteMessage(chatId, messageId);
      if (!response.success) throw new Error(response.message || 'Failed to delete notification');
      return messageId;
    },
    onMutate: async (messageId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.chat.all });

      const previousMessaging = queryClient.getQueriesData({
        queryKey: QUERY_KEYS.chat.all,
      });

      // Optimistically remove from lists
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.chat.all }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            messages: page.messages.filter((n: Message) => n.id !== messageId),
          })),
        };
      });

      // Remove from detail cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.chat.messages(chatId) });

      return { previousMessaging };
    },
    onError: (_err, _id, context) => {
      if (context?.previousMessaging) {
        context.previousMessaging.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to delete notification');
    },
    onSuccess: () => {
      toast.success('Message deleted');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chat.unreadCount() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chat.all });
    },
  });
}
