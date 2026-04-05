import { DiscussionMessage, DiscussionRoom } from '@/types/discussion';
import { RequestOptions } from '../base-service';
import { ApiResponse } from '@/types/api-response';
import { DiscussionMessagesResponse } from './discussion.types';

export interface IDiscussionService {
  /**
   * Create or get an existing discussion room for a course.
   */
  createOrGetRoom(
    courseId: string,
    instructorId?: string,
    options?: RequestOptions
  ): Promise<ApiResponse<DiscussionRoom>>;

  /**
   * Send a message to a discussion room.
   */
  sendMessage(
    roomId: string,
    content: string,
    options?: RequestOptions
  ): Promise<ApiResponse<DiscussionMessage>>;

  getMessages(
    roomId: string,
    page?: number,
    pageSize?: number,
    options?: RequestOptions
  ): Promise<ApiResponse<DiscussionMessagesResponse>>;
}
