import { assign, fromPromise, log, setup, type AnyEventObject } from 'xstate';

import type { Order, PlaceOrderPayload } from '@/types/order';
import { paymentService, type PaymentProvider } from '@/services/payment.service';
import { pollUntil } from '../utils/poll';
import { orderService } from '@/services/order.service';

type Provider = PaymentProvider;

export interface PaypalSession {
  orderId: string;
  /** PayPal redirect URL */
  approvalLink: string;
  currency: string;
  amount: number;
}

export interface RazorpaySession {
  orderId: string;
  keyId: string;
  amount: number;
  currency: string;
}

export interface StripeSession {
  sessionId: string;
  publicKey: string;
  clientSecret: string;
  /** Stripe hosted checkout URL (optional) */
  url: string;
  currency: string;
  amount: number;
}

type PaymentSessionMeta = {
  paymentId: string;
  status: string;
  userId: string;
  userDetails?: {
    email?: string;
    name?: string;
  };
};

type ProviderSessionResult =
  | ({ provider: 'stripe'; stripe: StripeSession } & PaymentSessionMeta)
  | ({ provider: 'paypal'; paypal: PaypalSession } & PaymentSessionMeta)
  | ({ provider: 'razorpay'; razorpay: RazorpaySession } & PaymentSessionMeta);

export interface RazorpayPaymentProof {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}
export interface StripePaymentProof {
  sessionId: string;
}
export interface PaypalPaymentProof {
  orderId: string;
}

export type PaymentProof =
  | { stripe: StripePaymentProof; razorpay?: undefined; paypal?: undefined }
  | { stripe?: undefined; razorpay: RazorpayPaymentProof; paypal?: undefined }
  | { stripe?: undefined; razorpay?: undefined; paypal: PaypalPaymentProof };

interface Context {
  order: Order | null;
  provider: Provider | null;
  providerSession: ProviderSessionResult | null;
  error: string | null;

  successUrl: string | null;
  cancelUrl: string | null;
  proof: PaymentProof | null;
}

type SelectProviderEvent = { type: 'SELECT_PROVIDER'; provider: Provider };
type CreateOrderEvent = { type: 'CREATE_ORDER'; payload: PlaceOrderPayload };
type CreateProviderSessionEvent = {
  type: 'CREATE_PROVIDER_SESSION';
  payload?: { successUrl?: string; cancelUrl?: string };
};
type TriggerProviderUIEvent = { type: 'TRIGGER_PROVIDER_UI' };
type PaymentConfirmedEvent = { type: 'PAYMENT_CONFIRMED_CLIENT'; proof?: PaymentProof };
type RetryEvent = { type: 'RETRY' };
type CancelEvent = { type: 'CANCEL' };
type HydrateOrderEvent = { type: 'HYDRATE_ORDER'; order: Order; provider?: Provider | null };

type Events =
  | SelectProviderEvent
  | CreateOrderEvent
  | CreateProviderSessionEvent
  | TriggerProviderUIEvent
  | PaymentConfirmedEvent
  | RetryEvent
  | CancelEvent
  | HydrateOrderEvent;

type ProviderSessionResponse = {
  userId: string;
  paymentId: string;
  status: string;
  stripe?: StripeSession;
  paypal?: PaypalSession;
  razorpay?: RazorpaySession;
  userDetails?: {
    email: string;
    name: string;
  };
};

type CreateOrderInput = {
  payload: PlaceOrderPayload;
};
type CreateProviderSessionInput = {
  order: Order;
  provider: Provider;
  successUrl: string | null;
  cancelUrl: string | null;
};
type ResolvePaymentInput = {
  provider: Provider | null;
  providerSession: ProviderSessionResult | null;
  order: Order | null;
  proof?: PaymentProof;
};
type CancelPaymentInput = {
  provider: Provider | null;
  providerSession: ProviderSessionResult | null;
  proof?: PaymentProof;
};
type PollOrderStatusInput = {
  orderId: string;
};

const extractErrorMessage = (value: unknown, fallback: string): string => {
  if (value instanceof Error) return value.message;
  if (typeof value === 'string') return value;
  return fallback;
};

const isSelectProviderEvent = (event: AnyEventObject): event is SelectProviderEvent =>
  event.type === 'SELECT_PROVIDER';

