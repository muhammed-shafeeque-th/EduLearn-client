'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForgotPassword } from '../hooks/use-forgot-password';
import { forgotPasswordSchema, ForgotPasswordSchemaType } from '../schemas';
import { ROUTES } from '@/lib/constants/routes';

export function ForgotPasswordForm() {
  const { isLoading, isSubmitted, onSubmit, setIsSubmitted } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
  } = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
  });

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Check your email</h2>
          <p className="text-muted-foreground">
            We sent a password reset link to{' '}
            <span className="font-medium">{getValues('email')}</span>
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or{' '}
            <button
              onClick={() => setIsSubmitted(false)}
              className="font-medium text-primary hover:underline"
            >
              try another email address
            </button>
          </p>

          <Link href={ROUTES.auth.login}>
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
            autoComplete="email"
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={!isValid || isLoading}>
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
          ) : null}
          Reset password
        </Button>
      </form>

      <div className="text-center">
        <Link
          href={ROUTES.auth.login}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </Link>
      </div>
    </motion.div>
  );
}
