"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Check, X, Eye, Instagram, Globe, MapPin, Calendar, LogOut, Loader2 } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";
import { supabase } from '@/lib/supabase';

// Types for designer applications
interface DesignerApplication {
  id: string;
  brand_name: string;
  short_description: string;
  long_description: string;
  city: string;
  year_founded: number;
  email: string;
  logo_url: string;
  secondary_logo_url: string;
  instagram: string;
  tiktok: string;
  website: string;
  specialties: string[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
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

export default function AdminDashboard() {
  const [designers, setDesigners] = useState<DesignerApplication[]>([]);
  const [selectedDesigner, setSelectedDesigner] = useState<DesignerApplication | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionModal, setRejectionModal] = useState<{ designer: DesignerApplication; isOpen: boolean } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is authenticated
    const adminSession = localStorage.getItem('baguri-admin-session');
    if (adminSession === 'authenticated') {
      setIsAuthenticated(true);
      loadDesignerApplications();
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  const loadDesignerApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('designers')
        .select('*')
        .order('submitted_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading designer applications:', error);
        return;
      }

      setDesigners(data || []);
    } catch (error) {
      console.error('Error loading designer applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('baguri-admin-session');
    router.push('/admin/login');
  };

  const sendEmailNotification = async (email: string, brandName: string, template: 'designer-approved' | 'designer-rejected', rejectionReason?: string) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template,
          email,
          brandName,
          rejectionReason,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send email notification');
      } else {
        console.log('Email notification sent successfully');
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  };

