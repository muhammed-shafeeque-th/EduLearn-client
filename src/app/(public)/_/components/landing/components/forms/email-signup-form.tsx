'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';

export default function EmailSignupForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error({ title: 'Please enter your email address' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error({ title: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);

    try {
      // Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success({ title: 'Welcome to EduLearn! Check your email for next steps.' });
      setEmail('');
    } catch (error) {
      toast.error({
        title: 'Something went wrong. Please try again.',
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleGetStarted} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="email"
            placeholder="Enter your email to get started"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 text-base"
            required
          />
        </div>
        <Button type="submit" disabled={isLoading} className="h-12 px-8 text-base font-semibold">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Starting...</span>
            </div>
          ) : (
            'Start your instructor journey'
          )}
        </Button>
      </div>
    </form>
  );
}
