'use client';

import { useState, useEffect } from 'react';
import { UserDrinkPreferences, DEFAULT_PREFERENCES } from '@/app/types/preferences';
import { validateUserPreferences, createPreferencesExport } from './preference-utils';

// Mock hook since authentication is removed
export function useDrinkPreferences() {
  const [preferences, setPreferences] = useState<UserDrinkPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(true);

  // Since authentication is removed, always return defaults
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const updatePreferences = async (newPrefs: UserDrinkPreferences, sync = true) => {
    setPreferences(newPrefs);
    // In a real app, this would sync to backend
    return Promise.resolve();
  };

  const resetPreferences = async () => {
    setPreferences(DEFAULT_PREFERENCES);
    return Promise.resolve();
  };

  const exportPreferences = () => {
    return createPreferencesExport(preferences);
  };

  const validatePreferences = (prefs: UserDrinkPreferences) => {
    const validation = validateUserPreferences(prefs);
    return validation.errors.map(error => error);
  };

  return {
    preferences,
    isLoaded,
    updatePreferences,
    resetPreferences,
    exportPreferences,
    validatePreferences,
    isAuthenticated: false, // Authentication is removed
  };
}

export class PreferenceManager {
  static calculatePreferenceCompleteness(prefs: UserDrinkPreferences): number {
    const validation = validateUserPreferences(prefs);
    return validation.completeness;
  }
}