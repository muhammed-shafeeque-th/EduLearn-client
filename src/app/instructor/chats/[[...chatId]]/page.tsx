import { Suspense } from 'react';
import { MyChatsPageContent } from '../_/components/chats-page-content';
import { MyChatsPageSkeleton } from '../_/components/skeletons/my-chats-page-skeleton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Instructor chats',
  description: 'Connect with students through instant messaging',
  keywords: ['messages', 'chat', 'communication', 'instructor'],
};

interface ChatsPageProps {
  params: Promise<{ chatId?: string[] }>;
}

export default async function MyChats({ params }: ChatsPageProps) {
  const { chatId } = await params;
  const normalizedChatId = Array.isArray(chatId) ? chatId[0] : chatId;
  return (
    <div className="h-screen bg-background">
      <Suspense fallback={<MyChatsPageSkeleton />}>
        <MyChatsPageContent chatId={normalizedChatId} />
      </Suspense>
    </div>
  );
}
