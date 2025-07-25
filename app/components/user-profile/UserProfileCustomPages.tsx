'use client';

import React from 'react';
import { UserProfile } from '@clerk/nextjs';
import { DrinkPreferencesPage } from './DrinkPreferencesPage';
import { AIChatPreferencesPage } from './AIChatPreferencesPage';
import { SubscriptionPage } from './SubscriptionPage';

/**
 * Custom UserProfile component with additional pages for Drinkjoy-specific features
 * This integrates with Clerk's UserProfile component to add custom functionality
 */
export function UserProfileCustomPages() {
  return (
    <UserProfile
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "shadow-lg",
        }
      }}
    >
      {/* Custom page for drink preferences */}
      <UserProfile.Page
        label="Drink Preferences"
        labelIcon={
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        }
        url="drink-preferences"
      >
        <DrinkPreferencesPage />
      </UserProfile.Page>

      {/* Custom page for AI chat preferences */}
      <UserProfile.Page
        label="AI Assistant"
        labelIcon={
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        }
        url="ai-preferences"
      >
        <AIChatPreferencesPage />
      </UserProfile.Page>

      {/* Custom page for subscription management */}
      <UserProfile.Page
        label="Subscription"
        labelIcon={
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
        }
        url="subscription"
      >
        <SubscriptionPage />
      </UserProfile.Page>
    </UserProfile>
  );
}