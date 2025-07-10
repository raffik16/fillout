'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { DrinkRecommendation, Drink } from '@/app/types/drinks';
import { WizardPreferences } from '@/app/types/wizard';
import { WeatherData } from '@/app/types/weather';
import { matchDrinksToPreferences, getMatchMessage } from '@/lib/drinkMatcher';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import weatherService from '@/lib/weatherService';
import axios from 'axios';

interface WizardResultsProps {
  preferences: WizardPreferences;
  weatherData?: WeatherData | null;
  barData?: Record<string, unknown> | null;
  onRetakeQuiz: () => void;
  onViewAll: (preferences: WizardPreferences, weatherData?: WeatherData | null) => void;
}

export default function WizardResults({
  preferences,
  weatherData,
  barData,
  onRetakeQuiz,
  onViewAll
}: WizardResultsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recommendations, setRecommendations] = useState<DrinkRecommendation[]>([]);
  const [useWeather, setUseWeather] = useState(preferences.useWeather);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const [localWeatherData, setLocalWeatherData] = useState<WeatherData | null>(weatherData || null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [, setIsLoadingDrinks] = useState(false);

  // Fetch drinks from the API
  const fetchDrinks = useCallback(async () => {
    setIsLoadingDrinks(true);
    try {
      const timestamp = Date.now();
      // Use bar-specific drinks if a bar is selected
      const apiUrl = barData 
        ? `/api/bars/${barData.id}/drinks?_t=${timestamp}`
        : `/api/drinks?_t=${timestamp}`;
      
      const response = await axios.get(apiUrl, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      // Handle different response formats
      const drinksData = barData 
        ? response.data  // Bar API returns drinks directly
        : response.data.drinks || [];  // Main API returns { drinks: [...] }
      
      setDrinks(drinksData);
    } catch (error) {
      console.error('Failed to fetch drinks:', error);
    } finally {
      setIsLoadingDrinks(false);
    }
  }, [barData]);

  const updateRecommendations = useCallback(() => {
    if (drinks.length === 0) return;
    
    const updatedPrefs = { ...preferences, useWeather };
    const recs = matchDrinksToPreferences(drinks, updatedPrefs, localWeatherData, false, true);
    setRecommendations(recs);
    setCurrentIndex(0);
  }, [drinks, preferences, useWeather, localWeatherData]);

  const totalCards = recommendations.length + 1; // +1 for View All card
  const isViewAllCard = currentIndex === recommendations.length;
  const currentDrink = recommendations[currentIndex]?.drink;
  const currentScore = recommendations[currentIndex]?.score || 0;
  const matchMessage = getMatchMessage(currentScore);

  // Fetch drinks on component mount
  useEffect(() => {
    fetchDrinks();
  }, [fetchDrinks]);

  useEffect(() => {
    updateRecommendations();
  }, [updateRecommendations]);

  // Reset image loading state when current drink changes
  useEffect(() => {
    setImageLoading(true);
  }, [currentDrink?.id]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const goToNext = () => {
    if (currentIndex < totalCards - 1) {
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
    console.log('WizardResults: Starting weather data fetch...');
    setIsLoadingLocation(true);
    setLocationError(null);
    
    try {
      // Use centralized weather service which handles caching and location logic
      const weatherData = await weatherService.getWeatherData();
      console.log('WizardResults: Weather data received from service');
      
      setLocalWeatherData(weatherData);
      setUseWeather(true);
    } catch (error) {
      console.error('WizardResults: Failed to fetch weather:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unable to get your location. Please enable location access.';
      setLocationError(errorMessage);
      setUseWeather(false);
    } finally {
      setIsLoadingLocation(false);
      console.log('WizardResults: Weather fetch completed');
    }
  };

  const toggleWeather = async () => {
    if (!localWeatherData) {
      // First check if there's cached weather data we can use
      const cachedWeather = weatherService.getCachedWeatherData();
      if (cachedWeather) {
        console.log('WizardResults: Using cached weather data');
        setLocalWeatherData(cachedWeather);
        setUseWeather(true);
        return;
      }
      
      // No cached data - fetch it and enable
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
    } else if ((info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) && currentIndex < totalCards - 1) {
      // Swipe left - go to next
      goToNext();
    }
    // If neither threshold is met, the card will snap back to center
  };

  if (!currentDrink && !isViewAllCard) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50">
      <div>
        {/* Header */}
        <div className="flex justify-center items-center p-4">
          <h2 className="text-2xl font-bold text-gray-800">Your Perfect Matches</h2>
        </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={isViewAllCard ? 'view-all' : currentDrink?.id}
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
            {isViewAllCard ? (
              /* View All Card */
              <div className="bg-white rounded-3xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 text-center">
                  <div className="text-6xl mb-3">🐠</div>
                  <div className="text-xl font-bold">There are plenty more fish in the sea!</div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-4 text-black text-center">
                    Cast A Wider Net
                  </h3>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-700 text-center">
                      We&apos;ve shown you <strong>{recommendations.length} perfect catches</strong>, but there&apos;s a whole sea of drinks waiting to be discovered!
                    </p>
                  </div>

                  {/* Your Preferences Summary */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3 text-center">Your Perfect Profile</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {preferences.flavor && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {preferences.flavor} flavors
                        </span>
                      )}
                      {preferences.strength && (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                          {preferences.strength} strength
                        </span>
                      )}
                      {preferences.occasion && (
                        <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm">
                          {preferences.occasion} vibes
                        </span>
                      )}
                      {preferences.useWeather && localWeatherData && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          weather-matched
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => onViewAll(preferences, localWeatherData)}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Dive Into the Deep End 🌊
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Explore our full menu
                  </p>
                </div>
              </div>
            ) : (
              /* Regular Drink Card */
              <div className="bg-white rounded-3xl overflow-hidden">
                {/* Match Score */}
                <div className="bg-gradient-to-r from-orange-400 to-rose-400 text-white p-4 text-center">
                  <div className="text-lg font-bold">{matchMessage}</div>
                  <div className="text-sm opacity-90">Match Score: {currentScore}%</div>
                </div>

                {/* Drink Image */}
                <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
                  {(currentDrink?.image_url || currentDrink?.imageUrl) ? (
                    <>
                      {imageLoading && (
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse">
                          <div className="absolute inset-0 animate-shimmer" />
                        </div>
                      )}
                      <Image
                        src={currentDrink.image_url || currentDrink.imageUrl || '/placeholder-drink.svg'}
                        alt={currentDrink.name}
                        fill
                        className={cn("object-cover transition-opacity duration-300", 
                          imageLoading ? "opacity-0" : "opacity-100"
                        )}
                        onLoad={() => setImageLoading(false)}
                      />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-6xl">
                      🍹
                    </div>
                  )}
                </div>

                {/* Drink Info */}
                <div className="p-3">
                  <h3 className="text-2xl font-bold mb-2 text-black">{currentDrink?.name}</h3>
                  <p className="text-gray-600 mb-4">{currentDrink?.description}</p>
                  
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
                    <span>{currentDrink?.category}</span>
                    <span>{currentDrink?.strength}</span>
                    <span>{currentDrink?.abv}% ABV</span>
                  </div>
                </div>
              </div>
            )}
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
            {Array.from({ length: totalCards }).map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? (index === recommendations.length ? 'bg-purple-500 w-8' : 'bg-orange-400 w-8')
                    : 'bg-gray-300 w-2'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            disabled={currentIndex === totalCards - 1}
            className={`p-3 rounded-full ${
              currentIndex === totalCards - 1
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