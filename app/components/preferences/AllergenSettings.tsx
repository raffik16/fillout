'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Wheat, 
  Milk, 
  Nut, 
  Egg,
  Bean,
  CheckCircle,
  AlertTriangle,
  Info,
  Plus,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { UserDrinkPreferences, PreferenceValidation } from '@/app/types/preferences';
import { AllergyType } from '@/app/types/wizard';
import { cn } from '@/lib/utils';

interface AllergenSettingsProps {
  preferences: UserDrinkPreferences;
  onChange: (updates: Partial<UserDrinkPreferences>) => void;
  errors: PreferenceValidation[];
}

// Allergen configuration with detailed information
const ALLERGEN_CONFIG: Record<Exclude<AllergyType, 'none'>, {
  icon: typeof Wheat;
  color: string;
  description: string;
  commonSources: string[];
  riskLevel: 'low' | 'medium' | 'high';
  alternativeOptions: string[];
}> = {
  gluten: {
    icon: Wheat,
    color: 'amber',
    description: 'Found in wheat, barley, rye, and some alcoholic beverages',
    commonSources: ['Beer', 'Wheat-based spirits', 'Flavored spirits', 'Some mixers'],
    riskLevel: 'high',
    alternativeOptions: ['Wine', 'Gluten-free beer', 'Vodka', 'Rum', 'Tequila'],
  },
  dairy: {
    icon: Milk,
    color: 'blue',
    description: 'Milk and milk-derived products',
    commonSources: ['Cream liqueurs', 'White Russians', 'Mudslides', 'Some cocktail mixers'],
    riskLevel: 'medium',
    alternativeOptions: ['Plant-based milk cocktails', 'Clear spirits', 'Wine', 'Beer'],
  },
  nuts: {
    icon: Nut,
    color: 'orange',
    description: 'Tree nuts and nut-derived ingredients',
    commonSources: ['Nut liqueurs', 'Amaretto', 'Frangelico', 'Some cocktail garnishes'],
    riskLevel: 'high',
    alternativeOptions: ['Seed-based alternatives', 'Fruit liqueurs', 'Herb-based spirits'],
  },
  eggs: {
    icon: Egg,
    color: 'yellow',
    description: 'Egg whites and egg-based ingredients',
    commonSources: ['Fizzes', 'Sours with egg white', 'Some foams', 'Advocaat'],
    riskLevel: 'medium',
    alternativeOptions: ['Aquafaba cocktails', 'Non-foamed versions', 'Simple mixed drinks'],
  },
  soy: {
    icon: Bean,
    color: 'green',
    description: 'Soy-derived ingredients and products',
    commonSources: ['Some mixers', 'Soy milk cocktails', 'Certain flavorings'],
    riskLevel: 'low',
    alternativeOptions: ['Alternative plant milks', 'Traditional cocktails', 'Wine'],
  },
};

const RISK_LEVEL_COLORS = {
  low: 'text-green-600 dark:text-green-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  high: 'text-red-600 dark:text-red-400',
};

