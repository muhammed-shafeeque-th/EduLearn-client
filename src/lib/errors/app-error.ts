import { HttpStatusCode } from 'axios';
import { ErrorCode } from './error-codes';

export type ErrorDetail = { message: string; field?: string };

export class AppError extends Error {
  errorCode: ErrorCode;
  status?: HttpStatusCode | number | string;
  details?: ErrorDetail[];

  constructor(
    message: string,
    errorCode: ErrorCode = 'unexpected_server_error',
    details?: ErrorDetail[],
    status?: number | string
  ) {
    super(message);
    this.errorCode = errorCode;
    this.details = details;
    this.status = status;
  }
}
