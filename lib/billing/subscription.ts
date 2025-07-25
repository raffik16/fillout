import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { SubscriptionData, SubscriptionPlan, UsageData } from '@/app/types/billing';
import { getPlanByPriceId, FREE_TIER_LIMITS } from './plans';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Get user's subscription data from Clerk
 */
export async function getUserSubscription(): Promise<SubscriptionData | null> {
  try {
    const user = await currentUser();
    
    if (!user) {
      return null;
    }

    // Check if user has Clerk billing data
    const subscriptions = user.organizationMemberships?.[0]?.organization?.subscriptions || [];
    
    if (subscriptions.length === 0) {
      // Return free plan as default
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

    const subscription = subscriptions[0];
    const plan = getPlanByPriceId(subscription.priceId);
    
    return {
      id: subscription.id,
      plan: plan.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.currentPeriodStart * 1000),
      currentPeriodEnd: new Date(subscription.currentPeriodEnd * 1000),
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      trialEnd: subscription.trialEnd ? new Date(subscription.trialEnd * 1000) : undefined,
      priceId: subscription.priceId
    };
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

/**
 * Get user's current plan
 */
export async function getCurrentPlan(userId?: string): Promise<SubscriptionPlan> {
  try {
    const subscription = await getUserSubscription();
    return subscription?.plan || 'free';
  } catch (error) {
    console.error('Error getting current plan:', error);
    return 'free';
  }
}

/**
 * Check if user has access to a specific plan
 */
export async function hasAccess(requiredPlan: SubscriptionPlan): Promise<boolean> {
  const subscription = await getUserSubscription();
  
  if (!subscription) {
    return requiredPlan === 'free';
  }

  const planHierarchy = { free: 0, premium: 1, pro: 2 };
  const userPlanLevel = planHierarchy[subscription.plan];
  const requiredPlanLevel = planHierarchy[requiredPlan];

  return userPlanLevel >= requiredPlanLevel && subscription.status === 'active';
}

/**
 * Check if subscription is active
 */
export async function isSubscriptionActive(): Promise<boolean> {
  const subscription = await getUserSubscription();
  return subscription ? subscription.status === 'active' : false;
}

/**
 * Get user's current usage data from Supabase
 */
export async function getUserUsage(userId: string, feature?: string): Promise<any> {
  try {
    // Get current month boundaries
    const now = new Date();
    const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get usage from user metadata
    const { data: user, error } = await supabase
      .from('users')
      .select('metadata')
      .eq('clerk_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is OK
      console.error('Error getting user usage:', error);
    }

    const metadata = user?.metadata || {};
    const usageData = metadata.usage || {};
    
    // Get current month key
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthUsage = usageData[monthKey] || {};

    return {
      drinkRecommendations: currentMonthUsage.drinkRecommendations || 0,
      aiChats: currentMonthUsage.aiChats || 0,
      conversationHistory: currentMonthUsage.conversationHistory || 0,
      savedDrinks: currentMonthUsage.savedDrinks || 0,
      currentPeriodStart,
      currentPeriodEnd
    };
  } catch (error) {
    console.error('Error fetching usage:', error);
    return {
      drinkRecommendations: 0,
      aiChats: 0,
      conversationHistory: 0,
      savedDrinks: 0,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date()
    };
  }
}

/**
 * Track usage for a specific feature
 */
export async function trackUsage(userId: string, feature: string, increment: number = 1): Promise<any> {
  try {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Get current user metadata
    const { data: user, error } = await supabase
      .from('users')
      .select('metadata')
      .eq('clerk_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting user for usage tracking:', error);
    }

    const metadata = user?.metadata || {};
    const usageData = metadata.usage || {};
    const currentMonthUsage = usageData[monthKey] || {};

    // Update usage
    currentMonthUsage[feature] = (currentMonthUsage[feature] || 0) + increment;
    usageData[monthKey] = currentMonthUsage;

    // Clean up old months (keep last 3 months)
    const monthsToKeep = 3;
    const allMonths = Object.keys(usageData).sort().reverse();
    if (allMonths.length > monthsToKeep) {
      const monthsToDelete = allMonths.slice(monthsToKeep);
      monthsToDelete.forEach(month => delete usageData[month]);
    }

    // Update user metadata
    await supabase
      .from('users')
      .upsert({
        clerk_id: userId,
        metadata: { ...metadata, usage: usageData },
        updated_at: new Date().toISOString()
      });

    return currentMonthUsage;
  } catch (error) {
    console.error('Error tracking usage:', error);
    throw error;
  }
}

/**
 * Check if user has reached usage limits
 */
export async function hasReachedUsageLimit(userId: string, feature: keyof typeof FREE_TIER_LIMITS): Promise<boolean> {
  const subscription = await getUserSubscription();
  const usage = await getUserUsage(userId, feature);
  
  if (!subscription || !usage) {
    return false;
  }

  // Only check limits for free plan
  if (subscription.plan !== 'free') {
    return false;
  }

  const limit = FREE_TIER_LIMITS[feature];
  const currentUsage = usage[feature];
  
  return currentUsage >= limit;
}

