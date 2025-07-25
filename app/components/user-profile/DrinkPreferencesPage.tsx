'use client';

import React, { useState, useEffect } from 'react';
import { useDrinkPreferences, updateUserMetadata, prepareMetadataForUpdate } from '../../../lib/clerk/client';
import { DrinkPreferences } from '../../types/clerk-metadata';
import { WizardPreferences, DrinkCategory, FlavorProfile, StrengthPreference, OccasionMood, AllergyType } from '../../types/wizard';

interface DrinkPreferencesPageProps {
  onUpdate?: (preferences: DrinkPreferences) => void;
}

export function DrinkPreferencesPage({ onUpdate }: DrinkPreferencesPageProps) {
  const currentPreferences = useDrinkPreferences();
  const [preferences, setPreferences] = useState<DrinkPreferences>(currentPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when current preferences change
  useEffect(() => {
    setPreferences(currentPreferences);
  }, [currentPreferences]);

  // Track changes
  useEffect(() => {
    const hasChanged = JSON.stringify(preferences) !== JSON.stringify(currentPreferences);
    setHasChanges(hasChanged);
  }, [preferences, currentPreferences]);

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsLoading(true);
    try {
      const updatedPreferences = prepareMetadataForUpdate('drinkPreferences', preferences);
      await updateUserMetadata('drinkPreferences', updatedPreferences);
      onUpdate?.(updatedPreferences);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPreferences(currentPreferences);
  };

  const categories: { value: DrinkCategory; label: string; emoji: string }[] = [
    { value: 'cocktail', label: 'Cocktails', emoji: '🍸' },
    { value: 'beer', label: 'Beer & Cider', emoji: '🍺' },
    { value: 'wine', label: 'Wine', emoji: '🍷' },
    { value: 'spirit', label: 'Spirits', emoji: '🥃' },
    { value: 'non-alcoholic', label: 'Non-Alcoholic', emoji: '🥤' },
    { value: 'any', label: 'Surprise Me', emoji: '🎲' },
  ];

  const flavors: { value: FlavorProfile; label: string; emoji: string }[] = [
    { value: 'crisp', label: 'Crisp', emoji: '❄️' },
    { value: 'smokey', label: 'Smokey', emoji: '🔥' },
    { value: 'sweet', label: 'Sweet Tooth', emoji: '🍯' },
    { value: 'bitter', label: 'Bitter is Better', emoji: '🌿' },
    { value: 'sour', label: 'Sour Power', emoji: '🍋' },
    { value: 'smooth', label: 'Smooth Operator', emoji: '🌊' },
  ];

  const strengths: { value: StrengthPreference; label: string; emoji: string }[] = [
    { value: 'light', label: 'Easy Going', emoji: '🌤️' },
    { value: 'medium', label: 'Balanced', emoji: '⚖️' },
    { value: 'strong', label: 'Bring the Power', emoji: '⚡' },
  ];

  const occasions: { value: OccasionMood; label: string; emoji: string }[] = [
    { value: 'casual', label: 'Happy Hour', emoji: '🎉' },
    { value: 'party', label: 'Celebrating', emoji: '🎊' },
    { value: 'business', label: 'Business Meeting', emoji: '💼' },
    { value: 'romantic', label: 'Romantic Dinner', emoji: '💕' },
    { value: 'sports', label: 'Game Day', emoji: '🏈' },
    { value: 'exploring', label: 'Exploring The Bar', emoji: '🧭' },
    { value: 'newly21', label: 'Newly 21', emoji: '🎂' },
    { value: 'birthday', label: 'Birthday', emoji: '🎈' },
  ];

  const allergies: { value: AllergyType; label: string }[] = [
    { value: 'gluten', label: 'Gluten' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'nuts', label: 'Nuts' },
    { value: 'eggs', label: 'Eggs' },
    { value: 'soy', label: 'Soy' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Drink Preferences
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Customize your drink recommendations to match your taste
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
        {/* Category Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Preferred Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setPreferences(prev => ({ ...prev, category: category.value }))}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  preferences.category === category.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">{category.emoji}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {category.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Flavor Profile */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Flavor Profile
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {flavors.map((flavor) => (
              <button
                key={flavor.value}
                onClick={() => setPreferences(prev => ({ ...prev, flavor: flavor.value }))}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  preferences.flavor === flavor.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">{flavor.emoji}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {flavor.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Strength Preference */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Strength Preference
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {strengths.map((strength) => (
              <button
                key={strength.value}
                onClick={() => setPreferences(prev => ({ ...prev, strength: strength.value }))}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  preferences.strength === strength.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">{strength.emoji}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {strength.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Occasion */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Preferred Occasion
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {occasions.map((occasion) => (
              <button
                key={occasion.value}
                onClick={() => setPreferences(prev => ({ ...prev, occasion: occasion.value }))}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  preferences.occasion === occasion.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="text-xl mb-1">{occasion.emoji}</div>
                <div className="text-xs font-medium text-gray-900 dark:text-white">
                  {occasion.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Allergies & Dietary Restrictions
          </h3>
          <div className="space-y-2">
            {allergies.map((allergy) => (
              <label key={allergy.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.allergies.includes(allergy.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPreferences(prev => ({
                        ...prev,
                        allergies: [...prev.allergies, allergy.value]
                      }));
                    } else {
                      setPreferences(prev => ({
                        ...prev,
                        allergies: prev.allergies.filter(a => a !== allergy.value)
                      }));
                    }
                  }}
                  className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white">{allergy.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Weather Integration */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Weather Integration
          </h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.useWeather}
              onChange={(e) => setPreferences(prev => ({ ...prev, useWeather: e.target.checked }))}
              className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-900 dark:text-white">
              Use weather information for recommendations
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}