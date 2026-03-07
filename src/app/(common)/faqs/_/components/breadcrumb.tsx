import React from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center space-x-1">
            {item.icon && <item.icon className="w-4 h-4" />}
            {item.href ? (
              <a href={item.href} className="hover:text-secondary transition-colors">
                {item.label}
              </a>
            ) : (
              <span className="text-secondary">{item.label}</span>
            )}
          </div>
          {index < items.length - 1 && <ChevronRight className="w-4 h-4 text-secondary" />}
        </React.Fragment>
      ))}
    </nav>
  );
}
