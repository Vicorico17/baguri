"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Music, AlertTriangle, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function InfluencerAuthContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams?.get('error');
    
    if (errorParam) {
      switch (errorParam) {
        case 'callback_failed':
          setError('TikTok connection failed. This could be due to a temporary issue with TikTok servers or your account permissions. Please try again.');
          break;
        case 'tiktok_denied':
          setError('TikTok authorization was denied. You need to authorize Baguri to access your TikTok profile to become an influencer.');
          break;
        case 'no_code':
          setError('TikTok authorization incomplete. Please try connecting again.');
          break;
        case 'config_error':
          setError('TikTok integration is temporarily unavailable. Please contact support.');
          break;
        case 'url_generation_failed':
          setError('Unable to connect to TikTok. Please check your internet connection and try again.');
          break;
        case 'auth_invalid':
          setError('TikTok authentication failed. Your session may have expired. Please try again.');
          break;
        case 'auth_forbidden':
          setError('TikTok denied access. Please ensure your TikTok account is in good standing and try again.');
          break;
        case 'token_error':
          setError('TikTok token exchange failed. This may be a temporary issue with TikTok servers. Please try again in a few minutes.');
          break;
        case 'profile_error':
          setError('Unable to fetch your TikTok profile. Please ensure your account privacy settings allow app access.');
          break;
        case 'network_error':
          setError('Network connection failed. Please check your internet connection and try again.');
          break;
        case 'privacy_restricted':
          setError('Unable to access your TikTok profile due to privacy settings. Please ensure your TikTok account is set to public or allows third-party app access, then try again.');
          break;
        default:
          setError('An unexpected error occurred. Please try again or contact support.');
      }
    }
  }, [searchParams]);

  const handleTikTokLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Clear any previous errors from URL
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('error');
      window.history.replaceState({}, '', currentUrl.toString());
      
      // Redirect to TikTok OAuth endpoint
      window.location.href = '/api/auth/tiktok';
    } catch (error) {
      console.error('TikTok login error:', error);
      setError('Failed to initiate TikTok connection. Please try again.');
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('error');
    window.history.replaceState({}, '', currentUrl.toString());
  };

  return (
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
              <button 
                onClick={clearError}
                className="text-red-400 hover:text-red-300 transition ml-2"
                title="Dismiss"
              >
                ×
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleTikTokLogin}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-700/50 hover:bg-red-700/70 rounded text-sm font-medium transition disabled:opacity-50"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            </div>
          </div>
        )}

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
  );
} 