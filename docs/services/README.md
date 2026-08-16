# 🔧 Service Layer Documentation

This section provides comprehensive documentation for the EduLearn service layer, which handles all API interactions, business logic, and external integrations.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Base Service](#base-service)
- [Service Categories](#service-categories)
- [Error Handling](#error-handling)
- [Authentication](#authentication)
- [Testing](#testing)

## 🔄 Overview

The service layer is the core of EduLearn's data management, providing a clean abstraction over API calls, external services, and business logic. It follows a consistent pattern with:

- **Base Service Class**: Common functionality for all services
- **Domain-Specific Services**: Specialized services for different business domains
- **Type Safety**: Full TypeScript support with proper error handling
- **Authentication**: Automatic token management and refresh
- **Error Recovery**: Retry logic and comprehensive error handling

## 🏗️ Architecture

### Service Layer Structure

```
src/services/
├── 📄 server-service-clients.ts     # Server API clients
│
├── 📁 base-service/                 # Base service infrastructure
│   ├── 📄 base.service.ts           # Base service class
│   ├── 📄 types.ts                  # Service type definitions
│   ├── 📄 guards.ts                 # Type guards and utilities
│   └── 📄 index.ts                  # Exports
│
├── 📄 auth.service.ts               # Authentication service
├── 📄 user.service.ts               # User management service
├── 📄 course.service.ts             # Course management service
├── 📄 enrollment.service.ts         # Course enrollment service
├── 📄 payment.service.ts            # Payment processing service
├── 📄 order.service.ts              # Order management service
├── 📄 cart.service.ts               # Shopping cart service
├── 📄 wishlist.service.ts           # Wishlist management service
├── 📄 messaging.service.ts          # Messaging service
├── 📄 notification.service.ts       # Notification service
├── 📄 wallet.service.ts             # User wallet service
├── 📄 media.service.ts              # Media upload/download service
├── 📄 admin.service.ts              # Admin operations service
│
└── 📁 ws/                           # WebSocket services
    ├── 📁 chat/                     # Real-time chat service
    │   ├── 📁 hooks/                # Chat React hooks
    │   ├── 📄 socket.service.ts     # Socket.IO service
    │   └── 📁 utils/                # Chat utilities
    └── 📁 notification/             # Real-time notifications
        ├── 📁 hooks/                # Notification hooks
        └── 📄 notification-websocket.manager.ts
```

### Service Dependencies

```typescript
// Service dependency graph
AuthService
├── BaseService (inheritance)
├── Token management
└── Refresh logic

CourseService
├── BaseService (inheritance)
├── AuthService (token access)
├── Pagination helpers
└── Search utilities

PaymentService
├── BaseService (inheritance)
├── AuthService (token access)
├── OrderService (order data)
├── Provider integrations
│   ├── Stripe
│   ├── PayPal
│   └── Razorpay
└── Webhook handlers
```

## 🏛️ Base Service

### BaseService Class

The `BaseService` class provides common functionality for all API services:

```typescript
export abstract class BaseService {
  protected readonly client: AxiosInstance;
  protected readonly baseURL: string;
  protected readonly getToken?: () => string | null | Promise<string | null>;
  protected readonly authRefresh?: () => Promise<{ token: string }> | null;
  protected readonly getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  protected readonly hooks?: BaseServiceHooks;
  protected readonly retry: number;

  constructor(baseURL: string, options: BaseServiceOptions = {}) {
    this.baseURL = baseURL;
    this.getToken = options.getToken;
    this.authRefresh = options.authRefresh;
    this.getHeaders = options.getHeaders;
    this.hooks = options.hooks;
    this.retry = options.retry ?? 3;

    this.client = this.createClient(options);
    this.setupInterceptors();
  }

  // HTTP methods
  protected get<T>(url: string, config?: RequestConfig): Promise<T>;
  protected post<T, D = any>(url: string, data?: D, config?: RequestConfig): Promise<T>;
  protected patch<T, D = any>(url: string, data?: D, config?: RequestConfig): Promise<T>;
  protected put<T, D = any>(url: string, data?: D, config?: RequestConfig): Promise<T>;
  protected delete<T>(url: string, config?: RequestConfig): Promise<T>;
  protected download(url: string, config?: RequestConfig): Promise<Blob>;
}
```

### Key Features

#### 1. Automatic Authentication

```typescript
// Request interceptor adds auth headers
this.client.interceptors.request.use(async (config) => {
  const token = await this.getToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### 2. Token Refresh Logic

```typescript
// Response interceptor handles 401 errors
this.client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      try {
        const { token } = await this.authRefresh?.();
        error.config.headers.Authorization = `Bearer ${token}`;
        return this.client(error.config);
      } catch (refreshError) {
        // Handle refresh failure
      }
    }
    return Promise.reject(error);
  }
);
```

#### 3. Idempotency Keys

```typescript
// Automatic idempotency for mutations
this.client.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  if (['post', 'patch', 'put'].includes(method || '')) {
    if (!config.headers['Idempotency-Key']) {
      config.headers['Idempotency-Key'] = uuidv4();
    }
  }
  return config;
});
```

#### 4. Retry Logic

```typescript
// Exponential backoff retry
private async _getRetryDelay(retryCount: number, base = 1000, max = 10000): Promise<number> {
  const delay = Math.min(base * 2 ** (retryCount - 1), max);
  const jitter = Math.random() * 0.3 * delay;
  return delay + jitter;
}
```

### Error Handling

```typescript
private _handleError(error: AxiosError): Error {
  let errorCode: string | undefined;
  let message: string = error.message || 'Server error occurred';

  if (error.response) {
    const { status } = error.response;
    const data = error.response.data;

    errorCode = this.mapStatusToErrorCode(status);

    if (hasErrorMessage(data)) {
      message = data.error.message;
    } else if (hasMessage(data)) {
      message = data.message;
    }

    // Status-specific messages
    switch (status) {
      case 400:
        message = message || 'Invalid request data';
        break;
      case 401:
        message = message || 'Authentication required. Please login again.';
        break;
      case 403:
        message = message || 'You do not have permission to perform this action.';
        break;
      // ... more status codes
    }
  }

  // Attach error code to Error object
  const err = new Error(message);
  if (errorCode) {
    Object.defineProperty(err, 'error_code', {
      value: errorCode,
      enumerable: true,
    });
  }
  return err;
}
```

## 📂 Service Categories

### 1. Authentication Services

- **AuthService**: User authentication, registration, password management
- **Token management**: JWT handling, refresh logic

### 2. User Management Services

- **UserService**: Profile management, preferences
- **AdminService**: Administrative user operations

### 3. Content Services

- **CourseService**: Course CRUD, search, filtering
- **MediaService**: File upload/download, CDN integration

### 4. Commerce Services

- **PaymentService**: Multi-provider payment processing
- **OrderService**: Order lifecycle management
- **CartService**: Shopping cart operations
- **WalletService**: User balance management

### 5. Learning Services

- **EnrollmentService**: Course enrollment, progress tracking
- **CertificateService**: Certificate generation and management

### 6. Communication Services

- **MessagingService**: Real-time messaging
- **NotificationService**: Push notifications, email

### 7. Utility Services

- **WishlistService**: User wishlists
- **ReviewService**: Course reviews and ratings

## 🚨 Error Handling

### Service Error Types

```typescript
export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class NetworkError extends ServiceError {
  constructor(message: string = 'Network error occurred') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends ServiceError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}
