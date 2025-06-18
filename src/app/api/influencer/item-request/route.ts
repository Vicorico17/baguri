import { NextRequest, NextResponse } from 'next/server';
import { influencerService } from '@/lib/influencerService';

// POST: Create a new item request
export async function POST(req: NextRequest) {
  const { productId, designerId, deliveryAddress, tiktokOpenId } = await req.json();
  if (!productId || !designerId || !deliveryAddress || !tiktokOpenId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const result = await influencerService.createItemRequest(productId, designerId, deliveryAddress, tiktokOpenId);
  if (result.success) return NextResponse.json({ success: true });
  return NextResponse.json({ error: result.error }, { status: 500 });
}

// GET: List all item requests for this influencer
export async function GET(req: NextRequest) {
  const tiktokOpenId = req.nextUrl.searchParams.get('tiktokOpenId');
  if (!tiktokOpenId) {
    return NextResponse.json({ error: 'Missing tiktokOpenId' }, { status: 400 });
  }
  const requests = await influencerService.getItemRequests(tiktokOpenId);
  return NextResponse.json({ requests });
}

// DELETE: Cancel an item request
export async function DELETE(req: NextRequest) {
  const { requestId, tiktokOpenId } = await req.json();
  if (!requestId || !tiktokOpenId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const result = await influencerService.cancelItemRequest(requestId, tiktokOpenId);
  if (result.success) return NextResponse.json({ success: true });
  return NextResponse.json({ error: result.error }, { status: 500 });
} 