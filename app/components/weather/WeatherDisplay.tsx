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
  onTemperatureUnitChange?: (isMetric: boolean) => void;
}

const weatherIcons: Record<string, React.ReactNode> = {
  clear: <WiDaySunny className="w-16 h-16" />,
  clouds: <WiCloudy className="w-16 h-16" />,
  rain: <WiRain className="w-16 h-16" />,
  drizzle: <WiRain className="w-16 h-16" />,
  snow: <WiSnow className="w-16 h-16" />,
  thunderstorm: <WiThunderstorm className="w-16 h-16" />,
  mist: <WiFog className="w-16 h-16" />,
  smoke: <WiDust className="w-16 h-16" />,
  haze: <WiDust className="w-16 h-16" />,
  dust: <WiDust className="w-16 h-16" />,
  fog: <WiFog className="w-16 h-16" />,
};

const weatherGradients: Record<string, string> = {
  clear: 'from-yellow-300 to-orange-400',
  clouds: 'from-gray-300 to-gray-500',
  rain: 'from-blue-300 to-blue-500',
  drizzle: 'from-blue-200 to-blue-400',
  snow: 'from-blue-50 to-blue-200',
  thunderstorm: 'from-purple-500 to-purple-700',
  mist: 'from-gray-200 to-gray-400',
  default: 'from-blue-300 to-blue-500',
};

const celsiusToFahrenheit = (celsius: number): number => {
  return Math.round((celsius * 9/5) + 32);
};

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather, className, onTemperatureUnitChange }) => {
  const [isMetric, setIsMetric] = useState(false);
  
  // Load temperature unit preference
  useEffect(() => {
    const savedUnit = localStorage.getItem('temperatureUnit');
    const metric = savedUnit === 'celsius';
    setIsMetric(metric);
    onTemperatureUnitChange?.(metric);
  }, [onTemperatureUnitChange]);

  // Toggle temperature unit
  const toggleTemperatureUnit = () => {
    const newIsMetric = !isMetric;
    setIsMetric(newIsMetric);
    localStorage.setItem('temperatureUnit', newIsMetric ? 'celsius' : 'fahrenheit');
    onTemperatureUnitChange?.(newIsMetric);
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
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-30', gradient)} />
        
        <CardContent className="relative z-10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {weather.location.name}, {weather.location.country}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTemperatureUnit}
                className="text-sm font-medium h-7 px-2"
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

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {displayTemp(weather.current.temp)}
              </p>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                  {weather.current.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Feels like {displayTemp(weather.current.feels_like)}
                </p>
              </div>
            </div>

            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <WiThermometer className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {displayTemp(weather.current.temp_min)}-{displayTemp(weather.current.temp_max)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <WiHumidity className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {weather.current.humidity}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};