// Main preferences form component
export { default as DrinkPreferencesForm } from './DrinkPreferencesForm';

// Individual preference components
export { default as FlavorPreferences } from './FlavorPreferences';
export { default as CategoryPreferences } from './CategoryPreferences';
export { default as AllergenSettings } from './AllergenSettings';
export { default as AIPreferences } from './AIPreferences';

// Integration components
export { default as WizardIntegration } from './WizardIntegration';

// Type exports for external use
export type {
  UserDrinkPreferences,
  PreferenceIntensity,
  AIPersonality,
  RecommendationStyle,
  PreferenceValidation,
  PreferenceChange,
  PreferenceFormState,
  PreferenceExport,
} from '@/app/types/preferences';

// Utility function exports
export {
  convertWizardToUserPreferences,
  convertUserToWizardPreferences,
  mergeWizardWithUserPreferences,
  validateUserPreferences,
  generatePreferenceSummary,
  createPreferencesExport,
  parsePreferencesImport,
  hasCustomizedPreferences,
  getPreferenceImprovementSuggestions,
} from '@/app/lib/preference-utils';

// Clerk integration hooks and utilities
export { 
  useDrinkPreferences, 
  PreferenceManager 
} from '@/app/lib/clerk-preferences';

// Default preferences
export { DEFAULT_PREFERENCES } from '@/app/types/preferences';