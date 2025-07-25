'use client';

import { SignInButton as ClerkSignInButton } from '@clerk/nextjs';
import { LogIn } from 'lucide-react';

interface SignInButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export function SignInButton({ 
  variant = 'primary', 
  size = 'md',
  children 
}: SignInButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-500 shadow-sm hover:shadow-md",
    secondary: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 focus:ring-orange-500 shadow-sm hover:shadow-md",
    ghost: "text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:ring-orange-500"
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2"
  };

  return (
    <ClerkSignInButton mode="modal">
      <button className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}>
        <LogIn className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
        {children || 'Sign In'}
      </button>
    </ClerkSignInButton>
  );
}