"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, type DesignerProfile, type Designer } from '@/lib/supabase';

type DesignerAuthContextType = {
  user: User | null;
  session: Session | null;
  designerProfile: DesignerProfile | null;
  loading: boolean;
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

  // Fetch designer profile data
  const fetchDesignerProfile = async (userId: string): Promise<DesignerProfile | null> => {
    try {
      // First get the designer_auth record
      const { data: authData, error: authError } = await supabase
        .from('designer_auth')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (authError || !authData) {
        console.log('No designer auth record found for user:', userId);
        return null;
      }

      // Then get the designer details
      const { data: designerData, error: designerError } = await supabase
        .from('designers')
        .select('*')
        .eq('id', authData.designer_id)
        .single();

      if (designerError || !designerData) {
        console.error('Error fetching designer data:', designerError);
        return null;
      }

      return {
        ...designerData,
        auth: authData
      } as DesignerProfile;
    } catch (error) {
      console.error('Error fetching designer profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchDesignerProfile(user.id);
      setDesignerProfile(profile);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchDesignerProfile(session.user.id).then(setDesignerProfile);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profile = await fetchDesignerProfile(session.user.id);
        setDesignerProfile(profile);
      } else {
        setDesignerProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'An error occurred during sign in' };
    } finally {
      setLoading(false);
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
        return { error: error.message };
      }

      if (!data.user) {
        return { error: 'Failed to create user account' };
      }

      // Note: The designer profile and auth linkage will be created manually
      // by admin after the designer fills out their application form
      // For now, we just create the auth user

      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'An error occurred during sign up' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setDesignerProfile(null);
    setLoading(false);
  };

  const value: DesignerAuthContextType = {
    user,
    session,
    designerProfile,
    loading,
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