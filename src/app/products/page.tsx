"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  Package,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Camera,
  Palette,
  Ruler,
  Tag,
  Clock,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";
import { useDesignerAuth } from '@/contexts/DesignerAuthContext';
import { designerService } from '@/lib/designerService';
import { supabase } from '@/lib/supabase';
import { mcp_stripe_create_product, mcp_stripe_create_price } from '@/lib/mcp_stripe';
import { addToStripeMapping } from '@/lib/stripe-automation';

// Updated DesignerProduct type to match new structure
type DesignerProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  colors: {
    name: string;
    images: string[];
    sizes: {
      size: string;
      stock: number;
    }[];
  }[];
  stockStatus: 'in_stock' | 'made_to_order' | 'coming_soon';
  stockQuantity: number;
  isActive: boolean;
  isLive: boolean; // New field for live status
};

// Product stock status options
const STOCK_STATUS_OPTIONS = [
  { value: 'in_stock', label: 'In Stock', color: 'text-green-400' },
  { value: 'made_to_order', label: 'Made to Order', color: 'text-blue-400' },
  { value: 'coming_soon', label: 'Coming Soon', color: 'text-yellow-400' }
] as const;

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'White', 'Gray', 'Navy', 'Brown', 'Beige', 'Red', 'Blue', 'Green', 'Pink', 'Purple', 'Yellow'];

type ProductFormData = {
  id?: string;
  name: string;
  description: string;
  price: number;
  colors: {
    name: string;
    images: string[];
    sizes: {
      size: string;
      stock: number;
    }[];
  }[];
};

const emptyProduct: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  colors: [{
    name: '',
    images: [],
    sizes: []
  }]
};

