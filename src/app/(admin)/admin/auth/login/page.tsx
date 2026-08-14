import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from './_/forms/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - Login Page',
  description: 'Login to access your account and explore EduLearn.',
};

export default function LoginPage() {
  return (
    <main className="gradient-to-tr from-[rgb(235,233,241)] from-0% via-blue py-8 to-[#4f20fb] to-100% flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md sm:max-w-md p-6 sm:px-1 lg:px-2">
        <Card className="w-full border-none shadow-lg  rounded-lg bg-white/10 backdrop-blur-md p-6 sm:p-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">Admin Login</CardTitle>
            <p className="mt-2 text-sm text-black-300">
              Login to access your account and explore EduLearn.
            </p>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="text-center">
            <p>Empower learning with the world&apos;s leading education platform.</p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
