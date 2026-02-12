'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Chat } from '@/types/chat';
import type { UserInfo } from '@/types/user';
import { MyChatsPageSkeleton } from './skeletons/my-chats-page-skeleton';
import { ChatList } from './chat-list';
import { ChatInterface } from './chat-interface';
import { EmptyMessagesState } from './empty-messages-state';
// import { ConnectionStatus } from './connection-status';
// import { NewMessageDialog } from './_new-message-dialog';
import { useAuthSelector } from '@/states/client';
import { useStudentMessaging } from '@/services/ws/chat/hooks/use-student-messaging';
import { toast } from 'sonner';
import { AlertCircle, WifiOff, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MyChatsPageContentProps {
  chatId?: string;
  enrollmentId?: string;
}

export function MyChatsPageContent({ enrollmentId, chatId }: MyChatsPageContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user: authUser, isLoading: userLoading } = useAuthSelector();

  // State Management
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showChat, setShowChat] = useState(false);
  // const [showNewMessage, setShowNewMessage] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isCreatingChat, setIsCreatingChat] = useState(false); // for create indicator

  // Refs for stable tracking (for avoiding stale closures and memory leaks)
  const enrollmentHandledRef = useRef<string | null>(null);
  const chatIdRef = useRef<string | undefined>(chatId);
  const isUnmountingRef = useRef(false);
  const lastSelectedChatIdRef = useRef<string | null>(null);

  // Memoizing current user info for efficient re-renders
  const currentUser: UserInfo | null = useMemo(() => {
    if (!authUser) return null;
    return {
      id: authUser.userId,
      name: authUser.username ?? '',
      firstName: authUser.username?.split(' ')[0] ?? '',
      lastName: authUser.username?.split(' ').slice(1).join(' ') ?? '',
      email: authUser.email ?? '',
      avatar: authUser.avatar,
      role: ['instructor', 'student'].includes(authUser.role)
        ? (authUser.role as 'student')
        : 'student',
      isOnline: undefined,
      lastSeen: undefined,
    };
  }, [authUser]);

  // Extract messaging actions/hooks
  const {
    isCreating, // web socket-level "isCreating" - can show spinner too
    chats,
    messages,
    isConnected,
    typingUsers,
    onlineUsers,
    sendMessage,
    createOrGetChat,
    addMessageReaction,
    removeMessageReaction,
    pinChat,
    muteChat,
    deleteChat,
    startTyping,
    stopTyping,
    isLoading: messagingLoading,
    refreshChats,
    refreshMessages,
    hasMoreMessages,
    loadMoreMessages,
  } = useStudentMessaging({
    userId: authUser?.userId,
    chatId: selectedChat?.id,
    autoConnect: true,
    onError: (err: Error) => {
      console.error('Messaging error:', err);
      setConnectionError(true);
      toast.error('Connection issue. Retrying...', {
        description: err.message,
      });
    },
  });

  // Monitor connection status
  useEffect(() => {
    if (isConnected) {
      setConnectionError(false);
      setRetryCount(0);
      // console.log('Connected to chat server');
    } else {
      // console.log('Disconnected from chat server');
    }
  }, [isConnected]);

  // Update chatId ref when prop changes
  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  // Initialize and handle enrollment/chatId (main entry logic)
  useEffect(() => {
    let isMounted = true;

    const initializeChat = async () => {
      // Wait for user and chats to load (precondition)
      if (userLoading || !currentUser) {
        return;
      }

      try {
        // Creating (or getting) chat by enrollmentId
        if (enrollmentId && enrollmentHandledRef.current !== enrollmentId) {
          enrollmentHandledRef.current = enrollmentId;
          setIsCreatingChat(true);
          const chat = await createOrGetChat(enrollmentId);
          setIsCreatingChat(false);

          if (chat && isMounted) {
            setSelectedChat(chat);
            setShowChat(true);
            lastSelectedChatIdRef.current = chat.id;

            // Update URL to reflect chat
            const newPath = `/profile/my-chats/${chat.id}`;
            if (pathname !== newPath) {
              router.replace(newPath);
            }

            // Remove enrollmentId from URL query
            const params = new URLSearchParams(searchParams?.toString());
            params.delete('enrollmentId');
            const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
            if (searchParams?.has('enrollmentId')) {
              router.replace(newUrl);
            }
          }
        }
        // Selecting by chat id (if exists)
        else if (chatId && chatId !== lastSelectedChatIdRef.current) {
          // Wait for chats to load
          if (chats.length === 0 && messagingLoading) {
            return;
          }

          const chat = chats.find((c) => c.id === chatId);

          if (chat && isMounted) {
            setSelectedChat(chat);
            setShowChat(true);
            lastSelectedChatIdRef.current = chat.id;
          } else if (!messagingLoading && isMounted) {
            // Chat not found after loading
            toast.error('Chat not found');
            if (pathname !== '/profile/my-chats') {
              router.replace('/profile/my-chats');
            }
            setSelectedChat(null);
            setShowChat(false);
            lastSelectedChatIdRef.current = null;
          }
        }
        // No chatId - clear selection
        else if (!chatId && selectedChat && !enrollmentId) {
          setSelectedChat(null);
          setShowChat(false);
          lastSelectedChatIdRef.current = null;
        }
      } catch (error) {
        setIsCreatingChat(false);
        if (isMounted) {
          toast.error('Failed to load chat');
          setSelectedChat(null);
          setShowChat(false);
        }
        console.error('Error initializing chat:', error);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeChat();

    return () => {
      isMounted = false;
    };
    // Only dependencies that are needed should be here for clarity and to avoid unnecessary re-renders
  }, [
    enrollmentId,
    chatId,
    chats,
    currentUser,
    userLoading,
    messagingLoading,
    createOrGetChat,
    pathname,
    router,
    searchParams,
    selectedChat,
  ]);

  // Set a ref on unmount for safety against updates to unmounted component
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true;
    };
  }, []);

  // Chat selection from list
  const handleSelectChat = useCallback(
    (chat: Chat) => {
      if (isUnmountingRef.current) return;
      setSelectedChat(chat);
      setShowChat(true);
      lastSelectedChatIdRef.current = chat.id;
      const newPath = `/profile/my-chats/${chat.id}`;
      if (pathname !== newPath) {
        router.push(newPath);
      }
    },
    [router, pathname]
  );

  // Go back to chat list
  const handleBack = useCallback(() => {
    if (isUnmountingRef.current) return;
    setSelectedChat(null);
    setShowChat(false);
    lastSelectedChatIdRef.current = null;
    const basePath = '/profile/my-chats';
    if (pathname !== basePath) {
      router.replace(basePath);
    }
  }, [router, pathname]);

  // Send message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedChat || !currentUser) {
        toast.error('Cannot send: no chat or user');
        return;
      }
      try {
        const sent = await sendMessage(content);
        if (!sent) {
          toast.error('Failed to send message');
        }
      } catch (error) {
        toast.error('Failed to send message');
        console.error('Error sending message:', error);
      }
    },
    [selectedChat, currentUser, sendMessage]
  );

  const handleRemoveEmoji = useCallback(
    async (messageId: string, emoji: string) => {
      if (!selectedChat || !currentUser) {
        toast.error('Cannot remove emoji: no chat or user');
        return;
      }
      try {
        const res = await removeMessageReaction(messageId, emoji);
        if (!res) {
          toast.error('Failed to remove emoji');
        }
      } catch (error) {
        toast.error('Failed to remove emoji');
        console.error('Error removing emoji:', error);
      }
    },
    [selectedChat, currentUser, removeMessageReaction]
  );

  const handleAddEmoji = useCallback(
    async (messageId: string, reactionId: string) => {
      if (!selectedChat || !currentUser) {
        toast.error('Cannot add emoji: no chat or user');
        return;
      }
      try {
        const res = await addMessageReaction(messageId, reactionId);
        if (!res) {
          toast.error('Failed to add emoji');
        }
      } catch (error) {
        toast.error('Failed to add emoji');
        console.error('Error adding emoji:', error);
      }
    },
    [selectedChat, currentUser, addMessageReaction]
  );

  // Retry connection
  const handleRetryConnection = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    setConnectionError(false);
    refreshChats();
    if (selectedChat) {
      refreshMessages();
    }
  }, [refreshChats, refreshMessages, selectedChat]);

  // Archive chat (placeholder - implement as needed)
  const handleArchiveChat = useCallback(async (chatId: string) => {
    toast.info('Archive feature coming soon');
  }, []);

  // --- Render ---

  // Auth state skeleton (loading)
  if (userLoading || isInitializing) {
    return <MyChatsPageSkeleton />;
  }

  // Chat creation indicator (pending/creating)
  if (isCreatingChat || isCreating) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/30 dark:from-background dark:via-blue-950/10 dark:to-purple-950/10">
        <div className="text-center space-y-4 max-w-md px-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center animate-pulse">
            <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold">Starting Chat...</h2>
          <p className="text-muted-foreground">Please wait while your chat is being prepared.</p>
        </div>
      </div>
    );
  }

  // Authentication required
  if (!authUser || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-blue-50/30 to-purple-50/30 dark:from-background dark:via-blue-950/10 dark:to-purple-950/10">
        <div className="text-center space-y-4 max-w-md px-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access your messages.</p>
          <Button onClick={() => router.push('/login')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Connection error fallback
  if (connectionError && retryCount > 2) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-background via-orange-50/30 to-red-50/30 dark:from-background dark:via-orange-950/10 dark:to-red-950/10">
        <div className="text-center space-y-4 max-w-md px-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center">
            <WifiOff className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold">Connection Problem</h2>
          <p className="text-muted-foreground">
            Unable to connect to chat server. Please check your internet connection and try again.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleRetryConnection} variant="default">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Connection
            </Button>
            <Button onClick={() => router.refresh()} variant="outline">
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          {/* ChatList - Always rendered but hidden on mobile when chat is open */}
          <div
            className={cn(
              'lg:block transition-all duration-300',
              showChat ? 'hidden' : 'block w-full lg:w-auto'
            )}
          >
            <ChatList
              chats={chats}
              selectedChat={selectedChat}
              onSelectChat={handleSelectChat}
              onlineUsers={onlineUsers}
              currentUser={currentUser}
              onPin={pinChat}
              onMute={muteChat}
              onArchive={handleArchiveChat}
              onDelete={deleteChat}
              isLoading={messagingLoading}
            />
          </div>

          {/* ChatInterface - Shows when chat is selected */}
          {selectedChat ? (
            <div
              className={cn(
                'flex-1 transition-all duration-300',
                showChat ? 'block' : 'hidden lg:block'
              )}
            >
              <ChatInterface
                chat={selectedChat}
                messages={messages}
                currentUser={currentUser}
                typingUsers={Array.from(typingUsers)}
                onSendMessage={handleSendMessage}
                onStartTyping={startTyping}
                onAddReaction={handleAddEmoji}
                onRemoveReaction={handleRemoveEmoji}
                onStopTyping={stopTyping}
                onBack={handleBack}
                onlineUsers={onlineUsers}
                isLoading={messagingLoading}
                hasMoreMessages={hasMoreMessages}
                onLoadMore={loadMoreMessages}
              />
            </div>
          ) : (
            <div className="hidden lg:flex flex-1">
              <EmptyMessagesState />
            </div>
          )}
        </div>

        {/* Connection Status */}
        {/* <ConnectionStatus isConnected={isConnected} /> */}
      </div>

      {/* New Message Dialog */}
      {/* <NewMessageDialog
        open={showNewMessage}
        onClose={() => setShowNewMessage(false)}
        onCreate={handleCreateChat}
      /> */}
    </div>
  );
}
