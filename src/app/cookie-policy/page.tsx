"use client";

import Link from 'next/link';
import { ArrowLeft, Cookie } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";

export default function CookiePolicy() {
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
                  <Cookie size={24} />
                  <h1 className="text-xl font-bold">Cookie Policy</h1>
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
                Cookie Policy
              </h1>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <div className="mt-6 p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
                <p className="text-zinc-300 leading-relaxed">
                  This Cookie Policy explains how Baguri uses cookies and similar tracking technologies 
                  when you visit our website. By using our site, you consent to our use of cookies 
                  in accordance with this policy.
                </p>
              </div>
            </div>

            {/* What Are Cookies */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">1. What Are Cookies?</h2>
              <div className="text-zinc-300 space-y-4">
                <p>
                  Cookies are small text files that are placed on your device (computer, smartphone, or tablet) 
                  when you visit a website. They are widely used to make websites work more efficiently, 
                  as well as to provide information to website owners.
                </p>
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                  <h3 className="text-blue-200 font-semibold mb-2">🍪 Cookie Basics</h3>
                  <ul className="list-disc list-inside text-zinc-300 space-y-1 ml-4">
                    <li>Cookies remember your preferences and settings</li>
                    <li>They help websites function properly</li>
                    <li>They enable personalized experiences</li>
                    <li>They provide analytics data to improve services</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Types of Cookies */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">2. Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">🔧 Essential Cookies (Always Active)</h3>
                  <p className="text-zinc-300 mb-4">
                    These cookies are necessary for the website to function and cannot be switched off in our systems.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Authentication</h4>
                      <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1 ml-4">
                        <li>User login sessions</li>
                        <li>Account security tokens</li>
                        <li>Remember login status</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Functionality</h4>
                      <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1 ml-4">
                        <li>Shopping cart contents</li>
                        <li>Form data preservation</li>
                        <li>Security features</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">📊 Analytics Cookies</h3>
                  <p className="text-zinc-300 mb-4">
                    Help us understand how visitors interact with our website by collecting information anonymously.
                  </p>
                  <div className="space-y-4">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-white mb-1">Google Analytics</h4>
                      <p className="text-zinc-300 text-sm">Tracks website usage, page views, and user behavior patterns</p>
                    </div>
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-white mb-1">Microsoft Clarity</h4>
                      <p className="text-zinc-300 text-sm">Records user sessions and creates heatmaps for UX improvement</p>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">🎯 Marketing Cookies</h3>
                  <p className="text-zinc-300 mb-4">
                    Used to track visitors across websites and display relevant advertisements.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Social Media</h4>
                      <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1 ml-4">
                        <li>Instagram integration</li>
                        <li>TikTok widgets</li>
                        <li>Social sharing buttons</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">Advertising</h4>
                      <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1 ml-4">
                        <li>Retargeting campaigns</li>
                        <li>Conversion tracking</li>
                        <li>Ad personalization</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">⚙️ Functional Cookies</h3>
                  <p className="text-zinc-300 mb-4">
                    Enable enhanced functionality and personalization features.
                  </p>
                  <ul className="list-disc list-inside text-zinc-300 space-y-1 ml-4">
                    <li>Language and region preferences</li>
                    <li>Theme and display settings</li>
                    <li>Personalized product recommendations</li>
                    <li>User interface customizations</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Cookie Duration */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">3. Cookie Duration</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">⏱️ Session Cookies</h3>
                  <p className="text-zinc-300 mb-4">
                    Temporary cookies that are deleted when you close your browser.
                  </p>
                  <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1 ml-4">
                    <li>Login sessions</li>
                    <li>Shopping cart data</li>
                    <li>Form submissions</li>
                    <li>Security tokens</li>
                  </ul>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">📅 Persistent Cookies</h3>
                  <p className="text-zinc-300 mb-4">
                    Remain on your device for a specified period or until manually deleted.
                  </p>
                  <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1 ml-4">
                    <li>User preferences (30 days)</li>
                    <li>Analytics data (2 years)</li>
                    <li>Marketing tracking (1 year)</li>
                    <li>Remember me settings (90 days)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Managing Cookies */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">4. Managing Your Cookie Preferences</h2>
              
              <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-6 mb-6">
                <h3 className="text-amber-200 font-semibold mb-3">🔧 Cookie Settings</h3>
                <p className="text-zinc-300 mb-4">
                  You can manage your cookie preferences at any time. Note that disabling certain 
                  cookies may affect website functionality.
                </p>
                <button className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg font-medium transition">
                  Manage Cookie Preferences
                </button>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">Browser Settings</h3>
              <p className="text-zinc-300 mb-4">
                You can also control cookies through your browser settings:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">🌐 Chrome</h4>
                  <p className="text-zinc-300 text-sm">Settings {`>`} Privacy and Security {`>`} Cookies and other site data</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">🦊 Firefox</h4>
                  <p className="text-zinc-300 text-sm">Preferences {`>`} Privacy & Security {`>`} Cookies and Site Data</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">🧭 Safari</h4>
                  <p className="text-zinc-300 text-sm">Preferences {`>`} Privacy {`>`} Manage Website Data</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">🌊 Edge</h4>
                  <p className="text-zinc-300 text-sm">Settings {`>`} Cookies and site permissions</p>
                </div>
              </div>
            </section>

            {/* Third-Party Cookies */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">5. Third-Party Cookies</h2>
              <div className="text-zinc-300 space-y-4">
                <p>
                  Some cookies are set by third-party services that appear on our pages. We have no control 
                  over these cookies, and they are subject to the privacy policies of the respective third parties.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3">Google Services</h4>
                    <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1 ml-4">
                      <li>Google Analytics</li>
                      <li>Google Fonts</li>
                      <li>YouTube embeds</li>
                      <li>Google Maps</li>
                    </ul>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3">Social Media</h4>
                    <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1 ml-4">
                      <li>Instagram widgets</li>
                      <li>TikTok embeds</li>
                      <li>Social share buttons</li>
                      <li>Login integrations</li>
                    </ul>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3">Other Services</h4>
                    <ul className="list-disc list-inside text-zinc-300 text-sm space-y-1 ml-4">
                      <li>Microsoft Clarity</li>
                      <li>Stripe payments</li>
                      <li>Supabase analytics</li>
                      <li>CDN providers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Updates */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">6. Updates to This Policy</h2>
              <div className="text-zinc-300 space-y-4">
                <p>
                  We may update this Cookie Policy from time to time to reflect changes in our practices 
                  or for other operational, legal, or regulatory reasons.
                </p>
                <p>
                  When we make changes, we will update the &quot;Last updated&quot; date at the top of this policy 
                  and notify users through prominent notices on our website.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">7. Contact Us</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <p className="text-zinc-300 mb-4">
                  If you have questions about our use of cookies, please contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-zinc-300 mb-2"><strong>Email:</strong> privacy@baguri.ro</p>
                    <p className="text-zinc-300 mb-2"><strong>Subject:</strong> Cookie Policy Inquiry</p>
                  </div>
                  <div>
                    <p className="text-zinc-300 mb-2"><strong>Company:</strong> BAGURICO ENTERPRISE SRL</p>
                    <p className="text-zinc-300 mb-2"><strong>CUI:</strong> 42743310</p>
                    <p className="text-zinc-300"><strong>Reg. Com.:</strong> J40/7675/2020</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-zinc-800 pt-8 text-center">
              <p className="text-zinc-500 text-sm">
                © {new Date().getFullYear()} Baguri. All rights reserved. Romanian fashion, reimagined.
              </p>
              <div className="mt-4 flex justify-center gap-6">
                <Link href="/privacy" className="text-zinc-400 hover:text-white text-sm transition">
                  Privacy Policy
                </Link>
                <Link href="/terms-of-service" className="text-zinc-400 hover:text-white text-sm transition">
                  Terms of Service
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