"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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

export function DesignerAuthProvider({children}:{children:React.ReactNode}) {
 const [session,setSession]=useState<Session|null>(null);
 const [designerProfile,setDesignerProfile]=useState<DesignerProfile|null>(null);
 const [loading,setLoading]=useState(true);const [profileLoading,setProfileLoading]=useState(false);const [initialized,setInitialized]=useState(false);
 const generation=useRef(0);
 const loadProfile=useCallback(async(userId:string)=>{
  const version=++generation.current;setProfileLoading(true);
  try{const {data,error}=await supabase.from('designer_auth').select('*,designers(*)').eq('user_id',userId).maybeSingle();
   if(version===generation.current)setDesignerProfile(!error && data?.designers?{...data.designers,auth:data} as DesignerProfile:null);
  }finally{if(version===generation.current)setProfileLoading(false);}
 },[]);
 useEffect(()=>{
  let active=true;const requestGeneration=generation;
  const update=(next:Session|null)=>{if(!active)return;setSession(next);setLoading(false);setInitialized(true);if(!next){generation.current++;setDesignerProfile(null);setProfileLoading(false);}else{setTimeout(()=>{if(active)void loadProfile(next.user.id);},0);}};
  try{const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>update(next));
   void supabase.auth.getSession().then(({data})=>update(data.session)).catch(()=>update(null));
   return()=>{active=false;requestGeneration.current++;subscription.unsubscribe();};
  }catch{update(null);return()=>{active=false;};}
 },[loadProfile]);
 const refreshProfile=useCallback(async()=>{if(session?.user)await loadProfile(session.user.id);},[session,loadProfile]);
 const signIn=async(email:string,password:string)=>{setLoading(true);try{const {error}=await supabase.auth.signInWithPassword({email,password});return {error:error?.message || null};}catch(e){return {error:(e as Error).message};}finally{setLoading(false);}};
 const signUp=async(email:string,password:string,fullName:string)=>{setLoading(true);try{const {error}=await supabase.auth.signUp({email,password,options:{data:{full_name:fullName}}});return {error:error?.message || null};}catch(e){return {error:(e as Error).message};}finally{setLoading(false);}};
 const signOut=async()=>{const {error}=await supabase.auth.signOut();if(error)throw error;generation.current++;setSession(null);setDesignerProfile(null);};
 return <DesignerAuthContext.Provider value={{user:session?.user || null,session,designerProfile,loading,profileLoading,initialized,signIn,signUp,signOut,refreshProfile}}>{children}</DesignerAuthContext.Provider>;
}
export function useDesignerAuth(){const context=useContext(DesignerAuthContext);if(!context)throw new Error('useDesignerAuth must be used within DesignerAuthProvider');return context;}
