import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-2">Admin Area - Page Not Found</h1>
      <p className="mb-4 text-muted-foreground">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link
        href="/admin"
        className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary-hover transition"
      >
        Go to Admin Dashboard
      </Link>
    </div>
  );
}
