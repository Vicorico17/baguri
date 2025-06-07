import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  console.log('TikTok Callback Debug:', {
    hasCode: !!code,
    codeLength: code?.length || 0,
    error,
    state,
    allParams: Object.fromEntries(searchParams.entries()),
    environmentCheck: {
      hasClientKey: !!process.env.TIKTOK_CLIENT_KEY,
      hasClientSecret: !!process.env.TIKTOK_CLIENT_SECRET,
      redirectUri: 'https://baguri.ro/api/auth/tiktok/callback'
    }
  });

  if (error) {
    console.error('TikTok OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-auth?error=tiktok_denied`);
  }

  if (!code) {
    console.error('TikTok OAuth: No code received');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-auth?error=no_code`);
  }

  try {
    // Exchange code for access token - Sandbox credentials work with production API
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://baguri.ro/api/auth/tiktok/callback', // Must match TikTok Developer Console exactly
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('TikTok Token Exchange Failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        responseBody: errorText
      });
      throw new Error(`Failed to exchange code for token: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('TikTok Token Exchange Success:', {
      hasAccessToken: !!tokenData.access_token,
      hasOpenId: !!tokenData.open_id,
      tokenType: tokenData.token_type,
      scope: tokenData.scope
    });
    const { access_token, open_id } = tokenData;

    // Get user profile information - Sandbox credentials work with production API
    const profileResponse = await fetch('https://open.tiktokapis.com/v2/user/info/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: ['open_id', 'union_id', 'avatar_url', 'display_name', 'username']
      }),
    });
    
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('TikTok Profile Fetch Failed:', {
        status: profileResponse.status,
        statusText: profileResponse.statusText,
        responseBody: errorText
      });
      throw new Error(`Failed to fetch user profile: ${profileResponse.status} - ${errorText}`);
    }

    const profileData = await profileResponse.json();
    console.log('TikTok Profile Fetch Success:', {
      hasData: !!profileData.data,
      hasUser: !!profileData.data?.user,
      userFields: profileData.data?.user ? Object.keys(profileData.data.user) : []
    });

    // TODO: Store influencer data in database
    // For now, redirect to influencer dashboard with success
    console.log('TikTok user authenticated:', {
      openId: open_id,
      username: profileData.data?.user?.username,
      displayName: profileData.data?.user?.display_name,
      avatarUrl: profileData.data?.user?.avatar_url,
    });

    // Redirect to influencer dashboard or onboarding
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-dashboard?platform=tiktok&success=true`);

  } catch (error) {
    console.error('TikTok OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-auth?error=callback_failed`);
  }
} 