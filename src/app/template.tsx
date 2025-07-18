"use client";

import { PageTransition } from '@/contexts/AnimationContext';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      {children}
    </PageTransition>
  );
} 