import { WizardPreferences, AllergyType } from '@/app/types/wizard';

export interface AIPreferences {
  category?: string;
  flavor?: string;
  strength?: string;
  occasion?: string;
  allergies?: string[];
  customRequests?: string[];
}

export interface ConversationResult {
  preferences: AIPreferences;
  confidence: number;
  ready: boolean;
  message: string;
}

/**
 * Convert AI-extracted preferences to wizard preferences format
 */
export function convertAIToWizardPreferences(
  aiPrefs: AIPreferences
): Partial<WizardPreferences> {
  const wizardPrefs: Partial<WizardPreferences> = {
    useWeather: true, // Default to using weather
  };

  // Map category
  if (aiPrefs.category) {
    const categoryMap: Record<string, WizardPreferences['category']> = {
      'cocktail': 'cocktail',
      'cocktails': 'cocktail',
      'mixed drinks': 'cocktail',
      'beer': 'beer',
      'beers': 'beer',
      'cider': 'beer',
      'wine': 'wine',
      'wines': 'wine',
      'spirit': 'spirit',
      'spirits': 'spirit',
      'whiskey': 'spirit',
      'vodka': 'spirit',
      'rum': 'spirit',
      'gin': 'spirit',
      'tequila': 'spirit',
      'mezcal': 'spirit',
      'non-alcoholic': 'non-alcoholic',
      'nonalcoholic': 'non-alcoholic',
      'mocktail': 'non-alcoholic',
      'any': 'any',
      'surprise': 'any',
      'featured': 'featured'
    };
    wizardPrefs.category = categoryMap[aiPrefs.category.toLowerCase()] || null;
  }

  // Map flavor
  if (aiPrefs.flavor) {
    const flavorMap: Record<string, WizardPreferences['flavor']> = {
      'crisp': 'crisp',
      'clean': 'crisp',
      'refreshing': 'crisp',
      'light': 'crisp',
      'smokey': 'smokey',
      'smoky': 'smokey',
      'peaty': 'smokey',
      'charred': 'smokey',
      'sweet': 'sweet',
      'sugary': 'sweet',
      'dessert': 'sweet',
      'bitter': 'bitter',
      'hoppy': 'bitter',
      'earthy': 'bitter',
      'herbal': 'bitter',
      'sour': 'sour',
      'tart': 'sour',
      'citrus': 'sour',
      'acidic': 'sour',
      'smooth': 'smooth',
      'mellow': 'smooth',
      'creamy': 'smooth',
      'silky': 'smooth'
    };
    wizardPrefs.flavor = flavorMap[aiPrefs.flavor.toLowerCase()] || null;
  }

  // Map strength
  if (aiPrefs.strength) {
    const strengthMap: Record<string, WizardPreferences['strength']> = {
      'light': 'light',
      'easy': 'light',
      'easy going': 'light',
      'mild': 'light',
      'low alcohol': 'light',
      'medium': 'medium',
      'balanced': 'medium',
      'moderate': 'medium',
      'regular': 'medium',
      'strong': 'strong',
      'powerful': 'strong',
      'high proof': 'strong',
      'potent': 'strong',
      'bring the power': 'strong'
    };
    wizardPrefs.strength = strengthMap[aiPrefs.strength.toLowerCase()] || null;
  }

  // Map occasion
  if (aiPrefs.occasion) {
    const occasionMap: Record<string, WizardPreferences['occasion']> = {
      'casual': 'casual',
      'happy hour': 'casual',
      'relaxing': 'casual',
      'everyday': 'casual',
      'celebration': 'celebration',
      'celebrating': 'celebration',
      'party': 'celebration',
      'festive': 'celebration',
      'business': 'business',
      'work': 'business',
      'meeting': 'business',
      'professional': 'business',
      'romantic': 'romantic',
      'date': 'romantic',
      'intimate': 'romantic',
      'date night': 'romantic',
      'sports': 'sports',
      'game day': 'sports',
      'watching': 'sports',
      'game': 'sports',
      'exploring': 'exploring',
      'adventure': 'exploring',
      'trying new': 'exploring',
      'experimental': 'exploring',
      'newly21': 'newly21',
      'new to drinking': 'newly21',
      'beginner': 'newly21',
      'birthday': 'birthday',
      'birthday party': 'birthday',
      'special occasion': 'birthday'
    };
    wizardPrefs.occasion = occasionMap[aiPrefs.occasion.toLowerCase()] || null;
  }

  // Map allergies
  if (aiPrefs.allergies && aiPrefs.allergies.length > 0) {
    const allergyMap: Record<string, AllergyType> = {
      'none': 'none',
      'no allergies': 'none',
      'gluten': 'gluten',
      'gluten-free': 'gluten',
      'celiac': 'gluten',
      'dairy': 'dairy',
      'lactose': 'dairy',
      'milk': 'dairy',
      'nuts': 'nuts',
      'tree nuts': 'nuts',
      'peanuts': 'nuts',
      'eggs': 'eggs',
      'egg': 'eggs',
      'soy': 'soy',
      'soybean': 'soy'
    };
    
    const mappedAllergies = aiPrefs.allergies
      .map(allergy => allergyMap[allergy.toLowerCase()])
      .filter(Boolean) as AllergyType[];
    
    wizardPrefs.allergies = mappedAllergies.length > 0 ? mappedAllergies : ['none'];
  }

  return wizardPrefs;
}

/**
 * Calculate confidence score based on how many preferences were extracted
 */
export function calculateConfidence(preferences: AIPreferences): number {
  let score = 0;
  const weights = {
    category: 30,
    flavor: 25,
    strength: 20,
    occasion: 15,
    allergies: 10
  };

  if (preferences.category) score += weights.category;
  if (preferences.flavor) score += weights.flavor;
  if (preferences.strength) score += weights.strength;
  if (preferences.occasion) score += weights.occasion;
  if (preferences.allergies && preferences.allergies.length > 0) score += weights.allergies;

  return Math.min(score, 100);
}

/**
 * Determine if we have enough information to make recommendations
 */
export function isReadyForRecommendations(
  preferences: AIPreferences, 
  confidence: number
): boolean {
  // Need at least category OR flavor, and confidence > 60%
  const hasEssentials = preferences.category || preferences.flavor;
  return hasEssentials && confidence >= 60;
}

/**
 * Generate follow-up questions based on missing preferences
 */
export function generateFollowUpQuestions(preferences: AIPreferences): string[] {
  const questions: string[] = [];

  if (!preferences.category) {
    questions.push("What type of drink interests you most - cocktails, beer, wine, or spirits?");
  }

  if (!preferences.flavor) {
    questions.push("Do you prefer crisp and refreshing drinks, or something smoother and richer?");
  }

  if (!preferences.strength) {
    questions.push("Are you looking for something light and easy, or would you prefer something stronger?");
  }

  if (!preferences.occasion) {
    questions.push("What's the occasion - casual hangout, celebration, or something special?");
  }

  if (!preferences.allergies) {
    questions.push("Any allergies I should know about, like gluten or dairy?");
  }

  return questions;
}