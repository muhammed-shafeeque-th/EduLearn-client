import { getCurrentUser } from '@/lib/auth/get-current-user';
import { CartClient } from './cart-client';

export async function CartContent() {
  const user = await getCurrentUser();

  return <CartClient user={user} />;
}
