import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { access_token } = await request.json();

    if (!access_token) {
      return NextResponse.json({
        success: false,
        error: 'Access token is required'
      }, { status: 400 });
    }

    console.log('Testing Instagram Graph API with token:', access_token.substring(0, 10) + '...');

    // Test call to Instagram Graph API
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${access_token}`
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Instagram API Error:', response.status, errorData);
      
      return NextResponse.json({
        success: false,
        error: `Instagram API returned ${response.status}: ${errorData}`,
        status_code: response.status
      }, { status: 400 });
    }

    const profileData = await response.json();
    console.log('Instagram Profile Data:', profileData);

    // Test additional fields that might be useful
    const detailedResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${access_token}`
    );

    let detailedData = null;
    if (detailedResponse.ok) {
      detailedData = await detailedResponse.json();
    }

    return NextResponse.json({
      success: true,
      message: 'Instagram Graph API test successful!',
      data: {
        basic_profile: profileData,
        detailed_profile: detailedData,
        verification_status: {
          has_id: !!profileData.id,
          has_username: !!profileData.username,
          account_type: profileData.account_type || 'unknown',
          can_verify_identity: !!(profileData.id && profileData.username)
        }
      }
    });

  } catch (error) {
    console.error('Error testing Instagram API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during Instagram API test',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET method for easy browser testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const access_token = searchParams.get('access_token');

  if (!access_token) {
    return NextResponse.json({
      success: false,
      error: 'Please provide access_token as a query parameter',
      example: '/api/test/instagram?access_token=YOUR_TOKEN_HERE'
    }, { status: 400 });
  }

  try {
    console.log('Testing Instagram Graph API with token (GET):', access_token.substring(0, 10) + '...');

    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${access_token}`
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Instagram API Error:', response.status, errorData);
      
      return NextResponse.json({
        success: false,
        error: `Instagram API returned ${response.status}: ${errorData}`,
        status_code: response.status
      }, { status: 400 });
    }

    const profileData = await response.json();
    console.log('Instagram Profile Data (GET):', profileData);

    return NextResponse.json({
      success: true,
      message: 'Instagram Graph API test successful!',
      data: profileData,
      verification_check: {
        can_verify_username: !!profileData.username,
        can_verify_id: !!profileData.id,
        account_type: profileData.account_type || 'PERSONAL',
        media_count: profileData.media_count || 0
      }
    });

  } catch (error) {
    console.error('Error testing Instagram API (GET):', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during Instagram API test',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 