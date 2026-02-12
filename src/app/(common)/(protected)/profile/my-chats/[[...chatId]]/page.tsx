import { Suspense } from 'react';
import { MyChatsPageContent } from '../_/components/chats-page-content';
import { MyChatsPageSkeleton } from '../_/components/skeletons/my-chats-page-skeleton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My chats',
  description: 'Connect with instructors and students through instant messaging',
  keywords: ['messages', 'chat', 'communication', 'instructor'],
};

interface ChatsPageProps {
  params: Promise<{ chatId?: string[] }>;
  searchParams: Promise<{ enrollmentId?: string }>;
}

export default async function MyChats({ params, searchParams }: ChatsPageProps) {
  const { chatId } = await params;
  const { enrollmentId } = await searchParams;
  // Ensure chatId is string or undefined (not string[])
  const normalizedChatId = Array.isArray(chatId) ? chatId[0] : chatId;
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      <Suspense fallback={<MyChatsPageSkeleton />}>
        <MyChatsPageContent chatId={normalizedChatId} enrollmentId={enrollmentId} />
      </Suspense>
    </div>
  );
}
