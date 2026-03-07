/* eslint-disable jsx-a11y/aria-role */
import { Suspense } from 'react';
import { ChatsPageContent } from '@/components/chat/chats-page-content';
import { MyChatsPageSkeleton } from '@/components/chat/skeletons/my-chats-page-skeleton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Instructor chats',
  description: 'Connect with students through instant messaging',
  keywords: ['messages', 'chat', 'communication', 'instructor'],
};

interface ChatsPageProps {
  params: Promise<{ chatId?: string[] }>;
}

export default async function InstructorChats({ params }: ChatsPageProps) {
  const { chatId } = await params;
  const normalizedChatId = Array.isArray(chatId) ? chatId[0] : chatId;
  return (
    <div className="h-screen bg-background overflow-hidden">
      <Suspense fallback={<MyChatsPageSkeleton />}>
        <ChatsPageContent chatId={normalizedChatId} role={'instructor'} />
      </Suspense>
    </div>
  );
}
