'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  
  Palette, 
  Wine, 
  Shield, 
  Sparkles, 
  Save, 
  RefreshCw, 
  
  Upload,
  Check,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { useDrinkPreferences, PreferenceManager } from '@/app/lib/clerk-preferences';
import { UserDrinkPreferences, PreferenceFormState } from '@/app/types/preferences';
import { cn } from '@/lib/utils';
import FlavorPreferences from './FlavorPreferences';
import CategoryPreferences from './CategoryPreferences';
import AllergenSettings from './AllergenSettings';
import AIPreferences from './AIPreferences';

// Tab configuration
const TABS = [
  {
    id: 'categories',
    label: 'Drink Categories',
    icon: Wine,
    description: 'Set your favorite drink types and priorities',
    component: CategoryPreferences,
  },
  {
    id: 'flavors',
    label: 'Flavor Profiles',
    icon: Palette,
    description: 'Customize your taste preferences',
    component: FlavorPreferences,
  },
  {
    id: 'allergens',
    label: 'Allergies & Diet',
    icon: Shield,
    description: 'Manage dietary restrictions and allergies',
    component: Allergen
  },
  {
    id: 'ai',
    label: 'AI Preferences',
    icon: Sparkles,
    description: 'Customize your AI chat experience',
    component: AIPreferences,
  },
] as const;

type TabId = typeof TABS[number]['id'];

interface DrinkPreferencesFormProps {
  onImportFromWizard?: () => void;
  showImportButton?: boolean;
  className?: string;
}

export default function DrinkPreferencesForm({ 
  onImportFromWizard, 
  showImportButton = false,
  className 
}: DrinkPreferencesFormProps) {
  const {
    preferences,
    isLoaded,
    updatePreferences,
    resetPreferences,
    exportPreferences,
    validatePreferences,
    isAuthenticated,
  } = useDrinkPreferences();

  const [activeTab, setActiveTab] = useState<TabId>('categories');
  const [formState, setFormState] = useState<PreferenceFormState>({
    isLoading: false,
    isSaving: false,
    hasUnsavedChanges: false,
    errors: [],
    successMessage: null,
    lastSaved: null,
  });
  const [localPreferences, setLocalPreferences] = useState<UserDrinkPreferences>(preferences);

  // Sync local preferences with global state
  useEffect(() => {
    if (isLoaded) {
      setLocalPreferences(preferences);
    }
  }, [preferences, isLoaded]);

  // Auto-save functionality
  useEffect(() => {
    const saveTimer = setTimeout(async () => {
      if (formState.hasUnsavedChanges && isAuthenticated) {
        await handleSave(true);
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [localPreferences, formState.hasUnsavedChanges]);

  const handlePreferenceChange = (updates: Partial<UserDrinkPreferences>) => {
    const updatedPrefs = { ...localPreferences, ...updates };
    setLocalPreferences(updatedPrefs);
    setFormState(prev => ({ 
      ...prev, 
      hasUnsavedChanges: true,
      successMessage: null,
      errors: [],
    }));
  };

  const handleSave = async (isAutoSave = false) => {
    if (!isAuthenticated) return;

    setFormState(prev => ({ ...prev, isSaving: true, errors: [] }));

    try {
      // Validate preferences
      const validationErrors = validatePreferences(localPreferences);
      if (validationErrors.length > 0) {
        setFormState(prev => ({
          ...prev,
          errors: validationErrors.map(msg => ({ field: 'general' as any, message: msg, isValid: false })),
          isSaving: false,
        }));
        return;
      }

      await updatePreferences(localPreferences, false);
      
      setFormState(prev => ({
        ...prev,
        isSaving: false,
        hasUnsavedChanges: false,
        successMessage: isAutoSave ? 'Auto-saved' : 'Preferences saved successfully',
        lastSaved: new Date().toLocaleTimeString(),
      }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setFormState(prev => ({ ...prev, successMessage: null }));
      }, 3000);

    } catch (error) {
      setFormState(prev => ({
        ...prev,
        isSaving: false,
        errors: [{ field: 'general' as any, message: 'Failed to save preferences', isValid: false }],
      }));
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all preferences to defaults?')) return;

    setFormState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await resetPreferences();
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        hasUnsavedChanges: false,
        successMessage: 'Preferences reset to defaults',
      }));
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        errors: [{ field: 'general' as any, message: 'Failed to reset preferences', isValid: false }],
      }));
    }
  };

  const handleExport = () => {
    const exportData = exportPreferences();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drinkjoy-preferences-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access and manage your drink preferences.
          </p>
          <Button variant="primary">Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  const completeness = PreferenceManager.calculatePreferenceCompleteness(localPreferences);
  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component;

  return (
    <div className={cn('max-w-6xl mx-auto space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Drink Preferences
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Customize your Drinkjoy experience
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Profile Completeness
              </div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {completeness}%
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
            <motion.div
              className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completeness}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Status Messages */}
      <AnimatePresence>
        {(formState.successMessage || formState.errors.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {formState.successMessage && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-green-800 dark:text-green-200">
                  {formState.successMessage}
                </span>
                {formState.lastSaved && (
                  <span className="text-green-600 dark:text-green-400 text-sm ml-auto">
                    Last saved: {formState.lastSaved}
                  </span>
                )}
              </div>
            )}
            
            {formState.errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="font-medium text-red-800 dark:text-red-200">
                    Please fix the following errors:
                  </span>
                </div>
                <ul className="list-disc list-inside text-red-700 dark:text-red-300 text-sm space-y-1">
                  {formState.errors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tab Navigation */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200',
                      isActive
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 shadow-sm'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{tab.label}</div>
                      <div className="text-xs opacity-70 truncate">{tab.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <Button
                onClick={() => handleSave(false)}
                disabled={formState.isSaving || !formState.hasUnsavedChanges}
                className="w-full"
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {formState.isSaving ? 'Saving...' : 'Save Changes'}
              </Button>

              {showImportButton && onImportFromWizard && (
                <Button
                  variant="ghost"
                  onClick={onImportFromWizard}
                  className="w-full"
                  size="sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import from Quiz
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={handleExport}
                className="w-full"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              <Button
                variant="ghost"
                onClick={handleReset}
                disabled={formState.isLoading}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {ActiveComponent && (
                  <ActiveComponent
                    preferences={localPreferences}
                    onChange={handlePreferenceChange}
                    errors={formState.errors}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>

      {/* Auto-save indicator */}
      {formState.hasUnsavedChanges && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-4 right-4 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-full text-sm shadow-lg border border-amber-200 dark:border-amber-800"
        >
          Unsaved changes • Auto-saving...
        </motion.div>
      )}
    </div>
  );
}