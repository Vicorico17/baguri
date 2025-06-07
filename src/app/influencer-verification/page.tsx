"use client";

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Users, Heart, Video, CheckCircle, XCircle, Crown, AlertTriangle } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";

function InfluencerVerificationContent() {
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<{
    name: string;
    username: string;
    followers: number;
    likes: number;
    videos: number;
    open_id: string;
  } | null>(null);

  useEffect(() => {
    if (!searchParams) return;
    
    const name = searchParams.get('name') || 'TikTok User';
    const username = searchParams.get('username') || '';
    const followers = parseInt(searchParams.get('followers') || '0');
    const likes = parseInt(searchParams.get('likes') || '0');
    const videos = parseInt(searchParams.get('videos') || '0');
    const open_id = searchParams.get('open_id') || '';

    setUserData({
      name,
      username,
      followers,
      likes,
      videos,
      open_id
    });
  }, [searchParams]);

  if (!userData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your TikTok profile...</p>
        </div>
      </div>
    );
  }

  // Check requirements
  const requirements = [
    {
      id: 'followers',
      title: '10,000+ Followers',
      description: 'Minimum follower count for adequate reach',
      icon: Users,
      color: 'blue',
      required: 10000,
      actual: userData.followers,
      passed: userData.followers >= 10000,
      formatValue: (val: number) => val.toLocaleString()
    },
    {
      id: 'likes',
      title: '100,000+ Total Likes',
      description: 'Demonstrates strong engagement across all videos',
      icon: Heart,
      color: 'red',
      required: 100000,
      actual: userData.likes,
      passed: userData.likes >= 100000,
      formatValue: (val: number) => val.toLocaleString()
    },
    {
      id: 'videos',
      title: '5+ Videos Posted',
      description: 'Shows content creation consistency',
      icon: Video,
      color: 'purple',
      required: 5,
      actual: userData.videos,
      passed: userData.videos >= 5,
      formatValue: (val: number) => val.toString()
    }
  ];

  const allRequirementsMet = requirements.every(req => req.passed);
  const passedCount = requirements.filter(req => req.passed).length;

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
          {/* Profile Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users size={32} className="text-white" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome, {userData.name}!
            </h1>
            {userData.username && (
              <p className="text-zinc-400 mb-4">@{userData.username}</p>
            )}
            <p className="text-zinc-400 text-lg">
              Let's check if your TikTok account meets our influencer requirements
            </p>
          </div>

          {/* TikTok Account Stats */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 mb-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center">Your TikTok Account Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Followers */}
              <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users size={24} className="text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-2">
                  {userData.followers.toLocaleString()}
                </div>
                <div className="text-zinc-400 font-medium">Followers</div>
              </div>

              {/* Likes */}
              <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart size={24} className="text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-red-400 mb-2">
                  {userData.likes.toLocaleString()}
                </div>
                <div className="text-zinc-400 font-medium">Total Likes</div>
              </div>

              {/* Videos */}
              <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Video size={24} className="text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-2">
                  {userData.videos.toLocaleString()}
                </div>
                <div className="text-zinc-400 font-medium">Videos Posted</div>
              </div>
            </div>
          </div>

          {/* Verification Results */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-semibold">Verification Results</h2>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {passedCount}/3
                </div>
                <div className="text-sm text-zinc-400">Requirements Met</div>
              </div>
            </div>
            
            <div className="space-y-4">
              {requirements.map((req) => {
                const IconComponent = req.icon;
                const colorClasses = {
                  blue: req.passed ? 'bg-blue-600 text-blue-400 border-blue-500/30' : 'bg-red-600 text-red-400 border-red-500/30',
                  red: req.passed ? 'bg-blue-600 text-blue-400 border-blue-500/30' : 'bg-red-600 text-red-400 border-red-500/30',
                  purple: req.passed ? 'bg-blue-600 text-blue-400 border-blue-500/30' : 'bg-red-600 text-red-400 border-red-500/30'
                };

                return (
                  <div key={req.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                    req.passed 
                      ? 'bg-green-900/20 border-green-500/30' 
                      : 'bg-red-900/20 border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        req.passed 
                          ? 'bg-green-600 text-white' 
                          : 'bg-red-600 text-white'
                      }`}>
                        <IconComponent size={20} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${
                          req.passed ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {req.title}
                        </h3>
                        <p className="text-zinc-400 text-sm">{req.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        {req.passed ? (
                          <CheckCircle size={20} className="text-green-400" />
                        ) : (
                          <XCircle size={20} className="text-red-400" />
                        )}
                        <span className={`font-bold ${
                          req.passed ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {req.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      <div className="text-sm text-zinc-400">
                        <span className={req.passed ? 'text-green-300' : 'text-red-300'}>
                          {req.formatValue(req.actual)}
                        </span>
                        {' / '}
                        <span className="text-zinc-500">
                          {req.formatValue(req.required)} required
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results Action */}
          {allRequirementsMet ? (
            // All requirements met - Success
            <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-500/20 rounded-xl p-8 mb-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                    <Crown size={28} className="text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-green-400 mb-4">
                  Congratulations! 🎉
                </h2>
                <p className="text-green-100 mb-6 text-lg">
                  You meet all requirements to become a Baguri influencer! 
                  You can now access your dashboard and start earning commissions.
                </p>
                <Link
                  href={`/influencer-dashboard?platform=tiktok&success=true&name=${encodeURIComponent(userData.name)}&open_id=${userData.open_id}`}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition"
                >
                  <Crown size={20} />
                  Continue to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            // Requirements not met - Failure
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-8 mb-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <AlertTriangle size={32} className="text-yellow-400" />
                </div>
                <h2 className="text-xl font-bold text-yellow-400 mb-4">
                  Requirements Not Met
                </h2>
                <p className="text-yellow-100/90 mb-6">
                  Unfortunately, your TikTok account doesn't meet all the requirements to become a Baguri influencer at this time. 
                  Keep growing your account and try again when you meet the minimum requirements!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/influencer-rules"
                    className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition"
                  >
                    <Users size={20} />
                    View Requirements Again
                  </Link>
                  <Link
                    href="/main"
                    className="inline-flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-medium transition"
                  >
                    Back to Main Page
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Support Contact */}
          <div className="text-center text-zinc-500">
            <p className="text-sm">
              Questions about verification? Contact us at{' '}
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

export default function InfluencerVerification() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading verification...</p>
        </div>
      </div>
    }>
      <InfluencerVerificationContent />
    </Suspense>
  );
} 