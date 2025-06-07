"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Instagram, Music, Users, DollarSign, TrendingUp, Eye, Share2, CheckCircle, Heart, Video } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";

function InfluencerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [platform, setPlatform] = useState<'instagram' | 'tiktok' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tiktokData, setTiktokData] = useState<{
    name: string;
    username: string;
    followers: number;
    likes: number;
    videos: number;
  } | null>(null);

  useEffect(() => {
    if (!searchParams) return;
    
    const platformParam = searchParams.get('platform') as 'instagram' | 'tiktok' | null;
    const success = searchParams.get('success');
    
    if (platformParam && (platformParam === 'instagram' || platformParam === 'tiktok')) {
      setPlatform(platformParam);
    }

    // Get TikTok data from URL parameters
    if (platformParam === 'tiktok') {
      const name = searchParams.get('name') || 'TikTok User';
      const username = searchParams.get('username') || '';
      const followers = parseInt(searchParams.get('followers') || '0');
      const likes = parseInt(searchParams.get('likes') || '0');
      const videos = parseInt(searchParams.get('videos') || '0');

      setTiktokData({
        name,
        username,
        followers,
        likes,
        videos
      });
    }
    
    if (success === 'true') {
      setShowSuccess(true);
      // Remove URL parameters after showing success
      setTimeout(() => {
        setShowSuccess(false);
        router.replace('/influencer-dashboard');
      }, 3000);
    }
  }, [searchParams, router]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram size={20} className="text-purple-400" />;
      case 'tiktok': return <Music size={20} className="text-red-400" />;
      default: return <Users size={20} className="text-blue-400" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'from-purple-600 to-pink-600';
      case 'tiktok': return 'from-red-600 to-blue-600';
      default: return 'from-blue-600 to-purple-600';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <BackgroundPaths />
      
      <div className="relative z-10">
        {/* Success Notification */}
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 bg-green-600 border border-green-500 rounded-lg p-4 shadow-lg animate-slide-in">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-300" />
              <div>
                <p className="font-medium">Account Connected!</p>
                <p className="text-sm text-green-200">
                  Your {platform} account has been successfully linked.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link 
                  href="/main"
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
                >
                  <ArrowLeft size={20} />
                  <span>Back to Main</span>
                </Link>
                <div className="h-6 w-px bg-zinc-700" />
                <div className="flex items-center gap-2">
                  <Users size={24} />
                  <h1 className="text-xl font-bold">Influencer Dashboard</h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome to Baguri Influencer Program!</h2>
            <p className="text-zinc-400">
              You&apos;re now part of our exclusive network promoting Romanian fashion designers.
            </p>
          </div>

          {/* Connected Platform */}
          {platform && (
            <div className="mb-8">
              <div className={`bg-gradient-to-r ${getPlatformColor(platform)} rounded-lg p-6 border border-opacity-20`}>
                <div className="flex items-center gap-3 mb-4">
                  {getPlatformIcon(platform)}
                  <h3 className="text-lg font-semibold capitalize">{platform} Connected</h3>
                </div>
                <p className="text-white/90 mb-4">
                  Your {platform} account is now linked and ready to start earning commissions!
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle size={16} />
                    <span>Profile Verified</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle size={16} />
                    <span>Commission Tracking Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TikTok Account Information */}
          {platform === 'tiktok' && tiktokData && (
            <div className="mb-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                  <Music size={24} className="text-red-400" />
                  TikTok Account Data
                </h3>
                
                <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Users size={20} className="text-blue-400" />
                    <span className="font-medium">{tiktokData.name}</span>
                  </div>
                  {tiktokData.username && (
                    <p className="text-zinc-400 text-sm">@{tiktokData.username}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Followers */}
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users size={20} className="text-white" />
                    </div>
                    <div className="text-2xl font-bold text-blue-400 mb-1">
                      {tiktokData.followers.toLocaleString()}
                    </div>
                    <div className="text-zinc-400 text-sm">Followers</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {tiktokData.followers >= 10000 ? '✅ Meets requirement' : '❌ Need 10,000+'}
                    </div>
                  </div>

                  {/* Likes */}
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart size={20} className="text-white" />
                    </div>
                    <div className="text-2xl font-bold text-red-400 mb-1">
                      {tiktokData.likes.toLocaleString()}
                    </div>
                    <div className="text-zinc-400 text-sm">Total Likes</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {tiktokData.likes >= 100000 ? '✅ Meets requirement' : '❌ Need 100,000+'}
                    </div>
                  </div>

                  {/* Videos */}
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Video size={20} className="text-white" />
                    </div>
                    <div className="text-2xl font-bold text-purple-400 mb-1">
                      {tiktokData.videos.toLocaleString()}
                    </div>
                    <div className="text-zinc-400 text-sm">Videos Posted</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {tiktokData.videos >= 5 ? '✅ Meets requirement' : '❌ Need 5+'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle size={16} className="text-green-400" />
                    <span className="text-green-400 font-medium">Account Verified</span>
                    <span className="text-green-100">- All requirements met for Baguri influencer program</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign size={20} className="text-green-400" />
                <span className="text-sm text-zinc-400">Total Earnings</span>
              </div>
              <p className="text-2xl font-bold">0.00 RON</p>
              <p className="text-xs text-zinc-500 mt-1">+0% from last month</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Share2 size={20} className="text-blue-400" />
                <span className="text-sm text-zinc-400">Clicks Generated</span>
              </div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-zinc-500 mt-1">Start promoting to see data</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={20} className="text-purple-400" />
                <span className="text-sm text-zinc-400">Conversions</span>
              </div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-zinc-500 mt-1">0% conversion rate</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Eye size={20} className="text-yellow-400" />
                <span className="text-sm text-zinc-400">Reach</span>
              </div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-zinc-500 mt-1">People reached this month</p>
            </div>
          </div>

          {/* Getting Started */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Getting Started</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="font-medium">Browse Romanian Designers</p>
                  <p className="text-sm text-zinc-400">Explore our curated collection of authentic Romanian fashion.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="font-medium">Get Your Referral Links</p>
                  <p className="text-sm text-zinc-400">Generate unique tracking links for products you want to promote.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="font-medium">Share & Earn</p>
                  <p className="text-sm text-zinc-400">Post content featuring the products and earn up to 15% commission on sales.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/shop"
              className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-zinc-200 transition"
            >
              <Eye size={20} />
              Browse Products
            </Link>
            
            <button
              className="flex items-center justify-center gap-2 bg-zinc-800 border border-zinc-700 px-6 py-3 rounded-lg font-medium hover:border-zinc-600 transition"
              disabled
            >
              <Share2 size={20} />
              Generate Links (Coming Soon)
            </button>
          </div>

          {/* Connect Additional Platforms */}
          <div className="mt-8 p-6 border border-zinc-800 rounded-lg">
            <h3 className="font-semibold mb-3">Connect More Platforms</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Connect additional social media accounts to maximize your earning potential.
            </p>
            <div className="flex gap-4">
              {platform !== 'tiktok' && (
                <Link
                  href="/api/auth/tiktok"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:border-zinc-600 transition"
                >
                  <Music size={16} />
                  Connect TikTok
                </Link>
              )}
              {platform !== 'instagram' && (
                <Link
                  href="/api/auth/instagram"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
                >
                  <Instagram size={16} />
                  Connect Instagram
                </Link>
              )}
              {!platform && (
                <p className="text-zinc-500 text-sm">Choose a platform to get started</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );
}

export default function InfluencerDashboard() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InfluencerDashboardContent />
    </Suspense>
  );
}