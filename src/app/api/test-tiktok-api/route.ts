import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { testType } = await request.json();
    
    console.log('🧪 TikTok API Test Started:', testType);
    
    // For testing, we'll use a mock access token
    // In a real scenario, you'd get this from your OAuth flow
    const mockAccessToken = 'test_token_12345'; // This won't work but will show us the error structure
    
    const logs: any[] = [];
    let basicProfile = null;
    let statsProfile = null;
    
    // Test 1: Basic profile fetch
    logs.push({
      level: 'info',
      message: 'Testing basic profile fetch...',
      timestamp: new Date().toISOString()
    });
    
    try {
      const basicResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockAccessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      logs.push({
        level: 'info',
        message: `Basic profile API response: ${basicResponse.status}`,
        data: {
          status: basicResponse.status,
          statusText: basicResponse.statusText,
          headers: Object.fromEntries(basicResponse.headers.entries())
        }
      });
      
      const basicData = await basicResponse.json();
      
      if (basicResponse.ok) {
        basicProfile = basicData.data?.user;
        logs.push({
          level: 'success',
          message: 'Basic profile fetch successful',
          data: basicData
        });
      } else {
        logs.push({
          level: 'error',
          message: 'Basic profile fetch failed',
          data: basicData
        });
      }
    } catch (error) {
      logs.push({
        level: 'error',
        message: 'Basic profile fetch exception',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
    
    // Test 2: Stats profile fetch
    logs.push({
      level: 'info',
      message: 'Testing stats profile fetch...',
      timestamp: new Date().toISOString()
    });
    
    try {
      const statsResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username,follower_count,following_count,likes_count,video_count', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${mockAccessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      logs.push({
        level: 'info',
        message: `Stats profile API response: ${statsResponse.status}`,
        data: {
          status: statsResponse.status,
          statusText: statsResponse.statusText,
          headers: Object.fromEntries(statsResponse.headers.entries())
        }
      });
      
      const statsData = await statsResponse.json();
      
      if (statsResponse.ok) {
        statsProfile = statsData.data?.user;
        logs.push({
          level: 'success',
          message: 'Stats profile fetch successful',
          data: statsData
        });
      } else {
        logs.push({
          level: 'error',
          message: 'Stats profile fetch failed',
          data: statsData
        });
      }
    } catch (error) {
      logs.push({
        level: 'error',
        message: 'Stats profile fetch exception',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
    
    // Test 3: Check TikTok API documentation endpoint structure
    logs.push({
      level: 'info',
      message: 'Analyzing API endpoint structure...',
      data: {
        basicEndpoint: 'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username',
        statsEndpoint: 'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username,follower_count,following_count,likes_count,video_count',
        scopes: {
          basic: 'user.info.basic',
          stats: 'user.info.stats'
        },
        requiredPermissions: {
          followers: 'user.info.stats',
          likes: 'user.info.stats',
          videos: 'user.info.stats'
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      testType,
      basicProfile,
      statsProfile,
      logs,
      debug: {
        environmentCheck: {
          hasClientKey: !!process.env.TIKTOK_CLIENT_KEY,
          hasClientSecret: !!process.env.TIKTOK_CLIENT_SECRET,
          clientKeyLength: process.env.TIKTOK_CLIENT_KEY?.length || 0,
          mockToken: mockAccessToken
        },
        expectedFields: {
          basic: ['open_id', 'display_name', 'username'],
          stats: ['follower_count', 'following_count', 'likes_count', 'video_count']
        },
        actualFields: {
          basic: basicProfile ? Object.keys(basicProfile) : [],
          stats: statsProfile ? Object.keys(statsProfile) : []
        }
      }
    });
    
  } catch (error) {
    console.error('TikTok API Test Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      logs: [{
        level: 'error',
        message: 'Test endpoint exception',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      }]
    }, { status: 500 });
  }
}

// For testing real TikTok API with actual access token
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accessToken = searchParams.get('token');
  
  if (!accessToken) {
    return NextResponse.json({
      error: 'Access token required for real API testing',
      usage: 'Add ?token=YOUR_ACCESS_TOKEN to test with real credentials'
    }, { status: 400 });
  }
  
  try {
    console.log('🔍 Testing TikTok API with real access token...');
    
    // Test both endpoints with the real token
    const results = {
      basicTest: null as any,
      statsTest: null as any,
      logs: [] as any[]
    };
    
    // Test basic endpoint
    try {
      const basicResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const basicData = await basicResponse.json();
      results.basicTest = {
        status: basicResponse.status,
        data: basicData,
        success: basicResponse.ok
      };
      
      results.logs.push({
        level: basicResponse.ok ? 'success' : 'error',
        message: `Basic API test: ${basicResponse.status}`,
        data: basicData
      });
    } catch (error) {
      results.logs.push({
        level: 'error',
        message: 'Basic API test failed',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
    
    // Test stats endpoint
    try {
      const statsResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username,follower_count,following_count,likes_count,video_count', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const statsData = await statsResponse.json();
      results.statsTest = {
        status: statsResponse.status,
        data: statsData,
        success: statsResponse.ok
      };
      
      results.logs.push({
        level: statsResponse.ok ? 'success' : 'error',
        message: `Stats API test: ${statsResponse.status}`,
        data: statsData
      });
    } catch (error) {
      results.logs.push({
        level: 'error',
        message: 'Stats API test failed',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Real API testing completed',
      ...results,
      debug: {
        tokenLength: accessToken.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 