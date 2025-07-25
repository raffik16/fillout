'use client';

import { useUser } from '@clerk/nextjs';
import { UserDrinkPreferences, DEFAULT_PREFERENCES, PreferenceChange } from '@/app/types/preferences';
import { debounce } from '@/lib/utils';

// Clerk metadata keys
const PREFERENCES_KEY = 'drinkPreferences';
const PREFERENCE_HISTORY_KEY = 'preferenceHistory';

// Custom hook for managing drink preferences in Clerk metadata
export function useDrinkPreferences() {
  const { user, isLoaded } = useUser();

  // Get current preferences from Clerk metadata
  const getPreferences = (): UserDrinkPreferences => {
    if (!user?.publicMetadata?.[PREFERENCES_KEY]) {
      return DEFAULT_PREFERENCES;
    }
    
    try {
      const stored = user.publicMetadata[PREFERENCES_KEY] as UserDrinkPreferences;
      // Merge with defaults to ensure all fields exist
      return { ...DEFAULT_PREFERENCES, ...stored };
    } catch (error) {
      console.warn('Failed to parse preferences from Clerk metadata:', error);
      return DEFAULT_PREFERENCES;
    }
  };

  // Save preferences to Clerk metadata
  const savePreferences = async (preferences: UserDrinkPreferences): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updatedPreferences = {
      ...preferences,
      lastUpdated: new Date().toISOString(),
      version: (preferences.version || 0) + 1,
    };

    try {
      await user.update({
        publicMetadata: {
          ...user.publicMetadata,
          [PREFERENCES_KEY]: updatedPreferences,
        },
      });
    } catch (error) {
      console.error('Failed to save preferences to Clerk:', error);
      throw new Error('Failed to save preferences. Please try again.');
    }
  };

  // Debounced save function for auto-save functionality
  const debouncedSave = debounce(savePreferences, 1000);

  // Update a specific preference field
  const updatePreference = async <K extends keyof UserDrinkPreferences>(
    field: K,
    value: UserDrinkPreferences[K],
    autoSave = true
  ): Promise<void> => {
    const currentPrefs = getPreferences();
    const oldValue = currentPrefs[field];
    
    // Create change record
    const change: PreferenceChange = {
      field,
      oldValue,
      newValue: value,
      timestamp: new Date().toISOString(),
    };

    const updatedPreferences = {
      ...currentPrefs,
      [field]: value,
    };

    // Save change to history
    await saveChangeHistory(change);

    if (autoSave) {
      await debouncedSave(updatedPreferences);
    } else {
      await savePreferences(updatedPreferences);
    }
  };

  // Batch update multiple preferences
  const updatePreferences = async (
    updates: Partial<UserDrinkPreferences>,
    autoSave = true
  ): Promise<void> => {
    const currentPrefs = getPreferences();
    const updatedPreferences = { ...currentPrefs, ...updates };

    if (autoSave) {
      await debouncedSave(updatedPreferences);
    } else {
      await savePreferences(updatedPreferences);
    }
  };

  // Save preference change history
  const saveChangeHistory = async (change: PreferenceChange): Promise<void> => {
    if (!user) return;

    try {
      const currentHistory = (user.publicMetadata[PREFERENCE_HISTORY_KEY] as PreferenceChange[]) || [];
      const updatedHistory = [...currentHistory, change].slice(-50); // Keep last 50 changes

      await user.update({
        publicMetadata: {
          ...user.publicMetadata,
          [PREFERENCE_HISTORY_KEY]: updatedHistory,
        },
      });
    } catch (error) {
      console.warn('Failed to save preference change history:', error);
    }
  };

  // Get preference change history
  const getChangeHistory = (): PreferenceChange[] => {
    if (!user?.publicMetadata?.[PREFERENCE_HISTORY_KEY]) {
      return [];
    }
    return user.publicMetadata[PREFERENCE_HISTORY_KEY] as PreferenceChange[];
  };

  // Reset preferences to defaults
  const resetPreferences = async (): Promise<void> => {
    await savePreferences(DEFAULT_PREFERENCES);
  };

  // Import preferences from external source
  const importPreferences = async (
    importedPrefs: Partial<UserDrinkPreferences>,
    source: 'wizard' | 'export' | 'manual' = 'manual'
  ): Promise<void> => {
    const merged = {
      ...DEFAULT_PREFERENCES,
      ...importedPrefs,
      lastUpdated: new Date().toISOString(),
      source,
    };
    await savePreferences(merged);
  };

  // Export preferences for backup/sharing
  const exportPreferences = (): string => {
    const preferences = getPreferences();
    const exportData = {
      preferences,
      exportDate: new Date().toISOString(),
      version: '1.0',
      userMetadata: {
        totalDrinksLiked: user?.publicMetadata?.totalDrinksLiked || 0,
        totalOrdersPlaced: user?.publicMetadata?.totalOrdersPlaced || 0,
        memberSince: user?.createdAt || new Date().toISOString(),
      },
    };
    return JSON.stringify(exportData, null, 2);
  };

  // Validate preferences object
  const validatePreferences = (prefs: Partial<UserDrinkPreferences>): string[] => {
    const errors: string[] = [];

    // Validate allergies
    if (prefs.allergies && prefs.allergies.length === 0) {
      errors.push('At least one allergy option must be selected');
    }

    // Validate category preferences priorities
    if (prefs.categoryPreferences) {
      Object.entries(prefs.categoryPreferences).forEach(([category, settings]) => {
        if (settings.priority < 1 || settings.priority > 10) {
          errors.push(`${category} priority must be between 1 and 10`);
        }
      });
    }

    return errors;
  };

  return {
    preferences: getPreferences(),
    isLoaded,
    savePreferences,
    updatePreference,
    updatePreferences,
    resetPreferences,
    importPreferences,
    exportPreferences,
    getChangeHistory,
    validatePreferences,
    isAuthenticated: !!user,
  };
}

