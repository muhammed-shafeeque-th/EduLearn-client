/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch } from '@/states/client';
import {
  addMessage,
  setTypingIndicator,
  removeTypingIndicator,
  setOnlineUsers,
  addReaction,
  removeReaction,
  updateMessage,
} from '@/store/slices/messaging-slice';
import { toast } from 'sonner';

export const useSocket = (userId: string) => {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!userId) return;

    // Initialize socket connection
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        userId,
        role: 'instructor',
      },
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Message events
    socket.on('new_message', (message) => {
      dispatch(addMessage(message));

      // Show notification if not in active chat
      if (message.senderId !== userId) {
        toast.success(`New message from ${message.senderName}`, {
          description: message.content,
          action: {
            label: 'View',
            onClick: () => {
              // Handle navigation to chat
            },
          },
        });
      }
    });

    socket.on('message_updated', (message) => {
      dispatch(updateMessage(message));
    });

    // Typing events
    socket.on('user_typing', (data) => {
      if (data.userId !== userId) {
        dispatch(setTypingIndicator(data));
      }
    });

    socket.on('user_stopped_typing', (data) => {
      dispatch(removeTypingIndicator(data));
    });

    // Reaction events
    socket.on('reaction_added', (data) => {
      dispatch(addReaction(data));
    });

    socket.on('reaction_removed', (data) => {
      dispatch(removeReaction(data));
    });

    // Online users
    socket.on('users_online', (users) => {
      dispatch(setOnlineUsers(users));
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error('Connection error occurred');
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, dispatch]);

  // Socket methods
  const sendMessage = (messageData: any) => {
    socketRef.current?.emit('send_message', messageData);
  };

  const startTyping = (chatId: string) => {
    socketRef.current?.emit('start_typing', { chatId, userId });
  };

  const stopTyping = (chatId: string) => {
    socketRef.current?.emit('stop_typing', { chatId, userId });
  };

  const addReactionToMessage = (messageId: string, chatId: string, emoji: string) => {
    socketRef.current?.emit('add_reaction', { messageId, chatId, emoji, userId });
  };

  const removeReactionFromMessage = (reactionId: string) => {
    socketRef.current?.emit('remove_reaction', { reactionId, userId });
  };

  const joinChat = (chatId: string) => {
    socketRef.current?.emit('join_chat', chatId);
  };

  const leaveChat = (chatId: string) => {
    socketRef.current?.emit('leave_chat', chatId);
  };

  return {
    socket: socketRef.current,
    sendMessage,
    startTyping,
    stopTyping,
    addReactionToMessage,
    removeReactionFromMessage,
    joinChat,
    leaveChat,
  };
};
