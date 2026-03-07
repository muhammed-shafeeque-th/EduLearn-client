import {
  getServerAdminToken,
  getServerAuthToken,
  getServerCookieHeaders,
} from '@/lib/server-apis/server-utils';
import { UserService } from './user.service';
import { serverAdminRefresh, serverRefresh } from '@/lib/server-apis/server-apis';
import { CourseService } from './course.service';
import { CartService } from './cart.service';
import { WishlistService } from './wishlist.service';
import { MediaService } from './media.service';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { AuthService } from './auth.service';
import { EnrollmentService } from './enrollment.service';
import { AdminService } from './admin.service';

export const serverUserService = UserService.create({
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
export const serverCartService = CartService.create({
  getHeaders: getServerCookieHeaders,
  authRefresh: serverRefresh,
  retry: 2,
  getToken: getServerAuthToken,
});
export const serverWishlistService = WishlistService.create({
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
