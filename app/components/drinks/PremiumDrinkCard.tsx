'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, TrendingUp, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PremiumGate } from '@/app/components/gates';

interface PremiumDrinkCardProps {
  drink: {
    id: string;
    name: string;
    description: string;
    image?: string;
    abv?: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    category: string;
    tags: string[];
    isPremium?: boolean;
    isExclusive?: boolean;
  };
  onSelect?: (drinkId: string) => void;
  className?: string;
}

const difficultyConfig = {
  easy: { color: 'text-green-600 dark:text-green-400', label: 'Easy' },
  medium: { color: 'text-yellow-600 dark:text-yellow-400', label: 'Medium' },
  hard: { color: 'text-orange-600 dark:text-orange-400', label: 'Hard' },
  expert: { color: 'text-red-600 dark:text-red-400', label: 'Expert' }
};

export default function PremiumDrinkCard({ 
  drink, 
  onSelect, 
  className 
}: PremiumDrinkCardProps) {
  const difficulty = difficultyConfig[drink.difficulty];

  const DrinkContent = () => (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect?.(drink.id)}
      className={cn(
        'relative cursor-pointer bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden',
        className
      )}
    >
      {/* Premium Badge */}
      {drink.isPremium && (
        <div className="absolute top-3 right-3 z-10">
          <div className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2 py-1 rounded-full">
            <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
              Premium
            </span>
          </div>
        </div>
      )}

      {/* Exclusive Badge */}
      {drink.isExclusive && (
        <div className="absolute top-3 left-3 z-10">
          <div className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 px-2 py-1 rounded-full">
            <Star className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
              Exclusive
            </span>
          </div>
        </div>
      )}

      {/* Image */}
      <div className="aspect-video bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 flex items-center justify-center">
        {drink.image ? (
          <img 
            src={drink.image} 
            alt={drink.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-16 h-16 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center">
            <ChefHat className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
            {drink.name}
          </h3>
          {drink.abv && (
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {drink.abv}% ABV
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {drink.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-700 dark:text-gray-300">
              {drink.category}
            </span>
            <span className={cn('font-medium', difficulty.color)}>
              {difficulty.label}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-3 h-3" />
            <span>Premium</span>
          </div>
        </div>

        {/* Tags */}
        {drink.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {drink.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800"
              >
                {tag}
              </span>
            ))}
            {drink.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{drink.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl" />
    </motion.div>
  );

  // If it's a premium drink, wrap with premium gate
  if (drink.isPremium || drink.isExclusive) {
    return (
      <PremiumGate
        plan={drink.isExclusive ? 'pro' : 'premium'}
        feature={`${drink.name} Recipe`}
        title={drink.isExclusive ? 'Exclusive Recipe' : 'Premium Recipe'}
        description={
          drink.isExclusive 
            ? 'This exclusive recipe is only available to Pro subscribers.'
            : 'This premium recipe is available to Premium and Pro subscribers.'
        }
        showBadge={false}
      >
        <DrinkContent />
      </PremiumGate>
    );
  }

  return <DrinkContent />;
}