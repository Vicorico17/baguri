"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Instagram, Globe, Heart, ShoppingCart } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";
import { useCart } from '@/contexts/CartContext';
import { CartSidebar } from '@/components/CartSidebar';

// Placeholder component for images
function PlaceholderImage({ type, className, alt }: { type: 'product' | 'logo' | 'hero'; className?: string; alt: string }) {
  const colors = {
    product: ['bg-gradient-to-br from-amber-100 to-amber-200', 'bg-gradient-to-br from-zinc-100 to-zinc-300', 'bg-gradient-to-br from-emerald-100 to-emerald-200', 'bg-gradient-to-br from-rose-100 to-rose-200'],
    logo: ['bg-amber-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500'],
    hero: ['bg-gradient-to-br from-amber-200 to-amber-300', 'bg-gradient-to-br from-zinc-200 to-zinc-400', 'bg-gradient-to-br from-emerald-200 to-emerald-300', 'bg-gradient-to-br from-rose-200 to-rose-300']
  };
  
  const colorIndex = alt.length % colors[type].length;
  const bgColor = colors[type][colorIndex];
  
  return (
    <div className={`${bgColor} flex items-center justify-center ${className}`}>
      <span className="text-zinc-600 text-xs font-bold opacity-50">
        {type === 'logo' ? alt.substring(0, 2).toUpperCase() : type === 'hero' ? 'HERO' : 'IMG'}
      </span>
    </div>
  );
}

// Extended mock data for designers
const mockDesigners: { [key: string]: any } = {
  'atelier-mia': {
    id: 2,
    name: "Atelier Mia",
    slug: "atelier-mia",
    logo: "atelier-mia",
    tagline: "Timeless elegance meets modern sophistication",
    description: "Founded in 2019 in Bucharest, Atelier Mia creates luxury evening wear that celebrates the Romanian woman's grace and strength. Each piece is meticulously handcrafted using traditional techniques passed down through generations.",
    story: "Mia started her journey as a fashion designer after studying at the prestigious Fashion Institute in Milano. Her vision was to bring back the elegance of Romanian haute couture while incorporating contemporary design elements that speak to the modern woman.",
    location: "Bucharest, Romania",
    yearFounded: 2019,
    specialties: ["Evening Wear", "Bridal", "Cocktail Dresses"],
    socialLinks: {
      instagram: "@atelier.mia",
      website: "www.ateliermia.ro"
    },
    isUpcoming: false,
    heroImage: "atelier-mia-hero",
    products: [
      {
        id: 1,
        name: "Silk Evening Dress",
        price: 450,
        originalPrice: 600,
        image: "silk-evening-dress",
        sizes: ["XS", "S", "M", "L"],
        colors: ["Black", "Navy", "Burgundy"],
        isUpcoming: false
      },
      {
        id: 5,
        name: "Vintage Inspired Gown",
        price: 680,
        image: "vintage-gown",
        sizes: ["XS", "S", "M", "L", "XL"],
        colors: ["Emerald", "Midnight Blue"],
        isUpcoming: false
      }
    ]
  },
  'urban-luna': {
    id: 3,
    name: "Urban Luna",
    slug: "urban-luna",
    logo: "urban-luna",
    tagline: "Streetwear with a Romanian soul",
    description: "Urban Luna bridges the gap between street fashion and Romanian heritage. Our pieces are designed for the urban explorer who isn't afraid to stand out while honoring their roots.",
    story: "Born from the vibrant streets of Cluj-Napoca, Urban Luna represents the new generation of Romanian designers who see fashion as a form of cultural expression and rebellion against fast fashion.",
    location: "Cluj-Napoca, Romania",
    yearFounded: 2021,
    specialties: ["Streetwear", "Oversized Silhouettes", "Sustainable Fashion"],
    socialLinks: {
      instagram: "@urban.luna.ro",
      website: "www.urbanluna.com"
    },
    isUpcoming: false,
    heroImage: "urban-luna-hero",
    products: [
      {
        id: 2,
        name: "Oversized Blazer",
        price: 280,
        image: "oversized-blazer",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Charcoal", "Camel"],
        isUpcoming: false
      }
    ]
  },
  'vestige-co': {
    id: 4,
    name: "Vestige Co",
    slug: "vestige-co",
    logo: "vestige-co",
    tagline: "Preserving craftsmanship for tomorrow",
    description: "Vestige Co specializes in handwoven accessories that tell the story of Romanian textile traditions. Every piece is created in partnership with local artisans from Maramureș.",
    story: "Vestige Co was born from a desire to preserve traditional Romanian weaving techniques that were slowly disappearing. We work directly with artisan families to create contemporary pieces that honor ancestral knowledge.",
    location: "Maramureș, Romania",
    yearFounded: 2020,
    specialties: ["Handwoven Accessories", "Traditional Crafts", "Sustainable Materials"],
    socialLinks: {
      instagram: "@vestige.co",
      website: "www.vestigeco.ro"
    },
    isUpcoming: true,
    heroImage: "vestige-co-hero",
    products: [
      {
        id: 3,
        name: "Handwoven Scarf",
        price: 120,
        image: "handwoven-scarf",
        sizes: ["One Size"],
        colors: ["Terracotta", "Forest Green", "Cream"],
        isUpcoming: true
      }
    ]
  },
  'nova-studio': {
    id: 5,
    name: "Nova Studio",
    slug: "nova-studio",
    logo: "nova-studio",
    tagline: "Minimalism redefined",
    description: "Nova Studio creates clean, functional pieces for the contemporary lifestyle. Our philosophy centers around 'less is more' while ensuring every detail serves a purpose.",
    story: "Founded by a team of young designers in Timișoara, Nova Studio challenges the notion that Romanian fashion must be ornate. We believe in the power of simplicity and the beauty of purposeful design.",
    location: "Timișoara, Romania",
    yearFounded: 2022,
    specialties: ["Minimalist Design", "Functional Fashion", "Geometric Patterns"],
    socialLinks: {
      instagram: "@nova.studio.ro",
      website: "www.novastudio.ro"
    },
    isUpcoming: true,
    heroImage: "nova-studio-hero",
    products: [
      {
        id: 4,
        name: "Minimalist Tote",
        price: 195,
        image: "minimalist-tote",
        sizes: ["One Size"],
        colors: ["Black", "Tan", "White"],
        isUpcoming: true
      }
    ]
  }
};

