// Server-side utilities only
export {
  getCurrentUserWithMetadata,
  updateDrinkPreferences,
  updateDrinkPreferencesFromWizard,
  wizardPreferencesToDrinkPreferences,
  getDrinkPreferences,
  updateFavoriteCategories,
  incrementFavoriteCategory,
  updateAIChatPreferences,
  getUserSubscriptionPlan,
  getUserPlanFeatures,
  setSubscriptionMetadata,
  setAccountTypeMetadata,
  addBillingHistoryEntry,
  setStripeCustomerId,
  getUserMetadataProfile,
  initializeNewUserMetadata,
} from './metadata';

// Wizard integration utilities (server-side)
export {
  saveWizardResultsToMetadata,
  loadWizardPreferencesFromMetadata,
  hasUserCompletedWizard,
  getPersonalizedWizardSuggestions,
} from './wizard-integration';

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