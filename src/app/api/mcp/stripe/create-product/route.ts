import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, images, metadata } = body;

    if (!name) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    console.log('🚀 Creating Stripe product:', { name, description, images, metadata });

    // Prepare product data
    const productData: Stripe.ProductCreateParams = {
      name,
      description: description || '',
      metadata: {
        created_via: 'baguri_automation',
        created_at: new Date().toISOString(),
        ...metadata // Include any additional metadata passed from the request
      }
    };

    // Add images if provided (Stripe accepts up to 8 images)
    if (images && Array.isArray(images) && images.length > 0) {
      // Filter valid URLs and limit to 8 images (Stripe limit)
      const validImages = images
        .filter(img => typeof img === 'string' && img.trim().length > 0)
        .slice(0, 8);
      
      if (validImages.length > 0) {
        productData.images = validImages;
        console.log(`📸 Adding ${validImages.length} images to Stripe product`);
      }
    }

    // Create Stripe product using official SDK
    const stripeProduct = await stripe.products.create(productData);

    console.log('✅ Stripe product created:', stripeProduct.id);
    return NextResponse.json(stripeProduct);
    
  } catch (error) {
    console.error('Error creating Stripe product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    );
  }
} 