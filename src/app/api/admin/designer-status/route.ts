import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { emailService } from '@/lib/emailService';
import { supabaseAdmin as supabase } from '@/lib/server/supabase';

const REVIEW_STATUSES = new Set(['approved', 'rejected']);

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const unauthorized = await requireAdminSession(request);
    if (unauthorized) return unauthorized;

    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { designerId, status, rejectionReason } = await request.json();

    if (!designerId || !REVIEW_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Valid designerId and status are required' }, { status: 400 });
    }

    if (status === 'rejected' && (!rejectionReason || !String(rejectionReason).trim())) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    const updatePayload: Record<string, string> = {
      status,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (status === 'rejected') {
      updatePayload.rejection_reason = String(rejectionReason).trim();
    }

    const { data: designer, error } = await supabase
      .from('designers')
      .update(updatePayload)
      .eq('id', designerId)
      .select('id, email, brand_name, status')
      .single();

    if (error || !designer) {
      console.error('Error updating designer status:', error);
      return NextResponse.json({ error: error?.message || 'Designer not found' }, { status: 500 });
    }

    const emailResult = status === 'approved'
      ? await emailService.sendDesignerApproved(designer.email, designer.brand_name)
      : await emailService.sendDesignerRejected(designer.email, designer.brand_name, rejectionReason);

    if (!emailResult.success) {
      console.error('Designer status updated, but notification failed:', emailResult.error);
    }

    return NextResponse.json({
      success: true,
      designer,
      emailSent: emailResult.success,
    });
  } catch (error: any) {
    console.error('Error in designer-status API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
