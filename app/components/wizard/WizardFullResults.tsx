'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DrinkRecommendation } from '@/app/types/drinks';
import { WizardPreferences } from '@/app/types/wizard';
import { WeatherData } from '@/app/types/weather';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import LikeButton from '@/app/components/ui/LikeButton';
import DrinkStatsDisplay from '@/app/components/ui/DrinkStatsDisplay';
import EmailCaptureForm from '@/app/components/ui/EmailCaptureForm';
import { getAdditionalDrinks } from '@/lib/drinkMatcher';
import ColorSplashAnimation from '@/app/components/animations/ColorSplashAnimation';

interface WizardFullResultsProps {
  recommendations: DrinkRecommendation[];
  preferences: WizardPreferences;
  weatherData?: WeatherData | null;
  onBack: () => void;
}

export default function WizardFullResults({
  recommendations,
  preferences,
  weatherData,
  onBack
}: WizardFullResultsProps) {
  const [allRecommendations, setAllRecommendations] = useState<DrinkRecommendation[]>(recommendations);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasLoadedMore, setHasLoadedMore] = useState(false);
  const [hasMoreDrinks, setHasMoreDrinks] = useState(false);
  const [isCheckingMore, setIsCheckingMore] = useState(true);
  const [showNoMoreDrinksMessage, setShowNoMoreDrinksMessage] = useState(false);

  // Check if there are more drinks available when component mounts
  useEffect(() => {
    // Always show the button to expand search
    setHasMoreDrinks(true);
    setIsCheckingMore(false);
  }, [recommendations, preferences]);

  const loadDrinksWithoutAllergies = async () => {
    setIsLoadingMore(true);
    setShowNoMoreDrinksMessage(false);
    
    try {
      const currentIds = allRecommendations.map(rec => rec.drink.id);
      // Keep allergy restrictions but open up category to show more variety
      const updatedPrefs = {
        ...preferences,
        allergies: preferences.allergies, // Keep allergies to ensure safety
        category: 'any' as const
      };
      const additionalDrinks = await getAdditionalDrinks(updatedPrefs, currentIds, 10);
      
      if (additionalDrinks.length > 0) {
        setAllRecommendations([...allRecommendations, ...additionalDrinks]);
        setHasMoreDrinks(false); // Hide the button after loading
      }
    } catch (error) {
      console.error('Failed to load drinks without allergies:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadMoreDrinks = async () => {
    if (hasLoadedMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    try {
      const currentIds = allRecommendations.map(rec => rec.drink.id);
      // Keep allergy restrictions but open up category to show more variety
      const updatedPrefs = {
        ...preferences,
        allergies: preferences.allergies, // Keep allergies to ensure safety
        category: 'any' as const
      };
      const additionalDrinks = await getAdditionalDrinks(updatedPrefs, currentIds, 20);
      
      if (additionalDrinks.length === 0) {
        // No drinks found at all
        setShowNoMoreDrinksMessage(true);
      } else {
        setAllRecommendations([...allRecommendations, ...additionalDrinks]);
      }
      
      setHasLoadedMore(true);
    } catch (error) {
      console.error('Failed to load more drinks:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -300 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed inset-0 bg-gradient-to-br from-orange-50 to-rose-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 flex items-center gap-4 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-lg font-bold">All Your Perfect Matches</div>
          <div className="text-xs opacity-90">
            Found {allRecommendations.length} drinks just for you!
          </div>
        </div>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {allRecommendations.sort((a, b) => b.score - a.score).map((rec) => (
            <motion.div
              key={rec.drink.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm"
            >
              {/* Drink Image */}
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 relative overflow-hidden">
                {rec.drink.image_url ? (
                  <Image
                    src={rec.drink.image_url}
                    alt={rec.drink.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-2xl">
                    🍹
                  </div>
                )}
              </div>
              
              {/* Drink Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-800 truncate">
                    {rec.drink.name}
                  </h4>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex-shrink-0">
                    {rec.score}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {rec.drink.description}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="capitalize">{rec.drink.category}</span>
                    <span className="capitalize">{rec.drink.strength}</span>
                    <span>{rec.drink.abv}% ABV</span>
                  </div>
                  <DrinkStatsDisplay drinkId={rec.drink.id} />
                </div>
                
                {/* Match Reasons */}
                {rec.reasons && rec.reasons.length > 0 && (
                  <div className="mt-2 text-xs text-orange-700 bg-orange-50 rounded px-2 py-1">
                    {rec.reasons.join(' • ')}
                  </div>
                )}
              </div>
              
              {/* Like Button */}
              <div className="flex-shrink-0">
                <LikeButton 
                  drinkId={rec.drink.id} 
                  size="sm"
                />
              </div>
            </motion.div>
          ))}
          
          {/* Divider and Load More Section */}
          {!hasLoadedMore && !isCheckingMore && recommendations.length > 0 && (
            <>
              {hasMoreDrinks ? (
                <div className="mt-8 mb-4">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative bg-gradient-to-br from-orange-50 to-rose-50 px-4">
                      <button
                        onClick={loadMoreDrinks}
                        disabled={isLoadingMore}
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                      >
                        {isLoadingMore ? (
                          <>
                            <ColorSplashAnimation size="sm" repeat={true} />
                            <span>Loading...</span>
                          </>
                        ) : (
                          <>
                            <span>🍹</span>
                            <span>Show More Drinks</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    Explore drinks from all categories (keeping your allergy restrictions)
                  </p>
                </div>
              ) : null}
            </>
          )}
          
          {/* No More Drinks Due to Allergies Message */}
          {showNoMoreDrinksMessage && (
            <div className="mt-8 mb-4 mx-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <div className="text-center">
                  <div className="text-5xl mb-3">🤔</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Your Allergies Have Us Beat!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We&apos;ve searched every nook and cranny, but couldn&apos;t find more drinks 
                    that match both your preferences AND allergy requirements.
                  </p>
                  
                  <div className="bg-white rounded-lg p-4 mb-4 border border-purple-100">
                    <p className="text-sm text-purple-800 font-semibold mb-1">
                      🎪 Want to See What You&apos;re Missing?
                    </p>
                    <p className="text-xs text-purple-600">
                      We can show you drinks without allergy filters 
                      (we&apos;ll clearly mark which ones to avoid!)
                    </p>
                  </div>
                  
                  <button
                    onClick={loadDrinksWithoutAllergies}
                    disabled={isLoadingMore}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isLoadingMore ? (
                      <>
                        <ColorSplashAnimation size="sm" repeat={true} />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <span>🎯</span>
                        <span>Show Me Everything!</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with preferences and email capture */}
        <div className="p-4 bg-white mx-4 rounded-xl mb-4 shadow-sm">
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2 text-center">
              Your Perfect {preferences.category && preferences.category !== 'any' && preferences.category !== 'featured'
                ? preferences.category === 'non-alcoholic' 
                  ? 'Non-Alcoholic' 
                  : preferences.category.charAt(0).toUpperCase() + preferences.category.slice(1)
                : ''} Profile
            </h4>
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
              {preferences.useWeather && weatherData && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  weather-matched
                </span>
              )}
              {preferences.allergies && preferences.allergies.length > 0 && !preferences.allergies.includes('none') && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                  🚫 {preferences.allergies.join(', ')} free
                </span>
              )}
            </div>
          </div>
          
          <EmailCaptureForm 
            matchedDrinks={allRecommendations.slice(0, recommendations.length)}
            preferences={preferences}
          />
        </div>
      </div>
    </motion.div>
  );
}