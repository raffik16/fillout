import { Drink, DrinkRecommendation } from '@/app/types/drinks';
import { WizardPreferences } from '@/app/types/wizard';
import { WeatherData } from '@/app/types/weather';
import { getHappyHourBonus } from '@/lib/happyHour';
import drinksData from '@/data/drinks/index.js';

interface PreferenceScore {
  drink: Drink;
  score: number;
  reasons: string[];
}

export function matchDrinksToPreferences(
  preferences: WizardPreferences,
  weatherData?: WeatherData | null,
  isMetricUnit: boolean = false,
  debug: boolean = false
): DrinkRecommendation[] {
  const allDrinks = drinksData.drinks as Drink[];
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
      const matchingFlavors = drink.flavor_profile.filter(f => 
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
      } else {
        // If category doesn't match, exclude this drink entirely
        if (debug) {
          console.log(`   ❌ Category mismatch - EXCLUDED`);
        }
        continue; // Skip this drink entirely
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

    // 5. Occasion matching (15 points max)
    if (preferences.occasion && drink.occasions?.includes(preferences.occasion)) {
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
        'cold': (d) => d.weather_match.ideal_temp <= 10 || d.category === 'beer',
        'cool': (d) => d.weather_match.ideal_temp <= 20,
        'room': (d) => d.weather_match.ideal_temp >= 15 && d.weather_match.ideal_temp <= 25,
        'warm': (d) => d.weather_match.ideal_temp >= 20 || d.name.toLowerCase().includes('toddy')
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

    // 8. Happy Hour bonus (25 points max) - for drinks during happy hour
    const happyHourBonus = getHappyHourBonus(drink);
    if (happyHourBonus > 0) {
      score += happyHourBonus;
      reasons.push(`🍻 Happy Hour Special - ${drink.happy_hour_price}!`);
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

  // Sort by score with happy hour priority
  scores.sort((a, b) => {
    // First priority: Happy hour drinks (always prioritized when happy hour is active)
    const isHappyHourActive = getHappyHourBonus(a.drink) > 0 || getHappyHourBonus(b.drink) > 0;
    const aIsHappyHour = isHappyHourActive && a.drink.happy_hour;
    const bIsHappyHour = isHappyHourActive && b.drink.happy_hour;
    
    // If it's happy hour time, always put happy hour drinks first regardless of score
    if (aIsHappyHour && !bIsHappyHour) return -1;
    if (!aIsHappyHour && bIsHappyHour) return 1;
    
    // Second priority: Sort by score
    return b.score - a.score;
  });
  
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