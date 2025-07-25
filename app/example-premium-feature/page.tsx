import { SubscriptionGate, UsageLimitWarning } from '@/app/components/billing';

export const metadata = {
  title: 'Premium Feature Example - Drinkjoy',
  description: 'An example of how premium features are gated behind subscriptions.',
};

export default function ExamplePremiumFeaturePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Premium Feature Example
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            This page demonstrates how to use the billing components to gate premium features.
          </p>
        </div>

        {/* Usage Limit Warning Example */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Usage Limit Warning Example
          </h2>
          <UsageLimitWarning 
            feature="drinkRecommendations" 
            currentUsage={8} 
            showOnlyNearLimit={false}
          />
        </div>

        {/* Weather Integration Feature - Premium Required */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Weather-Based Recommendations
          </h2>
          <SubscriptionGate 
            requiredPlan="premium" 
            feature="Weather-based drink recommendations"
          >
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                🌤️ Perfect Weather, Perfect Drink
              </h3>
              <p className="text-blue-800 dark:text-blue-200 mb-4">
                Based on today's weather in your location, we recommend a refreshing 
                Moscow Mule to cool you down on this warm day!
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Current Weather
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    75°F, Sunny ☀️
                  </p>
                </div>
                <div className="bg-white dark:bg-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Recommended
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Moscow Mule 🍹
                  </p>
                </div>
              </div>
            </div>
          </SubscriptionGate>
        </div>

        {/* Advanced Analytics - Pro Required */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Advanced Analytics
          </h2>
          <SubscriptionGate 
            requiredPlan="pro" 
            feature="Advanced analytics and insights"
          >
            <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
                📊 Your Drinking Insights
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-purple-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                    47
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Drinks Tried
                  </div>
                </div>
                <div className="bg-white dark:bg-purple-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                    12
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Favorites
                  </div>
                </div>
                <div className="bg-white dark:bg-purple-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                    Sweet
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Top Preference
                  </div>
                </div>
              </div>
            </div>
          </SubscriptionGate>
        </div>

        {/* Custom Filters - Premium Required */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Custom Filters
          </h2>
          <SubscriptionGate 
            requiredPlan="premium" 
            feature="Custom drink filters"
          >
            <div className="bg-green-50 dark:bg-green-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">
                🎯 Advanced Filtering Options
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    ABV Range
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    className="w-full"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                    Price Range
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    className="w-full"
                    disabled
                  />
                </div>
              </div>
            </div>
          </SubscriptionGate>
        </div>
      </div>
    </div>
  );
}