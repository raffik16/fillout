'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Droplets, Coffee, Grape, Apple, Sparkles, Info } from 'lucide-react';
import { Card, CardContent } from '@/app/components/ui/Card';
import { UserDrinkPreferences, PreferenceValidation, PreferenceIntensity } from '@/app/types/preferences';
import { FlavorProfile } from '@/app/types/wizard';
import { cn } from '@/lib/utils';

interface FlavorPreferencesProps {
  preferences: UserDrinkPreferences;
  onChange: (updates: Partial<UserDrinkPreferences>) => void;
  errors: PreferenceValidation[];
}

// Flavor profile metadata with icons and descriptions
const FLAVOR_PROFILES: Record<FlavorProfile, {
  icon: typeof Thermometer;
  color: string;
  description: string;
  examples: string[];
}> = {
  crisp: {
    icon: Droplets,
    color: 'blue',
    description: 'Clean, refreshing drinks with bright acidity',
    examples: ['Pinot Grigio', 'Gin & Tonic', 'Pilsner'],
  },
  smokey: {
    icon: Coffee,
    color: 'gray',
    description: 'Rich, earthy flavors with depth and complexity',
    examples: ['Mezcal', 'Peated Scotch', 'Smoked Old Fashioned'],
  },
  sweet: {
    icon: Apple,
    color: 'pink',
    description: 'Dessert-like drinks with natural or added sweetness',
    examples: ['Moscato', 'Mudslide', 'Piña Colada'],
  },
  bitter: {
    icon: Coffee,
    color: 'green',
    description: 'Bold, sophisticated drinks with herbal complexity',
    examples: ['IPA', 'Negroni', 'Campari Spritz'],
  },
  sour: {
    icon: Grape,
    color: 'yellow',
    description: 'Tart, acidic drinks that pucker and refresh',
    examples: ['Whiskey Sour', 'Sauvignon Blanc', 'Margarita'],
  },
  smooth: {
    icon: Sparkles,
    color: 'purple',
    description: 'Velvety, well-balanced drinks without harsh edges',
    examples: ['Aged Whiskey', 'Malbec', 'Espresso Martini'],
  },
};

const INTENSITY_LEVELS: Record<PreferenceIntensity, {
  label: string;
  description: string;
  color: string;
}> = {
  low: {
    label: 'Subtle',
    description: 'Just a hint of this flavor',
    color: 'gray',
  },
  medium: {
    label: 'Balanced',
    description: 'Noticeable but not overwhelming',
    color: 'amber',
  },
  high: {
    label: 'Bold',
    description: 'Strong, pronounced flavor',
    color: 'red',
  },
};

