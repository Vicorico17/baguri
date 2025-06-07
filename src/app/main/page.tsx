"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Palette, Users } from "lucide-react";
import { BackgroundPaths } from "@/components/ui/background-paths";

export default function MainPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950">
      <BackgroundPaths />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 safe-area-inset">
        {/* Logo */}
        <div className="mb-12 mobile-fade-in">
          <Image
            src="/wlogo.png"
            alt="Baguri.ro"
            width={320}
            height={80}
            className="mx-auto w-full max-w-[280px] md:max-w-[420px] h-16 md:h-20 object-contain"
            style={{ filter: "invert(1) brightness(2)" }}
            priority
          />
          <p className="text-center text-zinc-400 mt-4 text-lg md:text-xl mobile-px-3">
            Romanian fashion, reimagined.
          </p>
        </div>

        {/* Main Choices */}
        <div className="w-full max-w-4xl grid md:grid-cols-3 gap-4 md:gap-6 mobile-slide-up">
          {/* Shop */}
          <Link
            href="/shop"
            className="group relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-blue-500/50 transition-all duration-300 hover:bg-zinc-900 mobile-touch-target mobile-card"
          >
            <div className="flex flex-col items-center text-center space-y-2 md:space-y-3">
              <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600/20 rounded-full text-base md:text-lg font-bold text-white group-hover:bg-blue-500/30 group-hover:text-white transition-all mobile-touch-target">
                <ShoppingBag size={18} className="text-blue-400 md:w-5 md:h-5" />
                <span className="text-blue-400 group-hover:text-blue-300">Shop →</span>
              </div>
              <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors text-xs md:text-sm leading-tight mobile-line-clamp-2">
                Discover unique pieces from independent Romanian designers. Limited drops, exclusive collections.
              </p>
            </div>
          </Link>

          {/* Designers */}
          <Link
            href="/designers"
            className="group relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-yellow-500/50 transition-all duration-300 hover:bg-zinc-900 mobile-touch-target mobile-card"
          >
            <div className="flex flex-col items-center text-center space-y-2 md:space-y-3">
              <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-yellow-600/20 rounded-full text-base md:text-lg font-bold text-white group-hover:bg-yellow-500/30 group-hover:text-white transition-all mobile-touch-target">
                <Palette size={18} className="text-yellow-400 md:w-5 md:h-5" />
                <span className="text-yellow-400 group-hover:text-yellow-300">Designers →</span>
              </div>
              <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors text-xs md:text-sm leading-tight mobile-line-clamp-2">
                Meet our talented creators and explore their unique collections from across Romania.
              </p>
            </div>
          </Link>

          {/* Influencers */}
          <Link
            href="/influencer-auth"
            className="group relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl md:rounded-2xl p-4 md:p-6 hover:border-red-500/50 transition-all duration-300 hover:bg-zinc-900 mobile-touch-target mobile-card"
          >
            <div className="flex flex-col items-center text-center space-y-2 md:space-y-3">
              <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-red-600/20 rounded-full text-base md:text-lg font-bold text-white group-hover:bg-red-500/30 group-hover:text-white transition-all mobile-touch-target">
                <Users size={18} className="text-red-400 md:w-5 md:h-5" />
                <span className="text-red-400 group-hover:text-red-300">Influencers →</span>
              </div>
              <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors text-xs md:text-sm leading-tight mobile-line-clamp-2">
                Promote Romanian fashion and earn commissions. Connect your social media accounts to get started.
              </p>
            </div>
          </Link>
        </div>

        {/* Join CTA */}
        <div className="mt-8 text-center mobile-fade-in">
          <p className="text-zinc-400 text-sm mb-3 mobile-px-3">Ready to join the Romanian fashion revolution?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/designer-auth"
              className="inline-block bg-zinc-800 border border-zinc-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:border-zinc-500 transition mobile-touch-target"
            >
              Join as Designer
            </Link>
            <Link 
              href="/influencer-auth"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition mobile-touch-target"
            >
              Join as Influencer
            </Link>
          </div>
        </div>

        {/* Back to landing */}
        <div className="mt-8 mobile-fade-in">
          <Link
            href="/"
            className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors mobile-touch-target"
          >
            ← Back to Landing Page
          </Link>
        </div>
      </div>
    </main>
  );
} 