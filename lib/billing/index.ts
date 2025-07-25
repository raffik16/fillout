// Client-safe exports only - to prevent server-only imports in client components
export {
  formatSubscriptionStatus,
  getBillingPortalUrl,
  PRICING_PLANS,
  FREE_TIER_LIMITS,
  getPlanById,
  getPlanByPriceId
} from './client-utils';

// Note: Server-side utilities (getUserSubscription, getCurrentPlan, etc.) 
// should be imported from './subscription' directly in server components/API routes