// Utility functions for preference management
export class PreferenceManager {
  static async syncFromWizard(
    wizardPreferences: any,
    existingPreferences: UserDrinkPreferences
  ): Promise<UserDrinkPreferences> {
    const merged = {
      ...existingPreferences,
      primaryCategory: wizardPreferences.category,
      flavorProfile: wizardPreferences.flavor,
      temperaturePreference: wizardPreferences.temperature,
      adventureLevel: wizardPreferences.adventure,
      strengthPreference: wizardPreferences.strength,
      preferredOccasions: wizardPreferences.occasion ? [wizardPreferences.occasion] : existingPreferences.preferredOccasions,
      allergies: wizardPreferences.allergies || ['none'],
      useWeatherRecommendations: wizardPreferences.useWeather,
      lastUpdated: new Date().toISOString(),
      source: 'wizard' as const,
    };

    return merged;
  }

  static calculatePreferenceCompleteness(preferences: UserDrinkPreferences): number {
    const requiredFields = [
      'primaryCategory',
      'flavorProfile',
      'temperaturePreference',
      'adventureLevel', 
      'strengthPreference',
    ];

    const optionalFields = [
      'secondaryCategories',
      'preferredOccasions',
      'allergies',
    ];

    const requiredScore = requiredFields.reduce((score, field) => {
      return score + (preferences[field as keyof UserDrinkPreferences] ? 20 : 0);
    }, 0);

    const optionalScore = optionalFields.reduce((score, field) => {
      const value = preferences[field as keyof UserDrinkPreferences];
      if (Array.isArray(value)) {
        return score + (value.length > 0 ? 5 : 0);
      }
      return score + (value ? 5 : 0);
    }, 0);

    return Math.min(100, requiredScore + optionalScore);
  }

  static generateRecommendationSummary(preferences: UserDrinkPreferences): string {
    const parts: string[] = [];

    if (preferences.primaryCategory) {
      parts.push(`Prefers ${preferences.primaryCategory}s`);
    }

    if (preferences.flavorProfile) {
      parts.push(`${preferences.flavorProfile} flavors`);
    }

    if (preferences.strengthPreference) {
      parts.push(`${preferences.strengthPreference} strength`);
    }

    if (preferences.allergies && !preferences.allergies.includes('none')) {
      parts.push(`avoids ${preferences.allergies.join(', ')}`);
    }

    return parts.join(', ') || 'No specific preferences set';
  }
}