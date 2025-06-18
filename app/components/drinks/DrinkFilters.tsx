'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { DrinkFilters as DrinkFiltersType, DrinkCategory, DrinkStrength, FlavorProfile, Occasion } from '@/app/types/drinks';
import { FiFilter, FiSearch } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface DrinkFiltersProps {
  filters: DrinkFiltersType;
  onFiltersChange: (filters: DrinkFiltersType) => void;
  className?: string;
}

export const DrinkFilters: React.FC<DrinkFiltersProps> = ({
  filters,
  onFiltersChange,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const categoryOptions = [
    { value: 'beer', label: 'Beer' },
    { value: 'wine', label: 'Wine' },
    { value: 'cocktail', label: 'Cocktail' },
    { value: 'spirit', label: 'Spirit' },
    { value: 'non-alcoholic', label: 'Non-Alcoholic' },
  ];

  const strengthOptions = [
    { value: 'non-alcoholic', label: 'Non-Alcoholic' },
    { value: 'light', label: 'Light' },
    { value: 'medium', label: 'Medium' },
    { value: 'strong', label: 'Strong' },
  ];

  const flavorOptions = [
    { value: 'sweet', label: 'Sweet' },
    { value: 'bitter', label: 'Bitter' },
    { value: 'sour', label: 'Sour' },
    { value: 'refreshing', label: 'Refreshing' },
    { value: 'fruity', label: 'Fruity' },
    { value: 'spicy', label: 'Spicy' },
    { value: 'herbal', label: 'Herbal' },
    { value: 'smoky', label: 'Smoky' },
  ];

  const occasionOptions = [
    { value: 'casual', label: 'Casual' },
    { value: 'party', label: 'Party' },
    { value: 'romantic', label: 'Romantic' },
    { value: 'business', label: 'Business' },
    { value: 'relaxing', label: 'Relaxing' },
    { value: 'celebration', label: 'Celebration' },
  ];

  const handleFilterChange = (key: keyof DrinkFiltersType, value: DrinkFiltersType[keyof DrinkFiltersType]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleToggleFilter = (
    key: keyof DrinkFiltersType,
    value: string
  ) => {
    const currentValues = (filters[key] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    
    handleFilterChange(key, newValues.length > 0 ? (newValues as DrinkFiltersType[keyof DrinkFiltersType]) : undefined);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };


  return (
    <div className={cn('relative', className)}>
      {/* Popular Categories */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Popular Categories
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={filters.categories?.includes('beer') ? 'primary' : 'secondary'}
            size="lg"
            onClick={() => handleToggleFilter('categories', 'beer')}
            className="p-4 text-base font-medium"
          >
            🍺 Beer
          </Button>
          <Button
            variant={filters.categories?.includes('wine') ? 'primary' : 'secondary'}
            size="lg"
            onClick={() => handleToggleFilter('categories', 'wine')}
            className="p-4 text-base font-medium"
          >
            🍷 Wine
          </Button>
          <Button
            variant={filters.categories?.includes('cocktail') ? 'primary' : 'secondary'}
            size="lg"
            onClick={() => handleToggleFilter('categories', 'cocktail')}
            className="p-4 text-base font-medium"
          >
            🍸 Cocktails
          </Button>
          <Button
            variant={
              filters.categories?.some(cat => ['spirit', 'non-alcoholic'].includes(cat)) 
                ? 'primary' 
                : 'secondary'
            }
            size="lg"
            onClick={() => {
              const hasSpirit = filters.categories?.includes('spirit');
              const hasNonAlcoholic = filters.categories?.includes('non-alcoholic');
              
              if (hasSpirit || hasNonAlcoholic) {
                // Remove both categories
                const newCategories = (filters.categories || []).filter(
                  cat => !['spirit', 'non-alcoholic'].includes(cat)
                );
                handleFilterChange('categories', newCategories.length > 0 ? newCategories : undefined);
              } else {
                // Add both categories
                const currentCategories = filters.categories || [];
                const newCategories = [...currentCategories, 'spirit' as const, 'non-alcoholic' as const];
                handleFilterChange('categories', newCategories);
              }
            }}
            className="p-4 text-base font-medium"
          >
            🥃 Others
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <Input
          placeholder="Search drinks..."
          icon={<FiSearch />}
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
        />
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <FiFilter />
          Advanced Filters
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-red-600 hover:text-red-700"
        >
          Clear all
        </Button>
      </div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        filters.categories?.includes(option.value as DrinkCategory)
                          ? 'primary'
                          : 'ghost'
                      }
                      size="sm"
                      onClick={() => handleToggleFilter('categories', option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Strength */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Strength
                </h3>
                <div className="flex flex-wrap gap-2">
                  {strengthOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        filters.strength?.includes(option.value as DrinkStrength)
                          ? 'primary'
                          : 'ghost'
                      }
                      size="sm"
                      onClick={() => handleToggleFilter('strength', option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Flavors */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Flavors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {flavorOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        filters.flavors?.includes(option.value as FlavorProfile)
                          ? 'primary'
                          : 'ghost'
                      }
                      size="sm"
                      onClick={() => handleToggleFilter('flavors', option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Occasions */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Occasions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {occasionOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        filters.occasions?.includes(option.value as Occasion)
                          ? 'primary'
                          : 'ghost'
                      }
                      size="sm"
                      onClick={() => handleToggleFilter('occasions', option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};