import { LegalLayout } from '@/app/components/legal/LegalLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Drinkjoy',
  description: 'Learn about Drinkjoy, the AI-powered drink recommendation platform that helps you discover your perfect drink match.',
};

export default function AboutPage() {
  return (
    <LegalLayout title="About Drinkjoy" breadcrumb="About Us">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            At Drinkjoy, we believe that discovering your perfect drink should be as enjoyable as drinking it. 
            Our AI-powered platform takes the guesswork out of drink selection by providing personalized 
            recommendations based on your unique taste preferences, dietary restrictions, and the occasion.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Whether you&apos;re planning a romantic dinner, celebrating with friends, or simply exploring new flavors, 
            Drinkjoy helps you find the perfect drink match every time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our intelligent recommendation system analyzes multiple factors to provide you with personalized drink suggestions:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4">
            <li><strong>Taste Preferences:</strong> From crisp and refreshing to smooth and complex</li>
            <li><strong>Dietary Restrictions:</strong> Comprehensive allergy filtering for gluten, dairy, nuts, and more</li>
            <li><strong>Occasion Matching:</strong> Perfect drinks for every moment, from business meetings to celebrations</li>
            <li><strong>Weather Integration:</strong> Smart suggestions based on current weather conditions</li>
            <li><strong>Strength Preferences:</strong> From light and easy-going to bold and powerful</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Technology</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Drinkjoy uses advanced AI algorithms to match you with drinks from our extensive database of cocktails, 
            beers, wines, spirits, and non-alcoholic beverages. Our system continuously learns and improves, 
            ensuring that each recommendation gets better than the last.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We integrate with real-time weather data to provide contextual suggestions, and our allergy detection 
            system ensures that every recommendation is safe for your dietary needs.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">Responsible Drinking</h3>
              <p className="text-gray-700 leading-relaxed">
                We promote responsible drinking and require age verification. Our platform is designed to enhance 
                your drinking experience while encouraging moderation and safety.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">Inclusivity</h3>
              <p className="text-gray-700 leading-relaxed">
                Whether you prefer alcoholic or non-alcoholic beverages, have dietary restrictions, or are new to 
                exploring drinks, Drinkjoy welcomes everyone to discover their perfect match.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">Privacy & Security</h3>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is paramount. We collect only the information necessary to provide personalized 
                recommendations and never share your personal data without consent.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">Innovation</h3>
              <p className="text-gray-700 leading-relaxed">
                We continuously innovate to bring you the most accurate and delightful drink discovery experience, 
                incorporating the latest in AI and user experience design.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">For Businesses</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Drinkjoy also serves bars, restaurants, and event planners looking to enhance their beverage offerings. 
            Our platform can help businesses:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4">
            <li>Recommend drinks that match customer preferences</li>
            <li>Optimize menu offerings based on popular trends</li>
            <li>Provide personalized service that delights guests</li>
            <li>Accommodate dietary restrictions and allergies safely</li>
          </ul>
        </section>

        <section className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get Started Today</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Ready to discover your perfect drink match? Take our quick 5-question quiz and let our AI do the rest. 
            It&apos;s free, fun, and takes less than a minute.
          </p>
          <a 
            href="/app" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors"
          >
            Explore Drinkjoy
          </a>
        </section>
      </div>
    </LegalLayout>
  );
}