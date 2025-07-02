'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { PWAInstallPrompt } from '@/app/components/ui/PWAInstallPrompt';
import { WeatherData } from '@/app/types/weather';
import { Drink, DrinkFilters as DrinkFiltersType, DrinkRecommendation } from '@/app/types/drinks';
import { recommendDrinks } from '@/lib/drinks';
import { WizardPreferences } from '@/app/types/wizard';
import { mapWizardPreferencesToFilters } from '@/lib/wizardMapping';
import weatherService from '@/lib/weatherService';

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
  const [showAgeGateAfterWizard, setShowAgeGateAfterWizard] = useState(false);
  const [wizardPreferences, setWizardPreferences] = useState<WizardPreferences | null>(null);
  const [showLocationInHeader, setShowLocationInHeader] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [selectedBar, setSelectedBar] = useState<string | null>(null);
  const [barData, setBarData] = useState<any>(null);
  const drinksGridRef = useRef<HTMLDivElement>(null);

  // Fetch weather data using centralized service
  const handleLocationSearch = useCallback(async (query: { city?: string; lat?: number; lon?: number }) => {
    setIsLoadingWeather(true);
    setWeatherError(null);
    
    try {
      const weatherData = await weatherService.getWeatherData(query);
      setWeatherData(weatherData);
      setCurrentLocation(weatherData.location.name);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      setWeatherError('Failed to fetch weather data. Please try again.');
    } finally {
      setIsLoadingWeather(false);
    }
  }, []);

  // Function to automatically try to get user's location
  const tryAutoLocation = useCallback(async () => {
    try {
      // Use weather service which handles cache and location logic
      const weatherData = await weatherService.getWeatherData();
      setWeatherData(weatherData);
      setCurrentLocation(weatherData.location.name);
    } catch {
      console.log('Auto-location failed - user can search manually if needed');
      // Don't show error on auto-attempt, let user manually search if needed
    }
  }, []);

  // Check for bar context from localStorage
  useEffect(() => {
    const barSlug = localStorage.getItem('selectedBar');
    if (barSlug) {
      setSelectedBar(barSlug);
      // Fetch bar data
      fetch(`/api/bars/by-slug/${barSlug}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
        .then(res => res.json())
        .then(data => {
          setBarData(data);
          // Keep the localStorage for future page refreshes
          // localStorage.removeItem('selectedBar'); // Commented out to persist across refreshes
        })
        .catch(err => console.error('Failed to fetch bar data:', err));
    }
  }, []);

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

    // Check if wizard has been completed
    const wizardCompleted = localStorage.getItem('wizardCompleted');
    const ageVerified = localStorage.getItem('ageVerified');
    
    if (!wizardCompleted) {
      // First time user - show wizard first
      setShowWizard(true);
      setIsAgeVerified(null); // Will be checked after wizard
    } else if (ageVerified === 'true') {
      // Returning user who completed wizard and age verification
      setIsAgeVerified(true);
    } else {
      // Wizard completed but age not verified
      setShowAgeGateAfterWizard(true);
      setIsAgeVerified(false);
    }

    // Try to restore weather data from cache or auto-fetch
    const initializeWeather = async () => {
      try {
        // First try to get cached weather data
        const cachedWeather = weatherService.getCachedWeatherData();
        if (cachedWeather) {
          console.log('🏠 PAGE LOAD: Location already shared, using cached data');
          setWeatherData(cachedWeather);
          setCurrentLocation(cachedWeather.location.name);
          return;
        }

        // Check if we have location permission or cached location
        const hasPermission = weatherService.hasLocationPermission();
        const hasCachedLocation = weatherService.hasCachedLocation();
        
        if (hasPermission) {
          console.log('🏠 PAGE LOAD: Location permission previously granted, auto-fetching');
          await tryAutoLocation();
        } else if (hasCachedLocation) {
          console.log('🏠 PAGE LOAD: Location cached but stale, will use for fresh weather');
          await tryAutoLocation();
        } else {
          console.log('🏠 PAGE LOAD: No location shared yet, user needs to search or grant permission');
        }
      } catch (error) {
        console.error('❌ PAGE LOAD: Failed to initialize weather:', error);
        // Graceful fallback - just continue without weather data
      }
    };

    initializeWeather();
  }, [tryAutoLocation]);

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
        
        // Add timestamp to prevent caching
        const timestamp = Date.now();
        if (params.toString()) {
          params.append('_t', timestamp.toString());
        } else {
          params.set('_t', timestamp.toString());
        }
        
        // Use bar-specific drinks if a bar is selected
        const apiUrl = barData 
          ? `/api/bars/${barData.id}/drinks?${params}`
          : `/api/drinks?${params}`;
        
        const response = await axios.get(apiUrl, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        // Handle different response formats
        const drinksData = barData 
          ? response.data  // Bar API returns drinks directly
          : response.data.drinks;  // Main API returns { drinks: [...] }
        
        setDrinks(drinksData);
      } catch (error) {
        console.error('Failed to fetch drinks:', error);
      } finally {
        setIsLoadingDrinks(false);
      }
    };
    
    fetchDrinks();
  }, [filters, weatherData, barData]);

  // Force refresh drinks data
  const handleRefreshDrinks = () => {
    if (weatherData) {
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
          
          // Add timestamp to prevent caching
          const timestamp = Date.now();
          if (params.toString()) {
            params.append('_t', timestamp.toString());
          } else {
            params.set('_t', timestamp.toString());
          }
          
          // Use bar-specific drinks if a bar is selected
          const apiUrl = barData 
            ? `/api/bars/${barData.id}/drinks?${params}`
            : `/api/drinks?${params}`;
          
          const response = await axios.get(apiUrl, {
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          // Handle different response formats
          const drinksData = barData 
            ? response.data  // Bar API returns drinks directly
            : response.data.drinks;  // Main API returns { drinks: [...] }
          
          setDrinks(drinksData);
        } catch (error) {
          console.error('Failed to fetch drinks:', error);
        } finally {
          setIsLoadingDrinks(false);
        }
      };
      
      fetchDrinks();
    }
  };

  // Update recommendations when weather or drinks change
  useEffect(() => {
    if (weatherData && drinks.length > 0) {
      const recs = recommendDrinks(drinks, weatherData, filters, isMetricUnit);
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
    setShowAgeGateAfterWizard(false);
    
    if (isOfAge) {
      // If we have wizard preferences, show results; otherwise show main app
      if (wizardPreferences) {
        setShowWizardResults(true);
        localStorage.setItem('wizardCompleted', 'completed');
      }
      // If no wizard preferences, user will see main app (isAgeVerified = true)
    }
  };

  // Handle wizard completion
  const handleWizardComplete = (preferences: WizardPreferences) => {
    setWizardPreferences(preferences);
    setShowWizard(false);
    localStorage.setItem('wizardPreferences', JSON.stringify(preferences));
    
    // Check if age verification is needed
    const ageVerified = localStorage.getItem('ageVerified');
    if (ageVerified !== 'true') {
      setShowAgeGateAfterWizard(true);
      setIsAgeVerified(false);
    } else {
      setShowWizardResults(true);
    }
  };

  // Handle wizard skip
  const handleWizardSkip = () => {
    setShowWizard(false);
    localStorage.setItem('wizardCompleted', 'skipped');
    
    // Check if age verification is needed
    const ageVerified = localStorage.getItem('ageVerified');
    if (ageVerified !== 'true') {
      setShowAgeGateAfterWizard(true);
      setIsAgeVerified(false);
    } else {
      // Skip to main app if already age verified
      setIsAgeVerified(true);
    }
  };


  // Handle retake quiz
  const handleRetakeQuiz = () => {
    setShowWizardResults(false);
    setShowWizard(true);
  };

  // Handle view all from wizard results
  const handleViewAllFromWizard = (preferences: WizardPreferences, wizardWeatherData?: WeatherData | null) => {
    // Convert wizard preferences to drink filters
    const mappedFilters = mapWizardPreferencesToFilters(preferences);
    
    // Apply the filters to the main app
    setFilters(mappedFilters);
    
    // Use wizard weather data if available, otherwise keep current weather data
    if (wizardWeatherData) {
      setWeatherData(wizardWeatherData);
      setCurrentLocation(wizardWeatherData.location?.name || '');
    }
    
    // Close wizard results and show main app
    setShowWizardResults(false);
    localStorage.setItem('wizardCompleted', 'completed');
    
    // Scroll to drinks grid after a short delay to allow state updates
    setTimeout(() => {
      if (drinksGridRef.current) {
        drinksGridRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  // Handle show wizard from CTA
  const handleShowWizard = () => {
    setShowWizard(true);
  };

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

  // Show age gate after wizard completion if needed
  if (showAgeGateAfterWizard || isAgeVerified === false) {
    return <AgeGate onVerified={handleAgeVerification} />;
  }

  // Show loading while checking age verification (only for returning users)
  if (isAgeVerified === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  // Show wizard results
  if (showWizardResults && wizardPreferences) {
    return (
      <WizardResults
        preferences={wizardPreferences}
        weatherData={weatherData}
        onRetakeQuiz={handleRetakeQuiz}
        onViewAll={handleViewAllFromWizard}
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
        barData={barData}
        onRefresh={handleRefreshDrinks}
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
            Curated drinks with detailed recipes & shopping links
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
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
