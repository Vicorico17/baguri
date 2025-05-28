"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Edit, Send, CheckCircle, Clock, XCircle, Upload, Plus, X, Instagram, Globe, Camera, Save, ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";
import { BrandShowcase } from "@/components/ui/brand-showcase";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { useDesignerAuth } from '@/contexts/DesignerAuthContext';
import { designerService, type DesignerDashboardData, type DesignerProfileForm } from '@/lib/designerService';

// Product stock status options - removed since products management is removed
// const STOCK_STATUS_OPTIONS = [...]

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']; // Keep for future use

// Romanian cities
const ROMANIAN_CITIES = [
  'Bucharest', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Constanța', 'Craiova', 'Brașov', 'Galați', 
  'Ploiești', 'Oradea', 'Braila', 'Arad', 'Pitești', 'Sibiu', 'Bacău', 'Târgu Mureș', 
  'Baia Mare', 'Buzău', 'Botoșani', 'Satu Mare', 'Râmnicu Vâlcea', 'Drobeta-Turnu Severin',
  'Suceava', 'Piatra Neamț', 'Târgu Jiu', 'Tulcea', 'Focșani', 'Bistrița', 'Reșița', 'Alba Iulia'
];

// Using types from designerService

// Mock designer profile data
const mockDesignerProfile = {
  id: 1,
  userId: "user_123", // This would come from Supabase auth
  status: "draft" as "draft" | "submitted" | "approved" | "rejected",
  submittedAt: null as string | null,
  completionPercentage: 15
};

