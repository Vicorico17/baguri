import { NextRequest, NextResponse } from 'next/server';
import { influencerService } from '@/lib/influencerService';

// GET: List all saved addresses for this influencer
export async function GET(req: NextRequest) {
  const tiktokOpenId = req.nextUrl.searchParams.get('tiktokOpenId');
  if (!tiktokOpenId) {
    return NextResponse.json({ error: 'Missing tiktokOpenId' }, { status: 400 });
  }
  const addresses = await influencerService.getSavedAddresses(tiktokOpenId);
  return NextResponse.json({ addresses });
}

// POST: Save a new address
export async function POST(req: NextRequest) {
  const { address, label, tiktokOpenId } = await req.json();
  if (!address || !tiktokOpenId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const result = await influencerService.saveAddress(address, label, tiktokOpenId);
  if (result.success) return NextResponse.json({ success: true });
  return NextResponse.json({ error: result.error }, { status: 500 });
}

// DELETE: Delete a saved address
export async function DELETE(req: NextRequest) {
  const { addressId, tiktokOpenId } = await req.json();
  if (!addressId || !tiktokOpenId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const result = await influencerService.deleteAddress(addressId, tiktokOpenId);
  if (result.success) return NextResponse.json({ success: true });
  return NextResponse.json({ error: result.error }, { status: 500 });
} 