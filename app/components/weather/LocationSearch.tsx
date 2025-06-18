'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { FiSearch, FiMapPin } from 'react-icons/fi';
import { getUserLocation } from '@/lib/weather';

interface LocationSearchProps {
  onSearch: (query: { city?: string; lat?: number; lon?: number }) => void;
  isLoading?: boolean;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({ onSearch, isLoading }) => {
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
    
    onSearch({ city: city.trim() });
  };

  const handleGeolocation = async () => {
    setError('');
    setIsGeolocating(true);
    
    try {
      const coords = await getUserLocation();
      onSearch({ lat: coords.lat, lon: coords.lon });
      setCity('');
    } catch {
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
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={handleInputChange}
            icon={<FiSearch className="w-5 h-5" />}
            error={error}
            disabled={isLoading || isGeolocating}
            className="text-lg"
          />
        </div>
        
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={!city.trim() || isGeolocating}
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
            className="flex items-center gap-2"
          >
            <FiMapPin className="w-5 h-5" />
            <span className="hidden sm:inline">My Location</span>
          </Button>
          
          {/* Fun Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
            🎯 Let me find your perfect drink with GPS magic! ✨
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};