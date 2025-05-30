"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Instagram, Globe, MapPin, Calendar, User } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";
import { useDesignerAuth } from '@/contexts/DesignerAuthContext';
import { supabase } from '@/lib/supabase';

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

export default function DesignersPage() {
  const [cachedUser, setCachedUser] = useState<any>(null);
  const [designers, setDesigners] = useState<any[]>([]);
  const [loadingDesigners, setLoadingDesigners] = useState(true);
  
  // Use designer auth context
  const { user: authUser, designerProfile, loading } = useDesignerAuth();

  // Check for cached user data on initial load for faster UI
  useEffect(() => {
    const checkCachedSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCachedUser(session.user);
        } else {
          setCachedUser(null);
        }
      } catch (error) {
        // Ignore errors, just don't show cached user
        setCachedUser(null);
      }
    };
    
    checkCachedSession();
  }, []);

  // Clear cached user when auth user is null (logged out)
  useEffect(() => {
    if (!authUser && !loading) {
      setCachedUser(null);
    }
  }, [authUser, loading]);

  // Load approved designers from database
  useEffect(() => {
    const loadApprovedDesigners = async () => {
      try {
        setLoadingDesigners(true);
        console.log('Loading approved designers...');
        
        const { data: approvedDesigners, error } = await supabase
          .from('designers')
          .select(`
            *
          `)
          .eq('status', 'approved')
          .not('brand_name', 'is', null)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading approved designers:', error);
          // Fall back to empty array if there's an error
          setDesigners([]);
          return;
        }

        console.log('Approved designers loaded:', approvedDesigners?.length || 0);
        
        // Transform database data to match the expected format
        const transformedDesigners = (approvedDesigners || []).map((designer, index) => ({
          id: designer.id,
          brandName: designer.brand_name,
          slug: designer.brand_name?.toLowerCase().replace(/\s+/g, '-') || `designer-${index}`,
          logo: designer.logo_url || 'placeholder',
          tagline: designer.short_description || 'Romanian fashion designer',
          description: designer.long_description || designer.short_description || 'A talented Romanian fashion designer.',
          location: designer.city ? `${designer.city}, Romania` : 'Romania',
          yearFounded: designer.year_founded || new Date().getFullYear(),
          specialties: designer.specialties || ['Fashion Design'],
          salesTotal: parseFloat(designer.sales_total) || 0,
          socialLinks: {
            instagram: designer.instagram || '',
            website: designer.website || ''
          },
          isUpcoming: false,
          productCount: 0 // We'll need to add this later when we have products
        }));

        setDesigners(transformedDesigners);
      } catch (error) {
        console.error('Error loading designers:', error);
        setDesigners([]);
      } finally {
        setLoadingDesigners(false);
      }
    };

    loadApprovedDesigners();
  }, []);

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
              
              {loading && !authUser && !cachedUser ? (
                <div className="w-8 h-8 bg-zinc-800 rounded-full animate-pulse"></div>
              ) : authUser || cachedUser ? (
                <Link 
                  href="/designer-dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-full font-medium hover:bg-zinc-700 transition group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">
                    {(authUser?.email || cachedUser?.email)?.charAt(0).toUpperCase() || 'D'}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-white">
                      {authUser?.user_metadata?.full_name || 
                       cachedUser?.user_metadata?.full_name || 
                       (authUser?.email || cachedUser?.email)?.split('@')[0] || 
                       'Designer'}
                    </span>
                    <span className="text-xs text-zinc-400 group-hover:text-zinc-300">
                      Dashboard
                    </span>
                  </div>
                </Link>
              ) : (
                <Link 
                  href="/designer-auth"
                  className="px-4 py-2 bg-white text-zinc-900 rounded-full font-medium hover:bg-zinc-200 transition"
                >
                  Become a Designer
                </Link>
              )}
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
          {loadingDesigners ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-zinc-400">Loading designers...</p>
            </div>
          ) : designers.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-8 max-w-md mx-auto">
                <User size={48} className="mx-auto mb-4 text-zinc-400" />
                <h3 className="text-xl font-semibold mb-2">No Designers Yet</h3>
                <p className="text-zinc-400 mb-4">
                  We&apos;re currently reviewing applications from talented Romanian designers. 
                  Check back soon to discover amazing brands!
                </p>
                {!(authUser || cachedUser) && (
                  <Link 
                    href="/designer-auth"
                    className="inline-block px-4 py-2 bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-200 transition"
                  >
                    Apply to Join
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {designers.map((designer) => (
                <DesignerCard key={designer.id} designer={designer} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-white text-lg font-semibold mb-4">
            Are you a Romanian designer?
          </p>
          {authUser || cachedUser ? (
            <Link 
              href="/designer-dashboard"
              className="inline-block bg-white text-zinc-900 px-6 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link 
              href="/designer-auth"
              className="inline-block bg-white text-zinc-900 px-6 py-2 rounded-lg text-sm font-medium hover:bg-zinc-200 transition"
            >
              Join Our Platform
            </Link>
          )}
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {designer.logo && designer.logo !== 'placeholder' ? (
              <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800">
                <Image
                  src={designer.logo}
                  alt={designer.brandName}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <PlaceholderImage 
                type="logo" 
                alt={designer.brandName}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white mb-2">{designer.brandName}</h3>
              </div>
              <p className="text-gray-400 text-sm">{designer.location}</p>
            </div>
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
            {designer.socialLinks.instagram && (
              <a 
                href={`https://instagram.com/${designer.socialLinks.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Instagram size={16} />
              </a>
            )}
            {designer.socialLinks.website && (
              <a 
                href={`https://${designer.socialLinks.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-white transition"
                onClick={(e) => e.stopPropagation()}
              >
                <Globe size={16} />
              </a>
            )}
          </div>
          <span className="text-xs text-zinc-500">
            {designer.productCount} products
          </span>
        </div>
      </div>
    </Link>
  );
} 