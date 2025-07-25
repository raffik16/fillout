import { Suspense } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { getUserSubscription } from '@/lib/billing/subscription';
import { PricingTable, SubscriptionStatus } from '@/app/components/billing';

export const metadata = {
  title: 'Pricing - Drinkjoy',
  description: 'Choose the perfect plan for your drink discovery journey. Unlock premium features and personalized recommendations.',
};

export default async function PricingPage() {
  const user = await currentUser();
  let subscription = null;
  
  if (user) {
    try {
      subscription = await getUserSubscription();
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Start your drink discovery journey for free, then upgrade when you&apos;re ready 
            to unlock the full potential of personalized recommendations.
          </p>
        </div>

        {/* Current Subscription Status */}
        {user && subscription && (
          <div className="mb-12">
            <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-32" />}>
              <SubscriptionStatus className="max-w-md mx-auto" />
            </Suspense>
          </div>
        )}

        {/* Pricing Table */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-96" />}>
          <PricingTable currentPlan={subscription?.plan} />
        </Suspense>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <FrequentlyAskedQuestion
                  question="Can I change my plan anytime?"
                  answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
                />
                
                <FrequentlyAskedQuestion
                  question="What happens to my data if I cancel?"
                  answer="Your account remains active until the end of your billing period. After cancellation, you'll return to the free plan with access to basic features."
                />
                
                <FrequentlyAskedQuestion
                  question="Do you offer refunds?"
                  answer="We offer a 30-day money-back guarantee for all paid plans. Contact our support team if you&apos;re not satisfied with your subscription."
                />
              </div>
              
              <div className="space-y-6">
                <FrequentlyAskedQuestion
                  question="Is my payment information secure?"
                  answer="Absolutely. We use Stripe for payment processing, which is PCI DSS compliant and trusted by millions of businesses worldwide."
                />
                
                <FrequentlyAskedQuestion
                  question="Can I use Drinkjoy for my business?"
                  answer="Yes! Our Pro plan is perfect for bars, restaurants, and beverage professionals. Contact us for volume discounts and custom solutions."
                />
                
                <FrequentlyAskedQuestion
                  question="What payment methods do you accept?"
                  answer="We accept all major credit cards, debit cards, and digital wallets through our secure payment processor, Stripe."
                />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to discover your perfect drink?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of drink enthusiasts who've already discovered their new favorites with Drinkjoy's personalized recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/app"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200"
              >
                Start Free Today
              </a>
              <a
                href="/contact"
                className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-3 px-8 rounded-lg transition-all duration-200"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FrequentlyAskedQuestionProps {
  question: string;
  answer: string;
}

function FrequentlyAskedQuestion({ question, answer }: FrequentlyAskedQuestionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {question}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {answer}
      </p>
    </div>
  );
}