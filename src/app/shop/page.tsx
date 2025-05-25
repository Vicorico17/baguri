"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, X, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { CartSidebar as GlobalCartSidebar } from '@/components/CartSidebar';

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

export default function ShopPage() {
  const [selectedDesigner, setSelectedDesigner] = useState<number | null>(null);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showAllDesigners, setShowAllDesigners] = useState(false);
  const [designerProfile, setDesignerProfile] = useState<any>(null);
  
  // Use global cart
  const { cartItemCount, setIsCartOpen, addToCart } = useCart();

  // Check if designer is logged in
  useEffect(() => {
    const designerSession = localStorage.getItem('baguri-designer-session');
    if (designerSession) {
      try {
        const session = JSON.parse(designerSession);
        setDesignerProfile(session.user);
      } catch (error) {
        console.error('Error parsing designer session:', error);
      }
    }
  }, []);

  const filteredProducts = mockProducts.filter(product => {
    const designerFilter = selectedDesigner === null || product.designer.name === mockDesigners.find(d => d.id === selectedDesigner)?.name;
    const upcomingFilter = showUpcoming ? product.isUpcoming : !product.isUpcoming;
    return designerFilter && upcomingFilter;
  });

  const handleAddToCart = (product: any, size: string, color: string) => {
    addToCart(product, size, color);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
              <Link 
                href="/designers"
                className="px-4 py-2 border border-zinc-600 text-white rounded-full font-medium hover:border-zinc-500 transition"
              >
                All Designers
              </Link>
              
              {designerProfile ? (
                <Link 
                  href="/designer-dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-full font-medium hover:bg-amber-700 transition"
                >
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {designerProfile.email?.charAt(0).toUpperCase() || 'D'}
                  </div>
                  Designer Dashboard
                </Link>
              ) : (
                <Link 
                  href="/designer-auth"
                  className="px-4 py-2 bg-white text-zinc-900 rounded-full font-medium hover:bg-zinc-200 transition"
                >
                  Become a Designer
                </Link>
              )}
              
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

      {/* Designer Filter Bar */}
      <div className="fixed top-16 left-0 right-0 z-30 border-b border-zinc-800 bg-zinc-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 overflow-x-auto">
            <div className="flex items-center gap-2 mr-4">
              <button
                onClick={() => setShowUpcoming(false)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  !showUpcoming ? 'bg-white text-zinc-900' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Live
              </button>
              <button
                onClick={() => setShowUpcoming(true)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  showUpcoming ? 'bg-white text-zinc-900' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                Upcoming
              </button>
            </div>
            
            <div className="h-6 w-px bg-zinc-600"></div>
            
            <button
              onClick={() => setSelectedDesigner(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                selectedDesigner === null
                  ? 'bg-white text-zinc-900'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              All
            </button>
            
            {mockDesigners
              .slice(0, showAllDesigners ? mockDesigners.length : 2)
              .map((designer) => (
                <button
                  key={designer.id}
                  onClick={() => setSelectedDesigner(designer.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
                    selectedDesigner === designer.id
                      ? 'bg-white text-zinc-900'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <PlaceholderImage 
                    type="logo" 
                    alt={designer.name}
                    className="w-6 h-6 rounded-full"
                  />
                  {designer.name}
                </button>
              ))}
            
            {!showAllDesigners && mockDesigners.length > 2 && (
              <button
                onClick={() => setShowAllDesigners(true)}
                className="px-3 py-2 text-zinc-400 hover:text-white transition text-sm"
              >
                Show more
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8 pt-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group cursor-pointer" onClick={() => setSelectedProduct(product)}>
              <div className="relative aspect-[3/4] bg-zinc-800 rounded-lg overflow-hidden mb-3">
                {product.isUpcoming && (
                  <div className="absolute top-2 left-2 bg-amber-200 text-zinc-900 px-2 py-1 rounded-full text-xs font-bold z-10">
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
                <Link 
                  href={`/designer/${product.designer.logo}`}
                  className="flex items-center gap-2 hover:text-white transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PlaceholderImage 
                    type="logo" 
                    alt={product.designer.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-xs text-zinc-400 font-medium hover:text-white transition">{product.designer.name}</span>
                </Link>
                
                <h3 className="font-medium text-white group-hover:text-white transition">{product.name}</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{product.price} lei</span>
                    {product.originalPrice && (
                      <span className="text-sm text-zinc-500 line-through">{product.originalPrice} lei</span>
                    )}
                  </div>
                  <StockStatusBadge stockStatus={product.stockStatus} />
                </div>
              </div>
            </div>
          ))}
        </div>
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
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold">{product.name}</h2>
            <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded">
              <X size={20} />
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="aspect-[3/4] bg-zinc-800 rounded-lg overflow-hidden">
              <PlaceholderImage 
                type="product" 
                alt={product.name}
                className="w-full h-full"
              />
            </div>
            
            <div className="space-y-4">
              <Link 
                href={`/designer/${product.designer.logo}`}
                className="flex items-center gap-2 hover:text-white transition"
              >
                <PlaceholderImage 
                  type="logo" 
                  alt={product.designer.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-zinc-400 font-medium hover:text-white transition">{product.designer.name}</span>
              </Link>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-2xl">{product.price} lei</span>
                  {product.originalPrice && (
                    <span className="text-lg text-zinc-500 line-through">{product.originalPrice} lei</span>
                  )}
                </div>
                <StockStatusBadge stockStatus={product.stockStatus} />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Size</label>
                <div className="flex gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-2 border rounded-lg ${
                        selectedSize === size
                          ? 'border-white bg-white text-zinc-900'
                          : 'border-zinc-600 hover:border-zinc-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex gap-2">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-2 border rounded-lg ${
                        selectedColor === color
                          ? 'border-white bg-white text-zinc-900'
                          : 'border-zinc-600 hover:border-zinc-500'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => onAddToCart(product, selectedSize, selectedColor)}
                disabled={product.stockStatus === 'coming_soon'}
                className={`w-full py-3 rounded-lg font-medium transition ${
                  product.stockStatus === 'coming_soon'
                    ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                    : product.stockStatus === 'made_to_order'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-zinc-900 hover:bg-zinc-200'
                }`}
              >
                {product.stockStatus === 'coming_soon' 
                  ? 'Coming Soon' 
                  : product.stockStatus === 'made_to_order'
                  ? 'Order Now'
                  : 'Add to Cart'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 