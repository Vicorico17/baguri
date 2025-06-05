'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Star, Crown, Zap, TrendingUp, Target, Gift } from 'lucide-react';

interface CommissionLevel {
  id: string;
  name: string;
  icon: any;
  commission: number;
  threshold: number;
  color: string;
  bgColor: string;
  description: string;
  benefits: string[];
  nextLevelAt?: number;
}

const COMMISSION_LEVELS: CommissionLevel[] = [
  {
    id: 'bronze',
    name: 'Bronze Designer',
    icon: Target,
    commission: 30,
    threshold: 0,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-500/20',
    description: 'Welcome to Baguri! Start your journey here.',
    benefits: [
      'Full platform access',
      'Product upload & management',
      'Basic analytics',
      'Community support'
    ]
  },
  {
    id: 'silver',
    name: 'Silver Designer',
    icon: Star,
    commission: 25,
    threshold: 100,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10 border-gray-500/20',
    description: 'You are gaining momentum! Better rates await.',
    benefits: [
      '5% better commission rate',
      'Priority listing placement',
      'Advanced analytics',
      'Marketing tools access'
    ],
    nextLevelAt: 1000
  },
  {
    id: 'gold',
    name: 'Gold Designer',
    icon: Trophy,
    commission: 20,
    threshold: 1000,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10 border-yellow-500/20',
    description: 'Excellent progress! You are a proven seller.',
    benefits: [
      '10% better commission rate',
      'Featured designer badge',
      'Premium marketing campaigns',
      'Dedicated account support'
    ],
    nextLevelAt: 10000
  },
  {
    id: 'platinum',
    name: 'Platinum Designer',
    icon: Crown,
    commission: 17,
    threshold: 10000,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/20',
    description: 'Elite status achieved! Maximum earning potential.',
    benefits: [
      'Lowest commission rate (17%)',
      'VIP designer status',
      'Exclusive events access',
      'Personal success manager',
      'Early feature access'
    ]
  }
];

