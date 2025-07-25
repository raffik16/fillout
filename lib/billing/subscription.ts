import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Get user's subscription data (always returns free since auth is removed)
 */
export async function getUserSubscription() {
  // Return free plan as default since authentication is removed
  return {
    id: 'free',
    plan: 'free',
    status: 'active',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    cancelAtPeriodEnd: false,
    priceId: 'free'
  };
}

/**
 * Get user's current plan (always free)
 */
export async function getCurrentPlan(userId?: string): Promise<string> {
  return 'free';
}

/**
 * Check if user has access to a specific plan (always true)
 */
export async function hasAccess(requiredPlan: string): Promise<boolean> {
  return true;
}

/**
 * Check if subscription is active (always true)
 */
export async function isSubscriptionActive(): Promise<boolean> {
  return true;
}

/**
 * Get user's current usage data (always returns unlimited)
 */
export async function getUserUsage(userId: string, feature?: string): Promise<unknown> {
  return {
    drinkRecommendations: 0,
    aiChats: 0,
    conversationHistory: 0,
    savedDrinks: 0,
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date()
  };
}

/**
 * Track usage for a specific feature (no-op since auth is removed)
 */
export async function trackUsage(userId: string, feature: string, increment: number = 1): Promise<unknown> {
  return { [feature]: 0 };
}

/**
 * Check if user has reached usage limits (always false)
 */
export async function hasReachedUsageLimit(userId: string, feature: string): Promise<boolean> {
  return false;
}