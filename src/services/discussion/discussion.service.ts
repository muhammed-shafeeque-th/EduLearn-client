import { BaseService, BaseServiceOptions, RequestOptions } from '../base-service';
import { config } from '@/lib/config';
import { ApiResponse } from '@/types/api-response';
import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';
import type { DiscussionRoom, DiscussionMessage } from '@/types/discussion';
import { IDiscussionService } from './discussion.service.interface';
import { DiscussionMessagesResponse } from './discussion.types';

export class DiscussionService extends BaseService implements IDiscussionService {
  constructor({
    getToken = getClientAuthToken,
    authRefresh = authRefreshToken,
    ...options
  }: BaseServiceOptions = {}) {
    super(`${config.apiUrl}/discussions`, {
      ...options,
      getToken,
      authRefresh,
    });
  }

  /**
   * Create or get an existing discussion room for a course.
   */
  public async createOrGetRoom(
    courseId: string,
    instructorId?: string,
    options?: RequestOptions
  ): Promise<ApiResponse<DiscussionRoom>> {
    return this.post<ApiResponse<DiscussionRoom>>('/rooms', { courseId, instructorId }, options);
  }

  /**
   * Send a message to a discussion room.
   */
  public async sendMessage(
    roomId: string,
    content: string,
    options?: RequestOptions
  ): Promise<ApiResponse<DiscussionMessage>> {
    return this.post<ApiResponse<DiscussionMessage>>(
      `/rooms/${roomId}/messages`,
      { content },
      options
    );
  }

  public async getMessages(
    roomId: string,
    page = 1,
    pageSize = 30,
    options?: RequestOptions
  ): Promise<ApiResponse<DiscussionMessagesResponse>> {
    return this.get<ApiResponse<DiscussionMessagesResponse>>(
      `/rooms/${roomId}/messages?page=${page}&pageSize=${pageSize}`,
      options
    );
  }

  /**
   * Static factory for SSR usage.
   */
  static create(options: BaseServiceOptions) {
    return new DiscussionService(options);
  }
}

let instance: DiscussionService | null = null;
export const getDiscussionService = () => (instance ??= new DiscussionService());
export const discussionService = getDiscussionService();
