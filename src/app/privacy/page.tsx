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
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-white mb-2">Personal Data Categories:</h4>
              <ul className="list-disc list-inside text-zinc-300 space-y-1 ml-4">
                <li><strong>Account Information:</strong> Email address, password, name, and profile details</li>
                <li><strong>Contact Data:</strong> Phone number, billing address, shipping address</li>
                <li><strong>Designer Profiles:</strong> Business information, portfolio images, social media handles, bio, and verification documents</li>
                <li><strong>Payment Information:</strong> Billing address and payment method details (processed securely by Stripe)</li>
                <li><strong>Communications:</strong> Messages sent through our platform, customer support inquiries, and email correspondence</li>
                <li><strong>Product Information:</strong> Product descriptions, images, pricing, and inventory details (for designers)</li>
                <li><strong>Transaction Data:</strong> Purchase history, order details, refund requests</li>
              </ul>
            </div>

            <h3 className="text-xl font-medium mb-3 text-white">2.2 Information Collected Automatically</h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-white mb-2">Technical Data:</h4>
              <ul className="list-disc list-inside text-zinc-300 space-y-1 ml-4">
                <li><strong>Usage Data:</strong> Pages visited, time spent on site, click patterns, and feature usage</li>
                <li><strong>Device Information:</strong> IP address, browser type, device type, operating system, screen resolution</li>
                <li><strong>Analytics Data:</strong> Website performance metrics collected through Google Analytics and Microsoft Clarity</li>
                <li><strong>Cookies and Tracking:</strong> Session data, preferences, authentication tokens, advertising IDs</li>
                <li><strong>Location Data:</strong> General location based on IP address (country/city level)</li>
              </ul>
            </div>

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
            <h2 className="text-2xl font-semibold mb-4 text-white">6. Your Rights and Choices (GDPR Compliance)</h2>
            
            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 mb-6">
              <h3 className="text-blue-200 font-semibold mb-2">🇪🇺 EU Data Protection Rights</h3>
              <p className="text-zinc-300 text-sm">
                Under the General Data Protection Regulation (GDPR), EU residents have specific rights regarding their personal data.
              </p>
            </div>

            <h3 className="text-xl font-medium mb-3 text-white">6.1 Your GDPR Rights</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">📋 Right of Access</h4>
                <p className="text-zinc-300 text-sm">Request a copy of all personal data we hold about you, including how it's used.</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">✏️ Right to Rectification</h4>
                <p className="text-zinc-300 text-sm">Correct any inaccurate or incomplete personal information.</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">🗑️ Right to Erasure</h4>
                <p className="text-zinc-300 text-sm">Request deletion of your personal data (subject to legal obligations).</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">📦 Right to Data Portability</h4>
                <p className="text-zinc-300 text-sm">Export your data in a structured, machine-readable format.</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">⛔ Right to Object</h4>
                <p className="text-zinc-300 text-sm">Object to processing based on legitimate interests or direct marketing.</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">⏸️ Right to Restriction</h4>
                <p className="text-zinc-300 text-sm">Request limitation of data processing in certain circumstances.</p>
              </div>
            </div>

            <h3 className="text-xl font-medium mb-3 text-white">6.2 How to Exercise Your Rights</h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
              <p className="text-zinc-300 mb-2">To exercise any of these rights, contact us at:</p>
              <ul className="list-disc list-inside text-zinc-300 space-y-1 ml-4">
                <li><strong>Email:</strong> privacy@baguri.ro</li>
                <li><strong>Subject Line:</strong> "GDPR Data Request - [Your Request Type]"</li>
                <li><strong>Include:</strong> Your account email and specific request details</li>
              </ul>
              <p className="text-zinc-300 mt-2 text-sm">
                We will respond to your request within 30 days. Some requests may require identity verification.
              </p>
            </div>

            <h3 className="text-xl font-medium mb-3 text-white">6.3 Data Protection Officer</h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
              <p className="text-zinc-300 mb-2">
                For data protection matters, you can contact our Data Protection Officer:
              </p>
              <p className="text-zinc-300">
                <strong>Email:</strong> dpo@baguri.ro<br/>
                <strong>Company:</strong> BAGURICO ENTERPRISE SRL<br/>
                <strong>Address:</strong> Romania
              </p>
            </div>

            <h3 className="text-xl font-medium mb-3 text-white">6.4 Supervisory Authority</h3>
            <p className="text-zinc-300 mb-4">
              If you believe we have not handled your data properly, you have the right to lodge a complaint with:
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
              <p className="text-zinc-300">
                <strong>National Supervisory Authority for Personal Data Processing (ANSPDCP)</strong><br/>
                Website: www.dataprotection.ro<br/>
                Email: anspdcp@dataprotection.ro
              </p>
            </div>

            <h3 className="text-xl font-medium mb-3 text-white">6.5 Marketing Communications</h3>
            <p className="text-zinc-300">
              You can opt out of promotional emails by clicking the unsubscribe link in any marketing email, 
              updating your account preferences, or contacting us directly at privacy@baguri.ro.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">7. Cookie Policy</h2>
            <p className="text-zinc-300 mb-6">
              This Cookie Policy explains how we use cookies and similar tracking technologies on our website. 
              By using our site, you consent to our use of cookies in accordance with this policy.
            </p>

            <h3 className="text-xl font-medium mb-3 text-white">7.1 What Are Cookies?</h3>
            <p className="text-zinc-300 mb-4">
              Cookies are small text files stored on your device when you visit a website. They help websites remember 
              information about your visit, making your next visit easier and the site more useful to you.
            </p>

            <h3 className="text-xl font-medium mb-3 text-white">7.2 Types of Cookies We Use</h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">🔧 Essential Cookies (Always Active)</h4>
                <p className="text-zinc-300 text-sm mb-2">These cookies are necessary for the website to function properly and cannot be switched off.</p>
                <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1 ml-4">
                  <li>Authentication and session management</li>
                  <li>Security and fraud prevention</li>
                  <li>Load balancing and site functionality</li>
                  <li>Shopping cart and checkout process</li>
                </ul>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">📊 Analytics Cookies</h4>
                <p className="text-zinc-300 text-sm mb-2">Help us understand how visitors interact with our website by collecting information anonymously.</p>
                <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1 ml-4">
                  <li>Google Analytics - Website traffic and user behavior</li>
                  <li>Microsoft Clarity - User session recordings and heatmaps</li>
                  <li>Performance monitoring and error tracking</li>
                  <li>A/B testing and optimization</li>
                </ul>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">🎯 Marketing Cookies</h4>
                <p className="text-zinc-300 text-sm mb-2">Used to track visitors across websites and show relevant advertisements.</p>
                <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1 ml-4">
                  <li>Social media integration (Instagram, TikTok)</li>
                  <li>Advertising campaign tracking</li>
                  <li>Retargeting and remarketing</li>
                  <li>Conversion tracking</li>
                </ul>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">⚙️ Functional Cookies</h4>
                <p className="text-zinc-300 text-sm mb-2">Enable enhanced functionality and personalization.</p>
                <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1 ml-4">
                  <li>Language and region preferences</li>
                  <li>Theme and display preferences</li>
                  <li>Personalized content recommendations</li>
                  <li>User interface customizations</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-medium mb-3 text-white">7.3 Cookie Duration</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Session Cookies</h4>
                <p className="text-zinc-300 text-sm">Temporary cookies that expire when you close your browser.</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Persistent Cookies</h4>
                <p className="text-zinc-300 text-sm">Remain on your device for a set period (typically 30 days to 2 years).</p>
              </div>
            </div>

            <h3 className="text-xl font-medium mb-3 text-white">7.4 Managing Your Cookie Preferences</h3>
            <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4 mb-4">
              <p className="text-amber-200 font-semibold mb-2">Cookie Consent Management</p>
              <p className="text-zinc-300 text-sm">
                You can manage your cookie preferences at any time by clicking the "Cookie Settings" link in our footer 
                or by adjusting your browser settings.
              </p>
            </div>
            
            <h4 className="font-semibold text-white mb-2">Browser Settings</h4>
            <p className="text-zinc-300 mb-4">You can control cookies through your browser settings:</p>
            <ul className="list-disc list-inside text-zinc-300 space-y-1 ml-4 mb-4">
              <li><strong>Chrome:</strong> Settings {`>`} Privacy and Security {`>`} Cookies and other site data</li>
              <li><strong>Firefox:</strong> Preferences {`>`} Privacy & Security {`>`} Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences {`>`} Privacy {`>`} Manage Website Data</li>
              <li><strong>Edge:</strong> Settings {`>`} Cookies and site permissions</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 text-white">7.5 Third-Party Cookies</h3>
            <p className="text-zinc-300 mb-4">
              Some cookies are set by third-party services that appear on our pages:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Google Services</h4>
                <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1 ml-4">
                  <li>Google Analytics</li>
                  <li>Google Fonts</li>
                  <li>Google Maps (if used)</li>
                </ul>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Other Services</h4>
                <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1 ml-4">
                  <li>Microsoft Clarity</li>
                  <li>Stripe (payment processing)</li>
                  <li>Social media platforms</li>
                </ul>
              </div>
            </div>
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
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">Data Protection Contacts</h3>
                  <p className="text-zinc-300 mb-2"><strong>Privacy:</strong> privacy@baguri.ro</p>
                  <p className="text-zinc-300 mb-2"><strong>Data Protection Officer:</strong> dpo@baguri.ro</p>
                  <p className="text-zinc-300 mb-2"><strong>Support:</strong> support@baguri.ro</p>
                  <p className="text-zinc-300"><strong>Legal:</strong> legal@baguri.ro</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-3">Company Information</h3>
                  <p className="text-zinc-300 mb-2"><strong>Company:</strong> BAGURICO ENTERPRISE SRL</p>
                  <p className="text-zinc-300 mb-2"><strong>CUI:</strong> 42743310</p>
                  <p className="text-zinc-300 mb-2"><strong>Reg. Com.:</strong> J40/7675/2020</p>
                  <p className="text-zinc-300 mb-2"><strong>Address:</strong> Romania</p>
                  <p className="text-zinc-300"><strong>Instagram:</strong> @baguri.ro</p>
                </div>
              </div>
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