"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Palette } from "lucide-react";
import { BackgroundPaths } from "@/components/ui/background-paths";

export default function MainPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950">
      <BackgroundPaths />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo */}
        <div className="mb-12">
          <Image
            src="/wlogo.png"
            alt="Baguri.ro"
            width={320}
            height={80}
            className="mx-auto w-full max-w-[280px] md:max-w-[420px] h-16 md:h-20 object-contain"
            style={{ filter: "invert(1) brightness(2)" }}
            priority
          />
          <p className="text-center text-zinc-400 mt-4 text-lg md:text-xl">
            Romanian fashion, reimagined.
          </p>
        </div>

        {/* Main Choices */}
        <div className="w-full max-w-2xl grid md:grid-cols-2 gap-6">
          {/* Shop */}
          <Link
            href="/shop"
            className="group relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 hover:border-white/50 transition-all duration-300 hover:bg-zinc-900"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                <ShoppingBag size={32} className="text-white" />
              </div>
                              <h2 className="text-2xl font-bold text-white group-hover:text-white transition-colors">
                Shop
                </h2>
              <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors">
                Discover unique pieces from independent Romanian designers. Limited drops, exclusive collections.
              </p>
                              <div className="mt-4 px-6 py-2 bg-white/10 rounded-full text-sm text-zinc-300 group-hover:bg-white/20 group-hover:text-white transition-colors">
                Browse Collection →
                </div>
            </div>
          </Link>

          {/* Designers */}
          <Link
            href="/designers"
            className="group relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 hover:border-white/50 transition-all duration-300 hover:bg-zinc-900"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                <Palette size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white group-hover:text-white transition-colors">
                Designers
              </h2>
              <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors">
                Meet our talented creators and explore their unique collections from across Romania.
              </p>
              <div className="mt-4 px-6 py-2 bg-white/10 rounded-full text-sm text-zinc-300 group-hover:bg-white/20 group-hover:text-white transition-colors">
                Meet Designers →
              </div>
            </div>
          </Link>
        </div>

        {/* Join as Designer CTA */}
        <div className="mt-8 text-center">
          <p className="text-zinc-400 text-sm mb-3">Are you a Romanian designer?</p>
          <Link 
            href="/designer-auth"
            className="inline-block bg-zinc-800 border border-zinc-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:border-zinc-500 transition"
          >
            Join Our Platform
          </Link>
        </div>

        {/* Back to landing */}
        <div className="mt-8">
          <Link
            href="/"
            className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
            ← Back to Landing Page
          </Link>
        </div>
      </div>
    </main>
  );
} 