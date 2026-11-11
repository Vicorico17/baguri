import { NextRequest, NextResponse } from 'next/server';
import { requireSupabaseUser } from '@/lib/apiAuth';
import { supabaseAdmin as supabase } from '@/lib/server/supabase';


export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const auth = await requireSupabaseUser(request);
    if (auth instanceof NextResponse) return auth;

    // Get designer profile
    const { data: designerAuth, error: designerAuthError } = await supabase
      .from('designer_auth')
      .select('designer_id')
      .eq('user_id', auth.user.id)
      .single();

    if (designerAuthError || !designerAuth) {
      return NextResponse.json({ error: 'Designer not found' }, { status: 404 });
    }

    // Get wallet data
    const { data: wallet, error: walletError } = await supabase
      .from('designer_wallets')
      .select('*')
      .eq('designer_id', designerAuth.designer_id)
      .single();

    if (walletError) {
      // Create wallet if it doesn't exist
      const { data: newWallet, error: createError } = await supabase
        .from('designer_wallets')
        .insert({
          designer_id: designerAuth.designer_id,
          balance: 0,
          total_earnings: 0,
          total_withdrawn: 0,
          pending_balance: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating wallet:', createError);
        return NextResponse.json({ error: 'Failed to create wallet' }, { status: 500 });
      }

      return NextResponse.json({
        wallet: {
          id: newWallet.id,
          designerId: newWallet.designer_id,
          balance: parseFloat(newWallet.balance),
          totalEarnings: parseFloat(newWallet.total_earnings),
          totalWithdrawn: parseFloat(newWallet.total_withdrawn),
          pendingBalance: parseFloat(newWallet.pending_balance),
          createdAt: newWallet.created_at,
          updatedAt: newWallet.updated_at
        }
      });
    }

    return NextResponse.json({
      wallet: {
        id: wallet.id,
        designerId: wallet.designer_id,
        balance: parseFloat(wallet.balance),
        totalEarnings: parseFloat(wallet.total_earnings),
        totalWithdrawn: parseFloat(wallet.total_withdrawn),
        pendingBalance: parseFloat(wallet.pending_balance),
        createdAt: wallet.created_at,
        updatedAt: wallet.updated_at
      }
    });

  } catch (error) {
    console.error('Error in wallet GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
 const auth=await requireSupabaseUser(request);if(auth instanceof NextResponse)return auth;
 try {
  const {action,amount,idempotencyKey}=await request.json();
  if(action!=='withdrawal' || typeof amount!=='number' || !Number.isFinite(amount) || amount<50 || Math.abs(amount*100-Math.round(amount*100))>0.00001 || !/^[0-9a-f-]{36}$/i.test(idempotencyKey || '')) return NextResponse.json({error:'Invalid withdrawal amount or request key'},{status:400});
  const {data:a,error}=await supabase.from('designer_auth').select('designer_id,designers(status)').eq('user_id',auth.user.id).single();
  if(error || (a?.designers as unknown as {status:string})?.status!=='approved')return NextResponse.json({error:'Approved designer account required'},{status:403});
  const result=await supabase.rpc('request_commerce_withdrawal',{p_type:'designer',p_owner:a.designer_id,p_amount:amount,p_key:idempotencyKey});
  if(result.error)return NextResponse.json({error:result.error.message},{status:409});
  return NextResponse.json({success:true,transactionId:result.data});
 }catch{return NextResponse.json({error:'Withdrawal unavailable'},{status:503});}
}
