'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WizardPreferences, AllergyType } from '@/app/types/wizard';
import { WeatherData } from '@/app/types/weather';
import { wizardQuestions } from '@/app/data/wizardQuestions';
import WizardQuestion from './WizardQuestion';
import WizardProgress from './WizardProgress';
import LoadingMatch from './LoadingMatch';
import MatchReveal from './MatchReveal';
import OverwhelmedAnimation from '../animations/OverwhelmedAnimation';
import ColorSplashAnimation from '../animations/ColorSplashAnimation';
import { ChevronLeft } from 'lucide-react';

interface DrinkWizardProps {
  onComplete: (preferences: WizardPreferences) => void;
  weatherData?: WeatherData | null;
  isRetake?: boolean;
}

export default function DrinkWizard({ onComplete, isRetake = false }: DrinkWizardProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [preferences, setPreferences] = useState<WizardPreferences>({
    category: null,
    flavor: null,
    temperature: null,
    adventure: null,
    strength: null,
    occasion: null,
    allergies: null,
    useWeather: true
  });
  const [showLoading, setShowLoading] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [showOverwhelmed, setShowOverwhelmed] = useState(!isRetake);
  const [showColorSplash, setShowColorSplash] = useState(false);
  const [hasShownOverwhelmed, setHasShownOverwhelmed] = useState(isRetake);
  const [navigationDirection, setNavigationDirection] = useState<'forward' | 'backward'>('forward');

  const handleAnswer = (value: string) => {
    const question = wizardQuestions[currentQuestion];
    let updatedPreferences;
    
    // Special handling for allergies (multi-select)
    if (question.id === 'allergies') {
      if (value === 'none') {
        updatedPreferences = {
          ...preferences,
          allergies: ['none'] as AllergyType[]
        };
      } else {
        // Toggle the allergy in the array
        const currentAllergies = preferences.allergies || [];
        const filteredAllergies = currentAllergies.filter(a => a !== 'none') as Exclude<AllergyType, 'none'>[];
        
        if (filteredAllergies.includes(value as Exclude<AllergyType, 'none'>)) {
          // Remove if already selected
          const newAllergies = filteredAllergies.filter(a => a !== value);
          updatedPreferences = {
            ...preferences,
            allergies: newAllergies.length > 0 ? newAllergies as AllergyType[] : ['none'] as AllergyType[]
          };
        } else {
          // Add to selection
          updatedPreferences = {
            ...preferences,
            allergies: [...filteredAllergies, value as AllergyType] as AllergyType[]
          };
        }
      }
    } else {
      updatedPreferences = {
        ...preferences,
        [question.id]: value
      } as WizardPreferences;
    }
    
    setPreferences(updatedPreferences);
    setNavigationDirection('forward');

    if (currentQuestion < wizardQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered, show loading
      setShowLoading(true);
      findMatches();
    }
  };

  const handleGoBack = () => {
    if (currentQuestion > 0) {
      setNavigationDirection('backward');
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const findMatches = async () => {
    // Simulate matching process
    setTimeout(() => {
      setShowLoading(false);
      setShowMatch(true);
    }, 2500);
  };

  const handleMatchRevealComplete = () => {
    onComplete(preferences);
  };

  const handleOverwhelmedComplete = () => {
    // Start color splash animation immediately
    setShowColorSplash(true);
    setHasShownOverwhelmed(true);
    
    // Hide overwhelmed animation after a short delay for overlap
    setTimeout(() => {
      setShowOverwhelmed(false);
    }, 300); // 300ms overlap
  };

  const handleColorSplashComplete = () => {
    setShowColorSplash(false);
  };

  // Show animation once on component mount
  useEffect(() => {
    if (!hasShownOverwhelmed) {
      setShowOverwhelmed(true);
    }
  }, [hasShownOverwhelmed]);

  if (showOverwhelmed || showColorSplash) {
    return (
      <div className="fixed inset-0">
        {/* Color splash animation (behind) */}
        {showColorSplash && (
          <ColorSplashAnimation onComplete={handleColorSplashComplete} />
        )}
        
        {/* Overwhelmed animation (in front, with fade out) */}
        {showOverwhelmed && (
          <div 
            className="fixed inset-0 bg-gradient-to-br from-orange-50 to-rose-50 flex flex-col items-center justify-center p-4 transition-opacity duration-300"
            style={{ 
              opacity: showColorSplash ? 0 : 1,
              zIndex: showColorSplash ? 10 : 20 
            }}
          >
            <OverwhelmedAnimation onComplete={handleOverwhelmedComplete} />
          </div>
        )}
      </div>
    );
  }

  if (showLoading) {
    return <LoadingMatch />;
  }

  if (showMatch) {
    return (
      <MatchReveal 
        onComplete={handleMatchRevealComplete}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-50 to-rose-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ 
              opacity: 0, 
              x: navigationDirection === 'forward' ? 100 : -100 
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ 
              opacity: 0, 
              x: navigationDirection === 'forward' ? -100 : 100 
            }}
            transition={{ duration: 0.3 }}
          >
            <WizardQuestion
              question={wizardQuestions[currentQuestion]}
              onAnswer={handleAnswer}
              selectedValue={preferences[wizardQuestions[currentQuestion].id]}
            />
          </motion.div>
        </AnimatePresence>

        {/* Progress */}
        <WizardProgress
          current={currentQuestion}
          total={wizardQuestions.length}
        />
        
        {/* Back Button */}
        {currentQuestion > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleGoBack}
            className="absolute bottom-8 left-8 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 group"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
          </motion.button>
        )}

      </div>
    </div>
  );
}