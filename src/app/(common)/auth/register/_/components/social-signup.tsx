'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { FacebookIcon, GoogleIcon, MicrosoftIcon } from './icons';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';

const socialProviders = [
  {
    name: 'Facebook',
    icon: FacebookIcon,
    className: 'border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950',
  },
  {
    name: 'Google',
    icon: GoogleIcon,
    className: 'border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950',
  },
  {
    name: 'Microsoft',
    icon: MicrosoftIcon,
    className: 'border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950',
  },
];

export function SocialSignup() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSocialSignup = async (provider: string) => {
    setLoadingProvider(provider);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success({ title: `Signing up with ${provider}...` });

      // Implement actual social auth here
      // Example: signIn(provider.toLowerCase())
    } catch (error) {
      toast.error({
        title: `Failed to sign up with ${provider}`,
        description: getErrorMessage(error),
      });
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {socialProviders.map((provider, index) => {
        const Icon = provider.icon;
        const isLoading = loadingProvider === provider.name;

        return (
          <motion.div
            key={provider.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              className={`w-full ${provider.className}`}
              onClick={() => handleSocialSignup(provider.name)}
              disabled={!!loadingProvider}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span className="ml-2 hidden sm:inline">{provider.name}</span>
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}
