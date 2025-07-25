import { currentUser, clerkClient } from '@clerk/nextjs/server';
import { User } from '@clerk/nextjs/server';
import { 
  ClerkUnsafeMetadata, 
  ClerkPublicMetadata, 
  ClerkPrivateMetadata,
  DrinkPreferences,
  DrinkPreferencesUpdate,
  FavoriteCategories,
  FavoriteCategoriesUpdate,
  AIChatPreferences,
  AIChatPreferencesUpdate,
  SubscriptionPlan,
  PlanFeatures,
  AccountType,
  BillingHistoryEntry
} from '../../app/types/clerk-metadata';
import { WizardPreferences } from '../../app/types/wizard';

/**
 * Utility functions for managing Clerk user metadata in Drinkjoy application
 */

// Default values
const DEFAULT_DRINK_PREFERENCES: DrinkPreferences = {
  category: null,
  flavor: null,
  temperature: null,
  adventure: null,
  strength: null,
  occasion: null,
  allergies: [],
  useWeather: false,
  lastUpdated: new Date().toISOString()
};

const DEFAULT_FAVORITE_CATEGORIES: FavoriteCategories = {
  beer: 0,
  wine: 0,
  cocktail: 0,
  spirit: 0,
  nonAlcoholic: 0,
  lastUpdated: new Date().toISOString()
};

const DEFAULT_AI_CHAT_PREFERENCES: AIChatPreferences = {
  enabledFeatures: ['recommendations', 'explanations', 'recipes'],
  chatHistory: true,
  personalizedResponses: true,
  preferredTone: 'friendly',
  lastUpdated: new Date().toISOString()
};

const DEFAULT_PLAN_FEATURES: PlanFeatures = {
  maxSavedDrinks: 10,
  aiChatMessages: 20,
  weatherIntegration: true,
  advancedFiltering: false,
  personalizedRecommendations: true,
  emailSupport: false,
  prioritySupport: false,
  exportData: false
};

/**
 * Get current user with typed metadata
 */
