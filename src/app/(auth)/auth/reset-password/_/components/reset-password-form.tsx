'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Shield, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { resetPasswordSchema, type ResetPasswordFormData } from '../schemas';
import { PasswordStrengthIndicator } from './password-strength-indicator';
// import { ResetPasswordSkeleton } from './skeletons/reset-password-skeleton';
import { useResetPassword } from '../hooks/use-reset-password';
import AnimatedSpinner from '@/components/shared/animated-spinner';
import { ROUTES } from '@/lib/constants/routes';

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const email = searchParams?.get('email');

  const { isLoading, onSubmit, tokenValid } = useResetPassword(token!);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const watchedPassword = watch('password', '');

  // Show loading skeleton while validating token
  // if (isValidating) {
  //   return <ResetPasswordSkeleton />;
  // }

  // Show error state for invalid/expired tokens
  if (tokenValid === false) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 text-center"
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-destructive">Invalid Reset Link</h1>
            <p className="text-muted-foreground mt-2">
              This password reset link is invalid or has expired.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href={ROUTES.auth.forgotPassword}>Request New Reset Link</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href={ROUTES.auth.login}>Back to Sign In</Link>
          </Button>
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
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Reset Your Password</h1>
        <p className="text-muted-foreground">
          {email ? `Reset password for ${email}` : 'Create a new secure password'}
        </p>
      </div>

      {/* Security Info */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Choose a strong password that you haven&apos;t used before. Your new password will be
          encrypted and stored securely.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your new password"
              {...register('password')}
              className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}

          {/* Password Strength Indicator */}
          {watchedPassword && <PasswordStrengthIndicator password={watchedPassword} />}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your new password"
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" size="lg" disabled={!isValid || isLoading}>
          {isLoading ? (
            <>
              <AnimatedSpinner isLoading={isLoading} /> Loading...
            </>
          ) : (
            <>
              Reset Password
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Back to Login */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link href={ROUTES.auth.login} className="font-medium text-primary hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