```

### Error Recovery Patterns

```typescript
// Retry with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, shouldRetry = () => true } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries || !shouldRetry(error as Error)) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
```

## 🔐 Authentication

### Token Management

```typescript
// Client-side token getter
const getClientToken = () => store?.getState()?.auth?.token ?? null;

// Server-side token getter (SSR)
const getServerToken = (headers: Record<string, string>) =>
  headers.authorization?.replace('Bearer ', '') ?? null;

// Automatic token refresh
const authClientRefresh = async () => {
  const response = await store.dispatch(refreshToken());
  if (response.meta.requestStatus === 'rejected') {
    throw new Error('Token refresh failed');
  }
  return { token: response.payload.data.token };
};
```

### Service Authentication

```typescript
// Authenticated service instance
export const authService = new AuthService({
  getToken: getClientToken,
  authRefresh: authClientRefresh,
});

// SSR service instance
export const createServerAuthService = (headers: Record<string, string>) => {
  return new AuthService({
    getToken: () => getServerToken(headers),
    getHeaders: () => headers,
  });
};
```

## 🧪 Testing

### Service Testing Patterns

```typescript
// Mock service testing
describe('AuthService', () => {
  let service: AuthService;
  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    service = new AuthService({
      getToken: () => mockToken,
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockResponse = {
        success: true,
        data: { token: 'new-token', user: mockUser },
      };

      vi.mocked(service.client.post).mockResolvedValue({ data: mockResponse });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('new-token');
    });

    it('should handle login failure', async () => {
      const mockResponse = {
        success: false,
        message: 'Invalid credentials',
      };

      vi.mocked(service.client.post).mockResolvedValue({ data: mockResponse });

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong-password',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
```

### Integration Testing

```typescript
// API integration testing
describe('AuthService Integration', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService({
      baseURL: 'http://localhost:3001/api',
      getToken: () => process.env.TEST_TOKEN,
    });
  });

  describe('User Registration', () => {
    it('should register new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'securepassword',
        name: 'New User',
      };

      const result = await service.register(userData);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('userId');
    });

    it('should prevent duplicate registration', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password',
        name: 'Existing User',
      };

      await expect(service.register(userData)).rejects.toThrow();
    });
  });
});
```

## 📊 Service Metrics

### Performance Monitoring

```typescript
// Service performance tracking
class ServiceMetrics {
  private metrics = new Map<string, number[]>();

