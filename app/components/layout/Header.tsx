'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { GiBeerBottle } from 'react-icons/gi';
import { Button } from '@/app/components/ui/Button';
import { Select } from '@/app/components/ui/Select';
import axios from 'axios';

interface HeaderProps {
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  location?: string;
  temperature?: number;
  isMetricUnit?: boolean;
  showLocation?: boolean;
  barData?: {
    id: string;
    slug: string;
    name: string;
    logo?: string;
    theme?: any;
  } | null;
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, onToggleDarkMode, location, temperature, isMetricUnit = false, showLocation = false, barData }) => {
  const [bars, setBars] = useState<any[]>([]);
  const [isLoadingBars, setIsLoadingBars] = useState(false);
  
  // Fetch available bars on mount
  useEffect(() => {
    const fetchBars = async () => {
      setIsLoadingBars(true);
      try {
        const response = await axios.get('/api/bars');
        setBars(response.data || []);
      } catch (error) {
        console.error('Failed to fetch bars:', error);
      } finally {
        setIsLoadingBars(false);
      }
    };
    
    fetchBars();
  }, []);
  
  // Format bar options for Select component
  const barOptions = [
    { value: '', label: 'All Bars' },
    ...bars.map(bar => ({
      value: bar.slug,
      label: bar.name
    }))
  ];
  
  // Handle bar selection
  const handleBarChange = (value: string) => {
    if (value) {
      // Save to localStorage and redirect to bar URL
      localStorage.setItem('selectedBar', value);
      window.location.href = `/${value}`;
    } else {
      // Clear selection
      localStorage.removeItem('selectedBar');
      window.location.href = '/';
    }
  };
  
  // Format temperature display
  const formatTemperature = () => {
    if (temperature === undefined) return '';
    const displayTemp = isMetricUnit ? temperature : Math.round((temperature * 9/5) + 32);
    const unit = isMetricUnit ? '°C' : '°F';
    return `${displayTemp}${unit}`;
  };

  // Format location with proper title case
  const formatLocation = (loc?: string) => {
    if (!loc) return '';
    return loc
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            {barData?.logo ? (
              <img 
                src={barData.logo} 
                alt={barData.name}
                className="w-8 h-8 object-cover rounded-full"
              />
            ) : (
              <GiBeerBottle className="w-8 h-8 text-amber-600" />
            )}
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {barData?.name || 'Drinkjoy'}
              </h1>
              <div className="relative overflow-hidden">
                <motion.p 
                  className="text-xs text-gray-600 dark:text-gray-400"
                  animate={{ 
                    y: showLocation && location ? -20 : 0,
                    opacity: showLocation && location ? 0 : 1 
                  }}
                  transition={{ duration: 0.3 }}
                >
                  drinks made easy everytime
                </motion.p>
                <motion.p 
                  className="text-xs text-blue-600 dark:text-blue-400 font-medium absolute top-0 left-0"
                  animate={{ 
                    y: showLocation && location ? 0 : 20,
                    opacity: showLocation && location ? 1 : 0 
                  }}
                  transition={{ duration: 0.3 }}
                >
                  For {formatTemperature()} in {formatLocation(location)}
                </motion.p>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            {/* Bar Selector Dropdown */}
            {!isLoadingBars && bars.length > 0 && (
              <Select
                options={barOptions}
                value={barData?.slug || ''}
                onChange={handleBarChange}
                placeholder="Select a bar"
                className="w-40"
              />
            )}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleDarkMode}
                className="p-2"
              >
                {isDarkMode ? (
                  <FiSun className="w-5 h-5" />
                ) : (
                  <FiMoon className="w-5 h-5" />
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};