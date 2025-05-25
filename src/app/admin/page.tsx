"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Check, X, Eye, Instagram, Globe, MapPin, Calendar, LogOut } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";

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

// Mock pending designer applications
const mockPendingDesigners = [
  {
    id: 6,
    name: "Rustic Threads",
    slug: "rustic-threads",
    logo: "rustic-threads",
    tagline: "Authentic Romanian textiles reimagined",
    description: "Rustic Threads celebrates the rich textile heritage of rural Romania, creating contemporary pieces that honor traditional weaving techniques passed down through generations.",
    location: "Brașov, Romania",
    yearFounded: 2023,
    specialties: ["Traditional Textiles", "Handwoven Fabrics", "Rural Heritage"],
    socialLinks: {
      instagram: "@rustic.threads.ro",
      website: "www.rusticthreads.ro"
    },
    email: "contact@rusticthreads.ro",
    submittedAt: "2024-01-15",
    productCount: 7,
    status: "pending"
  },
  {
    id: 7,
    name: "Urban Edge",
    slug: "urban-edge",
    logo: "urban-edge",
    tagline: "Bold fashion for the fearless",
    description: "Urban Edge pushes the boundaries of contemporary Romanian fashion with edgy designs that speak to the urban youth culture while maintaining high-quality craftsmanship.",
    location: "Constanța, Romania",
    yearFounded: 2023,
    specialties: ["Edgy Design", "Youth Fashion", "Contemporary Style"],
    socialLinks: {
      instagram: "@urban.edge.ro",
      website: "www.urbanedge.ro"
    },
    email: "hello@urbanedge.ro",
    submittedAt: "2024-01-18",
    productCount: 5,
    status: "pending"
  },
  {
    id: 8,
    name: "Botanical Studio",
    slug: "botanical-studio",
    logo: "botanical-studio",
    tagline: "Nature-inspired sustainable fashion",
    description: "Botanical Studio creates eco-friendly fashion pieces inspired by Romania's diverse flora, using sustainable materials and organic dyes sourced locally.",
    location: "Sibiu, Romania",
    yearFounded: 2023,
    specialties: ["Sustainable Fashion", "Eco-Friendly", "Nature-Inspired"],
    socialLinks: {
      instagram: "@botanical.studio",
      website: "www.botanicalstudio.ro"
    },
    email: "info@botanicalstudio.ro",
    submittedAt: "2024-01-20",
    productCount: 9,
    status: "pending"
  }
];

export default function AdminDashboard() {
  const [pendingDesigners, setPendingDesigners] = useState(mockPendingDesigners);
  const [selectedDesigner, setSelectedDesigner] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if admin is authenticated
    const adminSession = localStorage.getItem('baguri-admin-session');
    if (adminSession === 'authenticated') {
      setIsAuthenticated(true);
    } else {
      router.push('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('baguri-admin-session');
    router.push('/admin/login');
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

  const handleApprove = (designerId: number) => {
    setPendingDesigners(prev => 
      prev.map(designer => 
        designer.id === designerId 
          ? { ...designer, status: 'approved' }
          : designer
      )
    );
    // In a real app, this would also add the designer to the main shop
    console.log(`Designer ${designerId} approved`);
  };

  const handleReject = (designerId: number) => {
    setPendingDesigners(prev => 
      prev.map(designer => 
        designer.id === designerId 
          ? { ...designer, status: 'rejected' }
          : designer
      )
    );
    console.log(`Designer ${designerId} rejected`);
  };

  const pendingCount = pendingDesigners.filter(d => d.status === 'pending').length;
  const approvedCount = pendingDesigners.filter(d => d.status === 'approved').length;
  const rejectedCount = pendingDesigners.filter(d => d.status === 'rejected').length;

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
          <h1 className="text-3xl font-bold mb-6">Designer Applications</h1>
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
          <div className="space-y-6">
            {pendingDesigners.map((designer) => (
              <DesignerApplicationCard
                key={designer.id}
                designer={designer}
                onApprove={() => handleApprove(designer.id)}
                onReject={() => handleReject(designer.id)}
                onView={() => setSelectedDesigner(designer)}
              />
            ))}
            
            {pendingDesigners.length === 0 && (
              <div className="text-center py-12 text-zinc-400">
                No designer applications to review
              </div>
            )}
          </div>
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
          onReject={() => {
            handleReject(selectedDesigner.id);
            setSelectedDesigner(null);
          }}
        />
      )}
    </div>
  );
}

