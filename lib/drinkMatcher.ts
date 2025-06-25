import { Drink, DrinkRecommendation } from '@/app/types/drinks';
import { WizardPreferences } from '@/app/types/wizard';
import { WeatherData } from '@/app/types/weather';
import { getHappyHourBonus } from '@/lib/happyHour';
import drinksData from '@/data/drinks.json';

interface PreferenceScore {
  drink: Drink;
  score: number;
  reasons: string[];
}

export function matchDrinksToPreferences(
  preferences: WizardPreferences,
  weatherData?: WeatherData | null,
  isMetricUnit: boolean = false
): DrinkRecommendation[] {
  const allDrinks = drinksData.drinks as Drink[];
  const scores: PreferenceScore[] = [];

  for (const drink of allDrinks) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Flavor matching (25 points max)
    if (preferences.flavor) {
      const flavorMap: Record<string, string[]> = {
        'sweet': ['sweet', 'fruity'],
        'bitter': ['bitter', 'herbal'],
        'sour': ['sour', 'citrus'],
        'smooth': ['smooth', 'creamy', 'mild']
      };

      const preferredFlavors = flavorMap[preferences.flavor] || [];
      const matchingFlavors = drink.flavor_profile.filter(f => 
        preferredFlavors.some(pf => f.toLowerCase().includes(pf))
      );

      if (matchingFlavors.length > 0) {
        score += 25;
        reasons.push(`Matches your ${preferences.flavor} preference`);
      }
    }

    // 2. Strength matching (20 points max)
    if (preferences.strength) {
      const strengthMap: Record<string, string> = {
        'light': 'light',
        'medium': 'medium',
        'strong': 'strong',
        'non-alcoholic': 'non-alcoholic'
      };

      if (drink.strength === strengthMap[preferences.strength]) {
        score += 20;
        reasons.push(`${preferences.strength === 'non-alcoholic' ? 'Zero proof' : preferences.strength.charAt(0).toUpperCase() + preferences.strength.slice(1)} strength`);
      }
    }

    // 3. Adventure/Style matching (15 points max)
    if (preferences.adventure) {
      const adventureMap: Record<string, (drink: Drink) => boolean> = {
        'classic': (d) => ['Old Fashioned', 'Martini', 'Manhattan', 'Whiskey Sour', 'Margarita'].includes(d.name),
        'bold': (d) => d.flavor_profile.includes('spicy') || d.flavor_profile.includes('smoky') || d.strength === 'strong',
        'fruity': (d) => d.flavor_profile.includes('fruity'),
        'simple': (d) => (d.ingredients?.length || 0) <= 3 || d.category === 'beer' || d.category === 'wine'
      };

      if (adventureMap[preferences.adventure]?.(drink)) {
        score += 15;
        const adventureReasons: Record<string, string> = {
          'classic': 'A timeless classic',
          'bold': 'Bold and adventurous',
          'fruity': 'Fruity and fun',
          'simple': 'Simple and clean'
        };
        reasons.push(adventureReasons[preferences.adventure]);
      }
    }

    // 4. Occasion matching (15 points max)
    if (preferences.occasion && drink.occasions?.includes(preferences.occasion)) {
      score += 15;
      const occasionReasons: Record<string, string> = {
        'casual': 'Perfect for relaxing',
        'party': 'Great for parties',
        'romantic': 'Sets the mood',
        'relaxing': 'Helps you unwind'
      };
      reasons.push(occasionReasons[preferences.occasion]);
    }

    // 5. Temperature preference (10 points max)
    if (preferences.temperature) {
      const tempMap: Record<string, (drink: Drink) => boolean> = {
        'cold': (d) => d.weather_match.ideal_temp <= 10 || d.category === 'beer',
        'cool': (d) => d.weather_match.ideal_temp <= 20,
        'room': (d) => d.weather_match.ideal_temp >= 15 && d.weather_match.ideal_temp <= 25,
        'warm': (d) => d.weather_match.ideal_temp >= 20 || d.name.toLowerCase().includes('toddy')
      };

      if (tempMap[preferences.temperature]?.(drink)) {
        score += 10;
      }
    }

    // 6. Weather bonus (15 points max) - if weather integration is enabled
    if (preferences.useWeather && weatherData) {
      const temp = weatherData.current.temp;
      const weatherCondition = weatherData.current.main.toLowerCase() || '';

      // Temperature matching
      if (drink.weather_match) {
        if (temp >= drink.weather_match.temp_min && temp <= drink.weather_match.temp_max) {
          score += 10;
          reasons.push(`Great for ${Math.round(isMetricUnit ? temp : temp * 9/5 + 32)}°${isMetricUnit ? 'C' : 'F'}`);
        }

        // Weather condition matching
        if (drink.weather_match.conditions?.includes(weatherCondition)) {
          score += 5;
        }
      }
    }

    // 7. Happy Hour bonus (10 points max) - for drinks during happy hour
    const happyHourBonus = getHappyHourBonus(drink);
    if (happyHourBonus > 0) {
      score += happyHourBonus;
      reasons.push('Happy Hour special!');
    }

    // 8. Casual occasion bonus for happy hour selection
    if (preferences.occasion === 'casual' && drink.happy_hour) {
      score += 5;
      reasons.push('Perfect for happy hour');
    }

    if (score > 0) {
      scores.push({ drink, score, reasons });
    }
  }

  // Sort by score and take top matches
  scores.sort((a, b) => b.score - a.score);
  
  return scores.slice(0, 10).map(({ drink, score, reasons }) => ({
    drink,
    score,
    reasons
  }));
}

// Helper function to get a fun match message based on score
export function getMatchMessage(score: number): string {
  if (score >= 80) return "Perfect Match! 🎯";
  if (score >= 60) return "Great Match! ⭐";
  if (score >= 40) return "Good Match! 👍";
  return "Worth a Try! 🤔";
}