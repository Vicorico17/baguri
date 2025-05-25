"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { BackgroundPaths } from "@/components/ui/background-paths";
import { DesignerAuthProvider, useDesignerAuth } from '@/contexts/DesignerAuthContext';

function DesignerAuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });
  const router = useRouter();
  const { signIn, signUp, signOut, loading, user, designerProfile } = useDesignerAuth();

  // Auto-redirect to dashboard only if user has designer profile and visits this page
  // Give them time to see options and choose to sign out if needed
  useEffect(() => {
    if (user && !loading && designerProfile) {
      // Countdown timer
      const countdownInterval = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            router.push('/designer-dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    } else {
      setRedirectCountdown(3); // Reset countdown when conditions change
    }
  }, [user, designerProfile, loading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (isLogin) {
        // Login with Supabase
        const { error: signInError } = await signIn(formData.email, formData.password);
        if (signInError) {
          setError(signInError);
        }
        // Router redirect is handled in useEffect
      } else {
        // Signup validation
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }

        if (!formData.fullName.trim()) {
          setError('Full name is required');
          return;
        }

        // Signup with Supabase
        const { error: signUpError } = await signUp(formData.email, formData.password, formData.fullName);
        if (signUpError) {
          setError(signUpError);
        } else {
          // Show success message and switch to login
          setSuccessMessage('Account created successfully! Please check your email to verify your account, then sign in.');
          setIsLogin(true);
          setFormData({
            email: formData.email, // Keep email for convenience
            password: '',
            fullName: '',
            confirmPassword: ''
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

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
            

          </div>
        </div>
      </header>

      {/* Auth Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[80vh] px-4 pt-20">
        <div className="w-full max-w-md">
          {/* Already authenticated notice */}
          {user && !loading && (
            <div className="mb-6 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center">
              <h3 className="text-lg font-bold text-blue-400 mb-3">
                You're already signed in!
              </h3>
              <p className="text-zinc-300 mb-4">
                {designerProfile 
                  ? `Redirecting to your dashboard in ${redirectCountdown} seconds...`
                  : "Ready to complete your designer application?"
                }
              </p>
              <div className="flex gap-3 justify-center">
                {!designerProfile && (
                  <Link 
                    href="/designer-dashboard"
                    className="px-4 py-2 bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-200 transition"
                  >
                    Complete Profile
                  </Link>
                )}
                <button
                  onClick={signOut}
                  className="px-4 py-2 bg-zinc-700 text-white rounded-lg font-medium hover:bg-zinc-600 transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Only show auth form if user is not authenticated */}
          {!user && (
            <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8">
              <div className="text-center mb-8">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={24} className="text-zinc-400" />
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {isLogin ? 'Designer Login' : 'Join as Designer'}
              </h1>
              <p className="text-zinc-400">
                {isLogin 
                  ? 'Access your designer dashboard' 
                  : 'Create your designer account to get started'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-white text-zinc-900 rounded-lg font-medium hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? (isLogin ? 'Signing In...' : 'Creating Account...') 
                  : (isLogin ? 'Sign In' : 'Create Account')
                }
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccessMessage('');
                  setFormData({
                    email: '',
                    password: '',
                    fullName: '',
                    confirmPassword: ''
                  });
                }}
                className="text-zinc-400 hover:text-white transition"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>



            <div className="mt-6 text-center">
              <p className="text-xs text-zinc-500">
                By continuing, you agree to our Designer Terms and Privacy Policy
              </p>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DesignerAuth() {
  return (
    <DesignerAuthProvider>
      <DesignerAuthForm />
    </DesignerAuthProvider>
  );
} 