"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, type DesignerProfile, type Designer } from '@/lib/supabase';

type DesignerAuthContextType = {
  user: User | null;
  session: Session | null;
  designerProfile: DesignerProfile | null;
  loading: boolean;
  profileLoading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const DesignerAuthContext = createContext<DesignerAuthContextType | undefined>(undefined);

export function DesignerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [designerProfile, setDesignerProfile] = useState<DesignerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Simple cache to prevent repeated profile fetches
  const profileCacheRef = React.useRef<{ [userId: string]: DesignerProfile | null }>({});

  // Fetch designer profile data with better error handling and caching
  const fetchDesignerProfile = async (userId: string): Promise<DesignerProfile | null> => {
    // Check cache first
    if (profileCacheRef.current[userId] !== undefined) {
      return profileCacheRef.current[userId];
    }

    try {
      setProfileLoading(true);
      
      // Use a single query with joins to reduce database calls
      const { data: profileData, error } = await supabase
        .from('designer_auth')
        .select(`
          *,
          designers (*)
        `)
        .eq('user_id', userId)
        .single();

      if (error || !profileData) {
        console.log('No designer profile found for user:', userId);
        profileCacheRef.current[userId] = null;
        return null;
      }

      if (!profileData.designers) {
        console.log('No designer data linked to auth record');
        profileCacheRef.current[userId] = null;
        return null;
      }

      const profile = {
        ...profileData.designers,
        auth: profileData
      } as DesignerProfile;

      // Cache the result
      profileCacheRef.current[userId] = profile;
      return profile;
    } catch (error) {
      console.error('Error fetching designer profile:', error);
      profileCacheRef.current[userId] = null;
      return null;
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      // Clear cache for this user to force fresh fetch
      delete profileCacheRef.current[user.id];
      const profile = await fetchDesignerProfile(user.id);
      setDesignerProfile(profile);
    }
  };

  useEffect(() => {
    let mounted = true;
    let initializationTimeout: NodeJS.Timeout;

    // Get initial session with improved loading and timeout protection
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) {
          console.log('⚠️ Component unmounted during auth initialization');
          return;
        }
        
        console.log('🔐 Session retrieved:', { 
          hasSession: !!session, 
          userId: session?.user?.id,
          error: error?.message 
        });
        
        // Set session and user immediately
        setSession(session);
        setUser(session?.user ?? null);
        
        // Load profile if user exists
        if (session?.user) {
          console.log('👤 Loading profile for user:', session.user.id);
          const profile = await fetchDesignerProfile(session.user.id);
          if (mounted) {
            setDesignerProfile(profile);
            console.log('✅ Profile loaded:', !!profile);
          }
        } else {
          console.log('❌ No session found');
          setDesignerProfile(null);
        }
        
        // Mark as initialized and stop loading
        if (mounted) {
          setInitialized(true);
          setLoading(false);
          console.log('✅ Auth initialization complete');
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        if (mounted) {
          setInitialized(true);
          setLoading(false);
          setSession(null);
          setUser(null);
          setDesignerProfile(null);
        }
      }
    };

    // Add timeout protection to prevent infinite loading
    initializationTimeout = setTimeout(() => {
      if (mounted && !initialized) {
        console.warn('⚠️ Auth initialization timeout - forcing completion');
        setInitialized(true);
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    initializeAuth();

    // Listen for auth changes with better error handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) {
        console.log('⚠️ Component unmounted during auth state change');
        return;
      }
      
      console.log('🔄 Auth state changed:', { 
        event, 
        userId: session?.user?.id,
        hasSession: !!session 
      });
      
      // Prevent rapid state changes
      if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed, updating session only');
        setSession(session);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('👤 Auth state change - loading profile for:', session.user.id);
        // Clear cache and fetch fresh profile on auth change
        delete profileCacheRef.current[session.user.id];
        const profile = await fetchDesignerProfile(session.user.id);
        if (mounted) {
          setDesignerProfile(profile);
          console.log('✅ Profile updated from auth change:', !!profile);
        }
      } else {
        console.log('❌ No session in auth state change');
        setDesignerProfile(null);
        // Clear all cache when signing out
        profileCacheRef.current = {};
      }
      
      // Set loading to false after auth state change is processed
      if (mounted) {
        setLoading(false);
        setInitialized(true);
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth context');
      mounted = false;
      clearTimeout(initializationTimeout);
      subscription.unsubscribe();
    };
  }, []); // Keep empty dependency array to prevent re-initialization

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return { error: error.message };
      }

      // Don't set loading to false here - let the auth state change handler do it
      return { error: null };
    } catch (error: any) {
      setLoading(false);
      return { error: error.message || 'An error occurred during sign in' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error: string | null }> => {
    try {
      setLoading(true);
      // First create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        setLoading(false);
        return { error: error.message };
      }

      if (!data.user) {
        setLoading(false);
        return { error: 'Failed to create user account' };
      }

      // Don't set loading to false here - let the auth state change handler do it
      return { error: null };
    } catch (error: any) {
      setLoading(false);
      return { error: error.message || 'An error occurred during sign up' };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear state immediately for better UX
      setDesignerProfile(null);
      setUser(null);
      setSession(null);
      
      // Clear profile cache
      profileCacheRef.current = {};
      
      // Then sign out from Supabase
      await supabase.auth.signOut();
      
      setLoading(false);
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if signOut fails, clear the local state
      setDesignerProfile(null);
      setUser(null);
      setSession(null);
      profileCacheRef.current = {};
      setLoading(false);
    }
  };

  const value: DesignerAuthContextType = {
    user,
    session,
    designerProfile,
    loading,
    profileLoading,
    initialized,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return (
    <DesignerAuthContext.Provider value={value}>
      {children}
    </DesignerAuthContext.Provider>
  );
}

export function useDesignerAuth() {
  const context = useContext(DesignerAuthContext);
  if (context === undefined) {
    throw new Error('useDesignerAuth must be used within a DesignerAuthProvider');
  }
  return context;
} 