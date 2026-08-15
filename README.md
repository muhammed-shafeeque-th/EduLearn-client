# EduLearn Client

[![Next.js](https://img.shields.io/badge/Next.js-15.3.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Modern, scalable, and production-ready learning platform frontend built with Next.js, TypeScript, and a cloud-native microservices backend.

![EduLearn Banner](docs/images/app-image-1.png)

## Overview

EduLearn Client is the primary web application for the EduLearn platform. It provides a responsive, accessible, and high-performance user experience for students, instructors, and administrators.

The application communicates with backend microservices through the API Gateway and supports server-side rendering, client-side rendering, dynamic routing, secure authentication, real-time updates, and integrated payment workflows.

The frontend follows a modular architecture with clear separation of concerns, reusable UI components, centralized state management, and scalable feature-based organization.

---

## Key Features

### Student Features

- User registration and authentication
- Course discovery and search
- Course enrollment
- Learning dashboard
- Wishlist management
- Shopping cart
- Checkout and payment
- Progress tracking
- Course reviews and ratings
- Profile management
- Wallet management

### Instructor Features

- Instructor onboarding
- Course creation
- Course management
- Student analytics
- Revenue tracking
- Profile management

### Administrative Features

- User management
- Instructor approval
- Course moderation
- Platform analytics
- Category management
- System monitoring

---

## Screenshots

### Landing Page

![Landing Page](docs/images/screenshots/home.png)

### Course Catalog

![Course Catalog](docs/images/screenshots/courses.png)

### Course Details

![Course Details](docs/images/screenshots/course-details.png)

### Learning Dashboard

![Dashboard](docs/images/screenshots/dashboard.png)

### Checkout & Payment

![Checkout](docs/images/screenshots/payment.png)

### Instructor Dashboard

![Instructor Dashboard](docs/images/screenshots/instructor-dashboard.png)

### Admin Dashboard

![Admin Dashboard](docs/images/screenshots/admin-dashboard.png)

---

## Architecture

### High-Level Architecture

```text
┌─────────────────────────────┐
│         Next.js App         │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│         API Gateway         │
└─────────────┬───────────────┘
              │
      ┌───────┼────────┐
      ▼       ▼        ▼
   Auth     User    Course
 Service   Service  Service

      ▼       ▼        ▼
   Order   Payment Notification
 Service  Service    Service

              ▼
           Chat
         Service
```

---

## Frontend Architecture

The client follows a feature-oriented architecture with reusable shared modules.

```text
src/
├── app/
├── components/
├── features/
├── hooks/
├── services/
├── store/
├── lib/
├── types/
├── providers/
└── utils/
```

### Architectural Principles

- Feature-based structure
- Reusable UI components
- Separation of business logic
- Strong typing with TypeScript
- SOLID-inspired frontend design
- Strategy Pattern where appropriate
- Server-first architecture
- Scalable state management

---

## Technology Stack

| Category         | Technology       |
| ---------------- | ---------------- |
| Framework        | Next.js 15+      |
| Language         | TypeScript       |
| UI Components    | shadcn/ui        |
| Styling          | Tailwind CSS     |
| Forms            | React Hook Form  |
| Validation       | Zod              |
| State Management | Redux Toolkit    |
| Server State     | TanStack Query   |
| Tables           | TanStack Table   |
| State Machines   | XState           |
| HTTP Client      | Axios            |
| Authentication   | JWT              |
| Payments         | Stripe, Razorpay |
| Realtime         | WebSocket        |
| Deployment       | Vercel           |
| Monitoring       | OpenTelemetry    |

---

## Routing Strategy

### Server-Side Rendering (SSR)

Used for:

- Landing pages
- Course pages
- SEO-sensitive content
- Marketing pages

### Client-Side Rendering (CSR)

Used for:

- Dashboards
- Settings pages
- User interactions
- Real-time features

### Parallel Routing

Used for:

- Dashboard layouts
- Multi-pane interfaces
- Complex application workflows

---

## State Management

### Redux Toolkit

Used for:

- Authentication state
- User session state
- UI preferences
- Global application state

### TanStack Query

Used for:

- API data fetching
- Request caching
- Background synchronization
- Optimistic updates

### XState

Used for:

- Checkout workflow
- Order lifecycle
- Complex user flows

---

## Authentication Architecture

### Authentication Flow

```text
User
 │
 ▼
Login Page
 │
 ▼
API Gateway
 │
 ▼
Auth Service
 │
 ▼
JWT Access Token
 │
 ▼
Secure Session
```

### Features

- JWT authentication
- Refresh token flow
- Role-based access control
- Route protection
- Session persistence
- Secure logout

---

## Payment Architecture

### Supported Providers

- Stripe
- Razorpay

### Design Pattern

Payment integrations use the Strategy Pattern to allow multiple payment providers without modifying business logic.

```text
Payment Strategy
├── Stripe Strategy
└── Razorpay Strategy
```

---

## Backend Integration

The frontend communicates exclusively through the API Gateway.

### Connected Services

| Service              | Purpose             |
| -------------------- | ------------------- |
| API Gateway          | Backend entry point |
| Auth Service         | Authentication      |
| User Service         | User management     |
| Course Service       | Course management   |
| Order Service        | Order processing    |
| Payment Service      | Payments            |
| Notification Service | Notifications       |
| Chat Service         | Realtime messaging  |

---

## SEO Strategy

The application is optimized for search engines and AI-powered search platforms.

### SEO Features

- Server-side rendering
- Metadata generation
- Structured data
- Open Graph tags
- Twitter Cards
- Sitemap generation
- Robots configuration
- Canonical URLs

### AI Search Optimization

- Semantic HTML
- Structured content
- Rich metadata
- Accessible markup
- Knowledge graph-friendly pages

---

## Performance Optimizations

### Frontend

- Code splitting
- Dynamic imports
- Route-based chunking
- Image optimization
- Font optimization
- Suspense boundaries
- Streaming SSR

### Data Layer

- Query caching
- Request deduplication
- Optimistic updates
- Lazy loading

### Rendering

- Server Components
- Partial hydration
- Incremental rendering

---

## Security

### Application Security

- Secure JWT handling
- Route authorization
- Input validation with Zod
- XSS protection
- CSRF mitigation
- Secure HTTP headers
- Content Security Policy

### Platform Security

- API Gateway protection
- HTTPS enforcement
- Secure cookie policies
- Least privilege access

---

## Observability

The client participates in the platform-wide observability architecture.

### Logging

- Structured client logs
- Error tracking
- Request diagnostics

### Metrics

- Performance monitoring
- Web Vitals
- Page load metrics

### Tracing

- OpenTelemetry browser instrumentation
- Distributed tracing propagation
- Request correlation

### Platform Monitoring

```text
Client
  │
  ▼
OpenTelemetry
  │
  ▼
OTEL Collector
  │
  ▼
Tempo
  │
  ▼
Grafana
```

---

## Deployment

### Production Deployment

| Component     | Platform |
| ------------- | -------- |
| Frontend      | Vercel   |
| API Gateway   | AWS EKS  |
| Microservices | AWS EKS  |
| Storage       | AWS S3   |
| DNS           | Route53  |

### Deployment Flow

```text
GitHub
   │
   ▼
GitHub Actions
   │
   ▼
Build & Test
   │
   ▼
Vercel Deployment
   │
   ▼
Production
```

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_NOTIFICATION_WS_URL=
NEXT_PUBLIC_CHAT_WS_URL=

STRIPE_PUBLISHABLE_KEY=
RAZORPAY_KEY_ID=

NEXT_PUBLIC_APP_URL=
```

---

## Development

### Install Dependencies

```bash
yarn install
```

### Start Development Server

```bash
yarn dev
```

### Run Tests

```bash
yarn test
```

### Build Production

```bash
yarn build
```

---

# Related Repositories

| Repository                                                                                          | Description                                                   |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [edulearn-platform](https://github.com/muhammed-shafeeque-th/edulearn-platform)                     | Platform orchestration repository                             |
| [edulearn-api-gateway](https://github.com/muhammed-shafeeque-th/edulearn-api-gateawy)               | API Gateway                                                   |
| [edulearn-user-service](https://github.com/muhammed-shafeeque-th/edulearn-user-srv)                 | User profile service                                          |
| [edulearn-course-service](https://github.com/muhammed-shafeeque-th/edulearn-course-srv)             | Course management service                                     |
| [edulearn-payment-service](https://github.com/muhammed-shafeeque-th/edulearn-payment-srv)           | Payment processing service                                    |
| [edulearn-auth-service](https://github.com/muhammed-shafeeque-th/edulearn-auth-srv)                 | Authentication service                                        |
| [edulearn-order-service](https://github.com/muhammed-shafeeque-th/edulearn-order-srv)               | Order management service                                      |
| [edulearn-notification-service](https://github.com/muhammed-shafeeque-th/edulearn-notification-srv) | Notification service                                          |
| [edulearn-auth-service](https://github.com/muhammed-shafeeque-th/edulearn-auth-srv)                 | Authentication service                                        |
| [@edulearn/core](https://github.com/muhammed-shafeeque-th/edulearn-core)                            | Shared logging, metrics, tracing, Redis, Kafka, health checks |
| [@edulearn/nest](https://github.com/muhammed-shafeeque-th/edulearn-nest)                            | Shared NestJS infrastructure package                          |

---

## Documentation

Additional documentation is available in:

```text
docs/
├── architecture.md
├── frontend-architecture.md
├── authentication.md
├── payment-flow.md
├── deployment.md
├── observability.md
└── security.md
```

---

## License

This project is licensed under the MIT [License](./LICENSE).
