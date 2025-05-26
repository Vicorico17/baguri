"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Edit, Send, CheckCircle, Clock, XCircle, Upload, LogOut, Plus, X, Instagram, Globe, Camera, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";
import { BrandShowcase } from "@/components/ui/brand-showcase";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { DesignerAuthProvider, useDesignerAuth } from '@/contexts/DesignerAuthContext';

// Product stock status options
const STOCK_STATUS_OPTIONS = [
  { value: 'in_stock', label: 'In Stock', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'made_to_order', label: 'Made to Order', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'coming_soon', label: 'Coming Soon', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Romanian cities
const ROMANIAN_CITIES = [
  'Bucharest', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Craiova', 'Brașov', 'Galați', 
  'Ploiești', 'Oradea', 'Braila', 'Arad', 'Pitești', 'Sibiu', 'Bacău', 'Târgu Mureș', 
  'Baia Mare', 'Buzău', 'Botoșani', 'Satu Mare', 'Râmnicu Vâlcea', 'Drobeta-Turnu Severin',
  'Suceava', 'Piatra Neamț', 'Târgu Jiu', 'Tulcea', 'Focșani', 'Bistrița', 'Reșița', 'Alba Iulia'
];

type ProductColor = {
  name: string;
  images: string[];
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  stockStatus: 'in_stock' | 'made_to_order' | 'coming_soon';
};

type DesignerProfileForm = {
  brandName: string;
  shortDescription: string;
  longDescription: string;
  city: string;
  yearFounded: number;
  email: string;
  username: string;
  password: string;
  logoUrl: string;
  secondaryLogoUrl: string;
  instagramHandle: string;
  tiktokHandle: string;
  products: Product[];
  specialties: string[];
};

// Mock designer profile data
const mockDesignerProfile = {
  id: 1,
  userId: "user_123", // This would come from Supabase auth
  status: "draft" as "draft" | "submitted" | "approved" | "rejected",
  submittedAt: null as string | null,
  completionPercentage: 15
};

function createEmptyProduct(): Product {
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: '',
    description: '',
    price: 0,
    images: [],
    sizes: [],
    colors: [{ name: '', images: [] }],
    stockStatus: 'in_stock'
  };
}

function DesignerDashboardContent() {
  const [profileData, setProfileData] = useState(mockDesignerProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSecondaryLogo, setUploadingSecondaryLogo] = useState(false);
  const [brandDetailsOpen, setBrandDetailsOpen] = useState(true);
  const [productsOpen, setProductsOpen] = useState(false); // Start with products closed for faster initial load
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dashboardReady, setDashboardReady] = useState(false);
  const router = useRouter();
  
  // Use the same auth context as the auth page
  const { signOut, loading, user, designerProfile } = useDesignerAuth();

  const [profile, setProfile] = useState<DesignerProfileForm>({
    brandName: '',
    shortDescription: '',
    longDescription: '',
    city: 'Bucharest',
    yearFounded: new Date().getFullYear(),
    email: '',
    username: '',
    password: '',
    logoUrl: '',
    secondaryLogoUrl: '',
    instagramHandle: '',
    tiktokHandle: '',
    products: [createEmptyProduct()],
    specialties: []
  });

  // Optimized redirect logic - immediate redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/designer-auth');
    }
  }, [loading, user, router]);

  // Set profile email when user is available
  useEffect(() => {
    if (user?.email) {
      setProfile(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user]);

  // Mark dashboard as ready after initial render
  useEffect(() => {
    if (user && !loading) {
      const timer = setTimeout(() => setDashboardReady(true), 100);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  const handleLogout = () => {
    signOut();
    router.push('/designer-auth');
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <BackgroundPaths />
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
            <p className="text-zinc-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (redirect will happen)
  if (!user) {
    return null;
  }

  // Show dashboard skeleton while components are loading
  if (!dashboardReady) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <BackgroundPaths />
        
        {/* Header Skeleton */}
        <header className="fixed top-0 left-0 right-0 z-40 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="w-24 h-6 bg-zinc-800 rounded animate-pulse"></div>
              <div className="w-32 h-8 bg-zinc-800 rounded animate-pulse"></div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-6 bg-zinc-800 rounded animate-pulse"></div>
                <div className="w-16 h-6 bg-zinc-800 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Status Banner Skeleton */}
        <section className="relative z-10 py-6 pt-20 bg-zinc-900/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-zinc-800 rounded-full animate-pulse"></div>
                <div>
                  <div className="w-48 h-8 bg-zinc-800 rounded animate-pulse mb-2"></div>
                  <div className="w-32 h-4 bg-zinc-800 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 h-16 bg-zinc-800 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Skeleton */}
        <section className="relative z-10 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-2xl p-6">
                  <div className="w-48 h-8 bg-zinc-800 rounded animate-pulse mb-6"></div>
                  <div className="space-y-4">
                    <div className="w-full h-12 bg-zinc-800 rounded animate-pulse"></div>
                    <div className="w-full h-12 bg-zinc-800 rounded animate-pulse"></div>
                    <div className="w-full h-24 bg-zinc-800 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-2xl p-6">
                  <div className="w-32 h-6 bg-zinc-800 rounded animate-pulse mb-4"></div>
                  <div className="w-full h-32 bg-zinc-800 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const updateProfile = (field: keyof DesignerProfileForm, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    updateCompletionPercentage();
  };

  const updateProduct = (productId: string, field: keyof Product, value: any) => {
    setProfile(prev => ({
      ...prev,
      products: prev.products.map(product =>
        product.id === productId
          ? { ...product, [field]: value }
          : product
      )
    }));
    updateCompletionPercentage();
  };

  const addProduct = () => {
    setProfile(prev => ({
      ...prev,
      products: [...prev.products, createEmptyProduct()]
    }));
  };

  const removeProduct = (productId: string) => {
    if (profile.products.length > 1) {
      setProfile(prev => ({
        ...prev,
        products: prev.products.filter(product => product.id !== productId)
      }));
      updateCompletionPercentage();
    }
  };

  const handleSizeToggle = (productId: string, size: string) => {
    const product = profile.products.find(p => p.id === productId);
    if (!product) return;

    const newSizes = product.sizes.includes(size)
      ? product.sizes.filter(s => s !== size)
      : [...product.sizes, size];
    
    updateProduct(productId, 'sizes', newSizes);
  };

  const addColor = (productId: string) => {
    const product = profile.products.find(p => p.id === productId);
    if (!product) return;
    
    updateProduct(productId, 'colors', [...product.colors, { name: '', images: [] }]);
  };

  const updateColor = (productId: string, colorIndex: number, value: string) => {
    const product = profile.products.find(p => p.id === productId);
    if (!product) return;
    
    const newColors = [...product.colors];
    newColors[colorIndex] = { ...newColors[colorIndex], name: value };
    updateProduct(productId, 'colors', newColors);
  };

  const removeColor = (productId: string, colorIndex: number) => {
    const product = profile.products.find(p => p.id === productId);
    if (!product || product.colors.length <= 1) return;
    
    const newColors = product.colors.filter((_, index) => index !== colorIndex);
    updateProduct(productId, 'colors', newColors);
  };

  const addColorImage = (productId: string, colorIndex: number, imageUrl: string) => {
    const product = profile.products.find(p => p.id === productId);
    if (!product) return;
    
    const newColors = [...product.colors];
    newColors[colorIndex] = { 
      ...newColors[colorIndex], 
      images: [...newColors[colorIndex].images, imageUrl] 
    };
    updateProduct(productId, 'colors', newColors);
  };

  const removeColorImage = (productId: string, colorIndex: number, imageIndex: number) => {
    const product = profile.products.find(p => p.id === productId);
    if (!product) return;
    
    const newColors = [...product.colors];
    newColors[colorIndex] = { 
      ...newColors[colorIndex], 
      images: newColors[colorIndex].images.filter((_, index) => index !== imageIndex) 
    };
    updateProduct(productId, 'colors', newColors);
  };

  const updateCompletionPercentage = () => {
    // Calculate completion based on filled fields
    let completed = 0;
    const total = 10;

    if (profile.brandName) completed++;
    if (profile.shortDescription) completed++;
    if (profile.longDescription) completed++;
    if (profile.logoUrl) completed++;
    if (profile.instagramHandle) completed++;
    if (profile.city) completed++;
    if (profile.yearFounded) completed++;
    if (profile.products.some(p => p.name && p.price > 0)) completed++;
    if (profile.products.some(p => p.sizes.length > 0)) completed++;
    if (profile.products.some(p => p.colors.some(c => c.name.trim()))) completed++;

    const percentage = Math.round((completed / total) * 100);
    setProfileData(prev => ({ ...prev, completionPercentage: percentage }));
  };

  // Mock upload function for color images
  const handleColorImageUpload = async (file: File, productId: string, colorIndex: number) => {
    try {
      // Mock upload - replace with real implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a temporary URL for the uploaded file (for preview purposes)
      const objectUrl = URL.createObjectURL(file);
      
      // Add the image to the specific color
      addColorImage(productId, colorIndex, objectUrl);
      
      // In a real implementation, you would upload to Supabase storage here
      // const { data, error } = await supabase.storage
      //   .from('product-images')
      //   .upload(`${userId}/${productId}/color-${colorIndex}/${Date.now()}`, file);
      
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  // Mock upload function - replace with real Supabase upload
  const handleLogoUpload = async (file: File, isSecondary = false) => {
    if (isSecondary) {
      setUploadingSecondaryLogo(true);
    } else {
      setUploadingLogo(true);
    }

    try {
      // Mock upload - replace with real implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a temporary URL for the uploaded file (for preview purposes)
      const objectUrl = URL.createObjectURL(file);
      
      if (isSecondary) {
        updateProfile('secondaryLogoUrl', objectUrl);
      } else {
        updateProfile('logoUrl', objectUrl);
      }
      
      // In a real implementation, you would upload to Supabase storage here
      // const { data, error } = await supabase.storage
      //   .from('logos')
      //   .upload(`${userId}/${isSecondary ? 'secondary-' : ''}logo-${Date.now()}`, file);
      
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      if (isSecondary) {
        setUploadingSecondaryLogo(false);
      } else {
        setUploadingLogo(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Here you would save to Supabase
      console.log('Saving profile:', profile);
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update completion status
      updateCompletionPercentage();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = () => {
    setProfileData(prev => ({
      ...prev,
      status: 'submitted' as "draft" | "submitted" | "approved" | "rejected",
      submittedAt: new Date().toISOString().split('T')[0]
    }));
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          icon: <Edit size={20} />,
          text: 'Draft',
          color: 'text-zinc-400 bg-zinc-700/50',
          description: 'Complete your profile and submit for review'
        };
      case 'submitted':
        return {
          icon: <Clock size={20} />,
          text: 'Under Review',
          color: 'text-amber-400 bg-amber-400/10',
          description: 'Your application is being reviewed by our team'
        };
      case 'approved':
        return {
          icon: <CheckCircle size={20} />,
          text: 'Approved',
          color: 'text-green-400 bg-green-400/10',
          description: 'Congratulations! Your brand is now live on Baguri'
        };
      case 'rejected':
        return {
          icon: <XCircle size={20} />,
          text: 'Needs Changes',
          color: 'text-red-400 bg-red-400/10',
          description: 'Please review the feedback and resubmit'
        };
      default:
        return {
          icon: <Edit size={20} />,
          text: 'Draft',
          color: 'text-zinc-400 bg-zinc-700/50',
          description: 'Complete your profile and submit for review'
        };
    }
  };

  const canSubmit = profileData.completionPercentage >= 80 && profileData.status === 'draft';
  const statusInfo = getStatusInfo(profileData.status);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <BackgroundPaths />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-sm">
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
                onClick={() => setIsEditMode(!isEditMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  isEditMode 
                    ? 'bg-amber-600 text-white hover:bg-amber-700' 
                    : 'bg-white text-zinc-900 hover:bg-zinc-200'
                }`}
              >
                <Edit size={16} />
                {isEditMode ? 'Lock Profile' : 'Edit Profile'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Status Banner */}
      <section className="relative z-10 py-6 pt-20 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BrandShowcase 
                logoUrl={profile.logoUrl}
                brandName={profile.brandName}
                size="lg"
              />
              <div>
                <h1 className="text-2xl font-bold">{profile.brandName || 'Your Designer Profile'}</h1>
                <div className="flex items-center gap-4 mt-1 mb-2">
                  {profile.city && (
                    <div className="flex items-center gap-1 text-sm text-zinc-300">
                      📍 {profile.city}
                    </div>
                  )}
                  {profile.yearFounded && (
                    <div className="flex items-center gap-1 text-sm text-zinc-300">
                      📅 Est. {profile.yearFounded}
                    </div>
                  )}
                </div>
                <p className="text-zinc-400">{statusInfo.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`px-2 py-1 rounded-md text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-zinc-400">Profile Completion</div>
                <div className="text-xl font-bold">{profileData.completionPercentage}%</div>
              </div>
              <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${profileData.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Profile Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Brand Details Section */}
              <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-2xl overflow-hidden">
                <div className="p-6 flex items-center justify-between">
                  <button
                    onClick={() => setBrandDetailsOpen(!brandDetailsOpen)}
                    className="flex items-center gap-2 hover:bg-zinc-800/50 transition text-left -mx-6 -my-6 px-6 py-6 flex-1"
                  >
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      ✨ Brand Details
                    </h2>
                    {brandDetailsOpen ? (
                      <ChevronUp size={24} className="text-zinc-400 ml-2" />
                    ) : (
                      <ChevronDown size={24} className="text-zinc-400 ml-2" />
                    )}
                  </button>
                  {brandDetailsOpen && isEditMode && (
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition ml-4"
                    >
                      <Save size={16} />
                      Save
                    </button>
                  )}
                </div>
                
                {brandDetailsOpen && (
                  <div className="px-6 pb-6">
                    {/* Brand Identity Subsection */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-zinc-300">
                        🎨 Brand Identity
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 flex items-center gap-2">
                              <ProgressCircle isComplete={!!profile.brandName.trim()} />
                              Brand Name *
                            </label>
                            {!isEditMode && profile.brandName ? (
                              <div className="px-4 py-3 text-white font-medium">
                                {profile.brandName}
                              </div>
                            ) : (
                              <input
                                type="text"
                                value={profile.brandName}
                                onChange={(e) => updateProfile('brandName', e.target.value)}
                                disabled={!isEditMode}
                                className={`w-full px-4 py-3 border rounded-lg transition ${
                                  isEditMode 
                                    ? 'bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent'
                                    : 'bg-zinc-700/50 border-zinc-600 text-zinc-300 cursor-not-allowed'
                                }`}
                                placeholder="Your brand name"
                              />
                            )}
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-2 flex items-center gap-2">
                              <ProgressCircle isComplete={!!profile.shortDescription.trim()} />
                              Short Description *
                            </label>
                            {!isEditMode && profile.shortDescription ? (
                              <div className="px-4 py-3 text-zinc-300 leading-relaxed">
                                {profile.shortDescription}
                              </div>
                            ) : (
                              <>
                                <textarea
                                  value={profile.shortDescription}
                                  onChange={(e) => updateProfile('shortDescription', e.target.value)}
                                  disabled={!isEditMode}
                                  className={`w-full px-4 py-3 border rounded-lg transition resize-none ${
                                    isEditMode 
                                      ? 'bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent'
                                      : 'bg-zinc-700/50 border-zinc-600 text-zinc-300 cursor-not-allowed'
                                  }`}
                                  placeholder="Brief description of your brand (1-2 lines)"
                                  rows={2}
                                  maxLength={120}
                                />
                                {isEditMode && (
                                  <div className="text-xs text-zinc-500 mt-1">
                                    {profile.shortDescription.length}/120 characters
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-2 flex items-center gap-2">
                              <ProgressCircle isComplete={!!profile.longDescription.trim()} />
                              About Your Brand
                            </label>
                            {!isEditMode && profile.longDescription ? (
                              <div className="px-4 py-3 text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                {profile.longDescription}
                              </div>
                            ) : (
                              <textarea
                                value={profile.longDescription}
                                onChange={(e) => updateProfile('longDescription', e.target.value)}
                                disabled={!isEditMode}
                                className={`w-full px-4 py-3 border rounded-lg transition resize-none ${
                                  isEditMode 
                                    ? 'bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent'
                                    : 'bg-zinc-700/50 border-zinc-600 text-zinc-300 cursor-not-allowed'
                                }`}
                                placeholder="Tell your brand's story, inspiration, and what makes you unique..."
                                rows={4}
                              />
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                <ProgressCircle isComplete={!!profile.city.trim()} />
                                City
                              </label>
                              {!isEditMode && profile.city ? (
                                <div className="px-4 py-3 text-zinc-300">
                                  {profile.city}
                                </div>
                              ) : (
                                <select
                                  value={profile.city}
                                  onChange={(e) => updateProfile('city', e.target.value)}
                                  disabled={!isEditMode}
                                  className={`w-full px-4 py-3 border rounded-lg transition ${
                                    isEditMode 
                                      ? 'bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent'
                                      : 'bg-zinc-700/50 border-zinc-600 text-zinc-300 cursor-not-allowed'
                                  }`}
                                >
                                  <option value="">Select a city</option>
                                  {ROMANIAN_CITIES.map((city) => (
                                    <option key={city} value={city} className="bg-zinc-800">
                                      {city}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                <ProgressCircle isComplete={!!profile.yearFounded && profile.yearFounded > 1900} />
                                Year Founded
                              </label>
                              {!isEditMode && profile.yearFounded ? (
                                <div className="px-4 py-3 text-zinc-300">
                                  {profile.yearFounded}
                                </div>
                              ) : (
                                <input
                                  type="number"
                                  value={profile.yearFounded}
                                  onChange={(e) => updateProfile('yearFounded', parseInt(e.target.value))}
                                  disabled={!isEditMode}
                                  className={`w-full px-4 py-3 border rounded-lg transition ${
                                    isEditMode 
                                      ? 'bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent'
                                      : 'bg-zinc-700/50 border-zinc-600 text-zinc-300 cursor-not-allowed'
                                  }`}
                                  placeholder="2024"
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* Logo Upload */}
                          <div>
                            <label className="text-sm font-medium mb-2 flex items-center gap-2">
                              <ProgressCircle isComplete={!!profile.logoUrl.trim()} />
                              Brand Logo *
                            </label>
                            <div className="relative">
                              {profile.logoUrl ? (
                                <div className={`relative w-full h-32 border rounded-lg overflow-hidden ${
                                  isEditMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-700/50 border-zinc-600'
                                }`}>
                                  <Image
                                    src={profile.logoUrl}
                                    alt="Brand Logo"
                                    fill
                                    className="object-contain p-4"
                                  />
                                  {isEditMode && (
                                    <button
                                      onClick={() => updateProfile('logoUrl', '')}
                                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <label className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition ${
                                  isEditMode 
                                    ? 'border-zinc-700 cursor-pointer hover:border-zinc-600' 
                                    : 'border-zinc-600 cursor-not-allowed opacity-50'
                                }`}>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={!isEditMode}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file && isEditMode) handleLogoUpload(file);
                                    }}
                                  />
                                  {uploadingLogo ? (
                                    <div className="text-zinc-400">Uploading...</div>
                                  ) : (
                                    <>
                                      <Camera size={24} className="text-zinc-400 mb-2" />
                                      <span className="text-sm text-zinc-400">
                                        {isEditMode ? 'Upload your logo' : 'Logo upload disabled'}
                                      </span>
                                    </>
                                  )}
                                </label>
                              )}
                            </div>
                          </div>

                          {/* Secondary Logo Upload */}
                          <div>
                            <label className="block text-sm font-medium mb-2">Secondary Logo (Optional)</label>
                            <div className="relative">
                              {profile.secondaryLogoUrl ? (
                                <div className={`relative w-full h-32 border rounded-lg overflow-hidden ${
                                  isEditMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-700/50 border-zinc-600'
                                }`}>
                                  <Image
                                    src={profile.secondaryLogoUrl}
                                    alt="Secondary Logo"
                                    fill
                                    className="object-contain p-4"
                                  />
                                  {isEditMode && (
                                    <button
                                      onClick={() => updateProfile('secondaryLogoUrl', '')}
                                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <label className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition ${
                                  isEditMode 
                                    ? 'border-zinc-700 cursor-pointer hover:border-zinc-600' 
                                    : 'border-zinc-600 cursor-not-allowed opacity-50'
                                }`}>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={!isEditMode}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file && isEditMode) handleLogoUpload(file, true);
                                    }}
                                  />
                                  {uploadingSecondaryLogo ? (
                                    <div className="text-zinc-400">Uploading...</div>
                                  ) : (
                                    <>
                                      <Camera size={24} className="text-zinc-400 mb-2" />
                                      <span className="text-sm text-zinc-400">
                                        {isEditMode ? 'Upload secondary logo' : 'Logo upload disabled'}
                                      </span>
                                    </>
                                  )}
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Connect With You Subsection */}
                    <div className="border-t border-zinc-700 pt-8">
                      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-zinc-300">
                        🌐 Connect With You
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 flex items-center gap-2">
                            <ProgressCircle isComplete={!!profile.instagramHandle.trim()} />
                            Instagram Handle
                          </label>
                          {!isEditMode && profile.instagramHandle ? (
                            <div className="flex items-center gap-3 px-4 py-3">
                              <Instagram size={20} className="text-zinc-400" />
                              <span className="text-zinc-300">{profile.instagramHandle}</span>
                            </div>
                          ) : (
                            <div className="relative">
                              <Instagram size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                              <input
                                type="text"
                                value={profile.instagramHandle}
                                onChange={(e) => updateProfile('instagramHandle', e.target.value)}
                                disabled={!isEditMode}
                                className={`w-full pl-12 pr-4 py-3 border rounded-lg transition ${
                                  isEditMode 
                                    ? 'bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent'
                                    : 'bg-zinc-700/50 border-zinc-600 text-zinc-300 cursor-not-allowed'
                                }`}
                                placeholder="@yourbrand"
                              />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 flex items-center gap-2">
                            <ProgressCircle isComplete={!!profile.tiktokHandle?.trim()} />
                            TikTok Handle
                          </label>
                          {!isEditMode && profile.tiktokHandle ? (
                            <div className="flex items-center gap-3 px-4 py-3">
                              <span className="text-zinc-400 text-sm font-bold">TT</span>
                              <span className="text-zinc-300">{profile.tiktokHandle}</span>
                            </div>
                          ) : (
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 text-sm font-bold">
                                TT
                              </span>
                              <input
                                type="text"
                                value={profile.tiktokHandle || ''}
                                onChange={(e) => updateProfile('tiktokHandle', e.target.value)}
                                disabled={!isEditMode}
                                className={`w-full pl-12 pr-4 py-3 border rounded-lg transition ${
                                  isEditMode 
                                    ? 'bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent'
                                    : 'bg-zinc-700/50 border-zinc-600 text-zinc-300 cursor-not-allowed'
                                }`}
                                placeholder="@yourbrand"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Products Management Section */}
              <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-2xl overflow-hidden">
                <div className="p-6 flex items-center justify-between">
                  <button
                    onClick={() => setProductsOpen(!productsOpen)}
                    className="flex items-center justify-between hover:bg-zinc-800/50 transition text-left flex-1 -mx-6 -my-6 px-6 py-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        🛍️ Products Management
                        {productsOpen ? (
                          <ChevronUp size={24} className="text-zinc-400 ml-2" />
                        ) : (
                          <ChevronDown size={24} className="text-zinc-400 ml-2" />
                        )}
                      </h2>
                      <p className="text-zinc-400 text-sm mt-1">Add and manage your product collection</p>
                    </div>
                  </button>
                  {productsOpen && isEditMode && (
                    <button
                      onClick={addProduct}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-900 rounded-lg hover:bg-zinc-200 transition font-medium ml-4"
                    >
                      <Plus size={16} />
                      Add Product
                    </button>
                  )}
                </div>
                
                {productsOpen && (
                  <div className="px-6 pb-6">
                    <div className="space-y-6">
                      {profile.products.map((product, index) => (
                        <div key={product.id} className="border border-zinc-700 rounded-xl p-6 bg-zinc-800/50">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">Product {index + 1}</h3>
                            {profile.products.length > 1 && isEditMode && (
                              <button
                                onClick={() => removeProduct(product.id)}
                                className="text-red-400 hover:text-red-300 transition"
                              >
                                <X size={20} />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <ProgressCircle isComplete={!!product.name.trim()} />
                                  Product Name *
                                </label>
                                <input
                                  type="text"
                                  value={product.name}
                                  onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                                  disabled={!isEditMode}
                                  className={`w-full px-4 py-3 border rounded-lg transition ${
                                    isEditMode 
                                      ? 'bg-zinc-900 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent'
                                      : 'bg-zinc-700/50 border-zinc-600 text-zinc-300 cursor-not-allowed'
                                  }`}
                                  placeholder="Product name"
                                />
                              </div>

                              <div>
                                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <ProgressCircle isComplete={!!product.description.trim()} />
                                  Description
                                </label>
                                <textarea
                                  value={product.description}
                                  onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition resize-none"
                                  placeholder="Product description"
                                  rows={3}
                                />
                              </div>

                              <div>
                                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <ProgressCircle isComplete={!!product.price && product.price > 0} />
                                  Price (RON) *
                                </label>
                                <input
                                  type="number"
                                  value={product.price}
                                  onChange={(e) => updateProduct(product.id, 'price', Number(e.target.value))}
                                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition"
                                  placeholder="0"
                                  min="0"
                                />
                              </div>
                            </div>

                            <div className="space-y-4">
                              {/* Stock Status */}
                              <div>
                                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <ProgressCircle isComplete={!!product.stockStatus} />
                                  Stock Status *
                                </label>
                                <div className="space-y-2">
                                  {STOCK_STATUS_OPTIONS.map((option) => (
                                    <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`stock-${product.id}`}
                                        value={option.value}
                                        checked={product.stockStatus === option.value}
                                        onChange={(e) => updateProduct(product.id, 'stockStatus', e.target.value as any)}
                                        className="sr-only"
                                      />
                                      <div className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                                        product.stockStatus === option.value 
                                          ? option.color 
                                          : 'bg-zinc-700 text-zinc-400 border-zinc-600 hover:border-zinc-500'
                                      }`}>
                                        {option.label}
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              {/* Sizes */}
                              <div>
                                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <ProgressCircle isComplete={product.sizes.length > 0} />
                                  Available Sizes
                                </label>
                                <div className="flex flex-wrap gap-2">
                                  {SIZES.map((size) => (
                                    <button
                                      key={size}
                                      onClick={() => handleSizeToggle(product.id, size)}
                                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                                        product.sizes.includes(size)
                                          ? 'bg-white text-zinc-900'
                                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                      }`}
                                    >
                                      {size}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Colors */}
                              <div>
                                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <ProgressCircle isComplete={product.colors.some(color => color.name.trim())} />
                                  Available Colors
                                </label>
                                <div className="space-y-4">
                                  {product.colors.map((color, colorIndex) => (
                                    <div key={colorIndex} className="border border-zinc-600 rounded-lg p-4 bg-zinc-800/50">
                                      <div className="flex items-center gap-2 mb-3">
                                        <input
                                          type="text"
                                          value={color.name}
                                          onChange={(e) => updateColor(product.id, colorIndex, e.target.value)}
                                          disabled={!isEditMode}
                                          className={`flex-1 px-3 py-2 border rounded-lg transition text-sm ${
                                            isEditMode 
                                              ? 'bg-zinc-900 border-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent'
                                              : 'bg-zinc-700/50 border-zinc-600 text-zinc-300 cursor-not-allowed'
                                          }`}
                                          placeholder="Color name"
                                        />
                                        {product.colors.length > 1 && isEditMode && (
                                          <button
                                            onClick={() => removeColor(product.id, colorIndex)}
                                            className="text-red-400 hover:text-red-300 transition"
                                          >
                                            <X size={16} />
                                          </button>
                                        )}
                                      </div>
                                      
                                      {/* Color Images */}
                                      <div>
                                        <div className="text-xs text-zinc-400 mb-2">Color Images</div>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                          {color.images.map((image, imageIndex) => (
                                            <div key={imageIndex} className="relative aspect-square bg-zinc-700 rounded-lg overflow-hidden">
                                              <Image
                                                src={image}
                                                alt={`${color.name} ${imageIndex + 1}`}
                                                fill
                                                className="object-cover"
                                              />
                                              {isEditMode && (
                                                <button
                                                  onClick={() => removeColorImage(product.id, colorIndex, imageIndex)}
                                                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                                >
                                                  <X size={10} />
                                                </button>
                                              )}
                                            </div>
                                          ))}
                                          
                                          {/* Add Image Button */}
                                          {isEditMode && (
                                            <label className="aspect-square border-2 border-dashed border-zinc-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-zinc-500 transition">
                                              <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) handleColorImageUpload(file, product.id, colorIndex);
                                                }}
                                              />
                                              <Camera size={16} className="text-zinc-400 mb-1" />
                                              <span className="text-xs text-zinc-400">Add Image</span>
                                            </label>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  
                                  {isEditMode && (
                                    <button
                                      onClick={() => addColor(product.id)}
                                      className="text-sm text-zinc-400 hover:text-white transition flex items-center gap-1"
                                    >
                                      <Plus size={14} />
                                      Add Color
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Account Settings Section */}
              <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-2xl overflow-hidden">
                <div className="p-6 flex items-center justify-between">
                  <button
                    onClick={() => setAccountSettingsOpen(!accountSettingsOpen)}
                    className="flex items-center justify-between hover:bg-zinc-800/50 transition text-left flex-1 -mx-6 -my-6 px-6 py-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        🔐 Account Settings
                        {accountSettingsOpen ? (
                          <ChevronUp size={24} className="text-zinc-400 ml-2" />
                        ) : (
                          <ChevronDown size={24} className="text-zinc-400 ml-2" />
                        )}
                      </h2>
                      <p className="text-zinc-400 text-sm mt-1">Manage your login credentials</p>
                    </div>
                  </button>
                </div>
                
                {accountSettingsOpen && (
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <ProgressCircle isComplete={!!profile.username.trim()} />
                          Username
                        </label>
                        {!isEditMode && profile.username ? (
                          <div className="px-4 py-3 text-zinc-300">
                            {profile.username}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={profile.username}
                            onChange={(e) => updateProfile('username', e.target.value)}
                            disabled={!isEditMode}
                            className={`w-full px-4 py-3 border rounded-lg transition ${
                              isEditMode 
                                ? 'bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent'
                                : 'bg-zinc-700/50 border-zinc-600 text-zinc-300 cursor-not-allowed'
                            }`}
                            placeholder="Your username"
                          />
                        )}
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <ProgressCircle isComplete={!!profile.password.trim()} />
                          Password
                        </label>
                        {!isEditMode && profile.password ? (
                          <div className="px-4 py-3 text-zinc-300">
                            ••••••••
                          </div>
                        ) : (
                          <input
                            type="password"
                            value={profile.password}
                            onChange={(e) => updateProfile('password', e.target.value)}
                            disabled={!isEditMode}
                            className={`w-full px-4 py-3 border rounded-lg transition ${
                              isEditMode 
                                ? 'bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent'
                                : 'bg-zinc-700/50 border-zinc-600 text-zinc-300 cursor-not-allowed'
                            }`}
                            placeholder="Your password"
                          />
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <ProgressCircle isComplete={!!profile.email.trim()} />
                          Email Address
                        </label>
                        {!isEditMode && profile.email ? (
                          <div className="px-4 py-3 text-zinc-300">
                            {profile.email}
                          </div>
                        ) : (
                          <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => updateProfile('email', e.target.value)}
                            disabled={!isEditMode}
                            className={`w-full px-4 py-3 border rounded-lg transition ${
                              isEditMode 
                                ? 'bg-zinc-800 border-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent'
                                : 'bg-zinc-700/50 border-zinc-600 text-zinc-300 cursor-not-allowed'
                            }`}
                            placeholder="your.email@example.com"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              <ActionCard
                status={profileData.status}
                canSubmit={canSubmit}
                onSubmit={handleSubmitForReview}
                completionPercentage={profileData.completionPercentage}
              />
              
              <GuidelinesCard />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ActionCard({ status, canSubmit, onSubmit, completionPercentage }: any) {
  return (
    <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">Next Steps</h3>
      
      {status === 'draft' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-amber-400 text-sm mb-2">Complete your profile to submit for review</p>
            <div className="text-xs text-amber-300">
              {completionPercentage < 80 ? 'At least 80% completion required' : 'Ready to submit!'}
            </div>
          </div>
          
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className={`w-full py-3 rounded-lg font-medium transition ${
              canSubmit
                ? 'bg-white text-zinc-900 hover:bg-zinc-200'
                : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <Send size={16} className="inline mr-2" />
            Submit for Review
          </button>
        </div>
      )}
      
      {status === 'submitted' && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-amber-400 text-sm">Your application is under review. We&apos;ll notify you within 2-3 business days.</p>
        </div>
      )}
      
      {status === 'approved' && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-green-400 text-sm">🎉 Your brand is now live on Baguri! Start uploading products and managing your store.</p>
        </div>
      )}
      
      {status === 'rejected' && (
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">Please review the feedback and make necessary changes before resubmitting.</p>
          </div>
          <button
            onClick={onSubmit}
            className="w-full py-3 bg-white text-zinc-900 hover:bg-zinc-200 rounded-lg font-medium transition"
          >
            Resubmit Application
          </button>
        </div>
      )}
    </div>
  );
}

function GuidelinesCard() {
  return (
    <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">Designer Guidelines</h3>
      <div className="space-y-3 text-sm text-zinc-400">
        <div className="flex items-start gap-2">
          <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
          <span>Romanian-based fashion brands</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
          <span>Original designs and products</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
          <span>High-quality product photos</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
          <span>Complete brand information</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-zinc-800">
        <Link 
          href="/designer-guidelines"
          className="text-white hover:text-zinc-300 text-sm font-medium transition"
        >
          Read Full Guidelines →
        </Link>
      </div>
    </div>
  );
}

export default function DesignerDashboard() {
  return (
    <DesignerAuthProvider>
      <DesignerDashboardContent />
    </DesignerAuthProvider>
  );
}