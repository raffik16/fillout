// Client-side utilities only (to prevent server-only imports in client bundle)
export {
  useDrinkPreferences,
  useFavoriteCategories,
  useAIChatPreferences,
  useSubscriptionPlan,
  usePlanFeatures,
  useAccountType,
  useHasFeature,
  useCanPerformAction,
  useFeatureUsagePercentage,
  useIsPremiumUser,
  useIsSubscriptionActive,
  useUserMetadataProfile,
  updateUserMetadata,
  prepareMetadataForUpdate,
} from './client-metadata';

// Note: Server-side utilities have been moved to './server' to prevent 
// accidental client-side imports that would cause the "server-only" error

// Re-export types for convenience
export type {
  ClerkUnsafeMetadata,
  ClerkPublicMetadata,
  ClerkPrivateMetadata,
  DrinkPreferences,
  DrinkPreferencesUpdate,
  FavoriteCategories,
  FavoriteCategoriesUpdate,
  AIChatPreferences,
  AIChatPreferencesUpdate,
  SubscriptionPlan,
  PlanFeatures,
  AccountType,
  BillingHistoryEntry,
} from '../../app/types/clerk-metadata';