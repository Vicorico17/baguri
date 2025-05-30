import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { newEmail, currentPassword } = await request.json();

    if (!newEmail || !currentPassword) {
      return NextResponse.json(
        { error: 'New email and current password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get the current user from the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword
    });

    if (signInError) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Update email using admin client
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email: newEmail }
    );

    if (updateError) {
      console.error('Error updating email:', updateError);
      
      // Handle specific error cases
      if (updateError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'This email is already registered to another account' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: updateError.message || 'Failed to update email' },
        { status: 500 }
      );
    }

    // Update email in designer profile if exists
    try {
      const { error: profileUpdateError } = await supabase
        .from('designers')
        .update({ email: newEmail })
        .eq('id', user.id);

      if (profileUpdateError) {
        console.warn('Failed to update email in designer profile:', profileUpdateError);
        // Don't fail the request since the auth email was updated successfully
      }
    } catch (profileError) {
      console.warn('Error updating designer profile email:', profileError);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Email updated successfully. Please check your new email for verification.' 
    });

  } catch (error) {
    console.error('Error in change-email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 