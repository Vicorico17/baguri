"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Instagram, Globe, MapPin, Calendar } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";

// Social Icon Component
function SocialIcon({ type, url }: { type: "instagram" | "tiktok"; url: string }) {
  if (type === "tiktok") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-zinc-400 hover:text-white transition">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="currentColor" fillOpacity="0.08"/>
          <path d="M16.5 7.5V13.5C16.5 15.1569 15.1569 16.5 13.5 16.5C11.8431 16.5 10.5 15.1569 10.5 13.5C10.5 11.8431 11.8431 10.5 13.5 10.5C13.7761 10.5 14 10.7239 14 11C14 11.2761 13.7761 11.5 13.5 11.5C12.6716 11.5 12 12.1716 12 13C12 13.8284 12.6716 14.5 13.5 14.5C14.3284 14.5 15 13.8284 15 13V7.5H16.5Z" fill="currentColor"/>
        </svg>
      </a>
    );
  }
  return null;
}

// Placeholder component for images
function PlaceholderImage({ type, className, alt }: { type: 'product' | 'logo'; className?: string; alt: string }) {
  const colors = {
    product: ['bg-gradient-to-br from-amber-100 to-amber-200', 'bg-gradient-to-br from-zinc-100 to-zinc-300', 'bg-gradient-to-br from-emerald-100 to-emerald-200', 'bg-gradient-to-br from-rose-100 to-rose-200'],
    logo: ['bg-amber-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500']
  };
  
  const colorIndex = alt.length % colors[type].length;
  const bgColor = colors[type][colorIndex];
  
  return (
    <div className={`${bgColor} flex items-center justify-center ${className}`}>
      <span className="text-zinc-600 text-xs font-bold opacity-50">
        {type === 'logo' ? alt.substring(0, 2).toUpperCase() : 'IMG'}
      </span>
    </div>
  );
}

// Designer data
const designers = [
  {
    id: 2,
    name: "Atelier Mia",
    slug: "atelier-mia",
    logo: "atelier-mia",
    tagline: "Timeless elegance meets modern sophistication",
    description: "Founded in 2019 in Bucharest, Atelier Mia creates luxury evening wear that celebrates the Romanian woman's grace and strength.",
    location: "Bucharest, Romania",
    yearFounded: 2019,
    specialties: ["Evening Wear", "Bridal", "Cocktail Dresses"],
    socialLinks: {
      instagram: "@atelier.mia",
      website: "www.ateliermia.ro"
    },
    isUpcoming: false,
    productCount: 12
  },
  {
    id: 3,
    name: "Urban Luna",
    slug: "urban-luna",
    logo: "urban-luna",
    tagline: "Streetwear with a Romanian soul",
    description: "Urban Luna bridges the gap between street fashion and Romanian heritage. Our pieces are designed for the urban explorer who isn't afraid to stand out.",
    location: "Cluj-Napoca, Romania",
    yearFounded: 2021,
    specialties: ["Streetwear", "Oversized Silhouettes", "Sustainable Fashion"],
    socialLinks: {
      instagram: "@urban.luna.ro",
      website: "www.urbanluna.com"
    },
    isUpcoming: false,
    productCount: 8
  },
  {
    id: 4,
    name: "Vestige Co",
    slug: "vestige-co",
    logo: "vestige-co",
    tagline: "Preserving craftsmanship for tomorrow",
    description: "Vestige Co specializes in handwoven accessories that tell the story of Romanian textile traditions. Every piece is created in partnership with local artisans.",
    location: "Maramureș, Romania",
    yearFounded: 2020,
    specialties: ["Handwoven Accessories", "Traditional Crafts", "Sustainable Materials"],
    socialLinks: {
      instagram: "@vestige.co",
      website: "www.vestigeco.ro"
    },
    isUpcoming: true,
    productCount: 5
  },
  {
    id: 5,
    name: "Nova Studio",
    slug: "nova-studio",
    logo: "nova-studio",
    tagline: "Minimalism redefined",
    description: "Nova Studio creates clean, functional pieces for the contemporary lifestyle. Our philosophy centers around 'less is more' while ensuring every detail serves a purpose.",
    location: "Timișoara, Romania",
    yearFounded: 2022,
    specialties: ["Minimalist Design", "Functional Fashion", "Geometric Patterns"],
    socialLinks: {
      instagram: "@nova.studio.ro",
      website: "www.novastudio.ro"
    },
    isUpcoming: true,
    productCount: 3
  }
];

export default function DesignersPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <BackgroundPaths />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/shop" className="flex items-center gap-2 text-zinc-400 hover:text-white transition">
              <ArrowLeft size={20} />
              Back to Shop
            </Link>
            
            <Link href="/">
              <Image
                src="/wlogo.png"
                alt="Baguri"
                width={120}
                height={30}
                className="h-8 w-auto object-contain"
                style={{ filter: "invert(1) brightness(2)" }}
              />
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <a 
                  href="https://www.instagram.com/baguri.ro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-white transition"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <SocialIcon type="tiktok" url="https://www.tiktok.com/@baguri.ro" />
              </div>
              <Link 
                href="/designer-auth"
                className="px-4 py-2 bg-white text-zinc-900 rounded-full font-medium hover:bg-zinc-200 transition"
              >
                Become a Designer
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-16 pt-32 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Designers</h1>
          <p className="text-xl text-zinc-400 mb-8">
            Meet the talented creators behind Romania&apos;s most innovative fashion brands
          </p>
        </div>
      </section>

      {/* All Designers */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designers.map((designer) => (
              <DesignerCard key={designer.id} designer={designer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-white text-lg font-semibold mb-4">
            Are you a Romanian designer?
          </p>
          <Link 
            href="/designer-auth"
            className="inline-block bg-white text-zinc-900 px-6 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition"
          >
            Join Our Platform
          </Link>
        </div>
      </section>
    </div>
  );
}

function DesignerCard({ designer }: { designer: any }) {
  return (
    <Link href={`/designer/${designer.slug}`} className="group">
              <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 hover:border-white/50 transition-all duration-300 hover:bg-zinc-800/95">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <PlaceholderImage 
            type="logo" 
            alt={designer.name}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg group-hover:text-white transition">{designer.name}</h3>
              {designer.isUpcoming && (
                <span className="bg-white text-zinc-900 px-2 py-1 rounded-full text-xs font-bold">
                  Coming Soon
                </span>
              )}
            </div>
            <p className="text-white text-sm">{designer.tagline}</p>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-zinc-400 text-sm mb-4 line-clamp-3">
          {designer.description}
        </p>
        
        {/* Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <MapPin size={14} />
            {designer.location}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Calendar size={14} />
            Est. {designer.yearFounded}
          </div>
        </div>
        
        {/* Specialties */}
        <div className="flex flex-wrap gap-2 mb-4">
          {designer.specialties.slice(0, 2).map((specialty: string) => (
            <span key={specialty} className="bg-zinc-800 text-zinc-400 px-2 py-1 rounded text-xs">
              {specialty}
            </span>
          ))}
          {designer.specialties.length > 2 && (
            <span className="text-zinc-500 text-xs">
              +{designer.specialties.length - 2} more
            </span>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <a 
              href={`https://instagram.com/${designer.socialLinks.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition"
              onClick={(e) => e.stopPropagation()}
            >
              <Instagram size={16} />
            </a>
            <a 
              href={`https://${designer.socialLinks.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe size={16} />
            </a>
          </div>
          <span className="text-xs text-zinc-500">
            {designer.productCount} products
          </span>
        </div>
      </div>
    </Link>
  );
} 