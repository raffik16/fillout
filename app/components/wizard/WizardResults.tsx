'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { DrinkRecommendation } from '@/app/types/drinks';
import { WizardPreferences, AllergyType } from '@/app/types/wizard';
import { WeatherData } from '@/app/types/weather';
import { matchDrinksToPreferences, getMatchMessage, getAdditionalDrinks } from '@/lib/drinkMatcher';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import weatherService from '@/lib/weatherService';
import LikeButton from '@/app/components/ui/LikeButton';
import OrderButton from '@/app/components/ui/OrderButton';
import ColorSplashAnimation from '@/app/components/animations/ColorSplashAnimation';
import WizardFullResults from './WizardFullResults';
import AllergiesModal from './AllergiesModal';

// Witty title generator based on match count
function getWittyTitle(count: number): string {
  if (count === 0) return "No Matches Found 😢";
  if (count === 1) return "Found 1 Perfect Match - It's Meant to Be! 💕";
  if (count === 2) return "Found 2 Liquid Soulmates! 🥂";
  if (count === 3) return "Found 3 Perfect Matches - The Holy Trinity! 🙏";
  if (count === 4) return "Found 4 Fantastic Matches! 🎯";
  if (count === 5) return "Found 5 Perfect Matches - High Five! 🙌";
  if (count <= 7) return `Found ${count} Perfect Matches for You! 🎉`;
  if (count <= 10) return `Found ${count} Liquid Legends! 🏆`;
  return `Found ${count} Perfect Matches - You're Spoiled for Choice! 🤩`;
}

interface WizardResultsProps {
  preferences: WizardPreferences;
  weatherData?: WeatherData | null;
  onRetakeQuiz: () => void;
  onViewAll?: (preferences: WizardPreferences, weatherData?: WeatherData | null) => void;
}

