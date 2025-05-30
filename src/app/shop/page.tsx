"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, X, Plus, Minus, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { CartSidebar as GlobalCartSidebar } from '@/components/CartSidebar';
import { useDesignerAuth } from '@/contexts/DesignerAuthContext';
import { supabase } from '@/lib/supabase';

// Placeholder component for images
// Stock status display component
function StockStatusBadge({ stockStatus }: { stockStatus: 'in_stock' | 'made_to_order' | 'coming_soon' }) {
  const statusConfig = {
    in_stock: { 
      label: 'In Stock', 
      color: 'bg-green-500/20 text-green-400 border-green-500/30' 
    },
    made_to_order: { 
      label: 'Made to Order', 
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
    },
    coming_soon: { 
      label: 'Coming Soon', 
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
    }
  };

  const config = statusConfig[stockStatus];
  
  return (
    <span className={`px-2 py-1 rounded-lg border text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

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

// Mock data - using placeholders instead of actual images
const mockDesigners = [
  { id: 2, name: "Atelier Mia", logo: "atelier-mia", isActive: false },
  { id: 3, name: "Urban Luna", logo: "urban-luna", isActive: false },
  { id: 4, name: "Vestige Co", logo: "vestige-co", isActive: false },
  { id: 5, name: "Nova Studio", logo: "nova-studio", isActive: false },
];

const mockProducts = [
  {
    id: 1,
    name: "Silk Evening Dress",
    price: 450,
    originalPrice: 600,
    image: "silk-evening-dress",
    designer: { name: "Atelier Mia", logo: "atelier-mia" },
    isUpcoming: false,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "Navy", "Burgundy"],
    stockStatus: "in_stock" as const
  },
  {
    id: 2,
    name: "Oversized Blazer",
    price: 280,
    image: "oversized-blazer",
    designer: { name: "Urban Luna", logo: "urban-luna" },
    isUpcoming: false,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Charcoal", "Camel"],
    stockStatus: "made_to_order" as const
  },
  {
    id: 3,
    name: "Handwoven Scarf",
    price: 120,
    image: "handwoven-scarf",
    designer: { name: "Vestige Co", logo: "vestige-co" },
    isUpcoming: true,
    sizes: ["One Size"],
    colors: ["Terracotta", "Forest Green", "Cream"],
    stockStatus: "coming_soon" as const
  },
  {
    id: 4,
    name: "Minimalist Tote",
    price: 195,
    image: "minimalist-tote",
    designer: { name: "Nova Studio", logo: "nova-studio" },
    isUpcoming: true,
    sizes: ["One Size"],
    colors: ["Black", "Tan", "White"],
    stockStatus: "coming_soon" as const
  },
];

function ShopContent() {
  const [selectedDesigner, setSelectedDesigner] = useState<number | null>(null);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showAllDesigners, setShowAllDesigners] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [cachedUser, setCachedUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [designers, setDesigners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use global cart
  const { cartItemCount, setIsCartOpen, addToCart } = useCart();
  
  // Use designer auth context
  const { user: authUser, designerProfile, loading: authLoading } = useDesignerAuth();

  // Load products and designers from database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load live products
        const { data: productsData, error: productsError } = await supabase
          .from('designer_products')
          .select(`
            *,
            designers (
              id,
              brand_name,
              logo_url
            )
          `)
          .eq('is_live', true);

        if (productsError) {
          console.error('Error loading products:', productsError);
        } else {
          setProducts(productsData || []);
        }

        // Load approved designers
        const { data: designersData, error: designersError } = await supabase
          .from('designers')
          .select('*')
          .eq('status', 'approved')
          .not('brand_name', 'is', null);

        if (designersError) {
          console.error('Error loading designers:', designersError);
        } else {
          setDesigners(designersData || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
    if (!authUser && !authLoading) {
      setCachedUser(null);
    }
  }, [authUser, authLoading]);

  // Reduce initial loading time for better UX
  useEffect(() => {
    if (!authLoading) {
      setInitialLoad(false);
    }
  }, [authLoading]);

  const filteredProducts = products.filter(product => {
    const designerFilter = selectedDesigner === null || product.designers?.id === selectedDesigner;
    return designerFilter;
  });

  const handleAddToCart = (product: any, size: string, color: string) => {
    addToCart(product, size, color);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm h-20 safe-area-top mobile-header">
        <div className="max-w-7xl mx-auto px-4 py-4 h-full">
          <div className="flex items-center justify-between">
            <Link href="/" className="mobile-touch-target">
              <Image
                src="/wlogo.png"
                alt="Baguri"
                width={120}
                height={30}
                className="h-8 w-auto object-contain"
                style={{ filter: "invert(1) brightness(2)" }}
              />
            </Link>
            
            <div className="flex items-center gap-2 md:gap-4">
              {/* All Designers - Hidden on mobile */}
              <Link 
                href="/designers"
                className="hidden md:flex px-4 py-2 border border-zinc-600 text-white rounded-full font-medium hover:border-zinc-500 transition mobile-touch-target"
              >
                All Designers
              </Link>
              
              {loading && !authUser && !cachedUser ? (
                <div className="w-8 h-8 bg-zinc-800 rounded-full animate-pulse mobile-loading"></div>
              ) : authUser || cachedUser ? (
                <div className="flex items-center gap-2 md:gap-3">
                  <Link 
                    href="/designer-dashboard"
                    className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-full font-medium hover:bg-zinc-700 transition group mobile-touch-target"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">
                      {(authUser?.email || cachedUser?.email)?.charAt(0).toUpperCase() || 'D'}
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium text-white mobile-truncate">
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
                </div>
              ) : (
                <Link 
                  href="/designer-auth"
                  className="px-2 md:px-4 py-2 bg-white text-zinc-900 rounded-full font-medium hover:bg-zinc-200 transition text-xs md:text-sm mobile-touch-target"
                >
                  <span className="hidden sm:inline">Become a Designer</span>
                  <span className="sm:hidden">Designer</span>
                </Link>
              )}
              
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-zinc-800 rounded-full transition mobile-touch-target"
              >
                <ShoppingCart size={20} className="md:w-6 md:h-6" />
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

      {/* Designer Filter Bar */}
      <div className="fixed top-20 left-0 right-0 z-30 border-b border-zinc-800 bg-zinc-900/30 backdrop-blur-sm mobile-header">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 overflow-x-auto mobile-gap-3">
            <button
              onClick={() => setSelectedDesigner(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition mobile-touch-target ${
                selectedDesigner === null
                  ? 'bg-white text-zinc-900'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              All Designers
            </button>
            
            {designers
              .slice(0, showAllDesigners ? designers.length : 4)
              .map((designer) => (
                <button
                  key={designer.id}
                  onClick={() => setSelectedDesigner(designer.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition mobile-touch-target ${
                    selectedDesigner === designer.id
                      ? 'bg-white text-zinc-900'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {designer.logo_url ? (
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <Image
                        src={designer.logo_url}
                        alt={designer.brand_name}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <PlaceholderImage 
                      type="logo" 
                      alt={designer.brand_name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="mobile-text-sm">{designer.brand_name}</span>
                </button>
              ))}
            
            {!showAllDesigners && designers.length > 4 && (
              <button
                onClick={() => setShowAllDesigners(true)}
                className="px-3 py-2 text-zinc-400 hover:text-white transition text-sm mobile-touch-target"
              >
                Show more
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8 pt-44 safe-area-bottom">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
              <p className="text-zinc-400">Loading products...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-8 max-w-md mx-auto">
              <ShoppingCart size={48} className="mx-auto mb-4 text-zinc-400" />
              <h3 className="text-xl font-semibold mb-2">No Products Available</h3>
              <p className="text-zinc-400">
                No live products found. Check back soon for new arrivals!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mobile-grid-2 mobile-gap-4">
            {filteredProducts.map((product) => {
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
              
              return (
                <div key={product.id} className="group cursor-pointer mobile-fade-in mobile-card" onClick={() => setSelectedProduct(product)}>
                  <div className="relative aspect-[3/4] bg-zinc-800 rounded-lg overflow-hidden mb-3">
                    <div className="absolute top-2 right-2 z-10">
                      <button className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition mobile-touch-target">
                        <Heart size={16} className="text-white" />
                      </button>
                    </div>
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
                        className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  
                  <div className="space-y-2 mobile-p-2">
                    <Link 
                      href={`/designer/${product.designers?.brand_name?.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center gap-2 hover:text-white transition mobile-touch-target"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {product.designers?.logo_url ? (
                        <div className="w-6 h-6 rounded-full overflow-hidden">
                          <Image
                            src={product.designers.logo_url}
                            alt={product.designers.brand_name}
                            width={24}
                            height={24}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <PlaceholderImage 
                          type="logo" 
                          alt={product.designers?.brand_name || 'Designer'}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="text-xs text-zinc-400 font-medium hover:text-white transition mobile-text-xs mobile-truncate">{product.designers?.brand_name}</span>
                    </Link>
                    
                    <h3 className="font-medium text-white group-hover:text-white transition mobile-text-sm mobile-line-clamp-2">{product.name}</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg mobile-text-base">{product.price} lei</span>
                      </div>
                      <StockStatusBadge stockStatus={product.stock_status || 'in_stock'} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Global Shopping Cart Sidebar */}
      <GlobalCartSidebar />
    </div>
  );
}

// Product Modal Component
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
  const availableSizes = selectedColor?.sizes || [];
  
  // Set default size when color changes
  useEffect(() => {
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0].size);
    }
  }, [selectedColorIndex, availableSizes]);

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 safe-area-inset" onClick={onClose}>
      <div className="bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mobile-modal mobile-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 mobile-p-4">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold mobile-text-lg mobile-line-clamp-2">{product.name}</h2>
            <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded mobile-touch-target">
              <X size={20} />
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mobile-gap-4">
            {/* Product Image */}
            <div className="aspect-[3/4] bg-zinc-800 rounded-lg overflow-hidden">
              {selectedColor?.images?.[0] ? (
                <Image
                  src={selectedColor.images[0]}
                  alt={product.name}
                  width={400}
                  height={500}
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
            <div className="space-y-4 mobile-gap-3">
              <Link 
                href={`/designer/${product.designers?.brand_name?.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-2 hover:text-white transition mobile-touch-target"
              >
                {product.designers?.logo_url ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={product.designers.logo_url}
                      alt={product.designers.brand_name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <PlaceholderImage 
                    type="logo" 
                    alt={product.designers?.brand_name || 'Designer'}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-zinc-400 font-medium hover:text-white transition mobile-text-sm">{product.designers?.brand_name}</span>
              </Link>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold mobile-text-xl">{product.price} lei</span>
                </div>
                <StockStatusBadge stockStatus={product.stock_status || 'in_stock'} />
              </div>
              
              <p className="text-zinc-300 mobile-text-sm">{product.description}</p>
              
              {/* Color Selection */}
              {colors.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color: {selectedColor?.name}</label>
                  <div className="flex gap-2">
                    {colors.map((color: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColorIndex(index)}
                        className={`px-3 py-2 rounded-lg border text-sm transition mobile-touch-target ${
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Size</label>
                  <div className="grid grid-cols-4 gap-2">
                    {availableSizes.map((sizeObj: any) => (
                      <button
                        key={sizeObj.size}
                        onClick={() => setSelectedSize(sizeObj.size)}
                        disabled={sizeObj.stock === 0}
                        className={`py-2 rounded-lg border text-sm transition mobile-touch-target ${
                          selectedSize === sizeObj.size
                            ? 'border-white bg-white text-zinc-900'
                            : sizeObj.stock === 0
                            ? 'border-zinc-700 text-zinc-500 cursor-not-allowed'
                            : 'border-zinc-600 hover:border-zinc-500'
                        }`}
                      >
                        {sizeObj.size}
                        {sizeObj.stock === 0 && <div className="text-xs">Out</div>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!selectedColor || !selectedSize || availableSizes.find((s: any) => s.size === selectedSize)?.stock === 0}
                className="w-full bg-white text-zinc-900 py-3 rounded-lg font-medium hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed mobile-touch-target"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <ShopContent />
  );
}