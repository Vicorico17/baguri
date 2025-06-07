"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Music } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";

export default function InfluencerAuth() {
  const [loading, setLoading] = useState(false);

  const handleTikTokLogin = async () => {
    setLoading(true);
    try {
      // Redirect to TikTok OAuth endpoint
      window.location.href = '/api/auth/tiktok';
    } catch (error) {
      console.error('TikTok login error:', error);
      setLoading(false);
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
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Join as TikTok Influencer
            </h1>
            <p className="text-zinc-400 text-lg">
              Connect your TikTok and start promoting Romanian designers
            </p>
            <p className="text-zinc-500 text-sm mt-2">
              Earn up to 15% commission on every sale you generate
            </p>
          </div>

          {/* TikTok Login */}
          <button
            onClick={handleTikTokLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-blue-500/20 group-hover:from-red-500/30 group-hover:to-blue-500/30 transition-all duration-300"></div>
            <div className="relative flex items-center gap-3">
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Music size={20} />
              )}
              <span className="text-lg font-semibold">Continue with TikTok</span>
            </div>
          </button>

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