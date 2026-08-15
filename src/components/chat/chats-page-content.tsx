'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Chat } from '@/types/chat';
import type { UserInfo } from '@/types/user';
import { MyChatsPageSkeleton } from '@/components/chat/skeletons/my-chats-page-skeleton';
import { ChatList } from '@/components/chat/chat-list';
import { ChatInterface } from '@/components/chat/chat-interface';
import { EmptyMessagesState } from '@/components/chat/empty-messages-state';
import { NewMessageDialog } from '@/components/chat/new-message-dialog';
import { useAuthSelector } from '@/states/client';
import { useMessaging, type ChatRole } from '@/services/ws/chat/hooks/use-messaging';
import { toast } from 'sonner';
import { AlertCircle, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants/routes';

// Route config per role
const ROUTE_MAP: Record<ChatRole, { base: string }> = {
  instructor: { base: ROUTES.instructor.chats.root as string },
  student: { base: ROUTES.student.chats.root as string },
};

// Props
interface ChatsPageContentProps {
  chatId?: string;
  role: ChatRole;
}

// Component
export function ChatsPageContent({ chatId, role }: ChatsPageContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user: authUser, isLoading: userLoading } = useAuthSelector();
  const routes = ROUTE_MAP[role];

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const isUnmountingRef = useRef(false);
  const lastSelectedChatIdRef = useRef<string | null>(null);

  // Compose UserInfo from auth
  const currentUser: UserInfo | null = useMemo(() => {
    if (!authUser) return null;
    return {
      id: authUser.userId,
      name: authUser.username ?? '',
      firstName: authUser.username?.split(' ')[0] ?? '',
      lastName: authUser.username?.split(' ')?.slice(1).join(' ') ?? '',
      email: authUser.email ?? '',
      avatar: authUser.avatar,
      role: role as 'student' | 'instructor',
      isOnline: undefined,
      lastSeen: undefined,
    };
  }, [authUser, role]);

  //  Messaging hook
  const {
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
    archiveChat,
    deleteChat,
    editMessage,
    deleteMessage,
    startTyping,
    stopTyping,
    isLoading: messagingLoading,
    refreshChats,
    refreshMessages,
    hasMoreMessages,
    loadMoreMessages,
  } = useMessaging({
    userId: authUser?.userId,
    chatId: selectedChat?.id,
    role,
    autoConnect: true,
    onError: (err: Error) => {
      console.error('Messaging error:', err);
      setConnectionError(true);
      toast.error('Connection issue. Retrying...', {
        description: err.message,
      });
    },
  });

  //  Connection tracking
  useEffect(() => {
    if (isConnected) {
      setConnectionError(false);
      setRetryCount(0);
    }
  }, [isConnected]);

  //  Chat initialization & deep-link handling
  useEffect(() => {
    let isMounted = true;

    const initializeChat = async () => {
      if (userLoading || !currentUser) return;

      try {
        if (chatId && chatId !== lastSelectedChatIdRef.current) {
          // Wait for chats to load
          if (chats.length === 0 && messagingLoading) return;

          const chat = chats.find((c) => c.id === chatId);

          if (chat && isMounted) {
            setSelectedChat(chat);
            setShowChat(true);
            lastSelectedChatIdRef.current = chat.id;
          } else if (!messagingLoading && isMounted) {
            toast.error('Chat not found');
            if (pathname !== routes.base) {
              router.replace(routes.base);
            }
            setSelectedChat(null);
            setShowChat(false);
            lastSelectedChatIdRef.current = null;
          }
        } else if (!chatId && selectedChat) {
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
  }, [
    chatId,
    selectedChat,
    chats,
    currentUser,
    userLoading,
    messagingLoading,
    pathname,
    router,
    routes.base,
  ]);

  useEffect(() => {
    return () => {
      isUnmountingRef.current = true;
    };
  }, []);

  //  Handlers

  const handleSelectChat = useCallback(
    (chat: Chat) => {
      if (isUnmountingRef.current) return;
      setSelectedChat(chat);
      setShowChat(true);
      lastSelectedChatIdRef.current = chat.id;

      const newPath = `${routes.base}/${chat.id}`;
      if (pathname !== newPath) {
        router.push(newPath);
      }
    },
    [router, pathname, routes.base]
  );

  const handleBack = useCallback(() => {
    if (isUnmountingRef.current) return;
    setSelectedChat(null);
    setShowChat(false);
    lastSelectedChatIdRef.current = null;

    if (pathname !== routes.base) {
      router.replace(routes.base);
    }
  }, [router, pathname, routes.base]);

  const handleCreateChat = useCallback(
    async (otherUserId: string) => {
      if (!currentUser) return;

      const params =
        role === 'instructor'
          ? { studentId: otherUserId, instructorId: currentUser.id, role: 'instructor' }
          : { studentId: currentUser.id, instructorId: otherUserId, role: 'student' };

      try {
        const chat = await createOrGetChat(params);

        if (chat) {
          setSelectedChat(chat);
          setShowChat(true);
          lastSelectedChatIdRef.current = chat.id;
          setShowNewMessage(false);

          const newPath = `${routes.base}/${chat.id}`;
          if (pathname !== newPath) {
            router.push(newPath);
          }
        }
      } catch (error) {
        toast.error('Failed to start conversation');
        console.error('Error creating chat:', error);
      }
    },
    [currentUser, createOrGetChat, router, pathname, routes.base, role]
  );

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

  const handleAddReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!selectedChat || !currentUser) return;
      try {
        const res = await addMessageReaction(messageId, emoji);
        if (!res) toast.error('Failed to add reaction');
      } catch {
        toast.error('Failed to add reaction');
      }
    },
    [selectedChat, currentUser, addMessageReaction]
  );

  const handleRemoveReaction = useCallback(
    async (messageId: string, reactionId: string) => {
      if (!selectedChat || !currentUser) return;
      try {
        const res = await removeMessageReaction(messageId, reactionId);
        if (!res) toast.error('Failed to remove reaction');
      } catch {
        toast.error('Failed to remove reaction');
      }
    },
    [selectedChat, currentUser, removeMessageReaction]
  );

  const handleRetryConnection = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    setConnectionError(false);
    refreshChats();
    if (selectedChat) refreshMessages();
  }, [refreshChats, refreshMessages, selectedChat]);

  const handleArchiveChat = useCallback(
    async (archiveChatId: string) => {
      try {
        const success = await archiveChat(archiveChatId);
        if (!success) toast.error('Failed to toggle archive');
      } catch {
        toast.error('Failed to toggle archive');
      }
    },
    [archiveChat]
  );
  const handlePinChat = useCallback(
    async (chatId: string) => {
      try {
        const success = await pinChat(chatId);
        if (!success) return toast.error('Failed to update chat state ');
        toast.success('Chat to state updated');
      } catch {
        toast.error('Failed to update chat state ');
      }
    },
    [pinChat]
  );

  //  Loading / error states

  if (userLoading || isInitializing) {
    return <MyChatsPageSkeleton />;
  }

  if (!authUser || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-br from-background via-blue-50/30 to-purple-50/30 dark:from-background dark:via-blue-950/10 dark:to-purple-950/10">
        <div className="text-center space-y-4 max-w-md px-6">
          <div className="w-20 h-20 mx-auto bg-linear-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access your messages.</p>
          <Button onClick={() => router.push(ROUTES.auth.login)} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (connectionError && retryCount > 2) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-br from-background via-orange-50/30 to-red-50/30 dark:from-background dark:via-orange-950/10 dark:to-red-950/10">
        <div className="text-center space-y-4 max-w-md px-6">
          <div className="w-20 h-20 mx-auto bg-linear-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center">
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

  //  Main UI

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          {/* Chat List */}
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
              onlineUsers={new Set(onlineUsers)}
              currentUser={currentUser}
              onPin={handlePinChat}
              onMute={muteChat}
              onArchive={handleArchiveChat}
              onDelete={deleteChat}
              onNewMessage={() => setShowNewMessage(true)}
              isLoading={messagingLoading}
            />
          </div>

          {/* Chat Interface */}
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
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
                onEditMessage={editMessage}
                onDeleteMessage={deleteMessage}
                onBack={handleBack}
                onlineUsers={onlineUsers}
                isLoading={messagingLoading}
                hasMoreMessages={hasMoreMessages}
                onLoadMore={loadMoreMessages}
              />
            </div>
          ) : (
            <div className="hidden lg:flex flex-1">
              <EmptyMessagesState onNewMessage={() => setShowNewMessage(true)} />
            </div>
          )}
        </div>
      </div>

      {/* New Message Dialog */}
      <NewMessageDialog
        open={showNewMessage}
        userId={currentUser.id}
        onClose={() => setShowNewMessage(false)}
        onCreate={handleCreateChat}
        role={role}
      />
    </div>
  );
}
