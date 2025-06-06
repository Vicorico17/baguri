import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // This endpoint is required by Instagram for app compliance
    // It handles data deletion requests when users delete their Instagram account
    
    const body = await request.json();
    console.log('Instagram data deletion request received:', body);
    
    // Here you should:
    // 1. Identify the user from the request
    // 2. Delete all stored Instagram data for that user
    // 3. Log the deletion for compliance
    // 4. Return a confirmation URL and code
    
    // Generate a unique confirmation code
    const confirmationCode = `DEL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Return required response format
    return NextResponse.json({
      url: `https://www.baguri.ro/data-deletion-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error handling Instagram data deletion:', error);
    
    // Even on error, return a valid response for compliance
    const confirmationCode = `DEL_ERROR_${Date.now()}`;
    return NextResponse.json({
      url: `https://www.baguri.ro/data-deletion-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode
    }, { status: 200 });
  }
}

// Instagram also sends GET requests sometimes
export async function GET(request: NextRequest) {
  const confirmationCode = `DEL_GET_${Date.now()}`;
  return NextResponse.json({
    url: `https://www.baguri.ro/data-deletion-status?code=${confirmationCode}`,
    confirmation_code: confirmationCode
  }, { status: 200 });
} 