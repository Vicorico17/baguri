import { NextRequest, NextResponse } from 'next/server';
import { emailService, type EmailTemplate } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const { template, email, brandName, rejectionReason } = await req.json();

    // Validate required fields
    if (!template || !email || !brandName) {
      return NextResponse.json(
        { error: 'Missing required fields: template, email, brandName' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate template type
    const validTemplates: EmailTemplate[] = ['designer-review-submitted', 'designer-approved', 'designer-rejected'];
    if (!validTemplates.includes(template)) {
      return NextResponse.json(
        { error: 'Invalid email template' },
        { status: 400 }
      );
    }

    let result;
    
    // Send appropriate email based on template
    switch (template) {
      case 'designer-review-submitted':
        result = await emailService.sendDesignerReviewSubmitted(email, brandName);
        break;
      case 'designer-approved':
        result = await emailService.sendDesignerApproved(email, brandName);
        break;
      case 'designer-rejected':
        result = await emailService.sendDesignerRejected(email, brandName, rejectionReason);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid template' },
          { status: 400 }
        );
    }

    if (!result.success) {
      console.error('Email sending failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in send-email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 