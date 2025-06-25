'use client';

import React, { useState, useRef, useCallback } from 'react';
import { DrinkCard } from './DrinkCard';
import { Drink, DrinkRecommendation } from '@/app/types/drinks';
import { sortDrinksForHappyHour } from '@/lib/happyHour';
import { cn } from '@/lib/utils';

interface DrinkGridProps {
  drinks: Drink[];
  recommendations?: DrinkRecommendation[];
  onDrinkClick?: (drink: Drink) => void;
  onRecipeClick?: (drink: Drink) => void;
  isLoading?: boolean;
}

export const DrinkGrid: React.FC<DrinkGridProps> = ({
  drinks,
  recommendations,
  onDrinkClick,
  onRecipeClick,
  isLoading,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sort drinks to prioritize happy hour during active hours
  const sortedDrinks = sortDrinksForHappyHour(drinks);
  
  // Debounced hover handlers to prevent rapid state changes
  const handleMouseEnter = useCallback((index: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setHoveredIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Add a small delay before clearing hover state
    timeoutRef.current = setTimeout(() => {
      setHoveredIndex(null);
    }, 100);
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (drinks.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          No drinks found matching your criteria.
        </p>
        <p className="text-gray-500 dark:text-gray-500 mt-2">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  const drinksWithRecommendations = sortedDrinks.map((drink) => {
    const recommendation = recommendations?.find((rec) => rec.drink.id === drink.id);
    return { drink, recommendation };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {drinksWithRecommendations.map(({ drink, recommendation }, index) => (
        <div 
          key={drink.id}
          className={cn(
            "transition-all duration-300 ease-out",
            hoveredIndex !== null && {
              "scale-95 opacity-70": hoveredIndex !== index,
              "scale-105 z-10": hoveredIndex === index,
            }
          )}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
        >
          <DrinkCard
            drink={drink}
            recommendation={recommendation}
            onClick={() => onDrinkClick?.(drink)}
            onRecipeClick={() => onRecipeClick?.(drink)}
          />
        </div>
      ))}
    </div>
  );
};