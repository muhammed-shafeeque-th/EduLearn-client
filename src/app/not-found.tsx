import { Metadata } from 'next';
import { NotFoundPage } from './_/not-found/not-found-page';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return <NotFoundPage />;
}
