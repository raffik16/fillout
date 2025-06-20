'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { DrinkFilters as DrinkFiltersType, DrinkCategory, DrinkStrength, FlavorProfile, Occasion } from '@/app/types/drinks';
import { FiSearch } from 'react-icons/fi';
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
  const [popoverPosition, setPopoverPosition] = useState<'bottom' | 'top'>('bottom');
  const buttonRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // Calculate active filter count
  const activeFilterCount = 
    (filters.strength?.length || 0) + 
    (filters.flavors?.length || 0) + 
    (filters.occasions?.length || 0);
  
  // Detect if popover should open up or down
  useEffect(() => {
    const updatePosition = () => {
      if (isExpanded && buttonRef.current && popoverRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const popoverHeight = 400; // Approximate height
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        
        // If not enough space below and more space above, open upward
        if (spaceBelow < popoverHeight + 20 && spaceAbove > spaceBelow) {
          setPopoverPosition('top');
        } else {
          setPopoverPosition('bottom');
        }
      }
    };

    updatePosition();
    
    // Update on scroll and resize
    if (isExpanded) {
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isExpanded]);

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
            variant={filters.categories?.includes('spirit') ? 'primary' : 'secondary'}
            size="lg"
            onClick={() => handleToggleFilter('categories', 'spirit')}
            className="p-4 text-base font-medium"
          >
            🥃 Spirits
          </Button>
        </div>
        
        {/* Non-Alcoholic Option */}
        <div className="mt-3">
          <Button
            variant={filters.categories?.includes('non-alcoholic') ? 'primary' : 'secondary'}
            size="lg"
            onClick={() => handleToggleFilter('categories', 'non-alcoholic')}
            className="w-full p-4 text-base font-medium"
          >
            🥤 Non-Alcoholic
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
      <div className="flex items-center justify-between mb-4 isolate">
        <div className="relative" ref={buttonRef} style={{ isolation: 'isolate' }}>
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 relative"
          >
            Advanced Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
          
          {/* Popover Filters - Portal */}
          {isExpanded && typeof window !== 'undefined' && createPortal(
            <>
              {/* Backdrop to close popover */}
              <div 
                className="fixed inset-0 z-[9998]" 
                onClick={() => setIsExpanded(false)}
              />
              
              {/* Popover Content */}
              <motion.div
                ref={popoverRef}
                initial={{ opacity: 0, scale: 0.95, y: popoverPosition === 'bottom' ? -10 : 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: popoverPosition === 'bottom' ? -10 : 10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "fixed w-80 z-[9999] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 max-h-[500px] overflow-y-auto filter-scroll",
                  popoverPosition === 'bottom' ? 'mt-2' : 'mb-2'
                )}
                style={{
                  left: buttonRef.current ? `${buttonRef.current.getBoundingClientRect().left}px` : '0',
                  ...(popoverPosition === 'bottom' 
                    ? { top: buttonRef.current ? `${buttonRef.current.getBoundingClientRect().bottom}px` : '0' }
                    : { bottom: buttonRef.current ? `${window.innerHeight - buttonRef.current.getBoundingClientRect().top}px` : '0' }
                  ),
                  transform: 'translateZ(0)', // Force GPU acceleration
                  pointerEvents: 'auto',
                }}
                >
                  {/* Compact Filter Sections */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Strength
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {strengthOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleToggleFilter('strength', option.value)}
                          className={cn(
                            "px-2 py-1 text-xs rounded-md transition-colors",
                            filters.strength?.includes(option.value as DrinkStrength)
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Flavors
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {flavorOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleToggleFilter('flavors', option.value)}
                          className={cn(
                            "px-2 py-1 text-xs rounded-md transition-colors",
                            filters.flavors?.includes(option.value as FlavorProfile)
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Occasions
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {occasionOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleToggleFilter('occasions', option.value)}
                          className={cn(
                            "px-2 py-1 text-xs rounded-md transition-colors",
                            filters.occasions?.includes(option.value as Occasion)
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters Link */}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={clearFilters}
                      className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Clear all filters
                    </button>
                  </div>
                </motion.div>
            </>,
            document.body
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-red-600 hover:text-red-700"
        >
          Clear all
        </Button>
      </div>
    </div>
  );
};