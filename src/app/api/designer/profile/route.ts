import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

export async function PATCH(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const cookieStore = cookies();
    const token = cookieStore.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { iban } = await request.json();

    // Validate IBAN format (basic validation)
    if (iban && iban.trim() !== '' && !/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/.test(iban.trim())) {
      return NextResponse.json({ error: 'Invalid IBAN format' }, { status: 400 });
    }

    // Get designer profile
    const { data: designerAuth, error: designerAuthError } = await supabase
      .from('designer_auth')
      .select('designer_id')
      .eq('user_id', user.id)
      .single();

    if (designerAuthError || !designerAuth) {
      return NextResponse.json({ error: 'Designer not found' }, { status: 404 });
    }

    // Update designer IBAN
    const { error: updateError } = await supabase
      .from('designers')
      .update({
        iban: iban ? iban.trim() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', designerAuth.designer_id);

    if (updateError) {
      console.error('Error updating designer IBAN:', updateError);
      return NextResponse.json({ error: 'Failed to update IBAN' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'IBAN updated successfully'
    });

  } catch (error) {
    console.error('Error in designer profile PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 