import { NextRequest, NextResponse } from 'next/server';
import { requireDesignerUser } from '@/lib/apiAuth';
import { supabaseAdmin as supabase } from '@/lib/supabase';

// Force dynamic rendering for this route since it uses request.url
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const auth = await requireDesignerUser(request);
    if (auth instanceof NextResponse) return auth;

    // Get products for this designer
    const { data: products, error: productsError } = await supabase
      .from('designer_products')
      .select('*')
      .eq('designer_id', auth.designerId)
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
    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const auth = await requireDesignerUser(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { product } = body;

    if (!product) {
      return NextResponse.json({ error: 'Product data is required' }, { status: 400 });
    }

    if (!product.name || !product.price || Number(product.price) <= 0) {
      return NextResponse.json({ error: 'Product name and positive price are required' }, { status: 400 });
    }

    // Create new product
    const { data: newProduct, error: createError } = await supabase
      .from('designer_products')
      .insert({
        designer_id: auth.designerId,
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        images: product.images || [],
        sizes: product.sizes || [],
        colors: product.colors || [],
        stock_status: product.stockStatus || 'in_stock',
        stock_quantity: product.stockQuantity?.toString() || '0',
        is_active: true,
        is_live: false
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
    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const auth = await requireDesignerUser(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { productId, product } = body;

    if (!productId || !product) {
      return NextResponse.json({ error: 'Product ID and product data are required' }, { status: 400 });
    }

    if (!product.name || !product.price || Number(product.price) <= 0) {
      return NextResponse.json({ error: 'Product name and positive price are required' }, { status: 400 });
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
      .eq('designer_id', auth.designerId)
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
    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const auth = await requireDesignerUser(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Delete product (only if it belongs to this designer)
    const { error: deleteError } = await supabase
      .from('designer_products')
      .delete()
      .eq('id', productId)
      .eq('designer_id', auth.designerId);

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
