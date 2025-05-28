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

    // Get initial session with improved loading
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        // Set session and user immediately
        setSession(session);
        setUser(session?.user ?? null);
        
        // Load profile if user exists
        if (session?.user) {
          const profile = await fetchDesignerProfile(session.user.id);
          if (mounted) {
            setDesignerProfile(profile);
          }
        }
        
        // Mark as initialized and stop loading
        setInitialized(true);
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event, session?.user?.id);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Clear cache and fetch fresh profile on auth change
        delete profileCacheRef.current[session.user.id];
        const profile = await fetchDesignerProfile(session.user.id);
        if (mounted) {
          setDesignerProfile(profile);
        }
      } else {
        setDesignerProfile(null);
        // Clear all cache when signing out
        profileCacheRef.current = {};
      }
      
      // Set loading to false after auth state change is processed
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove the initialized dependency to prevent circular updates

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