import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'section' | 'page';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, variant = 'default', size = 'lg', padding = 'md', children, ...props }, ref) => {
    const variantClasses = {
      default: '',
      card: 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700',
      section: 'bg-gray-50 dark:bg-gray-900 rounded-lg',
      page: 'min-h-screen bg-gray-50 dark:bg-gray-900',
    };

    const sizeClasses = {
      sm: 'max-w-2xl',
      md: 'max-w-4xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      full: 'max-w-full',
    };

    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4 lg:p-6',
      lg: 'p-6 lg:p-8',
      xl: 'p-8 lg:p-12',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto',
          sizeClasses[size],
          variantClasses[variant],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export { Container };
