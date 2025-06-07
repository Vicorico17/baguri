import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // TikTok OAuth configuration
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/tiktok/callback`;
  const scope = 'user.info.basic,user.info.profile'; // Basic TikTok permissions
  
  if (!clientKey) {
    return NextResponse.json({ error: 'TikTok client key not configured' }, { status: 500 });
  }

  // Build TikTok OAuth URL
  const tiktokAuthUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
  tiktokAuthUrl.searchParams.set('client_key', clientKey);
  tiktokAuthUrl.searchParams.set('redirect_uri', redirectUri);
  tiktokAuthUrl.searchParams.set('scope', scope);
  tiktokAuthUrl.searchParams.set('response_type', 'code');
  
  // Add state parameter for security
  const state = crypto.randomUUID();
  tiktokAuthUrl.searchParams.set('state', state);
  
  // Store state in session or database for verification in callback
  // For now, we'll redirect directly
  
  return NextResponse.redirect(tiktokAuthUrl.toString());
} 