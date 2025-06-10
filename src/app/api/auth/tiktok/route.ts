import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // TikTok OAuth configuration
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = 'https://baguri.ro/api/auth/tiktok/callback'; // Must match TikTok Developer Console exactly
  const scope = 'user.info.basic,user.info.stats'; // Basic info + statistical data
  
  // Debug logging
  console.log('TikTok OAuth Debug:', {
    clientKey: clientKey ? `MASKED: ${clientKey.slice(0, 4)}...${clientKey.slice(-4)}` : 'NOT SET',
    clientKeyLength: clientKey?.length || 0,
    redirectUri,
    scope,
    finalUrl: `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code`,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('TIKTOK'))
  });
  
  if (!clientKey) {
    console.error('TikTok OAuth: Client key not configured');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-auth?error=config_error`);
  }

  try {
    // Build TikTok OAuth URL - Sandbox credentials work with production OAuth endpoint
    const tiktokAuthUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    tiktokAuthUrl.searchParams.set('client_key', clientKey);
    tiktokAuthUrl.searchParams.set('redirect_uri', redirectUri);
    tiktokAuthUrl.searchParams.set('scope', scope);
    tiktokAuthUrl.searchParams.set('response_type', 'code');
    
    // Add state parameter for security
    const state = crypto.randomUUID();
    tiktokAuthUrl.searchParams.set('state', state);
    
    console.log('Redirecting to TikTok OAuth:', tiktokAuthUrl.toString());
    
    return NextResponse.redirect(tiktokAuthUrl.toString());
    
  } catch (error) {
    console.error('TikTok OAuth URL generation error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-auth?error=url_generation_failed`);
  }
} 