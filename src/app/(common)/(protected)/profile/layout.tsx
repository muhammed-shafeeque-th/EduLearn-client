import { Suspense } from 'react';
import { ProfileLayoutClient } from './_/components/profile-layout-client';
import { ProfileSkeleton } from './_/components/skeletons/profile-skeleton';
// import type { Metadata } from 'next';
// import { getServerAuthToken } from '@/lib/server-apis/server-utils';
// import { fetchApi } from '@/lib/server-apis/server-apis';
// import { User } from '@/types/user';

// export const metadata: Metadata = {
//   title: 'Profile ',
//   description: 'Manage your profile information and preferences',
// };

interface ProfileLayoutProps {
  children: React.ReactNode;
}
// export async function generateMetadata(): Promise<Metadata> {
//   try {
//     const user = await getCurrentUser();
//     if (!user) {
//       return {
//         title: 'Not found - User profile',
//       };
//     }
//     const fullName = user.username || user?.firstName + user.lastName || 'Your Profile';
//     const description = `View and edit ${user?.firstName || 'your'} profile information, preferences, and settings on EduLearn.`;

//     return {
//       title: `${fullName} — Edit Profile | EduLearn`,
//       description,
//       keywords: ['user profile', 'account settings', 'update info', 'EduLearn', 'dashboard'],
//       alternates: {
//         canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/profile`,
//       },
//       openGraph: {
//         title: `${fullName} — Profile | EduLearn`,
//         description,
//         url: `${process.env.NEXT_PUBLIC_SITE_URL}/profile`,
//         siteName: 'EduLearn',
//         images: [
//           {
//             url: user?.avatar || `${process.env.NEXT_PUBLIC_SITE_URL}/images/default-avatar.png`,
//             width: 800,
//             height: 600,
//             alt: `${fullName}'s profile picture`,
//           },
//           {
//             url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/og/profile?name=${encodeURIComponent(
//               fullName
//             )}`,
//             width: 1200,
//             height: 630,
//             alt: `${fullName}'s profile banner`,
//           },
//         ],
//         locale: 'en_US',
//         type: 'profile',
//       },
//       twitter: {
//         card: 'summary_large_image',
//         title: `${fullName} — Profile`,
//         description,
//         images: [user?.avatar || `${process.env.NEXT_PUBLIC_SITE_URL}/images/default-avatar.png`],
//       },
//     };
//   } catch {
//     return {
//       title: 'Edit Profile | EduLearn',
//       description: 'Update your profile information and preferences.',
//     };
//   }
// }

// export async function getCurrentUser() {
//   const token = await getServerAuthToken();
//   try {
//     const response = await fetchApi<User>(`/users/me`, {
//       method: 'GET',
//       token,
//     });
//     if (!response.success) {
//       throw new Error(response.message || `Something went wrong`);
//     }
//     return response.data;
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
// }

export default async function ProfileLayout({ children }: ProfileLayoutProps) {
  // const user = await getCurrentUser();

  // const jsonLd = {
  //   '@context': 'https://schema.org',
  //   '@type': 'Person',
  //   name: user?.firstName,
  //   email: user?.email,
  //   image: user?.avatar,
  //   url: `${process.env.NEXT_PUBLIC_SITE_URL}/profile`,
  // };

  return (
    <>
      {/* Structured Data for SEO */}
      {/* <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      /> */}
      <div className="min-h-screen bg-background">
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileLayoutClient>{children}</ProfileLayoutClient>
        </Suspense>
      </div>
    </>
  );
}