  recordRequest(service: string, method: string, duration: number) {
    const key = `${service}.${method}`;
    const times = this.metrics.get(key) || [];
    times.push(duration);
    this.metrics.set(key, times);
  }

  getAverageResponseTime(service: string, method: string): number {
    const key = `${service}.${method}`;
    const times = this.metrics.get(key) || [];
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getRequestCount(service: string, method: string): number {
    const key = `${service}.${method}`;
    return this.metrics.get(key)?.length || 0;
  }
}

// Usage in base service
const metrics = new ServiceMetrics();

this.client.interceptors.request.use((config) => {
  config.startTime = Date.now();
  return config;
});

this.client.interceptors.response.use((response) => {
  const duration = Date.now() - response.config.startTime;
  metrics.recordRequest(
    this.constructor.name,
    response.config.method?.toUpperCase() || 'GET',
    duration
  );
  return response;
});
```

### Error Tracking

```typescript
// Service error tracking
class ServiceErrorTracker {
  private errors = new Map<string, Error[]>();

  trackError(service: string, error: Error) {
    const serviceErrors = this.errors.get(service) || [];
    serviceErrors.push(error);
    this.errors.set(service, serviceErrors);

    // Send to error monitoring service
    this.reportError(service, error);
  }

  getErrorCount(service: string): number {
    return this.errors.get(service)?.length || 0;
  }

  getRecentErrors(service: string, limit = 10): Error[] {
    const serviceErrors = this.errors.get(service) || [];
    return serviceErrors.slice(-limit);
  }

  private reportError(service: string, error: Error) {
    // Send to Sentry, LogRocket, etc.
    console.error(`[${service}] Error:`, error);
  }
}
```

---

## 📚 Related Documentation

- [Architecture Overview](../architecture/README.md)
- [Auth Service](./auth-service.md)
- [Payment Service](./payment-service.md)
- [Course Service](./course-service.md)

---

<div align="center">

[⬅️ Architecture](../architecture/README.md) | [Auth Service →](./auth-service.md)

</div>
