"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Instagram, Globe, Heart, ShoppingCart, User, X } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";
import { TierBadge } from '@/lib/tierUtils';
import { useCart } from '@/contexts/CartContext';
import { CartSidebar } from '@/components/CartSidebar';
import { supabase } from '@/lib/supabase';

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

export default function DesignerProfile({ params }: { params: { slug: string } }) {
  const [designer, setDesigner] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use global cart
  const { cartItemCount, addToCart, setIsCartOpen, isCartShaking } = useCart();

  // Load designer data from database
  useEffect(() => {
    const loadDesignerData = async () => {
      try {
        setLoading(true);
        console.log('Loading designer data for slug:', params.slug);
        
        // Query the designers table for all approved designers
        const { data: designersData, error } = await supabase
          .from('designers')
          .select('*, sales_total')
          .eq('status', 'approved')
          .not('brand_name', 'is', null);

        if (error) {
          console.error('Error loading designers:', error);
          setError('Failed to load designer data');
          return;
        }

        if (!designersData || designersData.length === 0) {
          setError('No approved designers found');
          return;
        }

        // Find designer with matching slug
        const matchingDesigner = designersData.find(d => {
          const designerSlug = d.brand_name?.toLowerCase().replace(/\s+/g, '-');
          return designerSlug === params.slug;
        });

        if (!matchingDesigner) {
          console.log('Available designers:', designersData.map(d => ({
            name: d.brand_name,
            slug: d.brand_name?.toLowerCase().replace(/\s+/g, '-')
          })));
          setError('Designer not found');
          return;
        }

        const transformedDesigner = transformDesignerData(matchingDesigner);
        setDesigner(transformedDesigner);

        // Load all active products for this designer (not just live ones)
        const { data: productsData, error: productsError } = await supabase
          .from('designer_products')
          .select('*')
          .eq('designer_id', matchingDesigner.id)
          .eq('is_active', true); // Show all active products, not just live ones

        if (productsError) {
          console.error('Error loading products:', productsError);
        } else {
          setProducts(productsData || []);
        }
      } catch (error) {
        console.error('Error loading designer data:', error);
        setError('Failed to load designer data');
      } finally {
        setLoading(false);
      }
    };

    loadDesignerData();
  }, [params.slug]);

  // Transform database data to match the expected format
  const transformDesignerData = (data: any) => {
    return {
      id: data.id,
      name: data.brand_name,
      slug: data.brand_name?.toLowerCase().replace(/\s+/g, '-'),
      logo: data.logo_url || 'placeholder',
      tagline: data.short_description || 'Romanian fashion designer',
      description: data.long_description || data.short_description || 'A talented Romanian fashion designer.',
      story: data.long_description || data.short_description || 'A passionate designer creating beautiful fashion pieces.',
      location: data.city ? `${data.city}, Romania` : 'Romania',
      yearFounded: data.year_founded || new Date().getFullYear(),
      specialties: data.specialties || ['Fashion Design'],
      salesTotal: parseFloat(data.sales_total) || 0,
      socialLinks: {
        instagram: data.instagram || '',
        website: data.website || ''
      },
      isUpcoming: false,
      heroImage: data.logo_url || 'placeholder',
      products: [] // For now, we'll show empty products since we removed product management
    };
  };

  // Loading state
  if (loading) {
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
                  className={`relative p-2 hover:bg-zinc-800 rounded-full transition ${isCartShaking ? 'animate-cart-shake' : ''}`}
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

        {/* Loading Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
            <p className="text-zinc-400">Loading designer profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !designer) {
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
                className={`relative p-2 hover:bg-zinc-800 rounded-full transition ${isCartShaking ? 'animate-cart-shake' : ''}`}
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

      {/* Error Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="text-center">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-8 max-w-md mx-auto">
              <User size={48} className="mx-auto mb-4 text-zinc-400" />
              <h1 className="text-2xl font-bold mb-4">Designer Not Found</h1>
              <p className="text-zinc-400 mb-6">
                {error || 'The designer you\'re looking for doesn\'t exist or hasn\'t been approved yet.'}
              </p>
              <Link 
                href="/designers" 
                className="inline-block bg-white text-zinc-900 px-6 py-3 rounded-lg font-medium hover:bg-zinc-200 transition"
              >
                Browse All Designers
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                className={`relative p-2 hover:bg-zinc-800 rounded-full transition ${isCartShaking ? 'animate-cart-shake' : ''}`}
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
                {designer.logo && designer.logo !== 'placeholder' ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-800">
                    <Image
                      src={designer.logo}
                      alt={designer.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <PlaceholderImage 
                    type="logo" 
                    alt={designer.name}
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-white">{designer.name}</h1>
                    <TierBadge salesTotal={designer.salesTotal} size="lg" />
                  </div>
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
                {designer.socialLinks.instagram && (
                  <a 
                    href={`https://instagram.com/${designer.socialLinks.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
                  >
                    <Instagram size={20} />
                    {designer.socialLinks.instagram}
                  </a>
                )}
                {designer.socialLinks.website && (
                  <a 
                    href={designer.socialLinks.website.startsWith('http') ? designer.socialLinks.website : `https://${designer.socialLinks.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
                  >
                    <Globe size={20} />
                    Website
                  </a>
                )}
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative">
              {designer.heroImage && designer.heroImage !== 'placeholder' ? (
                <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-zinc-800">
                  <Image
                    src={designer.heroImage}
                    alt={`${designer.name} hero`}
                    width={400}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <PlaceholderImage 
                  type="hero" 
                  alt={`${designer.name} hero`}
                  className="w-full aspect-[4/5] rounded-xl"
                />
              )}
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

      {/* Products Section */}
      <section className="relative z-10 py-16 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Collection</h2>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  designer={designer}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-8 max-w-md mx-auto">
                <ShoppingCart size={48} className="mx-auto mb-4 text-zinc-400" />
                <h3 className="text-xl font-semibold mb-2">Products Coming Soon</h3>
                <p className="text-zinc-400 mb-4">
                  {designer.name} is preparing their amazing collection. 
                  Check back soon to discover their latest designs!
                </p>
                {designer.socialLinks.instagram && (
                  <a 
                    href={`https://instagram.com/${designer.socialLinks.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-200 transition"
                  >
                    Follow on Instagram
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Discover More</h2>
          <p className="text-zinc-400 mb-8">
            Explore more talented Romanian designers and their amazing creations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/designers"
              className="bg-white text-zinc-900 px-8 py-3 rounded-lg font-medium hover:bg-zinc-200 transition"
            >
              Browse All Designers
            </Link>
            {designer.socialLinks.website && (
              <a 
                href={designer.socialLinks.website.startsWith('http') ? designer.socialLinks.website : `https://${designer.socialLinks.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-zinc-600 text-white px-8 py-3 rounded-lg font-medium hover:border-zinc-500 transition"
              >
                Visit Website
              </a>
            )}
          </div>
        </div>
      </section>
      
      {/* Global Shopping Cart Sidebar */}
      <CartSidebar />
    </div>
  );
}

// Product Card Component
function ProductCard({ product, designer, onAddToCart }: { 
  product: any; 
  designer: any;
  onAddToCart: (product: any, size: string, color: string) => void; 
}) {
  const [showModal, setShowModal] = useState(false);

  // Handle colors - it might be a string or already an object
  let colors = [];
  try {
    if (typeof product.colors === 'string') {
      colors = JSON.parse(product.colors);
    } else if (Array.isArray(product.colors)) {
      colors = product.colors;
    } else {
      colors = [];
    }
  } catch (error) {
    console.error('Error parsing colors:', error);
    colors = [];
  }
  
  const firstColor = colors[0];
  const firstImage = firstColor?.images?.[0];
  
  // Calculate total variants
  const totalVariants = colors.reduce((total: number, color: any) => {
    return total + (color.sizes?.length || 0);
  }, 0);

  const handleQuickAdd = () => {
    // For quick add, use the first available variant if there's only one size
    if (firstColor && firstColor.sizes?.length === 1) {
      const productForCart = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: firstImage || '/placeholder-product.jpg',
        designer: { name: designer.name, logo: designer.logo }
      };
      onAddToCart(productForCart, firstColor.sizes[0].size, firstColor.name);
    } else {
      // If multiple variants, show modal for selection
      setShowModal(true);
    }
  };

  const handleModalAddToCart = (product: any, size: string, color: string) => {
    onAddToCart(product, size, color);
    setShowModal(false);
  };

  return (
    <>
      <div className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition group">
        {/* Product Image */}
        <div className="aspect-[4/3] bg-zinc-800 relative overflow-hidden">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <PlaceholderImage 
              type="product" 
              alt={product.name}
              className="w-full h-full"
            />
          )}
          
          {/* Add to Cart Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={handleQuickAdd}
              className="bg-white text-zinc-900 px-6 py-2 rounded-lg font-medium hover:bg-zinc-200 transition flex items-center gap-2"
            >
              <ShoppingCart size={16} />
              {totalVariants > 1 ? 'Select Options' : 'Add to Cart'}
            </button>
          </div>
        </div>
        
        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-zinc-400 text-sm mb-3 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold">{product.price} lei</span>
            <div className="flex items-center gap-1 text-sm text-zinc-400">
              <span>{colors.length} colors</span>
              <span>•</span>
              <span>{totalVariants} variants</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Selection Modal */}
      {showModal && (
        <ProductModal 
          product={product}
          onClose={() => setShowModal(false)}
          onAddToCart={handleModalAddToCart}
        />
      )}
    </>
  );
}

