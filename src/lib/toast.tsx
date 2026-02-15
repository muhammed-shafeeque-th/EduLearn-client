import { ExternalToast, toast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

export interface ToastOptions {
  id?: string | number;
  duration?: number;
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick?: () => void;
  };
  onDismiss?: () => void;
  onAutoClose?: () => void;
  important?: boolean;
}

export interface ToastData {
  title: string;
  description?: string;
  options?: ToastOptions;
}

export const toastService = {
  success: ({ title, description, options }: ToastData) => {
    return toast.success(title, {
      description,
      icon: <CheckCircle className="h-4 w-4" />,
      duration: options?.duration ?? 4000,
      className: 'success-toast',
      ...options,
    } as ExternalToast);
  },

  error: ({ title, description, options }: ToastData) => {
    return toast.error(title, {
      description,
      icon: <XCircle className="h-4 w-4" />,
      className: 'error-toast',
      ...options,
    } as ExternalToast);
  },

  warning: ({ title, description, options }: ToastData) => {
    return toast.warning(title, {
      description,
      icon: <AlertTriangle className="h-4 w-4" />,
      duration: options?.duration ?? 5000,
      className: 'warning-toast',
      ...options,
    } as ExternalToast);
  },

  info: ({ title, description, options }: ToastData) => {
    return toast.info(title, {
      description,
      icon: <Info className="h-4 w-4" />,
      duration: options?.duration ?? 4000,
      className: 'info-toast',
      ...options,
    } as ExternalToast);
  },

  loading: ({ title, description, options }: ToastData) => {
    return toast.loading(title, {
      description,
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      className: 'loading-toast',
      ...options,
    } as ExternalToast);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options?: ToastOptions
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      ...options,
    } as ExternalToast);
  },

  custom: (renderer: (id: string | number) => React.ReactElement, options?: ToastOptions) => {
    return toast.custom(renderer, options as ExternalToast | undefined);
  },

  dismiss: (toastId?: string | number) => {
    return toast.dismiss(toastId);
  },

  dismissAll: () => {
    return toast.dismiss();
  },
};

export const commonToasts = {
  loginSuccess: () =>
    toastService.success({
      title: 'Welcome back!',
      description: 'You have been successfully logged in.',
    }),

  loginError: (error?: string) =>
    toastService.error({
      title: 'Login failed',
      description: error || 'Please check your credentials and try again.',
    }),

  registerSuccess: () =>
    toastService.success({
      title: 'OTP code sent!',
      description: 'Check your email for the new verification code.',
    }),

  registerError: (error?: string) =>
    toastService.error({
      title: 'Registration failed',
      description: error || 'Please check your credentials and try again.',
    }),

  logoutSuccess: () =>
    toastService.success({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    }),

  createSuccess: (item: string) =>
    toastService.success({
      title: 'Created successfully',
      description: `${item} has been created.`,
    }),

  updateSuccess: (item: string) =>
    toastService.success({
      title: 'Updated successfully',
      description: `${item} has been updated.`,
    }),

  deleteSuccess: (item: string) =>
    toastService.success({
      title: 'Deleted successfully',
      description: `${item} has been deleted.`,
    }),

  saveError: () =>
    toastService.error({
      title: 'Save failed',
      description: 'Unable to save changes. Please try again.',
    }),

  networkError: () =>
    toastService.error({
      title: 'Connection error',
      description: 'Please check your internet connection and try again.',
      options: {
        action: {
          label: 'Retry',
          onClick: () => window.location.reload(),
        },
      },
    }),

  serverError: () =>
    toastService.error({
      title: 'Server error',
      description: 'Something went wrong on our end. Please try again later.',
    }),

  validationError: (message?: string) =>
    toastService.error({
      title: 'Validation error',
      description: message || 'Please check your input and try again.',
    }),

  uploadSuccess: (fileName: string) =>
    toastService.success({
      title: 'Upload complete',
      description: `${fileName} has been uploaded successfully.`,
    }),

  uploadError: () =>
    toastService.error({
      title: 'Upload failed',
      description: 'Unable to upload file. Please try again.',
    }),

  permissionDenied: () =>
    toastService.warning({
      title: 'Permission denied',
      description: 'You do not have permission to perform this action.',
    }),

  copySuccess: () =>
    toastService.success({
      title: 'Copied!',
      description: 'Content copied to clipboard.',
      options: { duration: 2000 },
    }),
};
