import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandShowcaseProps {
  logoUrl?: string;
  brandName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandShowcase({ 
  logoUrl, 
  brandName, 
  size = 'md', 
  className 
}: BrandShowcaseProps) {
  const sizeConfig = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const fallbackConfig = {
    sm: 'text-lg',
    md: 'text-xl', 
    lg: 'text-2xl'
  };

  return (
    <div className={cn(
      "relative",
      sizeConfig[size],
      className
    )}>
      {/* Animated border ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 animate-spin-slow opacity-75"></div>
      
      {/* Inner container */}
      <div className="absolute inset-[2px] rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
        {logoUrl ? (
          <div className="relative w-full h-full p-2">
            <Image
              src={logoUrl}
              alt={`${brandName || 'Brand'} logo`}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className={cn(
            "font-bold text-amber-400",
            fallbackConfig[size]
          )}>
            {brandName ? brandName.charAt(0).toUpperCase() : '?'}
          </div>
        )}
      </div>
    </div>
  );
} 