'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  MessageCircle, 
  Sparkles, 
  Brain, 
  Heart, 
  Zap,
  Users,
  BookOpen,
  Lightbulb,
  
  
  Lock,
  BarChart3,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { UserDrinkPreferences, PreferenceValidation, AIPersonality, RecommendationStyle } from '@/app/types/preferences';
import { cn } from '@/lib/utils';
import { PremiumGate } from '@/app/components/gates';

interface AIPreferencesProps {
  preferences: UserDrinkPreferences;
  onChange: (updates: Partial<UserDrinkPreferences>) => void;
  errors: PreferenceValidation[];
}

// AI Personality configurations
const AI_PERSONALITIES: Record<AIPersonality, {
  icon: typeof Bot;
  color: string;
  description: string;
  traits: string[];
  example: string;
}> = {
  casual: {
    icon: MessageCircle,
    color: 'blue',
    description: 'Friendly and relaxed, like chatting with a friend',
    traits: ['Conversational', 'Laid-back', 'Fun', 'Relatable'],
    example: "Hey! Looking for something refreshing? Let me suggest this amazing mojito I think you'll love!"
  },
  professional: {
    icon: BookOpen,
    color: 'gray',
    description: 'Knowledgeable and formal, focused on detailed information',
    traits: ['Informative', 'Precise', 'Structured', 'Expert'],
    example: "Based on your preference profile, I recommend a classic Negroni featuring balanced bitter notes with a 1:1:1 ratio."
  },
  enthusiastic: {
    icon: Sparkles,
    color: 'purple',
    description: 'Excited and passionate about drinks and discoveries',
    traits: ['Energetic', 'Passionate', 'Encouraging', 'Inspiring'],
    example: "Oh wow! I have the PERFECT drink for you! This craft cocktail is going to blow your mind - trust me!"
  },
  knowledgeable: {
    icon: Brain,
    color: 'green',
    description: 'Educational and detailed, loves sharing drink history and techniques',
    traits: ['Educational', 'Historical', 'Technical', 'Thorough'],
    example: "This Old Fashioned dates back to the 1880s. The muddling technique releases essential oils from the orange peel, creating a complex aromatic profile."
  },
};

// Recommendation Style configurations
const RECOMMENDATION_STYLES: Record<RecommendationStyle, {
  icon: typeof Zap;
  color: string;
  description: string;
  characteristics: string[];
  riskLevel: string;
}> = {
  conservative: {
    icon: BookOpen,
    color: 'blue',
    description: 'Safe choices based on popular preferences',
    characteristics: ['Well-known drinks', 'Proven favorites', 'Low risk', 'Familiar flavors'],
    riskLevel: 'Low risk, high satisfaction',
  },
  balanced: {
    icon: Heart,
    color: 'green',
    description: 'Mix of familiar and new options',
    characteristics: ['Varied suggestions', 'Some surprises', 'Moderate exploration', 'Balanced approach'],
    riskLevel: 'Moderate risk, good discovery',
  },
  adventurous: {
    icon: Zap,
    color: 'orange',
    description: 'Bold suggestions and unique combinations',
    characteristics: ['Unique drinks', 'Unusual flavors', 'Creative mixes', 'Experimental'],
    riskLevel: 'Higher risk, exciting discoveries',
  },
  experimental: {
    icon: Lightbulb,
    color: 'red',
    description: 'Cutting-edge drinks and innovative techniques',
    characteristics: ['Avant-garde', 'Molecular mixology', 'Uncommon ingredients', 'Trendsetting'],
    riskLevel: 'Highest risk, breakthrough experiences',
  },
};

