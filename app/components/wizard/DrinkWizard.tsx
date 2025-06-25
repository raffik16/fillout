'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WizardPreferences } from '@/app/types/wizard';
import { WeatherData } from '@/app/types/weather';
import { wizardQuestions } from '@/app/data/wizardQuestions';
import WizardQuestion from './WizardQuestion';
import WizardProgress from './WizardProgress';
import LoadingMatch from './LoadingMatch';
import MatchReveal from './MatchReveal';

interface DrinkWizardProps {
  onComplete: (preferences: WizardPreferences) => void;
  onSkip: () => void;
  weatherData?: WeatherData | null;
}

export default function DrinkWizard({ onComplete, onSkip }: DrinkWizardProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [preferences, setPreferences] = useState<WizardPreferences>({
    flavor: null,
    temperature: null,
    adventure: null,
    strength: null,
    occasion: null,
    useWeather: true
  });
  const [showLoading, setShowLoading] = useState(false);
  const [showMatch, setShowMatch] = useState(false);

  const handleAnswer = (value: string) => {
    const question = wizardQuestions[currentQuestion];
    const updatedPreferences = {
      ...preferences,
      [question.id]: value
    };
    setPreferences(updatedPreferences);

    if (currentQuestion < wizardQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered, show loading
      setShowLoading(true);
      findMatches();
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
        {/* Skip button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          Skip
        </button>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <WizardQuestion
              question={wizardQuestions[currentQuestion]}
              onAnswer={handleAnswer}
            />
          </motion.div>
        </AnimatePresence>

        {/* Progress */}
        <WizardProgress
          current={currentQuestion}
          total={wizardQuestions.length}
        />
      </div>
    </div>
  );
}