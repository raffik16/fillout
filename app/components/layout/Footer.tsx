'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiSettings, FiLogOut } from 'react-icons/fi';
import { useSession, signOut } from 'next-auth/react';

export const Footer: React.FC = () => {
  const { data: session, status } = useSession();
  
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              About drinkjoy.app
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your personal bartender that curates the perfect drinks with detailed recipes and shopping links. 
              Discover cocktails, beers, and wines for every occasion.
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
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              powered by <span className="text-amber-600 dark:text-amber-400 font-medium">drinkjoy.app</span>
            </p>
            
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              {status === 'authenticated' && session ? (
                <>
                  <Link 
                    href="/admin"
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    <FiSettings className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                  
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link 
                  href="/admin"
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  <FiSettings className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};