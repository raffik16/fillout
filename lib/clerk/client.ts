// Client-side utilities only
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

// Wizard integration utilities (client-side only)
export {
  clientWizardIntegration,
} from './wizard-integration-client';

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