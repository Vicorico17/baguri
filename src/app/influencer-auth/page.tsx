"use client";

import { Suspense } from 'react';
import { BackgroundPaths } from "@/components/ui/background-paths";
import InfluencerAuthContent from './InfluencerAuthContent';

export default function InfluencerAuth() {
  return (
    <div className="min-h-screen bg-black text-white relative">
      <BackgroundPaths />
      
      <Suspense fallback={
        <div className="min-h-screen bg-black text-white relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      }>
        <InfluencerAuthContent />
      </Suspense>
    </div>
  );
} 