'use client'

import { SignedIn, SignedOut } from '@clerk/nextjs'
import { SignInButton } from './SignInButton'
import { SignUpButton } from './SignUpButton'

interface AuthWrapperProps {
  signedInContent: React.ReactNode
  signedOutContent?: React.ReactNode
  showDefaultSignedOut?: boolean
}

export function AuthWrapper({ 
  signedInContent, 
  signedOutContent,
  showDefaultSignedOut = true 
}: AuthWrapperProps) {
  return (
    <>
      <SignedIn>
        {signedInContent}
      </SignedIn>
      <SignedOut>
        {signedOutContent || (showDefaultSignedOut && (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Sign in to access Drinkjoy
            </h2>
            <p className="text-gray-600 text-center max-w-md">
              Create an account or sign in to discover personalized drink recommendations, 
              save your favorites, and unlock exclusive features.
            </p>
            <div className="flex space-x-4">
              <SignInButton />
              <SignUpButton variant="outline" />
            </div>
          </div>
        ))}
      </SignedOut>
    </>
  )
}