"use client";

import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white relative">
      <BackgroundPaths />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link 
                  href="/"
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
                >
                  <ArrowLeft size={20} />
                  <span>Back to Home</span>
                </Link>
                <div className="h-6 w-px bg-zinc-700" />
                <div className="flex items-center gap-2">
                  <FileText size={24} />
                  <h1 className="text-xl font-bold">Terms of Service</h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-invert prose-zinc max-w-none">
            
            {/* Introduction */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                Terms of Service
              </h1>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <div className="mt-6 p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
                <p className="text-zinc-300 leading-relaxed">
                  Welcome to Baguri, Romania&apos;s premier fashion marketplace. These Terms of Service govern 
                  your use of our platform, including our website, services, and mobile applications. 
                  By accessing or using Baguri, you agree to be bound by these Terms.
                </p>
              </div>
            </div>

            {/* Acceptance of Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">1. Acceptance of Terms</h2>
              <div className="text-zinc-300 space-y-4">
                <p>
                  By accessing or using Baguri, you acknowledge that you have read, understood, and agree to be bound by these Terms. 
                  If you do not agree to these Terms, you may not access or use our Platform.
                </p>
                <p>
                  You must be at least 18 years old to use our Platform. If you are under 18, you may only use Baguri 
                  with the involvement and consent of a parent or guardian.
                </p>
              </div>
            </section>

            {/* Platform Description */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">2. Platform Description</h2>
              <div className="text-zinc-300 space-y-4">
                <p>
                  Baguri is an online marketplace specializing in Romanian fashion design. Our Platform connects:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Romanian fashion designers who want to sell their creations</li>
                  <li>Influencers who promote fashion products through social media</li>
                  <li>Customers who seek unique, authentic Romanian fashion pieces</li>
                </ul>
                <p>
                  We facilitate transactions but are not a party to the actual sale between Designers and Buyers.
                </p>
              </div>
            </section>

            {/* User Accounts */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">3. User Accounts</h2>
              <div className="text-zinc-300 space-y-4">
                <h3 className="text-lg font-semibold text-white">Account Creation</h3>
                <p>To access certain features, you must create an account. You agree to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-white mt-6">Account Types</h3>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Designer Account</h4>
                    <p className="text-sm">Create and sell fashion products with commission-based earnings.</p>
                  </div>
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Influencer Account</h4>
                    <p className="text-sm">Promote products via social media and earn referral commissions.</p>
                  </div>
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Buyer Account</h4>
                    <p className="text-sm">Browse and purchase unique Romanian fashion pieces.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Designer Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">4. Designer Terms</h2>
              <div className="text-zinc-300 space-y-6">
                <h3 className="text-lg font-semibold text-white">Product Listings</h3>
                <p>As a Designer, you agree to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide accurate product descriptions, images, and pricing</li>
                  <li>Only list products you have the right to sell</li>
                  <li>Maintain adequate inventory for listed items</li>
                  <li>Honor all sales made through the Platform</li>
                </ul>

                <h3 className="text-lg font-semibold text-white">Commission Structure</h3>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <p>Baguri retains a platform fee from each sale:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Platform fee: Variable based on subscription tier</li>
                    <li>Payment processing: Industry-standard rates</li>
                    <li>Influencer commissions: Deducted when applicable</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Influencer Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">5. Influencer Terms</h2>
              <div className="text-zinc-300 space-y-6">
                <h3 className="text-lg font-semibold text-white">Promotional Requirements</h3>
                <p>As an Influencer, you must:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Clearly disclose sponsored content and affiliate relationships</li>
                  <li>Comply with FTC guidelines and local advertising laws</li>
                  <li>Only promote products you genuinely support</li>
                  <li>Use provided tracking links for commission attribution</li>
                </ul>

                <h3 className="text-lg font-semibold text-white">Commission Earnings</h3>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <p>Commission rates:</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Standard rate: 5-15% of product sale price</li>
                    <li>Minimum payout threshold: 100 RON</li>
                    <li>Payment schedule: Monthly, within 30 days</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Payments & Fees */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">6. Payments & Fees</h2>
              <div className="text-zinc-300 space-y-4">
                <p>
                  All payments are processed securely through our payment partners. We accept major credit cards, 
                  digital wallets, and bank transfers where available.
                </p>
                <p>
                  Designer earnings are calculated after deducting platform fees and any applicable commissions. 
                  Payouts are processed weekly, subject to a minimum threshold.
                </p>
              </div>
            </section>

            {/* Sales Conditions */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">7. Sales Conditions</h2>
              <div className="text-zinc-300 space-y-6">
                <h3 className="text-lg font-semibold text-white">7.1 Payment</h3>
                <p>
                  We accept the following payment methods:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Credit and debit cards (Visa, Mastercard, American Express)</li>
                  <li>Digital wallets (Apple Pay, Google Pay)</li>
                  <li>Bank transfers (where available)</li>
                  <li>Other payment methods as displayed at checkout</li>
                </ul>
                <p>
                  Payment is processed securely through Stripe. All prices are displayed in Romanian Lei (RON) and include applicable VAT.
                </p>

                <h3 className="text-lg font-semibold text-white">7.2 Delivery</h3>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <p className="mb-2"><strong>Delivery Times:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Romania: 2-5 business days</li>
                    <li>EU: 5-10 business days</li>
                    <li>International: 7-15 business days</li>
                  </ul>
                  <p className="mt-4"><strong>Shipping Costs:</strong> Calculated at checkout based on destination and package weight.</p>
                </div>

                <h3 className="text-lg font-semibold text-white">7.3 Returns and Refunds</h3>
                <p>
                  You have the right to return products within 14 days of delivery for a full refund, provided:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Items are in original condition with tags attached</li>
                  <li>Items are unworn and unwashed</li>
                  <li>Original packaging is included</li>
                  <li>Return is initiated through your account dashboard</li>
                </ul>
                <p>
                  Custom or personalized items cannot be returned unless defective. Refunds are processed within 5-10 business days to the original payment method.
                </p>

                <h3 className="text-lg font-semibold text-white">7.4 Guarantees and Warranties</h3>
                <p>
                  All products sold through Baguri come with:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Legal guarantee for conformity (2 years in EU)</li>
                  <li>Quality assurance from verified designers</li>
                  <li>Protection against manufacturing defects</li>
                  <li>Customer support for any product issues</li>
                </ul>
              </div>
            </section>

            {/* Rights and Obligations */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">8. Rights and Obligations</h2>
              <div className="text-zinc-300 space-y-6">
                <h3 className="text-lg font-semibold text-white">8.1 Customer Rights</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Right to accurate product information and descriptions</li>
                  <li>Right to return products within legal timeframe</li>
                  <li>Right to data protection and privacy</li>
                  <li>Right to customer support and assistance</li>
                  <li>Right to dispute resolution through ANPC and EU ODR</li>
                </ul>

                <h3 className="text-lg font-semibold text-white">8.2 Customer Obligations</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide accurate information during registration and checkout</li>
                  <li>Use the platform in accordance with these Terms</li>
                  <li>Respect intellectual property rights</li>
                  <li>Pay for purchases in full and on time</li>
                  <li>Report any issues or concerns promptly</li>
                </ul>

                <h3 className="text-lg font-semibold text-white">8.3 Merchant Rights</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Right to set product prices and availability</li>
                  <li>Right to refuse service for violations of Terms</li>
                  <li>Right to protect intellectual property</li>
                  <li>Right to collect and process necessary data</li>
                </ul>

                <h3 className="text-lg font-semibold text-white">8.4 Merchant Obligations</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide accurate product information</li>
                  <li>Honor all confirmed orders</li>
                  <li>Protect customer data and privacy</li>
                  <li>Comply with consumer protection laws</li>
                  <li>Provide customer support and assistance</li>
                </ul>
              </div>
            </section>

            {/* Pricing Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">9. Pricing Policy and Offers</h2>
              <div className="text-zinc-300 space-y-4">
                <p>
                  All prices displayed on Baguri include applicable VAT and are in Romanian Lei (RON) unless otherwise specified.
                </p>
                <h3 className="text-lg font-semibold text-white">9.1 Price Changes</h3>
                <p>
                  Prices may change without notice, but confirmed orders are honored at the price shown at time of purchase.
                </p>
                <h3 className="text-lg font-semibold text-white">9.2 Special Offers</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Promotional prices are valid for the specified period only</li>
                  <li>Discount codes cannot be combined unless explicitly stated</li>
                  <li>We reserve the right to limit quantities on sale items</li>
                  <li>Offers may be subject to additional terms and conditions</li>
                </ul>
              </div>
            </section>

            {/* Legal Responsibilities */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">10. Legal Responsibilities</h2>
              <div className="text-zinc-300 space-y-4">
                <h3 className="text-lg font-semibold text-white">10.1 Consumer Protection</h3>
                <p>
                  Baguri complies with Romanian and EU consumer protection laws, including Law 449/2003 on product liability and Law 296/2004 on the consumer code.
                </p>
                <h3 className="text-lg font-semibold text-white">10.2 Dispute Resolution</h3>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <p className="mb-2">For consumer disputes, you can contact:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>ANPC (National Authority for Consumer Protection):</strong> anpc.ro</li>
                    <li><strong>EU Online Dispute Resolution:</strong> ec.europa.eu/consumers/odr</li>
                    <li><strong>Local consumer protection offices</strong></li>
                  </ul>
                </div>
                <h3 className="text-lg font-semibold text-white">10.3 Company Information</h3>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <p><strong>Company:</strong> BAGURICO ENTERPRISE SRL</p>
                  <p><strong>CUI:</strong> 42743310</p>
                  <p><strong>Reg. Com.:</strong> J40/7675/2020</p>
                  <p><strong>Legal Address:</strong> Romania</p>
                  <p><strong>Contact:</strong> legal@baguri.ro</p>
                </div>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">11. Intellectual Property</h2>
              <div className="text-zinc-300 space-y-4">
                <p>
                  Designers retain ownership of their intellectual property but grant Baguri a limited license 
                  to display, promote, and facilitate sales of their products on the Platform.
                </p>
                <p>
                  Baguri owns all rights to the Platform&apos;s design, functionality, trademarks, and proprietary content.
                </p>
              </div>
            </section>

            {/* Prohibited Conduct */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">12. Prohibited Conduct</h2>
              <div className="text-zinc-300">
                <p className="mb-4">Users are prohibited from:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p>• Listing counterfeit products</p>
                    <p>• Engaging in fraudulent activities</p>
                    <p>• Violating intellectual property rights</p>
                    <p>• Manipulating reviews or ratings</p>
                  </div>
                  <div className="space-y-2">
                    <p>• Uploading malicious content</p>
                    <p>• Harassing other users</p>
                    <p>• Attempting to hack the Platform</p>
                    <p>• Violating applicable laws</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Disclaimers */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">13. Disclaimers</h2>
              <div className="text-zinc-300 space-y-4">
                <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                  <p className="font-semibold text-yellow-400 mb-2">Important Notice</p>
                  <p>
                    THE PLATFORM IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. 
                    BAGURI DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED.
                  </p>
                </div>
                <p>
                  We are not responsible for the content, quality, or legality of products listed by Designers.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">14. Limitation of Liability</h2>
              <div className="text-zinc-300 space-y-4">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, BAGURI SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                  INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES.
                </p>
                <p>
                  Our total liability shall not exceed the total amount paid by you to Baguri in the 
                  12 months preceding the claim.
                </p>
              </div>
            </section>

            {/* Termination */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">15. Termination</h2>
              <div className="text-zinc-300 space-y-4">
                <p>You may terminate your account at any time by contacting our support team.</p>
                <p>We may suspend or terminate your account for violation of these Terms or at our sole discretion.</p>
              </div>
            </section>

            {/* Governing Law */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">16. Governing Law</h2>
              <div className="text-zinc-300 space-y-4">
                <p>
                  These Terms are governed by the laws of Romania. Any disputes will be subject to the 
                  exclusive jurisdiction of Romanian courts.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">17. Contact Information</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <p className="text-zinc-300 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-zinc-300">
                  <p><strong>Email:</strong> legal@baguri.ro</p>
                  <p><strong>Website:</strong> www.baguri.ro</p>
                  <p><strong>Address:</strong> Romania</p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-zinc-800 pt-8 text-center">
              <p className="text-zinc-500 text-sm">
                © {new Date().getFullYear()} Baguri. All rights reserved. Romanian fashion, reimagined.
              </p>
              <div className="mt-4 flex justify-center gap-6">
                <Link href="/privacy-policy" className="text-zinc-400 hover:text-white text-sm transition">
                  Privacy Policy
                </Link>
                <Link href="/contact" className="text-zinc-400 hover:text-white text-sm transition">
                  Contact Us
                </Link>
                <Link href="/" className="text-zinc-400 hover:text-white text-sm transition">
                  Home
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
} 