const orderMachineSetup = setup({
  types: {
    context: {} as Context,
    events: {} as Events,
  },
  actions: {
    logAction: log(({ context, event }) => {
      console.debug('[OrderMachine LOG]', { context, event });
      return { context, event };
    }, 'OrderMachine Event'),

    setProvider: assign(({ event }) => {
      if (!isSelectProviderEvent(event)) return {};
      return {
        provider: event.provider,
        error: null,
        providerSession: null,
      } satisfies Partial<Context>;
    }),
    clearError: assign(() => ({
      error: null,
    })),

    prepareProviderSession: assign(({ context, event }) => {
      if (event.type !== 'CREATE_PROVIDER_SESSION') return {};
      return {
        successUrl: event.payload?.successUrl ?? context.successUrl,
        cancelUrl: event.payload?.cancelUrl ?? context.cancelUrl,
      } satisfies Partial<Context>;
    }),

    setOrder: assign(({ event }) => {
      if (!('output' in event) || !event.output) return {};
      return {
        order: event.output as Order,
        providerSession: null,
      } satisfies Partial<Context>;
    }),

    setProviderSession: assign(({ event }) => {
      if (!('output' in event) || !event.output) return {};
      return {
        providerSession: event.output as ProviderSessionResult,
        error: null,
      } satisfies Partial<Context>;
    }),

    hydrateOrder: assign(({ event, context }) => {
      if (event.type !== 'HYDRATE_ORDER') return {};
      const providerCandidate =
        event.provider ?? event.order.paymentDetails?.provider ?? context.provider;
      const provider =
        providerCandidate && ['stripe', 'paypal', 'razorpay'].includes(providerCandidate as string)
          ? (providerCandidate as Provider)
          : null;
      return {
        order: event.order,
        providerSession: null,
        error: null,
        provider,
      } satisfies Partial<Context>;
    }),

    storeProof: assign(({ event }) => {
      if (event.type !== 'PAYMENT_CONFIRMED_CLIENT' || !event.proof) return {};
      return {
        proof: event.proof,
        error: null,
      } satisfies Partial<Context>;
    }),

    assignError: assign(({ event }, params: { fallback: string }) => ({
      error: extractErrorMessage(
        'data' in event && event.data
          ? event.data
          : 'error' in event && event.error
            ? event.error
            : 'output' in event && event.output
              ? event.output
              : event,
        params.fallback
      ),
    })),
  },
  guards: {
    canCreateProviderSession: ({ context }) => {
      return context.order !== null && context.provider !== null;
    },

    canRetryProviderSession: ({ context }) =>
      context.order !== null && context.provider !== null && context.providerSession !== null,
  },
  actors: {
    createOrder: fromPromise(async ({ input }) => {
      const { payload } = input as CreateOrderInput;
      const response = await orderService.placeOrder(payload, { timeout: 45_000 });
      if (!response.success || !response.data)
        throw new Error(response.message ?? 'Order creation failed');
      return response.data;
    }),

    createProviderSession: fromPromise(async ({ input }) => {
      const { order, provider, successUrl, cancelUrl } = input as CreateProviderSessionInput;
      const response = await paymentService.createPayment(
        {
          orderId: order.id,
          provider,
          successUrl: successUrl ?? undefined,
          cancelUrl: cancelUrl ?? undefined,
        },
        { timeout: 60_000 }
      );
      if (!response.success || !response.data)
        throw new Error('Something went wrong!. failed to create payment session');
      const session = response.data as ProviderSessionResponse;
      switch (provider) {
        case 'stripe': {
          const stripe = session.stripe;
          if (!stripe?.sessionId && !stripe?.clientSecret)
            throw new Error('Stripe Session Id missing in response');
          return {
            provider: 'stripe',
            stripe,
            paymentId: session.paymentId,
            status: session.status,
            userId: session.userId,
            userDetails: {
              email: session.userDetails?.email,
              name: session.userDetails?.name,
            },
          } satisfies ProviderSessionResult;
        }
        case 'paypal': {
          const paypal = session.paypal;
          if (!paypal?.orderId) throw new Error('PayPal order id missing in response');
          return {
            provider: 'paypal',
            paypal,
            paymentId: session.paymentId,
            status: session.status,
            userId: session.userId,
            userDetails: {
              email: session.userDetails?.email,
              name: session.userDetails?.name,
            },
          } satisfies ProviderSessionResult;
        }
        case 'razorpay': {
          const razorpay = session.razorpay;
          if (!razorpay?.keyId || !razorpay?.orderId)
            throw new Error('Razorpay order id missing in response');
          return {
            provider: 'razorpay',
            razorpay,
            paymentId: session.paymentId,
            status: session.status,
            userId: session.userId,
            userDetails: {
              email: session.userDetails?.email,
              name: session.userDetails?.name,
            },
          } as ProviderSessionResult;
        }
        default:
          throw new Error(`Unsupported provider ${provider}`);
      }
    }),

    resolvePayment: fromPromise(async ({ input }) => {
      const { provider, providerSession, proof } = input as ResolvePaymentInput;
      if (!provider || !providerSession) return { ok: true };
      if (
        provider === 'razorpay' &&
        (!proof?.razorpay?.razorpayPaymentId ||
          !proof?.razorpay?.razorpayOrderId ||
          !proof.razorpay.razorpaySignature)
      ) {
        throw new Error('Invalid payload for razorpay verify request');
      }
      if (provider === 'paypal' && !proof?.paypal?.orderId) {
        throw new Error('Invalid payload for paypal verify request');
      }
      if (provider === 'stripe') {
        throw new Error('Invalid payload for stripe verify request');
        if (proof?.stripe) {
          delete proof?.stripe;
        }
      }
      const resolved = await paymentService.resolvePayment({
        provider,
        ...proof,
      });
      if (!resolved.success) throw new Error(resolved.message ?? 'Payment resolve failed');
      return resolved.data;
    }),
    cancelOrderPayment: fromPromise(async ({ input }) => {
      const { provider, providerSession, proof } = input as CancelPaymentInput;
      if (!provider || !providerSession) return { ok: true };

      let providerOrderId: string | undefined;

      if (provider === 'razorpay' && providerSession.provider === 'razorpay') {
        providerOrderId = proof?.razorpay?.razorpayPaymentId;
        if (!providerOrderId) {
          throw new Error('Missing providerOrderId for Razorpay cancellation');
        }
      } else if (provider === 'paypal') {
        providerOrderId = proof?.paypal?.orderId;
        if (!providerOrderId) {
          throw new Error('Invalid payload for paypal verify request');
        }
      } else if (provider === 'stripe') {
        if (!proof?.stripe?.sessionId) {
          throw new Error('Invalid payload for stripe verify request');
        }

        providerOrderId = proof?.stripe?.sessionId;
      } else {
        throw new Error('Unsupported provider for cancelPayment');
      }

      const cancellation = await paymentService.cancelPayment({
        provider,
        providerOrderId,
      });

      if (!cancellation.success)
        throw new Error(cancellation.message ?? 'Payment cancellation failed');
      return cancellation.data;
    }),

    pollOrderStatus: fromPromise(async ({ input }) => {
      const { orderId } = input as PollOrderStatusInput;
      await pollUntil({
        fn: async () => {
          const statusResponse = await orderService.getOrderStatus(orderId);
          if (!statusResponse.success)
            throw new Error(statusResponse.message ?? 'Failed to fetch order status');
          return statusResponse.data;
        },
        validate: (data) =>
          data.status === 'succeeded' || data.status === 'failed' || data.status === 'cancelled',
        interval: 2500,
        maxAttempts: 8,
      });

      const finalResponse = await orderService.getOrder(orderId);
      if (!finalResponse.success || !finalResponse.data)
        throw new Error(finalResponse.message ?? 'Failed to fetch final order status');
      if (finalResponse.data.status !== 'succeeded')
        throw new Error(finalResponse.data.status ?? 'Payment not completed');
      return finalResponse.data;
    }),
  },
});

