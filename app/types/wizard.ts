export type DrinkCategory = 'beer' | 'wine' | 'cocktail' | 'spirit' | 'non-alcoholic' | 'any' | 'featured';
export type FlavorProfile = 'crisp' | 'smokey' | 'sweet' | 'bitter' | 'sour' | 'smooth';
export type TemperaturePreference = 'cold' | 'cool' | 'room' | 'warm';
export type AdventureLevel = 'classic' | 'bold' | 'fruity' | 'simple';
export type StrengthPreference = 'light' | 'medium' | 'strong';
export type OccasionMood = 'casual' | 'party' | 'romantic' | 'relaxing' | 'sports' | 'exploring' | 'newly21' | 'birthday' | 'business';
export type AllergyType = 'gluten' | 'dairy' | 'nuts' | 'eggs' | 'soy' | 'none';

export interface WizardPreferences {
  category: DrinkCategory | null;
  flavor: FlavorProfile | null;
  temperature: TemperaturePreference | null;
  adventure: AdventureLevel | null;
  strength: StrengthPreference | null;
  occasion: OccasionMood | null;
  allergies: AllergyType[] | null;
  useWeather: boolean;
}

export interface WizardQuestion {
  id: keyof Omit<WizardPreferences, 'useWeather'>;
  title: string;
  subtitle?: string;
  options: WizardOption[];
}

export interface WizardOption {
  value: string;
  label: string;
  emoji: string;
  description?: string;
}