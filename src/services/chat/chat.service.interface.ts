import { RequestOptions } from '../base-service';
import { ApiResponse } from '@/types/api-response';
import { Chat, Message } from '@/types/chat';
import { MessagesParams } from './chat.types';

export interface IChatService {
  markAsRead(chatId: string, options?: RequestOptions): Promise<ApiResponse<Message>>;
  getMessages(
    chatId: string,
    params?: MessagesParams,
    options?: RequestOptions
  ): Promise<ApiResponse<Message[]>>;
  getStudentChats(params?: MessagesParams, options?: RequestOptions): Promise<ApiResponse<Chat[]>>;
  getInstructorChats(
    params?: MessagesParams,
    options?: RequestOptions
  ): Promise<ApiResponse<Chat[]>>;
  sendMessage(
    chatId: string,
    content: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Message>>;
  editMessage(
    chatId: string,
    messageId: string,
    content: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Message>>;
  deleteMessage(
    chatId: string,
    messageId: string,
    deleteForEveryone?: boolean,
    options?: RequestOptions
  ): Promise<ApiResponse<void>>;
  reactMessage(
    chatId: string,
    messageId: string,
    emoji?: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Message>>;
  removeReaction(
    chatId: string,
    messageId: string,
    reactionId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Message>>;
  createOrGetChat(
    params: { studentId: string; instructorId: string; role: string },
    options?: RequestOptions
  ): Promise<ApiResponse<Chat>>;
  pinChat(chatId: string, options?: RequestOptions): Promise<ApiResponse<Chat>>;
  unpinChat(chatId: string, options?: RequestOptions): Promise<ApiResponse<Chat>>;
  muteChat(chatId: string, duration?: number, options?: RequestOptions): Promise<ApiResponse<Chat>>;
  unmuteChat(chatId: string, options?: RequestOptions): Promise<ApiResponse<Chat>>;
  archiveChat(chatId: string, options?: RequestOptions): Promise<ApiResponse<Chat>>;
  unarchiveChat(chatId: string, options?: RequestOptions): Promise<ApiResponse<Chat>>;
  deleteChat(chatId: string, options?: RequestOptions): Promise<ApiResponse<void>>;
  getUnreadCount(options?: RequestOptions): Promise<ApiResponse<number>>;
}
