'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useSecurityForm } from '../hooks/use-security';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { passwordChangeSchema, PasswordChangeType } from '../schema';

export function SecurityForm() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isValid },
    reset,
  } = useForm<PasswordChangeType>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      confirmPassword: '',
      currentPassword: '',
      newPassword: '',
    },
    mode: 'onChange',
  });
  const {
    showPasswords,
    togglePasswordVisibility,
    handleSubmit: onSubmit,
  } = useSecurityForm(reset);

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-gray-200 dark:border-gray-800 text-center">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Change Password</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Update your password to keep your account secure
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <FormField
            label="Current Password"
            htmlFor="currentPassword"
            error={errors.currentPassword?.message}
            required
          >
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                {...register('currentPassword')}
                placeholder="Enter your current password"
                className="pr-10"
                aria-describedby={errors.currentPassword?.message}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showPasswords.current ? 'Hide password' : 'Show password'}
              >
                {showPasswords.current ? (
                  <EyeOff className="w-4 h-4" tabIndex={-1} />
                ) : (
                  <Eye className="w-4 h-4" tabIndex={-1} />
                )}
              </button>
            </div>
          </FormField>

          <FormField
            label="New Password"
            htmlFor="newPassword"
            error={errors.newPassword?.message}
            required
          >
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                {...register('newPassword')}
                placeholder="Enter your new password"
                className="pr-10"
                aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showPasswords.new ? 'Hide password' : 'Show password'}
              >
                {showPasswords.new ? (
                  <EyeOff className="w-4 h-4" tabIndex={-1} />
                ) : (
                  <Eye className="w-4 h-4" tabIndex={-1} />
                )}
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Password must be at least 8 characters long and contain uppercase, lowercase, number,
              and special character.
            </div>
          </FormField>

          <FormField
            label="Confirm New Password"
            htmlFor="confirmPassword"
            error={errors.confirmPassword?.message}
            required
          >
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="Confirm your new password"
                className="pr-10"
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showPasswords.confirm ? 'Hide password' : 'Show password'}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-4 h-4" tabIndex={-1} />
                ) : (
                  <Eye className="w-4 h-4" tabIndex={-1} />
                )}
              </button>
            </div>
          </FormField>
        </div>

        {/* Submit Button */}
        <div className="flex justify-start pt-6 border-t border-gray-200 dark:border-gray-800">
          <Button type="submit" disabled={isSubmitting || !isValid} className="px-8 py-2">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating Password...
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </div>
      </form>

      {/* Security Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Password Security Tips
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Use a unique password that you don&apos;t use elsewhere</li>
          <li>• Make it at least 8 characters long</li>
          <li>• Include uppercase and lowercase letters, numbers, and symbols</li>
          <li>• Avoid using personal information like names or birthdays</li>
        </ul>
      </div>
    </div>
  );
}
