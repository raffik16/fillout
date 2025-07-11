export type DrinkCategory = 'beer' | 'wine' | 'cocktail' | 'spirit' | 'non-alcoholic' | 'any' | 'featured';
export type FlavorProfile = 'sweet' | 'bitter' | 'sour' | 'smooth';
export type TemperaturePreference = 'cold' | 'cool' | 'room' | 'warm';
export type AdventureLevel = 'classic' | 'bold' | 'fruity' | 'simple';
export type StrengthPreference = 'light' | 'medium' | 'strong' | 'non-alcoholic';
export type OccasionMood = 'casual' | 'party' | 'romantic' | 'relaxing' | 'sports' | 'exploring';

export interface WizardPreferences {
  category: DrinkCategory | null;
  flavor: FlavorProfile | null;
  temperature: TemperaturePreference | null;
  adventure: AdventureLevel | null;
  strength: StrengthPreference | null;
  occasion: OccasionMood | null;
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