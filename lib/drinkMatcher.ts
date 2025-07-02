import { Drink, DrinkRecommendation } from '@/app/types/drinks';
import { WizardPreferences } from '@/app/types/wizard';
import { WeatherData } from '@/app/types/weather';
import { getHappyHourBonus } from '@/lib/happyHour';

interface PreferenceScore {
  drink: Drink;
  score: number;
  reasons: string[];
}

export function matchDrinksToPreferences(
  drinks: Drink[],
  preferences: WizardPreferences,
  weatherData?: WeatherData | null,
  isMetricUnit: boolean = false,
  debug: boolean = false
): DrinkRecommendation[] {
  const allDrinks = drinks;
  const scores: PreferenceScore[] = [];

  if (debug) {
    console.log('🔍 DEBUG: Matching drinks to preferences:', preferences);
    console.log('🔍 DEBUG: Total drinks in database:', allDrinks.length);
  }

  for (const drink of allDrinks) {
    let score = 0;
    const reasons: string[] = [];

    if (debug) {
      console.log(`\n🍹 DEBUG: Scoring "${drink.name}" (category: ${drink.category}, strength: ${drink.strength}, abv: ${drink.abv})`);
    }

    // 1. Flavor matching (25 points max)
    if (preferences.flavor) {
      const flavorMap: Record<string, string[]> = {
        'sweet': ['sweet', 'fruity'],
        'bitter': ['bitter', 'herbal'],
        'sour': ['sour', 'citrus'],
        'smooth': ['smooth', 'creamy', 'mild']
      };

      const preferredFlavors = flavorMap[preferences.flavor] || [];
      const flavorProfile = drink.flavor_profile || drink.flavorProfile || [];
      const matchingFlavors = flavorProfile.filter(f => 
        preferredFlavors.some(pf => f.toLowerCase().includes(pf))
      );

      if (matchingFlavors.length > 0) {
        score += 25;
        reasons.push(`Matches your ${preferences.flavor} preference`);
      }
    }

    // 2. Category matching (20 points max) - High priority for direct category selection
    if (preferences.category && preferences.category !== 'any') {
      if (debug) {
        console.log(`   🎯 Category check: preference="${preferences.category}" vs drink="${drink.category}"`);
      }
      if (drink.category === preferences.category) {
        score += 20;
        const categoryReasons: Record<string, string> = {
          'beer': 'Your preferred beer style',
          'wine': 'Your preferred wine selection',
          'cocktail': 'Your preferred cocktail choice',
          'spirit': 'Your preferred spirit selection',
          'non-alcoholic': 'Your preferred non-alcoholic option'
        };
        reasons.push(categoryReasons[preferences.category] || 'Matches your preferred category');
        if (debug) {
          console.log(`   ✅ Category MATCH! +20 points`);
        }
      } else if (debug) {
        console.log(`   ❌ Category mismatch - no points`);
      }
    }

    // 3. Strength matching (20 points max)
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

    // 4. Adventure/Style matching (15 points max)
    if (preferences.adventure) {
      const adventureMap: Record<string, (drink: Drink) => boolean> = {
        'classic': (d) => ['Old Fashioned', 'Martini', 'Manhattan', 'Whiskey Sour', 'Margarita'].includes(d.name),
        'bold': (d) => {
          const flavorProfile = d.flavor_profile || d.flavorProfile || [];
          return flavorProfile.includes('spicy') || flavorProfile.includes('smoky') || d.strength === 'strong';
        },
        'fruity': (d) => {
          const flavorProfile = d.flavor_profile || d.flavorProfile || [];
          return flavorProfile.includes('fruity');
        },
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

    // 5. Occasion matching (15 points max)
    const occasions = drink.occasions || [];
    if (preferences.occasion && occasions.includes(preferences.occasion)) {
      score += 15;
      const occasionReasons: Record<string, string> = {
        'casual': 'Perfect for relaxing',
        'party': 'Great for parties',
        'romantic': 'Sets the mood',
        'relaxing': 'Helps you unwind',
        'sports': 'Great for game day',
        'exploring': 'Perfect for discovery'
      };
      reasons.push(occasionReasons[preferences.occasion]);
    }

    // 6. Temperature preference (10 points max)
    if (preferences.temperature) {
      const tempMap: Record<string, (drink: Drink) => boolean> = {
        'cold': (d) => {
          const weatherMatch = d.weather_match || d.weatherMatch;
          return (weatherMatch?.ideal_temp || 15) <= 10 || d.category === 'beer';
        },
        'cool': (d) => {
          const weatherMatch = d.weather_match || d.weatherMatch;
          return (weatherMatch?.ideal_temp || 15) <= 20;
        },
        'room': (d) => {
          const weatherMatch = d.weather_match || d.weatherMatch;
          const idealTemp = weatherMatch?.ideal_temp || 15;
          return idealTemp >= 15 && idealTemp <= 25;
        },
        'warm': (d) => {
          const weatherMatch = d.weather_match || d.weatherMatch;
          return (weatherMatch?.ideal_temp || 15) >= 20 || d.name.toLowerCase().includes('toddy');
        }
      };

      if (tempMap[preferences.temperature]?.(drink)) {
        score += 10;
      }
    }

    // 7. Weather bonus (15 points max) - if weather integration is enabled
    if (preferences.useWeather && weatherData) {
      const temp = weatherData.current.temp;
      const weatherCondition = weatherData.current.main.toLowerCase() || '';

      // Temperature matching
      const weatherMatch = drink.weather_match || drink.weatherMatch;
      if (weatherMatch) {
        if (temp >= weatherMatch.temp_min && temp <= weatherMatch.temp_max) {
          score += 10;
          reasons.push(`Great for ${Math.round(isMetricUnit ? temp : temp * 9/5 + 32)}°${isMetricUnit ? 'C' : 'F'}`);
        }

        // Weather condition matching
        if (weatherMatch.conditions?.includes(weatherCondition)) {
          score += 5;
        }
      }
    }

    // 8. Happy Hour bonus (10 points max) - for drinks during happy hour
    const happyHourBonus = getHappyHourBonus(drink);
    if (happyHourBonus > 0) {
      score += happyHourBonus;
      reasons.push('Happy Hour special!');
    }

    // 9. Casual occasion bonus for happy hour selection
    if (preferences.occasion === 'casual' && drink.happy_hour) {
      score += 5;
      reasons.push('Perfect for happy hour');
    }

    if (debug) {
      console.log(`   📊 Final score: ${score} points`);
      if (score > 0) {
        console.log(`   ✅ Added to results`);
      } else {
        console.log(`   ❌ Excluded (score: 0)`);
      }
    }

    if (score > 0) {
      scores.push({ drink, score, reasons });
    }
  }

  // Sort by score and take top matches
  scores.sort((a, b) => b.score - a.score);
  
  if (debug) {
    console.log(`\n🏆 DEBUG: Final Results (top 10 of ${scores.length} scored drinks):`);
    scores.slice(0, 10).forEach((result, index) => {
      console.log(`${index + 1}. "${result.drink.name}" - ${result.score} points (${result.drink.category}, ${result.drink.strength}, ${result.drink.abv}% ABV)`);
      console.log(`   Reasons: ${result.reasons.join(', ')}`);
    });
  }
  
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