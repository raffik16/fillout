'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wand2, 
  Download,
  RefreshCw, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { WizardPreferences } from '@/app/types/wizard';
import { UserDrinkPreferences } from '@/app/types/preferences';
import { 
  convertWizardToUserPreferences, 
  mergeWizardWithUserPreferences,
  generatePreferenceSummary 
} from '@/app/lib/preference-utils';
import { useDrinkPreferences, PreferenceManager } from '@/app/lib/clerk-preferences';
import { cn } from '@/lib/utils';

interface WizardIntegrationProps {
  wizardResults?: WizardPreferences | null;
  onImportComplete?: (preferences: UserDrinkPreferences) => void;
  onRetakeWizard?: () => void;
  className?: string;
}

type ImportMode = 'replace' | 'merge' | 'preview';

export default function WizardIntegration({
  wizardResults,
  onImportComplete,
  onRetakeWizard,
  className
}: WizardIntegrationProps) {
  const {
    preferences: currentPreferences,
    updatePreferences,
    isAuthenticated,
    isLoaded
  } = useDrinkPreferences();

  const [importMode, setImportMode] = useState<ImportMode>('preview');
  const [previewPreferences, setPreviewPreferences] = useState<UserDrinkPreferences | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Generate preview when wizard results change
  useEffect(() => {
    if (wizardResults && isLoaded) {
      const preview = importMode === 'replace' 
        ? convertWizardToUserPreferences(wizardResults)
        : mergeWizardWithUserPreferences(wizardResults, currentPreferences);
      
      setPreviewPreferences(preview);
    }
  }, [wizardResults, currentPreferences, importMode, isLoaded]);

  const handleImport = async () => {
    if (!wizardResults || !previewPreferences || !isAuthenticated) return;

    setIsImporting(true);
    
    try {
      await updatePreferences(previewPreferences, false);
      setImportSuccess(true);
      onImportComplete?.(previewPreferences);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setImportSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to import wizard results:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const hasWizardResults = !!wizardResults;
  const hasExistingPreferences = PreferenceManager.calculatePreferenceCompleteness(currentPreferences) > 20;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Sign In to Import Preferences
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to save your quiz results to your profile
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Import Status */}
      <AnimatePresence>
        {importSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-200 font-medium">
                Preferences imported successfully!
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wizard Results Available */}
      {hasWizardResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Wand2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Import Discovery Quiz Results
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Save your drink discovery quiz results to your profile for personalized recommendations
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Import Mode Selection */}
              {hasExistingPreferences && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Import Method
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <motion.button
                      onClick={() => setImportMode('merge')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all duration-200',
                        importMode === 'merge'
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="w-4 h-4" />
                        <span className="font-medium">Merge with Existing</span>
                      </div>
                      <p className="text-sm opacity-80">
                        Combine discovery quiz results with your current preferences
                      </p>
                    </motion.button>

                    <motion.button
                      onClick={() => setImportMode('replace')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all duration-200',
                        importMode === 'replace'
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Download className="w-4 h-4" />
                        <span className="font-medium">Replace All</span>
                      </div>
                      <p className="text-sm opacity-80">
                        Overwrite existing preferences with discovery quiz results
                      </p>
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Preview Section */}
              {previewPreferences && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Preview Changes
                    </h4>
                    {hasExistingPreferences && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowComparison(!showComparison)}
                      >
                        {showComparison ? 'Hide' : 'Show'} Comparison
                      </Button>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Your New Profile Summary
                        </h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {generatePreferenceSummary(previewPreferences)}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">Category:</span>
                            <div className="text-gray-700 dark:text-gray-300 capitalize">
                              {previewPreferences.primaryCategory || 'None'}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">Flavor:</span>
                            <div className="text-gray-700 dark:text-gray-300 capitalize">
                              {previewPreferences.flavorProfile || 'None'}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">Strength:</span>
                            <div className="text-gray-700 dark:text-gray-300 capitalize">
                              {previewPreferences.strengthPreference || 'None'}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">Allergies:</span>
                            <div className="text-gray-700 dark:text-gray-300">
                              {previewPreferences.allergies.includes('none') ? 'None' : previewPreferences.allergies.length}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparison View */}
                  {showComparison && hasExistingPreferences && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          Current Preferences
                        </h6>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {generatePreferenceSummary(currentPreferences)}
                        </p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          After Import
                        </h6>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {generatePreferenceSummary(previewPreferences)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleImport}
                  disabled={isImporting || !previewPreferences}
                  className="flex-1"
                  isLoading={isImporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isImporting ? 'Importing...' : 'Import to Profile'}
                </Button>

                {onRetakeWizard && (
                  <Button
                    variant="ghost"
                    onClick={onRetakeWizard}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retake Quiz
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Quiz Results */}
      {!hasWizardResults && (
        <Card>
          <CardContent className="text-center py-8">
            <Wand2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Discovery Quiz Results Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Take our drink discovery quiz to get personalized recommendations
            </p>
            {onRetakeWizard && (
              <Button onClick={onRetakeWizard}>
                <Sparkles className="w-4 h-4 mr-2" />
                Take Discovery Quiz Now
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Existing Preferences Summary */}
      {hasExistingPreferences && !hasWizardResults && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Current Profile
            </h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {generatePreferenceSummary(currentPreferences)}
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Profile {PreferenceManager.calculatePreferenceCompleteness(currentPreferences)}% complete
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}