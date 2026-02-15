/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { Chat, Message } from '@/types/chat';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';

import { getSocketService, SocketService } from '../socket.service';
import type {
  NewMessagePayload,
  MessageEditedPayload,
  MessageDeletedPayload,
  MessageReactionPayload,
  TypingPayload,
  // UserPresencePayload,
  ChatCreatedPayload,
} from '../socket.service';
import {
  useInstructorChatList,
  useInstructorMessageList,
} from '@/states/server/messaging/use-instructor-messaging';
import {
  useSendMessage,
  useChatMutations,
} from '@/states/server/messaging/use-instructor-chat-mutations';
import { useOnlineUsers } from './use-online-users';

const TYPING_TIMEOUT = 5000;
const RECONNECT_DELAY = 2000;
const MAX_RECONNECT_ATTEMPTS = 5;

export interface UseMessagingOptions {
  userId?: string;
  chatId?: string;
  autoConnect?: boolean;
  onError?: (error: Error) => void;
}

export function useInstructorMessaging({
  userId,
  chatId,
  autoConnect = true,
  onError,
}: UseMessagingOptions = {}) {
  const queryClient = useQueryClient();
  const sendMessageMutation = useSendMessage();
  const socketServiceRef = useRef<SocketService | null>(null);
  const currentChatIdRef = useRef<string | undefined>(chatId);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket states
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const onlineUsers = useOnlineUsers();
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // React Query hooks
  const chatsQuery = useInstructorChatList({ pageSize: 50 });
  const messagesQuery = useInstructorMessageList(chatId ?? '', { pageSize: 50 });

  const chats = chatsQuery.chats;
  const messages = messagesQuery.messages;

  // Mutations
  const {
    createOrGetChatMutation,
    pinChatMutation,
    unpinChatMutation,
    muteChatMutation,
    unmuteChatMutation,
    deleteChatMutation,
  } = useChatMutations();

  /**
   * Reconnection logic
   */
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
      onError?.(new Error('Failed to reconnect after multiple attempts'));
      return;
    }

    reconnectAttemptsRef.current += 1;
    console.log(` Reconnection attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`);

    reconnectTimeoutRef.current = setTimeout(() => {
      if (socketServiceRef.current && !socketServiceRef.current.isConnected) {
        socketServiceRef.current.connect().catch((err) => {
          console.error('Reconnection failed:', err);
          attemptReconnect();
        });
      }
    }, RECONNECT_DELAY * reconnectAttemptsRef.current);
  }, [onError]);

  /**
   * Join/leave chat room
   */
  useEffect(() => {
    if (!socketServiceRef.current?.isConnected) return;

    if (chatId) {
      // Leave previous chat
      if (currentChatIdRef.current && currentChatIdRef.current !== chatId) {
        console.log(' Leaving chat:', currentChatIdRef.current);
        socketServiceRef.current.leaveChat(currentChatIdRef.current);
      }

      // Join new chat
      console.log(' Joining chat:', chatId);
      currentChatIdRef.current = chatId;
      socketServiceRef.current.joinChat(chatId);
    } else {
      // Leave chat if no chatId
      if (currentChatIdRef.current) {
        console.log(' Leaving chat:', currentChatIdRef.current);
        socketServiceRef.current.leaveChat(currentChatIdRef.current);
        currentChatIdRef.current = undefined;
      }
    }
  }, [chatId, isConnected]);

  /**
   * Setup Socket connection
   */
  useEffect(() => {
    if (!userId || !autoConnect) return;

    const socket = getSocketService();
    socketServiceRef.current = socket;
    setIsConnecting(true);

    const unsubs: Array<() => void> = [];

    // Connection handlers
    unsubs.push(
      socket.on('connect', () => {
        console.log(' WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;

        // Clear reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }

        // Rejoin current chat room
        if (currentChatIdRef.current) {
          socket.joinChat(currentChatIdRef.current);
        }

        // Refresh data after reconnection
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chat.instructorChats() });
        if (currentChatIdRef.current) {
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.chat.chat(currentChatIdRef.current),
          });
        }
      })
    );

    unsubs.push(
      socket.on('disconnect', () => {
        console.log(' WebSocket disconnected');
        setIsConnected(false);
        attemptReconnect();
      })
    );

    unsubs.push(
      socket.on('error', (err) => {
        console.error('WebSocket error:', err);
        setIsConnecting(false);
        onError?.(err);
      })
    );

    // Message handlers
    unsubs.push(
      socket.on('message:new', (payload: NewMessagePayload) => {
        console.log(' New message received:', payload.message.id);
        handleNewMessage(payload.message);
      })
    );

    unsubs.push(
      socket.on('message:edited', (payload: MessageEditedPayload) => {
        console.log(' Message edited:', payload.messageId);
        handleMessageEdited(payload);
      })
    );

    unsubs.push(
      socket.on('message:deleted', (payload: MessageDeletedPayload) => {
        console.log(' Message deleted:', payload.messageId);
        handleMessageDeleted(payload);
      })
    );

    unsubs.push(
      socket.on('message:reaction', (payload: MessageReactionPayload) => {
        console.log(' Message reaction:', payload.messageId);
        handleReaction(payload);
      })
    );

    // Typing handlers
    unsubs.push(
      socket.on('typing:start', (payload: TypingPayload) => {
        handleTypingStart(payload);
      })
    );

    unsubs.push(
      socket.on('typing:stop', (payload: TypingPayload) => {
        handleTypingStop(payload);
      })
    );


    unsubs.push(
      socket.on('chat:created', (payload: ChatCreatedPayload) => {
        console.log(' Chat created:', payload.chat.id);
        handleChatCreated(payload.chat);
      })
    );

    // Connect socket
    socket.connect().catch((err) => {
      console.error('Failed to connect WebSocket:', err);
      setIsConnecting(false);
      onError?.(err);
      attemptReconnect();
    });

    return () => {
      console.log(' Cleaning up WebSocket');
      unsubs.forEach((fn) => fn());
      typingTimeoutRef.current.forEach((t) => clearTimeout(t));

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [userId, autoConnect, onError, queryClient, attemptReconnect]);

  // ------------------------------
  // MESSAGE HANDLERS
  // ------------------------------

  const handleNewMessage = useCallback(
    (incoming: Message) => {
      // Prevent processing messages for other chats
      if (currentChatIdRef.current && incoming.chatId !== currentChatIdRef.current) {
        console.log(' Message for different chat, updating list only');
        // Only update chat list preview
        queryClient.setQueriesData({ queryKey: QUERY_KEYS.chat.instructorChats() }, (old: any) => {
          if (!old?.pages) return old;

          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              messages: page.chats?.map((c: Chat) => {
                if (c.id !== incoming.chatId) return c;

                return {
                  ...c,
                  lastMessageId: incoming.id,
                  lastMessagePreview: incoming.content.slice(0, 50),
                  updatedAt: incoming.createdAt,
                  unreadCount:
                    incoming.senderId !== userId ? (c.unreadCount ?? 0) + 1 : (c.unreadCount ?? 0),
                };
              }),
            })),
          };
        });
        return;
      }

      if (currentChatIdRef.current && incoming.chatId !== currentChatIdRef.current) {
        // Update messages cache for current chat
        queryClient.setQueriesData(
          { queryKey: QUERY_KEYS.chat.chat(incoming.chatId) },
          (old: any) => {
            if (!old?.pages) return old;

            // Check if message already exists
            const exists = old.pages.some((p: any) =>
              p.messages.some((m: Message) => m.id === incoming.id)
            );

            if (exists) {
              console.log(' Message already exists, replacing');
              return {
                ...old,
                pages: old.pages.map((page: any) => ({
                  ...page,
                  messages: page.messages.map((m: Message) => (m.id === incoming.id ? incoming : m)),
                })),
              };
            }

            // Add new message to last page
            console.log(' Adding new message to cache');
            const pages = [...old.pages];
            const lastPage = pages[pages.length - 1];
            pages[pages.length - 1] = {
              ...lastPage,
              messages: [...(lastPage.messages ?? []), incoming],
            };

            return { ...old, pages };
          }
        );
      }

      // Update chats list
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.chat.instructorMessages(incoming.chatId) },
        (old: any) => {
          if (!old?.pages) return old;

          return {
            ...old,
            pages: old.pages.map((page: any) => {
              // Check if message already exists in this page
              const exists = page.messages.some((m: Message) => m.id === incoming.id);
              let newMessages;

              if (exists) {
                // Replace existing message
                newMessages = page.messages.map((m: Message) =>
                  m.id === incoming.id
                    ? {
                      ...m,
                      ...incoming,
                      lastMessageId: incoming.id,
                      lastMessagePreview: incoming.content.slice(0, 50),
                      updatedAt: incoming.createdAt,
                      unreadCount:
                        incoming.senderId !== userId &&
                          incoming.chatId !== currentChatIdRef.current
                          ? (m.unreadCount ?? 0) + 1
                          : (m.unreadCount ?? 0),
                    }
                    : m
                );
              } else {
                // Add incoming message at the end of the array
                // Optionally update all chats in listing as well
                newMessages = [
                  ...page.messages,
                  {
                    ...incoming,
                    lastMessageId: incoming.id,
                    lastMessagePreview: incoming.content.slice(0, 50),
                    updatedAt: incoming.createdAt,
                    unreadCount:
                      incoming.senderId !== userId && incoming.chatId !== currentChatIdRef.current
                        ? (incoming.unreadCount ?? 0) + 1
                        : (incoming.unreadCount ?? 0),
                  },
                ];
              }

              return {
                ...page,
                messages: newMessages,
              };
            }),
          };
        }
      );

      // Show notification for messages from others in background
      if (incoming.senderId !== userId && incoming.chatId !== currentChatIdRef.current) {
        toast.info('New message received', {
          description: incoming.content.slice(0, 50),
        });
      }
    },
    [queryClient, userId]
  );

  const sendMessage = useCallback(
    async (content: string): Promise<Message | null> => {
      if (!userId || !chatId) {
        console.error('Cannot send message: missing userId or chatId');
        return null;
      }

      console.log(' Sending message to chat:', chatId);

      try {
        const sentMessage = await sendMessageMutation.mutateAsync({
          chatId,
          userId,
          content,
        });

        console.log(' Message sent successfully:', sentMessage.id);
        return sentMessage;
      } catch (error) {
        console.error('Failed to send message:', error);
        return null;
      }
    },
    [userId, chatId, sendMessageMutation]
  );

  const handleMessageEdited = useCallback(
    (payload: MessageEditedPayload) => {
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.chat.chat(payload.chatId) }, (old: any) => {
        if (!old?.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            messages: page.messages.map((m: Message) =>
              m.id === payload.messageId
                ? { ...m, content: payload.content, updatedAt: Date.now() }
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
            messages: page.messages.filter((m: Message) => m.id !== payload.messageId),
          })),
        };
      });
    },
    [queryClient]
  );

  const handleReaction = useCallback(
    (payload: MessageReactionPayload) => {
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.chat.chat(payload.chatId) }, (old: any) => {
        if (!old?.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            messages: page.messages.map((m: Message) =>
              m.id === payload.messageId
                ? {
                  ...m,
                  reactions: [
                    ...(m.reactions ?? []),
                    {
                      id: crypto.randomUUID(),
                      userId: payload.reaction.userId,
                      emoji: payload.reaction.emoji,
                      timestamp: Date.now(),
                    },
                  ],
                }
                : m
            ),
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

      setTypingUsers((prev) => new Set([...prev, payload.userId]));

      const timeout = setTimeout(() => {
        setTypingUsers((prev) => {
          const n = new Set(prev);
          n.delete(payload.userId);
          return n;
        });
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
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.chat.instructorChats() }, (old: any) => {
        if (!old?.pages) return old;

        const exists = old.pages.some((p: any) => p.messages.some((c: Chat) => c.id === chat.id));

        if (exists) return old;

        const pages = [...old.pages];
        pages[0] = { ...pages[0], messages: [chat, ...pages[0].messages] };
        return { ...old, pages };
      });
    },
    [queryClient]
  );

  // ------------------------------
  // ACTIONS
  // ------------------------------

  const createOrGetChat = useCallback(
    async (enrollmentId: string) => {
      try {
        const res = await createOrGetChatMutation.mutateAsync(enrollmentId);
        return res?.success ? res.data : null;
      } catch (error) {
        console.error('Error creating chat:', error);
        return null;
      }
    },
    [createOrGetChatMutation]
  );

  const pinChat = useCallback(
    async (chatId: string) => {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat) return false;

      try {
        if (chat.isPinned) {
          await unpinChatMutation.mutateAsync(chatId);
        } else {
          await pinChatMutation.mutateAsync(chatId);
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
    async (chatId: string, durationMs?: number) => {
      const chat = chats.find((c) => c.id === chatId);
      if (!chat) return false;

      try {
        const isMutedNow = (chat.mutedUntil ?? 0) > Date.now();
        if (isMutedNow) {
          await unmuteChatMutation.mutateAsync(chatId);
        } else {
          await muteChatMutation.mutateAsync({ chatId, durationMs });
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
    async (chatId: string) => {
      try {
        await deleteChatMutation.mutateAsync(chatId);
        return true;
      } catch (error) {
        console.error('Error deleting chat:', error);
        return false;
      }
    },
    [deleteChatMutation]
  );

  const startTyping = useCallback(() => {
    if (!chatId || !socketServiceRef.current?.isConnected) return;
    socketServiceRef.current.startTyping(chatId);
  }, [chatId]);

  const stopTyping = useCallback(() => {
    if (!chatId || !socketServiceRef.current?.isConnected) return;
    socketServiceRef.current.stopTyping(chatId);
  }, [chatId]);

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
    deleteChat,
    isDeleting: deleteChatMutation.isPending,
    sendMessage,

    // Typing
    startTyping,
    stopTyping,

    // Pagination
    loadMoreMessages: messagesQuery.fetchNextPage,
    hasMoreMessages: messagesQuery.hasNextPage ?? false,
    refreshChats: chatsQuery.refetch,
    refreshMessages: messagesQuery.refetch,
  };
}
