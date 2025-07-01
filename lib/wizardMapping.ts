import { WizardPreferences } from '@/app/types/wizard';
import { DrinkFilters, DrinkCategory, FlavorProfile, DrinkStrength, Occasion } from '@/app/types/drinks';

export function mapWizardPreferencesToFilters(preferences: WizardPreferences): DrinkFilters {
  const filters: DrinkFilters = {};

  // Map strength preferences
  if (preferences.strength) {
    const strengthMap: Record<string, DrinkStrength[]> = {
      'light': ['light', 'non-alcoholic'],
      'medium': ['light', 'medium'],
      'strong': ['medium', 'strong'],
      'non-alcoholic': ['non-alcoholic']
    };
    filters.strength = strengthMap[preferences.strength] || [];
  }

  // Map occasion preferences
  if (preferences.occasion) {
    const occasionMap: Record<string, Occasion[]> = {
      'casual': ['casual', 'relaxing'],
      'party': ['party', 'celebration'],
      'romantic': ['romantic'],
      'relaxing': ['relaxing', 'casual']
    };
    filters.occasions = occasionMap[preferences.occasion] || [];
  }

  // Map flavor preferences
  if (preferences.flavor) {
    const flavorMap: Record<string, FlavorProfile[]> = {
      'sweet': ['sweet', 'fruity'],
      'bitter': ['bitter', 'herbal'],
      'sour': ['sour', 'refreshing'],
      'smooth': ['refreshing', 'savory']
    };
    filters.flavors = flavorMap[preferences.flavor] || [];
  }

  // Map direct category selection (highest priority)
  if (preferences.category && preferences.category !== 'any') {
    filters.categories = [preferences.category as DrinkCategory];
  } else if (preferences.adventure) {
    // Fallback to adventure level mapping if no specific category or "any" selected
    const adventureMap: Record<string, DrinkCategory[]> = {
      'classic': ['wine', 'beer'],
      'bold': ['cocktail', 'spirit'],
      'fruity': ['cocktail', 'non-alcoholic'],
      'simple': ['beer', 'wine', 'non-alcoholic']
    };
    filters.categories = adventureMap[preferences.adventure] || [];
  }

  return filters;
}