export async function getCurrentUserWithMetadata(): Promise<User | null> {
  try {
    const user = await currentUser();
    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Update drink preferences in user's unsafe metadata
 */
export async function updateDrinkPreferences(
  userId: string, 
  preferences: DrinkPreferencesUpdate
): Promise<DrinkPreferences> {
  try {
    const user = await clerkClient().users.getUser(userId);
    const currentPreferences = (user.unsafeMetadata as ClerkUnsafeMetadata)?.drinkPreferences || DEFAULT_DRINK_PREFERENCES;
    
    const updatedPreferences: DrinkPreferences = {
      ...currentPreferences,
      ...preferences,
      lastUpdated: new Date().toISOString()
    };

    const updatedUnsafeMetadata: ClerkUnsafeMetadata = {
      ...(user.unsafeMetadata as ClerkUnsafeMetadata),
      drinkPreferences: updatedPreferences
    };

    await clerkClient().users.updateUser(userId, {
      unsafeMetadata: updatedUnsafeMetadata
    });

    return updatedPreferences;
  } catch (error) {
    console.error('Error updating drink preferences:', error);
    throw new Error('Failed to update drink preferences');
  }
}

/**
 * Convert wizard preferences to drink preferences format
 */
export function wizardPreferencesToDrinkPreferences(wizardPrefs: WizardPreferences): DrinkPreferences {
  return {
    category: wizardPrefs.category,
    flavor: wizardPrefs.flavor,
    temperature: wizardPrefs.temperature,
    adventure: wizardPrefs.adventure,
    strength: wizardPrefs.strength,
    occasion: wizardPrefs.occasion,
    allergies: wizardPrefs.allergies || [],
    useWeather: wizardPrefs.useWeather,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Update drink preferences from wizard results
 */
export async function updateDrinkPreferencesFromWizard(
  userId: string,
  wizardPreferences: WizardPreferences
): Promise<DrinkPreferences> {
  const drinkPreferences = wizardPreferencesToDrinkPreferences(wizardPreferences);
  return updateDrinkPreferences(userId, drinkPreferences);
}

/**
 * Get user's drink preferences
 */
export async function getDrinkPreferences(userId: string): Promise<DrinkPreferences> {
  try {
    const user = await clerkClient().users.getUser(userId);
    const preferences = (user.unsafeMetadata as ClerkUnsafeMetadata)?.drinkPreferences;
    return preferences || DEFAULT_DRINK_PREFERENCES;
  } catch (error) {
    console.error('Error getting drink preferences:', error);
    return DEFAULT_DRINK_PREFERENCES;
  }
}

/**
 * Update favorite categories based on user interactions
 */
export async function updateFavoriteCategories(
  userId: string,
  updates: FavoriteCategoriesUpdate
): Promise<FavoriteCategories> {
  try {
    const user = await clerkClient().users.getUser(userId);
    const currentFavorites = (user.unsafeMetadata as ClerkUnsafeMetadata)?.favoriteCategories || DEFAULT_FAVORITE_CATEGORIES;
    
    const updatedFavorites: FavoriteCategories = {
      ...currentFavorites,
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    const updatedUnsafeMetadata: ClerkUnsafeMetadata = {
      ...(user.unsafeMetadata as ClerkUnsafeMetadata),
      favoriteCategories: updatedFavorites
    };

    await clerkClient().users.updateUser(userId, {
      unsafeMetadata: updatedUnsafeMetadata
    });

    return updatedFavorites;
  } catch (error) {
    console.error('Error updating favorite categories:', error);
    throw new Error('Failed to update favorite categories');
  }
}

/**
 * Increment favorite category count (for tracking user behavior)
 */
export async function incrementFavoriteCategory(
  userId: string,
  category: keyof Omit<FavoriteCategories, 'lastUpdated'>
): Promise<FavoriteCategories> {
  try {
    const user = await clerkClient().users.getUser(userId);
    const currentFavorites = (user.unsafeMetadata as ClerkUnsafeMetadata)?.favoriteCategories || DEFAULT_FAVORITE_CATEGORIES;
    
    const updates: FavoriteCategoriesUpdate = {
      [category]: (currentFavorites[category] || 0) + 1
    };

    return updateFavoriteCategories(userId, updates);
  } catch (error) {
    console.error('Error incrementing favorite category:', error);
    throw new Error('Failed to increment favorite category');
  }
}

/**
 * Update AI chat preferences
 */
export async function updateAIChatPreferences(
  userId: string,
  preferences: AIChatPreferencesUpdate
): Promise<AIChatPreferences> {
  try {
    const user = await clerkClient().users.getUser(userId);
    const currentPreferences = (user.unsafeMetadata as ClerkUnsafeMetadata)?.aiChatPreferences || DEFAULT_AI_CHAT_PREFERENCES;
    
    const updatedPreferences: AIChatPreferences = {
      ...currentPreferences,
      ...preferences,
      lastUpdated: new Date().toISOString()
    };

    const updatedUnsafeMetadata: ClerkUnsafeMetadata = {
      ...(user.unsafeMetadata as ClerkUnsafeMetadata),
      aiChatPreferences: updatedPreferences
    };

    await clerkClient().users.updateUser(userId, {
      unsafeMetadata: updatedUnsafeMetadata
    });

    return updatedPreferences;
  } catch (error) {
    console.error('Error updating AI chat preferences:', error);
    throw new Error('Failed to update AI chat preferences');
  }
}

/**
 * Get user's subscription plan information
 */
export async function getUserSubscriptionPlan(userId: string): Promise<SubscriptionPlan | null> {
  try {
    const user = await clerkClient().users.getUser(userId);
    const subscriptionPlan = (user.publicMetadata as ClerkPublicMetadata)?.subscriptionPlan;
    return subscriptionPlan || null;
  } catch (error) {
    console.error('Error getting subscription plan:', error);
    return null;
  }
}

/**
 * Get user's plan features
 */
export async function getUserPlanFeatures(userId: string): Promise<PlanFeatures> {
  try {
    const user = await clerkClient().users.getUser(userId);
    const planFeatures = (user.publicMetadata as ClerkPublicMetadata)?.planFeatures;
    return planFeatures || DEFAULT_PLAN_FEATURES;
  } catch (error) {
    console.error('Error getting plan features:', error);
    return DEFAULT_PLAN_FEATURES;
  }
}

/**
 * Set subscription metadata (admin function)
 */
export async function setSubscriptionMetadata(
  userId: string,
  subscriptionPlan: SubscriptionPlan,
  planFeatures: PlanFeatures
): Promise<void> {
  try {
    const user = await clerkClient().users.getUser(userId);
    
    const updatedPublicMetadata: ClerkPublicMetadata = {
      ...(user.publicMetadata as ClerkPublicMetadata),
      subscriptionPlan,
      planFeatures
    };

    await clerkClient().users.updateUser(userId, {
      publicMetadata: updatedPublicMetadata
    });
  } catch (error) {
    console.error('Error setting subscription metadata:', error);
    throw new Error('Failed to set subscription metadata');
  }
}

/**
 * Set account type metadata
 */
export async function setAccountTypeMetadata(
  userId: string,
  accountType: AccountType
): Promise<void> {
  try {
    const user = await clerkClient().users.getUser(userId);
    
    const updatedPublicMetadata: ClerkPublicMetadata = {
      ...(user.publicMetadata as ClerkPublicMetadata),
      accountType
    };

    await clerkClient().users.updateUser(userId, {
      publicMetadata: updatedPublicMetadata
    });
  } catch (error) {
    console.error('Error setting account type metadata:', error);
    throw new Error('Failed to set account type metadata');
  }
}

/**
 * Add billing history entry (admin function)
 */
export async function addBillingHistoryEntry(
  userId: string,
  entry: BillingHistoryEntry
): Promise<void> {
  try {
    const user = await clerkClient().users.getUser(userId);
    const currentBillingHistory = (user.privateMetadata as ClerkPrivateMetadata)?.billingHistory || [];
    
    const updatedBillingHistory = [entry, ...currentBillingHistory].slice(0, 50); // Keep last 50 entries
    
    const updatedPrivateMetadata: ClerkPrivateMetadata = {
      ...(user.privateMetadata as ClerkPrivateMetadata),
      billingHistory: updatedBillingHistory
    };

    await clerkClient().users.updateUser(userId, {
      privateMetadata: updatedPrivateMetadata
    });
  } catch (error) {
    console.error('Error adding billing history entry:', error);
    throw new Error('Failed to add billing history entry');
  }
}

/**
 * Set Stripe customer ID (admin function)
 */
export async function setStripeCustomerId(
  userId: string,
  stripeCustomerId: string
): Promise<void> {
  try {
    const user = await clerkClient().users.getUser(userId);
    
    const updatedPrivateMetadata: ClerkPrivateMetadata = {
      ...(user.privateMetadata as ClerkPrivateMetadata),
      stripeCustomerId
    };

    await clerkClient().users.updateUser(userId, {
      privateMetadata: updatedPrivateMetadata
    });
  } catch (error) {
    console.error('Error setting Stripe customer ID:', error);
    throw new Error('Failed to set Stripe customer ID');
  }
}

/**
 * Get user's complete metadata profile
 */
export async function getUserMetadataProfile(userId: string) {
  try {
    const user = await clerkClient().users.getUser(userId);
    
    return {
      drinkPreferences: (user.unsafeMetadata as ClerkUnsafeMetadata)?.drinkPreferences || DEFAULT_DRINK_PREFERENCES,
      favoriteCategories: (user.unsafeMetadata as ClerkUnsafeMetadata)?.favoriteCategories || DEFAULT_FAVORITE_CATEGORIES,
      aiChatPreferences: (user.unsafeMetadata as ClerkUnsafeMetadata)?.aiChatPreferences || DEFAULT_AI_CHAT_PREFERENCES,
      subscriptionPlan: (user.publicMetadata as ClerkPublicMetadata)?.subscriptionPlan || null,
      planFeatures: (user.publicMetadata as ClerkPublicMetadata)?.planFeatures || DEFAULT_PLAN_FEATURES,
      accountType: (user.publicMetadata as ClerkPublicMetadata)?.accountType || null,
    };
  } catch (error) {
    console.error('Error getting user metadata profile:', error);
    throw new Error('Failed to get user metadata profile');
  }
}

/**
 * Initialize new user with default metadata
 */
export async function initializeNewUserMetadata(userId: string): Promise<void> {
  try {
    const defaultAccountType: AccountType = {
      type: 'consumer',
      verificationStatus: 'unverified',
      accountCreated: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    await Promise.all([
      updateDrinkPreferences(userId, DEFAULT_DRINK_PREFERENCES),
      updateFavoriteCategories(userId, DEFAULT_FAVORITE_CATEGORIES),
      updateAIChatPreferences(userId, DEFAULT_AI_CHAT_PREFERENCES),
      setAccountTypeMetadata(userId, defaultAccountType),
      setSubscriptionMetadata(userId, {
        planId: 'free',
        planName: 'Free Plan',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        cancelAtPeriodEnd: false
      }, DEFAULT_PLAN_FEATURES)
    ]);
  } catch (error) {
    console.error('Error initializing new user metadata:', error);
    throw new Error('Failed to initialize new user metadata');
  }
}