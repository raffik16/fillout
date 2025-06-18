'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DrinkCard } from './DrinkCard';
import { Drink, DrinkRecommendation } from '@/app/types/drinks';

interface DrinkGridProps {
  drinks: Drink[];
  recommendations?: DrinkRecommendation[];
  onDrinkClick?: (drink: Drink) => void;
  isLoading?: boolean;
}

export const DrinkGrid: React.FC<DrinkGridProps> = ({
  drinks,
  recommendations,
  onDrinkClick,
  isLoading,
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <p className="text-xl text-gray-600 dark:text-gray-400">
          No drinks found matching your criteria.
        </p>
        <p className="text-gray-500 dark:text-gray-500 mt-2">
          Try adjusting your filters or search terms.
        </p>
      </motion.div>
    );
  }

  const drinksWithRecommendations = drinks.map((drink) => {
    const recommendation = recommendations?.find((rec) => rec.drink.id === drink.id);
    return { drink, recommendation };
  });

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence>
        {drinksWithRecommendations.map(({ drink, recommendation }) => (
          <motion.div
            key={drink.id}
            variants={item}
            layout
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <DrinkCard
              drink={drink}
              recommendation={recommendation}
              onClick={() => onDrinkClick?.(drink)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};