import { 
  DrinkCategory, 
  FlavorProfile, 
  TemperaturePreference, 
  AdventureLevel, 
  StrengthPreference, 
  OccasionMood, 
  AllergyType,
  WizardPreferences 
} from './wizard';

// Extended preference types for comprehensive user profile management
export type PreferenceIntensity = 'low' | 'medium' | 'high';
export type AIPersonality = 'casual' | 'professional' | 'enthusiastic' | 'knowledgeable';
export type RecommendationStyle = 'conservative' | 'balanced' | 'adventurous' | 'experimental';

// Comprehensive user preferences stored in Clerk metadata
export interface UserDrinkPreferences {
  // Core preferences (from wizard)
  primaryCategory: DrinkCategory | null;
  secondaryCategories: DrinkCategory[];
  flavorProfile: FlavorProfile | null;
  temperaturePreference: TemperaturePreference | null;
  adventureLevel: AdventureLevel | null;
  strengthPreference: StrengthPreference | null;
  preferredOccasions: OccasionMood[];
  allergies: AllergyType[];
  
  // Enhanced preferences
  categoryPreferences: {
    [K in DrinkCategory]: {
      enabled: boolean;
      priority: number; // 1-10 scale
      intensity: PreferenceIntensity;
    };
  };
  
  flavorIntensities: {
    [K in FlavorProfile]: PreferenceIntensity;
  };
  
  // Advanced settings
  useWeatherRecommendations: boolean;
  enableLocationBased: boolean;
  allowAlcoholicSuggestions: boolean;
  preferFamiliarDrinks: boolean;
  
  // AI and interaction preferences
  aiPersonality: AIPersonality;
  recommendationStyle: RecommendationStyle;
  chatHistoryEnabled: boolean;
  personalizedGreetings: boolean;
  
  // Privacy and data preferences
  shareDataForImprovement: boolean;
  allowAnalytics: boolean;
  emailNotifications: boolean;
  
  // Metadata
  lastUpdated: string;
  version: number;
  source: 'wizard' | 'manual' | 'imported';
}

// Preference validation schema
export interface PreferenceValidation {
  field: keyof UserDrinkPreferences;
  message: string;
  isValid: boolean;
}

// Preference change tracking
export interface PreferenceChange {
  field: keyof UserDrinkPreferences;
  oldValue: unknown;
  newValue: unknown;
  timestamp: string;
}

// Form state management
export interface PreferenceFormState {
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  errors: PreferenceValidation[];
  successMessage: string | null;
  lastSaved: string | null;
}

// Export/Import types for premium users
export interface PreferenceExport {
  preferences: UserDrinkPreferences;
  exportDate: string;
  version: string;
  userMetadata: {
    totalDrinksLiked: number;
    totalOrdersPlaced: number;
    memberSince: string;
  };
}

// Default preference values
export const DEFAULT_PREFERENCES: UserDrinkPreferences = {
  primaryCategory: null,
  secondaryCategories: [],
  flavorProfile: null,
  temperaturePreference: null,
  adventureLevel: null,
  strengthPreference: null,
  preferredOccasions: [],
  allergies: ['none'],
  
  categoryPreferences: {
    cocktail: { enabled: true, priority: 5, intensity: 'medium' },
    beer: { enabled: true, priority: 5, intensity: 'medium' },
    wine: { enabled: true, priority: 5, intensity: 'medium' },
    spirit: { enabled: true, priority: 5, intensity: 'medium' },
    'non-alcoholic': { enabled: true, priority: 5, intensity: 'medium' },
    any: { enabled: true, priority: 5, intensity: 'medium' },
    featured: { enabled: true, priority: 5, intensity: 'medium' },
  },
  
  flavorIntensities: {
    crisp: 'medium',
    smoky: 'medium',
    sweet: 'medium',
    bitter: 'medium',
    sour: 'medium',
    smooth: 'medium',
  },
  
  useWeatherRecommendations: true,
  enableLocationBased: false,
  allowAlcoholicSuggestions: true,
  preferFamiliarDrinks: false,
  
  aiPersonality: 'enthusiastic',
  recommendationStyle: 'balanced',
  chatHistoryEnabled: true,
  personalizedGreetings: true,
  
  shareDataForImprovement: true,
  allowAnalytics: true,
  emailNotifications: false,
  
  lastUpdated: new Date().toISOString(),
  version: 1,
  source: 'manual',
};

// Utility function to convert wizard preferences to full user preferences
export function wizardToUserPreferences(
  wizardPrefs: WizardPreferences,
  existingPrefs: Partial<UserDrinkPreferences> = {}
): UserDrinkPreferences {
  const base = { ...DEFAULT_PREFERENCES, ...existingPrefs };
  
  return {
    ...base,
    primaryCategory: wizardPrefs.category,
    flavorProfile: wizardPrefs.flavor,
    temperaturePreference: wizardPrefs.temperature,
    adventureLevel: wizardPrefs.adventure,
    strengthPreference: wizardPrefs.strength,
    preferredOccasions: wizardPrefs.occasion ? [wizardPrefs.occasion] : [],
    allergies: wizardPrefs.allergies || ['none'],
    useWeatherRecommendations: wizardPrefs.useWeather,
    lastUpdated: new Date().toISOString(),
    source: 'wizard',
  };
}

// Utility function to convert user preferences back to wizard format
export function userToWizardPreferences(userPrefs: UserDrinkPreferences): WizardPreferences {
  return {
    category: userPrefs.primaryCategory,
    flavor: userPrefs.flavorProfile,
    temperature: userPrefs.temperaturePreference,
    adventure: userPrefs.adventureLevel,
    strength: userPrefs.strengthPreference,
    occasion: userPrefs.preferredOccasions[0] || null,
    allergies: userPrefs.allergies,
    useWeather: userPrefs.useWeatherRecommendations,
  };
}