function DesignerApplicationCard({ designer, onApprove, onReject, onView }: {
  designer: any;
  onApprove: () => void;
  onReject: () => void;
  onView: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-400/10';
      case 'rejected': return 'text-red-400 bg-red-400/10';
      default: return 'text-amber-400 bg-amber-400/10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Pending Review';
    }
  };

  return (
    <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <PlaceholderImage 
            type="logo" 
            alt={designer.name}
            className="w-16 h-16 rounded-xl"
          />
          <div>
            <h3 className="text-xl font-bold">{designer.name}</h3>
            <p className="text-zinc-400">{designer.tagline}</p>
            <div className="flex items-center gap-4 text-sm text-zinc-500 mt-1">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {designer.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Est. {designer.yearFounded}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(designer.status)}`}>
            {getStatusText(designer.status)}
          </span>
        </div>
      </div>
      
      <p className="text-zinc-300 mb-4 line-clamp-2">{designer.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span>{designer.productCount} products</span>
          <span>Applied {designer.submittedAt}</span>
          <div className="flex items-center gap-2">
            <Instagram size={14} />
            <Globe size={14} />
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
          
          {designer.status === 'pending' && (
            <>
              <button
                onClick={onReject}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition"
              >
                <X size={16} className="inline mr-1" />
                Reject
              </button>
              <button
                onClick={onApprove}
                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm font-medium transition"
              >
                <Check size={16} className="inline mr-1" />
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DesignerDetailModal({ designer, onClose, onApprove, onReject }: {
  designer: any;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
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
                <PlaceholderImage 
                  type="logo" 
                  alt={designer.name}
                  className="w-20 h-20 rounded-xl"
                />
                <div>
                  <h3 className="text-2xl font-bold">{designer.name}</h3>
                  <p className="text-zinc-400 text-lg">{designer.tagline}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-zinc-300">{designer.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Location</h4>
                  <p className="text-zinc-300">{designer.location}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Founded</h4>
                  <p className="text-zinc-300">{designer.yearFounded}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Contact</h4>
                <p className="text-zinc-300">{designer.email}</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {designer.specialties.map((specialty: string) => (
                    <span key={specialty} className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-sm">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Social Links</h4>
                <div className="space-y-2">
                  <a 
                    href={`https://instagram.com/${designer.socialLinks.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
                  >
                    <Instagram size={16} />
                    {designer.socialLinks.instagram}
                  </a>
                  <a 
                    href={`https://${designer.socialLinks.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
                  >
                    <Globe size={16} />
                    {designer.socialLinks.website}
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Application Details</h4>
                <div className="space-y-1 text-sm text-zinc-400">
                  <p>Products: {designer.productCount}</p>
                  <p>Submitted: {designer.submittedAt}</p>
                  <p>Status: {designer.status}</p>
                </div>
              </div>
            </div>
          </div>
          
          {designer.status === 'pending' && (
            <div className="flex gap-4 mt-8 pt-6 border-t border-zinc-700">
              <button
                onClick={onReject}
                className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition"
              >
                <X size={20} className="inline mr-2" />
                Reject Application
              </button>
              <button
                onClick={onApprove}
                className="flex-1 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-medium transition"
              >
                <Check size={20} className="inline mr-2" />
                Approve & Add to Shop
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 