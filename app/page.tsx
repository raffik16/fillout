'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Header } from '@/app/components/layout/Header';
import { Footer } from '@/app/components/layout/Footer';
import { LocationSearch } from '@/app/components/weather/LocationSearch';
import { WeatherDisplay } from '@/app/components/weather/WeatherDisplay';
import { DrinkGrid } from '@/app/components/drinks/DrinkGrid';
import { DrinkFilters } from '@/app/components/drinks/DrinkFilters';
import { DrinkModal } from '@/app/components/drinks/DrinkModal';
import { WeatherData } from '@/app/types/weather';
import { Drink, DrinkFilters as DrinkFiltersType, DrinkRecommendation } from '@/app/types/drinks';
import { recommendDrinks } from '@/lib/drinks';

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

  // Check for dark mode preference
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
  }, []);

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
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      setWeatherError('Failed to fetch weather data. Please try again.');
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // Fetch drinks when filters change
  useEffect(() => {
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
  }, [filters]);

  // Update recommendations when weather or drinks change
  useEffect(() => {
    if (weatherData && drinks.length > 0) {
      const recs = recommendDrinks(weatherData, filters);
      setRecommendations(recs);
    }
  }, [weatherData, drinks, filters]);

  // Handle drink click
  const handleDrinkClick = (drink: Drink) => {
    setSelectedDrink(drink);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header isDarkMode={isDarkMode} onToggleDarkMode={handleToggleDarkMode} />
      
      <main className="container mx-auto px-4 py-8">
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
            Let the weather decide your next beverage
          </p>
        </motion.div>

        {/* Location Search */}
        <div className="mb-12">
          <LocationSearch 
            onSearch={handleLocationSearch} 
            isLoading={isLoadingWeather}
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
            <WeatherDisplay weather={weatherData} className="max-w-2xl mx-auto" />
          </div>
        )}

        {/* Drinks Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1">
            <DrinkFilters 
              filters={filters} 
              onFiltersChange={setFilters}
              className="sticky top-24"
            />
          </div>

          {/* Drink Grid */}
          <div className="lg:col-span-3">
            {weatherData && recommendations.length > 0 ? (
              <>
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Recommended for You
                </h3>
                <DrinkGrid
                  drinks={recommendations.map(r => r.drink)}
                  recommendations={recommendations}
                  isLoading={isLoadingDrinks}
                  onDrinkClick={handleDrinkClick}
                />
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  {drinks.length > 0 ? 'All Drinks' : 'Popular Drinks'}
                </h3>
                <DrinkGrid
                  drinks={drinks}
                  isLoading={isLoadingDrinks}
                  onDrinkClick={handleDrinkClick}
                />
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Drink Detail Modal */}
      <DrinkModal
        drink={selectedDrink}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
