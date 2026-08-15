import 'server-only';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/_nextAuth';

export async function getServerAuthSession() {
  return getServerSession(authOptions);
}
