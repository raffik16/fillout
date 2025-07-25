'use client';

import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  Wine, 
  Beer, 
  Coffee, 
  Grape, 
  Leaf, 
  Dice1, 
  Star, 
  GripVertical,
  Plus,
  Minus,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { UserDrinkPreferences, PreferenceValidation, PreferenceIntensity } from '@/app/types/preferences';
import { DrinkCategory } from '@/app/types/wizard';
import { cn } from '@/lib/utils';

interface CategoryPreferencesProps {
  preferences: UserDrinkPreferences;
  onChange: (updates: Partial<UserDrinkPreferences>) => void;
  errors: PreferenceValidation[];
}

// Category metadata with icons and descriptions
const CATEGORY_CONFIG: Record<DrinkCategory, {
  icon: typeof Wine;
  color: string;
  description: string;
  examples: string[];
  keywords: string[];
}> = {
  cocktail: {
    icon: Wine,
    color: 'purple',
    description: 'Mixed drinks with multiple ingredients',
    examples: ['Margarita', 'Old Fashioned', 'Mojito', 'Negroni'],
    keywords: ['Mixed', 'Crafted', 'Complex', 'Artisanal'],
  },
  beer: {
    icon: Beer,
    color: 'amber',
    description: 'Brewed beverages including beer and cider',
    examples: ['IPA', 'Lager', 'Wheat Beer', 'Hard Cider'],
    keywords: ['Brewed', 'Hoppy', 'Malty', 'Refreshing'],
  },
  wine: {
    icon: Grape,
    color: 'red',
    description: 'Fermented grape beverages',
    examples: ['Chardonnay', 'Pinot Noir', 'Rosé', 'Champagne'],
    keywords: ['Elegant', 'Sophisticated', 'Aged', 'Terroir'],
  },
  spirit: {
    icon: Coffee,
    color: 'orange',
    description: 'Distilled alcoholic beverages',
    examples: ['Whiskey', 'Vodka', 'Gin', 'Rum'],
    keywords: ['Pure', 'Strong', 'Smooth', 'Premium'],
  },
  'non-alcoholic': {
    icon: Leaf,
    color: 'green',
    description: 'Alcohol-free beverages and mocktails',
    examples: ['Virgin Mojito', 'Kombucha', 'Sparkling Water', 'Tea'],
    keywords: ['Healthy', 'Refreshing', 'Natural', 'Clean'],
  },
  any: {
    icon: Dice1,
    color: 'blue',
    description: 'No preference - surprise me!',
    examples: ['Random Selection', 'Daily Specials', 'Staff Picks'],
    keywords: ['Adventurous', 'Surprising', 'Varied', 'Discovery'],
  },
  featured: {
    icon: Star,
    color: 'yellow',
    description: 'Curated featured drinks and specials',
    examples: ['House Specials', 'Seasonal', 'Premium', 'Limited'],
    keywords: ['Exclusive', 'Premium', 'Curated', 'Special'],
  },
};

const INTENSITY_COLORS = {
  low: 'gray',
  medium: 'amber',
  high: 'red',
};

