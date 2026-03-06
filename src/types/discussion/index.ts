import { UserInfo } from '../user';

export interface DiscussionRoom {
  id: string;
  courseId: string;
  instructorId: string;
  createdAt: string;
  updatedAt: string;
}

// export interface DiscussionMessage {
//   id: string;
//   roomId: string;
//   senderId: string;
//   sender: {
//     id: string;
//     role: 'student' | 'instructor';
//     name: string;
//     avatar?: string;
//   };
//   content: string;
//   sequence: number;
//   createdAt: string;
//   updatedAt: string;
// }

export interface DiscussionMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderRole: string;
  sender?: UserInfo;
  content: string;
  sequence: number;
  createdAt: string;
  updatedAt: string;
}

export type DiscussionOptimisticState = 'pending' | 'failed' | 'sent';

export interface UiDiscussionMessage extends DiscussionMessage {
  optimisticState?: DiscussionOptimisticState;
  idempotencyKey?: string;
}
