'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { WeatherData } from '@/app/types/weather';
import { 
  WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm, 
  WiDust, WiFog, WiHumidity, WiThermometer 
} from 'react-icons/wi';
import { cn } from '@/lib/utils';

interface WeatherDisplayProps {
  weather: WeatherData;
  className?: string;
}

const weatherIcons: Record<string, React.ReactNode> = {
  clear: <WiDaySunny className="w-24 h-24" />,
  clouds: <WiCloudy className="w-24 h-24" />,
  rain: <WiRain className="w-24 h-24" />,
  drizzle: <WiRain className="w-24 h-24" />,
  snow: <WiSnow className="w-24 h-24" />,
  thunderstorm: <WiThunderstorm className="w-24 h-24" />,
  mist: <WiFog className="w-24 h-24" />,
  smoke: <WiDust className="w-24 h-24" />,
  haze: <WiDust className="w-24 h-24" />,
  dust: <WiDust className="w-24 h-24" />,
  fog: <WiFog className="w-24 h-24" />,
};

const weatherGradients: Record<string, string> = {
  clear: 'from-yellow-400 to-orange-500',
  clouds: 'from-gray-400 to-gray-600',
  rain: 'from-blue-400 to-blue-600',
  drizzle: 'from-blue-300 to-blue-500',
  snow: 'from-blue-100 to-blue-300',
  thunderstorm: 'from-purple-600 to-purple-900',
  mist: 'from-gray-300 to-gray-500',
  default: 'from-blue-400 to-blue-600',
};

const celsiusToFahrenheit = (celsius: number): number => {
  return Math.round((celsius * 9/5) + 32);
};

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather, className }) => {
  const [isMetric, setIsMetric] = useState(true);
  
  // Load temperature unit preference
  useEffect(() => {
    const savedUnit = localStorage.getItem('temperatureUnit');
    setIsMetric(savedUnit !== 'fahrenheit');
  }, []);

  // Toggle temperature unit
  const toggleTemperatureUnit = () => {
    const newIsMetric = !isMetric;
    setIsMetric(newIsMetric);
    localStorage.setItem('temperatureUnit', newIsMetric ? 'celsius' : 'fahrenheit');
  };

  const weatherMain = weather.current.main.toLowerCase();
  const icon = weatherIcons[weatherMain] || weatherIcons.clear;
  const gradient = weatherGradients[weatherMain] || weatherGradients.default;

  // Temperature conversion helpers
  const displayTemp = (temp: number) => {
    return isMetric ? `${temp}°C` : `${celsiusToFahrenheit(temp)}°F`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card variant="glass" hover={false} className="overflow-hidden">
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-20', gradient)} />
        
        <CardContent className="relative z-10 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {weather.location.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {weather.location.country}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTemperatureUnit}
                className="text-sm font-medium"
              >
                {isMetric ? '°C' : '°F'}
              </Button>
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
                className={cn('text-gray-700 dark:text-gray-200')}
              >
                {icon}
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-5xl font-bold text-gray-900 dark:text-white">
                {displayTemp(weather.current.temp)}
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 capitalize">
                {weather.current.description}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Feels like {displayTemp(weather.current.feels_like)}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <WiThermometer className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {displayTemp(weather.current.temp_min)} - {displayTemp(weather.current.temp_max)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <WiHumidity className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {weather.current.humidity}% Humidity
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};