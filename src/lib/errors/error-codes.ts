/**
 * Error Code Entity
 * -----------------
 * Centralized definition of all error codes.
 * e.g. redirect(`/checkout?error_code=${ERROR_CODES.ORDER_NOT_FOUND_OR_INVALID}`)
 */

// Enum for error codes for type-safety and autocompletion
export enum ERROR_CODES {
  // Orders & Payment
  ORDER_NOT_FOUND_OR_INVALID = 'order_not_found_or_invalid',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  INVALID_ORDER_STATUS = 'invalid_order_status',
  MISSING_ORDER_ID = 'missing_order_id',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_CANCELLED = 'payment_cancelled',
  SESSION_EXPIRED = 'session_expired',
  NETWORK_ERROR = 'network_error',
  INVALID_PAYMENT_METHOD = 'invalid_payment_method',
  ORDER_ALREADY_PAID = 'order_already_paid',
  UNEXPECTED_SERVER_ERROR = 'unexpected_server_error',
  STRIPE_VERIFICATION_FAILED = 'stripe_verification_failed',
  INTERNAL_ERROR = 'internal_server_error',
  UNKNOWN_ERROR = 'unknown_error',

  // Courses & Enrollment
  COURSE_NOT_FOUND = 'course_not_found',
  COURSE_ENROLLMENT_DROPPED = 'course_enrollment_dropped',
  NOT_ENROLLED = 'not_enrolled',
  ENROLLMENT_NOT_FOUND = 'enrollment_not_found',
  ENROLLMENT_ALREADY_COMPLETED = 'enrollment_already_completed',
  ENROLLMENT_ACCESS_DENIED = 'enrollment_access_denied',
  LESSON_NOT_FOUND = 'lesson_not_found',
  QUIZ_NOT_FOUND = 'quiz_not_found',
  QUIZ_ATTEMPT_LIMIT_REACHED = 'quiz_attempt_limit_reached',

  // General/Common
  BAD_REQUEST = 'bad_request',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  USER_BLOCKED = 'user_blocked',
  TOO_MANY_REQUESTS = 'too_many_requests',
}

// Type representing allowed error code values
export type ErrorCode = `${ERROR_CODES}`;

// Friendly error messages mapping
const ERROR_CODE_MESSAGES: Record<ERROR_CODES, string> = {
  // Orders & Payment
  [ERROR_CODES.ORDER_NOT_FOUND_OR_INVALID]: 'Order not found or is invalid.',
  [ERROR_CODES.UNAUTHORIZED_ACCESS]: 'You are not authorized to access this order or resource.',
  [ERROR_CODES.INVALID_ORDER_STATUS]: 'The order status is invalid for this operation.',
  [ERROR_CODES.MISSING_ORDER_ID]: 'No order ID was provided.',
  [ERROR_CODES.PAYMENT_FAILED]: 'Your payment could not be completed. Please try again.',
  [ERROR_CODES.PAYMENT_CANCELLED]: 'Payment was cancelled.',
  [ERROR_CODES.SESSION_EXPIRED]: 'Your session has expired. Please sign in and try again.',
  [ERROR_CODES.NETWORK_ERROR]:
    'A network error occurred. Please check your internet connection and try again.',
  [ERROR_CODES.INVALID_PAYMENT_METHOD]: 'The selected payment method is invalid or unavailable.',
  [ERROR_CODES.ORDER_ALREADY_PAID]: 'This order has already been paid.',
  [ERROR_CODES.UNEXPECTED_SERVER_ERROR]:
    'An unexpected server error occurred. Please try again later.',
  [ERROR_CODES.STRIPE_VERIFICATION_FAILED]:
    'Stripe payment verification failed. Please try again or contact support.',
  [ERROR_CODES.INTERNAL_ERROR]: 'Something went wrong. Please try again later.',

  // Courses & Enrollment
  [ERROR_CODES.COURSE_NOT_FOUND]: 'The requested course could not be found.',
  [ERROR_CODES.COURSE_ENROLLMENT_DROPPED]: 'Your enrollment for this course has been dropped.',
  [ERROR_CODES.NOT_ENROLLED]: 'You are not enrolled in this course.',
  [ERROR_CODES.ENROLLMENT_NOT_FOUND]: 'Enrollment not found.',
  [ERROR_CODES.ENROLLMENT_ALREADY_COMPLETED]: 'You have already completed this course.',
  [ERROR_CODES.ENROLLMENT_ACCESS_DENIED]: 'You do not have permission to access this enrollment.',
  [ERROR_CODES.LESSON_NOT_FOUND]: 'Lesson not found or is no longer available.',
  [ERROR_CODES.QUIZ_NOT_FOUND]: 'Quiz not found or is not available for this course.',
  [ERROR_CODES.QUIZ_ATTEMPT_LIMIT_REACHED]:
    'You have reached the maximum number of allowed attempts for this quiz.',

  // General/Common
  [ERROR_CODES.BAD_REQUEST]: 'The request was invalid or malformed.',
  [ERROR_CODES.FORBIDDEN]: 'You do not have permission to access this resource.',
  [ERROR_CODES.USER_BLOCKED]:
    'Your account has been blocked. Please contact support for assistance.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'Something went wrong.',
  [ERROR_CODES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_CODES.TOO_MANY_REQUESTS]: 'Too many requests. Please slow down and try again later.',
};

/**
 * Retrieves a user-friendly error message for a given error code.
 * Returns undefined if code is unrecognized or absent.
 * Always use this for displaying error messages to users.
 *
 * @param errorCode - The error code from params, e.g. 'order_not_found_or_invalid'
 */
export function getErrorCodeMessage(errorCode?: string): string | undefined {
  if (!errorCode) return;
  // Type assertion safe if produced by backend/controlled context
  return ERROR_CODE_MESSAGES[errorCode as ERROR_CODES];
}