function ProductManagement() {
  const [products, setProducts] = useState<DesignerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [togglingLive, setTogglingLive] = useState<string | null>(null); // Track which product is being toggled
  const [designerStatus, setDesignerStatus] = useState<'draft' | 'submitted' | 'approved' | 'rejected'>('draft');
  const [designerId, setDesignerId] = useState<string | null>(null);
  const router = useRouter();
  
  const { loading, user, initialized } = useDesignerAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (initialized && !user) {
      router.replace('/designer-auth');
      return;
    }
  }, [initialized, user, router]);

  // Load products and designer status
  useEffect(() => {
    if (!user?.id) return;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        
        // Get designer_id from designer_auth table
        const { data: authData, error: authError } = await supabase
          .from('designer_auth')
          .select('designer_id')
          .eq('user_id', user.id)
          .single();

        if (authError || !authData?.designer_id) {
          throw new Error('Designer not found');
        }

        setDesignerId(authData.designer_id);

        // Load dashboard data for status
        const dashboardData = await designerService.getDashboardData(user.id);
        if (dashboardData) {
          setDesignerStatus(dashboardData.status);
        }

        // Load products from designer_products table
        const { data: productsData, error: productsError } = await supabase
          .from('designer_products')
          .select('*')
          .eq('designer_id', authData.designer_id)
          .order('created_at', { ascending: false });

        if (productsError) {
          throw new Error('Failed to load products');
        }

        // Transform the data to match the expected format
        const transformedProducts = (productsData || []).map((product: any) => ({
          id: product.id,
          name: product.name || '',
          description: product.description || '',
          price: parseFloat(product.price) || 0,
          colors: product.colors || [{ name: '', images: [], sizes: [] }],
          stockStatus: product.stock_status || 'in_stock',
          stockQuantity: 0, // This field doesn't exist in the table, using default
          isActive: product.is_active || false,
          isLive: product.is_live || false
        }));

        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [user?.id, designerId]);

  const handleCreateProduct = () => {
    setEditingProduct(emptyProduct);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: DesignerProduct) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      colors: product.colors.map(color => ({
        name: color.name || '',
        images: color.images || [],
        sizes: color.sizes || []
      }))
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    if (!designerId) return;

    try {
      const { error } = await supabase
        .from('designer_products')
        .delete()
        .eq('id', productId)
        .eq('designer_id', designerId);

      if (error) {
        throw new Error('Failed to delete product');
      }

      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleToggleLive = async (productId: string, currentLiveStatus: boolean) => {
    if (!designerId) return;

    try {
      setTogglingLive(productId); // Set loading state
      const newLiveStatus = !currentLiveStatus;
      
      // If going live, create Stripe product first
      let stripeProductId = null;
      let stripePriceId = null;
      
      if (newLiveStatus) {
        const product = products.find(p => p.id === productId);
        if (!product) {
          throw new Error('Product not found');
        }

        // Create Stripe product
        const stripeProduct = await createStripeProduct(product);
        stripeProductId = stripeProduct.id;

        // Create Stripe price
        const stripePrice = await createStripePrice(stripeProductId, product.price);
        stripePriceId = stripePrice.id;
      }
      
      const { data, error } = await supabase
        .from('designer_products')
        .update({ 
          is_live: newLiveStatus,
          stripe_product_id: stripeProductId,
          stripe_price_id: stripePriceId,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .eq('designer_id', designerId)
        .select()
        .single();

      if (error) {
        throw new Error('Failed to update product status');
      }

      // Store Stripe data in mapping for cart integration
      if (newLiveStatus && stripeProductId && stripePriceId) {
        addToStripeMapping(productId, {
          productId: stripeProductId,
          priceId: stripePriceId,
          paymentLinkUrl: undefined // We'll create payment links separately if needed
        });
      }

      // Update local state
      setProducts(prev => prev.map(p => 
        p.id === productId 
          ? { ...p, isLive: newLiveStatus }
          : p
      ));

      // Show success message
      if (newLiveStatus) {
        alert('🎉 Product is now live! It will appear on your designer page and in the shop. Stripe product created successfully.');
      } else {
        alert('Product has been taken offline.');
      }
    } catch (error) {
      console.error('Error toggling product live status:', error);
      alert(`Failed to update product status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTogglingLive(null); // Clear loading state
    }
  };

  // Helper function to create Stripe product
  const createStripeProduct = async (product: DesignerProduct) => {
    try {
      // Use Stripe MCP to create product
      const stripeProduct = await mcp_stripe_create_product({
        name: product.name,
        description: product.description
      });

      return stripeProduct;
    } catch (error) {
      console.error('Error creating Stripe product:', error);
      throw error;
    }
  };

  // Helper function to create Stripe price
  const createStripePrice = async (productId: string, price: number) => {
    try {
      // Use Stripe MCP to create price
      const stripePrice = await mcp_stripe_create_price({
        product: productId,
        unit_amount: Math.round(price * 100), // Convert to cents
        currency: 'ron' // Romanian Lei
      });

      return stripePrice;
    } catch (error) {
      console.error('Error creating Stripe price:', error);
      throw error;
    }
  };

  const handleSaveProduct = async (productData: ProductFormData) => {
    if (!designerId) return;

    try {
      setSaving(true);
      
      const isEditing = !!productData.id;
      
      const productPayload = {
        designer_id: designerId,
        name: productData.name,
        description: productData.description,
        price: productData.price.toString(),
        colors: productData.colors,
        stock_status: 'in_stock' as const,
        is_active: true,
        updated_at: new Date().toISOString()
      };

      if (isEditing) {
        // Update existing product
        const { data, error } = await supabase
          .from('designer_products')
          .update(productPayload)
          .eq('id', productData.id)
          .eq('designer_id', designerId)
          .select()
          .single();

        if (error) {
          throw new Error('Failed to update product');
        }

        // Update local state
        setProducts(prev => prev.map(p => 
          p.id === productData.id 
            ? {
                id: data.id,
                name: data.name || '',
                description: data.description || '',
                price: parseFloat(data.price) || 0,
                colors: data.colors || [{ name: '', images: [], sizes: [] }],
                stockStatus: data.stock_status || 'in_stock',
                stockQuantity: 0,
                isActive: data.is_active || false,
                isLive: data.is_live || false
              }
            : p
        ));
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('designer_products')
          .insert([productPayload])
          .select()
          .single();

        if (error) {
          throw new Error('Failed to create product');
        }

        // Add to local state
        const newProduct = {
          id: data.id,
          name: data.name || '',
          description: data.description || '',
          price: parseFloat(data.price) || 0,
          colors: data.colors || [{ name: '', images: [], sizes: [] }],
          stockStatus: data.stock_status || 'in_stock',
          stockQuantity: 0,
          isActive: data.is_active || false,
          isLive: data.is_live || false
        };

        setProducts(prev => [newProduct, ...prev]);
      }

      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    if (!user?.id) throw new Error('User not authenticated');

    console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.id);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Failed to upload image: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload success:', result);
      return result.imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <BackgroundPaths />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link 
                  href="/designer-dashboard"
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
                >
                  <ArrowLeft size={20} />
                  <span>Back to Dashboard</span>
                </Link>
                <div className="h-6 w-px bg-zinc-700" />
                <div className="flex items-center gap-2">
                  <Package size={24} />
                  <h1 className="text-xl font-bold">Product Management</h1>
                </div>
              </div>
              
              <button
                onClick={handleCreateProduct}
                className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200 transition"
              >
                <Plus size={20} />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Status Banner */}
          {designerStatus !== 'approved' && (
            <div className="mb-8">
              {designerStatus === 'draft' && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-amber-400" size={20} />
                    <h3 className="text-amber-400 font-semibold">Profile Incomplete</h3>
                  </div>
                  <p className="text-amber-300 text-sm mb-3">
                    You can prepare your products here, but they won&apos;t be visible to customers until your designer profile is approved.
                  </p>
                  <Link 
                    href="/designer-dashboard"
                    className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-medium transition"
                  >
                    <ArrowLeft size={16} />
                    Complete your profile first
                  </Link>
                </div>
              )}
              
              {designerStatus === 'submitted' && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-blue-400" size={20} />
                    <h3 className="text-blue-400 font-semibold">Under Review</h3>
                  </div>
                  <p className="text-blue-300 text-sm">
                    Your profile is being reviewed. You can prepare your products here, but they won&apos;t be visible to customers until you&apos;re approved.
                  </p>
                </div>
              )}
              
              {designerStatus === 'rejected' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="text-red-400" size={20} />
                    <h3 className="text-red-400 font-semibold">Profile Needs Updates</h3>
                  </div>
                  <p className="text-red-300 text-sm mb-3">
                    Your profile was rejected. Please check your email for feedback and update your profile before your products can go live.
                  </p>
                  <Link 
                    href="/designer-dashboard"
                    className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition"
                  >
                    <ArrowLeft size={16} />
                    Update your profile
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-zinc-900 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Package className="text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Total Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <ShoppingBag className="text-green-400" size={24} />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">In Stock</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.stockStatus === 'in_stock').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Eye className="text-yellow-400" size={24} />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Live Products</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.isLive).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-900 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <DollarSign className="text-purple-400" size={24} />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Avg. Price</p>
                  <p className="text-2xl font-bold">
                    {products.length > 0 
                      ? Math.round(products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length)
                      : 0
                    } lei
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="text-white hover:text-zinc-300 underline"
              >
                Try again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package size={64} className="mx-auto text-zinc-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products yet</h3>
              <p className="text-zinc-400 mb-6">Create your first product to get started</p>
              <button
                onClick={handleCreateProduct}
                className="bg-white text-black px-6 py-3 rounded-lg hover:bg-zinc-200 transition"
              >
                Create First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={() => handleEditProduct(product)}
                  onDelete={() => handleDeleteProduct(product.id)}
                  onToggleLive={() => handleToggleLive(product.id, product.isLive)}
                  isTogglingLive={togglingLive === product.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && editingProduct && (
        <ProductFormModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          saving={saving}
          onImageUpload={handleImageUpload}
        />
      )}
    </div>
  );
}

function ProductCard({ product, onEdit, onDelete, onToggleLive, isTogglingLive }: {
  product: DesignerProduct;
  onEdit: () => void;
  onDelete: () => void;
  onToggleLive: () => void;
  isTogglingLive: boolean;
}) {
  const statusOption = STOCK_STATUS_OPTIONS.find(s => s.value === product.stockStatus);
  
  // Check if product is complete (has name, description, price, at least one color with images and sizes)
  const isComplete = product.name && 
                    product.description && 
                    product.price > 0 && 
                    product.colors?.length > 0 && 
                    product.colors.some(color => 
                      color.name && 
                      color.images?.length > 0 && 
                      color.sizes?.length > 0
                    );
  
  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition">
      {/* Product Image */}
      <div className="aspect-[4/3] bg-zinc-800 relative">
        {product.colors?.length > 0 && product.colors[0]?.images?.length > 0 ? (
          <Image
            src={product.colors[0].images[0]}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Camera size={48} className="text-zinc-600" />
          </div>
        )}
        
        {/* Live Status Badge */}
        {product.isLive && (
          <div className="absolute top-2 left-2">
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              LIVE
            </div>
          </div>
        )}
        
        {/* Actions Overlay */}
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-black/50 hover:bg-red-500/70 rounded-lg transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-zinc-400 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold">{product.price} lei</span>
          <span className={`text-sm ${statusOption?.color}`}>
            {statusOption?.label}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
          <div className="flex items-center gap-1">
            <Palette size={14} />
            <span>{product.colors?.length || 0} colors</span>
          </div>
          <div className="flex items-center gap-1">
            <Ruler size={14} />
            <span>{product.colors?.reduce((total, color) => total + (color.sizes?.length || 0), 0) || 0} variants</span>
          </div>
        </div>

        {/* Go Live / Take Offline Button */}
        {isComplete ? (
          <button
            onClick={onToggleLive}
            disabled={isTogglingLive}
            className={`w-full py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
              isTogglingLive
                ? 'bg-zinc-700 text-zinc-400 border border-zinc-600 cursor-not-allowed'
                : product.isLive
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
            }`}
          >
            {isTogglingLive ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                {product.isLive ? 'Taking Offline...' : 'Going Live...'}
              </>
            ) : product.isLive ? (
              <>
                <EyeOff size={16} />
                Take Offline
              </>
            ) : (
              <>
                <Eye size={16} />
                Go Live
              </>
            )}
          </button>
        ) : (
          <div className="w-full py-2 px-4 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-center text-sm">
            Complete product to go live
          </div>
        )}
      </div>
    </div>
  );
}

function ProductFormModal({ product, onSave, onCancel, saving, onImageUpload }: {
  product: ProductFormData;
  onSave: (product: ProductFormData) => void;
  onCancel: () => void;
  saving: boolean;
  onImageUpload: (file: File) => Promise<string>;
}) {
  const [formData, setFormData] = useState<ProductFormData>(product);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleImageUploadForColor = async (e: React.ChangeEvent<HTMLInputElement>, colorIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const imageUrl = await onImageUpload(file);
      setFormData(prev => ({
        ...prev,
        colors: prev.colors.map((color, index) => 
          index === colorIndex 
            ? { ...color, images: [...color.images, imageUrl] }
            : color
        )
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (colorIndex: number, imageIndex: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((color, index) => 
        index === colorIndex 
          ? { ...color, images: color.images.filter((_, i) => i !== imageIndex) }
          : color
      )
    }));
  };

  const toggleSize = (colorIndex: number, size: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((color, index) => {
        if (index !== colorIndex) return color;
        
        const existingSizeIndex = color.sizes.findIndex(s => s.size === size);
        if (existingSizeIndex >= 0) {
          // Remove size
          return {
            ...color,
            sizes: color.sizes.filter((_, i) => i !== existingSizeIndex)
          };
        } else {
          // Add size with default stock
          return {
            ...color,
            sizes: [...color.sizes, { size, stock: 0 }]
          };
        }
      })
    }));
  };

  const updateStock = (colorIndex: number, sizeIndex: number, stock: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((color, index) => 
        index === colorIndex 
          ? {
              ...color,
              sizes: color.sizes.map((sizeData, i) => 
                i === sizeIndex ? { ...sizeData, stock } : sizeData
              )
            }
          : color
      )
    }));
  };

  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { name: '', images: [], sizes: [] }]
    }));
  };

  const updateColor = (index: number, name: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((color, i) => 
        i === index ? { ...color, name } : color
      )
    }));
  };

  const removeColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {product.id ? 'Edit Product' : 'Create Product'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-zinc-800 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                  placeholder="e.g., Elegant Evening Dress"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price (lei) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                  placeholder="450.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                placeholder="Describe your product..."
                required
              />
            </div>

            {/* Colors with Images, Sizes, and Stock */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-lg font-medium">Colors & Variants *</label>
                <button
                  type="button"
                  onClick={addColor}
                  className="text-sm text-blue-400 hover:text-blue-300 transition"
                >
                  + Add Color
                </button>
              </div>
              
              <div className="space-y-8">
                {formData.colors.map((color, colorIndex) => (
                  <div key={colorIndex} className="bg-zinc-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Color {colorIndex + 1}</h3>
                      {formData.colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColor(colorIndex)}
                          className="p-2 text-red-400 hover:text-red-300 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {/* Color Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">Color Name *</label>
                      <select
                        value={color.name}
                        onChange={(e) => updateColor(colorIndex, e.target.value)}
                        className="w-full p-3 bg-zinc-700 border border-zinc-600 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                        required
                      >
                        <option value="">Select color...</option>
                        {COLORS.map(colorOption => (
                          <option key={colorOption} value={colorOption}>
                            {colorOption}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Images for this color */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-3">Images for {color.name || 'this color'}</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {color.images.map((image, imageIndex) => (
                          <div key={imageIndex} className="relative aspect-square bg-zinc-700 rounded-lg overflow-hidden">
                            <Image
                              src={image}
                              alt={`${color.name} image ${imageIndex + 1}`}
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(colorIndex, imageIndex)}
                              className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full transition"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        
                        <label className="aspect-square bg-zinc-700 border-2 border-dashed border-zinc-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-zinc-500 transition">
                          <div className="text-center">
                            {uploadingImage ? (
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto" />
                            ) : (
                              <>
                                <Upload size={24} className="mx-auto mb-2 text-zinc-400" />
                                <span className="text-sm text-zinc-400">Add Image</span>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUploadForColor(e, colorIndex)}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Sizes and Stock for this color */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Available Sizes & Stock</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        {SIZES.map(size => {
                          const sizeData = color.sizes.find(s => s.size === size);
                          const isSelected = !!sizeData;
                          
                          return (
                            <div key={size} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleSize(colorIndex, size)}
                                className={`px-3 py-2 rounded-lg border transition flex-1 ${
                                  isSelected
                                    ? 'bg-white text-black border-white'
                                    : 'bg-zinc-700 border-zinc-600 hover:border-zinc-500'
                                }`}
                              >
                                {size}
                              </button>
                              {isSelected && (
                                <input
                                  type="number"
                                  min="0"
                                  value={sizeData.stock}
                                  onChange={(e) => {
                                    const sizeIndex = color.sizes.findIndex(s => s.size === size);
                                    updateStock(colorIndex, sizeIndex, parseInt(e.target.value) || 0);
                                  }}
                                  className="w-20 p-2 bg-zinc-700 border border-zinc-600 rounded text-center"
                                  placeholder="0"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 border border-zinc-600 rounded-lg hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !formData.name || !formData.description || formData.colors.some(c => !c.name || c.sizes.length === 0)}
                className="flex-1 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return <ProductManagement />;
}