export default function DesignerProfile({ params }: { params: { slug: string } }) {
  const designer = mockDesigners[params.slug];
  
  // Use global cart
  const { cartItemCount, addToCart, setIsCartOpen } = useCart();

  if (!designer) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Designer Not Found</h1>
          <Link href="/shop" className="text-amber-200 hover:underline">
            ← Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleQuickAdd = (product: any) => {
    // Add designer info to product and add to cart with default size and color
    const productWithDesigner = {
      ...product,
      designer: {
        name: designer.name,
        logo: designer.logo
      }
    };
    addToCart(productWithDesigner, product.sizes[0], product.colors[0]);
  };

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
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-zinc-800 rounded-full transition"
              >
                <ShoppingCart size={24} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-zinc-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-16 pt-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Designer Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <PlaceholderImage 
                  type="logo" 
                  alt={designer.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h1 className="text-4xl font-bold text-white">{designer.name}</h1>
                  <p className="text-white text-lg">{designer.tagline}</p>
                  {designer.isUpcoming && (
                    <span className="inline-block mt-2 bg-white text-zinc-900 px-3 py-1 rounded-full text-sm font-bold">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-zinc-300 text-lg leading-relaxed">
                {designer.description}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-zinc-400">
                <span>📍 {designer.location}</span>
                <span>📅 Est. {designer.yearFounded}</span>
              </div>
              
              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a 
                  href={`https://instagram.com/${designer.socialLinks.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
                >
                  <Instagram size={20} />
                  {designer.socialLinks.instagram}
                </a>
                <a 
                  href={`https://${designer.socialLinks.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
                >
                  <Globe size={20} />
                  Website
                </a>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative">
              <PlaceholderImage 
                type="hero" 
                alt={`${designer.name} hero`}
                className="w-full aspect-[4/5] rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="relative z-10 py-16 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Our Story</h2>
          <p className="text-zinc-300 text-lg leading-relaxed text-center">
            {designer.story}
          </p>
        </div>
      </section>

      {/* Specialties */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Specialties</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {designer.specialties.map((specialty: string) => (
              <span 
                key={specialty}
                className="bg-zinc-800 text-zinc-300 px-4 py-2 rounded-full text-sm"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="relative z-10 py-16 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">
            {designer.isUpcoming ? 'Upcoming Collection' : 'Current Collection'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {designer.products.map((product: any) => (
              <div key={product.id} className="group">
                <div className="relative aspect-[3/4] bg-zinc-800 rounded-lg overflow-hidden mb-3">
                  {product.isUpcoming && (
                    <div className="absolute top-2 left-2 bg-white text-zinc-900 px-2 py-1 rounded-full text-xs font-bold z-10">
                      Coming Soon
                    </div>
                  )}
                  <div className="absolute top-2 right-2 z-10">
                    <button className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition">
                      <Heart size={16} className="text-white" />
                    </button>
                  </div>
                  <PlaceholderImage 
                    type="product" 
                    alt={product.name}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-white group-hover:text-white transition">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{product.price} lei</span>
                    {product.originalPrice && (
                      <span className="text-sm text-zinc-500 line-through">{product.originalPrice} lei</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {product.colors.slice(0, 3).map((color: string) => (
                      <span key={color} className="text-xs text-zinc-400">
                        {color}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleQuickAdd(product)}
                    disabled={product.isUpcoming}
                    className={`w-full py-2 rounded-lg font-medium transition text-sm ${
                      product.isUpcoming
                        ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                        : 'bg-white text-zinc-900 hover:bg-zinc-200'
                    }`}
                  >
                    {product.isUpcoming ? 'Coming Soon' : 'Quick Add'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Discover More</h2>
          <p className="text-zinc-400 mb-8">
            Explore our full collection and experience Romanian fashion at its finest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/shop"
              className="bg-white text-zinc-900 px-8 py-3 rounded-lg font-medium hover:bg-zinc-200 transition"
            >
              Browse All Products
            </Link>
            <a 
              href={`https://${designer.socialLinks.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-zinc-600 text-white px-8 py-3 rounded-lg font-medium hover:border-zinc-500 transition"
            >
              Visit Website
            </a>
          </div>
        </div>
      </section>
      
      {/* Global Shopping Cart Sidebar */}
      <CartSidebar />
    </div>
  );
} 