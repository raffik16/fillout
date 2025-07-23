'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, ExternalLink } from 'lucide-react';
import { SignupModal } from './SignupModal';

export function Hero() {
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const handlePreviewClick = () => {
    setIsLoading(true);
    setIsAppLoaded(true);
    // Give iframe time to load
    setTimeout(() => setIsLoading(false), 1500);
  };

  const handleClosePreview = () => {
    setIsAppLoaded(false);
    setIsLoading(false);
  };

  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              DrinkJoy
              <span className="block text-red-600">AI-Powered Drink</span>
              <span className="block text-orange-600">Recommendations</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Discover your perfect drink with smart recommendations! Get personalized cocktail, beer, wine, and spirit suggestions based on your taste preferences, allergies, and occasion.
            </p>
            <p className="text-lg text-gray-500 mb-8 font-medium">
              Powered by AI for the perfect match
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                href="/app"
                className="bg-red-600 text-white px-8 py-4 rounded-full hover:bg-red-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
              >
                Explore App
              </Link>
              <button 
                onClick={() => setIsSignupModalOpen(true)}
                className="border-2 border-red-600 text-red-600 px-8 py-4 rounded-full hover:bg-red-600 hover:text-white transition-all duration-200 font-semibold text-lg"
              >
                Sign Up
              </button>
            </div>
          </div>
          
          {/* Interactive Mobile Preview */}
          <div className="relative flex items-center justify-center">
            <motion.div 
              className="relative"
              animate={{ 
                scale: isAppLoaded ? 1.05 : 1,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {/* Phone Frame */}
              <div className="relative mx-auto" style={{ width: '420px', height: '780px' }}>
                {/* Phone Shell with glow effect */}
                <motion.div 
                  className="absolute inset-0 bg-gray-900 rounded-[3rem] shadow-2xl"
                  animate={!isAppLoaded ? {
                    boxShadow: [
                      "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                      "0 25px 50px -12px rgba(239, 68, 68, 0.3)",
                      "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Screen */}
                <div className="absolute top-6 left-4 right-4 bottom-6 bg-gradient-to-br from-amber-50 to-blue-50 rounded-[2rem] overflow-hidden">
                  <AnimatePresence mode="wait">
                    {!isAppLoaded ? (
                      // CTA Preview Screen
                      <motion.div
                        key="cta"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col items-center justify-center p-8 relative"
                      >
                        <div className="text-center">
                          <motion.div
                            animate={{ 
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{ 
                              duration: 3,
                              repeat: Infinity,
                              repeatDelay: 1
                            }}
                            className="text-6xl mb-6"
                          >
                            🍹
                          </motion.div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            Try DrinkJoy Live!
                          </h3>
                          <p className="text-sm text-gray-600 mb-6">
                            Experience the magic of AI-powered drink recommendations
                          </p>
                          <motion.button
                            onClick={handlePreviewClick}
                            className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 mx-auto hover:from-red-700 hover:to-orange-700 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Play className="w-4 h-4" />
                            Preview App
                          </motion.button>
                        </div>
                        
                        {/* Animated elements */}
                        <motion.div
                          className="absolute top-4 right-4 text-2xl"
                          animate={{ 
                            y: [-10, 10, -10],
                            rotate: [-10, 10, -10]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          🍸
                        </motion.div>
                        <motion.div
                          className="absolute bottom-4 left-4 text-2xl"
                          animate={{ 
                            y: [10, -10, 10],
                            rotate: [10, -10, 10]
                          }}
                          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                        >
                          🍺
                        </motion.div>
                        <motion.div
                          className="absolute top-20 left-4 text-2xl"
                          animate={{ 
                            x: [-10, 10, -10],
                            rotate: [-15, 15, -15]
                          }}
                          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                        >
                          🍷
                        </motion.div>
                      </motion.div>
                    ) : (
                      // Live App Preview
                      <motion.div
                        key="app"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full relative"
                      >
                        {/* Close Button */}
                        <button
                          onClick={handleClosePreview}
                          className="absolute top-2 right-2 z-50 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-700" />
                        </button>
                        
                        {/* Loading Overlay */}
                        <AnimatePresence>
                          {isLoading && (
                            <motion.div
                              initial={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-white z-40 flex items-center justify-center"
                            >
                              <div className="text-center">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
                                />
                                <p className="text-sm text-gray-600">Loading DrinkJoy...</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        {/* Iframe */}
                        <iframe
                          src="/app"
                          className="w-full h-full border-0"
                          title="DrinkJoy App Preview"
                          onLoad={() => setIsLoading(false)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Notch */}
                {/* <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl"></div> */}
              </div>
              
              {/* Action Buttons */}
              <AnimatePresence>
                {isAppLoaded && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute -bottom-16 left-0 right-0 flex justify-center gap-4"
                  >
                    <Link
                      href="/app"
                      target="_blank"
                      className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Full Screen
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Signup Modal */}
      <SignupModal 
        isOpen={isSignupModalOpen} 
        onClose={() => setIsSignupModalOpen(false)} 
      />
    </section>
  );
}