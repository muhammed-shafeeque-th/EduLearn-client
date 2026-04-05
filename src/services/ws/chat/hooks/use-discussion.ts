/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { getDiscussionService } from '@/services/discussion';
import { getSocketService } from '@/services/ws/chat/socket.service';
import type { DiscussionRoom, DiscussionMessage, UiDiscussionMessage } from '@/types/discussion';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';

interface UseDiscussionOptions {
  courseId: string;
  instructorId?: string;
  userId: string;
  enabled?: boolean;
}

export function useDiscussion({
  courseId,
  instructorId,
  userId,
  enabled = true,
}: UseDiscussionOptions) {
  const service = getDiscussionService();
  const socketRef = useRef(getSocketService());

  const [messages, setMessages] = useState<UiDiscussionMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const {
    data: room,
    isLoading: isLoadingRoom,
    error: roomError,
  } = useQuery({
    queryKey: QUERY_KEYS.discussion.byCourse(courseId),
    queryFn: async () => {
      const res = await service.createOrGetRoom(courseId, instructorId);
      if (!res.success) throw new Error(res.message);
      return res.data as DiscussionRoom;
    },
    enabled: enabled && !!courseId,
    staleTime: 5 * 60 * 1000,
  });

  //  Fetch messages

  const [page, setPage] = useState(1);
  const pageSize = 30;

  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: QUERY_KEYS.discussion.messages(room?.id ?? ''),
    queryFn: async () => {
      if (!room?.id) return { messages: [], total: 0 };
      const res = await service.getMessages(room.id, page, pageSize);
      if (!res.success) throw new Error(res.message);
      return res.data as { messages: DiscussionMessage[]; total: number };
    },
    enabled: !!room?.id,
    staleTime: 30_000,
  });

  // Sync fetched messages into local state
  useEffect(() => {
    if (messagesData?.messages) {
      setMessages((prev) => {
        const newIds = new Set(messagesData.messages.map((m) => m.id));
        // Keep optimistic messages that haven't been confirmed yet
        const optimisticOnly = prev.filter(
          (m) => m.optimisticState === 'pending' && !newIds.has(m.id)
        );
        // API returns descending (newest first). Reverse it to ascending (oldest first).
        const reversedApi = [...messagesData.messages].reverse();
        return [...reversedApi, ...optimisticOnly];
      });
    }
  }, [messagesData]);

  //  WebSocket lifecycle ─

  useEffect(() => {
    if (!room?.id || !enabled) return;

    const socket = socketRef.current;
    let unsubscribe: (() => void) | undefined;

    const setup = async () => {
      try {
        if (!socket.isConnected) {
          await socket.connect();
        }
        socket.joinDiscussion(room.id);
        setIsConnected(true);

        // listen for new messages
        unsubscribe = socket.on('discussion:message:new', (payload: any) => {
          const newMsg: DiscussionMessage = payload.message ?? payload;
          // skip own messages (already added optimistically)
          if (newMsg.senderId === userId) {
            // promote optimistic -> confirmed
            setMessages((prev) =>
              prev.map((m) =>
                m.idempotencyKey && m.senderId === userId && m.optimisticState === 'pending'
                  ? { ...newMsg, optimisticState: 'sent' as const }
                  : m
              )
            );
            return;
          }
          setMessages((prev) => [...prev, newMsg]);
        });
      } catch (err) {
        console.error('Discussion WS connect error:', err);
        setIsConnected(false);
      }
    };

    setup();

    return () => {
      unsubscribe?.();
      socket.leaveDiscussion(room.id);
    };
  }, [room?.id, enabled, userId]);

  //  Send message ──

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!room?.id) throw new Error('No discussion room');
      const res = await service.sendMessage(room.id, content);
      if (!res.success) throw new Error(res.message);
      return res.data as DiscussionMessage;
    },
    onSuccess: (confirmed) => {
      // promote optimistic message
      setMessages((prev) =>
        prev.map((m) =>
          m.optimisticState === 'pending' && m.senderId === userId
            ? { ...confirmed, optimisticState: 'sent' as const }
            : m
        )
      );
    },
    onError: () => {
      // mark optimistic as failed
      setMessages((prev) =>
        prev.map((m) =>
          m.optimisticState === 'pending' && m.senderId === userId
            ? { ...m, optimisticState: 'failed' as const }
            : m
        )
      );
    },
  });

  const sendMessage = useCallback(
    (content: string) => {
      if (!room?.id || !content.trim()) return;

      const optimistic: UiDiscussionMessage = {
        id: `temp-${uuidv4()}`,
        roomId: room.id,
        senderId: userId,
        senderRole: userId === instructorId ? 'instructor' : 'student',
        content: content.trim(),
        sequence: messages.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        optimisticState: 'pending',
        idempotencyKey: uuidv4(),
      };

      setMessages((prev) => [...prev, optimistic]);
      sendMessageMutation.mutate(content.trim());
    },
    [room?.id, userId, instructorId, messages.length, sendMessageMutation]
  );

  //  Load more ─

  const hasMore = messagesData ? messages.length < messagesData.total : false;

  const loadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  return {
    room,
    messages,
    isLoadingRoom,
    isLoadingMessages,
    isConnected,
    isSending: sendMessageMutation.isPending,
    roomError,
    hasMore,
    sendMessage,
    loadMore,
    refetchMessages,
  };
}