export type StateValues =
  | 'idle'
  | 'creatingOrder'
  | 'orderCreated'
  | 'failure'
  | 'creatingProviderSession'
  | 'cancelled'
  | 'awaitingProvider'
  | 'providerUI'
  | 'resolvingPayment'
  | 'polling'
  | 'succeeded';

export const orderMachine = orderMachineSetup.createMachine({
  id: 'order',
  initial: 'idle',

  context: {
    order: null,
    provider: null,
    providerSession: null,
    error: null,
    successUrl: null,
    cancelUrl: null,
    proof: null,
  },
  states: {
    idle: {
      on: {
        SELECT_PROVIDER: { actions: 'setProvider' },
        CREATE_ORDER: 'creatingOrder',
        HYDRATE_ORDER: {
          target: 'orderCreated',
          actions: 'hydrateOrder',
        },
      },
    },

    creatingOrder: {
      entry: ['clearError'],
      invoke: {
        id: 'createOrder',
        src: 'createOrder',
        input: ({ event }) => {
          if (event.type !== 'CREATE_ORDER')
            throw new Error('CREATE_ORDER event is required to start order creation');
          return {
            payload: event.payload,
          } satisfies CreateOrderInput;
        },
        onDone: {
          target: 'orderCreated',
          actions: 'setOrder',
        },
        onError: {
          target: 'failure',
          actions: { type: 'assignError', params: { fallback: 'Order creation failed' } },
        },
      },
      on: {
        HYDRATE_ORDER: {
          target: 'orderCreated',
          actions: 'hydrateOrder',
        },
      },
    },

    orderCreated: {
      on: {
        SELECT_PROVIDER: { actions: 'setProvider' },
        CREATE_PROVIDER_SESSION: {
          target: 'creatingProviderSession',
          actions: ['prepareProviderSession', 'clearError'],
          guard: 'canCreateProviderSession',
        },
        HYDRATE_ORDER: {
          actions: 'hydrateOrder',
        },
        CANCEL: 'cancelPayment',
      },
    },

    creatingProviderSession: {
      invoke: {
        id: 'createProviderSession',
        src: 'createProviderSession',
        input: ({ context }) => {
          if (!context.order || !context.provider)
            throw new Error('Order and provider must be set before creating a provider session');
          return {
            order: context.order,
            provider: context.provider,
            successUrl: context.successUrl,
            cancelUrl: context.cancelUrl,
          } satisfies CreateProviderSessionInput;
        },
        onDone: {
          target: 'awaitingProvider',
          actions: 'setProviderSession',
        },
        onError: {
          target: 'failure',
          actions: {
            type: 'assignError',
            params: { fallback: 'Failed to create payment session' },
          },
        },
      },
    },

    awaitingProvider: {
      entry: 'clearError',
      on: {
        TRIGGER_PROVIDER_UI: 'providerUI',
        CANCEL: 'cancelPayment',
      },
    },

    providerUI: {
      on: {
        PAYMENT_CONFIRMED_CLIENT: {
          target: 'resolvingPayment',
          actions: 'storeProof',
        },
        CANCEL: 'cancelPayment',
      },
    },
    resolvingPayment: {
      invoke: {
        id: 'resolvePayment',
        src: 'resolvePayment',
        input: ({ context, event }) => {
          const proof = event.type === 'PAYMENT_CONFIRMED_CLIENT' ? event.proof : undefined;
          return {
            provider: context.provider,
            providerSession: context.providerSession,
            order: context.order,
            proof,
          } satisfies ResolvePaymentInput;
        },
        onDone: {
          target: 'polling',
          actions: 'clearError',
        },
        onError: {
          target: 'failure',
          actions: { type: 'assignError', params: { fallback: 'Verification failed' } },
        },
      },
    },
    polling: {
      invoke: {
        id: 'pollOrderStatus',
        src: 'pollOrderStatus',
        input: ({ context }) => {
          if (!context.order) throw new Error('Order not present in context');
          return {
            orderId: context.order.id,
          } satisfies PollOrderStatusInput;
        },
        onDone: {
          target: 'succeeded',
          actions: 'setOrder',
        },
        onError: {
          target: 'failure',
          actions: { type: 'assignError', params: { fallback: 'Payment failed or timed out' } },
        },
      },
    },
    succeeded: {
      type: 'final',
    },
    cancelPayment: {
      invoke: {
        id: 'cancelOrderPayment',
        src: 'cancelOrderPayment',
        input: ({ context }) => ({
          provider: context.provider,
          providerSession: context.providerSession,
          proof: context.proof,
        }),
        onDone: {
          target: 'cancelled',
        },
        onError: {
          target: 'cancelled',
        },
      },
    },
    cancelled: {
      type: 'final',
    },
    failure: {
      on: {
        HYDRATE_ORDER: {
          target: 'orderCreated',
          actions: 'hydrateOrder',
        },
        RETRY: {
          target: 'creatingProviderSession',
          guard: 'canRetryProviderSession',
          actions: 'clearError',
        },
        CREATE_ORDER: {
          target: 'creatingOrder',
          actions: 'clearError',
        },
        CANCEL: 'cancelPayment',
      },
    },
  },
});
