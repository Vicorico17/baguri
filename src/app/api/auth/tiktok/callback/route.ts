import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  if (error) {
    console.error('TikTok OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-auth?error=tiktok_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-auth?error=no_code`);
  }

  try {
    // Exchange code for access token - Use sandbox API
    const tokenResponse = await fetch('https://sandbox-open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.TIKTOK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/tiktok/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, open_id } = tokenData;

    // Get user profile information - Use sandbox API
    const profileResponse = await fetch('https://sandbox-open.tiktokapis.com/v2/user/info/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: ['open_id', 'union_id', 'avatar_url', 'display_name', 'username', 'follower_count', 'following_count', 'likes_count', 'video_count']
      }),
    });
    
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const profileData = await profileResponse.json();

    // TODO: Store influencer data in database
    // For now, redirect to influencer dashboard with success
    console.log('TikTok user authenticated:', {
      openId: open_id,
      username: profileData.data?.user?.username,
      displayName: profileData.data?.user?.display_name,
      followerCount: profileData.data?.user?.follower_count,
      videoCount: profileData.data?.user?.video_count,
    });

    // Redirect to influencer dashboard or onboarding
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-dashboard?platform=tiktok&success=true`);

  } catch (error) {
    console.error('TikTok OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-auth?error=callback_failed`);
  }
} 