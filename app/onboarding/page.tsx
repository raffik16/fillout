'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { 
  OnboardingLayout,
  WelcomeStep,
  PreferencesStep, 
  SubscriptionStep,
  CompletionStep
} from '@/app/components/onboarding';
import { OnboardingStep, OnboardingData } from '@/app/types/onboarding';
import { wizardToUserPreferences } from '@/app/types/preferences';
import { useDrinkPreferences } from '@/app/lib/clerk-preferences';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { savePreferences } = useDrinkPreferences();
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Check if user has already completed onboarding
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      // Not authenticated, redirect to sign up
      router.push('/sign-up');
      return;
    }

    const onboardingData = user.publicMetadata?.onboardingData as OnboardingData;
    const onboardingProgress = user.publicMetadata?.onboardingProgress;

    // Check if onboarding is already complete
    if (onboardingProgress?.isComplete || onboardingData?.finalStepCompleted) {
      setShouldRedirect(true);
      router.push('/dashboard');
      return;
    }

    setIsLoading(false);
  }, [user, isLoaded, router]);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Save preferences to Clerk metadata if they exist
      if (data.preferences) {
        const userPreferences = wizardToUserPreferences(data.preferences);
        await savePreferences(userPreferences);
      }

      // Mark onboarding as complete in user metadata
      await user.update({
        publicMetadata: {
          ...user.publicMetadata,
          onboardingData: {
            ...data,
            finalStepCompleted: true
          },
          onboardingProgress: {
            ...user.publicMetadata?.onboardingProgress,
            isComplete: true,
            completedAt: new Date().toISOString()
          },
          onboardingCompletedAt: new Date().toISOString()
        }
      });

      // Redirect to specified route or dashboard
      const redirectTo = data.redirectTo || '/dashboard';
      router.push(redirectTo);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Still redirect to prevent stuck state
      router.push('/dashboard');
    }
  };

  // Show loading state
  if (isLoading || shouldRedirect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {shouldRedirect ? 'Redirecting...' : 'Setting up your account...'}
          </p>
        </motion.div>
      </div>
    );
  }

  // Not authenticated and loading is complete
  if (!user) {
    return null;
  }

  // Get initial data from user metadata if it exists
  const initialData = (user.publicMetadata?.onboardingData as OnboardingData) || {};
  const initialStep = (user.publicMetadata?.onboardingProgress?.currentStep as OnboardingStep) || 'welcome';

  return (
    <OnboardingLayout
      onComplete={handleOnboardingComplete}
      initialStep={initialStep}
      initialData={initialData}
    >
      {({ currentStep, onNext, onBack, onSkip, data, isLoading: stepLoading }) => {
        switch (currentStep) {
          case 'welcome':
            return (
              <WelcomeStep
                onNext={onNext}
                onBack={onBack}
                onSkip={onSkip}
                data={data}
                isLoading={stepLoading}
              />
            );
          
          case 'preferences':
            return (
              <PreferencesStep
                onNext={onNext}
                onBack={onBack}
                onSkip={onSkip}
                data={data}
                isLoading={stepLoading}
              />
            );
          
          case 'subscription':
            return (
              <SubscriptionStep
                onNext={onNext}
                onBack={onBack}
                onSkip={onSkip}
                data={data}
                isLoading={stepLoading}
              />
            );
          
          case 'completion':
            return (
              <CompletionStep
                onNext={onNext}
                onBack={onBack}
                onSkip={onSkip}
                data={data}
                isLoading={stepLoading}
              />
            );
          
          default:
            return (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                    Unknown step: {currentStep}
                  </p>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            );
        }
      }}
    </OnboardingLayout>
  );
}