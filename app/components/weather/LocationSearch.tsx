'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { FiSearch } from 'react-icons/fi';
import { getUserLocation } from '@/lib/weather';

interface LocationSearchProps {
  onSearch: (query: { city?: string; lat?: number; lon?: number }) => void;
  isLoading?: boolean;
  onShowWizard?: () => void;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({ onSearch, isLoading, onShowWizard }) => {
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [isGeolocating, setIsGeolocating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }
    
    console.log('🌍 LOCATION FRESH: User searched for city', { 
      city: city.trim(),
      source: 'user_action_search' 
    });
    
    onSearch({ city: city.trim() });
  };

  const handleGeolocation = async () => {
    console.log('📍 LOCATION REQUEST: User clicked "My Location" button');
    setError('');
    setIsGeolocating(true);
    
    try {
      const coords = await getUserLocation();
      console.log('✅ LOCATION GRANTED: Geolocation successful from user action', {
        coordinates: `${coords.lat}, ${coords.lon}`,
        source: 'user_action_geolocation'
      });
      onSearch({ lat: coords.lat, lon: coords.lon });
      setCity('');
    } catch (error) {
      console.log('❌ LOCATION DENIED: Geolocation failed from user action', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      setError('Unable to get your location. Please enter a city name.');
    } finally {
      setIsGeolocating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
    setError('');
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter city name..."
              value={city}
              onChange={handleInputChange}
              icon={<FiSearch className="w-5 h-5" />}
              error={error}
              disabled={isLoading || isGeolocating}
              className="text-lg h-14"
            />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={!city.trim() || isGeolocating}
              className="h-14 px-3 min-w-[100px]"
            >
              Search
            </Button>
            
            <div className="relative group">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={handleGeolocation}
                isLoading={isGeolocating}
                disabled={isLoading}
                className="h-14 px-3 flex items-center justify-center gap-2"
              >
                <span className="sm:inline whitespace-nowrap">My Location</span>
              </Button>
              
              {/* Enhanced Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 bg-gradient-to-r from-amber-600 to-blue-600 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
                <div className="flex items-center gap-2">
                  <span>🎯</span>
                  <span className="font-medium">
                    Find your perfect drink with GPS magic!
                  </span>
                  <span>✨</span>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-amber-600"></div>
              </div>
            </div>

            {/* Wizard CTA Button */}
            {onShowWizard && (
              <div className="relative group">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={onShowWizard}
                  disabled={isLoading || isGeolocating}
                  className="h-14 px-3 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white border-none transition-all duration-300 font-semibold"
                >
                  <span className="sm:inline whitespace-nowrap">Find My Match</span>
                </Button>
                
                {/* Match Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 bg-gradient-to-r from-orange-600 to-rose-600 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
                  <div className="flex items-center gap-2">
                    <span>🎯</span>
                    <span className="font-medium">Get personalized drink recommendations</span>
                    <span>🍹</span>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-orange-600"></div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
};