import React from 'react';
import { Target, Star, Trophy, Crown } from 'lucide-react';

export interface TierData {
  id: string;
  name: string;
  icon: any;
  platformFeePct: number;
  designerEarningsPct: number;
  threshold: number;
  color: string;
  bgColor: string;
  nextAt?: number;
}

export const COMMISSION_TIERS: TierData[] = [
  { 
    id: 'bronze',
    name: 'Bronze Designer', 
    icon: Target,
    platformFeePct: 30, 
    designerEarningsPct: 70, 
    threshold: 0,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-500/20',
    nextAt: 100
  },
  { 
    id: 'silver',
    name: 'Silver Designer', 
    icon: Star,
    platformFeePct: 25, 
    designerEarningsPct: 75, 
    threshold: 100,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10 border-gray-500/20',
    nextAt: 1000
  },
  { 
    id: 'gold',
    name: 'Gold Designer', 
    icon: Trophy,
    platformFeePct: 20, 
    designerEarningsPct: 80, 
    threshold: 1000,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10 border-yellow-500/20',
    nextAt: 10000
  },
  { 
    id: 'platinum',
    name: 'Platinum Designer', 
    icon: Crown,
    platformFeePct: 17, 
    designerEarningsPct: 83, 
    threshold: 10000,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/20'
  }
];

export function getTierBySalesTotal(salesTotal: number): TierData {
  // Find the highest tier the designer qualifies for
  for (let i = COMMISSION_TIERS.length - 1; i >= 0; i--) {
    if (salesTotal >= COMMISSION_TIERS[i].threshold) {
      return COMMISSION_TIERS[i];
    }
  }
  return COMMISSION_TIERS[0]; // Default to Bronze
}

interface TierBadgeProps {
  salesTotal: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function TierBadge({ 
  salesTotal, 
  size = 'md', 
  showLabel = true, 
  className = '' 
}: TierBadgeProps) {
  const tier = getTierBySalesTotal(salesTotal);
  const Icon = tier.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };
  
  return (
    <div className={`
      inline-flex items-center gap-1.5 rounded-full border 
      ${tier.bgColor} ${tier.color} ${sizeClasses[size]} font-medium
      ${className}
    `}>
      <Icon size={iconSizes[size]} />
      {showLabel && <span>{tier.name}</span>}
    </div>
  );
}

interface TierProgressProps {
  salesTotal: number;
  className?: string;
}

export function TierProgress({ salesTotal, className = '' }: TierProgressProps) {
  const currentTier = getTierBySalesTotal(salesTotal);
  const nextTier = COMMISSION_TIERS.find(tier => tier.threshold > salesTotal);
  
  if (!nextTier) {
    // Already at highest tier
    return (
      <div className={`space-y-2 ${className}`}>
        <TierBadge salesTotal={salesTotal} />
        <p className="text-sm text-green-400">🎉 Maximum tier achieved!</p>
      </div>
    );
  }
  
  const progress = ((salesTotal - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100;
  const remaining = nextTier.threshold - salesTotal;
  
  return (
    <div className={`space-y-3 ${className}`}>
      <TierBadge salesTotal={salesTotal} />
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Progress to {nextTier.name}</span>
          <span className="text-zinc-300">{salesTotal} / {nextTier.threshold} RON</span>
        </div>
        
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              nextTier.id === 'silver' ? 'bg-gray-400' :
              nextTier.id === 'gold' ? 'bg-yellow-400' :
              nextTier.id === 'platinum' ? 'bg-purple-400' : 'bg-zinc-400'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        
        <p className="text-xs text-zinc-500">
          {remaining} RON more to reach {nextTier.name} ({nextTier.designerEarningsPct}% earnings)
        </p>
      </div>
    </div>
  );
} 