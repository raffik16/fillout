'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiGithub, FiInfo } from 'react-icons/fi';

export const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              About WeatherBar
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your personal bartender that recommends the perfect drink based on the weather. 
              From refreshing cocktails on hot days to warming spirits on cold nights.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Drink Responsibly
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please enjoy alcoholic beverages responsibly. Never drink and drive. 
              Must be of legal drinking age in your country.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Weather Data
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time weather data provided by OpenWeatherMap API. 
              Location services require your permission.
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              Made with <FiHeart className="w-4 h-4 text-red-500" /> by WeatherBar Team
            </p>
            
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <FiGithub className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <FiInfo className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};