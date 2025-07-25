import { PricingPlan } from '@/app/types/billing';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out Drinkjoy',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: {
      drinkRecommendations: 10,
      aiChats: 10,
      conversationHistory: 5,
      advancedAIContext: false,
      weatherIntegration: false,
      allergyFiltering: true,
      savedDrinks: 5,
      premiumRecipes: false,
      analyticsAccess: false,
      prioritySupport: false,
      customFilters: false,
      exportData: false,
    },
    cta: 'Get Started'
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Best for casual drink enthusiasts',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_PREMIUM_PLAN_ID,
    features: {
      drinkRecommendations: 100,
      aiChats: 100,
      conversationHistory: 50,
      advancedAIContext: true,
      weatherIntegration: true,
      allergyFiltering: true,
      savedDrinks: 50,
      premiumRecipes: true,
      analyticsAccess: false,
      prioritySupport: false,
      customFilters: true,
      exportData: true,
    },
    popular: true,
    cta: 'Start Premium'
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For bars, restaurants & drink professionals',
    price: 19.99,
    currency: 'USD',
    interval: 'month',
    stripePriceId: process.env.NEXT_PUBLIC_PRO_PLAN_ID,
    features: {
      drinkRecommendations: 'unlimited',
      aiChats: 'unlimited',
      conversationHistory: 'unlimited',
      advancedAIContext: true,
      weatherIntegration: true,
      allergyFiltering: true,
      savedDrinks: 'unlimited',
      premiumRecipes: true,
      analyticsAccess: true,
      prioritySupport: true,
      customFilters: true,
      exportData: true,
    },
    cta: 'Go Pro'
  }
];

export const FREE_TIER_LIMITS = {
  drinkRecommendations: parseInt(process.env.NEXT_PUBLIC_FREE_TIER_LIMIT || '10'),
  aiChats: parseInt(process.env.NEXT_PUBLIC_FREE_AI_CHAT_LIMIT || '10'),
  conversationHistory: 5,
  savedDrinks: 5,
} as const;

export const getPlanById = (planId: string) => {
  return PRICING_PLANS.find(plan => plan.id === planId) || PRICING_PLANS[0];
};

export const getPlanByPriceId = (priceId: string) => {
  return PRICING_PLANS.find(plan => plan.stripePriceId === priceId) || PRICING_PLANS[0];
};