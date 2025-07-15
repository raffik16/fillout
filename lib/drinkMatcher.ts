import { Drink, DrinkRecommendation, Occasion } from '@/app/types/drinks';
import { WizardPreferences, OccasionMood } from '@/app/types/wizard';
import { WeatherData } from '@/app/types/weather';
import { getHappyHourBonus } from '@/lib/happyHour';
import { getPopularDrinks } from '@/lib/supabase';

// Map wizard occasions to drink occasions
function mapOccasion(wizardOccasion: OccasionMood): Occasion {
  const mapping: Record<OccasionMood, Occasion> = {
    'casual': 'casual',
    'party': 'celebration',
    'romantic': 'romantic', 
    'relaxing': 'casual',
    'sports': 'sports',
    'exploring': 'exploring',
    'newly21': 'newly21',
    'birthday': 'birthday'
  };
  return mapping[wizardOccasion];
}
import drinksData from '@/data/drinks/index.js';

interface PreferenceScore {
  drink: Drink;
  score: number;
  reasons: string[];
}

export async function matchDrinksToPreferences(
  preferences: WizardPreferences,
  weatherData?: WeatherData | null,
  isMetricUnit: boolean = false,
  debug: boolean = false
): Promise<DrinkRecommendation[]> {
  const allDrinks = drinksData.drinks as Drink[];
  const scores: PreferenceScore[] = [];
  
  // Get popularity data
  const popularDrinks = await getPopularDrinks();
  const popularityMap = new Map(popularDrinks.map(p => [p.drink_id, p.like_count]));

  if (debug) {
    console.log('🔍 DEBUG: Matching drinks to preferences:', preferences);
    console.log('🔍 DEBUG: Total drinks in database:', allDrinks.length);
    console.log('🔍 DEBUG: Popular drinks loaded:', popularDrinks.length);
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
      
      // Special handling for featured category
      if (preferences.category === 'featured') {
        // Only include featured drinks
        if (!drink.featured) {
          if (debug) {
            console.log(`   ❌ Not a featured drink - EXCLUDED`);
          }
          continue; // Skip non-featured drinks
        }
        // Featured drinks get base points
        score += 20;
        reasons.push('⭐ Featured Drink');
        if (debug) {
          console.log(`   ✅ Featured drink! +20 points`);
        }
      } else if (drink.category === preferences.category) {
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
        'bold': (d) => d.flavor_profile.includes('bitter') || d.strength === 'strong',
        'fruity': (d) => d.flavor_profile.includes('sweet'),
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
    if (preferences.occasion) {
      // Special handling for newly 21 and birthday occasions
      if (preferences.occasion === 'newly21' && drink.funForTwentyOne) {
        score += 25; // Extra bonus for newly 21 drinks
        reasons.push('🎂 Perfect for your 21st celebration!');
      } else if (preferences.occasion === 'birthday' && drink.goodForBDay) {
        score += 25; // Extra bonus for birthday drinks
        reasons.push('🎉 Perfect for your birthday celebration!');
      } else if (preferences.occasion && drink.occasions?.includes(mapOccasion(preferences.occasion))) {
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

    // 10. Additional featured drink bonus (if featured drinks category selected)
    if (preferences.category === 'featured' && drink.featured) {
      score += 15; // Extra bonus to ensure featured drinks rank higher
      reasons.push('Hand-picked by our experts');
    }

    // 11. Popularity bonus (10 points max) - based on like count
    const likeCount = popularityMap.get(drink.id) || 0;
    if (likeCount > 0) {
      const popularityBonus = Math.min(10, Math.floor(likeCount / 2)); // 2 likes = 1 point, max 10 points
      score += popularityBonus;
      
      if (likeCount >= 20) {
        reasons.push('🔥 Crowd favorite!');
      } else if (likeCount >= 10) {
        reasons.push('⭐ Popular choice');
      } else if (likeCount >= 5) {
        reasons.push('👍 Well-liked');
      }
      
      if (debug) {
        console.log(`   💝 Popularity bonus: ${popularityBonus} points (${likeCount} likes)`);
      }
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