/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { messageService } from '@/services/messaging.service';
import type { Chat, Message } from '@/types/chat';

type SendMessageArgs = {
  chatId: string;
  userId: string;
  content: string;
};

export function useSendMessage() {
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

      //  minimal optimistic message
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

      //  optimistic insert in infinite messages cache
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

      //  also update chat preview (optional)
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.chat.instructorMessages(chatId) },
        (old: any) => {
          if (!old?.pages) return old;
          console.log(JSON.stringify(old.pages, null, 2));

          return {
            ...old,
            pages: old.pages.map((p: any) => ({
              ...p,
              messages: p.messages?.map((c: any) =>
                c.id === chatId
                  ? {
                      ...c,
                      lastMessageId: tempId,
                      updatedAt: Date.now(),
                    }
                  : c
              ),
            })),
          };
        }
      );

      return { tempId };
    },

    onSuccess: (serverMessage, { chatId }, ctx) => {
      //  replace temp message with server message
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

      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.chat.instructorMessages(chatId) },
        (old: any) => {
          if (!old?.pages) return old;

          return {
            ...old,
            pages: old.pages.map((p: any) => ({
              ...p,
              messages: p.messages.map((c: any) =>
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
        }
      );
    },

    onError: (err, { chatId }, ctx) => {
      // rollback optimistic insert
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

    // onSettled: (_d, _e, { chatId }) => {
    //   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chat.chat(chatId) });
    //   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chat.instructorMessages(chatId) });
    // },
  });
}

export function useChatMutations() {
  const queryClient = useQueryClient();

  const createOrGetChatMutation = useMutation({
    mutationFn: (enrollmentId: string) => messageService.createOrGetChat(enrollmentId),
    onSuccess: (res) => {
      if (!res.success || !res.data) {
        toast.error(res.message || 'Failed to create chat');
        return;
      }

      // Ensure we update all query data for infinite query format
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.chat.instructorChats() }, (old: any) => {
        if (!old?.pages) return old;
        // Check if the chat already exists
        const chatExists = old.pages.some((page: any) =>
          page.chats?.some((c: Chat) => c.id === res.data!.id)
        );
        if (chatExists) return old;

        // Prepend the new chat to the first page
        const pages = old.pages.map((page: any, i: number) =>
          i === 0 ? { ...page, chats: [res.data!, ...(page.chats ?? [])] } : page
        );

        return {
          ...old,
          pages,
        };
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
      updateChat(res.data);
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
      updateChat(res.data);
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
      updateChat(res.data);
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
      updateChat(res.data);
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
      updateChat(res.data);
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
      updateChat(res.data);
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

      // remove from cache
      queryClient.setQueryData<Chat[]>(QUERY_KEYS.chat.instructorChats(), (prev) =>
        (prev ?? []).filter((c) => c.id !== chatId)
      );
    },
    onError: () => toast.error('Failed to delete chat'),
  });

  function updateChat(updated: Chat) {
    queryClient.setQueryData<Chat[]>(QUERY_KEYS.chat.instructorChats(), (prev) => {
      const list = prev ?? [];
      return list.map((c) => (c.id === updated.id ? { ...c, ...updated } : c));
    });
  }

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
