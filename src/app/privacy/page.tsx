import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-zinc-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">1. Introduction</h2>
            <p className="text-zinc-300 leading-relaxed">
              Welcome to Baguri (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our marketplace platform (&quot;Service&quot;) that connects independent designers with customers. We are committed to protecting your privacy and ensuring transparency about our data practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium mb-3 text-white">2.1 Information You Provide Directly</h3>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
              <li><strong>Account Information:</strong> Email address, password, name, and profile details</li>
              <li><strong>Designer Profiles:</strong> Business information, portfolio images, social media handles, bio, and verification documents</li>
              <li><strong>Payment Information:</strong> Billing address and payment method details (processed securely by Stripe)</li>
              <li><strong>Communications:</strong> Messages sent through our platform, customer support inquiries, and email correspondence</li>
              <li><strong>Product Information:</strong> Product descriptions, images, pricing, and inventory details (for designers)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-white mt-6">2.2 Information Collected Automatically</h3>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
              <li><strong>Usage Data:</strong> Pages visited, time spent on site, click patterns, and feature usage</li>
              <li><strong>Device Information:</strong> IP address, browser type, device type, operating system, and unique identifiers</li>
              <li><strong>Analytics Data:</strong> Website performance metrics collected through Google Analytics and Microsoft Clarity</li>
              <li><strong>Cookies and Tracking:</strong> Session data, preferences, and authentication tokens</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-white mt-6">2.3 Third-Party Information</h3>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
              <li><strong>Instagram Verification:</strong> Profile information and username when you verify your Instagram account</li>
              <li><strong>Payment Processing:</strong> Transaction data from Stripe for payment processing</li>
              <li><strong>Email Services:</strong> Delivery and engagement metrics from our email service provider</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">3. How We Use Your Information</h2>
            
            <h3 className="text-xl font-medium mb-3 text-white">3.1 Core Platform Operations</h3>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
              <li>Create and manage user accounts and designer profiles</li>
              <li>Process transactions and manage payments</li>
              <li>Enable communication between designers and customers</li>
              <li>Maintain platform security and prevent fraud</li>
              <li>Provide customer support and resolve disputes</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-white mt-6">3.2 Verification and Trust</h3>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
              <li>Verify designer identities and social media accounts</li>
              <li>Prevent impersonation and maintain marketplace integrity</li>
              <li>Display verification status to build customer trust</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-white mt-6">3.3 Communication and Marketing</h3>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
              <li>Send transactional emails (order confirmations, notifications)</li>
              <li>Provide platform updates and important announcements</li>
              <li>Send promotional content (with your consent)</li>
              <li>Conduct surveys and gather feedback</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-white mt-6">3.4 Analytics and Improvement</h3>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
              <li>Analyze usage patterns to improve our services</li>
              <li>Monitor platform performance and troubleshoot issues</li>
              <li>Develop new features and enhance user experience</li>
              <li>Generate anonymized analytics and insights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">4. Information Sharing and Disclosure</h2>
            
            <h3 className="text-xl font-medium mb-3 text-white">4.1 Public Information</h3>
            <p className="text-zinc-300 mb-4">
              Designer profiles, including names, photos, portfolios, and verification status, are publicly visible to help customers discover and evaluate designers.
            </p>

            <h3 className="text-xl font-medium mb-3 text-white">4.2 Service Providers</h3>
            <p className="text-zinc-300 mb-2">We share information with trusted third-party service providers:</p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
              <li><strong>Supabase:</strong> Database hosting and user authentication</li>
              <li><strong>Stripe:</strong> Payment processing and financial transactions</li>
              <li><strong>Resend:</strong> Email delivery and communication services</li>
              <li><strong>Google Analytics:</strong> Website analytics and performance monitoring</li>
              <li><strong>Microsoft Clarity:</strong> User behavior analytics and heatmaps</li>
              <li><strong>Instagram/Meta:</strong> Account verification services</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-white mt-6">4.3 Legal Requirements</h3>
            <p className="text-zinc-300">
              We may disclose information when required by law, to protect our rights, prevent fraud, or ensure platform safety.
            </p>

            <h3 className="text-xl font-medium mb-3 text-white mt-6">4.4 Business Transfers</h3>
            <p className="text-zinc-300">
              In the event of a merger, acquisition, or sale of assets, user information may be transferred to the new entity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">5. Data Security</h2>
            <p className="text-zinc-300 mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and session management</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and employee training</li>
              <li>PCI DSS compliant payment processing through Stripe</li>
            </ul>
            <p className="text-zinc-300 mt-4">
              However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but are committed to protecting your information using reasonable measures.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Your Rights and Choices</h2>
            
            <h3 className="text-xl font-medium mb-3 text-white">6.1 Account Management</h3>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
              <li>Update your profile information and preferences</li>
              <li>Change your email address and password</li>
              <li>Manage your notification settings</li>
              <li>Delete your account and associated data</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-white mt-6">6.2 Data Rights (GDPR/CCPA)</h3>
            <p className="text-zinc-300 mb-2">Depending on your location, you may have additional rights:</p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete information</li>
              <li><strong>Erasure:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to certain types of data processing</li>
              <li><strong>Restriction:</strong> Request limitations on data processing</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-white mt-6">6.3 Marketing Communications</h3>
            <p className="text-zinc-300">
              You can opt out of promotional emails by clicking the unsubscribe link in any marketing email or by updating your account preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Cookies and Tracking Technologies</h2>
            <p className="text-zinc-300 mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
              <li>Maintain your login session and preferences</li>
              <li>Analyze website traffic and user behavior</li>
              <li>Improve our services and user experience</li>
              <li>Provide targeted content and recommendations</li>
            </ul>
            <p className="text-zinc-300 mt-4">
              You can control cookies through your browser settings, but disabling certain cookies may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">8. Children&apos;s Privacy</h2>
            <p className="text-zinc-300">
              Our platform is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">9. International Data Transfers</h2>
            <p className="text-zinc-300">
              Your information may be processed and stored in countries other than your own. We ensure appropriate safeguards are in place for international transfers, including Standard Contractual Clauses and adequacy decisions where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">10. Data Retention</h2>
            <p className="text-zinc-300 mb-4">
              We retain your information for as long as necessary to:
            </p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
              <li>Provide our services and maintain your account</li>
              <li>Comply with legal obligations and resolve disputes</li>
              <li>Prevent fraud and maintain platform security</li>
              <li>Improve our services through analytics</li>
            </ul>
            <p className="text-zinc-300 mt-4">
              When you delete your account, we will delete or anonymize your personal information within 30 days, except as required for legal compliance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">11. Changes to This Privacy Policy</h2>
            <p className="text-zinc-300">
              We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you of material changes via email or through prominent notice on our platform. Your continued use after changes indicates acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">12. Contact Information</h2>
            <p className="text-zinc-300 mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-zinc-900 p-6 rounded-lg">
              <p className="text-zinc-300 mb-2"><strong>Email:</strong> privacy@baguri.ro</p>
              <p className="text-zinc-300 mb-2"><strong>Support:</strong> support@baguri.ro</p>
              <p className="text-zinc-300"><strong>Instagram:</strong> @baguri.ro</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">13. Specific Platform Features</h2>
            
            <h3 className="text-xl font-medium mb-3 text-white">13.1 Designer Verification</h3>
            <p className="text-zinc-300 mb-4">
              Our Instagram verification system helps prevent impersonation by requiring designers to authenticate with their Instagram accounts. This process:
            </p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
              <li>Verifies ownership of claimed Instagram accounts</li>
              <li>Stores verification status and basic profile information</li>
              <li>Displays verification badges to build customer trust</li>
              <li>Can be revoked at any time by the designer</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-white mt-6">13.2 Wallet and Earnings</h3>
            <p className="text-zinc-300 mb-4">
              For designers using our wallet system:
            </p>
            <ul className="list-disc list-inside text-zinc-300 space-y-2 ml-4">
              <li>We track earnings, commissions, and withdrawal requests</li>
              <li>Financial data is encrypted and securely stored</li>
              <li>Payment processing is handled by Stripe with PCI compliance</li>
              <li>Transaction history is maintained for accounting and tax purposes</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-white mt-6">13.3 Analytics and Performance</h3>
            <p className="text-zinc-300">
              We use Google Analytics and Microsoft Clarity to understand how users interact with our platform. This helps us identify popular features, optimize performance, and improve the overall user experience. You can opt out of analytics tracking through your browser settings or by using privacy extensions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
} 