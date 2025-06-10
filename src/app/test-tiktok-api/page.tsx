"use client";

import { useState } from 'react';
import { ArrowLeft, Users, TrendingUp, Video, Heart, User } from 'lucide-react';
import Link from 'next/link';

export default function TestTikTokAPI() {
  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testTikTokAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test-tiktok-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testType: 'profile_with_stats'
        })
      });
      
      const data = await response.json();
      setTestData(data);
      
      if (!response.ok) {
        setError(data.error || 'API test failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/admin"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            <span>Back to Admin</span>
          </Link>
          <div className="h-6 w-px bg-zinc-700" />
          <div className="flex items-center gap-2">
            <Video size={24} className="text-red-400" />
            <h1 className="text-2xl font-bold">TikTok API Test</h1>
          </div>
        </div>

        {/* Description */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">API Testing Dashboard</h2>
          <p className="text-zinc-400 mb-4">
            Test the TikTok API data fetching to see what information we can retrieve.
            This will help debug why stats aren&apos;t being fetched during OAuth.
          </p>
          
          <button
            onClick={testTikTokAPI}
            disabled={loading}
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 px-6 py-3 rounded-lg font-medium transition"
          >
            {loading ? 'Testing API...' : 'Test TikTok API'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-6 mb-8">
            <h3 className="text-red-400 font-semibold mb-2">Error</h3>
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {testData && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-400" />
                Basic Profile Data
              </h3>
              
              {testData.basicProfile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 text-sm">Display Name</label>
                    <div className="text-white font-medium">
                      {testData.basicProfile.display_name || 'Not available'}
                    </div>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-sm">Open ID</label>
                    <div className="text-white font-mono text-sm">
                      {testData.basicProfile.open_id || 'Not available'}
                    </div>
                  </div>
                  <div>
                    <label className="text-zinc-400 text-sm">Username</label>
                    <div className="text-white font-medium">
                      {testData.basicProfile.username || 'Not available'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-400" />
                Statistics Data
              </h3>
              
              {testData.statsProfile && (
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   <div className="text-center">
                     <div className="text-2xl font-bold text-purple-400 mb-1">
                       {testData.statsProfile.follower_count?.toLocaleString() || 'N/A'}
                     </div>
                     <div className="text-sm text-zinc-400 flex items-center justify-center gap-1">
                       <Users size={16} />
                       Followers
                     </div>
                   </div>
                   <div className="text-center">
                     <div className="text-2xl font-bold text-red-400 mb-1">
                       {testData.statsProfile.likes_count?.toLocaleString() || 'N/A'}
                     </div>
                     <div className="text-sm text-zinc-400 flex items-center justify-center gap-1">
                       <Heart size={16} />
                       Total Likes
                     </div>
                   </div>
                   <div className="text-center">
                     <div className="text-2xl font-bold text-blue-400 mb-1">
                       {testData.statsProfile.following_count?.toLocaleString() || 'N/A'}
                     </div>
                     <div className="text-sm text-zinc-400">Following</div>
                   </div>
                   <div className="text-center">
                     <div className="text-2xl font-bold text-green-400 mb-1">
                       {testData.statsProfile.video_count?.toLocaleString() || 'N/A'}
                     </div>
                     <div className="text-sm text-zinc-400 flex items-center justify-center gap-1">
                       <Video size={16} />
                       Videos
                     </div>
                   </div>
                 </div>
              )}
              
              {!testData.statsProfile && (
                <div className="text-center py-8">
                  <div className="text-zinc-500 mb-2">No stats data available</div>
                  <div className="text-sm text-zinc-600">
                    This could mean the stats scope isn&apos;t working or requires additional permissions
                  </div>
                </div>
              )}
            </div>

            {/* Raw API Response */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Raw API Response</h3>
              <pre className="bg-zinc-950 border border-zinc-700 rounded-lg p-4 text-sm overflow-auto">
                {JSON.stringify(testData, null, 2)}
              </pre>
            </div>

            {/* API Logs */}
            {testData.logs && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">API Call Logs</h3>
                <div className="space-y-2">
                  {testData.logs.map((log: any, index: number) => (
                    <div key={index} className="bg-zinc-950 border border-zinc-700 rounded-lg p-3">
                      <div className="text-sm font-mono">
                        <span className={`font-bold ${
                          log.level === 'error' ? 'text-red-400' : 
                          log.level === 'warn' ? 'text-yellow-400' : 
                          'text-green-400'
                        }`}>
                          [{log.level?.toUpperCase()}]
                        </span>
                        <span className="text-zinc-300 ml-2">{log.message}</span>
                      </div>
                      {log.data && (
                        <pre className="text-xs text-zinc-500 mt-2">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 