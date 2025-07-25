'use client';

// Client-safe billing utilities and constants
// These can be safely imported in client components

/**
 * Format subscription status for display
 */
export function formatSubscriptionStatus(status: string): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'canceled':
      return 'Canceled';
    case 'incomplete':
      return 'Incomplete';
    case 'incomplete_expired':
      return 'Expired';
    case 'past_due':
      return 'Past Due';
    case 'trialing':
      return 'Trial';
    case 'unpaid':
      return 'Unpaid';
    default:
      return 'Unknown';
  }
}

/**
 * Get billing portal URL for subscription management (disabled since auth is removed)
 */
export function getBillingPortalUrl(): string {
  return '/pricing';
}

// Re-export client-safe constants from plans.ts
export { PRICING_PLANS, FREE_TIER_LIMITS, getPlanById, getPlanByPriceId } from './plans';