  const handleApprove = async (designerId: string) => {
    const designer = designers.find(d => d.id === designerId);
    if (!designer) return;

    setActionLoading(designerId);
    try {
      const { error } = await supabase
        .from('designers')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', designerId);

      if (error) {
        console.error('Error approving designer:', error);
        alert('Error approving designer. Please try again.');
        return;
      }

      // Send approval email
      await sendEmailNotification(designer.email, designer.brand_name, 'designer-approved');

      // Update local state
      setDesigners(prev => 
        prev.map(d => 
          d.id === designerId 
            ? { ...d, status: 'approved' as const, updated_at: new Date().toISOString() }
            : d
        )
      );

      console.log(`Designer ${designerId} approved`);
      alert(`${designer.brand_name} has been approved! An email notification has been sent.`);
    } catch (error) {
      console.error('Error approving designer:', error);
      alert('Error approving designer. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (designerId: string, rejectionNotes?: string) => {
    const designer = designers.find(d => d.id === designerId);
    if (!designer) return;

    // If no rejection notes provided, open the rejection modal
    if (rejectionNotes === undefined) {
      setRejectionModal({ designer, isOpen: true });
      return;
    }
    
    setActionLoading(designerId);
    try {
      const { error } = await supabase
        .from('designers')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', designerId);

      if (error) {
        console.error('Error rejecting designer:', error);
        alert('Error rejecting designer. Please try again.');
        return;
      }

      // Send rejection email with notes
      await sendEmailNotification(designer.email, designer.brand_name, 'designer-rejected', rejectionNotes);

      // Update local state
      setDesigners(prev => 
        prev.map(d => 
          d.id === designerId 
            ? { ...d, status: 'rejected' as const, updated_at: new Date().toISOString() }
            : d
        )
      );

      console.log(`Designer ${designerId} rejected`);
      alert(`${designer.brand_name} has been rejected. An email notification with feedback has been sent.`);
      
      // Close rejection modal
      setRejectionModal(null);
    } catch (error) {
      console.error('Error rejecting designer:', error);
      alert('Error rejecting designer. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const pendingCount = designers.filter(d => d.status === 'submitted').length;
  const approvedCount = designers.filter(d => d.status === 'approved').length;
  const rejectedCount = designers.filter(d => d.status === 'rejected').length;

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
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="relative z-10 py-8 pt-24 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Designer Applications</h1>
            <button
              onClick={loadDesignerApplications}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-zinc-800/50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">{pendingCount}</div>
              <div className="text-zinc-400">Pending Review</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{approvedCount}</div>
              <div className="text-zinc-400">Approved</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">{rejectedCount}</div>
              <div className="text-zinc-400">Rejected</div>
            </div>
          </div>
        </div>
      </section>

      {/* Designer Applications */}
      <section className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 size={32} className="animate-spin mx-auto mb-4 text-zinc-400" />
              <p className="text-zinc-400">Loading designer applications...</p>
            </div>
          ) : (
          <div className="space-y-6">
              {designers.map((designer) => (
              <DesignerApplicationCard
                key={designer.id}
                designer={designer}
                onApprove={() => handleApprove(designer.id)}
                  onReject={(notes) => handleReject(designer.id, notes)}
                onView={() => setSelectedDesigner(designer)}
                  isLoading={actionLoading === designer.id}
              />
            ))}
            
              {designers.length === 0 && (
              <div className="text-center py-12 text-zinc-400">
                  No designer applications found
              </div>
            )}
          </div>
          )}
        </div>
      </section>

      {/* Designer Detail Modal */}
      {selectedDesigner && (
        <DesignerDetailModal
          designer={selectedDesigner}
          onClose={() => setSelectedDesigner(null)}
          onApprove={() => {
            handleApprove(selectedDesigner.id);
            setSelectedDesigner(null);
          }}
          onReject={(notes) => {
            handleReject(selectedDesigner.id, notes);
            setSelectedDesigner(null);
          }}
          isLoading={actionLoading === selectedDesigner.id}
        />
      )}

      {/* Rejection Modal */}
      {rejectionModal && (
        <RejectionModal
          designer={rejectionModal.designer}
          isOpen={rejectionModal.isOpen}
          onClose={() => setRejectionModal(null)}
          onReject={(notes) => handleReject(rejectionModal.designer.id, notes)}
        />
      )}
    </div>
  );
}

function DesignerApplicationCard({ designer, onApprove, onReject, onView, isLoading }: {
  designer: DesignerApplication;
  onApprove: () => void;
  onReject: (notes?: string) => void;
  onView: () => void;
  isLoading: boolean;
}) {
  const [imageError, setImageError] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-400/10';
      case 'rejected': return 'text-red-400 bg-red-400/10';
      case 'submitted': return 'text-amber-400 bg-amber-400/10';
      default: return 'text-zinc-400 bg-zinc-400/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'submitted': return 'Pending Review';
      case 'draft': return 'Draft';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not submitted';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if image URL is valid and not from example.com
  const shouldShowImage = designer.logo_url && 
    !designer.logo_url.includes('example.com') && 
    !imageError &&
    designer.logo_url.startsWith('http');

  return (
    <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {shouldShowImage ? (
            <Image
              src={designer.logo_url}
              alt={designer.brand_name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-xl object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
          <PlaceholderImage 
            type="logo" 
              alt={designer.brand_name}
            className="w-16 h-16 rounded-xl"
          />
          )}
          <div>
            <h3 className="text-xl font-bold">{designer.brand_name}</h3>
            <p className="text-zinc-400">{designer.short_description}</p>
            <div className="flex items-center gap-4 text-sm text-zinc-500 mt-1">
              {designer.city && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                  {designer.city}
              </span>
              )}
              {designer.year_founded && (
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                  Est. {designer.year_founded}
              </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(designer.status)}`}>
            {getStatusText(designer.status)}
          </span>
        </div>
      </div>
      
      <p className="text-zinc-300 mb-4 line-clamp-2">{designer.long_description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span>Applied {formatDate(designer.submitted_at)}</span>
          <span>{designer.email}</span>
          <div className="flex items-center gap-2">
            {designer.instagram && <Instagram size={14} />}
            {designer.website && <Globe size={14} />}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition"
          >
            <Eye size={16} className="inline mr-1" />
            View Details
          </button>
          
          {designer.status === 'submitted' && (
            <>
              <button
                onClick={() => onReject()}
                disabled={isLoading}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 size={16} className="inline mr-1 animate-spin" /> : <X size={16} className="inline mr-1" />}
                Reject
              </button>
              <button
                onClick={() => onApprove()}
                disabled={isLoading}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 size={16} className="inline mr-1 animate-spin" /> : <Check size={16} className="inline mr-1" />}
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DesignerDetailModal({ designer, onClose, onApprove, onReject, isLoading }: {
  designer: DesignerApplication;
  onClose: () => void;
  onApprove: () => void;
  onReject: (notes?: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-zinc-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">Designer Application Details</h2>
            <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded">
              <X size={20} />
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                {designer.logo_url && !designer.logo_url.includes('example.com') && designer.logo_url.startsWith('http') ? (
                  <Image
                    src={designer.logo_url}
                    alt={designer.brand_name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-xl object-cover"
                    onError={(e) => {
                      // Hide the image on error and show placeholder instead
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                <PlaceholderImage 
                  type="logo" 
                    alt={designer.brand_name}
                  className="w-20 h-20 rounded-xl"
                />
                )}
                <div>
                  <h3 className="text-2xl font-bold">{designer.brand_name}</h3>
                  <p className="text-zinc-400 text-lg">{designer.short_description}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-zinc-300">{designer.long_description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Location</h4>
                  <p className="text-zinc-300">{designer.city || 'Not specified'}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Founded</h4>
                  <p className="text-zinc-300">{designer.year_founded || 'Not specified'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Contact</h4>
                <p className="text-zinc-300">{designer.email}</p>
            </div>
            
              <div>
                <h4 className="font-semibold mb-2">Social Media</h4>
                <div className="space-y-1">
                  {designer.instagram && (
                    <p className="text-zinc-300 flex items-center gap-2">
                      <Instagram size={16} />
                      {designer.instagram}
                    </p>
                  )}
                  {designer.website && (
                    <p className="text-zinc-300 flex items-center gap-2">
                      <Globe size={16} />
                      {designer.website}
                    </p>
                  )}
                </div>
              </div>

              {designer.specialties && designer.specialties.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                    {designer.specialties.map((specialty, index) => (
                      <span key={index} className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded text-sm">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              )}
            </div>
            
            <div className="space-y-6">
              {designer.secondary_logo_url && !designer.secondary_logo_url.includes('example.com') && designer.secondary_logo_url.startsWith('http') && (
                <div>
                  <h4 className="font-semibold mb-2">Secondary Logo</h4>
                  <Image
                    src={designer.secondary_logo_url}
                    alt={`${designer.brand_name} secondary logo`}
                    width={200}
                    height={100}
                    className="rounded-lg object-contain bg-zinc-800 p-4"
                    onError={(e) => {
                      // Hide the image on error
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div>
                <h4 className="font-semibold mb-2">Application Status</h4>
                <div className="space-y-2">
                  <p className="text-zinc-300">Status: <span className="font-medium">{designer.status}</span></p>
                  {designer.submitted_at && (
                    <p className="text-zinc-300">
                      Submitted: {new Date(designer.submitted_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
              
              {designer.status === 'submitted' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => onReject()}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 size={16} className="inline mr-2 animate-spin" /> : <X size={16} className="inline mr-2" />}
                    Reject Application
                  </button>
                  <button
                    onClick={() => onApprove()}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 size={16} className="inline mr-2 animate-spin" /> : <Check size={16} className="inline mr-2" />}
                    Approve Application
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RejectionModal({ designer, isOpen, onClose, onReject }: {
  designer: DesignerApplication;
  isOpen: boolean;
  onClose: () => void;
  onReject: (notes?: string) => void;
}) {
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  const commonReasons = [
    'Product photos need better quality/lighting',
    'Brand description needs more detail',
    'Missing required information',
    'Products don\'t align with our marketplace',
    'Need more product variety',
    'Logo/branding needs improvement',
    'Social media presence insufficient',
    'Other (please specify below)'
  ];

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmit = () => {
    let finalNotes = '';
    
    if (selectedReasons.length > 0) {
      finalNotes = selectedReasons.join('\n• ');
      finalNotes = '• ' + finalNotes;
    }
    
    if (rejectionNotes.trim()) {
      if (finalNotes) {
        finalNotes += '\n\nAdditional notes:\n' + rejectionNotes.trim();
      } else {
        finalNotes = rejectionNotes.trim();
      }
    }

    onReject(finalNotes || undefined);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Reject Application</h2>
              <p className="text-zinc-400 mt-1">Provide feedback for {designer.brand_name}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Common Issues (select all that apply):</h3>
              <div className="space-y-2">
                {commonReasons.map((reason, index) => (
                  <label key={index} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedReasons.includes(reason)}
                      onChange={() => toggleReason(reason)}
                      className="w-4 h-4 text-red-500 bg-zinc-700 border-zinc-600 rounded focus:ring-red-500"
                    />
                    <span className="text-zinc-300">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Additional Notes (optional):</h3>
              <textarea
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Add any specific feedback or suggestions for improvement..."
                className="w-full h-32 p-3 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
              />
            </div>

            <div className="bg-zinc-800/30 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-zinc-300 mb-2">📧 Email Preview:</h4>
              <p className="text-xs text-zinc-400">
                The designer will receive an email with your feedback and instructions on how to update their application.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6 pt-6 border-t border-zinc-700">
              <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition"
              >
              Cancel
              </button>
              <button
              onClick={handleSubmit}
              disabled={selectedReasons.length === 0 && !rejectionNotes.trim()}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
              Send Rejection & Feedback
              </button>
            </div>
        </div>
      </div>
    </div>
  );
} 