// Toggle switch component
const ToggleSwitch = ({ 
  enabled, 
  onChange, 
  label, 
  description 
}: { 
  enabled: boolean; 
  onChange: (value: boolean) => void; 
  label: string;
  description: string;
}) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
    <div>
      <h4 className="font-medium text-gray-900 dark:text-gray-100">{label}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
    <motion.button
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative w-12 h-6 rounded-full transition-colors duration-200',
        enabled ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
      )}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
        animate={{ x: enabled ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  </div>
);

export default function AIPreferences({ preferences, onChange, errors }: AIPreferencesProps) {
  const [selectedPersonality, setSelectedPersonality] = useState<AIPersonality>(preferences.aiPersonality);
  const [selectedStyle, setSelectedStyle] = useState<RecommendationStyle>(preferences.recommendationStyle);

  const handlePersonalityChange = (personality: AIPersonality) => {
    setSelectedPersonality(personality);
    onChange({ aiPersonality: personality });
  };

  const handleStyleChange = (style: RecommendationStyle) => {
    setSelectedStyle(style);
    onChange({ recommendationStyle: style });
  };

  const handleToggleChange = (field: keyof UserDrinkPreferences, value: boolean) => {
    onChange({ [field]: value });
  };

  const getColorClasses = (color: string, isActive: boolean = false) => {
    const colors = {
      blue: isActive ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-200' : 'border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/10',
      gray: isActive ? 'bg-gray-100 dark:bg-gray-900/30 border-gray-500 text-gray-800 dark:text-gray-200' : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900/10',
      purple: isActive ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-800 dark:text-purple-200' : 'border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/10',
      green: isActive ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200' : 'border-green-200 hover:bg-green-50 dark:hover:bg-green-900/10',
      orange: isActive ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-800 dark:text-purple-200' : 'border-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900/10',
      red: isActive ? 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-200' : 'border-red-200 hover:bg-red-50 dark:hover:bg-red-900/10',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          AI Chat Preferences
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize how our AI assistant interacts with you and makes recommendations
        </p>
      </div>

      {/* AI Personality Selection */}
      <PremiumGate 
        plan="premium"
        feature="Advanced AI Personality"
        title="Premium AI Personalities"
        description="Unlock advanced AI personalities for a more personalized chat experience."
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold">AI Personality</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose how you'd like our AI assistant to communicate with you
            </p>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(AI_PERSONALITIES).map(([personality, config]) => {
              const Icon = config.icon;
              const isSelected = selectedPersonality === personality;

              return (
                <motion.button
                  key={personality}
                  onClick={() => handlePersonalityChange(personality as AIPersonality)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all duration-200',
                    getColorClasses(config.color, isSelected)
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium capitalize">{personality}</span>
                  </div>
                  
                  <p className="text-sm opacity-80 mb-3">{config.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {config.traits.map((trait) => (
                      <span
                        key={trait}
                        className="text-xs px-2 py-1 bg-black/10 dark:bg-white/10 rounded-full"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-xs p-2 bg-black/5 dark:bg-white/5 rounded-lg italic">
                    "{config.example}"
                  </div>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      </PremiumGate>

      {/* Recommendation Style */}
      <PremiumGate 
        plan="premium"
        feature="Advanced Recommendation Styles"
        title="Premium Recommendation Engine"
        description="Access advanced recommendation styles including experimental and adventurous options."
      >
        <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold">Recommendation Style</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Define how adventurous you want our drink suggestions to be
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(RECOMMENDATION_STYLES).map(([style, config]) => {
              const Icon = config.icon;
              const isSelected = selectedStyle === style;

              return (
                <motion.button
                  key={style}
                  onClick={() => handleStyleChange(style as RecommendationStyle)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all duration-200',
                    getColorClasses(config.color, isSelected)
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium capitalize">{style}</span>
                    </div>
                    <span className="text-xs opacity-70">{config.riskLevel}</span>
                  </div>
                  
                  <p className="text-sm opacity-80 mb-3">{config.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {config.characteristics.slice(0, 3).map((char) => (
                      <span
                        key={char}
                        className="text-xs px-2 py-1 bg-black/10 dark:bg-white/10 rounded-full"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      </PremiumGate>

      {/* Interaction Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Interaction Settings</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Control how the AI assistant behaves during conversations
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ToggleSwitch
              enabled={preferences.chatHistoryEnabled}
              onChange={(value) => handleToggleChange('chatHistoryEnabled', value)}
              label="Enable Chat History"
              description="Remember our conversations to provide better recommendations"
            />
            
            <ToggleSwitch
              enabled={preferences.personalizedGreetings}
              onChange={(value) => handleToggleChange('personalizedGreetings', value)}
              label="Personalized Greetings"
              description="Use your name and preferences for custom welcome messages"
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold">Privacy & Data</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Control how your data is used to improve the experience
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ToggleSwitch
              enabled={preferences.shareDataForImprovement}
              onChange={(value) => handleToggleChange('shareDataForImprovement', value)}
              label="Share Data for Improvement"
              description="Help us improve recommendations by sharing anonymized usage data"
            />
            
            <ToggleSwitch
              enabled={preferences.allowAnalytics}
              onChange={(value) => handleToggleChange('allowAnalytics', value)}
              label="Analytics & Insights"
              description="Enable tracking to provide personalized drinking insights"
            />
            
            <ToggleSwitch
              enabled={preferences.emailNotifications}
              onChange={(value) => handleToggleChange('emailNotifications', value)}
              label="Email Notifications"
              description="Receive updates about new features and drink recommendations"
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <PremiumGate 
        plan="pro"
        feature="AI Analytics & Insights"
        title="Pro Analytics Dashboard"
        description="Get detailed insights into your AI interactions and drinking preferences."
      >
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Your AI Profile Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">Personality:</span>
                  <span className="text-gray-700 dark:text-gray-300 ml-2 capitalize">
                    {selectedPersonality}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">Style:</span>
                  <span className="text-gray-700 dark:text-gray-300 ml-2 capitalize">
                    {selectedStyle}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">History:</span>
                  <span className="text-gray-700 dark:text-gray-300 ml-2">
                    {preferences.chatHistoryEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">Data Sharing:</span>
                  <span className="text-gray-700 dark:text-gray-300 ml-2">
                    {preferences.shareDataForImprovement ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Expected Experience:</strong> Your AI assistant will be {' '}
                  <span className="text-purple-600 dark:text-purple-400 font-medium">
                    {AI_PERSONALITIES[selectedPersonality].traits[0].toLowerCase()}
                  </span> and provide {' '}
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {RECOMMENDATION_STYLES[selectedStyle].characteristics[0].toLowerCase()}
                  </span> suggestions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </PremiumGate>
    </div>
  );
}