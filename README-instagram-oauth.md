# Instagram OAuth Verification System

This document provides a complete guide for setting up and using the Instagram OAuth verification system in Baguri.

## 🎯 Overview

The Instagram OAuth verification system prevents designers from claiming Instagram accounts that don't belong to them. When a designer adds an Instagram handle to their profile, they must verify ownership through Instagram's OAuth flow.

## ✨ Features

- **Account Ownership Verification**: Designers authenticate with Instagram to prove account ownership
- **Impersonation Prevention**: Prevents users from claiming Instagram accounts that aren't theirs
- **Visual Verification Status**: Clear indicators showing which accounts are verified
- **Public Display**: Verification status shown on the public designers page
- **Revocation Support**: Designers can revoke verification if needed
- **Secure Token Storage**: Instagram access tokens stored securely in database

## 🏗️ Implementation Status

### ✅ Completed Components

1. **API Endpoints**
   - `POST /api/auth/instagram/initiate` - Initiates OAuth flow
   - `GET /api/auth/instagram/callback` - Handles OAuth callback
   - `POST /api/auth/instagram/revoke` - Revokes verification

2. **Database Schema**
   - `instagram_verified` column in designers table
   - `instagram_user_id` column for storing Instagram user ID
   - `instagram_access_token` column for secure token storage

3. **Frontend Integration**
   - Designer dashboard verification UI
   - Public designers page verification display
   - Error handling and user feedback

4. **Backend Services**
   - Instagram OAuth flow handling in `designerService`
   - State parameter security for CSRF protection
   - Username validation and verification

## 🚀 Setup Instructions

### 1. Instagram App Configuration

1. **Create Instagram App**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app or use existing app
   - Add "Instagram Basic Display" product

2. **Configure App Settings**
   - **App Type**: Consumer
   - **Use Case**: Allow people to log in with their Instagram account

3. **Set Redirect URIs**
   ```
   Development: http://localhost:3000/api/auth/instagram/callback
   Production: https://yourdomain.com/api/auth/instagram/callback
   ```

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# Instagram OAuth Configuration
NEXT_PUBLIC_INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Migration

Run the database migration to add Instagram verification columns:

```sql
-- Add Instagram verification columns to designers table
ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS instagram_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS instagram_user_id TEXT;

ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS instagram_access_token TEXT;
```

### 4. Test the Setup

Run the test script to verify your configuration:

```bash
node test-instagram-oauth.js
```

## 🔄 User Flow

### Designer Dashboard Flow

1. **Adding Instagram Handle**
   - Designer enters Instagram handle in profile
   - System shows warning that account is not verified
   - "Verify with Instagram" button appears

2. **Verification Process**
   - Designer clicks "Verify with Instagram"
   - System redirects to Instagram OAuth
   - User logs in to Instagram and grants permissions
   - Instagram redirects back with authorization code
   - System exchanges code for access token
   - System fetches Instagram profile to verify username
   - System updates designer profile with verified status

3. **Verification Status**
   - **Unverified**: Shows amber warning and verify button
   - **Verified**: Shows green checkmark and verification badge
   - **Revoked**: User can revoke verification if needed

### Public Display

- Verified accounts show green checkmark and "Verified" badge
- Unverified accounts show amber warning and "Unverified" status
- Helps users identify authentic designer accounts

## 🔒 Security Features

### State Parameter Protection
- Includes user ID and timestamp
- Prevents CSRF attacks
- Validates callback authenticity

### Secure Token Storage
- Access tokens stored securely in database
- Used for future API calls if needed
- Can be revoked by user

### Username Validation
- Compares entered handle with verified Instagram username
- Prevents handle spoofing
- Updates handle to match verified account

## 🛠️ Technical Implementation

### API Endpoints

#### POST /api/auth/instagram/initiate
Initiates Instagram OAuth flow for the current user.

**Request**: No body required (uses authenticated user)
**Response**:
```json
{
  "success": true,
  "authUrl": "https://api.instagram.com/oauth/authorize?..."
}
```

#### GET /api/auth/instagram/callback
Handles Instagram OAuth callback and verifies the account.

