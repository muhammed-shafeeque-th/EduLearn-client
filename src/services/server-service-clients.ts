import {
  getServerAdminToken,
  getServerAuthToken,
  getServerCookieHeaders,
} from '@/lib/server-apis/server-utils';
import { UserService } from './user';
import { serverAdminRefresh, serverRefresh } from '@/lib/server-apis/server-apis';
import { CourseService } from './course';
import { MediaService } from './media';
import { OrderService } from './order';
import { PaymentService } from './payment';
import { AuthService } from './auth';
import { EnrollmentService } from './enrollment';
import { AdminService } from './admin';
import { InstructorService } from './instructor';
import { NotificationService } from './notification';

export const serverUserService = UserService.create({
  getHeaders: getServerCookieHeaders,
  authRefresh: serverRefresh,
  retry: 2,
  getToken: getServerAuthToken,
});
export const serverInstructorService = InstructorService.create({
  getHeaders: getServerCookieHeaders,
  authRefresh: serverRefresh,
  retry: 2,
  getToken: getServerAuthToken,
});
export const serverAuthService = AuthService.create({
  getHeaders: getServerCookieHeaders,
  authRefresh: serverRefresh,
  retry: 2,
  getToken: getServerAuthToken,
});
export const serverCourseService = CourseService.create({
  getHeaders: getServerCookieHeaders,
  authRefresh: serverRefresh,
  retry: 2,
  getToken: getServerAuthToken,
});
export const serverEnrollmentService = EnrollmentService.create({
  getHeaders: getServerCookieHeaders,
  authRefresh: serverRefresh,
  retry: 2,
  getToken: getServerAuthToken,
});
export const serverNotificationService = NotificationService.create({
  getHeaders: getServerCookieHeaders,
  authRefresh: serverRefresh,
  retry: 2,
  getToken: getServerAuthToken,
});
export const serverOrderService = OrderService.create({
  getHeaders: getServerCookieHeaders,
  authRefresh: serverRefresh,
  retry: 2,
  getToken: getServerAuthToken,
});
export const serverPaymentService = PaymentService.create({
  getHeaders: getServerCookieHeaders,
  authRefresh: serverRefresh,
  retry: 2,
  getToken: getServerAuthToken,
});
export const serverMediaService = MediaService.create({
  getHeaders: getServerCookieHeaders,
  authRefresh: serverRefresh,
  retry: 2,
  getToken: getServerAuthToken,
});

export const serverAdminService = AdminService.create({
  getHeaders: getServerCookieHeaders,
  authRefresh: serverAdminRefresh,
  retry: 2,
  getToken: getServerAdminToken,
});
