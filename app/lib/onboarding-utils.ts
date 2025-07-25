// Onboarding utilities (simplified since authentication is removed)

/**
 * Check if user has completed onboarding (always true since auth is removed)
 */
export function isOnboardingComplete(): boolean {
  return true;
}

/**
 * Get current onboarding step (always welcome since auth is removed)
 */
export function getCurrentOnboardingStep(): string {
  return 'welcome';
}

/**
 * Get onboarding data (always returns completed state)
 */
export function getOnboardingData() {
  return {
    welcomeCompleted: true,
    hasSeenIntro: true,
    preferencesCompleted: true,
    subscriptionCompleted: true,
    finalStepCompleted: true,
  };
}

/**
 * Check if user needs onboarding redirect (always false)
 */
export function shouldRedirectToOnboarding(): boolean {
  return false;
}

/**
 * Check if user should be redirected away from onboarding (always true)
 */
export function shouldRedirectFromOnboarding(): boolean {
  return true;
}

/**
 * Get appropriate redirect path after sign up (always home)
 */
export function getPostSignUpRedirect(): string {
  return '/';
}

/**
 * Calculate onboarding completion percentage (always 100%)
 */
export function getOnboardingCompletionPercentage(): number {
  return 100;
}

/**
 * Get next recommended step (always null since complete)
 */
export function getNextOnboardingStep(): string | null {
  return null;
}

/**
 * Check if a specific onboarding step is accessible (always true)
 */
export function isStepAccessible(): boolean {
  return true;
}

/**
 * Validate onboarding data (always returns no errors)
 */
export function validateOnboardingData(): string[] {
  return [];
}