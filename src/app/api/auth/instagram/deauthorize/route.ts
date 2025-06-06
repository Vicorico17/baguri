import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // This endpoint is required by Instagram for app compliance
    // It handles when users deauthorize your app from Instagram
    
    const body = await request.json();
    console.log('Instagram deauthorize callback received:', body);
    
    // Here you could:
    // 1. Log the deauthorization
    // 2. Clean up any stored Instagram data for the user
    // 3. Send notifications if needed
    
    // For now, we'll just acknowledge the request
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error handling Instagram deauthorize:', error);
    return NextResponse.json({ success: true }, { status: 200 });
  }
}

// Instagram also sends GET requests sometimes
export async function GET(request: NextRequest) {
  return NextResponse.json({ success: true }, { status: 200 });
} 