import { DrinkCategory, FlavorProfile, TemperaturePreference, AdventureLevel, StrengthPreference, OccasionMood, AllergyType } from './wizard';

/**
 * Clerk Metadata Type Definitions for Drinkjoy Application
 * 
 * unsafeMetadata: User-controlled data visible to client
 * publicMetadata: Read-only for users, can be displayed publicly
 * privateMetadata: Server-only, never sent to client
 */

// Drink Preferences for storing wizard results
export interface DrinkPreferences {
  category: DrinkCategory | null;
  flavor: FlavorProfile | null;
  temperature: TemperaturePreference | null;
  adventure: AdventureLevel | null;
  strength: StrengthPreference | null;
  occasion: OccasionMood | null;
  allergies: AllergyType[];
  useWeather: boolean;
  lastUpdated: string; // ISO date string
}

// Favorite categories based on user interactions
export interface FavoriteCategories {
  beer: number;
  wine: number;
  cocktail: number;
  spirit: number;
  nonAlcoholic: number;
  lastUpdated: string; // ISO date string
}

// AI Chat preferences
export interface AIChatPreferences {
  enabledFeatures: ('recommendations' | 'explanations' | 'recipes' | 'pairings')[];
  chatHistory: boolean;  // Whether to maintain chat history
  personalizedResponses: boolean;  // Whether AI should use user preferences
  preferredTone: 'casual' | 'professional' | 'friendly' | 'expert';
  lastUpdated: string; // ISO date string
}

// Subscription plan information (visible to user, read-only)
export interface SubscriptionPlan {
  planId: 'free' | 'premium' | 'pro';
  planName: string;
  status: 'active' | 'cancelled' | 'past_due' | 'incomplete';
  currentPeriodStart: string; // ISO date string
  currentPeriodEnd: string; // ISO date string
  cancelAtPeriodEnd: boolean;
}

// Features available to the user based on subscription
export interface PlanFeatures {
  maxSavedDrinks: number;
  aiChatMessages: number; // -1 for unlimited
  weatherIntegration: boolean;
  advancedFiltering: boolean;
  personalizedRecommendations: boolean;
  emailSupport: boolean;
  prioritySupport: boolean;
  exportData: boolean;
}

// Account type and status
export interface AccountType {
  type: 'consumer' | 'business' | 'admin';
  verificationStatus: 'unverified' | 'verified' | 'premium_verified';
  accountCreated: string; // ISO date string
  lastLoginAt: string; // ISO date string
}

// Billing history entry
export interface BillingHistoryEntry {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  invoiceUrl?: string;
  createdAt: string; // ISO date string
}

// Clerk Metadata Interfaces
export interface ClerkUnsafeMetadata {
  drinkPreferences?: DrinkPreferences;
  favoriteCategories?: FavoriteCategories;
  allergies?: AllergyType[];
  aiChatPreferences?: AIChatPreferences;
}

export interface ClerkPublicMetadata {
  subscriptionPlan?: SubscriptionPlan;
  planFeatures?: PlanFeatures;
  accountType?: AccountType;
}

export interface ClerkPrivateMetadata {
  stripeCustomerId?: string;
  billingHistory?: BillingHistoryEntry[];
  internalNotes?: string;
  riskScore?: number;
  lastPaymentMethod?: {
    type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
    last4?: string;
    brand?: string;
  };
}

// Utility types for updating metadata
export type DrinkPreferencesUpdate = Partial<DrinkPreferences>;
export type FavoriteCategoriesUpdate = Partial<FavoriteCategories>;
export type AIChatPreferencesUpdate = Partial<AIChatPreferences>;
export type SubscriptionPlanUpdate = Partial<SubscriptionPlan>;
export type PlanFeaturesUpdate = Partial<PlanFeatures>;

// Type guards for runtime validation
export function isDrinkPreferences(obj: any): obj is DrinkPreferences {
  return typeof obj === 'object' && 
         obj !== null && 
         'lastUpdated' in obj;
}

export function isSubscriptionPlan(obj: any): obj is SubscriptionPlan {
  return typeof obj === 'object' && 
         obj !== null && 
         'planId' in obj && 
         'status' in obj;
}

export function isPlanFeatures(obj: any): obj is PlanFeatures {
  return typeof obj === 'object' && 
         obj !== null && 
         'maxSavedDrinks' in obj;
}