import { NextRequest, NextResponse } from 'next/server';
import { designerService } from '@/lib/designerService';

// Force dynamic rendering for this route since it uses request.url
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors (user denied access)
    if (error) {
      console.log('Instagram OAuth error:', error);
      return NextResponse.redirect(
        new URL('/designer-dashboard?instagram_error=access_denied', request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      console.error('Missing code or state parameter');
      return NextResponse.redirect(
        new URL('/designer-dashboard?instagram_error=invalid_request', request.url)
      );
    }

    // Verify the callback and get Instagram data
    const result = await designerService.verifyInstagramCallback(code, state);

    if (!result.success) {
      console.error('Instagram verification failed:', result.error);
      return NextResponse.redirect(
        new URL(`/designer-dashboard?instagram_error=${encodeURIComponent(result.error || 'verification_failed')}`, request.url)
      );
    }

    // Success - redirect back to dashboard with success message
    return NextResponse.redirect(
      new URL('/designer-dashboard?instagram_success=true', request.url)
    );

  } catch (error) {
    console.error('Instagram callback error:', error);
    return NextResponse.redirect(
      new URL('/designer-dashboard?instagram_error=server_error', request.url)
    );
  }
} 