'use client';

import { WizardPreferences } from '@/app/types/wizard';
import { UserDrinkPreferences, DEFAULT_PREFERENCES } from '@/app/types/preferences';

/**
 * Convert wizard preferences to comprehensive user preferences
 */
export function convertWizardToUserPreferences(
  wizardPrefs: WizardPreferences,
  existingPrefs?: Partial<UserDrinkPreferences>
): UserDrinkPreferences {
  // Start with defaults and merge with existing preferences
  const base: UserDrinkPreferences = {
    ...DEFAULT_PREFERENCES,
    ...existingPrefs,
  };

  // Map wizard preferences to user preferences
  const converted: UserDrinkPreferences = {
    ...base,
    
    // Core wizard mappings
    primaryCategory: wizardPrefs.category,
    flavorProfile: wizardPrefs.flavor,
    temperaturePreference: wizardPrefs.temperature,
    adventureLevel: wizardPrefs.adventure,
    strengthPreference: wizardPrefs.strength,
    preferredOccasions: wizardPrefs.occasion ? [wizardPrefs.occasion] : base.preferredOccasions,
    allergies: wizardPrefs.allergies || ['none'],
    useWeatherRecommendations: wizardPrefs.useWeather,

    // Update category preferences based on wizard selections
    categoryPreferences: {
      ...base.categoryPreferences,
      // If a primary category was selected, give it high priority
      ...(wizardPrefs.category && {
        [wizardPrefs.category]: {
          enabled: true,
          priority: 10,
          intensity: 'high',
        },
      }),
    },

    // Update flavor intensities based on wizard selection
    flavorIntensities: {
      ...base.flavorIntensities,
      // If a flavor was selected, set it to high intensity
      ...(wizardPrefs.flavor && {
        [wizardPrefs.flavor]: 'high',
      }),
    },

    // Set source and update metadata
    source: 'wizard',
    lastUpdated: new Date().toISOString(),
    version: (base.version || 0) + 1,
  };

  return converted;
}

/**
 * Convert user preferences back to wizard format for backwards compatibility
 */
export function convertUserToWizardPreferences(userPrefs: UserDrinkPreferences): WizardPreferences {
  return {
    category: userPrefs.primaryCategory,
    flavor: userPrefs.flavorProfile,
    temperature: userPrefs.temperaturePreference,
    adventure: userPrefs.adventureLevel,
    strength: userPrefs.strengthPreference,
    occasion: userPrefs.preferredOccasions[0] || null,
    allergies: userPrefs.allergies,
    useWeather: userPrefs.useWeatherRecommendations,
  };
}

/**
 * Merge wizard results with existing user preferences intelligently
 */
export function mergeWizardWithUserPreferences(
  wizardPrefs: WizardPreferences,
  existingUserPrefs: UserDrinkPreferences
): UserDrinkPreferences {
  // Convert wizard to user format first
  const wizardAsUser = convertWizardToUserPreferences(wizardPrefs, existingUserPrefs);

  // Merge intelligently - wizard preferences override core settings but preserve advanced settings
  return {
    ...existingUserPrefs,
    
    // Override core preferences from wizard
    primaryCategory: wizardAsUser.primaryCategory,
    flavorProfile: wizardAsUser.flavorProfile,
    temperaturePreference: wizardAsUser.temperaturePreference,
    adventureLevel: wizardAsUser.adventureLevel,
    strengthPreference: wizardAsUser.strengthPreference,
    allergies: wizardAsUser.allergies,
    useWeatherRecommendations: wizardAsUser.useWeatherRecommendations,

    // Add occasion if not already in preferred occasions
    preferredOccasions: wizardPrefs.occasion && !existingUserPrefs.preferredOccasions.includes(wizardPrefs.occasion)
      ? [...existingUserPrefs.preferredOccasions, wizardPrefs.occasion]
      : existingUserPrefs.preferredOccasions,

    // Update category preferences
    categoryPreferences: {
      ...existingUserPrefs.categoryPreferences,
      ...(wizardPrefs.category && {
        [wizardPrefs.category]: {
          enabled: true,
          priority: Math.max(existingUserPrefs.categoryPreferences[wizardPrefs.category]?.priority || 5, 8),
          intensity: 'high',
        },
      }),
    },

    // Update flavor intensities
    flavorIntensities: {
      ...existingUserPrefs.flavorIntensities,
      ...(wizardPrefs.flavor && {
        [wizardPrefs.flavor]: 'high',
      }),
    },

    // Update metadata
    lastUpdated: new Date().toISOString(),
    version: existingUserPrefs.version + 1,
    source: 'wizard', // Mark as updated from wizard
  };
}

/**
 * Validate user preferences for completeness and correctness
 */
