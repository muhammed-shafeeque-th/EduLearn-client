import { useActorRef } from '@xstate/react';
import type { ActorRefFrom } from 'xstate';

import { orderMachine } from '@/lib/machines/order-machine';

export function useOrderMachine(): ActorRefFrom<typeof orderMachine> {
  return useActorRef(orderMachine);
}
