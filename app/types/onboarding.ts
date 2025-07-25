import { WizardPreferences } from './wizard';

export type OnboardingStep = 'welcome' | 'preferences' | 'completion';

export interface OnboardingProgress {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  skippedSteps: OnboardingStep[];
  isComplete: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface OnboardingData {
  // Welcome step data
  welcomeCompleted: boolean;
  hasSeenIntro: boolean;
  
  // Preferences step data
  preferences?: WizardPreferences;
  preferencesCompleted: boolean;
  
  
  // Completion data
  finalStepCompleted: boolean;
  redirectTo?: string;
}

export interface OnboardingState {
  progress: OnboardingProgress;
  data: OnboardingData;
  isLoading: boolean;
  error?: string;
}

export interface OnboardingStepProps {
  onNext: (data?: Partial<OnboardingData>) => void;
  onBack?: () => void;
  onSkip?: () => void;
  data: OnboardingData;
  isLoading?: boolean;
}

// Validation functions
export const validateStep = (step: OnboardingStep, data: OnboardingData): boolean => {
  switch (step) {
    case 'welcome':
      return data.welcomeCompleted && data.hasSeenIntro;
    case 'preferences':
      return data.preferencesCompleted && !!data.preferences;
    case 'completion':
      return data.finalStepCompleted;
    default:
      return false;
  }
};

export const getNextStep = (currentStep: OnboardingStep): OnboardingStep | null => {
  const stepOrder: OnboardingStep[] = ['welcome', 'preferences', 'completion'];
  const currentIndex = stepOrder.indexOf(currentStep);
  
  if (currentIndex < stepOrder.length - 1) {
    return stepOrder[currentIndex + 1];
  }
  
  return null;
};

export const getPreviousStep = (currentStep: OnboardingStep): OnboardingStep | null => {
  const stepOrder: OnboardingStep[] = ['welcome', 'preferences', 'completion'];
  const currentIndex = stepOrder.indexOf(currentStep);
  
  if (currentIndex > 0) {
    return stepOrder[currentIndex - 1];
  }
  
  return null;
};

export const calculateProgress = (progress: OnboardingProgress): number => {
  const totalSteps = 3; // welcome, preferences, completion
  const completedCount = progress.completedSteps.length;
  return Math.round((completedCount / totalSteps) * 100);
};

export const DEFAULT_ONBOARDING_DATA: OnboardingData = {
  welcomeCompleted: false,
  hasSeenIntro: false,
  preferencesCompleted: false,
  finalStepCompleted: false,
};

export const DEFAULT_ONBOARDING_PROGRESS: OnboardingProgress = {
  currentStep: 'welcome',
  completedSteps: [],
  skippedSteps: [],
  isComplete: false,
  startedAt: new Date().toISOString(),
};