export default function CategoryPreferences({ preferences, onChange, errors }: CategoryPreferencesProps) {
  const [draggedCategories, setDraggedCategories] = useState<DrinkCategory[]>(() => {
    // Sort categories by priority (highest first)
    return Object.entries(preferences.categoryPreferences)
      .sort(([, a], [, b]) => b.priority - a.priority)
      .map(([category]) => category as DrinkCategory);
  });

  const handlePrimaryChange = (category: DrinkCategory) => {
    onChange({
      primaryCategory: preferences.primaryCategory === category ? null : category,
      categoryPreferences: {
        ...preferences.categoryPreferences,
        [category]: {
          ...preferences.categoryPreferences[category],
          priority: preferences.primaryCategory === category ? 5 : 10,
        },
      },
    });
  };

  const handleToggleEnabled = (category: DrinkCategory) => {
    onChange({
      categoryPreferences: {
        ...preferences.categoryPreferences,
        [category]: {
          ...preferences.categoryPreferences[category],
          enabled: !preferences.categoryPreferences[category].enabled,
        },
      },
    });
  };

  const handlePriorityChange = (category: DrinkCategory, change: number) => {
    const currentPriority = preferences.categoryPreferences[category].priority;
    const newPriority = Math.max(1, Math.min(10, currentPriority + change));
    
    onChange({
      categoryPreferences: {
        ...preferences.categoryPreferences,
        [category]: {
          ...preferences.categoryPreferences[category],
          priority: newPriority,
        },
      },
    });
  };

  const handleIntensityChange = (category: DrinkCategory, intensity: PreferenceIntensity) => {
    onChange({
      categoryPreferences: {
        ...preferences.categoryPreferences,
        [category]: {
          ...preferences.categoryPreferences[category],
          intensity,
        },
      },
    });
  };

  const handleReorder = (newOrder: DrinkCategory[]) => {
    setDraggedCategories(newOrder);
    
    // Update priorities based on new order
    const updates: typeof preferences.categoryPreferences = {};
    newOrder.forEach((category, index) => {
      updates[category] = {
        ...preferences.categoryPreferences[category],
        priority: newOrder.length - index, // Higher index = lower priority
      };
    });

    onChange({ categoryPreferences: { ...preferences.categoryPreferences, ...updates } });
  };

  const getColorClasses = (color: string, variant: 'border' | 'bg' | 'text' = 'border') => {
    const colorMap = {
      purple: { border: 'border-purple-200', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-200' },
      amber: { border: 'border-amber-200', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-200' },
      red: { border: 'border-red-200', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-200' },
      orange: { border: 'border-orange-200', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-200' },
      green: { border: 'border-green-200', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200' },
      blue: { border: 'border-blue-200', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200' },
      yellow: { border: 'border-yellow-200', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-200' },
      gray: { border: 'border-gray-200', bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-200' },
    };
    return colorMap[color as keyof typeof colorMap]?.[variant] || colorMap.gray[variant];
  };

  const enabledCategories = Object.entries(preferences.categoryPreferences)
    .filter(([, settings]) => settings.enabled)
    .length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Category Preferences
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Set your favorite drink categories and their priorities
        </p>
      </div>

      {/* Primary Category Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold">Primary Category</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose your go-to drink category - this will be heavily weighted in recommendations
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
              const Icon = config.icon;
              const isSelected = preferences.primaryCategory === category;
              const isEnabled = preferences.categoryPreferences[category as DrinkCategory].enabled;

              return (
                <motion.button
                  key={category}
                  onClick={() => handlePrimaryChange(category as DrinkCategory)}
                  disabled={!isEnabled}
                  whileHover={isEnabled ? { scale: 1.02 } : undefined}
                  whileTap={isEnabled ? { scale: 0.98 } : undefined}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all duration-200',
                    isSelected
                      ? `${getColorClasses(config.color, 'bg')} ${getColorClasses(config.color, 'border')} ${getColorClasses(config.color, 'text')}`
                      : `border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800`,
                    !isEnabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium capitalize">
                      {category === 'non-alcoholic' ? 'Non-Alcoholic' : category}
                    </span>
                    {isSelected && (
                      <Star className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <p className="text-xs opacity-80">{config.description}</p>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Category Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Category Priorities</h3>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {enabledCategories} of {Object.keys(CATEGORY_CONFIG).length} enabled
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Drag to reorder priorities • Toggle to enable/disable • Adjust intensity preferences
          </p>
        </CardHeader>
        <CardContent>
          <Reorder.Group 
            axis="y" 
            values={draggedCategories} 
            onReorder={handleReorder}
            className="space-y-3"
          >
            {draggedCategories.map((category) => {
              const config = CATEGORY_CONFIG[category];
              const settings = preferences.categoryPreferences[category];
              const Icon = config.icon;
              const isPrimary = preferences.primaryCategory === category;

              return (
                <Reorder.Item key={category} value={category}>
                  <motion.div
                    layout
                    className={cn(
                      'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4',
                      !settings.enabled && 'opacity-60 bg-gray-50 dark:bg-gray-800/50'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Drag Handle */}
                      <GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing" />

                      {/* Category Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={cn('w-5 h-5', settings.enabled ? getColorClasses(config.color, 'text') : 'text-gray-400')} />
                          <span className="font-medium capitalize">
                            {category === 'non-alcoholic' ? 'Non-Alcoholic' : category}
                          </span>
                          {isPrimary && (
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full">
                              Primary
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <TrendingUp className="w-4 h-4" />
                            Priority: {settings.priority}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {config.keywords.slice(0, 3).map((keyword) => (
                            <span
                              key={keyword}
                              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        {/* Intensity Selection */}
                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                          {(['low', 'medium', 'high'] as PreferenceIntensity[]).map((intensity) => (
                            <button
                              key={intensity}
                              onClick={() => handleIntensityChange(category, intensity)}
                              disabled={!settings.enabled}
                              className={cn(
                                'px-3 py-1 text-xs font-medium rounded-md transition-all duration-200',
                                settings.intensity === intensity
                                  ? getColorClasses(INTENSITY_COLORS[intensity], 'bg')
                                  : 'hover:bg-gray-200 dark:hover:bg-gray-700',
                                !settings.enabled && 'cursor-not-allowed opacity-50'
                              )}
                            >
                              {intensity}
                            </button>
                          ))}
                        </div>

                        {/* Priority Controls */}
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePriorityChange(category, 1)}
                            disabled={!settings.enabled || settings.priority >= 10}
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePriorityChange(category, -1)}
                            disabled={!settings.enabled || settings.priority <= 1}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Enable/Disable Toggle */}
                        <Button
                          size="sm"
                          variant={settings.enabled ? 'secondary' : 'ghost'}
                          onClick={() => handleToggleEnabled(category)}
                          className="min-w-20"
                        >
                          {settings.enabled ? 'Enabled' : 'Disabled'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </CardContent>
      </Card>

      {/* Category Insights */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardContent className="p-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Your Category Profile
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900 dark:text-gray-100">Most Preferred:</span>
              <span className="text-gray-700 dark:text-gray-300 ml-2">
                {preferences.primaryCategory ? 
                  (preferences.primaryCategory === 'non-alcoholic' ? 'Non-Alcoholic' : preferences.primaryCategory) :
                  'None selected'
                }
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-gray-100">Active Categories:</span>
              <span className="text-gray-700 dark:text-gray-300 ml-2">
                {enabledCategories} enabled
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-gray-100">High Intensity:</span>
              <span className="text-gray-700 dark:text-gray-300 ml-2">
                {Object.entries(preferences.categoryPreferences)
                  .filter(([, settings]) => settings.enabled && settings.intensity === 'high')
                  .map(([category]) => category === 'non-alcoholic' ? 'Non-Alcoholic' : category)
                  .join(', ') || 'None'
                }
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-gray-100">Adventure Level:</span>
              <span className="text-gray-700 dark:text-gray-300 ml-2">
                {preferences.categoryPreferences.any?.enabled ? 'Open to surprises' : 'Prefers familiar categories'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}