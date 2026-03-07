/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { messageService } from '@/services/messaging.service';
import type { Chat, Message } from '@/types/chat';
import type { ChatRole } from '@/services/ws/chat/hooks/use-messaging';

// Send Message
type SendMessageArgs = {
  chatId: string;
  userId: string;
  content: string;
};

export function useSendMessage(role: ChatRole = 'student') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, content }: SendMessageArgs) => {
      const res = await messageService.sendMessage(chatId, content);

      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to send message');
      }
      return res.data as Message;
    },

    onMutate: async ({ chatId, userId, content }) => {
      const tempId = `temp-${Date.now()}`;

      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.chat.chat(chatId) });

      const optimistic: Message = {
        id: tempId,
        chatId,
        senderId: userId,
        content,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sequence: 0,
        reactions: [],
      };

      // Append to messages cache
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.chat.chat(chatId) }, (old: any) => {
        if (!old?.pages) return old;
        const pages = [...old.pages];
        const lastPage = pages[pages.length - 1];
        pages[pages.length - 1] = {
          ...lastPage,
          messages: [...(lastPage.messages ?? []), optimistic],
        };
        return { ...old, pages };
      });

      // Update chat list preview
      const chatListKey =
        role === 'instructor' ? QUERY_KEYS.chat.instructorChats() : QUERY_KEYS.chat.studentChats();

      queryClient.setQueriesData({ queryKey: chatListKey }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((p: any) => ({
            ...p,
            chats: p.chats?.map((c: any) =>
              c.id === chatId ? { ...c, lastMessageId: tempId, updatedAt: Date.now() } : c
            ),
          })),
        };
      });

      return { tempId };
    },

    onSuccess: (serverMessage, { chatId }, ctx) => {
      // Replace temp message with server message
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.chat.chat(chatId) }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((p: any) => ({
            ...p,
            messages: p.messages.map((m: Message) => (m.id === ctx?.tempId ? serverMessage : m)),
          })),
        };
      });

      // Update chat list with real message id
      const chatListKey =
        role === 'instructor' ? QUERY_KEYS.chat.instructorChats() : QUERY_KEYS.chat.studentChats();

      queryClient.setQueriesData({ queryKey: chatListKey }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((p: any) => ({
            ...p,
            chats: p.chats?.map((c: any) =>
              c.id === chatId
                ? {
                    ...c,
                    lastMessageId: serverMessage.id,
                    updatedAt: serverMessage.createdAt,
                  }
                : c
            ),
          })),
        };
      });
    },

    onError: (err, { chatId }, ctx) => {
      // Rollback optimistic insert
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.chat.chat(chatId) }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((p: any) => ({
            ...p,
            messages: p.messages.filter((m: Message) => m.id !== ctx?.tempId),
          })),
        };
      });
      toast.error(err instanceof Error ? err.message : 'Failed to send message');
    },
  });
}

// Chat Mutations (pin, mute, archive, delete, create)

export function useChatMutations(role: ChatRole = 'student') {
  const queryClient = useQueryClient();

  const chatListKey =
    role === 'instructor' ? QUERY_KEYS.chat.instructorChats() : QUERY_KEYS.chat.studentChats();

  // Helper: update a single chat in the infinite-query cache
  function updateChatInCache(updated: Chat) {
    queryClient.setQueriesData({ queryKey: chatListKey }, (old: any) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          chats: page.chats?.map((c: Chat) => (c.id === updated.id ? { ...c, ...updated } : c)),
        })),
      };
    });
  }

  const createOrGetChatMutation = useMutation({
    mutationFn: (params: { studentId: string; instructorId: string; role: string }) =>
      messageService.createOrGetChat(params),
    onSuccess: (res) => {
      if (!res.success || !res.data) {
        toast.error(res.message || 'Failed to create chat');
        return;
      }

      queryClient.setQueriesData({ queryKey: chatListKey }, (old: any) => {
        if (!old?.pages) return old;

        const exists = old.pages.some((page: any) =>
          page.chats?.some((c: Chat) => c.id === res.data!.id)
        );
        if (exists) return old;

        const pages = old.pages.map((page: any, i: number) =>
          i === 0 ? { ...page, chats: [res.data!, ...(page.chats ?? [])] } : page
        );
        return { ...old, pages };
      });
    },
    onError: () => toast.error('Failed to create chat'),
  });

  const pinChatMutation = useMutation({
    mutationFn: (chatId: string) => messageService.pinChat(chatId),
    onSuccess: (res) => {
      if (!res.success || !res.data) {
        toast.error(res.message || 'Failed to pin chat');
        return;
      }
      updateChatInCache(res.data);
    },
    onError: () => toast.error('Failed to pin chat'),
  });

  const unpinChatMutation = useMutation({
    mutationFn: (chatId: string) => messageService.unpinChat(chatId),
    onSuccess: (res) => {
      if (!res.success || !res.data) {
        toast.error(res.message || 'Failed to unpin chat');
        return;
      }
      updateChatInCache(res.data);
    },
    onError: () => toast.error('Failed to unpin chat'),
  });

  const muteChatMutation = useMutation({
    mutationFn: ({ chatId, durationMs }: { chatId: string; durationMs?: number }) =>
      messageService.muteChat(chatId, durationMs),
    onSuccess: (res) => {
      if (!res.success || !res.data) {
        toast.error(res.message || 'Failed to mute chat');
        return;
      }
      updateChatInCache(res.data);
    },
    onError: () => toast.error('Failed to mute chat'),
  });

  const unmuteChatMutation = useMutation({
    mutationFn: (chatId: string) => messageService.unmuteChat(chatId),
    onSuccess: (res) => {
      if (!res.success || !res.data) {
        toast.error(res.message || 'Failed to unmute chat');
        return;
      }
      updateChatInCache(res.data);
    },
    onError: () => toast.error('Failed to unmute chat'),
  });

  const archiveChatMutation = useMutation({
    mutationFn: (chatId: string) => messageService.archiveChat(chatId),
    onSuccess: (res) => {
      if (!res.success || !res.data) {
        toast.error(res.message || 'Failed to archive chat');
        return;
      }
      updateChatInCache(res.data);
    },
    onError: () => toast.error('Failed to archive chat'),
  });

  const unarchiveChatMutation = useMutation({
    mutationFn: (chatId: string) => messageService.unarchiveChat(chatId),
    onSuccess: (res) => {
      if (!res.success || !res.data) {
        toast.error(res.message || 'Failed to unarchive chat');
        return;
      }
      updateChatInCache(res.data);
    },
    onError: () => toast.error('Failed to unarchive chat'),
  });

  const deleteChatMutation = useMutation({
    mutationFn: (chatId: string) => messageService.deleteChat(chatId),
    onSuccess: (res, chatId) => {
      if (!res.success) {
        toast.error(res.message || 'Failed to delete chat');
        return;
      }

      queryClient.setQueriesData({ queryKey: chatListKey }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            chats: page.chats?.filter((c: Chat) => c.id !== chatId),
          })),
        };
      });
    },
    onError: () => toast.error('Failed to delete chat'),
  });

  return {
    createOrGetChatMutation,
    pinChatMutation,
    unpinChatMutation,
    muteChatMutation,
    unmuteChatMutation,
    archiveChatMutation,
    unarchiveChatMutation,
    deleteChatMutation,
  };
}
