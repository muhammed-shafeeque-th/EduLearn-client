import { AdminSidebar } from './_components/sidebar';
import { AdminHeader } from './_components/header';
import { requireAuth } from '@/lib/auth/require-auth';
import { getAdmin } from '@/lib/auth/auth-user';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAuth({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getUser: getAdmin as any,
    roles: ['admin'],
    redirectTo: '/admin/auth/login',
    // condition: (user, ctx) => {
    //   const course = ctx?.resource as Course;
    //   return course.instructorId === user.id;
    // },
    // context: { resource: course },
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