**Query Parameters**:
- `code`: Authorization code from Instagram
- `state`: State parameter for security
- `error`: Error code if user denied access

**Redirects to**: `/designer-dashboard` with success/error parameters

#### POST /api/auth/instagram/revoke
Revokes Instagram verification for the current user.

**Request**: No body required (uses authenticated user)
**Response**:
```json
{
  "success": true,
  "message": "Instagram verification revoked successfully"
}
```

### Database Schema

```sql
-- Instagram verification columns in designers table
instagram_verified BOOLEAN DEFAULT FALSE,
instagram_user_id TEXT,
instagram_access_token TEXT
```

### Service Methods

```typescript
// Instagram OAuth methods in designerService
async initiateInstagramOAuth(userId: string)
async verifyInstagramCallback(code: string, state: string)
async revokeInstagramVerification(userId: string)
async checkInstagramVerification(userId: string, instagramHandle: string)
```

## 🎨 UI Components

### Designer Dashboard
- Instagram handle input field
- Verification status indicator
- "Verify with Instagram" button
- "Revoke verification" option
- Success/error feedback

### Public Designers Page
- Verification badges next to Instagram links
- Green checkmark for verified accounts
- Amber warning for unverified accounts

## 🐛 Error Handling

### Common Errors
- `access_denied`: User cancelled OAuth flow
- `invalid_request`: Missing or invalid parameters
- `verification_failed`: Failed to verify account
- `server_error`: Internal server error

### User Feedback
- Clear error messages for each scenario
- Guidance on how to resolve issues
- Option to retry verification

## 🧪 Testing

### Development Testing
1. Set up Instagram app in sandbox mode
2. Add test users to app
3. Test OAuth flow with test accounts
4. Verify database updates correctly

### Production Considerations
- Instagram app must be in live mode
- Valid SSL certificate required
- Proper error logging and monitoring
- Rate limiting considerations

## 📊 Monitoring

### Key Metrics to Track
- OAuth initiation success rate
- Callback completion rate
- Verification success rate
- Error rates by type

### Logging
- OAuth flow events
- Verification attempts
- Error conditions
- Security events

## 🔧 Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Check `.env.local` file
   - Verify Instagram app credentials

2. **Redirect URI Mismatch**
   - Ensure redirect URI matches Instagram app configuration
   - Check for trailing slashes or protocol differences

3. **Database Errors**
   - Verify Instagram verification columns exist
   - Check database permissions

4. **OAuth Flow Errors**
   - Check Instagram app status (sandbox vs live)
   - Verify app permissions and scopes

### Debug Steps
1. Run `node test-instagram-oauth.js` to verify configuration
2. Check browser network tab for API errors
3. Review server logs for detailed error messages
4. Test with different Instagram accounts

## 🚀 Deployment

### Pre-deployment Checklist
- [ ] Instagram app configured for production domain
- [ ] Environment variables set in production
- [ ] Database migrations applied
- [ ] SSL certificate configured
- [ ] Error monitoring set up

### Post-deployment Testing
- [ ] Test OAuth flow with real Instagram account
- [ ] Verify verification status displays correctly
- [ ] Test revocation functionality
- [ ] Monitor error logs

## 📈 Future Enhancements

### Potential Improvements
1. **Token Refresh**: Handle expired Instagram tokens
2. **Batch Verification**: Verify multiple accounts at once
3. **Analytics**: Track verification rates and user behavior
4. **Alternative Verification**: Email or phone-based verification
5. **Admin Tools**: Manual verification override for admins

### API Limitations
- Instagram Basic Display API has rate limits
- Requires app review for production use
- Limited to basic profile information

## 📞 Support

For issues with Instagram OAuth setup:
1. Check this documentation
2. Review Instagram app configuration
3. Verify environment variables
4. Test with the provided test script
5. Check server logs for detailed errors

## 📝 Changelog

### v1.0.0 (Current)
- Initial Instagram OAuth implementation
- Basic verification flow
- Public verification display
- Revocation functionality
- Security features (state parameter, token storage)

---

**Note**: This implementation uses Instagram Basic Display API. For production use, ensure your Instagram app is approved and configured correctly. 