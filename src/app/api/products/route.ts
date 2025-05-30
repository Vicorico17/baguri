import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering for this route since it uses request.url
export const dynamic = 'force-dynamic';

// Create Supabase client with fallback for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get designer profile first
    const { data: designerProfile, error: designerError } = await supabase
      .from('designer_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (designerError || !designerProfile) {
      return NextResponse.json({ error: 'Designer profile not found' }, { status: 404 });
    }

    // Get products for this designer
    const { data: products, error: productsError } = await supabase
      .from('designer_products')
      .select('*')
      .eq('designer_id', designerProfile.id)
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const { userId, product } = body;

    if (!userId || !product) {
      return NextResponse.json({ error: 'User ID and product data are required' }, { status: 400 });
    }

    // Get designer profile first
    const { data: designerProfile, error: designerError } = await supabase
      .from('designer_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (designerError || !designerProfile) {
      return NextResponse.json({ error: 'Designer profile not found' }, { status: 404 });
    }

    // Create new product
    const { data: newProduct, error: createError } = await supabase
      .from('designer_products')
      .insert({
        designer_id: designerProfile.id,
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        images: product.images || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        stock_status: product.stockStatus || 'in_stock',
        stock_quantity: product.stockQuantity?.toString() || '0',
        is_active: true
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating product:', createError);
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }

    return NextResponse.json({ product: newProduct });
  } catch (error) {
    console.error('Error in POST /api/products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.json();
    const { userId, productId, product } = body;

    if (!userId || !productId || !product) {
      return NextResponse.json({ error: 'User ID, product ID, and product data are required' }, { status: 400 });
    }

    // Get designer profile first
    const { data: designerProfile, error: designerError } = await supabase
      .from('designer_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (designerError || !designerProfile) {
      return NextResponse.json({ error: 'Designer profile not found' }, { status: 404 });
    }

    // Update product (only if it belongs to this designer)
    const { data: updatedProduct, error: updateError } = await supabase
      .from('designer_products')
      .update({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        images: product.images || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        stock_status: product.stockStatus || 'in_stock',
        stock_quantity: product.stockQuantity?.toString() || '0',
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .eq('designer_id', designerProfile.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating product:', updateError);
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    console.error('Error in PUT /api/products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');

    if (!userId || !productId) {
      return NextResponse.json({ error: 'User ID and product ID are required' }, { status: 400 });
    }

    // Get designer profile first
    const { data: designerProfile, error: designerError } = await supabase
      .from('designer_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (designerError || !designerProfile) {
      return NextResponse.json({ error: 'Designer profile not found' }, { status: 404 });
    }

    // Delete product (only if it belongs to this designer)
    const { error: deleteError } = await supabase
      .from('designer_products')
      .delete()
      .eq('id', productId)
      .eq('designer_id', designerProfile.id);

    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 