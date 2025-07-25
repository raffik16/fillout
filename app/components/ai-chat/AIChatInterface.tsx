'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FiSend, FiX } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { Crown, TrendingUp } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { MessageBubble, Message } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { QuickSuggestions } from './QuickSuggestions';
import { UpgradeModal } from '@/app/components/gates';

interface AIChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  onPreferencesReady?: (preferences: Record<string, unknown>) => void;
}

export const AIChatInterface: React.FC<AIChatInterfaceProps> = ({ isOpen, onClose, className, onPreferencesReady }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usageInfo, setUsageInfo] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate session ID on mount
  useEffect(() => {
    setSessionId(`ai-chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !sessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          sessionId,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'USAGE_LIMIT_EXCEEDED') {
          setShowUpgradeModal(true);
          setUsageInfo(data.usage);
          
          // Add system message about usage limit
          const systemMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: `You've reached your AI chat limit for this month (${data.usage.current}/${data.usage.limit}). Upgrade to Premium for unlimited AI conversations!`,
            role: 'system',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, systemMessage]);
        } else {
          throw new Error(data.error || 'Failed to get AI response');
        }
        return;
      }

      // Update usage info
      if (data.usage) {
        setUsageInfo(data.usage);
      }

      // Handle preferences if ready
      if (data.preferences && data.is_ready && onPreferencesReady) {
        onPreferencesReady(data.preferences);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
        quickButtons: data.quickButtons,
        drinks: data.drinks
      };
      
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'system',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleQuickSuggestion = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Chat Window */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              'fixed bottom-24 right-6 z-50',
              'w-[calc(100vw-3rem)] md:w-96',
              'h-[calc(100vh-12rem)]',
              'bg-white dark:bg-gray-900',
              'rounded-2xl shadow-2xl',
              'flex flex-col overflow-hidden',
              'border border-gray-200 dark:border-gray-800',
              className
            )}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center">
                    <HiSparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Carla Joy
                      </h3>
                      {user && usageInfo?.plan === 'premium' && (
                        <div className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full">
                          <Crown className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Premium</span>
                        </div>
                      )}
                      {user && usageInfo?.plan === 'pro' && (
                        <div className="inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full">
                          <Crown className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Pro</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {user && usageInfo?.plan === 'premium' || usageInfo?.plan === 'pro' 
                        ? 'Premium drink recommendations' 
                        : 'Ask about drinks'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close chat"
                >
                  <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              {/* Usage Display */}
              {user && usageInfo && typeof usageInfo.limit === 'number' && (
                <div className="flex items-center gap-2 mt-1 pt-1 border-t border-purple-200 dark:border-purple-800">
                  <TrendingUp className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-purple-700 dark:text-purple-300">
                        {usageInfo.remaining} chats remaining
                      </span>
                      <span className="text-purple-600 dark:text-purple-400">
                        {usageInfo.current}/{usageInfo.limit}
                      </span>
                    </div>
                    <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-1 mt-1">
                      <div 
                        className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((usageInfo.current / usageInfo.limit) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  {usageInfo.remaining <= 2 && (
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded"
                    >
                      Upgrade
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-900/30 flex items-center justify-center">
                    <HiSparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Welcome to Carla Joy!
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    I&apos;m here to help you discover the perfect drink based on your preferences.
                  </p>
                  <QuickSuggestions onSelect={handleQuickSuggestion} />
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageBubble 
                      key={message.id} 
                      message={message} 
                      onQuickResponse={handleSendMessage}
                    />
                  ))}
                  {isTyping && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center">
                        <HiSparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950"
            >
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me about drinks..."
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg',
                    'bg-white dark:bg-gray-800',
                    'border border-gray-300 dark:border-gray-700',
                    'placeholder-gray-500 dark:placeholder-gray-400',
                    'text-gray-800 dark:text-gray-200',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500',
                    'transition-all duration-200'
                  )}
                />
                <motion.button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'p-2 rounded-lg',
                    'bg-gradient-to-r from-purple-600 to-purple-500',
                    'text-white',
                    'hover:from-purple-700 hover:to-purple-600',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500',
                    'transition-all duration-200'
                  )}
                  aria-label="Send message"
                >
                  <FiSend className="w-4 h-4" />
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* Upgrade Modal */}
          <UpgradeModal
            isOpen={showUpgradeModal}
            onClose={() => setShowUpgradeModal(false)}
            triggeredBy="AI Chat"
            requiredPlan="premium"
            currentUsage={usageInfo && typeof usageInfo.limit === 'number' ? {
              feature: 'AI chats',
              current: usageInfo.current,
              limit: usageInfo.limit,
              resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            } : undefined}
          />
        </>
      )}
    </AnimatePresence>
  );
};