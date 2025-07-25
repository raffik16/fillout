'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/app/components/layout/Header';
import { Footer } from '@/app/components/layout/Footer';
import PopularDrinksWidget from '@/app/components/analytics/PopularDrinksWidget';
import { BarChart3, Users, Heart, TrendingUp, ShoppingCart } from 'lucide-react';

interface Analytics {
  totalLikes: number;
  totalUsers: number;
  totalDrinks: number;
  totalOrders: number;
  totalOrderUsers: number;
}

export default function AnalyticsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalLikes: 0,
    totalUsers: 0,
    totalDrinks: 0,
    totalOrders: 0,
    totalOrderUsers: 0
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme ? savedTheme === 'dark' : systemDarkMode;
    setIsDarkMode(isDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [drinksResponse, ordersResponse] = await Promise.all([
          fetch('/api/analytics/popular-drinks'),
          fetch('/api/analytics/orders')
        ]);
        
        if (drinksResponse.ok) {
          const drinksData = await drinksResponse.json();
          const drinks = drinksData.data || [];
          
          const totalLikes = drinks.reduce((sum: number, drink: { like_count: number }) => sum + drink.like_count, 0);
          const totalUsers = drinks.reduce((sum: number, drink: { unique_users: number }) => sum + drink.unique_users, 0);
          
          let ordersStats = { totalOrders: 0, totalOrderUsers: 0 };
          if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            ordersStats = ordersData.data || ordersStats;
          }
          
          setAnalytics({
            totalLikes,
            totalUsers,
            totalDrinks: drinks.length,
            totalOrders: ordersStats.totalOrders,
            totalOrderUsers: ordersStats.totalOrderUsers
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Header 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={handleToggleDarkMode}
        location=""
        temperature={undefined}
        isMetricUnit={false}
        showLocation={false}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track drink popularity and user engagement
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Likes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.totalLikes.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Popular Drinks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.totalDrinks.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.totalOrders.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Order Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.totalOrderUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Drinks Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PopularDrinksWidget />
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                How It Works
              </h3>
            </div>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-purple-600">1</span>
                </div>
                <div>
                  <p className="font-medium">Like Tracking</p>
                  <p className="text-xs">Users can like drinks in the discovery quiz results</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-purple-600">2</span>
                </div>
                <div>
                  <p className="font-medium">Popularity Boost</p>
                  <p className="text-xs">Popular drinks get higher scores in recommendations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-purple-600">3</span>
                </div>
                <div>
                  <p className="font-medium">Smart Matching</p>
                  <p className="text-xs">Algorithm considers both preferences and popularity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}