'use client';

import { UserButton as ClerkUserButton, useUser } from '@clerk/nextjs';
import { SignInButton } from './SignInButton';

interface UserButtonProps {
  afterSignOutUrl?: string;
  showDisplayName?: boolean;
}

export function UserButton({ 
  afterSignOutUrl = '/',
  showDisplayName = false 
}: UserButtonProps) {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return <SignInButton variant="ghost" size="sm" />;
  }

  return (
    <div className="flex items-center gap-3">
      {showDisplayName && (
        <span className="text-sm text-gray-700 hidden sm:block">
          {user?.firstName || user?.emailAddresses[0]?.emailAddress}
        </span>
      )}
      <ClerkUserButton 
        afterSignOutUrl={afterSignOutUrl}
        appearance={{
          elements: {
            userButtonAvatarBox: 'w-8 h-8',
            userButtonPopoverCard: 'shadow-lg border',
            userButtonPopoverActions: 'space-y-1',
            userButtonPopoverActionButton: 'hover:bg-gray-50 rounded-md transition-colors',
            userButtonPopoverActionButtonText: 'text-sm',
            userButtonPopoverFooter: 'hidden'
          }
        }}
      />
    </div>
  );
}