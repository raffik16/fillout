import { User } from '@clerk/nextjs/server';
import { OnboardingData, OnboardingProgress, OnboardingStep } from '@/app/types/onboarding';

// Check if user has completed onboarding
export function isOnboardingComplete(user: User | null): boolean {
  if (!user) return false;

  const onboardingProgress = user.publicMetadata?.onboardingProgress as OnboardingProgress;
  const onboardingData = user.publicMetadata?.onboardingData as OnboardingData;
  
  return onboardingProgress?.isComplete || onboardingData?.finalStepCompleted || false;
}

// Get current onboarding step for user
export function getCurrentOnboardingStep(user: User | null): OnboardingStep {
  if (!user) return 'welcome';

  const onboardingProgress = user.publicMetadata?.onboardingProgress as OnboardingProgress;
  return onboardingProgress?.currentStep || 'welcome';
}

// Get onboarding data for user
export function getOnboardingData(user: User | null): OnboardingData {
  if (!user) {
    return {
      welcomeCompleted: false,
      hasSeenIntro: false,
      preferencesCompleted: false,
      subscriptionCompleted: false,
      finalStepCompleted: false,
    };
  }

  const onboardingData = user.publicMetadata?.onboardingData as OnboardingData;
  return onboardingData || {
    welcomeCompleted: false,
    hasSeenIntro: false,
    preferencesCompleted: false,
    subscriptionCompleted: false,
    finalStepCompleted: false,
  };
}

// Check if user needs onboarding redirect
export function shouldRedirectToOnboarding(user: User | null, currentPath: string): boolean {
  if (!user) return false;
  if (currentPath === '/onboarding') return false;
  if (currentPath === '/sign-out') return false;
  if (currentPath === '/preferences') return false;
  if (currentPath === '/profile') return false;
  
  return !isOnboardingComplete(user);
}

// Check if user should be redirected away from onboarding
export function shouldRedirectFromOnboarding(user: User | null): boolean {
  if (!user) return false;
  return isOnboardingComplete(user);
}

// Get appropriate redirect path after sign up
export function getPostSignUpRedirect(user: User | null): string {
  if (!user) return '/sign-up';
  
  if (isOnboardingComplete(user)) {
    return '/dashboard';
  }
  
  return '/onboarding';
}

// Calculate onboarding completion percentage
export function getOnboardingCompletionPercentage(user: User | null): number {
  if (!user) return 0;

  const data = getOnboardingData(user);
  const progress = user.publicMetadata?.onboardingProgress as OnboardingProgress;
  
  if (progress?.isComplete || data.finalStepCompleted) return 100;

  let completedSteps = 0;
  const totalSteps = 4;

  if (data.welcomeCompleted) completedSteps++;
  if (data.preferencesCompleted) completedSteps++;
  if (data.subscriptionCompleted) completedSteps++;
  if (data.finalStepCompleted) completedSteps++;

  return Math.round((completedSteps / totalSteps) * 100);
}

// Get next recommended step for user
export function getNextOnboardingStep(user: User | null): OnboardingStep | null {
  if (!user) return 'welcome';

  const data = getOnboardingData(user);
  
  if (!data.welcomeCompleted) return 'welcome';
  if (!data.preferencesCompleted) return 'preferences';
  if (!data.subscriptionCompleted) return 'subscription';
  if (!data.finalStepCompleted) return 'completion';
  
  return null; // Onboarding complete
}

// Check if a specific onboarding step is accessible
export function isStepAccessible(user: User | null, step: OnboardingStep): boolean {
  if (!user) return step === 'welcome';

  const data = getOnboardingData(user);
  
  switch (step) {
    case 'welcome':
      return true;
    case 'preferences':
      return data.welcomeCompleted;
    case 'subscription':
      return data.welcomeCompleted && data.preferencesCompleted;
    case 'completion':
      return data.welcomeCompleted && data.preferencesCompleted && data.subscriptionCompleted;
    default:
      return false;
  }
}

// Validate onboarding data completeness
export function validateOnboardingData(data: OnboardingData): string[] {
  const errors: string[] = [];

  if (data.welcomeCompleted && !data.hasSeenIntro) {
    errors.push('Welcome introduction must be completed');
  }

  if (data.preferencesCompleted && !data.preferences) {
    errors.push('Preferences must be set when marked complete');
  }

  if (data.subscriptionCompleted && !data.selectedPlan && !data.skipSubscription) {
    errors.push('Subscription plan must be selected when marked complete');
  }

  return errors;
}