export default function CommissionLevelsPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>('bronze');
  const [currentSales] = useState(750); // Example current sales for demo

  const getCurrentLevel = (sales: number) => {
    for (let i = COMMISSION_LEVELS.length - 1; i >= 0; i--) {
      if (sales >= COMMISSION_LEVELS[i].threshold) {
        return COMMISSION_LEVELS[i];
      }
    }
    return COMMISSION_LEVELS[0];
  };

  const getProgressToNext = (sales: number, currentLevel: CommissionLevel) => {
    if (!currentLevel.nextLevelAt) return 100;
    return Math.min((sales / currentLevel.nextLevelAt) * 100, 100);
  };

  const currentLevel = getCurrentLevel(currentSales);
  const progressPercent = getProgressToNext(currentSales, currentLevel);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link 
            href="/designer-dashboard"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Zap className="text-yellow-400" size={40} />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Commission Levels
              </h1>
            </div>
            <p className="text-xl text-zinc-400 mb-2">
              Level up your earnings as you grow your business
            </p>
            <p className="text-zinc-500">
              The more you sell, the more you keep. It&apos;s that simple.
            </p>
          </div>
        </div>
      </div>

      {/* Current Progress Section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-8 border border-zinc-700 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Your Current Level</h2>
            <div className="flex items-center justify-center gap-3 mb-4">
              <currentLevel.icon className={`${currentLevel.color}`} size={32} />
              <span className="text-2xl font-bold">{currentLevel.name}</span>
            </div>
            <p className="text-zinc-400">{currentLevel.description}</p>
          </div>

          {/* Progress Bar */}
          {currentLevel.nextLevelAt && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-400">
                  {currentSales} RON / {currentLevel.nextLevelAt} RON
                </span>
                <span className="text-sm text-zinc-400">
                  {Math.round(progressPercent)}% to next level
                </span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{100 - currentLevel.commission}%</div>
              <div className="text-sm text-zinc-400">You Keep</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-400">{currentLevel.commission}%</div>
              <div className="text-sm text-zinc-400">Platform Fee</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{currentSales}</div>
              <div className="text-sm text-zinc-400">Total Sales (RON)</div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">
                {currentLevel.nextLevelAt ? currentLevel.nextLevelAt - currentSales : '∞'}
              </div>
              <div className="text-sm text-zinc-400">
                {currentLevel.nextLevelAt ? 'RON to Next Level' : 'Max Level!'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Levels Overview */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center mb-8">All Commission Levels</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {COMMISSION_LEVELS.map((level, index) => {
            const isCurrentLevel = level.id === currentLevel.id;
            const isUnlocked = currentSales >= level.threshold;
            
            return (
              <div
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedLevel === level.id ? 'scale-105' : ''
                } ${!isUnlocked ? 'opacity-60' : ''}`}
              >
                <div className={`rounded-2xl p-6 border-2 transition-all ${
                  selectedLevel === level.id 
                    ? level.bgColor.replace('/10', '/20') + ' ' + level.color.replace('text-', 'border-')
                    : level.bgColor + ' border-transparent'
                } ${isCurrentLevel ? 'ring-2 ring-yellow-400' : ''}`}>
                  
                  {isCurrentLevel && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                        CURRENT
                      </div>
                    </div>
                  )}

                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <Gift className="text-zinc-500 mx-auto mb-2" size={24} />
                        <div className="text-sm text-zinc-400">
                          Unlock at {level.threshold} RON
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <level.icon className={`${level.color} mx-auto mb-3`} size={48} />
                    <h3 className="text-xl font-bold text-white mb-2">{level.name}</h3>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-3xl font-bold text-green-400">
                        {100 - level.commission}%
                      </span>
                      <span className="text-zinc-400">you keep</span>
                    </div>
                    <div className="text-sm text-zinc-500">
                      {level.threshold === 0 ? 'Starting level' : `After ${level.threshold} RON in sales`}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {level.benefits.slice(0, 2).map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full ${level.color.replace('text-', 'bg-')}`}></div>
                        <span className="text-zinc-300">{benefit}</span>
                      </div>
                    ))}
                    {level.benefits.length > 2 && (
                      <div className="text-xs text-zinc-500">
                        +{level.benefits.length - 2} more benefits
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Level Details */}
        {selectedLevel && (
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-700">
            {(() => {
              const level = COMMISSION_LEVELS.find(l => l.id === selectedLevel)!;
              return (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <level.icon className={`${level.color}`} size={48} />
                    <div>
                      <h3 className="text-2xl font-bold text-white">{level.name}</h3>
                      <p className="text-zinc-400">{level.description}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Commission Breakdown</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
                          <span className="text-zinc-300">You earn:</span>
                          <span className="text-2xl font-bold text-green-400">
                            {100 - level.commission}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-zinc-800 rounded-lg">
                          <span className="text-zinc-300">Platform fee:</span>
                          <span className="text-2xl font-bold text-red-400">
                            {level.commission}%
                          </span>
                        </div>
                        <div className="text-sm text-zinc-500 mt-2">
                          Example: On a 100 RON sale, you keep {100 - level.commission} RON
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Level Benefits</h4>
                      <div className="space-y-3">
                        {level.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${level.color.replace('text-', 'bg-')}`}></div>
                            <span className="text-zinc-300">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-8 border border-blue-500/20 mt-12">
          <div className="text-center mb-6">
            <TrendingUp className="text-blue-400 mx-auto mb-4" size={48} />
            <h3 className="text-2xl font-bold text-white mb-2">Level Up Faster</h3>
            <p className="text-zinc-400">Pro tips to reach the next level quickly</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-500/10 rounded-xl p-4 mb-4">
                <Star className="text-yellow-400 mx-auto" size={32} />
              </div>
              <h4 className="font-semibold text-white mb-2">Quality Products</h4>
              <p className="text-zinc-400 text-sm">
                Upload high-quality, unique designs that customers love
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500/10 rounded-xl p-4 mb-4">
                <Target className="text-green-400 mx-auto" size={32} />
              </div>
              <h4 className="font-semibold text-white mb-2">Optimize Listings</h4>
              <p className="text-zinc-400 text-sm">
                Use great photos, descriptions, and competitive pricing
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500/10 rounded-xl p-4 mb-4">
                <TrendingUp className="text-purple-400 mx-auto" size={32} />
              </div>
              <h4 className="font-semibold text-white mb-2">Stay Active</h4>
              <p className="text-zinc-400 text-sm">
                Regular uploads and engagement boost your visibility
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 