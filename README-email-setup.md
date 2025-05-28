# Email Notification Setup for Baguri

This document explains how to set up email notifications for the Baguri designer platform.

## Overview

The email system sends automated notifications to designers when:
- ✅ They submit their profile for review
- ✅ Their application is approved
- ✅ Their application needs updates (rejected)

## Email Service Provider

We use [Resend](https://resend.com/) for sending transactional emails because:
- Excellent deliverability rates
- Simple API and great Next.js integration
- Generous free tier (3,000 emails/month)
- Built-in email templates and analytics

## Setup Instructions

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com/) and sign up
2. Verify your email address
3. Complete the onboarding process

### 2. Add Your Domain (Recommended)

For production use, add your domain to Resend:

1. In the Resend dashboard, go to "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `baguri.ro`)
4. Follow the DNS setup instructions
5. Wait for domain verification

**Note:** For development, you can use the default Resend domain, but emails will have a "via resend.dev" notice.

### 3. Get Your API Key

1. In the Resend dashboard, go to "API Keys"
2. Click "Create API Key"
3. Give it a name (e.g., "Baguri Production")
4. Select the appropriate permissions (Send access is sufficient)
5. Copy the API key (starts with `re_`)

### 4. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Email Service Configuration
RESEND_API_KEY=re_your_api_key_here
```

**Important:** Never commit your API key to version control!

### 5. Update Email Templates (Optional)

The email templates are defined in `src/lib/emailService.ts`. You can customize:

- Email subjects
- HTML templates
- Text versions
- Branding and styling

## Email Templates

### 1. Review Submitted
**Trigger:** When designer submits profile for review
**Subject:** 🎉 Your Brand Application is Under Review!
**Content:** Congratulations message with 24-hour timeline

### 2. Application Approved
**Trigger:** When admin approves designer (manual process)
**Subject:** 🎉 Welcome to Baguri - Your Brand is Approved!
**Content:** Welcome message with dashboard link

### 3. Application Needs Updates
**Trigger:** When admin rejects designer (manual process)
**Subject:** 📝 Your Baguri Application Needs Updates
**Content:** Feedback message with resubmission instructions

## API Endpoints

### Send Email
**Endpoint:** `POST /api/send-email`

**Request Body:**
```json
{
  "template": "designer-review-submitted",
  "email": "designer@example.com",
  "brandName": "Brand Name",
  "rejectionReason": "Optional feedback for rejected applications"
}
```

**Response:**
```json
{
  "success": true
}
```

## Testing

### Development Testing

1. Set up a Resend account with your personal email
2. Add the API key to `.env.local`
3. Submit a test designer application
4. Check your email for the notification

### Production Testing

1. Use a staging environment with test email addresses
2. Test all three email templates
3. Verify email deliverability and formatting
4. Check spam folder placement

## Monitoring

### Resend Dashboard

Monitor email performance in the Resend dashboard:
- Delivery rates
- Open rates
- Bounce rates
- Spam complaints

### Application Logs

Email sending is logged in the application:
- Success: "Email sent successfully: [message-id]"
- Failure: "Email sending failed: [error]"

## Troubleshooting

### Common Issues

1. **"Email service not configured"**
   - Check that `RESEND_API_KEY` is set in environment variables
   - Verify the API key is correct and active

2. **Emails not being delivered**
   - Check Resend dashboard for delivery status
   - Verify recipient email addresses
   - Check spam folders
   - Ensure domain is properly configured

3. **"Invalid email template"**
   - Verify template name matches exactly
   - Check that all required fields are provided

### Debug Mode

To enable detailed email logging, check the browser console and server logs when submitting applications.

## Security Considerations

1. **API Key Protection**
   - Never expose API keys in client-side code
   - Use environment variables only
   - Rotate keys regularly

2. **Email Validation**
   - All email addresses are validated before sending
   - Rate limiting is handled by Resend

3. **Content Security**
   - Email templates are server-side rendered
   - No user input is directly inserted into emails without validation

## Future Enhancements

Potential improvements for the email system:

1. **Email Preferences**
   - Allow designers to opt-out of certain notifications
   - Preference management in dashboard

2. **Rich Templates**
   - More sophisticated HTML templates
   - Dynamic content based on designer data

3. **Email Analytics**
   - Track open rates and click-through rates
   - A/B testing for email content

4. **Additional Notifications**
   - Order notifications
   - Product approval notifications
   - Marketing emails

## Support

For email-related issues:
1. Check this documentation
2. Review Resend documentation
3. Check application logs
4. Contact the development team

---

**Last Updated:** December 2024
**Version:** 1.0 