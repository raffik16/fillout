'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  
  
  BarChart3, 
  Heart, 
  MessageCircle, 
  Sparkles, 
  Trophy,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { UserButton } from '../components/auth/UserButton';
import { DrinkPreferencesForm } from '../components/preferences/DrinkPreferencesForm';
import { SubscriptionStatus } from '../components/billing/SubscriptionStatus';
import { useDrinkPreferences } from '@/lib/clerk/client';

interface DashboardTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const { preferences, isLoading: preferencesLoading } = useDrinkPreferences();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalRecommendations: 0,
    favoriteCategory: 'cocktail',
    recentActivity: [],
    streak: 0
  });

  useEffect(() => {
    // Simulate loading user stats
    if (user) {
      setStats({
        totalRecommendations: 47,
        favoriteCategory: preferences?.favoriteCategories?.[0] || 'cocktail',
        recentActivity: [
          { action: 'Discovered new drink', drink: 'Smoky Old Fashioned', time: '2 hours ago' },
          { action: 'Updated preferences', time: '1 day ago' },
          { action: 'Liked a drink', drink: 'Aperol Spritz', time: '3 days ago' }
        ],
        streak: 5
      });
    }
  }, [user, preferences]);

  if (!isLoaded || preferencesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">Please sign in to access your dashboard.</p>
          <UserButton />
        </div>
      </div>
    );
  }

  const tabs: DashboardTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart3 className="w-5 h-5" />,
      component: <OverviewTab user={user} stats={stats} preferences={preferences} />
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: <Settings className="w-5 h-5" />,
      component: <DrinkPreferencesForm />
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: <Heart className="w-5 h-5" />,
      component: <FavoritesTab />
    },
    {
      id: 'conversations',
      label: 'AI Chats',
      icon: <MessageCircle className="w-5 h-5" />,
      component: <ConversationsTab />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Welcome back, {user.firstName || user.emailAddresses[0]?.emailAddress}!
                </h1>
                <p className="text-sm text-gray-600">Manage your drink preferences and account</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <SubscriptionStatus />
              <UserButton showDisplayName={true} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              {tabs.find(tab => tab.id === activeTab)?.component}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ user, stats, preferences }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Your drink discovery journey at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Recommendations</h3>
          </div>
          <p className="text-3xl font-bold text-blue-900">{stats.totalRecommendations}</p>
          <p className="text-sm text-blue-700">Total drinks discovered</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">Streak</h3>
          </div>
          <p className="text-3xl font-bold text-green-900">{stats.streak}</p>
          <p className="text-sm text-green-700">Days active this week</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-purple-600" />
            <h3 className="text-lg font-semibold text-purple-900">Favorite</h3>
          </div>
          <p className="text-2xl font-bold text-purple-900 capitalize">{stats.favoriteCategory}</p>
          <p className="text-sm text-purple-700">Most preferred category</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {stats.recentActivity.map((activity: any, index: number) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-gray-900">{activity.action}</p>
                {activity.drink && (
                  <p className="text-sm text-gray-600">• {activity.drink}</p>
                )}
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <Sparkles className="w-6 h-6 text-orange-500 mb-2" />
            <h4 className="font-medium text-gray-900">Get New Recommendations</h4>
            <p className="text-sm text-gray-600">Discover drinks based on your preferences</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <MessageCircle className="w-6 h-6 text-blue-500 mb-2" />
            <h4 className="font-medium text-gray-900">Chat with AI Bartender</h4>
            <p className="text-sm text-gray-600">Ask questions about drinks and preferences</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// Favorites Tab Component
function FavoritesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Favorite Drinks</h2>
        <p className="text-gray-600">Drinks you&apos;ve liked and saved</p>
      </div>

      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
        <p className="text-gray-600 mb-6">Start discovering drinks to build your favorites collection</p>
        <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
          Discover Drinks
        </button>
      </div>
    </div>
  );
}

// Conversations Tab Component
function ConversationsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Chat History</h2>
        <p className="text-gray-600">Your conversations with the AI bartender</p>
      </div>

      <div className="text-center py-12">
        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
        <p className="text-gray-600 mb-6">Start chatting with our AI bartender to see your history here</p>
        <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          Start Chat
        </button>
      </div>
    </div>
  );
}