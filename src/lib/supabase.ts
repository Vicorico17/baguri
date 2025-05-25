import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tmedcnvojgviuwrprykx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtZWRjbnZvamd2aXV3cnByeWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NTE2ODMsImV4cCI6MjA2MjUyNzY4M30.BMhJD37n2YFacQsR2aMfkHRL4_kiVV5Q2Se2vvD-Q_Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export type Designer = {
  id: string
  hunter_id?: string
  brand_name: string
  description?: string
  email: string
  logo_url?: string
  secondary_logo_url?: string
  instagram?: string
  tiktok?: string
  website?: string
  fulfillment?: 'baguri' | 'designer'
  selling_as?: 'PFA' | 'SRL' | 'not_registered'
  iban?: string
  owns_rights?: boolean
  accept_terms?: boolean
  wants_ai_photos?: boolean
  status?: 'pending' | 'approved' | 'rejected'
  submitted_at?: string
  reviewed_at?: string
}

export type DesignerAuth = {
  id: string
  user_id: string
  designer_id: string
  role: 'designer' | 'admin'
  is_approved: boolean
  created_at: string
  updated_at: string
}

export type DesignerProfile = Designer & {
  auth: DesignerAuth
} 