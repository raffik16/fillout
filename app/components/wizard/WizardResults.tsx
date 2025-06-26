'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { DrinkRecommendation } from '@/app/types/drinks';
import { WizardPreferences } from '@/app/types/wizard';
import { WeatherData } from '@/app/types/weather';
import { matchDrinksToPreferences, getMatchMessage } from '@/lib/drinkMatcher';
import { getUserLocation } from '@/lib/weather';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';

interface WizardResultsProps {
  preferences: WizardPreferences;
  weatherData?: WeatherData | null;
  onRetakeQuiz: () => void;
}

export default function WizardResults({
  preferences,
  weatherData,
  onRetakeQuiz
}: WizardResultsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recommendations, setRecommendations] = useState<DrinkRecommendation[]>([]);
  const [useWeather, setUseWeather] = useState(preferences.useWeather);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const [localWeatherData, setLocalWeatherData] = useState<WeatherData | null>(weatherData || null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const updateRecommendations = useCallback(() => {
    const updatedPrefs = { ...preferences, useWeather };
    const recs = matchDrinksToPreferences(updatedPrefs, localWeatherData);
    setRecommendations(recs);
    setCurrentIndex(0);
  }, [preferences, useWeather, localWeatherData]);

  useEffect(() => {
    updateRecommendations();
  }, [updateRecommendations]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentDrink = recommendations[currentIndex]?.drink;
  const currentScore = recommendations[currentIndex]?.score || 0;
  const matchMessage = getMatchMessage(currentScore);

  const goToNext = () => {
    if (currentIndex < recommendations.length - 1) {
      setDragDirection('left');
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setDragDirection(null);
      }, 100);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setDragDirection('right');
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setDragDirection(null);
      }, 100);
    }
  };

  const fetchWeatherData = async () => {
    console.log('Starting weather data fetch...');
    setIsLoadingLocation(true);
    setLocationError(null);
    
    try {
      console.log('Getting user location...');
      const coords = await getUserLocation();
      console.log('Got coordinates:', coords);
      
      const params = new URLSearchParams();
      params.append('lat', coords.lat.toString());
      params.append('lon', coords.lon.toString());
      
      console.log('Fetching weather data with params:', params.toString());
      const response = await axios.get<WeatherData>(`/api/weather?${params}`);
      console.log('Weather data received:', response.data);
      
      setLocalWeatherData(response.data);
      setUseWeather(true);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unable to get your location. Please enable location access.';
      setLocationError(errorMessage);
      setUseWeather(false);
    } finally {
      setIsLoadingLocation(false);
      console.log('Weather fetch completed');
    }
  };

  const toggleWeather = async () => {
    if (!localWeatherData) {
      // No weather data yet - fetch it and enable
      await fetchWeatherData();
      // fetchWeatherData already sets useWeather to true
    } else {
      // Weather data exists - simple toggle
      setUseWeather(!useWeather);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = window.innerWidth * 0.15; // 15% of viewport width
    const velocityThreshold = 500; // velocity threshold for quick flicks
    
    // Check if drag distance OR velocity exceeds threshold
    if ((info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) && currentIndex > 0) {
      // Swipe right - go to previous
      goToPrevious();
    } else if ((info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) && currentIndex < recommendations.length - 1) {
      // Swipe left - go to next
      goToNext();
    }
    // If neither threshold is met, the card will snap back to center
  };

  if (!currentDrink) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex justify-center items-center p-4">
          <h2 className="text-2xl font-bold text-gray-800">Your Perfect Matches</h2>
        </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDrink.id}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={{ 
              x: dragDirection === 'left' ? 300 : dragDirection === 'right' ? -300 : 0,
              opacity: 0,
              scale: 0.8 
            }}
            animate={{ 
              x: 0,
              opacity: 1,
              scale: 1 
            }}
            exit={{ 
              x: dragDirection === 'left' ? -300 : dragDirection === 'right' ? 300 : 0,
              opacity: 0,
              scale: 0.8 
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
            className="w-full max-w-md cursor-grab active:cursor-grabbing"
            whileDrag={{ 
              scale: 1.05,
              rotate: 5,
              transition: { duration: 0.1 }
            }}
          >
            <div className="bg-white rounded-3xl overflow-hidden">
              {/* Match Score */}
              <div className="bg-gradient-to-r from-orange-400 to-rose-400 text-white p-4 text-center">
                <div className="text-lg font-bold">{matchMessage}</div>
                <div className="text-sm opacity-90">Match Score: {currentScore}%</div>
              </div>

              {/* Drink Image */}
              <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                {currentDrink.image_url ? (
                  <Image
                    src={currentDrink.image_url}
                    alt={currentDrink.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-6xl">
                    🍹
                  </div>
                )}
              </div>

              {/* Drink Info */}
              <div className="p-3">
                <h3 className="text-2xl font-bold mb-2 text-black">{currentDrink.name}</h3>
                <p className="text-gray-600 mb-4">{currentDrink.description}</p>
                
                {/* Match Reasons */}
                {recommendations[currentIndex]?.reasons && recommendations[currentIndex].reasons.length > 0 && (
                  <div className="bg-orange-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-orange-800">
                      {recommendations[currentIndex].reasons.join(' • ')}
                    </p>
                  </div>
                )}

                {/* Quick Info */}
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>{currentDrink.category}</span>
                  <span>{currentDrink.strength}</span>
                  <span>{currentDrink.abv}% ABV</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`p-3 rounded-full ${
              currentIndex === 0
                ? 'bg-gray-200 text-gray-400'
                : 'bg-white hover:bg-gray-100 text-gray-800'
            } transition-colors`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Progress Dots */}
          <div className="flex gap-2">
            {recommendations.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-orange-400 w-8'
                    : 'bg-gray-300 w-2'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            disabled={currentIndex === recommendations.length - 1}
            className={`p-3 rounded-full ${
              currentIndex === recommendations.length - 1
                ? 'bg-gray-200 text-gray-400'
                : 'bg-white hover:bg-gray-100 text-gray-800'
            } transition-colors`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-3">
          <button
            onClick={toggleWeather}
            disabled={isLoadingLocation}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors ${
              useWeather && localWeatherData
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-white text-gray-800 border border-gray-300 hover:bg-blue-50'
            } ${isLoadingLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoadingLocation ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Finding Location...
              </>
            ) : localWeatherData ? (
              <>
                <div className="flex flex-col text-xs leading-tight">
                  <span>{localWeatherData.location.name}</span>
                  <span className="opacity-80">
                    {Math.round(localWeatherData.current.temp * 9/5 + 32)}°F • {useWeather ? 'ON' : 'OFF'}
                  </span>
                </div>
              </>
            ) : (
              <>
                Weather Based Results
              </>
            )}
          </button>
          
          <button
            onClick={onRetakeQuiz}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-800 py-3 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Retake
          </button>
        </div>

        {/* Location Error */}
        {locationError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-700 text-sm text-center">{locationError}</p>
          </motion.div>
        )}
      </div>
      </div>
    </div>
  );
}