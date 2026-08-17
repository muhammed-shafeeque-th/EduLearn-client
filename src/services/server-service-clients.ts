import { UserService } from './user';
import { CourseService } from './course';
import { MediaService } from './media';
import { OrderService } from './order';
import { PaymentService } from './payment';
import { AuthService } from './auth';
import { EnrollmentService } from './enrollment';
import { AdminService } from './admin';
import { InstructorService } from './instructor';
import { NotificationService } from './notification';

async function lazyServerCookieHeaders() {
  return (await import('@/lib/server-apis/server-utils')).getServerCookieHeaders();
}
async function lazyServerAuthToken() {
  return (await import('@/lib/server-apis/server-utils')).getServerAuthToken();
}
async function lazyServerAdminToken() {
  return (await import('@/lib/server-apis/server-utils')).getServerAdminToken();
}
async function lazyServerRefresh() {
  return (await import('@/lib/server-apis/server-apis')).serverRefresh();
}
async function lazyServerAdminRefresh() {
  return (await import('@/lib/server-apis/server-apis')).serverAdminRefresh();
}

export const serverUserService = UserService.create({
  getHeaders: lazyServerCookieHeaders,
  authRefresh: lazyServerRefresh,
  retry: 2,
  getToken: lazyServerAuthToken,
});
export const serverInstructorService = InstructorService.create({
  getHeaders: lazyServerCookieHeaders,
  authRefresh: lazyServerRefresh,
  retry: 2,
  getToken: lazyServerAuthToken,
});
export const serverAuthService = AuthService.create({
  getHeaders: lazyServerCookieHeaders,
  authRefresh: lazyServerRefresh,
  retry: 2,
  getToken: lazyServerAuthToken,
});
export const serverCourseService = CourseService.create({
  getHeaders: lazyServerCookieHeaders,
  authRefresh: lazyServerRefresh,
  retry: 2,
  getToken: lazyServerAuthToken,
});
export const serverEnrollmentService = EnrollmentService.create({
  getHeaders: lazyServerCookieHeaders,
  authRefresh: lazyServerRefresh,
  retry: 2,
  getToken: lazyServerAuthToken,
});
export const serverNotificationService = NotificationService.create({
  getHeaders: lazyServerCookieHeaders,
  authRefresh: lazyServerRefresh,
  retry: 2,
  getToken: lazyServerAuthToken,
});
export const serverOrderService = OrderService.create({
  getHeaders: lazyServerCookieHeaders,
  authRefresh: lazyServerRefresh,
  retry: 2,
  getToken: lazyServerAuthToken,
});
export const serverPaymentService = PaymentService.create({
  getHeaders: lazyServerCookieHeaders,
  authRefresh: lazyServerRefresh,
  retry: 2,
  getToken: lazyServerAuthToken,
});
export const serverMediaService = MediaService.create({
  getHeaders: lazyServerCookieHeaders,
  authRefresh: lazyServerRefresh,
  retry: 2,
  getToken: lazyServerAuthToken,
});

export const serverAdminService = AdminService.create({
  getHeaders: lazyServerCookieHeaders,
  authRefresh: lazyServerAdminRefresh,
  retry: 2,
  getToken: lazyServerAdminToken,
});
