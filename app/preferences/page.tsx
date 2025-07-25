'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, FileText } from 'lucide-react';
import { DrinkPreferencesForm, WizardIntegration } from '@/app/components/preferences';
import { AuthWrapper } from '@/app/components/auth';
import { Card, CardContent } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { WizardPreferences } from '@/app/types/wizard';
import { UserDrinkPreferences } from '@/app/types/preferences';
import { parsePreferencesImport } from '@/app/lib/preference-utils';
import { useDrinkPreferences } from '@/app/lib/clerk-preferences';

export default function PreferencesPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'preferences' | 'import' | 'export'>('preferences');
  const [wizardResults, setWizardResults] = useState<WizardPreferences | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportData, setExportData] = useState<string | null>(null);

  const { exportPreferences, importPreferences, isAuthenticated } = useDrinkPreferences();

  // Check for wizard results in URL params or localStorage
  useEffect(() => {
    // Check URL params first (from wizard redirect)
    const wizardData = searchParams.get('wizard');
    if (wizardData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(wizardData));
        setWizardResults(parsed);
        setActiveTab('import');
      } catch (error) {
        console.error('Failed to parse wizard data from URL:', error);
      }
    } else {
      // Check localStorage for recent wizard results
      const stored = localStorage.getItem('drinkjoy-wizard-results');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Only use if recent (within last hour)
          const timestamp = parsed.timestamp || 0;
          if (Date.now() - timestamp < 3600000) {
            setWizardResults(parsed.preferences);
            setActiveTab('import');
          }
        } catch (error) {
          console.error('Failed to parse stored wizard data:', error);
        }
      }
    }
  }, [searchParams]);

  const handleWizardImportComplete = (preferences: UserDrinkPreferences) => {
    // Clear wizard results after successful import
    setWizardResults(null);
    localStorage.removeItem('drinkjoy-wizard-results');
    setActiveTab('preferences');
  };

  const handleRetakeWizard = () => {
    // Redirect to wizard
    window.location.href = '/app?retake=true';
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError(null);

    try {
      const text = await file.text();
      const result = parsePreferencesImport(text);
      
      if (result.success && result.preferences) {
        await importPreferences(result.preferences, 'imported');
        setImportFile(null);
        setActiveTab('preferences');
      } else {
        setImportError(result.error || 'Failed to import preferences');
      }
    } catch (error) {
      setImportError(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleExport = () => {
    const data = exportPreferences();
    setExportData(data);
    
    // Auto-download
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drinkjoy-preferences-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SignedInContent = (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Drink Preferences
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Customize your Drinkjoy experience
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg">
            <div className="flex space-x-2">
              {[
                { id: 'preferences' as const, label: 'Preferences', icon: Settings },
                { id: 'import' as const, label: 'Import', icon: Upload },
                { id: 'export' as const, label: 'Export', icon: Download },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200
                      ${activeTab === tab.id
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.id === 'import' && wizardResults && (
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'preferences' && (
            <DrinkPreferencesForm
              showImportButton={!!wizardResults}
              onImportFromWizard={() => setActiveTab('import')}
            />
          )}

          {activeTab === 'import' && (
            <div className="space-y-6">
              {/* Wizard Import */}
              <WizardIntegration
                wizardResults={wizardResults}
                onImportComplete={handleWizardImportComplete}
                onRetakeWizard={handleRetakeWizard}
              />

              {/* File Import */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Import from File
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Upload a previously exported preferences file to restore your settings
                  </p>
                  
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-xl file:border-0
                        file:text-sm file:font-medium
                        file:bg-amber-50 file:text-amber-700
                        hover:file:bg-amber-100 dark:file:bg-amber-900/20 dark:file:text-amber-300"
                    />
                    
                    {importError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <p className="text-red-800 dark:text-red-200 text-sm">{importError}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'export' && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-6">
                  <div>
                    <FileText className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Export Your Preferences
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      Download a backup of your drink preferences to save or transfer to another device
                    </p>
                  </div>

                  <Button onClick={handleExport} size="lg">
                    <Download className="w-5 h-5 mr-2" />
                    Download Preferences
                  </Button>

                  {exportData && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Export completed! Your preferences file has been downloaded.
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Keep this file safe - you can use it to restore your preferences later.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );

  const SignedOutContent = (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-8">
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Personalize Your Experience
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sign in to access your drink preferences, save your quiz results, and get personalized recommendations.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <AuthWrapper
      signedInContent={SignedInContent}
      signedOutContent={SignedOutContent}
      showDefaultSignedOut={false}
    />
  );
}