// Product Modal Component (similar to shop page)
function ProductModal({ product, onClose, onAddToCart }: {
  product: any;
  onClose: () => void;
  onAddToCart: (product: any, size: string, color: string) => void;
}) {
  // Handle colors - it might be a string or already an object
  let colors = [];
  try {
    if (typeof product.colors === 'string') {
      colors = JSON.parse(product.colors);
    } else if (Array.isArray(product.colors)) {
      colors = product.colors;
    } else {
      colors = [];
    }
  } catch (error) {
    console.error('Error parsing colors:', error);
    colors = [];
  }

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');

  const selectedColor = colors[selectedColorIndex];
  
  // Get available sizes for selected color
  const availableSizes = selectedColor?.sizes || [];
  
  // Set default size when color changes
  useEffect(() => {
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0].size);
    }
  }, [selectedColorIndex, availableSizes]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddToCart = () => {
    if (selectedColor && selectedSize) {
      const productForCart = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: selectedColor.images?.[0] || '/placeholder-product.jpg',
        designer: { 
          name: product.designers?.brand_name || 'Designer', 
          logo: product.designers?.logo_url || '' 
        }
      };
      onAddToCart(productForCart, selectedSize, selectedColor.name);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center p-0 md:p-4 z-[9999]" 
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-zinc-900 rounded-t-xl md:rounded-xl w-full md:max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg md:text-xl font-bold pr-2 flex-1">{product.name}</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-zinc-800 rounded mobile-touch-target flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6">
            {/* Product Image */}
            <div className="w-full max-w-[200px] md:max-w-none aspect-[3/4] bg-zinc-800 rounded-lg overflow-hidden mx-auto md:mx-0">
              {selectedColor?.images?.[0] ? (
                <Image
                  src={selectedColor.images[0]}
                  alt={product.name}
                  width={200}
                  height={267}
                  className="w-full h-full object-cover"
                />
              ) : (
                <PlaceholderImage 
                  type="product" 
                  alt={product.name}
                  className="w-full h-full"
                />
              )}
            </div>
            
            {/* Product Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl md:text-2xl font-bold">{product.price} lei</span>
                </div>
              </div>
              
              <p className="text-zinc-300 text-sm md:text-base">{product.description || 'No description available.'}</p>
              
              {/* Color Selection */}
              {colors.length > 1 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium block">Color: {selectedColor?.name}</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color: any, index: number) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedColorIndex(index);
                        }}
                        className={`px-4 py-3 rounded-lg border text-sm transition mobile-touch-target ${
                          selectedColorIndex === index
                            ? 'border-white bg-white text-zinc-900'
                            : 'border-zinc-600 hover:border-zinc-500'
                        }`}
                      >
                        {color.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <div className="space-y-3 bg-zinc-800/30 p-4 rounded-lg border border-zinc-700">
                  <label className="text-sm font-medium block text-white">Select Size</label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {availableSizes.map((sizeObj: any) => (
                      <button
                        key={sizeObj.size}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSize(sizeObj.size);
                        }}
                        disabled={sizeObj.stock === 0}
                        className={`py-3 px-2 rounded-lg border text-sm font-medium transition mobile-touch-target ${
                          selectedSize === sizeObj.size
                            ? 'border-white bg-white text-zinc-900'
                            : sizeObj.stock === 0
                            ? 'border-zinc-700 text-zinc-500 cursor-not-allowed bg-zinc-800/50'
                            : 'border-zinc-600 hover:border-zinc-500 bg-zinc-800/50'
                        }`}
                      >
                        {sizeObj.size}
                        {sizeObj.stock === 0 && <div className="text-xs mt-1">Out</div>}
                      </button>
                    ))}
                  </div>
                  {selectedSize && (
                    <p className="text-xs text-zinc-400 mt-2">Selected: {selectedSize}</p>
                  )}
                </div>
              )}
              
              {/* Add to Cart Button */}
              <div className="pt-4 border-t border-zinc-700 md:border-t-0 md:pt-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart();
                  }}
                  disabled={!selectedSize || availableSizes.find((s: any) => s.size === selectedSize)?.stock === 0}
                  className="w-full bg-white text-zinc-900 py-4 md:py-3 rounded-lg font-medium hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed mobile-touch-target text-base"
                >
                  {!selectedSize ? 'Select Size to Add to Cart' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 