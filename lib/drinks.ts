import { Drink, DrinkFilters, DrinkRecommendation } from '@/app/types/drinks';
import { WeatherData } from '@/app/types/weather';
import { getTemperatureCategory, getTimeOfDay } from '@/lib/utils';

export function recommendDrinks(
  drinks: Drink[],
  weather: WeatherData,
  filters?: DrinkFilters,
  isMetricUnit: boolean = false
): DrinkRecommendation[] {
  let filteredDrinks = drinks;

  // Score each drink based on weather matching
  const recommendations = filteredDrinks.map((drink) => {
    const score = calculateWeatherScore(drink, weather);
    const reasons = generateRecommendationReasons(drink, weather, score, isMetricUnit);

    return {
      drink,
      score,
      reasons,
    };
  });

  // Sort by score (highest first) and return
  return recommendations
    .filter((rec) => rec.score > 0)
    .sort((a, b) => b.score - a.score);
}

function calculateWeatherScore(drink: Drink, weather: WeatherData): number {
  let score = 0;
  const currentTemp = weather.current.temp;
  const weatherMain = weather.current.main.toLowerCase();

  // Get weather match data (handle both field naming conventions)
  const weatherMatch = drink.weather_match || drink.weatherMatch;
  
  if (!weatherMatch) {
    // If no weather matching data, return a default score
    return 50;
  }

  // Temperature matching (40 points max)
  if (currentTemp >= weatherMatch.temp_min && currentTemp <= weatherMatch.temp_max) {
    // Perfect temperature match
    const tempRange = weatherMatch.temp_max - weatherMatch.temp_min;
    const tempDiff = Math.abs(currentTemp - weatherMatch.ideal_temp);
    const tempScore = 40 - (tempDiff / tempRange) * 20;
    score += Math.max(20, tempScore);
  } else {
    // Outside ideal range, but might still be acceptable
    const distance = Math.min(
      Math.abs(currentTemp - weatherMatch.temp_min),
      Math.abs(currentTemp - weatherMatch.temp_max)
    );
    score += Math.max(0, 20 - distance * 2);
  }

  // Weather condition matching (30 points max)
  if (weatherMatch.conditions && weatherMatch.conditions.includes(weatherMain)) {
    score += 30;
  } else if (weatherMatch.conditions && weatherMatch.conditions.some((condition) => 
    condition.includes('rain') && weatherMain.includes('rain') ||
    condition.includes('snow') && weatherMain.includes('snow') ||
    condition.includes('clear') && weatherMain.includes('clear')
  )) {
    score += 20;
  }

  // Time of day bonus (15 points max)
  const timeOfDay = getTimeOfDay();
  const timeBonus = getTimeOfDayBonus(drink, timeOfDay);
  score += timeBonus;

  // Temperature category bonus (15 points max)
  const tempCategory = getTemperatureCategory(currentTemp);
  const categoryBonus = getTemperatureCategoryBonus(drink, tempCategory);
  score += categoryBonus;

  return Math.min(100, Math.round(score));
}

function getTimeOfDayBonus(drink: Drink, timeOfDay: string): number {
  const timePreferences = {
    morning: ['coffee', 'tea', 'light'],
    afternoon: ['refreshing', 'light', 'medium'],
    evening: ['medium', 'strong', 'wine', 'cocktail'],
    night: ['strong', 'spirit', 'cocktail'],
  };

  const preferences = timePreferences[timeOfDay as keyof typeof timePreferences] || [];
  
  let bonus = 0;
  if (preferences.includes(drink.category)) bonus += 10;
  if (preferences.includes(drink.strength)) bonus += 5;

  return bonus;
}

function getTemperatureCategoryBonus(drink: Drink, tempCategory: string): number {
  const categoryPreferences = {
    hot: ['refreshing', 'light', 'beer', 'non-alcoholic'],
    warm: ['medium', 'refreshing', 'cocktail'],
    cool: ['medium', 'wine', 'cocktail'],
    cold: ['strong', 'spirit', 'savory', 'spicy'],
  };

  const preferences = categoryPreferences[tempCategory as keyof typeof categoryPreferences] || [];
  
  let bonus = 0;
  if (preferences.includes(drink.category)) bonus += 10;
  if (preferences.includes(drink.strength)) bonus += 5;
  
  // Handle both field naming conventions
  const flavorProfile = drink.flavor_profile || drink.flavorProfile || [];
  if (flavorProfile.some((flavor) => preferences.includes(flavor))) bonus += 5;

  return Math.min(15, bonus);
}

function generateRecommendationReasons(
  drink: Drink,
  weather: WeatherData,
  score: number,
  isMetricUnit: boolean = false
): string[] {
  const reasons: string[] = [];
  const currentTemp = weather.current.temp;
  const weatherDesc = weather.current.description;
  const tempCategory = getTemperatureCategory(currentTemp);

  // Convert temperature for display
  const displayTemp = isMetricUnit ? currentTemp : Math.round((currentTemp * 9/5) + 32);
  const tempUnit = isMetricUnit ? '°C' : '°F';

  // Get weather match data (handle both field naming conventions)
  const weatherMatch = drink.weather_match || drink.weatherMatch;
  
  // Temperature-based reasons
  if (weatherMatch && currentTemp >= weatherMatch.temp_min && currentTemp <= weatherMatch.temp_max) {
    if (tempCategory === 'hot') {
      reasons.push(`Perfect for this ${displayTemp}${tempUnit} weather`);
    } else if (tempCategory === 'cold') {
      reasons.push(`Ideal for warming up in ${displayTemp}${tempUnit}`);
    } else {
      reasons.push(`Great match for ${displayTemp}${tempUnit} weather`);
    }
  }

  // Weather condition reasons
  if (weatherMatch && weatherMatch.conditions && weatherMatch.conditions.includes(weather.current.main.toLowerCase())) {
    reasons.push(`Excellent choice for ${weatherDesc}`);
  }

  // Flavor profile reasons (handle both field naming conventions)
  const flavorProfile = drink.flavor_profile || drink.flavorProfile || [];
  if (tempCategory === 'hot' && flavorProfile.includes('refreshing')) {
    reasons.push('Refreshing choice for hot weather');
  } else if (tempCategory === 'cold' && (flavorProfile.includes('spicy') || flavorProfile.includes('smoky'))) {
    reasons.push('Warming flavors for cold weather');
  }

  // Time-based reasons
  const timeOfDay = getTimeOfDay();
  if (timeOfDay === 'evening' && (drink.category === 'wine' || drink.category === 'cocktail')) {
    reasons.push('Perfect evening drink');
  } else if (timeOfDay === 'afternoon' && drink.strength === 'light') {
    reasons.push('Light and suitable for afternoon');
  }

  // Ensure we always have at least one reason
  if (reasons.length === 0) {
    if (score > 70) {
      reasons.push('Highly recommended for current conditions');
    } else if (score > 40) {
      reasons.push('Good choice for the weather');
    } else {
      reasons.push('Worth trying in this weather');
    }
  }

  return reasons;
}