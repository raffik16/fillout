'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { OnboardingStepProps } from '@/app/types/onboarding';
import { WizardPreferences, AllergyType } from '@/app/types/wizard';
import { wizardQuestions } from '@/app/data/wizardQuestions';
import WizardQuestion from '@/app/components/wizard/WizardQuestion';
import WizardProgress from '@/app/components/wizard/WizardProgress';

export default function PreferencesStep({ onNext, onSkip, data }: OnboardingStepProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [preferences, setPreferences] = useState<WizardPreferences>(
    data.preferences || {
      category: null,
      flavor: null,
      temperature: null,
      adventure: null,  
      strength: null,
      occasion: null,
      allergies: null,
      useWeather: true
    }
  );
  const [isCompact, setIsCompact] = useState(false);

  const handleAnswer = useCallback((value: string) => {
    const question = wizardQuestions[currentQuestion];
    let updatedPreferences: WizardPreferences;
    
    // Special handling for allergies (multi-select)
    if (question.id === 'allergies') {
      if (value === 'none') {
        updatedPreferences = {
          ...preferences,
          allergies: ['none'] as AllergyType[]
        };
      } else {
        // Toggle the allergy in the array
        const currentAllergies = preferences.allergies || [];
        const filteredAllergies = currentAllergies.filter(a => a !== 'none') as Exclude<AllergyType, 'none'>[];
        
        if (filteredAllergies.includes(value as Exclude<AllergyType, 'none'>)) {
          // Remove if already selected
          const newAllergies = filteredAllergies.filter(a => a !== value);
          updatedPreferences = {
            ...preferences,
            allergies: newAllergies.length > 0 ? newAllergies as AllergyType[] : ['none'] as AllergyType[]
          };
        } else {
          // Add to selection
          updatedPreferences = {
            ...preferences,
            allergies: [...filteredAllergies, value as AllergyType] as AllergyType[]
          };
        }
      }
    } else {
      updatedPreferences = {
        ...preferences,
        [question.id]: value
      } as WizardPreferences;
    }
    
    setPreferences(updatedPreferences);

    if (currentQuestion < wizardQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  }, [currentQuestion, preferences]);

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }, [currentQuestion]);

  const handleComplete = useCallback(() => {
    onNext({
      preferences,
      preferencesCompleted: true
    });
  }, [preferences, onNext]);

  const handleReset = useCallback(() => {
    setCurrentQuestion(0);
    setPreferences({
      category: null,
      flavor: null,
      temperature: null,
      adventure: null,
      strength: null,
      occasion: null,
      allergies: null,
      useWeather: true
    });
  }, []);

  const isComplete = currentQuestion === wizardQuestions.length;
  const canProceed = Object.values(preferences).some(value => 
    value !== null && (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mb-4">
          <Settings className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Tell Us Your Preferences
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
          Help us understand your taste to provide perfect recommendations
        </p>
        
        {!isComplete && (
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <button
              onClick={() => setIsCompact(!isCompact)}
              className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>{isCompact ? 'Expand' : 'Compact'} View</span>
            </button>
            
            <span>•</span>
            
            <button
              onClick={handleReset}
              className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Wizard Content */}
      <div className="mb-8">
        {!isComplete ? (
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={`${isCompact ? 'max-w-2xl' : 'max-w-4xl'} mx-auto`}
          >
            <WizardQuestion
              question={wizardQuestions[currentQuestion]}
              onAnswer={handleAnswer}
              selectedValue={preferences[wizardQuestions[currentQuestion].id]}
            />
            
            <div className="mt-8">
              <WizardProgress
                current={currentQuestion}
                total={wizardQuestions.length}
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Question {currentQuestion + 1} of {wizardQuestions.length}
              </div>
              
              <div className="w-20" /> {/* Spacer for center alignment */}
            </div>
          </motion.div>
        ) : (
          /* Completion Summary */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Perfect! We've Got Your Preferences
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              We'll use this information to find drinks that match your taste profile. 
              You can always update these preferences later in your account settings.
            </p>

            {/* Preferences Summary */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Preference Summary
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {preferences.category && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">
                      {preferences.category}
                    </span>
                  </div>
                )}
                
                {preferences.flavor && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Flavor:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">
                      {preferences.flavor}
                    </span>
                  </div>
                )}
                
                {preferences.strength && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Strength:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">
                      {preferences.strength}
                    </span>
                  </div>
                )}
                
                {preferences.occasion && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Occasion:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">
                      {preferences.occasion}
                    </span>
                  </div>
                )}
                
                {preferences.allergies && preferences.allergies.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Allergies:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">
                      {preferences.allergies.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
        {isComplete ? (
          <>
            <button
              onClick={handleComplete}
              className="group inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span className="mr-2">Continue to Plan Selection</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            
            <button
              onClick={handleReset}
              className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Retake Quiz
            </button>
          </>
        ) : (
          <>
            {canProceed && (
              <button
                onClick={handleComplete}
                className="px-6 py-3 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
              >
                Skip Remaining Questions
              </button>
            )}
            
            <button
              onClick={() => onSkip?.()}
              className="px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Skip This Step
            </button>
          </>
        )}
      </div>
    </div>
  );
}