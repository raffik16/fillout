'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  variant = 'default',
  ...props 
}) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-800',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'h-4 rounded',
        variant === 'default' && 'rounded-lg',
        className
      )}
      {...props}
    />
  );
};