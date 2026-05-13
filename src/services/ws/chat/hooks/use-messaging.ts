/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useCallback, useRef, useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { Chat, Message } from '@/types/chat';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';

import {
  getSocketService,
  SocketService,
  type NewMessagePayload,
  type MessageEditedPayload,
  type MessageDeletedPayload,
  type MessageReactionPayload,
  type ReactionRemovedPayload,
  type TypingPayload,
  type ChatCreatedPayload,
} from '../socket.service';

import {
  useInstructorChatList,
  useStudentChatList,
  useMessageList,
  useAddMessageReaction,
  useRemoveMessageReaction,
} from '@/states/server/messaging/use-messaging';
import { useSendMessage, useChatMutations } from '@/states/server/messaging/use-chat-mutations';
import { chatService } from '@/services/chat';
import { debounce } from '@/lib/utils';
import { useOnlineUsers } from './use-online-users';

// Types

export type ChatRole = 'student' | 'instructor';

export interface UseMessagingOptions {
  userId?: string;
  chatId?: string;
  role: ChatRole;
  autoConnect?: boolean;
  onError?: (error: Error) => void;
}

// Constants

const TYPING_TIMEOUT = 5_000;

// Hook

export function useMessaging({
  userId,
  chatId,
  role,
  autoConnect = true,
  onError,
}: UseMessagingOptions) {
  const queryClient = useQueryClient();
  const sendMessageMutation = useSendMessage(role);
  const socketServiceRef = useRef<SocketService | null>(null);
  const currentChatIdRef = useRef<string | undefined>(chatId);
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // WebSocket UI state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const onlineUsers = useOnlineUsers();

  //  React Query data

  const instructorChatsQuery = useInstructorChatList(
    { pageSize: 50 },
    { enabled: role === 'instructor' }
  );
  const studentChatsQuery = useStudentChatList({ pageSize: 50 }, { enabled: role === 'student' });

  const chatsQuery = role === 'instructor' ? instructorChatsQuery : studentChatsQuery;
  const messagesQuery = useMessageList(chatId ?? '', { pageSize: 50 });

  const removeMessageReactionMutation = useRemoveMessageReaction();
  const addMessageReactionMutation = useAddMessageReaction();

  // Stable references
  const chats = useMemo(() => chatsQuery.chats ?? [], [chatsQuery.chats]);
  const messages = useMemo(() => messagesQuery.messages ?? [], [messagesQuery.messages]);

  const chatListQueryKey =
    role === 'instructor'
      ? QUERY_KEYS.chat.instructorChats(userId!)
      : QUERY_KEYS.chat.studentChats(userId!);

  const {
    createOrGetChatMutation,
    pinChatMutation,
    unpinChatMutation,
    muteChatMutation,
    unmuteChatMutation,
    archiveChatMutation,
    unarchiveChatMutation,
    deleteChatMutation,
  } = useChatMutations(role);

  //  Join / Leave chat room

  useEffect(() => {
    if (!socketServiceRef.current?.isConnected) return;
    if (!chatId) return;

    socketServiceRef.current.joinChat(chatId);
    currentChatIdRef.current = chatId;

    return () => {
      socketServiceRef.current?.leaveChat(chatId);
    };
  }, [isConnected, chatId]);

  //  Socket setup & event handlers

  useEffect(() => {
    if (!userId || !autoConnect) return;

    const socket = getSocketService();
    socketServiceRef.current = socket;
    setIsConnecting(true);

    const unsubs: Array<() => void> = [];

    // Connection events
    unsubs.push(
      socket.on('connect', () => {
        setIsConnected(true);
        setIsConnecting(false);

        // Rejoin current room
        if (currentChatIdRef.current) {
          socket.joinChat(currentChatIdRef.current);
        }

        // Refresh data after reconnection
        queryClient.invalidateQueries({ queryKey: chatListQueryKey });
        if (currentChatIdRef.current) {
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.chat.chat(currentChatIdRef.current),
          });
        }
      })
    );

    unsubs.push(
      socket.on('disconnect', () => {
        setIsConnected(false);
        // socket.io handles reconnection automatically
      })
    );

    unsubs.push(
      socket.on('error', (err) => {
        setIsConnecting(false);
        onError?.(err);
      })
    );

    // Message events
    unsubs.push(
      socket.on('message:new', (payload: NewMessagePayload) => handleNewMessage(payload.message))
    );
    unsubs.push(socket.on('message:edited', handleMessageEdited));
    unsubs.push(socket.on('message:deleted', handleMessageDeleted));
    unsubs.push(socket.on('message:reaction', handleReaction));
    unsubs.push(socket.on('message:reaction:removed', handleReactionRemoved));

    // Typing events
    unsubs.push(socket.on('typing:start', handleTypingStart));
    unsubs.push(socket.on('typing:stop', handleTypingStop));

    // Chat created
    unsubs.push(
      socket.on('chat:created', (payload: ChatCreatedPayload) => handleChatCreated(payload.chat))
    );

    // Connect
    socket.connect().catch((err) => {
      setIsConnecting(false);
      onError?.(err);
    });

    return () => {
      unsubs.forEach((fn) => fn());
      const timeouts = typingTimeoutRef.current;
      timeouts.forEach((t) => clearTimeout(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, autoConnect, onError, queryClient, chatListQueryKey]);

  //  Message Handlers

  const handleNewMessage = useCallback(
    (incoming: Message) => {
      // Skip WS events for messages sent by the current user — the optimistic
      // mutation already handles those. Without this guard, a race between the
      // WS event and the HTTP onSuccess callback causes duplicate messages.
      if (incoming.senderId === userId) {
        // Still update the chat-list preview (last message, timestamp)
        queryClient.setQueriesData({ queryKey: chatListQueryKey }, (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              chats: page.chats?.map((c: Chat) =>
                c.id !== incoming.chatId
                  ? c
                  : {
                      ...c,
                      lastMessageId: incoming.id,
                      lastMessagePreview: incoming.content.slice(0, 50),
                      updatedAt: incoming.createdAt,
                    }
              ),
            })),
          };
        });

        // Also replace the temp message if it still exists (race-condition backup)
        if (incoming.chatId === currentChatIdRef.current) {
          queryClient.setQueriesData(
            { queryKey: QUERY_KEYS.chat.chat(incoming.chatId) },
            (old: any) => {
              if (!old?.pages) return old;
              // Check if we still have a temp-* message or the real one isn't there yet
              const hasTemp = old.pages.some((p: any) =>
                p.messages?.some((m: Message) => m.id.startsWith('temp-'))
              );
              const hasReal = old.pages.some((p: any) =>
                p.messages?.some((m: Message) => m.id === incoming.id)
              );

              if (hasReal) return old; // Already replaced by onSuccess

              if (hasTemp) {
                // Replace the temp message with the real one
                return {
                  ...old,
                  pages: old.pages.map((page: any) => ({
                    ...page,
                    messages: page.messages.map((m: Message) =>
                      m.id.startsWith('temp-') ? incoming : m
                    ),
                  })),
                };
              }

              return old;
            }
          );
        }
        return;
      }

      // Update chat list preview for other users' messages
      queryClient.setQueriesData({ queryKey: chatListQueryKey }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            chats: page.chats?.map((c: Chat) =>
              c.id !== incoming.chatId
                ? c
                : {
                    ...c,
                    lastMessageId: incoming.id,
                    lastMessagePreview: incoming.content.slice(0, 50),
                    updatedAt: incoming.createdAt,
                    unreadCount:
                      incoming.chatId !== currentChatIdRef.current
                        ? (c.unreadCount ?? 0) + 1
                        : (c.unreadCount ?? 0),
                  }
            ),
          })),
        };
      });

      // Append to active chat messages
      if (incoming.chatId === currentChatIdRef.current) {
        queryClient.setQueriesData(
          { queryKey: QUERY_KEYS.chat.chat(incoming.chatId) },
          (old: any) => {
            if (!old?.pages) return old;

            // Deduplicate — check across all pages
            const exists = old.pages.some((p: any) =>
              p.messages?.some((m: Message) => m.id === incoming.id)
            );
            if (exists) return old;

            // Append to last page
            const pages = [...old.pages];
            const lastPage = pages[pages.length - 1];
            pages[pages.length - 1] = {
              ...lastPage,
              messages: [...(lastPage.messages ?? []), incoming],
            };
            return { ...old, pages };
          }
        );
      } else {
        toast.info('New message received', {
          description: incoming.content.slice(0, 50),
        });
      }
    },
    [queryClient, userId, chatListQueryKey]
  );

  const handleMessageEdited = useCallback(
    (payload: MessageEditedPayload) => {
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.chat.chat(payload.chatId) }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            messages: page.messages?.map((m: Message) =>
              m.id === payload.messageId
                ? {
                    ...m,
                    content: payload.content,
                    editedAt: payload.editedAt,
                    updatedAt: Date.now(),
                  }
                : m
            ),
          })),
        };
      });
    },
    [queryClient]
  );

  const handleMessageDeleted = useCallback(
    (payload: MessageDeletedPayload) => {
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.chat.chat(payload.chatId) }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            messages: page.messages?.filter((m: Message) => m.id !== payload.messageId),
          })),
        };
      });
    },
    [queryClient]
  );

  const handleReaction = useCallback(
    (payload: MessageReactionPayload) => {
      const newReaction = {
        id: payload.reaction.id ?? crypto.randomUUID(),
        userId: payload.reaction.userId,
        emoji: payload.reaction.emoji,
        timestamp: payload.reaction.timestamp ?? Date.now(),
      };

      queryClient.setQueriesData({ queryKey: QUERY_KEYS.chat.chat(payload.chatId) }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            messages: page.messages?.map((m: Message) => {
              if (m.id !== payload.messageId) return m;

              const existing = m.reactions ?? [];
              // Dedup: skip if reaction already exists by id or by same user+emoji
              const alreadyExists = existing.some(
                (r: any) =>
                  (newReaction.id && r.id === newReaction.id) ||
                  (r.userId === newReaction.userId && r.emoji === newReaction.emoji)
              );
              if (alreadyExists) return m;

              return { ...m, reactions: [...existing, newReaction] };
            }),
          })),
        };
      });
    },
    [queryClient]
  );

  const handleTypingStart = useCallback(
    (payload: TypingPayload) => {
      if (payload.userId === userId) return;
      if (payload.chatId !== chatId) return;

      setTypingUsers((prev) => new Set(prev).add(payload.userId));

      // Clear existing timeout
      const existing = typingTimeoutRef.current.get(payload.userId);
      if (existing) clearTimeout(existing);

      const timeout = setTimeout(() => {
        setTypingUsers((prev) => {
          const n = new Set(prev);
          n.delete(payload.userId);
          return n;
        });
        typingTimeoutRef.current.delete(payload.userId);
      }, TYPING_TIMEOUT);

      typingTimeoutRef.current.set(payload.userId, timeout);
    },
    [chatId, userId]
  );

  const handleTypingStop = useCallback((payload: TypingPayload) => {
    setTypingUsers((prev) => {
      const n = new Set(prev);
      n.delete(payload.userId);
      return n;
    });

    const timeout = typingTimeoutRef.current.get(payload.userId);
    if (timeout) {
      clearTimeout(timeout);
      typingTimeoutRef.current.delete(payload.userId);
    }
  }, []);

  const handleChatCreated = useCallback(
    (chat: Chat) => {
      queryClient.setQueriesData({ queryKey: chatListQueryKey }, (old: any) => {
        if (!old?.pages) return old;

        // Check in chats array (not messages!)
        const exists = old.pages.some((p: any) => p.chats?.some((c: Chat) => c.id === chat.id));
        if (exists) return old;

        const pages = [...old.pages];
        pages[0] = {
          ...pages[0],
          chats: [chat, ...(pages[0].chats ?? [])],
        };
        return { ...old, pages };
      });
    },
    [queryClient, chatListQueryKey]
  );

  const handleReactionRemoved = useCallback(
    (payload: ReactionRemovedPayload) => {
      const { messageId, reactionId, chatId } = payload;

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

      // queryClient.setQueriesData({ queryKey: QUERY_KEYS.chat.chat(chatId ?? '') }, (old: any) => {
      //   if (!old?.pages) return old;
      //   return {
      //     ...old,
      //     pages: old.pages.map((p: any) => ({
      //       ...p,
      //       messages: p.messages?.map((m: Message) =>
      //         m.id === messageId
      //           ? {
      //               ...m,
      //               reactions: (m.reactions ?? []).filter((r: any) => r.id !== reactionId),
      //             }
      //           : m
      //       ),
      //     })),
      //   };
      // });
    },
    [queryClient]
  );

  //  Actions

  const sendMessage = useCallback(
    async (content: string): Promise<Message | null> => {
      if (!userId || !chatId) {
        console.error('Cannot send message: missing userId or chatId');
        return null;
      }
      try {
        return await sendMessageMutation.mutateAsync({
          chatId,
          userId,
          content,
        });
      } catch (error) {
        console.error('Failed to send message:', error);
        return null;
      }
    },
    [userId, chatId, sendMessageMutation]
  );

  const addMessageReaction = useCallback(
    async (messageId: string, emoji: string): Promise<Message | null> => {
      if (!userId || !chatId) return null;
      try {
        return await addMessageReactionMutation.mutateAsync({
          chatId,
          emoji,
          messageId,
          userId,
        });
      } catch (error) {
        console.error('Failed to add reaction:', error);
        return null;
      }
    },
    [userId, chatId, addMessageReactionMutation]
  );

  const removeMessageReaction = useCallback(
    async (messageId: string, reactionId: string): Promise<boolean> => {
      if (!userId || !chatId) return false;
      try {
        await removeMessageReactionMutation.mutateAsync({
          chatId,
          reactionId,
          messageId,
        });
        return true;
      } catch (error) {
        console.error('Failed to remove reaction:', error);
        return false;
      }
    },
    [userId, chatId, removeMessageReactionMutation]
  );

  const createOrGetChat = useCallback(
    async (params: { studentId: string; instructorId: string; role: string }) => {
      try {
        const res = await createOrGetChatMutation.mutateAsync(params);
        return res?.success ? res.data : null;
      } catch (error) {
        console.error('Error creating chat:', error);
        return null;
      }
    },
    [createOrGetChatMutation]
  );

  const pinChat = useCallback(
    async (pinChatId: string) => {
      const chat = chats.find((c) => c.id === pinChatId);
      if (!chat) return false;
      try {
        if (chat.isPinned) {
          await unpinChatMutation.mutateAsync(pinChatId);
        } else {
          await pinChatMutation.mutateAsync(pinChatId);
        }
        return true;
      } catch (error) {
        console.error('Error toggling pin:', error);
        return false;
      }
    },
    [chats, pinChatMutation, unpinChatMutation]
  );

  const muteChat = useCallback(
    async (muteChatId: string, durationMs?: number) => {
      const chat = chats.find((c) => c.id === muteChatId);
      if (!chat) return false;
      try {
        const isMutedNow = (chat.mutedUntil ?? 0) > Date.now();
        if (isMutedNow) {
          await unmuteChatMutation.mutateAsync(muteChatId);
        } else {
          await muteChatMutation.mutateAsync({ chatId: muteChatId, durationMs });
        }
        return true;
      } catch (error) {
        console.error('Error toggling mute:', error);
        return false;
      }
    },
    [chats, muteChatMutation, unmuteChatMutation]
  );

  const deleteChat = useCallback(
    async (deleteChatId: string) => {
      try {
        await deleteChatMutation.mutateAsync(deleteChatId);
        return true;
      } catch (error) {
        console.error('Error deleting chat:', error);
        return false;
      }
    },
    [deleteChatMutation]
  );

  const editMessage = useCallback(
    async (messageId: string, content: string): Promise<Message | null> => {
      if (!userId || !chatId) return null;
      try {
        const res = await chatService.editMessage(chatId, messageId, content);
        if (!res.success || !res.data) {
          toast.error(res.message || 'Failed to edit message');
          return null;
        }
        return res.data;
      } catch (error) {
        console.error('Failed to edit message:', error);
        toast.error('Failed to edit message');
        return null;
      }
    },
    [userId, chatId]
  );

  const deleteMessage = useCallback(
    async (messageId: string, forEveryone = false): Promise<boolean> => {
      if (!userId || !chatId) return false;
      try {
        await chatService.deleteMessage(chatId, messageId, forEveryone);
        // toast.error(res.message || 'Failed to delete message');
        // if (!res.success) {
        //   return false;
        // }
        return true;
      } catch (error) {
        console.error('Failed to delete message:', error);
        toast.error('Failed to delete message');
        return false;
      }
    },
    [userId, chatId]
  );

  const archiveChat = useCallback(
    async (archiveChatId: string) => {
      const chat = chats.find((c) => c.id === archiveChatId);
      if (!chat) return false;
      try {
        if (chat.isArchived) {
          await unarchiveChatMutation.mutateAsync(archiveChatId);
        } else {
          await archiveChatMutation.mutateAsync(archiveChatId);
        }
        return true;
      } catch (error) {
        console.error('Error toggling archive:', error);
        return false;
      }
    },
    [chats, archiveChatMutation, unarchiveChatMutation]
  );

  const markAsRead = useCallback(async () => {
    if (!chatId) return;
    try {
      await chatService.markAsRead(chatId);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [chatId]);

  // Debounced typing
  const stopTypingDebounced = useMemo(
    () =>
      debounce(() => {
        if (!chatId) return;
        if (socketServiceRef.current?.isConnected) {
          socketServiceRef.current.stopTyping(chatId);
        }
      }, 1200),
    [chatId]
  );

  const startTypingDebounced = useMemo(
    () =>
      debounce(() => {
        if (!chatId) return;
        if (socketServiceRef.current?.isConnected) {
          socketServiceRef.current.startTyping(chatId);
        }
      }, 200),
    [chatId]
  );

  const startTyping = useCallback(() => {
    startTypingDebounced();
  }, [startTypingDebounced]);

  const stopTyping = stopTypingDebounced;

  //  Return

  return {
    // Server state
    chats,
    messages,
    isLoading: chatsQuery.isLoading || (chatId ? messagesQuery.isLoading : false),

    // WebSocket states
    isConnected,
    isConnecting,
    typingUsers,
    onlineUsers,

    // Actions
    createOrGetChat,
    isCreating: createOrGetChatMutation.isPending,
    pinChat,
    muteChat,
    archiveChat,
    deleteChat,
    isDeleting: deleteChatMutation.isPending,
    sendMessage,
    editMessage,
    deleteMessage,
    addMessageReaction,
    removeMessageReaction,
    markAsRead,

    // Typing
    startTyping,
    stopTyping,

    // Pagination & refresh
    loadMoreMessages: messagesQuery.fetchNextPage,
    hasMoreMessages: messagesQuery.hasNextPage ?? false,
    refreshChats: chatsQuery.refetch,
    refreshMessages: messagesQuery.refetch,
  };
}
