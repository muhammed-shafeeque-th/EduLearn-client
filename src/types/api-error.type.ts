export interface ApiError {
  message: string;
  error: { code: string; details?: [{ message?: string; field?: string }] };
}
