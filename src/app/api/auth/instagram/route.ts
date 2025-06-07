import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Instagram OAuth configuration
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/instagram/callback`;
  const scope = 'user_profile,user_media'; // Basic Instagram permissions
  
  if (!clientId) {
    return NextResponse.json({ error: 'Instagram client ID not configured' }, { status: 500 });
  }

  // Build Instagram OAuth URL
  const instagramAuthUrl = new URL('https://api.instagram.com/oauth/authorize');
  instagramAuthUrl.searchParams.set('client_id', clientId);
  instagramAuthUrl.searchParams.set('redirect_uri', redirectUri);
  instagramAuthUrl.searchParams.set('scope', scope);
  instagramAuthUrl.searchParams.set('response_type', 'code');
  
  // Optional: Add state parameter for security
  const state = crypto.randomUUID();
  instagramAuthUrl.searchParams.set('state', state);
  
  // Store state in session or database for verification in callback
  // For now, we'll redirect directly
  
  return NextResponse.redirect(instagramAuthUrl.toString());
} 