export default function WizardResults({
  preferences,
  weatherData,
  onRetakeQuiz
}: WizardResultsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recommendations, setRecommendations] = useState<DrinkRecommendation[]>([]);
  const [useWeather, setUseWeather] = useState(preferences.useWeather);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const [localWeatherData, setLocalWeatherData] = useState<WeatherData | null>(weatherData || null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [showFullResults, setShowFullResults] = useState(false);
  const [showAllergiesModal, setShowAllergiesModal] = useState(false);
  const [currentAllergies, setCurrentAllergies] = useState<AllergyType[]>(preferences.allergies || []);
  const [additionalDrinks, setAdditionalDrinks] = useState<DrinkRecommendation[]>([]);
  const [hasLoadedAdditional, setHasLoadedAdditional] = useState(false);
  const [showNoMoreDrinksCard, setShowNoMoreDrinksCard] = useState(false);

  const updateRecommendations = useCallback(async () => {
    setIsLoadingRecommendations(true);
    const updatedPrefs = { ...preferences, useWeather, allergies: currentAllergies };
    console.log('🔄 Fetching new randomized recommendations...');
    const recs = await matchDrinksToPreferences(updatedPrefs, localWeatherData, false, true);
    console.log('✅ Received recommendations:', recs.map(r => r.drink.name));
    setRecommendations(recs);
    setCurrentIndex(0);
    
    // Reset additional drinks when preferences change
    setAdditionalDrinks([]);
    setHasLoadedAdditional(false);
    
    // If we have less than 10 recommendations, automatically load additional drinks
    if (recs.length < 10 && recs.length > 0) {
      console.log(`📊 Only ${recs.length} recommendations found. Loading additional drinks...`);
      try {
        const excludeIds = recs.map(rec => rec.drink.id);
        const additionalCount = 10 - recs.length; // Fill up to 10 total
        const additional = await getAdditionalDrinks(updatedPrefs, excludeIds, additionalCount);
        console.log(`✅ Loaded ${additional.length} additional drinks`);
        setAdditionalDrinks(additional);
        setHasLoadedAdditional(true);
        
        // If no additional drinks found, show the special card
        if (additional.length === 0) {
          setShowNoMoreDrinksCard(true);
        }
      } catch (error) {
        console.error('Failed to load additional drinks:', error);
      }
    }
    
    setIsLoadingRecommendations(false);
  }, [preferences, useWeather, localWeatherData, currentAllergies]);


  const handleAllergiesUpdate = (newAllergies: AllergyType[]) => {
    // Update the current allergies state
    setCurrentAllergies(newAllergies);
    setShowAllergiesModal(false);
    // updateRecommendations will be called automatically due to the dependency on currentAllergies
  };

  const loadDrinksWithoutAllergies = async () => {
    try {
      // Remove allergy restrictions and open up category to show more variety
      const updatedPrefs = { 
        ...preferences, 
        useWeather, 
        allergies: [], 
        category: 'any' as const 
      };
      
      const excludeIds = allDrinks.map(rec => rec.drink.id);
      const additional = await getAdditionalDrinks(updatedPrefs, excludeIds, 5); // Load 5 more
      
      if (additional.length > 0) {
        setAdditionalDrinks([...additionalDrinks, ...additional]);
        setShowNoMoreDrinksCard(false); // Hide the special card
      }
    } catch (error) {
      console.error('Failed to load more drinks:', error);
    }
  };

  // Load additional drinks when reaching the last recommendation
  const loadAdditionalDrinks = useCallback(async () => {
    if (hasLoadedAdditional) return;
    
    try {
      const excludeIds = recommendations.map(rec => rec.drink.id);
      const additional = await getAdditionalDrinks(preferences, excludeIds, 10);
      setAdditionalDrinks(additional);
      setHasLoadedAdditional(true);
    } catch (error) {
      console.error('Failed to load additional drinks:', error);
    }
  }, [preferences, recommendations, hasLoadedAdditional]);

  // Combined array of all drinks (recommendations + additional)
  const allDrinks = [...recommendations, ...additionalDrinks];
  const totalCards = allDrinks.length + (showNoMoreDrinksCard ? 1 : 0);
  const isShowingNoMoreCard = showNoMoreDrinksCard && currentIndex === allDrinks.length;
  const currentDrink = !isShowingNoMoreCard ? allDrinks[currentIndex]?.drink : null;
  const currentScore = !isShowingNoMoreCard ? (allDrinks[currentIndex]?.score || 0) : 0;
  const matchMessage = getMatchMessage(currentScore);
  const isShowingAdditionalDrink = currentIndex >= recommendations.length && !isShowingNoMoreCard;
  
  // Count active allergies (excluding 'none')
  const activeAllergiesCount = currentAllergies.filter(allergy => allergy !== 'none').length;

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

  const goToNext = async () => {
    // Load additional drinks if we're at the last recommendation
    if (currentIndex === recommendations.length - 1 && !hasLoadedAdditional) {
      await loadAdditionalDrinks();
    }
    
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

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
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

  // Show loading state while recommendations are being fetched
  if (isLoadingRecommendations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50 flex items-center justify-center">
        <ColorSplashAnimation 
          repeat={true}
          size="lg"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xl font-semibold text-gray-800 z-10">
            Finding your perfect matches...
          </p>
        </div>
      </div>
    );
  }

  // Show full results view if requested
  if (showFullResults) {
    return (
      <WizardFullResults
        recommendations={recommendations}
        preferences={preferences}
        weatherData={localWeatherData}
        onBack={() => setShowFullResults(false)}
      />
    );
  }

  if (!currentDrink && !isShowingNoMoreCard) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-orange-50 to-rose-50"
    >
      <div>
        {/* Header */}
        <div className="flex justify-center items-center p-2">
          <h2 className="text-sm font-bold text-gray-800">
            {preferences.category === 'featured' ? '⭐ Featured Drinks' : getWittyTitle(recommendations.length)}
          </h2>
        </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-2 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={isShowingNoMoreCard ? 'no-more-drinks' : currentDrink?.id}
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
            {isShowingNoMoreCard ? (
              /* Special No More Drinks Card */
              <div className="bg-white rounded-3xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white p-4 text-center">
                  <div className="text-xl font-bold">Oops! We&apos;re All Out!</div>
                </div>
                
                <div className="p-6 text-center">
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    That&apos;s All, Folks! 🎬
                  </h3>
                  
                  <p className="text-gray-600 mb-6 text-lg">
                    {activeAllergiesCount > 0 
                      ? "Looks like your allergies have us stumped! We've searched high and low, but couldn't find any more drinks that match your specific needs."
                      : "You've got some seriously specific taste! We've exhausted our collection trying to match your unique preferences."
                    }
                  </p>
                  
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                    <p className="text-yellow-800 font-semibold mb-2">
                      Plot Twist!
                    </p>
                    <p className="text-yellow-700 text-sm">
                      Want to live dangerously? We can show you more drinks without 
                      {activeAllergiesCount > 0 
                        ? " your allergy filters. (Don't worry, we'll still mark which ones to avoid!)"
                        : " your strict preferences. You might discover something unexpected!"
                      }
                    </p>
                  </div>
                  
                  <button
                    onClick={loadDrinksWithoutAllergies}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                  >
                    Show More Drinks
                  </button>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    {activeAllergiesCount > 0 
                      ? "(We'll clearly mark which drinks contain your allergens)"
                      : "(Explore drinks outside your current preferences)"
                    }
                  </p>
                </div>
              </div>
            ) : (
              /* Regular Drink Card */
              <div className="bg-white rounded-3xl overflow-hidden">
                {/* Match Score */}
                <div className={cn(
                  "text-white p-2 text-center",
                  isShowingAdditionalDrink 
                    ? "bg-gradient-to-r from-purple-400 to-indigo-400" 
                    : "bg-gradient-to-r from-orange-400 to-rose-400"
                )}>
                  <div className="text-lg font-bold">
                    {matchMessage}
                  </div>
                  <div className="text-sm font-bold">
                    Match Score: {currentScore}%
                  </div>
                </div>

                {/* Drink Image */}
                <div className="relative h-72 bg-gradient-to-br from-gray-100 to-gray-200">
                  {currentDrink?.image_url ? (
                    <>
                      {imageLoading && (
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse">
                          <div className="absolute inset-0 animate-shimmer" />
                        </div>
                      )}
                      <Image
                        src={currentDrink.image_url}
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
                  
                  {/* Happy Hour Badge */}
                  {currentDrink?.happy_hour && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                      🎉 Happy Hour Special
                    </div>
                  )}
                  
                  {/* Like Button */}
                  <div className="absolute bottom-3 right-3">
                    <LikeButton 
                      drinkId={currentDrink?.id || ''} 
                      size="md"
                      className="shadow-lg"
                    />
                  </div>

                  {/* Order Button */}
                  <OrderButton 
                    drinkId={currentDrink?.id || ''} 
                    drinkName={currentDrink?.name || ''}
                  />
                </div>

                {/* Drink Info */}
                <div className="p-2">
                  <h3 className="text-1xl font-bold mb-2 bg-gradient-to-r from-orange-500 via-rose-500 to-purple-500 bg-clip-text text-transparent animate-gradient-x">{currentDrink?.name}</h3>
                  <p className="text-gray-600 mb-2 text-sm min-h-[3.5rem]">{currentDrink?.description}</p>
                  
                  {/* Match Reasons */}
                  {allDrinks[currentIndex]?.reasons && allDrinks[currentIndex].reasons.length > 0 && (
                    <div className={cn(
                      "rounded-lg p-2 mb-2 min-h-[3rem]",
                      isShowingAdditionalDrink 
                        ? "bg-purple-50" 
                        : "bg-orange-50"
                    )}>
                      <p className={cn(
                        "text-sm",
                        isShowingAdditionalDrink 
                          ? "text-purple-800" 
                          : "text-orange-800"
                      )}>
                        {allDrinks[currentIndex].reasons.join(' • ')}
                      </p>
                    </div>
                  )}

                  {/* Quick Info */}
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
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
      <div className="p-2">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`p-2 rounded-full ${
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
                    ? 'bg-orange-400 w-8'
                    : 'bg-gray-300 w-2'
                }`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            disabled={currentIndex === totalCards - 1}
            className={`p-2 rounded-full ${
              currentIndex === totalCards - 1
                ? 'bg-gray-200 text-gray-400'
                : 'bg-white hover:bg-gray-100 text-gray-800'
            } transition-colors`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-3 mb-2">
          <button
            onClick={() => setShowFullResults(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-500 text-white py-2 rounded-xl font-semibold hover:bg-purple-600 transition-colors"
          >
            View All Matches
          </button>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={toggleWeather}
            disabled={isLoadingLocation}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold transition-colors ${
              useWeather && localWeatherData
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-white text-gray-800 border border-gray-300 hover:bg-blue-50'
            } ${isLoadingLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoadingLocation ? (
              <div className="flex items-center gap-2">
                <ColorSplashAnimation size="sm" repeat={true} />
                <span>Finding Location...</span>
              </div>
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
               Weather Based
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowAllergiesModal(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-800 py-2 rounded-xl font-semibold border border-gray-300 hover:bg-orange-50 transition-colors"
          >
            Allergies
            {activeAllergiesCount > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                {activeAllergiesCount}
              </span>
            )}
          </button>
          
          <button
            onClick={onRetakeQuiz}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-800 py-2 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
          >
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
      
      {/* Allergies Modal */}
      <AllergiesModal
        isOpen={showAllergiesModal}
        onClose={() => setShowAllergiesModal(false)}
        currentAllergies={currentAllergies}
        onUpdate={handleAllergiesUpdate}
      />
    </motion.div>
  );
}