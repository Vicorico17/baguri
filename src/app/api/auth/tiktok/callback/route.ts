import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  console.log('TikTok Callback Debug:', {
    hasCode: !!code,
    codeLength: code?.length || 0,
    codeFirstChars: code ? code.slice(0, 10) + '...' : 'NO CODE',
    error,
    state,
    allParams: Object.fromEntries(searchParams.entries()),
    url: request.url,
    environmentCheck: {
      hasClientKey: !!process.env.TIKTOK_CLIENT_KEY,
      hasClientSecret: !!process.env.TIKTOK_CLIENT_SECRET,
      hasNextPublicBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
      clientKeyLength: process.env.TIKTOK_CLIENT_KEY?.length || 0,
      clientSecretLength: process.env.TIKTOK_CLIENT_SECRET?.length || 0,
      redirectUri: 'https://baguri.ro/api/auth/tiktok/callback'
    }
  });

  if (error) {
    console.error('TikTok OAuth error from TikTok:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-auth?error=tiktok_denied&details=${encodeURIComponent(error)}`);
  }

  if (!code) {
    console.error('TikTok OAuth: No code received');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-auth?error=no_code`);
  }

  // Environment validation
  if (!process.env.TIKTOK_CLIENT_KEY || !process.env.TIKTOK_CLIENT_SECRET) {
    console.error('TikTok OAuth: Missing environment variables');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-auth?error=config_error`);
  }

  try {
    console.log('Starting TikTok token exchange...');
    
    // Exchange code for access token - Sandbox credentials work with production API
    const tokenRequestData = {
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: 'https://baguri.ro/api/auth/tiktok/callback', // Must match TikTok Developer Console exactly
    };
    
    console.log('Token request data:', {
      ...tokenRequestData,
      client_secret: 'MASKED_SECRET',
      code: code.slice(0, 10) + '...'
    });

    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenRequestData),
    });

    console.log('Token response status:', tokenResponse.status, tokenResponse.statusText);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('TikTok Token Exchange Failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        responseBody: errorText,
        headers: Object.fromEntries(tokenResponse.headers.entries())
      });
      throw new Error(`Failed to exchange code for token: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('TikTok Token Exchange Success:', {
      hasAccessToken: !!tokenData.access_token,
      hasOpenId: !!tokenData.open_id,
      tokenType: tokenData.token_type,
      scope: tokenData.scope,
      accessTokenLength: tokenData.access_token?.length || 0,
      expiresIn: tokenData.expires_in,
      refreshToken: !!tokenData.refresh_token
    });
    
    const { access_token, open_id } = tokenData;

    if (!access_token || !open_id) {
      console.error('TikTok Token Exchange: Missing required fields in response');
      throw new Error('Invalid token response from TikTok');
    }

    console.log('Starting TikTok profile fetch...');

    // Get user profile information - Use correct TikTok API v2 endpoint with stats
    const profileResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username,follower_count,following_count,likes_count,video_count', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });
    
    console.log('Profile response status:', profileResponse.status, profileResponse.statusText);
    
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('TikTok Profile Fetch Failed:', {
        status: profileResponse.status,
        statusText: profileResponse.statusText,
        responseBody: errorText,
        headers: Object.fromEntries(profileResponse.headers.entries())
      });
      
      // Handle specific privacy/permission errors
      if (profileResponse.status === 403) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-auth?error=privacy_restricted&message=${encodeURIComponent('Unable to fetch your TikTok profile. Please ensure your account privacy settings allow app access.')}`);
      }
      
      throw new Error(`Failed to fetch user profile: ${profileResponse.status} - ${errorText}`);
    }

    const profileData = await profileResponse.json();
    console.log('TikTok Profile Fetch Success:', {
      hasData: !!profileData.data,
      hasUser: !!profileData.data?.user,
      userFields: profileData.data?.user ? Object.keys(profileData.data.user) : [],
      errorMessage: profileData.error?.message,
      errorCode: profileData.error?.code
    });

    // Check if profile fetch was actually successful
    if (profileData.error && profileData.error.code !== 'ok') {
      console.error('TikTok Profile API Error:', profileData.error);
      
      // Handle specific TikTok API errors
      if (profileData.error.code === 'access_denied' || profileData.error.message?.includes('privacy')) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-auth?error=privacy_restricted&message=${encodeURIComponent('Unable to fetch your TikTok profile. Please ensure your account privacy settings allow app access.')}`);
      }
      
      throw new Error(`TikTok API Error: ${profileData.error.message || 'Unknown error'}`);
    }

    // Log successful response for debugging
    if (profileData.error && profileData.error.code === 'ok') {
      console.log('TikTok Profile Success Response:', profileData.error);
    }

    // Check if we have minimal required data
    if (!profileData.data?.user?.open_id) {
      console.error('TikTok Profile: Missing required user data');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-auth?error=privacy_restricted&message=${encodeURIComponent('Unable to fetch your TikTok profile. Please ensure your account privacy settings allow app access.')}`);
    }

    // TODO: Store influencer data in database
    // For now, redirect to influencer dashboard with success
    console.log('TikTok user authenticated successfully:', {
      openId: open_id,
      profileOpenId: profileData.data?.user?.open_id,
      displayName: profileData.data?.user?.display_name || 'TikTok User',
    });

    // Get user data for the rules page
    const userData = profileData.data?.user;
    const userParams = new URLSearchParams({
      platform: 'tiktok',
      name: userData?.display_name || 'TikTok User',
      username: userData?.username || '',
      followers: userData?.follower_count?.toString() || '0',
      likes: userData?.likes_count?.toString() || '0',
      videos: userData?.video_count?.toString() || '0'
    });
    
    // Redirect to influencer rules page with user stats
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-rules?${userParams.toString()}`);

  } catch (error) {
    console.error('TikTok OAuth callback error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    
    // Try to get more specific error details for the user
    let errorType = 'callback_failed';
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorType = 'auth_invalid';
      } else if (error.message.includes('403')) {
        errorType = 'auth_forbidden';
      } else if (error.message.includes('token')) {
        errorType = 'token_error';
      } else if (error.message.includes('profile')) {
        errorType = 'profile_error';
      }
    }
    
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-auth?error=${errorType}&timestamp=${Date.now()}`);
  }
} 