'use client';

import React, { useState, useEffect } from 'react';
import { useAIChatPreferences, updateUserMetadata, prepareMetadataForUpdate } from '../../../lib/clerk/client';
import { AIChatPreferences } from '../../types/clerk-metadata';

interface AIChatPreferencesPageProps {
  onUpdate?: (preferences: AIChatPreferences) => void;
}

export function AIChatPreferencesPage({ onUpdate }: AIChatPreferencesPageProps) {
  const currentPreferences = useAIChatPreferences();
  const [preferences, setPreferences] = useState<AIChatPreferences>(currentPreferences);
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
      const updatedPreferences = prepareMetadataForUpdate('aiChatPreferences', preferences);
      await updateUserMetadata('aiChatPreferences', updatedPreferences);
      onUpdate?.(updatedPreferences);
    } catch (error) {
      console.error('Failed to save AI chat preferences:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPreferences(currentPreferences);
  };

  const availableFeatures = [
    {
      value: 'recommendations' as const,
      label: 'Drink Recommendations',
      description: 'Get personalized drink suggestions based on your preferences',
      icon: '🍹'
    },
    {
      value: 'explanations' as const,
      label: 'Drink Explanations',
      description: 'Learn about drink ingredients, history, and tasting notes',
      icon: '📚'
    },
    {
      value: 'recipes' as const,
      label: 'Recipe Instructions',
      description: 'Get detailed recipes and preparation instructions',
      icon: '👨‍🍳'
    },
    {
      value: 'pairings' as const,
      label: 'Food Pairings',
      description: 'Discover food combinations that complement your drinks',
      icon: '🍽️'
    }
  ];

  const toneOptions = [
    {
      value: 'casual' as const,
      label: 'Casual',
      description: 'Relaxed and friendly conversation',
      icon: '😊'
    },
    {
      value: 'professional' as const,
      label: 'Professional',
      description: 'Formal and informative responses',
      icon: '💼'
    },
    {
      value: 'friendly' as const,
      label: 'Friendly',
      description: 'Warm and enthusiastic interaction',
      icon: '🤗'
    },
    {
      value: 'expert' as const,
      label: 'Expert',
      description: 'Technical and detailed explanations',
      icon: '🧠'
    }
  ];

  const toggleFeature = (feature: typeof availableFeatures[0]['value']) => {
    setPreferences(prev => ({
      ...prev,
      enabledFeatures: prev.enabledFeatures.includes(feature)
        ? prev.enabledFeatures.filter(f => f !== feature)
        : [...prev.enabledFeatures, feature]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AI Chat Preferences
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Customize your AI assistant experience for personalized drink guidance
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-8">
        {/* Enabled Features */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            AI Features
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose which AI features you'd like to use in your conversations
          </p>
          <div className="space-y-4">
            {availableFeatures.map((feature) => (
              <div
                key={feature.value}
                className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <input
                  type="checkbox"
                  id={feature.value}
                  checked={preferences.enabledFeatures.includes(feature.value)}
                  onChange={() => toggleFeature(feature.value)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label
                    htmlFor={feature.value}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <span className="text-xl">{feature.icon}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {feature.label}
                    </span>
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation Tone */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Conversation Tone
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select how you'd like the AI to communicate with you
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toneOptions.map((tone) => (
              <button
                key={tone.value}
                onClick={() => setPreferences(prev => ({ ...prev, preferredTone: tone.value }))}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  preferences.preferredTone === tone.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{tone.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {tone.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tone.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Privacy Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="chatHistory"
                checked={preferences.chatHistory}
                onChange={(e) => setPreferences(prev => ({ ...prev, chatHistory: e.target.checked }))}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <label htmlFor="chatHistory" className="font-medium text-gray-900 dark:text-white cursor-pointer">
                  Save Chat History
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Allow the AI to remember previous conversations for better recommendations
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="personalizedResponses"
                checked={preferences.personalizedResponses}
                onChange={(e) => setPreferences(prev => ({ ...prev, personalizedResponses: e.target.checked }))}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <label htmlFor="personalizedResponses" className="font-medium text-gray-900 dark:text-white cursor-pointer">
                  Personalized Responses
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use your drink preferences and favorites to provide tailored recommendations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Preview: AI Response Style
          </h4>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {preferences.preferredTone === 'casual' && "Hey! Looking for something refreshing? Based on your love for crisp flavors, I'd suggest trying a Moscow Mule - it's got that perfect ginger kick!"}
            {preferences.preferredTone === 'professional' && "Based on your preference for crisp flavor profiles, I recommend the Moscow Mule, which features ginger beer's carbonation and lime's acidity for a refreshing experience."}
            {preferences.preferredTone === 'friendly' && "Oh, you&apos;re going to love this! Since you enjoy crisp drinks, I have the perfect suggestion - a Moscow Mule! It&apos;s zingy, refreshing, and absolutely delicious. Want to know how to make it?"}
            {preferences.preferredTone === 'expert' && "Given your preference for crisp flavor profiles, I recommend the Moscow Mule (vodka, ginger beer, lime juice). The ginger beer provides effervescence and spice, while lime contributes citric acid for tartness, creating a balanced, refreshing cocktail typically served in a copper mug to enhance thermal conductivity."}
          </div>
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