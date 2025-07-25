'use client';

import { useUser } from '@clerk/nextjs';
import { 
  ClerkUnsafeMetadata, 
  ClerkPublicMetadata,
  DrinkPreferences,
  FavoriteCategories,
  AIChatPreferences,
  SubscriptionPlan,
  PlanFeatures,
  AccountType
} from '../../app/types/clerk-metadata';

/**
 * Client-side utilities for accessing and updating Clerk metadata
 * These hooks provide reactive access to user metadata on the client
 */

// Default values (same as server-side)
const DEFAULT_DRINK_PREFERENCES: DrinkPreferences = {
  category: null,
  flavor: null,
  temperature: null,
  adventure: null,
  strength: null,
  occasion: null,
  allergies: [],
  useWeather: false,
  lastUpdated: new Date().toISOString()
};

const DEFAULT_FAVORITE_CATEGORIES: FavoriteCategories = {
  beer: 0,
  wine: 0,
  cocktail: 0,
  spirit: 0,
  nonAlcoholic: 0,
  lastUpdated: new Date().toISOString()
};

const DEFAULT_AI_CHAT_PREFERENCES: AIChatPreferences = {
  enabledFeatures: ['recommendations', 'explanations', 'recipes'],
  chatHistory: true,
  personalizedResponses: true,
  preferredTone: 'friendly',
  lastUpdated: new Date().toISOString()
};

const DEFAULT_PLAN_FEATURES: PlanFeatures = {
  maxSavedDrinks: 10,
  aiChatMessages: 20,
  weatherIntegration: true,
  advancedFiltering: false,
  personalizedRecommendations: true,
  emailSupport: false,
  prioritySupport: false,
  exportData: false
};

/**
 * Hook to get user's drink preferences from metadata
 */
export function useDrinkPreferences(): DrinkPreferences {
  const { user } = useUser();
  
  if (!user) return DEFAULT_DRINK_PREFERENCES;
  
  const preferences = (user.unsafeMetadata as ClerkUnsafeMetadata)?.drinkPreferences;
  return preferences || DEFAULT_DRINK_PREFERENCES;
}

/**
 * Hook to get user's favorite categories from metadata
 */
export function useFavoriteCategories(): FavoriteCategories {
  const { user } = useUser();
  
  if (!user) return DEFAULT_FAVORITE_CATEGORIES;
  
  const favorites = (user.unsafeMetadata as ClerkUnsafeMetadata)?.favoriteCategories;
  return favorites || DEFAULT_FAVORITE_CATEGORIES;
}

/**
 * Hook to get user's AI chat preferences from metadata
 */
export function useAIChatPreferences(): AIChatPreferences {
  const { user } = useUser();
  
  if (!user) return DEFAULT_AI_CHAT_PREFERENCES;
  
  const preferences = (user.unsafeMetadata as ClerkUnsafeMetadata)?.aiChatPreferences;
  return preferences || DEFAULT_AI_CHAT_PREFERENCES;
}

/**
 * Hook to get user's subscription plan from metadata
 */
export function useSubscriptionPlan(): SubscriptionPlan | null {
  const { user } = useUser();
  
  if (!user) return null;
  
  const plan = (user.publicMetadata as ClerkPublicMetadata)?.subscriptionPlan;
  return plan || null;
}

/**
 * Hook to get user's plan features from metadata
 */
export function usePlanFeatures(): PlanFeatures {
  const { user } = useUser();
  
  if (!user) return DEFAULT_PLAN_FEATURES;
  
  const features = (user.publicMetadata as ClerkPublicMetadata)?.planFeatures;
  return features || DEFAULT_PLAN_FEATURES;
}

/**
 * Hook to get user's account type from metadata
 */
export function useAccountType(): AccountType | null {
  const { user } = useUser();
  
  if (!user) return null;
  
  const accountType = (user.publicMetadata as ClerkPublicMetadata)?.accountType;
  return accountType || null;
}

