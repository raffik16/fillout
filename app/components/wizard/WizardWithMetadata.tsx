'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { WizardPreferences } from '../../types/wizard';
import { clientWizardIntegration } from '../../../lib/clerk/wizard-integration-client';

interface WizardWithMetadataProps {
  onComplete?: (preferences: WizardPreferences) => void;
  showPersonalizedSuggestions?: boolean;
}

/**
 * Enhanced Wizard component that integrates with Clerk metadata
 * This component demonstrates how to connect the existing wizard system
 * with the new metadata structure
 */
export function WizardWithMetadata({ 
  onComplete, 
  showPersonalizedSuggestions = true 
}: WizardWithMetadataProps) {
  const { user, isLoaded } = useUser();
  const [preferences, setPreferences] = useState<WizardPreferences>({
    category: null,
    flavor: null,
    temperature: null,
    adventure: null,
    strength: null,
    occasion: null,
    allergies: null,
    useWeather: false
  });
  const [suggestions, setSuggestions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedPrevious, setHasLoadedPrevious] = useState(false);

  // Load previous results and suggestions when user is loaded
  useEffect(() => {
    if (isLoaded && user && !hasLoadedPrevious) {
      loadPreviousResultsAndSuggestions();
    }
  }, [isLoaded, user, hasLoadedPrevious]);

  const loadPreviousResultsAndSuggestions = async () => {
    try {
      setIsLoading(true);
      
      // Load previous wizard results
      const previousResults = await clientWizardIntegration.loadPreviousResults();
      if (previousResults) {
        setPreferences(previousResults);
      }

      // Load personalized suggestions if enabled
      if (showPersonalizedSuggestions) {
        const personalizedSuggestions = await clientWizardIntegration.getPersonalizedSuggestions();
        setSuggestions(personalizedSuggestions);
      }

      setHasLoadedPrevious(true);
    } catch (error) {
      console.error('Error loading previous results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async (updatedPreferences: WizardPreferences) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Save to Clerk metadata
      await clientWizardIntegration.saveWizardResults(updatedPreferences);
      
      // Update local state
      setPreferences(updatedPreferences);
      
      // Call parent completion handler
      onComplete?.(updatedPreferences);
      
    } catch (error) {
      console.error('Error saving wizard preferences:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof WizardPreferences, value: any) => {
    const updatedPreferences = {
      ...preferences,
      [key]: value
    };
    setPreferences(updatedPreferences);
  };

  // Show loading state while user is loading or data is being fetched
  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          Loading your preferences...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Personalized Suggestions */}
      {suggestions && suggestions.hasHistory && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Welcome back! 🎉
          </h3>
          <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
            Based on your previous choices, we've pre-filled your preferences. 
            {suggestions.suggestedCategory && (
              <span> We noticed you enjoy <strong>{suggestions.suggestedCategory}</strong> drinks!</span>
            )}
          </p>
          
          {suggestions.favoriteCategories.length > 0 && (
            <div className="text-xs text-blue-700 dark:text-blue-300">
              Your favorite categories: {suggestions.favoriteCategories
                .slice(0, 3)
                .map((cat: any) => `${cat.category} (${cat.count})`)
                .join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Wizard Form - This would be your existing wizard component */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Drink Preference Wizard
        </h2>
        
        {/* Example wizard steps - replace with your actual wizard component */}
        <div className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Category
            </label>
            <select
              value={preferences.category || ''}
              onChange={(e) => handlePreferenceChange('category', e.target.value || null)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="">Select a category...</option>
              <option value="cocktail">Cocktails</option>
              <option value="beer">Beer & Cider</option>
              <option value="wine">Wine</option>
              <option value="spirit">Spirits</option>
              <option value="non-alcoholic">Non-Alcoholic</option>
            </select>
          </div>

          {/* Flavor Profile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Flavor Profile
            </label>
            <select
              value={preferences.flavor || ''}
              onChange={(e) => handlePreferenceChange('flavor', e.target.value || null)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="">Select a flavor...</option>
              <option value="crisp">Crisp</option>
              <option value="smokey">Smokey</option>
              <option value="sweet">Sweet</option>
              <option value="bitter">Bitter</option>
              <option value="sour">Sour</option>
              <option value="smooth">Smooth</option>
            </select>
          </div>

          {/* Strength Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Strength Preference
            </label>
            <select
              value={preferences.strength || ''}
              onChange={(e) => handlePreferenceChange('strength', e.target.value || null)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="">Select strength...</option>
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="strong">Strong</option>
            </select>
          </div>

          {/* Weather Integration */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useWeather"
              checked={preferences.useWeather}
              onChange={(e) => handlePreferenceChange('useWeather', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="useWeather" className="text-sm text-gray-700 dark:text-gray-300">
              Use weather information for recommendations
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={() => handleSavePreferences(preferences)}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {/* Authentication Prompt for Non-Users */}
      {!user && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            <strong>Sign in to save your preferences!</strong> Create an account to save your drink preferences 
            and get personalized recommendations every time you visit.
          </p>
        </div>
      )}
    </div>
  );
}