export default function AllergenSettings({ preferences, onChange, errors }: AllergenSettingsProps) {
  const [customAllergy, setCustomAllergy] = useState('');
  const [showAlternatives, setShowAlternatives] = useState<string | null>(null);

  const hasNoAllergies = preferences.allergies.includes('none');
  const activeAllergies = preferences.allergies.filter(a => a !== 'none') as Exclude<AllergyType, 'none'>[];

  const handleToggleAllergy = (allergy: AllergyType) => {
    if (allergy === 'none') {
      // If selecting "none", clear all other allergies
      onChange({ allergies: ['none'] });
    } else {
      // If selecting a specific allergy, remove "none" and toggle the allergy
      const currentAllergies = preferences.allergies.filter(a => a !== 'none') as Exclude<AllergyType, 'none'>[];
      
      if (currentAllergies.includes(allergy as Exclude<AllergyType, 'none'>)) {
        // Remove the allergy
        const newAllergies = currentAllergies.filter(a => a !== allergy);
        onChange({ 
          allergies: newAllergies.length > 0 ? newAllergies : ['none']
        });
      } else {
        // Add the allergy
        onChange({ 
          allergies: [...currentAllergies, allergy] as AllergyType[]
        });
      }
    }
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !preferences.allergies.includes(customAllergy.trim() as AllergyType)) {
      const currentAllergies = preferences.allergies.filter(a => a !== 'none');
      onChange({
        allergies: [...currentAllergies, customAllergy.trim()] as AllergyType[]
      });
      setCustomAllergy('');
    }
  };

  const removeCustomAllergy = (allergy: string) => {
    const newAllergies = preferences.allergies.filter(a => a !== allergy);
    onChange({
      allergies: newAllergies.length > 0 ? newAllergies : ['none']
    });
  };

  const getColorClasses = (color: string, isActive: boolean = false) => {
    const colors = {
      amber: isActive ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-500 text-amber-800 dark:text-amber-200' : 'border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-900/10',
      blue: isActive ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-200' : 'border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/10',
      orange: isActive ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-800 dark:text-purple-200' : 'border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/10',
      yellow: isActive ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-800 dark:text-yellow-200' : 'border-yellow-200 hover:bg-yellow-50 dark:hover:bg-yellow-900/10',
      green: isActive ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200' : 'border-green-200 hover:bg-green-50 dark:hover:bg-green-900/10',
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  const customAllergies = preferences.allergies.filter(a => 
    a !== 'none' && !Object.keys(ALLERGEN_CONFIG).includes(a)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Allergies & Dietary Restrictions
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Help us keep you safe by specifying any allergies or dietary restrictions
        </p>
      </div>

      {/* No Allergies Option */}
      <Card>
        <CardContent className="p-6">
          <motion.button
            onClick={() => handleToggleAllergy('none')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
              hasNoAllergies
                ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            <div className="flex items-center gap-3">
              <CheckCircle className={cn('w-6 h-6', hasNoAllergies ? 'text-green-600' : 'text-gray-400')} />
              <div>
                <h3 className="font-semibold text-lg">No Known Allergies</h3>
                <p className="text-sm opacity-80">I don&apos;t have any allergies or dietary restrictions</p>
              </div>
            </div>
          </motion.button>
        </CardContent>
      </Card>

      {/* Common Allergies */}
      {!hasNoAllergies && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-semibold">Common Allergies</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select any allergies you have - we'll filter out drinks containing these ingredients
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(ALLERGEN_CONFIG).map(([allergy, config]) => {
                const Icon = config.icon;
                const isSelected = activeAllergies.includes(allergy as Exclude<AllergyType, 'none'>);

                return (
                  <motion.div key={allergy} layout>
                    <motion.button
                      onClick={() => handleToggleAllergy(allergy as AllergyType)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
                        getColorClasses(config.color, isSelected)
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium capitalize">{allergy}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn('text-xs font-medium', RISK_LEVEL_COLORS[config.riskLevel])}>
                            {config.riskLevel} risk
                          </span>
                          {isSelected && <Shield className="w-4 h-4" />}
                        </div>
                      </div>
                      
                      <p className="text-sm opacity-80 mb-2">{config.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs">
                          <span className="font-medium">Common in:</span>
                          <span className="ml-1 opacity-70">
                            {config.commonSources.slice(0, 2).join(', ')}
                          </span>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAlternatives(showAlternatives === allergy ? null : allergy);
                          }}
                          className="text-xs px-2 py-1 h-auto"
                        >
                          {showAlternatives === allergy ? 'Hide' : 'Alternatives'}
                        </Button>
                      </div>
                    </motion.button>

                    {/* Alternatives Panel */}
                    {showAlternatives === allergy && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium">Safe Alternatives</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {config.alternativeOptions.map((alternative) => (
                            <span
                              key={alternative}
                              className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full"
                            >
                              {alternative}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Allergies */}
      {!hasNoAllergies && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Other Allergies or Restrictions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add any other ingredients or dietary restrictions we should know about
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add Custom Allergy */}
              <div className="flex gap-2">
                <Input
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  placeholder="Enter ingredient or restriction..."
                  onKeyPress={(e) => e.key === 'Enter' && addCustomAllergy()}
                  className="flex-1"
                />
                <Button
                  onClick={addCustomAllergy}
                  disabled={!customAllergy.trim()}
                  variant="secondary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Custom Allergies List */}
              {customAllergies.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Your Custom Restrictions:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {customAllergies.map((allergy) => (
                      <motion.div
                        key={allergy}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg"
                      >
                        <span className="text-sm">{allergy}</span>
                        <button
                          onClick={() => removeCustomAllergy(allergy)}
                          className="hover:bg-red-200 dark:hover:bg-red-800 rounded-full p-1 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety Information */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Safety First
              </h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  We take allergies seriously and will filter out drinks containing your specified allergens.
                  However, always inform your bartender about your allergies when ordering.
                </p>
                <p>
                  <strong>Remember:</strong> Cross-contamination can occur during preparation, 
                  and ingredient formulations may change. When in doubt, ask for detailed ingredient information.
                </p>
                {activeAllergies.length > 0 && (
                  <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="font-medium mb-1">Your Active Restrictions:</p>
                    <div className="flex flex-wrap gap-2">
                      {[...activeAllergies, ...customAllergies].map((allergy) => (
                        <span
                          key={allergy}
                          className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}