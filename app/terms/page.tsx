import { LegalLayout } from '@/app/components/legal/LegalLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Drinkjoy',
  description: 'Terms of Service and user agreement for Drinkjoy, the AI-powered drink recommendation platform.',
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" breadcrumb="Terms of Service">
      <div className="space-y-8">
        <section>
          <p className="text-gray-600 text-sm mb-6">
            <strong>Last Updated:</strong> January 2025
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Welcome to Drinkjoy. These Terms of Service (&quot;Terms&quot;) govern your use of the Drinkjoy website 
            and services (collectively, the &quot;Service&quot;) operated by Drinkjoy (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            By accessing and using Drinkjoy, you accept and agree to be bound by the terms and provision 
            of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Age Verification</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You must be at least 21 years old (or the legal drinking age in your jurisdiction) to use 
            portions of our Service that recommend alcoholic beverages. By using these features, you 
            represent and warrant that you meet these age requirements.
          </p>
          <p className="text-gray-700 leading-relaxed">
            We provide non-alcoholic beverage recommendations to users of all ages, but alcoholic 
            beverage features require age verification.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Use of Service</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You may use our Service for lawful purposes only. You agree not to use the Service:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 ml-4 mb-4">
            <li>In any way that violates any applicable federal, state, local, or international law or regulation</li>
            <li>To promote excessive or irresponsible drinking</li>
            <li>To provide false information about your age or identity</li>
            <li>To attempt to interfere with or disrupt the Service or servers</li>
            <li>To collect or harvest any personally identifiable information from other users</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Recommendations and Disclaimers</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our AI-powered recommendations are provided for informational purposes only. While we strive 
            for accuracy, we make no warranties about the completeness, reliability, or accuracy of our 
            recommendations.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Allergy Warning:</strong> While our system filters for common allergens, we cannot 
            guarantee that recommended drinks are completely free from allergens. Always verify ingredients 
            and consult with medical professionals if you have severe allergies.
          </p>
          <p className="text-gray-700 leading-relaxed">
            <strong>Responsible Drinking:</strong> We encourage responsible drinking. Please drink responsibly 
            and never drink and drive.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Intellectual Property Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Service and its original content, features, and functionality are and will remain the 
            exclusive property of Drinkjoy and its licensors. The Service is protected by copyright, 
            trademark, and other laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. User Content</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Any information you provide through our Service, including preference settings and feedback, 
            may be used to improve our recommendations and Service. You retain ownership of your personal 
            information, but grant us a license to use it for providing and improving our Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Your privacy is important to us. Please review our Privacy Policy, which also governs your 
            use of the Service, to understand our practices.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may terminate or suspend your access immediately, without prior notice or liability, 
            for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            In no event shall Drinkjoy, nor its directors, employees, partners, agents, suppliers, or 
            affiliates, be liable for any indirect, incidental, special, consequential, or punitive 
            damages, including without limitation, loss of profits, data, use, goodwill, or other 
            intangible losses, resulting from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            These Terms shall be interpreted and governed by the laws of the United States, without 
            regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
            If a revision is material, we will try to provide at least 30 days notice prior to any new 
            terms taking effect.
          </p>
        </section>

        <section className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have any questions about these Terms of Service, please contact us through our 
            Contact page or email us directly.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors"
          >
            Contact Us
          </a>
        </section>
      </div>
    </LegalLayout>
  );
}