'use client';

import React, { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Drink } from '@/app/types/drinks';
import { Button } from '@/app/components/ui/Button';
import { FiX, FiPercent, FiDroplet, FiGlobe } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface DrinkModalProps {
  drink: Drink | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DrinkModal: React.FC<DrinkModalProps> = ({ drink, isOpen, onClose }) => {
  const [imageLoading, setImageLoading] = useState(true);

  // Reset loading state when drink changes
  useEffect(() => {
    if (drink) {
      setImageLoading(true);
    }
  }, [drink]);

  // Handle escape key
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Add/remove escape key listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, handleEscapeKey]);

  if (!drink) return null;

  const categoryColors = {
    beer: 'from-amber-500 to-amber-600',
    wine: 'from-purple-500 to-purple-600',
    cocktail: 'from-pink-500 to-pink-600',
    spirit: 'from-orange-500 to-orange-600',
    'non-alcoholic': 'from-green-500 to-green-600',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-x-auto md:inset-y-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full md:h-auto bg-white dark:bg-gray-900 rounded-2xl overflow-hidden z-50"
          >
            {/* Header Image */}
            <div className="relative h-64 w-full">
              {imageLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse">
                  <div className="absolute inset-0 animate-shimmer" />
                </div>
              )}
              <Image
                src={drink.image_url}
                alt={drink.name}
                fill
                className={cn("object-cover transition-opacity duration-300", 
                  imageLoading ? "opacity-0" : "opacity-100"
                )}
                sizes="(max-width: 768px) 100vw, 672px"
                onLoad={() => setImageLoading(false)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              
              <Button
                variant="glass"
                size="sm"
                onClick={onClose}
                className="absolute top-4 right-4 p-2"
              >
                <FiX className="w-5 h-5" />
              </Button>

              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-3xl font-bold text-white mb-2">{drink.name}</h2>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r text-white',
                    categoryColors[drink.category]
                  )}>
                    {drink.category}
                  </span>
                  {drink.glass_type && (
                    <span className="text-white/80 text-sm flex items-center gap-1">
                      <FiGlobe className="w-4 h-4" />
                      {drink.glass_type}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {drink.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <FiPercent className="w-4 h-4" />
                    <span className="text-sm">ABV</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {drink.abv}%
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <FiDroplet className="w-4 h-4" />
                    <span className="text-sm">Strength</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                    {drink.strength}
                  </p>
                </div>
              </div>

              {/* Ingredients */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Ingredients
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {(drink.ingredients || []).map((ingredient, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-300">
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preparation */}
              {drink.preparation && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Preparation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {drink.preparation}
                  </p>
                </div>
              )}

              {/* Serving Suggestions */}
              {(drink.serving_suggestions || []).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Serving Suggestions
                  </h3>
                  <ul className="space-y-1">
                    {(drink.serving_suggestions || []).map((suggestion, index) => (
                      <li key={index} className="text-gray-600 dark:text-gray-300">
                        • {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Flavor Profile */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Flavor Profile
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(drink.flavor_profile || []).map((flavor) => (
                    <span
                      key={flavor}
                      className="px-3 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full text-sm"
                    >
                      {flavor}
                    </span>
                  ))}
                </div>
              </div>

              {/* Occasions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Perfect For
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(drink.occasions || []).map((occasion) => (
                    <span
                      key={occasion}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm capitalize"
                    >
                      {occasion}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};