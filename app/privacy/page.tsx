import { LegalLayout } from '@/app/components/legal/LegalLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Drinkjoy',
  description: 'Privacy Policy for Drinkjoy. Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" breadcrumb="Privacy Policy">
      <div className="space-y-8">
        <section>
          <p className="text-gray-600 text-sm mb-6">
            <strong>Last Updated:</strong> January 2025
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            At Drinkjoy, we are committed to protecting your privacy and personal information. This Privacy 
            Policy explains how we collect, use, disclose, and safeguard your information when you use our 
            website and services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
          
          <h3 className="text-lg font-semibold text-red-600 mb-3">Information You Provide</h3>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4 mb-4">
            <li><strong>Contact Information:</strong> Name and email address when you sign up for updates</li>
            <li><strong>Preference Data:</strong> Your drink preferences, dietary restrictions, and occasion choices</li>
            <li><strong>Business Information:</strong> Bar or restaurant name if provided for business inquiries</li>
            <li><strong>Feedback:</strong> Comments and messages you send through our contact forms</li>
          </ul>

          <h3 className="text-lg font-semibold text-red-600 mb-3">Information Automatically Collected</h3>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4 mb-4">
            <li><strong>Usage Data:</strong> How you interact with our Service, pages visited, time spent</li>
            <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
            <li><strong>Location Data:</strong> General location for weather-based recommendations (with consent)</li>
            <li><strong>Session Data:</strong> Anonymous session identifiers for personalized recommendations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4">
            <li>Provide personalized drink recommendations</li>
            <li>Filter recommendations based on your allergies and dietary restrictions</li>
            <li>Improve our AI recommendation algorithms</li>
            <li>Send you updates and respond to your inquiries</li>
            <li>Analyze usage patterns to enhance our Service</li>
            <li>Ensure the security and integrity of our Service</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing and Disclosure</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties, except as described below:
          </p>
          
          <h3 className="text-lg font-semibold text-red-600 mb-3">Service Providers</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may share your information with trusted third-party service providers who assist us in operating our Service:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4 mb-4">
            <li><strong>Formspree:</strong> For processing contact forms and email communications</li>
            <li><strong>Weather Services:</strong> For obtaining weather data to enhance recommendations</li>
            <li><strong>Analytics Providers:</strong> For understanding Service usage and performance</li>
          </ul>

          <h3 className="text-lg font-semibold text-red-600 mb-3">Legal Requirements</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may disclose your information if required to do so by law or in response to valid requests 
            by public authorities.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We implement appropriate technical and organizational security measures to protect your personal 
            information against unauthorized access, alteration, disclosure, or destruction. However, no 
            method of transmission over the internet or electronic storage is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies and Similar Technologies</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use cookies and similar tracking technologies to enhance your experience on our Service:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4 mb-4">
            <li><strong>Essential Cookies:</strong> Required for the Service to function properly</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how you use our Service</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            You can control cookie settings through your browser preferences.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Privacy Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Depending on your location, you may have the following rights regarding your personal information:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4 mb-4">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Portability:</strong> Request transfer of your information to another service</li>
            <li><strong>Objection:</strong> Object to certain uses of your personal information</li>
            <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We retain your personal information only for as long as necessary to provide our Service and 
            fulfill the purposes outlined in this Privacy Policy. Preference data is retained to provide 
            consistent recommendations, but can be deleted upon request.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place to protect your personal information in 
            accordance with this Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            While our Service provides non-alcoholic beverage recommendations to users of all ages, 
            we do not knowingly collect personal information from children under 13 without parental 
            consent. If you believe we have collected such information, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by 
            posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
          </p>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us About Privacy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have any questions about this Privacy Policy or wish to exercise your privacy rights, 
            please contact us through our Contact page.
          </p>
          <div className="space-y-3">
            <a 
              href="/contact" 
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors mr-4"
            >
              Contact Us
            </a>
            <p className="text-sm text-gray-600">
              We are committed to GDPR compliance and will respond to privacy requests within 30 days.
            </p>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}