/**
 * Hook to check if user has a specific feature
 */
export function useHasFeature(feature: keyof PlanFeatures): boolean {
  const planFeatures = usePlanFeatures();
  
  // Handle boolean features
  if (typeof planFeatures[feature] === 'boolean') {
    return planFeatures[feature] as boolean;
  }
  
  // Handle numeric features (check if > 0 or -1 for unlimited)
  if (typeof planFeatures[feature] === 'number') {
    const value = planFeatures[feature] as number;
    return value > 0 || value === -1;
  }
  
  return false;
}

/**
 * Hook to check if user can perform an action based on limits
 */
export function useCanPerformAction(
  feature: 'maxSavedDrinks' | 'aiChatMessages',
  currentUsage: number
): boolean {
  const planFeatures = usePlanFeatures();
  const limit = planFeatures[feature] as number;
  
  // -1 means unlimited
  if (limit === -1) return true;
  
  return currentUsage < limit;
}

/**
 * Hook to get usage percentage for numeric features
 */
export function useFeatureUsagePercentage(
  feature: 'maxSavedDrinks' | 'aiChatMessages',
  currentUsage: number
): number {
  const planFeatures = usePlanFeatures();
  const limit = planFeatures[feature] as number;
  
  // -1 means unlimited, return 0% usage
  if (limit === -1) return 0;
  
  // Prevent division by zero
  if (limit === 0) return 100;
  
  const percentage = (currentUsage / limit) * 100;
  return Math.min(percentage, 100);
}

/**
 * Hook to check if user is on a premium plan
 */
export function useIsPremiumUser(): boolean {
  const subscriptionPlan = useSubscriptionPlan();
  
  if (!subscriptionPlan) return false;
  
  return subscriptionPlan.planId !== 'free' && subscriptionPlan.status === 'active';
}

/**
 * Hook to check if user's subscription is active
 */
export function useIsSubscriptionActive(): boolean {
  const subscriptionPlan = useSubscriptionPlan();
  
  if (!subscriptionPlan) return false;
  
  return subscriptionPlan.status === 'active';
}

/**
 * Hook to get complete user metadata profile
 */
export function useUserMetadataProfile() {
  const drinkPreferences = useDrinkPreferences();
  const favoriteCategories = useFavoriteCategories();
  const aiChatPreferences = useAIChatPreferences();
  const subscriptionPlan = useSubscriptionPlan();
  const planFeatures = usePlanFeatures();
  const accountType = useAccountType();
  
  return {
    drinkPreferences,
    favoriteCategories,
    aiChatPreferences,
    subscriptionPlan,
    planFeatures,
    accountType,
  };
}

/**
 * Client-side function to update metadata via API
 */
export async function updateUserMetadata(
  type: 'drinkPreferences' | 'favoriteCategories' | 'aiChatPreferences',
  data: any
): Promise<void> {
  try {
    const response = await fetch('/api/user/metadata', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        data,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update metadata');
    }
    
    // Reload the page to refresh user data or implement optimistic updates
    window.location.reload();
  } catch (error) {
    console.error('Error updating metadata:', error);
    throw error;
  }
}

/**
 * Helper to convert client preferences to API format
 */
export function prepareMetadataForUpdate(
  type: 'drinkPreferences' | 'favoriteCategories' | 'aiChatPreferences',
  data: any
) {
  const timestamp = new Date().toISOString();
  
  switch (type) {
    case 'drinkPreferences':
      return {
        ...data,
        lastUpdated: timestamp
      } as DrinkPreferences;
    
    case 'favoriteCategories':
      return {
        ...data,
        lastUpdated: timestamp
      } as FavoriteCategories;
    
    case 'aiChatPreferences':
      return {
        ...data,
        lastUpdated: timestamp
      } as AIChatPreferences;
    
    default:
      throw new Error(`Unknown metadata type: ${type}`);
  }
}