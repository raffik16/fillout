'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Header } from '@/app/components/layout/Header';
import { Footer } from '@/app/components/layout/Footer';
import { LocationSearch } from '@/app/components/weather/LocationSearch';
import { WeatherDisplay } from '@/app/components/weather/WeatherDisplay';
import { DrinkGrid } from '@/app/components/drinks/DrinkGrid';
import { DrinkFilters } from '@/app/components/drinks/DrinkFilters';
import { DrinkModal } from '@/app/components/drinks/DrinkModal';
import { RecipeModal } from '@/app/components/drinks/RecipeModal';
import { AgeGate } from '@/app/components/ui/AgeGate';
import DrinkWizard from '@/app/components/wizard/DrinkWizard';
import WizardResults from '@/app/components/wizard/WizardResults';
import ResetWizard from '@/app/components/ui/ResetWizard';
import { WeatherData } from '@/app/types/weather';
import { Drink, DrinkFilters as DrinkFiltersType, DrinkRecommendation } from '@/app/types/drinks';
import { recommendDrinks } from '@/lib/drinks';
import { WizardPreferences } from '@/app/types/wizard';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [recommendations, setRecommendations] = useState<DrinkRecommendation[]>([]);
  const [filters, setFilters] = useState<DrinkFiltersType>({});
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isLoadingDrinks, setIsLoadingDrinks] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecipeDrink, setSelectedRecipeDrink] = useState<Drink | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isMetricUnit, setIsMetricUnit] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState<boolean | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showWizardResults, setShowWizardResults] = useState(false);
  const [wizardPreferences, setWizardPreferences] = useState<WizardPreferences | null>(null);
  const [wizardMatchedDrinks, setWizardMatchedDrinks] = useState<Drink[]>([]);
  const [showLocationInHeader, setShowLocationInHeader] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const drinksGridRef = useRef<HTMLDivElement>(null);

  // Check for dark mode preference and age verification
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const isDark = savedTheme ? savedTheme === 'dark' : systemDarkMode;
    
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Check age verification status
    const ageVerified = localStorage.getItem('ageVerified');
    if (ageVerified === 'true') {
      setIsAgeVerified(true);
      // Check if wizard has been completed
      const wizardCompleted = localStorage.getItem('wizardCompleted');
      if (!wizardCompleted) {
        setShowWizard(true);
      }
    } else {
      setIsAgeVerified(false);
    }
  }, []);

  // Show location immediately when set
  useEffect(() => {
    setShowLocationInHeader(!!currentLocation);
  }, [currentLocation]);


  // Toggle dark mode
  const handleToggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Fetch weather data
  const handleLocationSearch = async (query: { city?: string; lat?: number; lon?: number }) => {
    setIsLoadingWeather(true);
    setWeatherError(null);
    
    try {
      const params = new URLSearchParams();
      if (query.city) {
        params.append('city', query.city);
      } else if (query.lat && query.lon) {
        params.append('lat', query.lat.toString());
        params.append('lon', query.lon.toString());
      }
      
      const response = await axios.get<WeatherData>(`/api/weather?${params}`);
      setWeatherData(response.data);
      
      // Set current location for header display
      if (query.city) {
        setCurrentLocation(query.city);
      } else if (response.data.location?.name) {
        setCurrentLocation(response.data.location.name);
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      setWeatherError('Failed to fetch weather data. Please try again.');
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Fetch drinks when filters change or weather data is available
  useEffect(() => {
    // Only fetch drinks if we have weather data
    if (!weatherData) return;
    
    const fetchDrinks = async () => {
      setIsLoadingDrinks(true);
      
      try {
        const params = new URLSearchParams();
        
        if (filters.categories?.length) {
          params.append('categories', filters.categories.join(','));
        }
        if (filters.flavors?.length) {
          params.append('flavors', filters.flavors.join(','));
        }
        if (filters.strength?.length) {
          params.append('strength', filters.strength.join(','));
        }
        if (filters.occasions?.length) {
          params.append('occasions', filters.occasions.join(','));
        }
        if (filters.search) {
          params.append('search', filters.search);
        }
        
        const response = await axios.get(`/api/drinks?${params}`);
        setDrinks(response.data.drinks);
      } catch (error) {
        console.error('Failed to fetch drinks:', error);
      } finally {
        setIsLoadingDrinks(false);
      }
    };
    
    fetchDrinks();
  }, [filters, weatherData]);

  // Update recommendations when weather or drinks change
  useEffect(() => {
    if (weatherData && drinks.length > 0) {
      const recs = recommendDrinks(weatherData, filters, isMetricUnit);
      setRecommendations(recs);
    }
  }, [weatherData, drinks, filters, isMetricUnit]);

  // Handle filter changes with scroll to top
  const handleFiltersChange = (newFilters: DrinkFiltersType) => {
    setFilters(newFilters);
    
    // Scroll to top of drinks grid when filters change
    if (drinksGridRef.current) {
      drinksGridRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Handle drink click
  const handleDrinkClick = (drink: Drink) => {
    setSelectedDrink(drink);
    setIsModalOpen(true);
  };

  // Handle recipe click
  const handleRecipeClick = (drink: Drink) => {
    setSelectedRecipeDrink(drink);
    setIsRecipeModalOpen(true);
  };

  // Handle age verification
  const handleAgeVerification = (isOfAge: boolean) => {
    setIsAgeVerified(isOfAge);
    localStorage.setItem('ageVerified', isOfAge.toString());
    if (isOfAge) {
      setShowWizard(true);
    }
  };

  // Handle wizard completion
  const handleWizardComplete = (preferences: WizardPreferences, matchedDrinks: Drink[]) => {
    setWizardPreferences(preferences);
    setWizardMatchedDrinks(matchedDrinks);
    setShowWizard(false);
    setShowWizardResults(true);
    localStorage.setItem('wizardPreferences', JSON.stringify(preferences));
  };

  // Handle wizard skip
  const handleWizardSkip = () => {
    setShowWizard(false);
    localStorage.setItem('wizardCompleted', 'skipped');
  };

  // Handle wizard results close
  const handleWizardResultsClose = () => {
    setShowWizardResults(false);
    localStorage.setItem('wizardCompleted', 'true');
  };

  // Handle retake quiz
  const handleRetakeQuiz = () => {
    setShowWizardResults(false);
    setShowWizard(true);
  };

  // Handle show wizard from CTA
  const handleShowWizard = () => {
    setShowWizard(true);
  };

  // Show age gate if not verified
  if (isAgeVerified === false) {
    return <AgeGate onVerified={handleAgeVerification} />;
  }

  // Show loading while checking age verification
  if (isAgeVerified === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  // Show wizard if needed
  if (showWizard) {
    return (
      <DrinkWizard 
        onComplete={handleWizardComplete}
        onSkip={handleWizardSkip}
        weatherData={weatherData}
      />
    );
  }

  // Show wizard results
  if (showWizardResults && wizardPreferences) {
    return (
      <WizardResults
        preferences={wizardPreferences}
        initialMatches={wizardMatchedDrinks}
        weatherData={weatherData}
        onRetakeQuiz={handleRetakeQuiz}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={handleToggleDarkMode}
        location={currentLocation}
        temperature={weatherData?.current.temp}
        isMetricUnit={isMetricUnit}
        showLocation={showLocationInHeader}
      />
      
      <main className="container mx-auto px-4 py-8 main-container">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-blue-600 bg-clip-text text-transparent">
            Find Your Perfect Drink
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Weather-matched drinks with recipes & shopping
          </p>
        </motion.div>

        {/* Location Search */}
        <div className="mb-12">
          <LocationSearch 
            onSearch={handleLocationSearch} 
            isLoading={isLoadingWeather}
            onShowWizard={handleShowWizard}
          />
          {weatherError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 text-center mt-4"
            >
              {weatherError}
            </motion.p>
          )}
        </div>

        {/* Weather Display */}
        {weatherData && (
          <div className="mb-12">
            <WeatherDisplay 
              weather={weatherData} 
              className="max-w-2xl mx-auto"
              onTemperatureUnitChange={setIsMetricUnit}
            />
          </div>
        )}

        {/* Drinks Section - Only show after weather data is available */}
        {weatherData && (
          <div ref={drinksGridRef} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters */}
            <div className="lg:col-span-1">
              <DrinkFilters 
                filters={filters} 
                onFiltersChange={handleFiltersChange}
                className="sticky top-24"
              />
            </div>

            {/* Drink Grid */}
            <div className="lg:col-span-3">
              {isLoadingDrinks ? (
                <>
                  <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    Loading drinks...
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"
                      />
                    ))}
                  </div>
                </>
              ) : drinks.length > 0 ? (
                <>
                  <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    {recommendations.length > 0 ? 'Recommended for You' : 'All Drinks'}
                  </h3>
                  <DrinkGrid
                    drinks={recommendations.length > 0 ? recommendations.map(r => r.drink) : drinks}
                    recommendations={recommendations.length > 0 ? recommendations : undefined}
                    onDrinkClick={handleDrinkClick}
                    onRecipeClick={handleRecipeClick}
                  />
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    No drinks found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your filters or search terms.
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
      
      {/* Drink Detail Modal */}
      <DrinkModal
        drink={selectedDrink}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      
      {/* Recipe Modal */}
      <RecipeModal
        drink={selectedRecipeDrink}
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
      />
      
      {/* Reset Wizard Button (for testing) */}
      <ResetWizard />
    </div>
  );
}
