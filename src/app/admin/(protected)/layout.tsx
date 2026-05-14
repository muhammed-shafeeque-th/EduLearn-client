import { AdminSidebar } from './_components/sidebar';
import { AdminHeader } from './_components/header';
import { authGuard } from '@/lib/auth/auth-guard';
import { getAdmin } from '@/lib/auth/auth-user';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await authGuard({
    getUser: getAdmin,
    roles: ['admin'],
    // permissions: [Permissions.ADMIN_DASHBOARD],
    redirectTo: '/admin/auth/login',
  });

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:pl-64">
        <AdminHeader />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