export function validateUserPreferences(prefs: Partial<UserDrinkPreferences>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completeness: number;
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields for core functionality
  if (!prefs.primaryCategory && !prefs.flavorProfile) {
    warnings.push('Consider setting a primary category or flavor preference for better recommendations');
  }

  // Validate allergies
  if (prefs.allergies) {
    if (prefs.allergies.length === 0) {
      errors.push('At least one allergy option must be selected (including "none")');
    }
    
    if (prefs.allergies.includes('none') && prefs.allergies.length > 1) {
      errors.push('Cannot select "none" along with specific allergies');
    }
  }

  // Validate category preferences
  if (prefs.categoryPreferences) {
    const enabledCategories = Object.values(prefs.categoryPreferences).filter(cat => cat.enabled).length;
    
    if (enabledCategories === 0) {
      errors.push('At least one drink category must be enabled');
    }

    // Check priority ranges
    Object.entries(prefs.categoryPreferences).forEach(([category, settings]) => {
      if (settings.priority < 1 || settings.priority > 10) {
        errors.push(`${category} priority must be between 1 and 10`);
      }
    });
  }

  // Calculate completeness score
  const requiredFields = ['primaryCategory', 'flavorProfile', 'strengthPreference', 'allergies'];
  const optionalFields = ['temperaturePreference', 'adventureLevel', 'preferredOccasions'];
  
  const requiredScore = requiredFields.reduce((score, field) => {
    const value = prefs[field as keyof UserDrinkPreferences];
    if (Array.isArray(value)) {
      return score + (value.length > 0 ? 25 : 0);
    }
    return score + (value ? 25 : 0);
  }, 0);

  const optionalScore = optionalFields.reduce((score, field) => {
    const value = prefs[field as keyof UserDrinkPreferences];
    if (Array.isArray(value)) {
      return score + (value.length > 0 ? 5 : 0);
    }
    return score + (value ? 5 : 0);
  }, 0);

  const completeness = Math.min(100, requiredScore + optionalScore);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    completeness,
  };
}

/**
 * Generate a human-readable summary of user preferences
 */
export function generatePreferenceSummary(prefs: UserDrinkPreferences): string {
  const parts: string[] = [];

  // Primary category
  if (prefs.primaryCategory) {
    const categoryName = prefs.primaryCategory === 'non-alcoholic' ? 'non-alcoholic drinks' : `${prefs.primaryCategory}s`;
    parts.push(`Prefers ${categoryName}`);
  }

  // Flavor profile
  if (prefs.flavorProfile) {
    parts.push(`enjoys ${prefs.flavorProfile} flavors`);
  }

  // Strength preference
  if (prefs.strengthPreference) {
    parts.push(`likes ${prefs.strengthPreference} strength drinks`);
  }

  // Adventure level
  if (prefs.adventureLevel) {
    const adventureMap = {
      classic: 'traditional choices',
      bold: 'bold experiments',
      fruity: 'fruity options',
      simple: 'simple drinks',
    };
    parts.push(`gravitates toward ${adventureMap[prefs.adventureLevel]}`);
  }

  // Allergies
  if (prefs.allergies && !prefs.allergies.includes('none')) {
    parts.push(`avoids ${prefs.allergies.join(', ')}`);
  }

  // Weather preferences
  if (prefs.useWeatherRecommendations) {
    parts.push('considers weather in recommendations');
  }

  return parts.length > 0 ? parts.join(', ') : 'No specific preferences set';
}

/**
 * Create a preferences export object for premium users
 */
export function createPreferencesExport(
  prefs: UserDrinkPreferences,
  userMetadata?: {
    totalDrinksLiked?: number;
    totalOrdersPlaced?: number;
    memberSince?: string;
  }
): string {
  const exportData = {
    preferences: prefs,
    exportDate: new Date().toISOString(),
    version: '1.0',
    userMetadata: {
      totalDrinksLiked: userMetadata?.totalDrinksLiked || 0,
      totalOrdersPlaced: userMetadata?.totalOrdersPlaced || 0,
      memberSince: userMetadata?.memberSince || new Date().toISOString(),
    },
    formatVersion: 1,
    appVersion: '1.0.0',
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Parse and validate an imported preferences file
 */
export function parsePreferencesImport(importData: string): {
  success: boolean;
  preferences?: UserDrinkPreferences;
  error?: string;
} {
  try {
    const parsed = JSON.parse(importData);
    
    // Validate structure
    if (!parsed.preferences) {
      return { success: false, error: 'Invalid import format: missing preferences' };
    }

    // Validate preferences structure
    const validation = validateUserPreferences(parsed.preferences);
    if (!validation.isValid) {
      return { 
        success: false, 
        error: `Invalid preferences: ${validation.errors.join(', ')}` 
      };
    }

    // Merge with defaults to ensure all fields exist
    const preferences: UserDrinkPreferences = {
      ...DEFAULT_PREFERENCES,
      ...parsed.preferences,
      lastUpdated: new Date().toISOString(),
      source: 'imported',
      version: (parsed.preferences.version || 0) + 1,
    };

    return { success: true, preferences };
  } catch (error) {
    return { 
      success: false, 
      error: `Failed to parse import file: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Check if user preferences are significantly different from defaults
 */
export function hasCustomizedPreferences(prefs: UserDrinkPreferences): boolean {
  const significantFields: (keyof UserDrinkPreferences)[] = [
    'primaryCategory',
    'flavorProfile',
    'strengthPreference',
    'adventureLevel',
  ];

  return significantFields.some(field => {
    const userValue = prefs[field];
    const defaultValue = DEFAULT_PREFERENCES[field];
    return userValue !== defaultValue && userValue !== null;
  });
}

/**
 * Get recommendations for improving user preferences completeness
 */
export function getPreferenceImprovementSuggestions(prefs: UserDrinkPreferences): string[] {
  const suggestions: string[] = [];

  if (!prefs.primaryCategory) {
    suggestions.push('Set a primary drink category for better recommendations');
  }

  if (!prefs.flavorProfile) {
    suggestions.push('Choose a flavor profile to refine your taste preferences');
  }

  if (prefs.preferredOccasions.length === 0) {
    suggestions.push('Add some preferred occasions to get contextual recommendations');
  }

  if (prefs.secondaryCategories.length === 0 && prefs.primaryCategory) {
    suggestions.push('Consider adding secondary categories to diversify your options');
  }

  if (!prefs.temperaturePreference) {
    suggestions.push('Set a temperature preference for season-appropriate suggestions');
  }

  return suggestions;
}