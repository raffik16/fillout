'use client'

import { SignUpButton as ClerkSignUpButton } from '@clerk/nextjs'
import { Button } from '@/app/components/ui/Button'

interface SignUpButtonProps {
  mode?: 'modal' | 'redirect'
  redirectUrl?: string
  children?: React.ReactNode
  className?: string
  variant?: 'default' | 'secondary' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

export function SignUpButton({ 
  mode = 'redirect',
  redirectUrl,
  children,
  className,
  variant = 'default',
  size = 'default'
}: SignUpButtonProps) {
  return (
    <ClerkSignUpButton mode={mode} redirectUrl={redirectUrl}>
      <Button variant={variant} size={size} className={className}>
        {children || 'Sign Up'}
      </Button>
    </ClerkSignUpButton>
  )
}