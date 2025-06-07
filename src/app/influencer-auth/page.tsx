"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Instagram, Music } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";

export default function InfluencerAuth() {
  const [loading, setLoading] = useState<'instagram' | 'tiktok' | null>(null);

  const handleInstagramLogin = async () => {
    setLoading('instagram');
    try {
      // Redirect to Instagram OAuth endpoint
      window.location.href = '/api/auth/instagram';
    } catch (error) {
      console.error('Instagram login error:', error);
      setLoading(null);
    }
  };

  const handleTikTokLogin = async () => {
    setLoading('tiktok');
    try {
      // Redirect to TikTok OAuth endpoint
      window.location.href = '/api/auth/tiktok';
    } catch (error) {
      console.error('TikTok login error:', error);
      setLoading(null);
    }
  };

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
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Join as Influencer
            </h1>
            <p className="text-zinc-400 text-lg">
              Connect your social media and start promoting Romanian designers
            </p>
            <p className="text-zinc-500 text-sm mt-2">
              Earn commissions on every sale you generate
            </p>
          </div>

          <div className="space-y-4">
            {/* Instagram Login */}
            <button
              onClick={handleInstagramLogin}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300"></div>
              <div className="relative flex items-center gap-3">
                {loading === 'instagram' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Instagram size={20} />
                )}
                <span className="text-lg">Continue with Instagram</span>
              </div>
            </button>

            {/* TikTok Login */}
            <button
              onClick={handleTikTokLogin}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-3">
                {loading === 'tiktok' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Music size={20} />
                )}
                <span className="text-lg">Continue with TikTok</span>
              </div>
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-sm mb-4">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
            
            <div className="border-t border-zinc-800 pt-6">
              <h3 className="text-lg font-semibold mb-3">Why become a Baguri Influencer?</h3>
              <div className="space-y-2 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  <span>Earn up to 15% commission on every sale</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div>
                  <span>Promote authentic Romanian fashion</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  <span>Get exclusive access to new collections</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span>Real-time analytics and earnings tracking</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alternative Options */}
          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-sm">
              Looking to sell your designs?{' '}
              <Link href="/designer-auth" className="text-purple-400 hover:text-purple-300 transition">
                Join as Designer
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 