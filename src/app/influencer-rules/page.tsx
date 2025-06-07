"use client";

import Link from 'next/link';
import { ArrowLeft, Users, Heart, Video, CheckCircle, AlertTriangle } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";

export default function InfluencerRules() {
  return (
    <div className="min-h-screen bg-black text-white relative">
      <BackgroundPaths />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-zinc-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link 
                href="/main"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
              >
                <ArrowLeft size={20} />
                <span>Back to Main</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users size={28} className="text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Influencer Program Requirements
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Join our exclusive network of TikTok creators promoting authentic Romanian fashion. 
              Make sure you meet our requirements before applying.
            </p>
          </div>

          {/* Requirements Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <CheckCircle size={24} className="text-green-400" />
              Minimum Requirements
            </h2>
            
            <div className="space-y-6">
              {/* Followers Requirement */}
              <div className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-lg">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-1">
                    10,000+ Followers
                  </h3>
                  <p className="text-zinc-400">
                    You must have at least <strong className="text-white">10,000 followers</strong> on your TikTok account to ensure adequate reach for our partner brands.
                  </p>
                </div>
              </div>

              {/* Likes Requirement */}
              <div className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-lg">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-1">
                    100,000+ Total Likes
                  </h3>
                  <p className="text-zinc-400">
                    Your account should have accumulated at least <strong className="text-white">100,000 total likes</strong> across all your videos, demonstrating strong engagement.
                  </p>
                </div>
              </div>

              {/* Videos Requirement */}
              <div className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-lg">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Video size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-1">
                    5+ Videos Posted
                  </h3>
                  <p className="text-zinc-400">
                    You must have posted at least <strong className="text-white">5 videos</strong> on your TikTok account to show content creation consistency.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle size={24} className="text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Important Notice</h3>
                <p className="text-yellow-100/90">
                  We will verify these requirements after you connect your TikTok account. 
                  Accounts that don&apos;t meet the minimum criteria will not be approved for the influencer program.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">What You&apos;ll Get</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold">15%</span>
                </div>
                <h3 className="font-semibold mb-2">High Commission Rate</h3>
                <p className="text-zinc-400 text-sm">Earn up to 15% commission on every sale you generate</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users size={20} />
                </div>
                <h3 className="font-semibold mb-2">Exclusive Access</h3>
                <p className="text-zinc-400 text-sm">Early access to new collections and designer partnerships</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/influencer-auth"
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition text-center"
            >
              <Users size={20} />
              I Meet the Requirements - Connect TikTok
            </Link>
            <Link
              href="/main"
              className="flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-8 py-3 rounded-lg font-medium transition text-center"
            >
              Back to Main Page
            </Link>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-8 text-zinc-500">
            <p className="text-sm">
              Questions about the influencer program? Contact us at{' '}
              <a href="mailto:influencers@baguri.ro" className="text-purple-400 hover:text-purple-300 transition">
                influencers@baguri.ro
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 