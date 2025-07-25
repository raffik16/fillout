import { WizardPreferences } from '../../app/types/wizard';
import { DrinkPreferences } from '../../app/types/clerk-metadata';
import { 
  updateDrinkPreferencesFromWizard,
  incrementFavoriteCategory,
  getDrinkPreferences
} from './metadata';

/**
 * Integration utilities for connecting the existing wizard system
 * with Clerk user metadata management
 */

/**
 * Save wizard results to user metadata
 * This function should be called when the user completes the wizard
 */
export async function saveWizardResultsToMetadata(
  userId: string,
  wizardPreferences: WizardPreferences
): Promise<DrinkPreferences> {
  try {
    // Update drink preferences in metadata
    const updatedPreferences = await updateDrinkPreferencesFromWizard(userId, wizardPreferences);
    
    // If user selected a specific category, increment favorite categories
    if (wizardPreferences.category && wizardPreferences.category !== 'any') {
      const categoryMap: Record<string, keyof Omit<import('../../app/types/clerk-metadata').FavoriteCategories, 'lastUpdated'>> = {
        'beer': 'beer',
        'wine': 'wine',
        'cocktail': 'cocktail',
        'spirit': 'spirit',
        'non-alcoholic': 'nonAlcoholic'
      };
      
      const favoriteCategory = categoryMap[wizardPreferences.category];
      if (favoriteCategory) {
        await incrementFavoriteCategory(userId, favoriteCategory);
      }
    }
    
    return updatedPreferences;
  } catch (error) {
    console.error('Error saving wizard results to metadata:', error);
    throw new Error('Failed to save wizard results');
  }
}

/**
 * Load user preferences for wizard initialization
 * This can be used to pre-populate the wizard with user's saved preferences
 */
export async function loadWizardPreferencesFromMetadata(
  userId: string
): Promise<WizardPreferences> {
  try {
    const drinkPreferences = await getDrinkPreferences(userId);
    
    return {
      category: drinkPreferences.category,
      flavor: drinkPreferences.flavor,
      temperature: drinkPreferences.temperature,
      adventure: drinkPreferences.adventure,
      strength: drinkPreferences.strength,
      occasion: drinkPreferences.occasion,
      allergies: drinkPreferences.allergies,
      useWeather: drinkPreferences.useWeather
    };
  } catch (error) {
    console.error('Error loading wizard preferences from metadata:', error);
    // Return empty preferences if there's an error
    return {
      category: null,
      flavor: null,
      temperature: null,
      adventure: null,
      strength: null,
      occasion: null,
      allergies: null,
      useWeather: false
    };
  }
}

/**
 * Check if user has completed the wizard before
 * Based on whether they have any saved preferences
 */
export async function hasUserCompletedWizard(userId: string): Promise<boolean> {
  try {
    const preferences = await getDrinkPreferences(userId);
    
    // Consider wizard completed if user has at least category and flavor preferences
    return !!(preferences.category && preferences.flavor);
  } catch (error) {
    console.error('Error checking wizard completion status:', error);
    return false;
  }
}

/**
 * Get personalized wizard suggestions based on user's history
 * This could be used to suggest popular choices based on their favorite categories
 */
export async function getPersonalizedWizardSuggestions(userId: string) {
  try {
    const { getUserMetadataProfile } = await import('./metadata');
    const profile = await getUserMetadataProfile(userId);
    
    const { favoriteCategories, drinkPreferences } = profile;
    
    // Find most popular category
    const mostPopularCategory = Object.entries(favoriteCategories)
      .filter(([key]) => key !== 'lastUpdated')
      .sort(([, a], [, b]) => (b as number) - (a as number))[0];
    
    return {
      suggestedCategory: mostPopularCategory?.[0] || null,
      previousPreferences: drinkPreferences,
      hasHistory: !!(drinkPreferences.category || drinkPreferences.flavor),
      favoriteCategories: Object.entries(favoriteCategories)
        .filter(([key]) => key !== 'lastUpdated')
        .map(([category, count]) => ({ category, count: count as number }))
        .sort((a, b) => b.count - a.count)
    };
  } catch (error) {
    console.error('Error getting personalized wizard suggestions:', error);
    return {
      suggestedCategory: null,
      previousPreferences: null,
      hasHistory: false,
      favoriteCategories: []
    };
  }
}

