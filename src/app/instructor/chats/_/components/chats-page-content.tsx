'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Chat } from '@/types/chat';
import type { UserInfo } from '@/types/user';
import { MyChatsPageSkeleton } from './skeletons/my-chats-page-skeleton';
import { ChatList } from './chat-list';
import { ChatInterface } from './chat-interface';
import { EmptyMessagesState } from './empty-messages-state';
// import { ConnectionStatus } from './connection-status';
import { useAuthSelector } from '@/states/client';
import { toast } from 'sonner';
import { AlertCircle, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInstructorMessaging } from '@/services/ws/chat/hooks/use-instructor-messaging';

interface MyChatsPageContentProps {
  chatId?: string;
}

export function MyChatsPageContent({ chatId }: MyChatsPageContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: authUser, isLoading: userLoading } = useAuthSelector();

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const chatIdRef = useRef<string | undefined>(chatId);
  const isUnmountingRef = useRef(false);
  const lastSelectedChatIdRef = useRef<string | null>(null);

  // Compose valid UserInfo
  const currentUser: UserInfo | null = useMemo(() => {
    if (!authUser) return null;
    return {
      id: authUser.userId,
      name: authUser.username ?? '',
      firstName: authUser.username?.split(' ')[0] ?? '',
      lastName: authUser.username?.split(' ')?.slice(1).join(' ') ?? '',
      email: authUser.email ?? '',
      avatar: authUser.avatar,
      role: 'instructor',
      isOnline: undefined,
      lastSeen: undefined,
    };
  }, [authUser]);

  const {
    chats,
    messages,
    isConnected,
    typingUsers,
    onlineUsers,
    sendMessage,
    createOrGetChat,
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
  } = useInstructorMessaging({
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

  useEffect(() => {
    if (isConnected) {
      setConnectionError(false);
      setRetryCount(0);
      // Optionally, you can use a logger instead
      //logger.info('Connected to chat server');
    } else {
      //logger.warn('Disconnected from chat server');
    }
  }, [isConnected]);

  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  // Core logic to handle chat initialization and selection
  useEffect(() => {
    let isMounted = true;

    const initializeChat = async () => {
      if (userLoading || !currentUser) {
        return;
      }
      try {
        if (chatId && chatId !== lastSelectedChatIdRef.current) {
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
            toast.error('Chat not found');
            if (pathname !== '/instructor/chats') {
              router.replace('/instructor/chats');
            }
            setSelectedChat(null);
            setShowChat(false);
            lastSelectedChatIdRef.current = null;
          }
        }
        // No chatId, clear selection if needed
        else if (!chatId && selectedChat) {
          setSelectedChat(null);
          setShowChat(false);
          lastSelectedChatIdRef.current = null;
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        if (isMounted) {
          toast.error('Failed to load chat');
          setSelectedChat(null);
          setShowChat(false);
        }
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
    // Only deps that are actually in use, no enrollmentId
  }, [
    chatId,
    selectedChat,
    chats,
    currentUser,
    userLoading,
    messagingLoading,
    createOrGetChat,
    pathname,
    router,
  ]);

  // Track unmount
  useEffect(() => {
    return () => {
      isUnmountingRef.current = true;
    };
  }, []);

  const handleSelectChat = useCallback(
    (chat: Chat) => {
      if (isUnmountingRef.current) return;
      setSelectedChat(chat);
      setShowChat(true);
      lastSelectedChatIdRef.current = chat.id;

      const newPath = `/instructor/chats/${chat.id}`;
      if (pathname !== newPath) {
        router.push(newPath);
      }
    },
    [router, pathname]
  );

  const handleBack = useCallback(() => {
    if (isUnmountingRef.current) return;
    setSelectedChat(null);
    setShowChat(false);
    lastSelectedChatIdRef.current = null;

    const basePath = '/instructor/chats';
    if (pathname !== basePath) {
      router.replace(basePath);
    }
  }, [router, pathname]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedChat || !currentUser) {
        console.error('Cannot send: no chat or user');
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

  const handleRetryConnection = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    setConnectionError(false);
    refreshChats();
    if (selectedChat) {
      refreshMessages();
    }
  }, [refreshChats, refreshMessages, selectedChat]);

  const handleArchiveChat = useCallback(async (chatId: string) => {
    toast.info('Archive feature coming soon');
  }, []);

  // Loading states
  if (userLoading || isInitializing) {
    return <MyChatsPageSkeleton />;
  }

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
              <EmptyMessagesState onNewMessage={() => {}} />
            </div>
          )}
        </div>

        {/* Connection Status */}
        {/* <ConnectionStatus isConnected={isConnected} /> */}
      </div>
    </div>
  );
}
