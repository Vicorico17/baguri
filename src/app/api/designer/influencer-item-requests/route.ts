import { NextRequest, NextResponse } from 'next/server';
import { designerService } from '@/lib/designerService';

// GET: List all influencer item requests for this designer
export async function GET(req: NextRequest) {
  const designerId = req.nextUrl.searchParams.get('designerId');
  if (!designerId) {
    return NextResponse.json({ error: 'Missing designerId' }, { status: 400 });
  }
  const requests = await designerService.getInfluencerItemRequests(designerId);
  return NextResponse.json({ requests });
}

// POST: Respond to an influencer item request (accept/reject)
export async function POST(req: NextRequest) {
  const { requestId, status } = await req.json();
  if (!requestId || !['accepted', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }
  const result = await designerService.respondToInfluencerItemRequest(requestId, status);
  if (result.success) return NextResponse.json({ success: true });
  return NextResponse.json({ error: result.error }, { status: 500 });
} 