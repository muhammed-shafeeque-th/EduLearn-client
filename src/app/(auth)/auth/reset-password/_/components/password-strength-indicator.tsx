'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
  },
  {
    label: 'One uppercase letter',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: 'One lowercase letter',
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: 'One number',
    test: (password) => /[0-9]/.test(password),
  },
  {
    label: 'One special character',
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const metRequirements = requirements.filter((req) => req.test(password));
  const strength = metRequirements.length;
  const strengthPercentage = (strength / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
      className="space-y-3 p-3 rounded-lg border bg-muted/50"
    >
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-muted-foreground">Password Strength</span>
          <span
            className={cn(
              'text-xs font-medium',
              strength <= 2 && 'text-red-600',
              strength === 3 && 'text-yellow-600',
              strength === 4 && 'text-blue-600',
              strength === 5 && 'text-green-600'
            )}
          >
            {getStrengthText()}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className={cn('h-2 rounded-full transition-all duration-300', getStrengthColor())}
            initial={{ width: 0 }}
            animate={{ width: `${strengthPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-1">
        {requirements.map((requirement, index) => {
          const isMet = requirement.test(password);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-center space-x-2 text-xs"
            >
              <div
                className={cn(
                  'w-4 h-4 rounded-full flex items-center justify-center',
                  isMet ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'
                )}
              >
                {isMet ? (
                  <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="w-2.5 h-2.5 text-gray-400" />
                )}
              </div>
              <span
                className={cn(
                  isMet ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                )}
              >
                {requirement.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