export default function FlavorPreferences({ preferences, onChange, errors }: FlavorPreferencesProps) {
  const [selectedFlavor, setSelectedFlavor] = useState<FlavorProfile | null>(preferences.flavorProfile);

  const handlePrimaryFlavorChange = (flavor: FlavorProfile) => {
    setSelectedFlavor(flavor);
    onChange({
      flavorProfile: flavor,
      flavorIntensities: {
        ...preferences.flavorIntensities,
        [flavor]: 'high', // Set primary flavor to high intensity
      },
    });
  };

  const handleIntensityChange = (flavor: FlavorProfile, intensity: PreferenceIntensity) => {
    onChange({
      flavorIntensities: {
        ...preferences.flavorIntensities,
        [flavor]: intensity,
      },
    });
  };

  const getColorClasses = (color: string, isActive: boolean = false) => {
    const colors = {
      blue: isActive ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-200' : 'border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/10',
      gray: isActive ? 'bg-gray-100 dark:bg-gray-900/30 border-gray-500 text-gray-800 dark:text-gray-200' : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900/10',
      pink: isActive ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-500 text-pink-800 dark:text-pink-200' : 'border-pink-200 hover:bg-pink-50 dark:hover:bg-pink-900/10',
      green: isActive ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200' : 'border-green-200 hover:bg-green-50 dark:hover:bg-green-900/10',
      yellow: isActive ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-800 dark:text-yellow-200' : 'border-yellow-200 hover:bg-yellow-50 dark:hover:bg-yellow-900/10',
      purple: isActive ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-800 dark:text-purple-200' : 'border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/10',
      amber: isActive ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-500 text-amber-800 dark:text-amber-200' : 'border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/10',
      red: isActive ? 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-200' : 'border-red-200 hover:bg-red-50 dark:hover:bg-red-900/10',
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Flavor Preferences
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your taste profile to get better drink recommendations
        </p>
      </div>

      {/* Primary Flavor Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Primary Flavor Profile
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose your preferred taste category - this will be prioritized in recommendations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.entries(FLAVOR_PROFILES) as [FlavorProfile, typeof FLAVOR_PROFILES[FlavorProfile]][]).map(([flavor, config]) => {
              const Icon = config.icon;
              const isSelected = selectedFlavor === flavor;

              return (
                <motion.button
                  key={flavor}
                  onClick={() => handlePrimaryFlavorChange(flavor)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all duration-200',
                    getColorClasses(config.color, isSelected),
                    'hover:shadow-md'
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium capitalize">{flavor}</span>
                  </div>
                  <p className="text-sm opacity-80 mb-2">{config.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {config.examples.slice(0, 2).map((example) => (
                      <span
                        key={example}
                        className="text-xs px-2 py-1 bg-black/10 dark:bg-white/10 rounded-full"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Flavor Intensity Settings */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Flavor Intensity Preferences
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Fine-tune how much of each flavor you enjoy in your drinks
            </p>
          </div>

          <div className="space-y-6">
            {(Object.entries(FLAVOR_PROFILES) as [FlavorProfile, typeof FLAVOR_PROFILES[FlavorProfile]][]).map(([flavor, config]) => {
              const Icon = config.icon;
              const currentIntensity = preferences.flavorIntensities[flavor];
              const isPrimary = selectedFlavor === flavor;

              return (
                <div key={flavor} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Icon className={cn('w-5 h-5', isPrimary && 'text-amber-600 dark:text-amber-400')} />
                    <span className={cn(
                      'font-medium capitalize',
                      isPrimary && 'text-amber-800 dark:text-amber-200'
                    )}>
                      {flavor}
                    </span>
                    {isPrimary && (
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(INTENSITY_LEVELS) as [PreferenceIntensity, typeof INTENSITY_LEVELS[PreferenceIntensity]][]).map(([intensity, intensityConfig]) => {
                      const isSelected = currentIntensity === intensity;

                      return (
                        <motion.button
                          key={intensity}
                          onClick={() => handleIntensityChange(flavor, intensity)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            'p-3 rounded-lg border text-center transition-all duration-200',
                            isSelected
                              ? getColorClasses(intensityConfig.color, true)
                              : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                          )}
                        >
                          <div className="font-medium text-sm">{intensityConfig.label}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {intensityConfig.description}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Flavor Insights */}
      {selectedFlavor && (
        <Card className="bg-gradient-to-br from-amber-50 to-blue-50 dark:from-amber-900/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Your Flavor Profile Insights
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Based on your preference for <strong>{selectedFlavor}</strong> flavors, 
                  we'll recommend drinks that are {FLAVOR_PROFILES[selectedFlavor].description.toLowerCase()}.
                </p>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Perfect matches:</span>
                    <span className="text-gray-700 dark:text-gray-300 ml-2">
                      {FLAVOR_PROFILES[selectedFlavor].examples.join(', ')}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-100">High intensity preferences:</span>
                    <span className="text-gray-700 dark:text-gray-300 ml-2">
                      {Object.entries(preferences.flavorIntensities)
                        .filter(([, intensity]) => intensity === 'high')
                        .map(([flavor]) => flavor)
                        .join(', ') || 'None selected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}