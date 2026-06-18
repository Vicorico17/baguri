import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase';

export type ApiAuthResult = {
  user: User;
  accessToken: string;
};

export type DesignerApiAuthResult = ApiAuthResult & {
  designerId: string;
  role: 'designer' | 'admin';
  isApproved: boolean;
};

export function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  return authHeader.slice('Bearer '.length).trim();
}

export async function requireSupabaseUser(request: NextRequest): Promise<ApiAuthResult | NextResponse> {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const accessToken = getBearerToken(request);
  if (!accessToken) {
    return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  return { user, accessToken };
}

export async function requireDesignerUser(request: NextRequest): Promise<DesignerApiAuthResult | NextResponse> {
  const auth = await requireSupabaseUser(request);
  if (auth instanceof NextResponse) return auth;

  const { data, error } = await supabaseAdmin
    .from('designer_auth')
    .select('designer_id, role, is_approved')
    .eq('user_id', auth.user.id)
    .single();

  if (error || !data?.designer_id) {
    return NextResponse.json({ error: 'Designer profile not found' }, { status: 404 });
  }

  return {
    ...auth,
    designerId: data.designer_id,
    role: data.role,
    isApproved: !!data.is_approved,
  };
}
