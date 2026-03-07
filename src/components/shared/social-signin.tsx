'use client';

import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { GoogleIcon } from '@/components/icons';
import { toast } from '@/hooks/use-toast';
import { getErrorMessage } from '@/lib/utils';

const socialProviders = [
  {
    name: 'google',
    icon: GoogleIcon,
    className: 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800',
  },
  // {
  //   name: 'facebook',
  //   icon: FacebookIcon,
  //   className: 'border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950',
  // },
  // {
  //   name: 'apple',
  //   icon: AppleIcon,
  //   className: 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800',
  // },
] as const;

function SocialSignin() {
  const [loading, setLoading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSocialSignin = async (provider: string) => {
    setLoading(provider);
    setIsLoading(true);
    if (provider !== 'google') toast.success({ title: `Coming soon...` });
    try {
      await signIn(provider);

      toast.success({ title: `Signing in with ${provider}...` });
    } catch (error) {
      toast.error({
        title: `Failed to sign in with ${provider}`,
        description: getErrorMessage(error, 'Something went wrong'),
      });
    } finally {
      setIsLoading(false);
      setLoading(null);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`grid gap-3 ${
          socialProviders.length === 1
            ? 'grid-cols-1'
            : socialProviders.length === 2
              ? 'grid-cols-2'
              : 'grid-cols-3'
        }`}
      >
        {socialProviders.map((provider, index) => {
          const Icon = provider.icon;
          const isProcessing = loading === provider.name || isLoading;

          return (
            <motion.div
              key={provider.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Button
                variant="outline"
                className={`w-full h-12 ${provider.className}`}
                onClick={() => handleSocialSignin(provider.name)}
                disabled={!!isProcessing}
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
                <span className="ml-2 text-sm font-medium">{provider.name}</span>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
export default memo(SocialSignin);
