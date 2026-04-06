import { DiscussionMessage } from '@/types/discussion';

export interface DiscussionMessagesResponse {
  messages: DiscussionMessage[];
  total: number;
}
