'use client';

import { WizardPreferences } from '../../app/types/wizard';

/**
 * Client-side version of wizard integration for use in React components
 */
export const clientWizardIntegration = {
  /**
   * Save wizard results via API
   */
  async saveWizardResults(wizardPreferences: WizardPreferences): Promise<void> {
    try {
      const response = await fetch('/api/wizard/save-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wizardPreferences),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save wizard results');
      }
    } catch (error) {
      console.error('Error saving wizard results:', error);
      throw error;
    }
  },

  /**
   * Load previous wizard results via API
   */
  async loadPreviousResults(): Promise<WizardPreferences | null> {
    try {
      const response = await fetch('/api/wizard/load-preferences');
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No previous results
        }
        throw new Error('Failed to load wizard results');
      }
      
      const data = await response.json();
      return data.preferences;
    } catch (error) {
      console.error('Error loading wizard results:', error);
      return null;
    }
  },

  /**
   * Get personalized suggestions via API
   */
  async getPersonalizedSuggestions() {
    try {
      const response = await fetch('/api/wizard/suggestions');
      
      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }
      
      const data = await response.json();
      return data.suggestions;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return {
        suggestedCategory: null,
        previousPreferences: null,
        hasHistory: false,
        favoriteCategories: []
      };
    }
  }
};