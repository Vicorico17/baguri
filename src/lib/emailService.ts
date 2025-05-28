import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export type EmailTemplate = 'designer-review-submitted' | 'designer-approved' | 'designer-rejected';

interface EmailData {
  to: string;
  brandName: string;
  designerName?: string;
  rejectionReason?: string;
}

const EMAIL_TEMPLATES = {
  'designer-review-submitted': {
    subject: '🎉 Your Brand Application is Under Review!',
    getHtml: (data: EmailData) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Brand Application Under Review</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Your brand is under review!</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #2c3e50; margin-top: 0;">Hi ${data.brandName} team! 👋</h2>
            <p>Thank you for submitting your brand application to <strong>Baguri</strong>! We're excited to review your Romanian fashion brand.</p>
            
            <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2c3e50;">📋 What happens next?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Our team will carefully review your brand profile and products</li>
                <li>We'll check that everything meets our quality standards</li>
                <li>You'll receive our decision within <strong>24 hours</strong></li>
                <li>If approved, your brand will go live on Baguri! 🚀</li>
              </ul>
            </div>
            
            <p>We appreciate your patience during this process. Romanian fashion deserves a spotlight, and we're here to help you shine! ✨</p>
          </div>
          
          <div style="text-align: center; padding: 20px; background: #2c3e50; border-radius: 8px; color: white;">
            <p style="margin: 0; font-size: 14px;">
              Questions? We're here to help! Contact us at <a href="mailto:hello@baguri.ro" style="color: #667eea;">hello@baguri.ro</a><br>
              or find us on social media: <a href="https://instagram.com/baguri.ro" style="color: #667eea;">@baguri.ro</a> on Instagram & TikTok
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
              © 2022 Baguri - Romanian Fashion Marketplace
            </p>
          </div>
        </body>
      </html>
    `,
    getText: (data: EmailData) => `
🎉 Congratulations! Your brand is under review!

Hi ${data.brandName} team!

Thank you for submitting your brand application to Baguri! We're excited to review your Romanian fashion brand.

What happens next?
• Our team will carefully review your brand profile and products
• We'll check that everything meets our quality standards  
• You'll receive our decision within 24 hours
• If approved, your brand will go live on Baguri!

We appreciate your patience during this process. Romanian fashion deserves a spotlight, and we're here to help you shine!

Questions? We're here to help! Contact us at hello@baguri.ro
or find us on social media: @baguri.ro on Instagram & TikTok

© 2022 Baguri - Romanian Fashion Marketplace
    `
  },
  'designer-approved': {
    subject: '🎉 Welcome to Baguri! Your Brand Has Been Approved!',
    getHtml: (data: EmailData) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Brand Application Approved</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Your brand has been approved!</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #2c3e50; margin-top: 0;">Welcome to Baguri, ${data.brandName}! 🚀</h2>
            <p>We're thrilled to officially welcome you to the Baguri family! Your Romanian fashion brand has been approved and is now part of our curated marketplace.</p>
            
            <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #4CAF50; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2c3e50;">🎯 What's next?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>Your brand is now live</strong> on Baguri marketplace</li>
                <li>Customers can discover and purchase your products</li>
                <li>Access your designer dashboard to manage orders and inventory</li>
                <li>Start promoting your Baguri presence on social media</li>
              </ul>
            </div>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #2c3e50;">🔗 Quick Links:</p>
              <p style="margin: 5px 0 0 0;">
                • <a href="https://baguri.ro/designer-dashboard" style="color: #4CAF50;">Designer Dashboard</a><br>
                • <a href="https://baguri.ro/shop" style="color: #4CAF50;">View Your Brand on Baguri</a><br>
                • <a href="https://baguri.ro/designer-guide" style="color: #4CAF50;">Designer Success Guide</a>
              </p>
            </div>
            
            <p>Thank you for choosing Baguri to showcase your Romanian fashion. Together, we're building something beautiful! 💫</p>
          </div>
          
          <div style="text-align: center; padding: 20px; background: #2c3e50; border-radius: 8px; color: white;">
            <p style="margin: 0; font-size: 14px;">
              Questions? We're here to help! Contact us at <a href="mailto:hello@baguri.ro" style="color: #4CAF50;">hello@baguri.ro</a><br>
              or find us on social media: <a href="https://instagram.com/baguri.ro" style="color: #4CAF50;">@baguri.ro</a> on Instagram & TikTok
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
              © 2022 Baguri - Romanian Fashion Marketplace
            </p>
          </div>
        </body>
      </html>
    `,
    getText: (data: EmailData) => `
🎉 Congratulations! Your brand has been approved!

Welcome to Baguri, ${data.brandName}!

We're thrilled to officially welcome you to the Baguri family! Your Romanian fashion brand has been approved and is now part of our curated marketplace.

What's next?
• Your brand is now live on Baguri marketplace
• Customers can discover and purchase your products
• Access your designer dashboard to manage orders and inventory
• Start promoting your Baguri presence on social media

Quick Links:
• Designer Dashboard: https://baguri.ro/designer-dashboard
• View Your Brand: https://baguri.ro/shop
• Success Guide: https://baguri.ro/designer-guide

Thank you for choosing Baguri to showcase your Romanian fashion. Together, we're building something beautiful!

Questions? We're here to help! Contact us at hello@baguri.ro
or find us on social media: @baguri.ro on Instagram & TikTok

© 2022 Baguri - Romanian Fashion Marketplace
    `
  },
  'designer-rejected': {
    subject: '📝 Update Required: Your Baguri Application',
    getHtml: (data: EmailData) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Brand Application Update Required</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📝 Application Update</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Your application needs some updates</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #2c3e50; margin-top: 0;">Hi ${data.brandName} team,</h2>
            <p>Thank you for your interest in joining Baguri! We've reviewed your application and while we love your brand concept, we need a few updates before we can approve your application.</p>
            
            ${data.rejectionReason ? `
            <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #ff6b6b; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2c3e50;">📋 Feedback from our team:</h3>
              <div style="margin: 0; white-space: pre-line; line-height: 1.6;">${data.rejectionReason}</div>
            </div>
            ` : ''}
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2c3e50;">🔄 What to do next:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Review the feedback above and update your application accordingly</li>
                <li>Make sure all required fields are completed</li>
                <li>Ensure your product photos are high-quality and well-lit</li>
                <li>Double-check that your brand description clearly explains your unique value</li>
                <li>Resubmit your application when ready</li>
              </ul>
            </div>
            
            <p>Don't worry - this is a normal part of our quality assurance process. Many successful brands on Baguri needed to make updates before approval. We're here to help you succeed! 💪</p>
          </div>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://baguri.ro/designer-dashboard" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Update Your Application
            </a>
          </div>
          
          <div style="text-align: center; padding: 20px; background: #2c3e50; border-radius: 8px; color: white;">
            <p style="margin: 0; font-size: 14px;">
              Questions? We're here to help! Contact us at <a href="mailto:hello@baguri.ro" style="color: #667eea;">hello@baguri.ro</a><br>
              or find us on social media: <a href="https://instagram.com/baguri.ro" style="color: #667eea;">@baguri.ro</a> on Instagram & TikTok
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">
              © 2022 Baguri - Romanian Fashion Marketplace
            </p>
          </div>
        </body>
      </html>
    `,
    getText: (data: EmailData) => `
📝 Application Update Required

Hi ${data.brandName} team,

Thank you for your interest in joining Baguri! We've reviewed your application and while we love your brand concept, we need a few updates before we can approve your application.

${data.rejectionReason ? `
Feedback from our team:
${data.rejectionReason}

` : ''}

What to do next:
• Review the feedback above and update your application accordingly
• Make sure all required fields are completed
• Ensure your product photos are high-quality and well-lit
• Double-check that your brand description clearly explains your unique value
• Resubmit your application when ready

Don't worry - this is a normal part of our quality assurance process. Many successful brands on Baguri needed to make updates before approval. We're here to help you succeed!

Update your application: https://baguri.ro/designer-dashboard

Questions? We're here to help! Contact us at hello@baguri.ro
or find us on social media: @baguri.ro on Instagram & TikTok

© 2022 Baguri - Romanian Fashion Marketplace
    `
  }
};

export class EmailService {
  async sendEmail(template: EmailTemplate, data: EmailData): Promise<{ success: boolean; error?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not configured');
        return { success: false, error: 'Email service not configured' };
      }

      const templateConfig = EMAIL_TEMPLATES[template];
      if (!templateConfig) {
        return { success: false, error: 'Invalid email template' };
      }

      const emailData = {
        from: 'Baguri <noreply@baguri.ro>',
        to: data.to,
        subject: templateConfig.subject,
        html: templateConfig.getHtml(data),
        text: templateConfig.getText(data),
      };

      const result = await resend.emails.send(emailData);

      if (result.error) {
        console.error('Resend error:', result.error);
        return { success: false, error: result.error.message };
      }

      console.log('Email sent successfully:', result.data?.id);
      return { success: true };
    } catch (error: any) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendDesignerReviewSubmitted(email: string, brandName: string): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail('designer-review-submitted', {
      to: email,
      brandName,
    });
  }

  async sendDesignerApproved(email: string, brandName: string): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail('designer-approved', {
      to: email,
      brandName,
    });
  }

  async sendDesignerRejected(email: string, brandName: string, rejectionReason?: string): Promise<{ success: boolean; error?: string }> {
    return this.sendEmail('designer-rejected', {
      to: email,
      brandName,
      rejectionReason,
    });
  }
}

export const emailService = new EmailService(); 