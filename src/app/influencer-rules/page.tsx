"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Users, TrendingUp, AlertCircle, Heart } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";
import { supabase } from '@/lib/supabase';

function InfluencerRulesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [platform, setPlatform] = useState<'instagram' | 'tiktok' | null>(null);
  const [userName, setUserName] = useState<string>('');

  const [userStats, setUserStats] = useState({
    followers: 0,
    likes: 0,
    videos: 0,
    username: ''
  });

  useEffect(() => {
    if (!searchParams) return;
    
    const platformParam = searchParams.get('platform') as 'instagram' | 'tiktok' | null;
    const nameParam = searchParams.get('name');
    const usernameParam = searchParams.get('username');
    const followersParam = searchParams.get('followers');
    const likesParam = searchParams.get('likes');
    const videosParam = searchParams.get('videos');
    
    if (platformParam && (platformParam === 'instagram' || platformParam === 'tiktok')) {
      setPlatform(platformParam);
    }
    
    if (nameParam) {
      setUserName(decodeURIComponent(nameParam));
    }
    
    // Set user stats if available
    setUserStats({
      followers: parseInt(followersParam || '0'),
      likes: parseInt(likesParam || '0'),
      videos: parseInt(videosParam || '0'),
      username: usernameParam || ''
    });
  }, [searchParams]);

  const meetsRequirements = userStats.followers >= 1 && userStats.likes >= 1 && userStats.videos >= 1;

  const handleContinueToDashboard = async () => {
    if (!meetsRequirements) return;
    if (platform === 'tiktok') {
      if (!searchParams) {
        alert('Missing search parameters. Please re-authenticate.');
        return;
      }
      const tiktokOpenId = searchParams.get('open_id');
      if (!tiktokOpenId) {
        alert('Missing TikTok Open ID. Please re-authenticate.');
        return;
      }
      // Update influencer as verified in Supabase
      const { error } = await supabase
        .from('influencers')
        .update({ is_verified: true })
        .eq('tiktok_open_id', tiktokOpenId);
      if (error) {
        alert('Failed to verify influencer. Please try again.');
        console.error('Error updating influencer verification:', error);
        return;
      }
      // Ensure wallet exists for verified influencer
      const { data: existingWallet, error: walletFindError } = await supabase
        .from('influencers_wallets')
        .select('*')
        .eq('tiktok_open_id', tiktokOpenId)
        .single();
      if (!existingWallet) {
        // Always fetch display_name from influencers table
        let displayName = null;
        const { data: influencerRow } = await supabase
          .from('influencers')
          .select('display_name')
          .eq('tiktok_open_id', tiktokOpenId)
          .single();
        displayName = influencerRow?.display_name || tiktokOpenId;
        const { data: newWallet, error: walletCreateError } = await supabase
          .from('influencers_wallets')
          .insert({
            tiktok_open_id: tiktokOpenId,
            tiktok_display_name: displayName,
            balance: 0
          })
          .select()
          .single();
        if (walletCreateError) {
          console.error('Error creating influencer wallet:', walletCreateError);
        } else {
          console.log('Wallet created for influencer:', tiktokOpenId, '| Wallet:', newWallet);
        }
      } else {
        console.log('Wallet already exists for influencer:', tiktokOpenId, '| Wallet:', existingWallet);
      }
      // Continue to dashboard with the original parameters
      router.push(`/influencer-dashboard?platform=${platform}&success=true&name=${encodeURIComponent(userName)}`);
    } else {
      // For other platforms, just continue as before
      router.push(`/influencer-dashboard?platform=${platform}&success=true&name=${encodeURIComponent(userName)}`);
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
                  href="/influencer-auth"
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
                >
                  <ArrowLeft size={20} />
                  <span>Back to Auth</span>
                </Link>
                <div className="h-6 w-px bg-zinc-700" />
                <div className="flex items-center gap-2">
                  <Users size={24} />
                  <h1 className="text-xl font-bold">Influencer Requirements</h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Welcome{userName ? `, ${userName}` : ''}!
            </h2>
            <p className="text-zinc-400 text-lg">
              Before you can access your influencer dashboard, please review our requirements and rules.
            </p>
            <p className="text-zinc-500 text-sm mt-2">
              Platform: <span className="capitalize text-white font-medium">{platform}</span>
            </p>
          </div>

          {/* Enhanced Account Stats Section */}
          {userStats.followers > 0 ? (
            <div className="mb-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                    <TrendingUp size={28} className="text-blue-400" />
                    Account Eligibility Check
                  </h2>
                  <p className="text-zinc-400">
                    Platform: <span className="capitalize text-white font-medium">{platform}</span> • 
                    User: <span className="text-blue-400 font-medium">@{userStats.username}</span>
                  </p>
                </div>

                {/* Overall Status */}
                <div className={`rounded-lg p-6 mb-8 text-center ${meetsRequirements ? 'bg-green-900/40 border border-green-700/50' : 'bg-red-900/40 border border-red-700/50'}`}>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    {meetsRequirements ? (
                      <CheckCircle size={32} className="text-green-400" />
                    ) : (
                      <AlertCircle size={32} className="text-red-400" />
                    )}
                    <h3 className={`text-2xl font-bold ${meetsRequirements ? 'text-green-200' : 'text-red-200'}`}>
                      {meetsRequirements ? 'Eligible for Influencer Program!' : 'Not Eligible Yet'}
                    </h3>
                  </div>
                  <p className={`text-lg ${meetsRequirements ? 'text-green-100' : 'text-red-100'}`}>
                    {meetsRequirements 
                      ? 'Congratulations! Your account meets all requirements. You can proceed to the dashboard.'
                      : 'Your account needs to grow more to meet our minimum requirements.'
                    }
                  </p>
                </div>

                {/* Detailed Requirements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Followers */}
                  <div className="bg-zinc-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Users size={24} className="text-purple-400" />
                      <h4 className="font-semibold text-lg">Followers</h4>
                    </div>
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {userStats.followers.toLocaleString()}
                    </div>
                    <div className="text-sm text-zinc-400 mb-3">Required: 1</div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-700 rounded-full h-2 mb-3">
                      <div 
                        className={`h-2 rounded-full ${userStats.followers >= 1 ? 'bg-green-400' : 'bg-purple-400'}`}
                        style={{width: `${Math.min((userStats.followers / 1) * 100, 100)}%`}}
                      ></div>
                    </div>
                    
                    <div className={`text-sm font-medium ${userStats.followers >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                      {userStats.followers >= 1 
                        ? '✓ Requirement met!' 
                        : `${(1 - userStats.followers)} more needed`
                      }
                    </div>
                  </div>

                  {/* Likes */}
                  <div className="bg-zinc-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Heart size={24} className="text-red-400" />
                      <h4 className="font-semibold text-lg">Total Likes</h4>
                    </div>
                    <div className="text-3xl font-bold text-red-400 mb-2">
                      {userStats.likes.toLocaleString()}
                    </div>
                    <div className="text-sm text-zinc-400 mb-3">Required: 1</div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-700 rounded-full h-2 mb-3">
                      <div 
                        className={`h-2 rounded-full ${userStats.likes >= 1 ? 'bg-green-400' : 'bg-red-400'}`}
                        style={{width: `${Math.min((userStats.likes / 1) * 100, 100)}%`}}
                      ></div>
                    </div>
                    
                    <div className={`text-sm font-medium ${userStats.likes >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                      {userStats.likes >= 1 
                        ? '✓ Requirement met!' 
                        : `${(1 - userStats.likes)} more needed`
                      }
                    </div>
                  </div>

                  {/* Videos */}
                  <div className="bg-zinc-800 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp size={24} className="text-green-400" />
                      <h4 className="font-semibold text-lg">Videos Posted</h4>
                    </div>
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {userStats.videos.toLocaleString()}
                    </div>
                    <div className="text-sm text-zinc-400 mb-3">Required: 1</div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-700 rounded-full h-2 mb-3">
                      <div 
                        className={`h-2 rounded-full ${userStats.videos >= 1 ? 'bg-green-400' : 'bg-green-400'}`}
                        style={{width: `${Math.min((userStats.videos / 1) * 100, 100)}%`}}
                      ></div>
                    </div>
                    
                    <div className={`text-sm font-medium ${userStats.videos >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                      {userStats.videos >= 1 
                        ? '✓ Requirement met!' 
                        : `${(1 - userStats.videos)} more needed`
                      }
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="text-center">
                  <button
                    onClick={handleContinueToDashboard}
                    disabled={!meetsRequirements}
                    className={`px-12 py-4 rounded-xl font-bold text-lg transition transform ${
                      meetsRequirements
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {meetsRequirements ? 'Continue to Dashboard' : 'Requirements Not Met'}
                  </button>
                  
                  <div className="mt-4">
                    <Link
                      href="/influencer-auth"
                      className="text-zinc-400 hover:text-white transition underline"
                    >
                      ← Back to Authentication
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-zinc-600 mb-4" />
              <h2 className="text-2xl font-bold text-zinc-400 mb-2">No Account Data Available</h2>
              <p className="text-zinc-500 mb-6">Please authenticate with your social media account first.</p>
              <Link
                href="/influencer-auth"
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition"
              >
                Go to Authentication
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black text-white relative flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  );
}

export default function InfluencerRules() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InfluencerRulesContent />
    </Suspense>
  );
} 