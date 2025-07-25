export type SubscriptionPlan = 'free' | 'premium' | 'pro';

export type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'incomplete' 
  | 'incomplete_expired' 
  | 'past_due' 
  | 'trialing' 
  | 'unpaid';

export interface SubscriptionData {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  priceId: string;
}

export interface PlanFeatures {
  drinkRecommendations: number | 'unlimited';
  aiChats: number | 'unlimited';
  conversationHistory: number | 'unlimited';
  advancedAIContext: boolean;
  weatherIntegration: boolean;
  allergyFiltering: boolean;
  savedDrinks: number | 'unlimited';
  premiumRecipes: boolean;
  analyticsAccess: boolean;
  prioritySupport: boolean;
  customFilters: boolean;
  exportData: boolean;
}

export interface PricingPlan {
  id: SubscriptionPlan;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  stripeProductId?: string;
  stripePriceId?: string;
  features: PlanFeatures;
  popular?: boolean;
  cta: string;
}

export interface UsageData {
  drinkRecommendations: number;
  aiChats: number;
  conversationHistory: number;
  savedDrinks: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}

export interface BillingError {
  code: string;
  message: string;
  param?: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}