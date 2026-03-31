import { BaseService, BaseServiceOptions, RequestOptions } from '../base-service';
import { config } from '@/lib/config';
import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';
import { Chat, Message } from '@/types/chat';
import { IChatService } from './chat.service.interface';
import { getMessagePaginationParams, MessagesParams } from './chat.types';

export class ChatService extends BaseService implements IChatService {
  constructor({
    getToken = getClientAuthToken,
    authRefresh = authRefreshToken,
    ...options
  }: BaseServiceOptions = {}) {
    super(`${config.apiUrl}/chats`, {
      ...options,
      getToken,
      authRefresh,
    });
  }

  public async getStudentChats(
    params?: MessagesParams,
    options?: RequestOptions
  ): Promise<ApiResponse<Chat[]>> {
    const queryParams = getMessagePaginationParams(params);
    if (params?.status) queryParams.append('status', params.status);
    queryParams.append('role', 'student');

    const queryString = queryParams.toString();
    return this.get<ApiResponse<Chat[]>>(`?${queryString}`, options);
  }
  public async getInstructorChats(
    params?: MessagesParams,
    options?: RequestOptions
  ): Promise<ApiResponse<Chat[]>> {
    const queryParams = getMessagePaginationParams(params);
    if (params?.status) queryParams.append('status', params.status);
    queryParams.append('role', 'instructor');

    const queryString = queryParams.toString();
    return this.get<ApiResponse<Chat[]>>(`/instructor?${queryString}`, options);
  }
  public async getMessages(
    chatId: string,
    params?: MessagesParams,
    options?: RequestOptions
  ): Promise<ApiResponse<Message[]>> {
    const queryParams = getMessagePaginationParams(params);
    if (params?.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();

    return this.get<ApiResponse<Message[]>>(`/${chatId}/messages?${queryString}`, options);
  }

  public async markAsRead(chatId: string, options?: RequestOptions): Promise<ApiResponse<Message>> {
    return this.patch<ApiResponse<Message>>(`/${chatId}/read`, {}, options);
  }

  public async sendMessage(
    chatId: string,
    content: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Message>> {
    return this.post<ApiResponse<Message>>(
      `/${chatId}/messages`,
      {
        content,
      },
      options
    );
  }

  public async editMessage(
    chatId: string,
    messageId: string,
    content: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Message>> {
    return this.patch<ApiResponse<Message>>(
      `/${chatId}/messages/${messageId}`,
      { content },
      options
    );
  }

  public async deleteMessage(
    chatId: string,
    messageId: string,
    deleteForEveryone = false,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    const queryParams = new URLSearchParams();
    if (deleteForEveryone) {
      queryParams.set('forEveryone', 'true');
    }
    const queryString = queryParams.toString();
    return this.delete<ApiResponse<void>>(
      `/${chatId}/messages/${messageId}${queryString ? `?${queryString}` : ''}`,
      options
    );
  }

  public async reactMessage(
    chatId: string,
    messageId: string,
    emoji: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Message>> {
    return this.post<ApiResponse<Message>>(
      `/${chatId}/messages/${messageId}/reactions`,
      { emoji },
      options
    );
  }

  public async removeReaction(
    chatId: string,
    messageId: string,
    reactionId: string,
    options?: RequestOptions
  ): Promise<ApiResponse<Message>> {
    return this.delete<ApiResponse<Message>>(
      `/${chatId}/messages/${messageId}/reactions/${reactionId}`,
      options
    );
  }

  public async createOrGetChat(
    params: { studentId: string; instructorId: string; role: string },
    options?: RequestOptions
  ): Promise<ApiResponse<Chat>> {
    return this.post<ApiResponse<Chat>>(``, params, options);
  }

  public async pinChat(chatId: string, options?: RequestOptions): Promise<ApiResponse<Chat>> {
    return this.patch<ApiResponse<Chat>>(`/${chatId}/pin`, {}, options);
  }

  public async unpinChat(chatId: string, options?: RequestOptions): Promise<ApiResponse<Chat>> {
    return this.patch<ApiResponse<Chat>>(`/${chatId}/unpin`, {}, options);
  }

  public async muteChat(
    chatId: string,
    duration?: number,
    options?: RequestOptions
  ): Promise<ApiResponse<Chat>> {
    return this.patch<ApiResponse<Chat>>(`/${chatId}/mute`, { duration }, options);
  }

  public async unmuteChat(chatId: string, options?: RequestOptions): Promise<ApiResponse<Chat>> {
    return this.patch<ApiResponse<Chat>>(`/${chatId}/unmute`, {}, options);
  }

  public async archiveChat(chatId: string, options?: RequestOptions): Promise<ApiResponse<Chat>> {
    return this.patch<ApiResponse<Chat>>(`/${chatId}/archive`, {}, options);
  }

  public async unarchiveChat(chatId: string, options?: RequestOptions): Promise<ApiResponse<Chat>> {
    return this.patch<ApiResponse<Chat>>(`/${chatId}/unarchive`, {}, options);
  }

  public async deleteChat(chatId: string, options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/${chatId}`, options);
  }

  public async getUnreadCount(options?: RequestOptions): Promise<ApiResponse<number>> {
    return this.get<ApiResponse<number>>(`/unread-count`, options);
  }

  async uploadFile(file: File, chatId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatId', chatId);

    // No need to specify Content-Type, browser will set it when sending FormData
    return this.post(`/upload`, formData);
  }

  // Static factory for SSR usage (pass a token getter or headers)
  static create(options: BaseServiceOptions) {
    return new ChatService(options);
  }
}

// Singleton for client-side usage
export const chatService: IChatService = new ChatService();
