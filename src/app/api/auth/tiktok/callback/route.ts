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

    // Get user profile information - Try multiple approaches for stats
    console.log('🔍 Attempting profile fetch with full stats...');
    console.log('📊 Available scopes from token:', tokenData.scope);
    
    let profileResponse;
    let profileData;
    let statsData = null;
    
    // First try: Minimal basic profile (just what's guaranteed in user.info.basic)
    console.log('🔍 Trying minimal basic fields: open_id,display_name');
    profileResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });
    
    console.log('📋 Basic profile response:', profileResponse.status);
    
    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.log('⚠️ Basic profile with display_name failed, trying just open_id...');
      
      // Fallback: Try with just open_id (absolute minimum)
      const minimalResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });
      
      console.log('📋 Minimal profile response (open_id only):', minimalResponse.status);
      
      if (!minimalResponse.ok) {
        const minimalErrorText = await minimalResponse.text();
        console.error('❌ Even minimal profile (open_id only) failed:', minimalResponse.status, minimalErrorText);
        throw new Error(`All profile fetch attempts failed. Last error: ${minimalResponse.status} - ${minimalErrorText}`);
      }
      
      profileResponse = minimalResponse;
    }
    
    profileData = await profileResponse.json();
    console.log('✅ Basic profile data:', JSON.stringify(profileData, null, 2));
    
    // Try to get username separately (might not be in basic scope)
    console.log('🔍 Attempting to fetch username separately...');
    try {
      const usernameResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,username', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });
      
      if (usernameResponse.ok) {
        const usernameData = await usernameResponse.json();
        console.log('✅ Username data:', JSON.stringify(usernameData, null, 2));
        
        // Merge username into basic profile if available
        if (usernameData.data?.user?.username) {
          profileData.data.user.username = usernameData.data.user.username;
        }
      } else {
        console.log('⚠️ Username fetch failed:', usernameResponse.status);
      }
    } catch (usernameError) {
      console.log('⚠️ Username fetch exception:', usernameError);
    }
    
    // Second try: Stats-only fields (if user.info.stats scope is available)
    if (tokenData.scope && tokenData.scope.includes('user.info.stats')) {
      console.log('📊 Scope includes user.info.stats, attempting stats fetch...');
      
             // Try different combinations of stats fields
       const statsFieldCombinations = [
         // All stats fields
         'follower_count,following_count,likes_count,video_count',
         // Just follower count (most important)
         'follower_count',
         // Just likes and videos
         'likes_count,video_count',
         // Just social stats
         'follower_count,following_count'
       ];
      
      for (const fields of statsFieldCombinations) {
        console.log(`🔍 Trying stats fields: ${fields}`);
        
        try {
          const statsResponse = await fetch(`https://open.tiktokapis.com/v2/user/info/?fields=open_id,${fields}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${access_token}`,
            },
          });
          
          console.log(`📊 Stats response for ${fields}:`, statsResponse.status);
          
          if (statsResponse.ok) {
            const statsResult = await statsResponse.json();
            console.log(`✅ Stats data for ${fields}:`, JSON.stringify(statsResult, null, 2));
            
            // Merge stats data with basic profile
            if (statsResult.data?.user) {
              statsData = statsResult.data.user;
              break; // Success! Use this data
            }
          } else {
            const statsError = await statsResponse.text();
            console.log(`⚠️ Stats failed for ${fields}:`, statsResponse.status, statsError);
          }
        } catch (statsError) {
          console.log(`❌ Stats exception for ${fields}:`, statsError);
        }
      }
    } else {
      console.log('⚠️ user.info.stats scope not found in token scope:', tokenData.scope);
    }
    
    // Continue processing the profile response
    console.log('📋 Processing profile data...');
    
    // Merge basic profile with stats if available
    const finalUserData = { ...profileData.data?.user };
    if (statsData) {
      Object.assign(finalUserData, statsData);
      console.log('✅ Merged profile + stats data:', JSON.stringify(finalUserData, null, 2));
    } else {
      console.log('⚠️ Using basic profile data only (no stats available)');
    }
    
    // Create a combined profile response structure
    const combinedProfileData = {
      data: {
        user: finalUserData
      },
      error: profileData.error || { code: 'ok', message: '' }
    };
    console.log('TikTok Profile Fetch Success:', {
      hasData: !!combinedProfileData.data,
      hasUser: !!combinedProfileData.data?.user,
      userFields: combinedProfileData.data?.user ? Object.keys(combinedProfileData.data.user) : [],
      errorMessage: combinedProfileData.error?.message,
      errorCode: combinedProfileData.error?.code,
      hasStats: !!(statsData && Object.keys(statsData).length > 0)
    });

    // Check if profile fetch was actually successful
    if (combinedProfileData.error && combinedProfileData.error.code !== 'ok') {
      console.error('TikTok Profile API Error:', combinedProfileData.error);
      
      // Handle specific TikTok API errors
      if (combinedProfileData.error.code === 'access_denied' || combinedProfileData.error.message?.includes('privacy')) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-auth?error=privacy_restricted&message=${encodeURIComponent('Unable to fetch your TikTok profile. Please ensure your account privacy settings allow app access.')}`);
      }
      
      throw new Error(`TikTok API Error: ${combinedProfileData.error.message || 'Unknown error'}`);
    }

    // Log successful response for debugging
    if (combinedProfileData.error && combinedProfileData.error.code === 'ok') {
      console.log('TikTok Profile Success Response:', combinedProfileData.error);
    }

    // Check if we have minimal required data
    if (!combinedProfileData.data?.user?.open_id) {
      console.error('TikTok Profile: Missing required user data');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/influencer-auth?error=privacy_restricted&message=${encodeURIComponent('Unable to fetch your TikTok profile. Please ensure your account privacy settings allow app access.')}`);
    }

    // Get user data for the rules page
    const userData = combinedProfileData.data?.user;
    const userParams = new URLSearchParams({
      platform: 'tiktok',
      name: userData?.display_name || 'TikTok User',
      username: userData?.username || '',
      followers: userData?.follower_count?.toString() || '0',
      likes: userData?.likes_count?.toString() || '0',
      videos: userData?.video_count?.toString() || '0',
      open_id: userData?.open_id || ''
    });

    // === Store influencer data in database ===
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Use open_id as username fallback if username is missing
    const tiktokUsername = userData?.username || userData?.open_id || null;
    const tiktokOpenId = userData?.open_id || null;
    const tiktokDisplayName = userData?.display_name || null;
    const tiktokAvatarUrl = userData?.avatar_url || null;
    const tiktokFollowers = userData?.follower_count || null;
    const tiktokLikes = userData?.likes_count || null;
    const tiktokVideos = userData?.video_count || null;

    console.log('[INFLUENCER DEBUG] Username:', tiktokUsername, '| OpenId:', tiktokOpenId);
    if (tiktokOpenId) {
      console.log('[INFLUENCER DEBUG] Looking up influencer by tiktok_open_id:', tiktokOpenId);
      // Try to find existing influencer by tiktok_open_id
      const { data: existingInfluencer, error: findError } = await supabase
        .from('influencers')
        .select('*')
        .eq('tiktok_open_id', tiktokOpenId)
        .single();
      if (findError && typeof findError === 'object' && (findError as any)?.code !== 'PGRST116') {
        console.error('[INFLUENCER DEBUG] Error looking up influencer:', findError);
      } else {
        console.log('[INFLUENCER DEBUG] Influencer lookup result:', existingInfluencer);
      }
      // Rules: 10k+ followers, 100k+ likes, 5+ videos
      const passesRules = (tiktokFollowers >= 10000) && (tiktokLikes >= 100000) && (tiktokVideos >= 5);
      console.log('[INFLUENCER DEBUG] passesRules:', passesRules, '| Followers:', tiktokFollowers, '| Likes:', tiktokLikes, '| Videos:', tiktokVideos);
      const influencerPayload = {
        tiktok_open_id: tiktokOpenId,
        username: tiktokUsername,
        display_name: tiktokDisplayName,
        avatar_url: tiktokAvatarUrl,
        is_verified: passesRules
      };
      console.log('[INFLUENCER DEBUG] Data to be added/updated in influencers table:', influencerPayload);
      if (!existingInfluencer) {
        console.log('[INFLUENCER DEBUG] Inserting new influencer...');
        const { data: newInfluencer, error: createError } = await supabase
          .from('influencers')
          .insert(influencerPayload)
          .select()
          .single();
        if (createError) {
          console.error('[INFLUENCER DEBUG] Error creating influencer:', createError);
        } else {
          console.log('[INFLUENCER DEBUG] TikTok data successfully ADDED to influencers table:', newInfluencer?.tiktok_open_id || newInfluencer);
        }
      } else {
        console.log('[INFLUENCER DEBUG] Updating existing influencer...');
        const { error: updateError } = await supabase
          .from('influencers')
          .update(influencerPayload)
          .eq('tiktok_open_id', tiktokOpenId);
        if (updateError) {
          console.error('[INFLUENCER DEBUG] Error updating influencer:', updateError);
        } else {
          console.log('[INFLUENCER DEBUG] TikTok data successfully UPDATED in influencers table:', tiktokOpenId);
        }
      }
      // If verified, create wallet if not exists
      if (passesRules) {
        console.log('[INFLUENCER DEBUG] Checking for existing wallet for influencer:', tiktokOpenId);
        const { data: existingWallet, error: walletFindError } = await supabase
          .from('influencers_wallets')
          .select('*')
          .eq('tiktok_open_id', tiktokOpenId)
          .single();
        if (!existingWallet) {
          // Fetch display_name from influencers table
          let displayName = tiktokDisplayName;
          if (!displayName) {
            const { data: influencerRow } = await supabase
              .from('influencers')
              .select('display_name')
              .eq('tiktok_open_id', tiktokOpenId)
              .single();
            displayName = influencerRow?.display_name || tiktokOpenId;
          }
          console.log('[INFLUENCER DEBUG] Creating wallet for influencer:', tiktokOpenId, '| display_name:', displayName);
          const { data: newWallet, error: walletCreateError } = await supabase
            .from('influencers_wallets')
            .insert({
              tiktok_open_id: tiktokOpenId,
              tiktok_display_name: displayName,
              balance: 0
            })
            .select()
            .single();
          if (walletCreateError) {
            console.error('[INFLUENCER DEBUG] Error creating influencer wallet:', walletCreateError);
          } else {
            console.log('[INFLUENCER DEBUG] Wallet created for influencer:', tiktokOpenId, '| Wallet:', newWallet);
          }
        } else {
          console.log('[INFLUENCER DEBUG] Wallet already exists for influencer:', tiktokOpenId, '| Wallet:', existingWallet);
        }
      }
    } else {
      console.log('[INFLUENCER DEBUG] Skipping insert/update: missing tiktokOpenId');
    }
    // Log the redirect to rules page
    console.log('[INFLUENCER DEBUG] Redirecting to influencer rules page with params:', userParams.toString());

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