function DesignerDashboardContent() {
  const [dashboardData, setDashboardData] = useState<DesignerDashboardData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSecondaryLogo, setUploadingSecondaryLogo] = useState(false);
  const [brandDetailsOpen, setBrandDetailsOpen] = useState(true);
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dashboardReady, setDashboardReady] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbTestResult, setDbTestResult] = useState<string | null>(null);
  const router = useRouter();
  
  // Use the same auth context as the auth page
  const { loading, user, initialized, signOut } = useDesignerAuth();

  const [profile, setProfile] = useState<DesignerProfileForm>({
    brandName: '',
    shortDescription: '',
    longDescription: '',
    city: '',
    yearFounded: new Date().getFullYear(),
    email: '',
    logoUrl: '',
    secondaryLogoUrl: '',
    instagramHandle: '',
    tiktokHandle: '',
    website: '',
    specialties: []
  });

  const [status, setStatus] = useState<'draft' | 'submitted' | 'approved' | 'rejected'>('draft');
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  // Optimized redirect logic - immediate redirect if not authenticated
  useEffect(() => {
    console.log('🏠 Dashboard auth check:', { 
      loading, 
      initialized,
      user: !!user, 
      userId: user?.id
    });
    
    // Only redirect if auth is initialized and there's no user
    if (initialized && !user) {
      console.log('🔄 Auth initialized but no user found, redirecting to auth...');
      router.replace('/designer-auth');
      return;
    }
    
    // Log when user is authenticated
    if (initialized && user) {
      console.log('✅ User authenticated on dashboard:', user.id);
    }
  }, [initialized, user, router, loading]);

  // Load dashboard data
  useEffect(() => {
    if (!user?.id) return;

    console.log('Loading dashboard data for user:', user.id);
    
    const loadDashboardData = async () => {
      try {
        setLoadingData(true);
        
        // Create a timeout promise to prevent hanging
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Dashboard data loading timeout')), 10000); // 10 second timeout
        });
        
        // Create the actual data loading promise
        const dataPromise = designerService.getDashboardData(user.id);
        
        console.log('📊 Loading dashboard data with timeout...');
        
        // Race between the data loading and timeout
        const data = await Promise.race([dataPromise, timeoutPromise]);
        
        console.log('📈 Dashboard data loaded:', { hasData: !!data, status: data?.status });
        setDashboardData(data);
        
        if (data) {
          setProfile(data.profile);
          setStatus(data.status);
          setSubmittedAt(data.submittedAt);
          setCompletionPercentage(data.completionPercentage);
        } else {
          console.log('No dashboard data returned, using defaults for new user');
          // Set default values for new users
          setProfile({
            brandName: '',
            shortDescription: '',
            longDescription: '',
            city: '',
            yearFounded: new Date().getFullYear(),
            email: user.email || '',
            logoUrl: '',
            secondaryLogoUrl: '',
            instagramHandle: '',
            tiktokHandle: '',
            website: '',
            specialties: []
          });
          setStatus('draft');
          setSubmittedAt(null);
          setCompletionPercentage(0);
        }
        
        setDashboardReady(true);
      } catch (error) {
        console.error('💥 Error loading dashboard data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
        // Even on error, set ready to true so user can see the form
        setDashboardReady(true);
      } finally {
        setLoadingData(false);
      }
    };

    loadDashboardData();
  }, [user?.id, user?.email]);

  // Update completion percentage when profile changes
  useEffect(() => {
    updateCompletionPercentage();
  }, [profile]);

  // Database connectivity test function
  const testDatabaseConnectivity = async () => {
    try {
      setDbTestResult('Testing database connectivity...');
      console.log('🔌 Testing database connectivity from dashboard...');
      
      const response = await fetch('/api/test-db');
      const result = await response.json();
      
      if (result.success) {
        setDbTestResult(`✅ Database connection successful! Has data: ${result.hasData}`);
        console.log('✅ Database test passed:', result);
      } else {
        setDbTestResult(`❌ Database test failed: ${result.error}`);
        console.error('❌ Database test failed:', result);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setDbTestResult(`💥 Database test error: ${errorMsg}`);
      console.error('💥 Database test error:', error);
    }
  };

  // Show loading state while checking authentication
  if (!initialized) {
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

  // Show dashboard skeleton while data is loading (but only if still loading data)
  if (loadingData && !dashboardReady) {
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

  const updateCompletionPercentage = () => {
    // Calculate completion based on filled fields (without products)
    let completed = 0;
    const total = 6; // Reduced from 10 since we removed products

    if (profile.brandName) completed++;
    if (profile.shortDescription) completed++;
    if (profile.longDescription) completed++;
    if (profile.logoUrl) completed++;
    if (profile.instagramHandle) completed++;
    if (profile.city) completed++;

    const percentage = Math.round((completed / total) * 100);
    setCompletionPercentage(percentage);
  };

  // Real Supabase upload function
  const handleLogoUpload = async (file: File, isSecondary = false) => {
    if (!user?.id) return;
    
    if (isSecondary) {
      setUploadingSecondaryLogo(true);
    } else {
      setUploadingLogo(true);
    }

    try {
      const fileName = isSecondary ? 'secondary-logo' : 'logo';
      const result = await designerService.uploadFile(file, 'logos', user.id, fileName);
      
      if (result.success && result.url) {
        console.log(`${isSecondary ? 'Secondary logo' : 'Logo'} uploaded successfully, URL set to:`, result.url);
      
        // Update profile with the new logo URL
        if (isSecondary) {
          updateProfile('secondaryLogoUrl', result.url);
        } else {
          updateProfile('logoUrl', result.url);
        }
        
        // Logo uploaded successfully - user can manually save when ready
      } else {
        console.error('Upload error:', result.error);
        alert(`Error uploading ${isSecondary ? 'secondary logo' : 'logo'}: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Error uploading ${isSecondary ? 'secondary logo' : 'logo'}: ${error.message}`);
    } finally {
      if (isSecondary) {
        setUploadingSecondaryLogo(false);
      } else {
        setUploadingLogo(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    setSaving(true);
    setSaveStatus('saving');
    try {
      console.log('Saving profile with data:', profile);
      
      // Save profile data
      const profileResult = await designerService.saveDesignerProfile(user.id, profile);
      if (!profileResult.success) {
        console.error('Error saving profile:', profileResult.error);
        alert(`Error saving profile: ${profileResult.error}`);
        setSaveStatus('idle');
        return;
      }
      
      // Reload dashboard data to ensure everything is synced
      const updatedData = await designerService.getDashboardData(user.id);
      if (updatedData) {
        setDashboardData(updatedData);
        setProfile(updatedData.profile);
        setStatus(updatedData.status);
        setSubmittedAt(updatedData.submittedAt);
        setCompletionPercentage(updatedData.completionPercentage);
      }
      
      // Show success feedback
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
      
      console.log('Profile saved successfully');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      alert(`Error saving profile: ${error.message}`);
      setSaveStatus('idle');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!user?.id) return;
    
    setSubmitting(true);
    try {
      // First save current data
      await handleSaveProfile();
      
      // Then submit for review
      const result = await designerService.submitForReview(user.id);
      if (result.success) {
        // Reload dashboard data to get updated status
        const updatedData = await designerService.getDashboardData(user.id);
        if (updatedData) {
          setDashboardData(updatedData);
          setProfile(updatedData.profile);
          setStatus(updatedData.status);
          setSubmittedAt(updatedData.submittedAt);
          setCompletionPercentage(updatedData.completionPercentage);
        }
        
        // Different messages for initial submission vs resubmission
        const isResubmission = dashboardData?.status === 'rejected';
        const message = isResubmission 
          ? 'Successfully resubmitted for review! 🎉\n\nThank you for making the requested updates. We\'ve sent you a confirmation email and our team will review your updated application within 24 hours.'
          : 'Successfully submitted for review! 🎉\n\nWe\'ve sent you a confirmation email with next steps. Our team will review your application and get back to you within 24 hours.';
        
        alert(message);
      } else {
        alert(`Error submitting for review: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error submitting for review:', error);
      alert(`Error submitting for review: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
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

  const statusInfo = getStatusInfo(status);

  const canSubmit = completionPercentage >= 83 && (status === 'draft' || status === 'rejected'); // Updated threshold since we removed products

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
              {!isEditMode ? (
              <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-900 hover:bg-zinc-200 rounded-lg font-medium transition"
              >
                <Edit size={16} />
                  Edit Profile
              </button>
              ) : (
              <button
                  onClick={async () => {
                    await handleSaveProfile();
                    setIsEditMode(false);
                  }}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <Save size={16} />
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
              </button>
              )}
              
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white rounded-lg font-medium transition"
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
                <div className="text-xl font-bold">{completionPercentage}%</div>
              </div>
              <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Error Display */}
      {error && (
        <section className="relative z-10 py-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 flex items-center gap-3">
              <div className="text-red-400">⚠️</div>
              <div className="flex-1">
                <div className="text-red-300 font-medium">Data Loading Error</div>
                <div className="text-red-400 text-sm">{error}</div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setError(null);
                      // Retry loading data
                      if (user?.id) {
                        const loadDashboardData = async () => {
                          try {
                            const data = await designerService.getDashboardData(user.id);
                            setDashboardData(data);
                            if (data) {
                              setProfile(data.profile);
                              setStatus(data.status);
                              setSubmittedAt(data.submittedAt);
                              setCompletionPercentage(data.completionPercentage);
                            }
                          } catch (error) {
                            console.error('Retry failed:', error);
                            setError(error instanceof Error ? error.message : 'Retry failed');
                          }
                        };
                        loadDashboardData();
                      }
                    }}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded transition-colors"
                  >
                    Retry
                  </button>
                  <button
                    onClick={testDatabaseConnectivity}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
                  >
                    Test Database
                  </button>
                </div>
                {dbTestResult && (
                  <div className="mt-2 text-sm text-zinc-300 bg-zinc-800/50 p-2 rounded">
                    {dbTestResult}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

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
                                    key={profile.logoUrl}
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
                            <label className="text-sm font-medium mb-2 flex items-center gap-2">
                              <ProgressCircle isComplete={!!profile.secondaryLogoUrl.trim()} />
                              Secondary Logo (Optional for 100%)
                            </label>
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
                                    key={profile.secondaryLogoUrl}
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
                            TikTok Handle (Optional for 100%)
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
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <ProgressCircle isComplete={!!profile.email.trim()} />
                          Email Address
                          <span className="text-xs text-zinc-500">(from your account)</span>
                        </label>
                        <div className="px-4 py-3 text-zinc-300 bg-zinc-700/50 border border-zinc-600 rounded-lg">
                          {profile.email || user?.email || 'No email found'}
                          </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          Email is synced from your account and cannot be changed here
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={() => {
                            // TODO: Implement email change functionality
                            alert('Email change functionality will be implemented soon');
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 text-white border border-zinc-600 rounded-lg hover:bg-zinc-700 transition font-medium"
                        >
                          Change Your Email
                        </button>
                        
                        <button
                          onClick={() => {
                            // TODO: Implement password change functionality
                            alert('Password change functionality will be implemented soon');
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 text-white border border-zinc-600 rounded-lg hover:bg-zinc-700 transition font-medium"
                        >
                          Change Your Password
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              <ActionCard
                status={status}
                canSubmit={canSubmit}
                onSubmit={handleSubmitForReview}
                completionPercentage={completionPercentage}
                setIsEditMode={setIsEditMode}
                submitting={submitting}
                profile={profile}
              />
              
              <GuidelinesCard />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ActionCard({ status, canSubmit, onSubmit, completionPercentage, setIsEditMode, submitting, profile }: any) {
  return (
    <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">Next Steps</h3>
      
      {status === 'draft' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-amber-400 text-sm mb-2">Complete your profile to submit for review</p>
            <div className="text-xs text-amber-300">
              {completionPercentage < 63 ? 'At least 5 out of 6 required fields needed' : 'Ready to submit!'}
            </div>
          </div>
          
          <button
            onClick={onSubmit}
            disabled={!canSubmit || submitting}
            className={`w-full py-3 rounded-lg font-medium transition ${
              canSubmit && !submitting
                ? 'bg-white text-zinc-900 hover:bg-zinc-200'
                : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <Send size={16} className="inline mr-2" />
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </button>
        </div>
      )}
      
      {status === 'submitted' && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-amber-400" />
            <p className="text-amber-400 text-sm font-medium">Under Review</p>
          </div>
          <p className="text-amber-300 text-xs">Your application is being reviewed. We&apos;ll notify you within 24 hours via email.</p>
        </div>
      )}
      
      {status === 'approved' && (
        <div className="space-y-4">
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-green-400" />
              <p className="text-green-400 text-sm font-medium">Congratulations! 🎉</p>
            </div>
            <p className="text-green-300 text-xs">Your brand is now live on Baguri! You can view your store page.</p>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => {
                const slug = profile.brandName?.toLowerCase().replace(/\s+/g, '-');
                if (slug) {
                  window.open(`/designer/${slug}`, '_blank');
                } else {
                  window.open('/designers', '_blank');
                }
              }}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              <Globe size={16} />
              View Your Store
            </button>
          </div>
        </div>
      )}
      
      {status === 'rejected' && (
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={16} className="text-red-400" />
              <p className="text-red-400 text-sm font-medium">Updates Required</p>
          </div>
            <p className="text-red-300 text-xs">Please review the feedback email and make necessary changes before resubmitting.</p>
          </div>
          
          <div className="p-3 bg-zinc-800/50 border border-zinc-600 rounded-lg">
            <p className="text-zinc-300 text-xs mb-2">📧 Check your email for detailed feedback</p>
            <p className="text-zinc-400 text-xs">Update your profile based on our suggestions, then resubmit when ready.</p>
          </div>
          
          <button
            onClick={onSubmit}
            disabled={!canSubmit || submitting}
            className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
              canSubmit && !submitting
                ? 'bg-white text-zinc-900 hover:bg-zinc-200'
                : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <Send size={16} />
            {submitting ? 'Submitting...' : 'Resubmit for Review'}
          </button>
          
          {!canSubmit && (
            <p className="text-xs text-zinc-500 text-center">
              Complete your profile to resubmit ({Math.round(completionPercentage)}% complete)
            </p>
          )}
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
    <DesignerDashboardContent />
  );
}