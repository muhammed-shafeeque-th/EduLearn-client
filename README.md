# 🎓 EduLearn - Modern E-Learning Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.3.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **EduLearn** is a comprehensive, enterprise-grade e-learning platform built with modern web technologies. Join 25,000+ learners accessing 2,400+ high-quality courses across various categories including Development, Design, Marketing, and more.

![EduLearn Platform](https://via.placeholder.com/1200x600/6366f1/ffffff?text=EduLearn+Platform+Screenshot)

## 🌟 Key Features

### 🎓 Learning Management System (LMS)

- **Course Creation & Management**: Rich course builder with sections, lessons, quizzes, and assignments
- **Multi-format Content**: Support for video, documents, slides, audio, and interactive content
- **Progress Tracking**: Detailed learning progress with completion percentages and time tracking
- **Certificate Generation**: Automated certificate generation with PDF export
- **Course Reviews & Ratings**: Comprehensive review system with ratings and feedback

### 👥 Multi-Role Architecture

- **Students**: Course enrollment, progress tracking, certificates, messaging
- **Instructors**: Course creation, student management, revenue analytics, messaging
- **Administrators**: Platform management, user administration, analytics dashboard

### 💬 Real-Time Communication

- **Instant Messaging**: Real-time chat between students and instructors
- **Typing Indicators**: Live typing status and online presence
- **Message Reactions**: Emoji reactions and message threading
- **File Sharing**: Support for various file types in chats
- **Push Notifications**: Real-time notifications for messages and activities

### 💳 Payment Integration

- **Multiple Providers**: Stripe, PayPal, and Razorpay integration
- **Flexible Pricing**: Support for one-time and subscription payments
- **Order Management**: Complete order lifecycle management
- **Refunds & Disputes**: Automated refund processing and dispute handling

### 📊 Advanced Analytics

- **Real-Time Tracking**: Comprehensive event tracking with offline support
- **Performance Metrics**: Core Web Vitals, page load times, user engagement
- **Video Analytics**: Playback tracking, completion rates, watch time
- **GDPR Compliant**: Privacy-focused analytics with consent management
- **Custom Dashboards**: Instructor and admin analytics dashboards

### 🔒 Security & Authentication

- **OAuth Integration**: Google, Facebook, and custom authentication
- **JWT Tokens**: Secure token-based authentication with refresh tokens
- **Role-Based Access**: Granular permissions for different user types
- **Two-Factor Authentication**: Enhanced security with 2FA support

## 🏗️ Architecture

### Tech Stack

#### Frontend Framework

- **Next.js 15.3.0** - React framework with App Router
- **React 19.0.0** - Latest React with concurrent features
- **TypeScript 5.0** - Type-safe JavaScript

#### UI & Styling

- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **Lucide React** - Beautiful icon library
- **Framer Motion** - Animation library

#### State Management

- **Redux Toolkit** - Global state management
- **React Query** - Server state management with caching
- **XState** - State machines for complex workflows

#### Real-Time Features

- **Socket.IO** - Real-time bidirectional communication
- **WebSocket** - Low-latency messaging and notifications

#### Payment Integration

- **Stripe** - Payment processing
- **PayPal** - PayPal payments
- **Razorpay** - Indian payment gateway

#### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Commitlint** - Conventional commits

### 📁 Complete Project Structure

```
📦 EduLearn-client/
├── 📂 src/                          # Main application source
│   ├── 📂 app/                      # Next.js App Router
│   │   ├── 📂 (common)/             # Public routes (no auth required)
│   │   │   ├── 📂 (protected)/      # Protected routes (auth required)
│   │   │   │   ├── 📂 cart/         # Shopping cart pages
│   │   │   │   ├── 📂 checkout/     # Checkout process
│   │   │   │   ├── 📂 learn/        # Learning platform
│   │   │   │   │   └── 📂 [enrollmentId]/ # Dynamic enrollment routes
│   │   │   │   ├── 📂 notifications/ # User notifications
│   │   │   │   ├── 📂 payment/      # Payment processing
│   │   │   │   ├── 📂 profile/      # User profile management
│   │   │   │   └── 📂 wishlist/     # User wishlists
│   │   │   ├── 📂 auth/             # Authentication pages
│   │   │   │   ├── 📂 forgot-password/ # Password recovery
│   │   │   │   ├── 📂 login/        # User login
│   │   │   │   ├── 📂 register/     # User registration
│   │   │   │   ├── 📂 reset-password/ # Password reset
│   │   │   │   └── 📂 verify/       # Email verification
│   │   │   ├── 📂 become-instructor/ # Instructor application
│   │   │   ├── 📂 courses/          # Course browsing & details
│   │   │   │   └── 📂 [slug]/       # Individual course pages
│   │   │   ├── 📂 faq/              # Frequently asked questions
│   │   │   ├── 📂 instructors/      # Instructor directory
│   │   │   │   └── 📂 [id]/         # Individual instructor profiles
│   │   │   └── page.tsx             # Landing page
│   │   ├── 📂 _/                     # Shared layout components
│   │   │   ├── 📂 footer/           # Site footer
│   │   │   ├── 📂 header/           # Site header components
│   │   │   └── 📂 not-found/        # 404 error pages
│   │   ├── 📂 admin/                # Admin panel (role-based)
│   │   │   ├── 📂 (protected)/      # Admin protected routes
│   │   │   │   ├── 📂 categories/   # Category management
│   │   │   │   ├── 📂 instructors/  # Instructor management
│   │   │   │   └── 📂 users/        # User administration
│   │   │   └── 📂 auth/             # Admin authentication
│   │   ├── 📂 api/                  # API route handlers
│   │   │   ├── 📂 __instructor/     # Instructor API routes
│   │   │   ├── 📂 __instructors/    # Instructors API routes
│   │   │   ├── 📂 __notifications/  # Notifications API
│   │   │   ├── 📂 __payments/       # Payment processing APIs
│   │   │   └── 📂 auth/             # Authentication APIs
│   │   ├── 📂 instructor/           # Instructor dashboard
│   │   │   ├── 📂 __messages/       # Instructor messaging
│   │   │   ├── 📂 __settings/       # Instructor settings
│   │   │   ├── 📂 courses/          # Course management
│   │   │   │   ├── 📂 [id]/         # Individual course editing
│   │   │   │   │   ├── 📂 analytics/ # Course analytics
│   │   │   │   │   └── 📂 edit/      # Course editing interface
│   │   │   │   └── 📂 create/       # Course creation wizard
│   │   │   └── 📂 revenue/          # Revenue analytics
│   │   ├── error.tsx                # Global error boundary
│   │   ├── globals.css              # Global styles
│   │   ├── layout.tsx               # Root layout
│   │   ├── loading.tsx              # Global loading states
│   │   ├── not-found.tsx            # 404 error page
│   │   ├── robots.ts                # SEO robots configuration
│   │   └── sitemap.ts               # SEO sitemap generation
│   ├── 📂 components/               # Reusable UI components
│   │   ├── error-boundary.tsx      # React error boundaries
│   │   ├── 📂 icons/               # Custom icon components
│   │   ├── 📂 one-tap/             # Google One Tap components
│   │   ├── 📂 profile/             # Profile-related components
│   │   ├── 📂 shared/              # Shared/common components
│   │   └── 📂 ui/                  # Base UI component library (Radix UI)
│   ├── 📂 hooks/                   # Custom React hooks
│   │   ├── use-analytics.ts        # Analytics hooks
│   │   ├── use-auth.ts             # Authentication hooks
│   │   ├── use-cart.ts             # Shopping cart hooks
│   │   └── use-messaging.ts        # Real-time messaging hooks
│   ├── 📂 lib/                     # Utility libraries & configurations
│   │   ├── 📂 auth/                # Authentication utilities
│   │   │   ├── auth-client-apis.ts # Client-side auth APIs
│   │   │   ├── auth-config.ts      # Authentication configuration
│   │   │   └── auth-utils.ts       # Authentication helpers
│   │   ├── 📂 config/              # Application configuration
│   │   │   ├── analytics-config.ts # Analytics settings
│   │   │   └── one-tap-config.ts   # Google One Tap config
│   │   ├── 📂 constants/           # Application constants
│   │   │   ├── auth-constants.ts  # Authentication constants
│   │   │   └── ui-constants.ts     # UI-related constants
│   │   ├── 📂 machines/            # XState state machines
│   │   │   └── order-machine.ts    # Order/payment state machine
│   │   ├── 📂 providers/           # React context providers
│   │   │   ├── auth-session-provider.tsx # Auth session context
│   │   │   ├── one-tap-provider.tsx # Google One Tap provider
│   │   │   └── theme-provider.tsx  # Theme context provider
│   │   ├── 📂 react-query/         # React Query configuration
│   │   │   ├── query-client.ts     # Query client setup
│   │   │   └── query-keys.ts       # Query key constants
│   │   ├── 📂 server-apis/         # Server-side API clients
│   │   │   ├── admin.service.ts    # Admin API client
│   │   │   ├── auth.service.ts     # Authentication API client
│   │   │   └── user.service.ts     # User API client
│   │   ├── 📂 utils/               # General utilities
│   │   │   ├── currency-utils.ts   # Currency formatting
│   │   │   ├── date-utils.ts       # Date manipulation
│   │   │   └── validation-utils.ts # Form validation
│   │   ├── providers.tsx           # Main provider composition
│   │   ├── toast.tsx               # Toast notification system
│   │   └── utils.ts                # General utility functions
│   ├── 📂 services/                # Service layer (API clients)
│   │   ├── admin.service.ts        # Admin operations service
│   │   ├── auth.service.ts         # Authentication service
│   │   ├── cart.service.ts         # Shopping cart service
│   │   ├── course.service.ts       # Course management service
│   │   ├── enrollment.service.ts   # Course enrollment service
│   │   ├── instructor.service.ts   # Instructor management service
│   │   ├── media.service.ts        # Media upload/download service
│   │   ├── messaging.service.ts    # Messaging service
│   │   ├── notification.service.ts # Notification service
│   │   ├── order.service.ts        # Order management service
│   │   ├── payment.service.ts      # Payment processing service
│   │   ├── user.service.ts         # User management service
│   │   ├── wallet.service.ts       # User wallet service
│   │   ├── wishlist.service.ts     # Wishlist management service
│   │   ├── 📂 ws/                  # WebSocket services
│   │   │   ├── 📂 chat/            # Real-time chat service
│   │   │   │   ├── hooks/          # Chat React hooks
│   │   │   │   ├── socket.service.ts # Socket.IO service
│   │   │   │   └── utils/          # Chat utilities
│   │   │   └── 📂 notification/    # Real-time notifications
│   │   │       ├── hooks/          # Notification hooks
│   │   │       └── notification-websocket.manager.ts
│   │   └── server-service-clients.ts # Server API clients
│   ├── 📂 states/                  # State management
│   │   ├── 📂 client/              # Client-side state (Redux)
│   │   │   ├── slices/             # Redux slices
│   │   │   │   ├── auth-slice.ts   # Authentication state
│   │   │   │   ├── cart-slice.ts   # Shopping cart state
│   │   │   │   └── user-slice.ts   # User profile state
│   │   │   └── store.ts            # Redux store configuration
│   │   └── 📂 server/              # Server-side state
│   │       └── server-state.ts     # Server state management
│   ├── 📂 types/                   # TypeScript type definitions
│   │   ├── api-error.type.ts       # API error types
│   │   ├── api-response.ts         # API response types
│   │   ├── 📂 auth/                # Authentication types
│   │   ├── 📂 cart/                # Shopping cart types
│   │   ├── 📂 checkout/            # Checkout process types
│   │   ├── 📂 course/              # Course-related types
│   │   ├── 📂 enrollment/          # Enrollment types
│   │   ├── 📂 messaging/           # Messaging types
│   │   ├── 📂 notification/        # Notification types
│   │   ├── 📂 order/               # Order types
│   │   ├── 📂 review/              # Review types
│   │   ├── 📂 user/                # User types
│   │   ├── 📂 wallet/              # Wallet types
│   │   ├── 📂 wishlist/            # Wishlist types
│   │   └── css.d.ts                # CSS module types
│   └── middleware.ts               # Next.js middleware
├── 📂 public/                      # Static assets
│   ├── 📂 fonts/                   # Custom fonts
│   ├── 📂 instructors/             # Instructor images
│   └── 📂 sounds/                  # Audio files
├── 📂 _.husky/                     # Git hooks (Husky)
│   ├── _/                          # Husky internal files
│   ├── commit-msg                  # Commit message validation
│   ├── pre-commit                  # Pre-commit checks
│   └── pre-push                    # Pre-push validation
├── 📄 .eslintrc.mjs               # ESLint configuration
├── 📄 .prettierrc                 # Prettier configuration
├── 📄 components.json             # Component library config
├── 📄 commitlint.config.js        # Commit linting rules
├── 📄 docker-compose.yaml         # Docker composition
├── 📄 eslint.config.mjs           # ESLint configuration
├── 📄 instrumentation.ts          # OpenTelemetry setup
├── 📄 next-env.d.ts               # Next.js type definitions
├── 📄 next.config.ts              # Next.js configuration
├── 📄 otel-collector-config.yaml  # OpenTelemetry collector
├── 📄 package.json                # Dependencies & scripts
├── 📄 postcss.config.mjs          # PostCSS configuration
├── 📄 prometheus.yaml             # Prometheus monitoring
├── 📄 tailwind.config.ts          # Tailwind CSS config
├── 📄 tsconfig.json               # TypeScript configuration
├── 📄 tsconfig.prod.json          # Production TypeScript config
└── 📄 yarn.lock                   # Yarn lockfile
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 or **yarn** >= 1.22.0
- **Git** for version control

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/edulearn.git
   cd edulearn/client
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env.local
   ```

   Configure the following environment variables:

   ```env
   # Authentication
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:9000

   # OAuth Providers
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Payment Providers
   STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   PAYPAL_CLIENT_ID=your-paypal-client-id
   PAYPAL_CLIENT_SECRET=your-paypal-client-secret

   # Analytics
   ANALYTICS_API_KEY=your-analytics-api-key

   # WebSocket
   WS_URL=ws://localhost:3001

   # External APIs (Backend Services)
   API_BASE_URL=https://api.edulearn.com
   DATABASE_URL=your-database-connection-string
   ```

4. **Initialize Husky**

   ```bash
   npx husky install
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:9000](http://localhost:9000) to view the application.

## 📖 Usage Guide

### For Students

1. **Browse Courses**
   - Explore courses by category, instructor, or popularity
   - Read course descriptions, reviews, and instructor profiles
   - Preview course content before enrollment

2. **Enroll in Courses**
   - Add courses to cart or wishlist
   - Complete secure checkout with multiple payment options
   - Access enrolled courses from your dashboard

3. **Learn & Progress**
   - Watch video lessons with progress tracking
   - Complete quizzes and assignments
   - Download course materials and resources
   - Track learning progress and completion status

4. **Earn Certificates**
   - Complete course requirements to unlock certificates
   - Download and share certificates on social media
   - Build your learning portfolio

5. **Communicate**
   - Message instructors for course-related questions
   - Join study groups and discussions
   - Receive notifications for important updates

### For Instructors

1. **Create Courses**
   - Use the intuitive course builder interface
   - Add sections, lessons, quizzes, and assignments
   - Upload various content types (video, documents, etc.)

2. **Manage Content**
   - Organize content with drag-and-drop interface
   - Set prerequisites and learning objectives
   - Update course content and pricing

3. **Student Management**
   - View enrolled students and their progress
   - Communicate with students via messaging
   - Provide feedback on assignments and quizzes

4. **Analytics & Revenue**
   - Track course performance and student engagement
   - Monitor revenue and earnings
   - Analyze course completion rates and ratings

### For Administrators

1. **User Management**
   - Manage all users (students, instructors, admins)
   - Handle user roles and permissions
   - Monitor user activity and engagement

2. **Content Moderation**
   - Review and approve instructor applications
   - Moderate course content and reviews
   - Manage categories and course classifications

3. **Platform Analytics**
   - View comprehensive platform metrics
   - Generate reports and insights
   - Monitor system performance and usage

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript type checking

# Testing
npm run test         # Run Jest tests
npm run test:ci      # Run tests in CI mode

# Utilities
npm run validate     # Run all validation checks
```

### Code Quality

This project uses several tools to maintain code quality:

- **ESLint**: Linting with Next.js and React rules
- **Prettier**: Code formatting with consistent style
- **TypeScript**: Type checking with strict mode
- **Husky**: Pre-commit hooks for quality checks
- **Commitlint**: Conventional commit messages

### Testing Strategy

```typescript
// Example test structure
describe('CourseEnrollment', () => {
  it('should enroll student in course', async () => {
    // Test implementation
  });

  it('should track progress correctly', async () => {
    // Test implementation
  });
});
```

## 🌐 API Reference

### Authentication Endpoints

```typescript
// Login
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "password"
}

// OAuth Login
GET /api/auth/google
GET /api/auth/facebook

// Refresh Token
POST /api/auth/refresh
```

### Course Management

```typescript
// Get courses
GET /api/courses?category=development&page=1

// Create course (Instructor only)
POST /api/courses
{
  "title": "React Masterclass",
  "description": "Learn React from basics to advanced",
  "price": 99.99
}

// Update course
PUT /api/courses/{courseId}

// Delete course
DELETE /api/courses/{courseId}
```

### Payment Integration

```typescript
// Create payment intent
POST /api/payments/stripe/create-intent
{
  "amount": 9999,
  "currency": "usd",
  "courseId": "course-123"
}

// PayPal order creation
POST /api/payments/paypal/create-order

// Razorpay order creation
POST /api/payments/razorpay/create-order
```

### Real-Time Messaging

```typescript
// WebSocket connection
const socket = io('/chat');

// Join chat
socket.emit('join:chat', { chatId });

// Send message
socket.emit('send:message', {
  content: 'Hello!',
  chatId: 'conv-123',
});

// Listen for messages
socket.on('message:new', (message) => {
  console.log('New message:', message);
});
```

## 🔐 Security Features

### Authentication & Authorization

- JWT-based authentication with refresh tokens
- OAuth 2.0 integration (Google, Facebook)
- Role-based access control (RBAC)
- Two-factor authentication support
- Secure password hashing with bcrypt

### Data Protection

- HTTPS encryption for all communications
- Sensitive data encryption at rest
- GDPR compliance for EU users
- Data anonymization and privacy controls

### API Security

- Rate limiting and DDoS protection
- Input validation and sanitization
- SQL injection prevention
- XSS and CSRF protection

## 📊 Analytics & Monitoring

### Built-in Analytics

- **User Behavior Tracking**: Page views, clicks, scroll depth
- **Performance Monitoring**: Core Web Vitals, load times
- **Video Analytics**: Playback events, completion rates
- **E-commerce Tracking**: Purchase funnel, conversion rates
- **Error Tracking**: JavaScript errors, API failures

### Monitoring Tools

- **OpenTelemetry**: Distributed tracing and metrics
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Dashboard visualization
- **Sentry**: Error tracking and performance monitoring

## 🚀 Deployment

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build application
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

COPY --from=base /app/package*.json ./
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public

EXPOSE 9000
CMD ["npm", "start"]
```

### Environment Configuration

```yaml
# docker-compose.yml
version: '3.8'
services:
  edulearn:
    build: .
    ports:
      - '9000:9000'
    environment:
      - NODE_ENV=production
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - DATABASE_URL=${DATABASE_URL}
    volumes:
      - ./logs:/app/logs
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:ci
      - name: Build application
        run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR
- Use conventional commit messages

### Code Review Process

1. Automated checks (linting, tests, type checking)
2. Peer code review
3. QA testing
4. Product approval (for major features)
5. Merge to main branch

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for hosting and deployment platform
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **All Contributors** who help make EduLearn better

## 📞 Support

- **Documentation**: [docs.edulearn.com](https://docs.edulearn.com)
- **Issue Tracker**: [GitHub Issues](https://github.com/your-org/edulearn/issues)
- **Discussion Forum**: [Community Forum](https://community.edulearn.com)
- **Email Support**: support@edulearn.com

---

<div align="center">

**Built with ❤️ for learners worldwide**

[🌐 Website](https://edulearn.vercel.app) • [📚 Documentation](https://docs.edulearn.com) • [🐛 Report Bug](https://github.com/your-org/edulearn/issues) • [✨ Request Feature](https://github.com/your-org/edulearn/issues/new)

</div>
