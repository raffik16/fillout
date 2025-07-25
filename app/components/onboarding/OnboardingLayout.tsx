'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { ChevronLeft, Check } from 'lucide-react';
import { 
  OnboardingStep, 
  OnboardingData, 
  OnboardingProgress, 
  OnboardingState,
  DEFAULT_ONBOARDING_DATA,
  DEFAULT_ONBOARDING_PROGRESS,
  getNextStep,
  getPreviousStep,
  calculateProgress,
  validateStep
} from '@/app/types/onboarding';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';

interface OnboardingLayoutProps {
  children: (props: {
    currentStep: OnboardingStep;
    onNext: (data?: Partial<OnboardingData>) => void;
    onBack: () => void;
    onSkip: () => void;
    data: OnboardingData;
    isLoading: boolean;
  }) => React.ReactNode;
  onComplete: (data: OnboardingData) => void;
  initialStep?: OnboardingStep;
  initialData?: Partial<OnboardingData>;
}

const STEP_LABELS: Record<OnboardingStep, string> = {
  welcome: 'Welcome',
  preferences: 'Preferences',
  subscription: 'Plan',
  completion: 'Complete'
};

export default function OnboardingLayout({ 
  children, 
  onComplete, 
  initialStep = 'welcome',
  initialData = {}
}: OnboardingLayoutProps) {
  const { user } = useUser();
  const [state, setState] = useState<OnboardingState>({
    progress: {
      ...DEFAULT_ONBOARDING_PROGRESS,
      currentStep: initialStep
    },
    data: {
      ...DEFAULT_ONBOARDING_DATA,
      ...initialData
    },
    isLoading: false
  });

  const updateUserMetadata = useCallback(async (onboardingData: Partial<OnboardingData>) => {
    if (!user) return;

    try {
      await user.update({
        publicMetadata: {
          ...user.publicMetadata,
          onboardingData: {
            ...state.data,
            ...onboardingData
          },
          onboardingProgress: state.progress
        }
      });
    } catch (error) {
      console.error('Failed to update onboarding metadata:', error);
    }
  }, [user, state.data, state.progress]);

  const handleNext = useCallback(async (stepData?: Partial<OnboardingData>) => {
    const currentStep = state.progress.currentStep;
    const updatedData = { ...state.data, ...stepData };
    
    // Validate current step
    if (!validateStep(currentStep, updatedData)) {
      setState(prev => ({ 
        ...prev, 
        error: 'Please complete all required fields before continuing.' 
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    // Update metadata
    await updateUserMetadata(stepData);
    
    const nextStep = getNextStep(currentStep);
    const completedSteps = [...state.progress.completedSteps];
    
    if (!completedSteps.includes(currentStep)) {
      completedSteps.push(currentStep);
    }

    const updatedProgress: OnboardingProgress = {
      ...state.progress,
      currentStep: nextStep || 'completion',
      completedSteps,
      isComplete: nextStep === null
    };

    if (nextStep === null) {
      // Onboarding complete
      updatedProgress.completedAt = new Date().toISOString();
      onComplete(updatedData);
    }

    setState(prev => ({
      ...prev,
      progress: updatedProgress,
      data: updatedData,
      isLoading: false
    }));
  }, [state, updateUserMetadata, onComplete]);

  const handleBack = useCallback(() => {
    const previousStep = getPreviousStep(state.progress.currentStep);
    if (previousStep) {
      setState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          currentStep: previousStep
        }
      }));
    }
  }, [state.progress.currentStep]);

  const handleSkip = useCallback(async () => {
    const currentStep = state.progress.currentStep;
    const skippedSteps = [...state.progress.skippedSteps];
    
    if (!skippedSteps.includes(currentStep)) {
      skippedSteps.push(currentStep);
    }

    let stepData: Partial<OnboardingData> = {};
    
    // Set skip flags for specific steps
    if (currentStep === 'subscription') {
      stepData.skipSubscription = true;
      stepData.subscriptionCompleted = true;
    }

    await updateUserMetadata(stepData);

    const nextStep = getNextStep(currentStep);
    
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        currentStep: nextStep || 'completion',
        skippedSteps,
        isComplete: nextStep === null
      },
      data: {
        ...prev.data,
        ...stepData
      }
    }));

    if (nextStep === null) {
      onComplete({ ...state.data, ...stepData });
    }
  }, [state, updateUserMetadata, onComplete]);

  const progressPercentage = calculateProgress(state.progress);
  const stepOrder: OnboardingStep[] = ['welcome', 'preferences', 'subscription', 'completion'];
  const currentStepIndex = stepOrder.indexOf(state.progress.currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-rose-50 dark:from-gray-900 dark:to-gray-800">
      {/* Progress Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Step {currentStepIndex + 1} of {stepOrder.length}
              </div>
              <div className="text-sm text-gray-400 dark:text-gray-500">
                {progressPercentage}% Complete
              </div>
            </div>
            
            {state.progress.currentStep !== 'welcome' && (
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center space-x-2">
            {stepOrder.map((step, index) => {
              const isCompleted = state.progress.completedSteps.includes(step);
              const isCurrent = state.progress.currentStep === step;
              const isSkipped = state.progress.skippedSteps.includes(step);
              
              return (
                <div key={step} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isCurrent
                        ? 'bg-purple-500 border-purple-500 text-white'
                        : isSkipped
                        ? 'bg-gray-300 border-gray-300 text-gray-500'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="ml-2 mr-4">
                    <div
                      className={`text-sm font-medium ${
                        isCompleted
                          ? 'text-green-600 dark:text-green-400'
                          : isCurrent
                          ? 'text-purple-600 dark:text-purple-400'
                          : isSkipped
                          ? 'text-gray-400 dark:text-gray-500'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {STEP_LABELS[step]}
                    </div>
                  </div>
                  
                  {index < stepOrder.length - 1 && (
                    <div
                      className={`w-8 h-0.5 ${
                        isCompleted
                          ? 'bg-green-500'
                          : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-rose-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.progress.currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {state.isLoading ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
              </div>
            ) : (
              children({
                currentStep: state.progress.currentStep,
                onNext: handleNext,
                onBack: handleBack,
                onSkip: handleSkip,
                data: state.data,
                isLoading: state.isLoading
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Error Display */}
      {state.error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
        >
          {state.error}
        </motion.div>
      )}
    </div>
  );
}