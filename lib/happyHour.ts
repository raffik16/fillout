import { Drink } from '@/app/types/drinks';

export interface HappyHourConfig {
  startHour: number; // 24-hour format
  endHour: number;   // 24-hour format
  enabled: boolean;
}

// Default happy hour configuration: 3 PM - 6 PM
export const DEFAULT_HAPPY_HOUR: HappyHourConfig = {
  startHour: 15, // 3 PM
  endHour: 18,   // 6 PM
  enabled: true
};

/**
 * Check if current time is within happy hour
 */
export function isCurrentlyHappyHour(config: HappyHourConfig = DEFAULT_HAPPY_HOUR): boolean {
  if (!config.enabled) return false;
  
  const now = new Date();
  const currentHour = now.getHours();
  
  return currentHour >= config.startHour && currentHour < config.endHour;
}

/**
 * Get formatted happy hour time range
 */
export function getHappyHourTimeRange(config: HappyHourConfig = DEFAULT_HAPPY_HOUR): string {
  if (!config.enabled) return '';
  
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };
  
  return `${formatHour(config.startHour)} - ${formatHour(config.endHour)}`;
}

/**
 * Filter drinks to only show happy hour specials
 */
export function getHappyHourDrinks(drinks: Drink[]): Drink[] {
  return drinks.filter(drink => drink.happy_hour === true);
}

/**
 * Sort drinks to prioritize happy hour during active hours
 */
export function sortDrinksForHappyHour(drinks: Drink[], config: HappyHourConfig = DEFAULT_HAPPY_HOUR): Drink[] {
  if (!isCurrentlyHappyHour(config)) {
    return drinks;
  }
  
  return [...drinks].sort((a, b) => {
    // Happy hour drinks first during active hours
    if (a.happy_hour && !b.happy_hour) return -1;
    if (!a.happy_hour && b.happy_hour) return 1;
    return 0;
  });
}

/**
 * Get happy hour bonus points for drink matching
 */
export function getHappyHourBonus(drink: Drink, config: HappyHourConfig = DEFAULT_HAPPY_HOUR): number {
  if (!drink.happy_hour || !isCurrentlyHappyHour(config)) {
    return 0;
  }
  
  return 25; // 25 point bonus for happy hour drinks during active hours
}

/**
 * Check if we should show happy hour indicator
 */
export function shouldShowHappyHourIndicator(drink: Drink): boolean {
  return drink.happy_hour === true;
}

/**
 * Get happy hour status text
 */
export function getHappyHourStatus(drink: Drink, config: HappyHourConfig = DEFAULT_HAPPY_HOUR): string {
  if (!drink.happy_hour) return '';
  
  const isActive = isCurrentlyHappyHour(config);
  const timeRange = drink.happy_hour_times || getHappyHourTimeRange(config);
  
  if (isActive) {
    return `Happy Hour Active • ${timeRange}`;
  } else {
    return `Happy Hour • ${timeRange}`;
  }
}