"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Edit, Send, CheckCircle, Clock, XCircle, Upload, Plus, X, Instagram, Globe, Camera, Save, ChevronDown, ChevronUp, LogOut, User, Package, Wallet, ArrowUpRight, BarChart3, Percent, Loader2, Crown, Trophy } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";
import { BrandShowcase } from "@/components/ui/brand-showcase";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { useDesignerAuth } from '@/contexts/DesignerAuthContext';
import { designerService, type DesignerDashboardData, type DesignerProfileForm, type CommissionTier } from '@/lib/designerService';
import { ChangeEmailModal } from '@/components/modals/ChangeEmailModal';
import { ChangePasswordModal } from '@/components/modals/ChangePasswordModal';

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
  const { loading, user, session, initialized, signOut } = useDesignerAuth();

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
    instagramVerified: false,
    tiktokHandle: '',
    website: '',
    specialties: []
  });

  const [status, setStatus] = useState<'draft' | 'submitted' | 'approved' | 'rejected'>('draft');
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [verifyingInstagram, setVerifyingInstagram] = useState(false);
  const [salesSummary, setSalesSummary] = useState<{
    totalSales: number;
    totalEarnings: number;
    orderCount: number;
    averageOrderValue: number;
    currentTier: CommissionTier;
    nextTier: CommissionTier | null;
  }>({
    totalSales: 0,
    totalEarnings: 0,
    orderCount: 0,
    averageOrderValue: 0,
    currentTier: {
      name: 'Bronze',
      baguriFeePct: 50,
      designerEarningsPct: 50,
      minSales: 0,
      maxSales: 999.99
    },
    nextTier: null
  });
  const [influencerRequests, setInfluencerRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

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
          // Don't set completion percentage from database - let local calculation handle it
          setDashboardReady(true);

          // Load sales summary if designer is approved
          if (data.status === 'approved') {
            const summary = await designerService.getDesignerSalesSummary(data.profile.brandName); // We'll need to get designer ID properly
            setSalesSummary(summary);
          }
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
            instagramVerified: false,
            tiktokHandle: '',
            website: '',
            specialties: []
          });
          setStatus('draft');
          setSubmittedAt(null);
          setDashboardReady(true);
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
    // Calculate completion based on filled fields (without products)
    let completed = 0;
    const total = 8; // Updated total to include more fields

    // Required fields (6 total)
    if (profile.brandName?.trim()) completed++;
    if (profile.shortDescription?.trim()) completed++;
    if (profile.longDescription?.trim()) completed++;
    if (profile.logoUrl?.trim()) completed++;
    if (profile.instagramHandle?.trim()) completed++;
    if (profile.city?.trim()) completed++;
    
    // Optional fields that contribute to completion (2 total)
    if (profile.website?.trim()) completed++;
    if (profile.yearFounded && profile.yearFounded > 1900) completed++;

    const percentage = Math.round((completed / total) * 100);
    setCompletionPercentage(percentage);
    
    console.log('Profile completion calculation:', {
      brandName: !!profile.brandName?.trim(),
      shortDescription: !!profile.shortDescription?.trim(),
      longDescription: !!profile.longDescription?.trim(),
      logoUrl: !!profile.logoUrl?.trim(),
      instagramHandle: !!profile.instagramHandle?.trim(),
      city: !!profile.city?.trim(),
      website: !!profile.website?.trim(),
      yearFounded: !!(profile.yearFounded && profile.yearFounded > 1900),
      completed,
      total,
      percentage
    });
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

  // Instagram verification handlers
  const handleInstagramVerification = async () => {
    try {
      setVerifyingInstagram(true);
      
      // Get the access token from the session
      if (!session?.access_token) {
        alert('Authentication required. Please refresh the page and try again.');
        return;
      }
      
      const response = await fetch('/api/auth/instagram/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', response.status, response.statusText);
        alert('Instagram verification is temporarily unavailable. Please try again later or contact support.');
        return;
      }

      const result = await response.json();

      if (result.success && result.authUrl) {
        // Redirect to Instagram OAuth
        window.location.href = result.authUrl;
      } else {
        console.error('Instagram verification failed:', result.error);
        
        // Show user-friendly error message
        if (result.error?.includes('not currently available')) {
          alert('Instagram verification is not currently available. This feature is being set up. Please check back later or contact support for assistance.');
        } else {
          alert(`Failed to initiate Instagram verification: ${result.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error initiating Instagram verification:', error);
      
      // Handle JSON parsing errors specifically
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        alert('Instagram verification is temporarily unavailable due to a server error. Please try again later or contact support.');
      } else {
        alert('Failed to start Instagram verification. Please check your internet connection and try again.');
      }
    } finally {
      setVerifyingInstagram(false);
    }
  };

  const handleRevokeInstagramVerification = async () => {
    if (!confirm('Are you sure you want to revoke Instagram verification? You will need to verify again to prevent impersonation.')) {
      return;
    }

    try {
      // Get the access token from the session
      if (!session?.access_token) {
        alert('Authentication required. Please refresh the page and try again.');
        return;
      }
      
      const response = await fetch('/api/auth/instagram/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setProfile(prev => ({
          ...prev,
          instagramVerified: false
        }));
        alert('Instagram verification revoked successfully.');
      } else {
        alert(`Failed to revoke Instagram verification: ${result.error}`);
      }
    } catch (error) {
      console.error('Error revoking Instagram verification:', error);
      alert('Failed to revoke Instagram verification. Please try again.');
    }
  };

  // Check for Instagram verification success/error in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const instagramSuccess = urlParams.get('instagram_success');
    const instagramError = urlParams.get('instagram_error');

    if (instagramSuccess === 'true') {
      alert('Instagram account verified successfully!');
      // Reload profile data to get updated verification status
      if (user?.id) {
        designerService.getDashboardData(user.id).then(data => {
          if (data) {
            setProfile(data.profile);
          }
        });
      }
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (instagramError) {
      let errorMessage = 'Instagram verification failed.';
      switch (instagramError) {
        case 'access_denied':
          errorMessage = 'Instagram verification was cancelled.';
          break;
        case 'invalid_request':
          errorMessage = 'Invalid Instagram verification request.';
          break;
        case 'verification_failed':
          errorMessage = 'Instagram verification failed. Please try again.';
          break;
        case 'server_error':
          errorMessage = 'Server error during Instagram verification.';
          break;
      }
      alert(errorMessage);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user?.id]);

  // Fetch influencer item requests
  useEffect(() => {
    if (!dashboardData || !dashboardData.wallet || !dashboardData.wallet.designerId) return;
    const fetchRequests = async () => {
      setLoadingRequests(true);
      setRequestError(null);
      try {
        const res = await fetch(`/api/designer/influencer-item-requests?designerId=${dashboardData.wallet!.designerId}`);
        const data = await res.json();
        setInfluencerRequests(data.requests || []);
      } catch (err) {
        setRequestError('Failed to load influencer requests');
      } finally {
        setLoadingRequests(false);
      }
    };
    fetchRequests();
  }, [dashboardData && dashboardData.wallet && dashboardData.wallet.designerId ? dashboardData.wallet.designerId : null]);

  // Handle accept/reject
  const handleRequestAction = async (requestId: string, status: 'accepted' | 'rejected') => {
    if (!dashboardData || !dashboardData.wallet || !dashboardData.wallet.designerId) return;
    setActionLoading(requestId + status);
    setRequestError(null);
    try {
      const res = await fetch('/api/designer/influencer-item-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh requests
        const res2 = await fetch(`/api/designer/influencer-item-requests?designerId=${dashboardData.wallet.designerId}`);
        const data2 = await res2.json();
        setInfluencerRequests(data2.requests || []);
      } else {
        setRequestError(data.error || 'Failed to update request');
      }
    } catch (err) {
      setRequestError('Failed to update request');
    } finally {
      setActionLoading(null);
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
          text: '',
          color: 'text-green-400 bg-green-400/10',
          description: ''
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

  const canSubmit = completionPercentage >= 75 && (status === 'draft' || status === 'rejected'); // 6 out of 8 required fields (75%)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <BackgroundPaths />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-sm safe-area-top mobile-header">
        <div className="max-w-7xl mx-auto px-4 py-4 mobile-px-3 mobile-py-3">
          <div className="flex items-center justify-between">
            {/* Mobile back button - separate from desktop */}
            <Link href="/shop" className="md:flex items-center gap-2 text-zinc-400 hover:text-white transition mobile-touch-target hidden">
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Shop</span>
            </Link>
            
            {/* Mobile-only back button */}
            <Link href="/shop" className="md:hidden flex items-center gap-1 text-zinc-400 hover:text-white transition mobile-touch-target">
              <ArrowLeft size={18} />
              <span className="text-sm">Shop</span>
            </Link>
            
            <Link href="/" className="mobile-touch-target">
              <Image
                src="/wlogo.png"
                alt="Baguri"
                width={120}
                height={30}
                className="h-8 w-auto object-contain mobile-h-6"
                style={{ filter: "invert(1) brightness(2)" }}
              />
            </Link>
            
            <div className="flex items-center gap-4 mobile-gap-2">
              {!isEditMode ? (
              <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-900 hover:bg-zinc-200 rounded-lg font-medium transition mobile-touch-target mobile-px-3 mobile-py-2 mobile-text-sm"
              >
                <Edit size={16} className="mobile-w-4 mobile-h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </button>
              ) : (
              <button
                  onClick={async () => {
                    await handleSaveProfile();
                    setIsEditMode(false);
                  }}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed mobile-touch-target mobile-px-3 mobile-py-2 mobile-text-sm mobile-loading"
              >
                  <Save size={16} className="mobile-w-4 mobile-h-4" />
                  <span className="hidden sm:inline">{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}</span>
                  <span className="sm:hidden">{saveStatus === 'saving' ? '...' : saveStatus === 'saved' ? '✓' : 'Save'}</span>
              </button>
              )}
              
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white rounded-lg font-medium transition mobile-touch-target mobile-px-3 mobile-py-2 mobile-text-sm"
              >
                <LogOut size={16} className="mobile-w-4 mobile-h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Status Banner */}
      <section className="relative z-10 py-6 pt-20 bg-zinc-900/50 mobile-pt-16 mobile-py-4">
        <div className="max-w-7xl mx-auto px-4 mobile-px-3">
          <div className="flex items-center justify-between mobile-flex-col mobile-items-start mobile-gap-4">
            <div className="flex items-center gap-4 mobile-gap-3 mobile-w-full">
              <BrandShowcase 
                logoUrl={profile.logoUrl}
                brandName={profile.brandName}
                size="lg"
                className="mobile-w-12 mobile-h-12"
              />
              <div className="mobile-flex-1">
                <h1 className="text-2xl font-bold mobile-text-xl mobile-line-clamp-2">{profile.brandName || 'Your Designer Profile'}</h1>
                <div className="flex items-center gap-4 mt-1 mb-2 mobile-gap-3 mobile-flex-wrap">
                  {profile.city && (
                    <div className="flex items-center gap-1 text-sm text-zinc-300 mobile-text-xs">
                      📍 {profile.city}
                    </div>
                  )}
                  {profile.yearFounded && (
                    <div className="flex items-center gap-1 text-sm text-zinc-300 mobile-text-xs">
                      📅 Est. {profile.yearFounded}
                    </div>
                  )}
                </div>
                <p className="text-zinc-400 mobile-text-sm mobile-line-clamp-2">{statusInfo.description}</p>
                {status !== 'approved' && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`px-2 py-1 rounded-md text-xs font-medium mobile-text-xs ${statusInfo.color}`}>
                      {statusInfo.text}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4 mobile-w-full mobile-justify-between mobile-bg-zinc-800/50 mobile-p-3 mobile-rounded-lg">
              <div className="text-right mobile-text-left">
                <div className="text-sm text-zinc-400 mobile-text-xs">Profile Completion</div>
                <div className="text-xl font-bold mobile-text-lg">{completionPercentage}%</div>
              </div>
              <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden mobile-flex-1 mobile-ml-4">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 py-8 mobile-py-4 safe-area-bottom">
        <div className="max-w-7xl mx-auto px-4 mobile-px-3">
          <div className="grid lg:grid-cols-3 gap-8 mobile-grid-1 mobile-gap-4">
            
            {/* Profile Form */}
            <div className="lg:col-span-2 space-y-6 mobile-gap-4">
              
              {/* Brand Details Section */}
              <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-2xl overflow-hidden mobile-rounded-lg mobile-card">
                <div className="p-6 flex items-center justify-between mobile-p-4">
                  <button
                    onClick={() => setBrandDetailsOpen(!brandDetailsOpen)}
                    className="flex items-center gap-2 hover:bg-zinc-800/50 transition text-left -mx-6 -my-6 px-6 py-6 flex-1 mobile-touch-target mobile--mx-4 mobile--my-4 mobile-px-4 mobile-py-4"
                  >
                    <h2 className="text-2xl font-bold flex items-center gap-2 mobile-text-lg">
                      ✨ Brand Details
                    </h2>
                    {brandDetailsOpen ? (
                      <ChevronUp size={24} className="text-zinc-400 ml-2 mobile-w-5 mobile-h-5" />
                    ) : (
                      <ChevronDown size={24} className="text-zinc-400 ml-2 mobile-w-5 mobile-h-5" />
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
                                  setShowEmailModal(true);
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 text-white border border-zinc-600 rounded-lg hover:bg-zinc-700 transition font-medium"
                              >
                                Change Your Email
                              </button>
                              
                              <button
                                onClick={() => {
                                  setShowPasswordModal(true);
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
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {status === 'approved' && (
                  <>
                    {/* Action Buttons */}
                    {/* Wallet & Earnings - Now First */}
                    {dashboardData?.wallet && (
                      <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Wallet size={20} className="text-green-400" />
                          <h3 className="text-lg font-bold">Wallet & Earnings</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-zinc-800/50 rounded-lg p-3">
                            <p className="text-xs text-zinc-400 mb-1">Available Balance</p>
                            <p className="text-lg font-bold text-green-400">{dashboardData.wallet.balance.toFixed(2)} RON</p>
                          </div>
                          <div className="bg-zinc-800/50 rounded-lg p-3">
                            <p className="text-xs text-zinc-400 mb-1">Total Sales</p>
                            <p className="text-lg font-bold text-blue-400">{dashboardData.salesTotal.toFixed(2)} RON</p>
                          </div>
                        </div>
                        
                        <Link 
                          href="/wallet"
                          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                        >
                          <Wallet size={16} />
                          Manage Wallet
                        </Link>
                      </div>
                    )}

                    <div className="space-y-3">
                      <Link
                        href="/products"
                        className="w-full py-3 bg-white text-black rounded-lg font-medium transition flex items-center justify-center gap-2 hover:bg-zinc-200"
                      >
                        <Plus size={16} />
                        Manage Products
                      </Link>
                      
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
                      
                      <Link
                        href="/designer-subscription"
                        className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-medium transition flex items-center justify-center gap-2"
                      >
                        <Crown size={16} />
                        View Plans
                      </Link>
                      
                      <Link
                        href="/commission-levels"
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium transition flex items-center justify-center gap-2 hover:from-purple-500 hover:to-blue-500"
                      >
                        <Trophy size={16} />
                        Commission Levels
                      </Link>

                      <Link
                        href="/designer-influencer-requests"
                        className="w-full py-3 bg-pink-700 hover:bg-pink-800 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                      >
                        <User size={16} />
                        Influencer Item Requests
                      </Link>
                    </div>
                  </>
                )}

                {status !== 'approved' && (
                  <ActionCard
                    status={status}
                    canSubmit={canSubmit}
                    onSubmit={handleSubmitForReview}
                    completionPercentage={completionPercentage}
                    setIsEditMode={setIsEditMode}
                    submitting={submitting}
                    profile={profile}
                  />
                )}
                
                <GuidelinesCard />
                
                {status !== 'approved' && <WalletCard wallet={dashboardData?.wallet} />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      <ChangeEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSuccess={() => {
          // Optionally refresh the profile data
          console.log('Email updated successfully');
        }}
      />
      
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => {
          console.log('Password updated successfully');
        }}
      />
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
              {completionPercentage < 75 ? 'At least 6 out of 8 fields needed (75% minimum)' : 'Ready to submit!'}
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
          
          <div className="pt-2 border-t border-zinc-800">
            <Link
              href="/products"
              className="w-full py-2 text-zinc-400 hover:text-white rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm"
            >
              <Plus size={14} />
              Prepare Products (Preview)
            </Link>
            <p className="text-xs text-zinc-500 text-center mt-1">Get your products ready while waiting for approval</p>
          </div>
        </div>
      )}
      
      {status === 'submitted' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-amber-400" />
              <p className="text-amber-400 text-sm font-medium">Under Review</p>
            </div>
            <p className="text-amber-300 text-xs">Your application is being reviewed. We&apos;ll notify you within 24 hours via email.</p>
          </div>
          
          <div className="pt-2 border-t border-zinc-800">
            <Link
              href="/products"
              className="w-full py-2 text-zinc-400 hover:text-white rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm"
            >
              <Plus size={14} />
              Prepare Products (Preview)
            </Link>
            <p className="text-xs text-zinc-500 text-center mt-1">Get your products ready while waiting for approval</p>
          </div>
        </div>
      )}
      
      {status === 'approved' && (
        <div className="space-y-4">
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-green-400" />
              <p className="text-green-400 text-sm font-medium">Profile Approved</p>
            </div>
            <p className="text-green-300 text-xs">Your designer profile is now active on the platform.</p>
          </div>
          
          <div className="space-y-2">
                                <Link
                      href="/products"
                      className="w-full py-3 bg-white text-black rounded-lg font-medium transition flex items-center justify-center gap-2 hover:bg-zinc-200"
                    >
                      <Plus size={16} />
                      Manage Products
                    </Link>
                    
                    <Link
                      href="/order-management"
                      className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <Package size={16} />
                      Order Management
                    </Link>
                    
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
          
          <div className="pt-2 border-t border-zinc-800">
            <Link
              href="/products"
              className="w-full py-2 text-zinc-400 hover:text-white rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm"
            >
              <Plus size={14} />
              Prepare Products (Preview)
            </Link>
            <p className="text-xs text-zinc-500 text-center mt-1">Get your products ready while waiting for approval</p>
          </div>
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

function WalletCard({ wallet }: any) {
  return (
    <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Wallet size={20} className="text-green-400" />
        <h3 className="text-lg font-bold">Wallet & Earnings</h3>
      </div>
      
      {wallet ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-xs text-zinc-400 mb-1">Available Balance</p>
              <p className="text-lg font-bold text-green-400">{wallet.balance.toFixed(2)} RON</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-xs text-zinc-400 mb-1">Total Sales</p>
              <p className="text-lg font-bold text-blue-400">{wallet.totalEarnings.toFixed(2)} RON</p>
            </div>
          </div>
          
          {wallet.balance >= 50 && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-xs">💰 You can request a withdrawal!</p>
            </div>
          )}
          
          <Link 
            href="/wallet"
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            <Wallet size={16} />
            Manage Wallet
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-zinc-800/50 rounded-lg text-center">
            <Wallet size={32} className="mx-auto text-zinc-600 mb-2" />
            <p className="text-sm text-zinc-400 mb-1">No wallet data yet</p>
            <p className="text-xs text-zinc-500">Your earnings will appear here once you start selling</p>
          </div>
          
          <Link 
            href="/wallet"
            className="w-full py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            <Wallet size={16} />
            View Wallet
          </Link>
        </div>
      )}
    </div>
  );
}

export default function DesignerDashboard() {
  return (
    <DesignerDashboardContent />
  );
}