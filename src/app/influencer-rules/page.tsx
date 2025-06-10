"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Users, Calendar, TrendingUp, Shield, AlertCircle } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";

function InfluencerRulesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [platform, setPlatform] = useState<'instagram' | 'tiktok' | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [hasAccepted, setHasAccepted] = useState(false);
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

  const handleContinueToDashboard = () => {
    if (!hasAccepted) return;
    
    // Continue to dashboard with the original parameters
    router.push(`/influencer-dashboard?platform=${platform}&success=true&name=${encodeURIComponent(userName)}`);
  };

  const requirements = [
    {
      icon: <Calendar size={20} className="text-blue-400" />,
      title: "Account Age",
      description: "Your account must be at least 6 months old",
      details: "We require established accounts to ensure authenticity and trust"
    },
    {
      icon: <Users size={20} className="text-purple-400" />,
      title: "Minimum Followers",
      description: "At least 10,000 followers on your platform",
      details: "This ensures you have an engaged audience for promoting our designers"
    },
    {
      icon: <TrendingUp size={20} className="text-green-400" />,
      title: "Engagement Rate",
      description: "Minimum 3% engagement rate on recent posts",
      details: "Active, engaged audiences are key to successful promotions"
    },
    {
      icon: <Shield size={20} className="text-yellow-400" />,
      title: "Account Standing",
      description: "Your account must be in good standing",
      details: "No recent violations, suspensions, or policy infractions"
    }
  ];

  const rules = [
    "Promote only authentic Romanian fashion brands available on Baguri",
    "Clearly disclose sponsored content and affiliate links as required by law",
    "Maintain the quality and aesthetic standards of the brands you promote",
    "Respect the intellectual property and brand guidelines of designers",
    "Provide honest reviews and authentic engagement with promoted products",
    "Follow all platform-specific guidelines and local advertising regulations"
  ];

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

          {/* User Stats Section (if available) */}
          {userStats.followers > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <TrendingUp size={24} className="text-blue-400" />
                Your Account Stats
              </h3>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400 mb-1">
                      {userStats.followers.toLocaleString()}
                    </div>
                    <div className="text-sm text-zinc-400">Followers</div>
                    <div className={`text-xs mt-1 ${userStats.followers >= 10000 ? 'text-green-400' : 'text-red-400'}`}>
                      {userStats.followers >= 10000 ? '✓ Meets requirement' : 'Need 10K+ followers'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400 mb-1">
                      {userStats.likes.toLocaleString()}
                    </div>
                    <div className="text-sm text-zinc-400">Total Likes</div>
                    <div className="text-xs mt-1 text-blue-300">
                      Great engagement!
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      {userStats.videos.toLocaleString()}
                    </div>
                    <div className="text-sm text-zinc-400">Videos Posted</div>
                    <div className="text-xs mt-1 text-blue-300">
                      Active creator
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400 mb-1">
                      @{userStats.username}
                    </div>
                    <div className="text-sm text-zinc-400">Username</div>
                    <div className="text-xs mt-1 text-green-400">
                      Account verified
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Requirements Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <CheckCircle size={24} className="text-green-400" />
              Influencer Requirements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requirements.map((req, index) => (
                <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {req.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">{req.title}</h4>
                      <p className="text-zinc-300 mb-2">{req.description}</p>
                      <p className="text-zinc-500 text-sm">{req.details}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rules Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <AlertCircle size={24} className="text-orange-400" />
              Community Guidelines & Rules
            </h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <p className="text-zinc-400 mb-4">
                As a Baguri influencer, you agree to follow these guidelines:
              </p>
              <ul className="space-y-3">
                {rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-zinc-300">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Important Notice */}
          <div className="mb-8">
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-200 mb-2">Important Notice</h4>
                  <p className="text-yellow-100 text-sm mb-3">
                    We will verify that your account meets our requirements during the approval process. 
                    Accounts that don&apos;t meet these criteria may be suspended from the program.
                  </p>
                  <p className="text-yellow-100 text-sm">
                    Commission rates range from 5% to 15% based on performance and account quality.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Acceptance Checkbox and Continue Button */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-6">
              <input
                type="checkbox"
                id="accept-rules"
                checked={hasAccepted}
                onChange={(e) => setHasAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 bg-zinc-800 border border-zinc-600 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <label htmlFor="accept-rules" className="text-zinc-300">
                I confirm that my account meets the minimum requirements and I agree to follow all 
                community guidelines and rules outlined above. I understand that failure to comply 
                may result in suspension from the Baguri Influencer Program.
              </label>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleContinueToDashboard}
                disabled={!hasAccepted}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition ${
                  hasAccepted
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                Continue to Dashboard
              </button>
              <Link
                href="/influencer-auth"
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg font-medium transition text-center"
              >
                Go Back
              </Link>
            </div>
          </div>
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