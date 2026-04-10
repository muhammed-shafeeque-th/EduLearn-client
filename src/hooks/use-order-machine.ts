import React from 'react';
import { useActorRef, useSelector } from '@xstate/react';
import type { ActorRefFrom } from 'xstate';

import { orderMachine, type PaymentProof, type StateValues } from '@/lib/machines/order-machine';
import type { Order, PlaceOrderPayload } from '@/types/order';
import { PaymentProvider } from '@/services/payment';

export function useOrderMachine() {
  const orderService: ActorRefFrom<typeof orderMachine> = useActorRef(orderMachine);
  const orderState = useSelector(orderService, (state) => state);
  const { order, paymentId, provider, providerSession, error: machineError } = orderState.context;

  const matches = (value: StateValues) => orderState.matches(value);

  const actions = React.useMemo(
    () => ({
      selectProvider: (provider: PaymentProvider) =>
        orderService.send({ type: 'SELECT_PROVIDER', provider }),
      createOrder: (payload: PlaceOrderPayload) =>
        orderService.send({ type: 'CREATE_ORDER', payload }),
      createSession: (payload?: { successUrl?: string; cancelUrl?: string }) =>
        orderService.send({ type: 'CREATE_PROVIDER_SESSION', payload }),
      triggerUI: () => orderService.send({ type: 'TRIGGER_PROVIDER_UI' }),
      confirmPayment: (proof?: PaymentProof) =>
        orderService.send({ type: 'PAYMENT_CONFIRMED_CLIENT', proof }),
      retry: () => orderService.send({ type: 'RETRY' }),
      cancel: () => orderService.send({ type: 'CANCEL' }),
      hydrate: (order: Order, provider?: PaymentProvider | null) =>
        orderService.send({ type: 'HYDRATE_ORDER', order, provider }),
      setPaymentId: (paymentId: string) =>
        orderService.send({ type: 'SET_PAYMENT_ID', payload: { paymentId } }),
    }),
    [orderService]
  );

  return {
    // Core
    orderService,
    orderState,
    order,
    paymentId,
    provider,
    providerSession,
    machineError,

    // Actions
    ...actions,

    // Status helpers
    status: orderState.value as StateValues,
    isIdle: matches('idle'),
    isCreatingOrder: matches('creatingOrder'),
    isOrderCreated: matches('orderCreated'),
    isCreatingPayment: matches('creatingPayment'),
    isCreatingSession: matches('creatingProviderSession'),
    isAwaitingProvider: matches('awaitingProvider'),
    isProviderUI: matches('providerUI'),
    isResolving: matches('resolvingPayment'),
    isPolling: matches('polling'),
    isSucceeded: matches('succeeded'),
    isCancelled: matches('cancelled'),
    isFailed: matches('failure'),
    canRetry: orderState.can({ type: 'RETRY' }),
  };
}
