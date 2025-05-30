# Instagram OAuth Setup for Baguri

This document explains how to set up Instagram OAuth verification to prevent designers from claiming Instagram accounts that don't belong to them.

## Overview

The Instagram OAuth verification system ensures that designers can only add Instagram handles that they actually own. When a designer adds an Instagram handle to their profile, they must verify ownership through Instagram's OAuth flow.

## Features

- **Account Ownership Verification**: Designers must authenticate with Instagram to prove they own the account
- **Impersonation Prevention**: Prevents users from claiming Instagram accounts that aren't theirs
- **Visual Verification Status**: Clear indicators showing which accounts are verified
- **Revocation Support**: Designers can revoke verification if needed
- **Public Display**: Verification status is shown on the public designers page

## Instagram App Setup

### 1. Create Instagram App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use existing app
3. Add "Instagram Basic Display" product
4. Configure the app settings

### 2. App Configuration

**App Type**: Consumer
**Use Case**: Allow people to log in with their Instagram account

### 3. Instagram Basic Display Settings

**Valid OAuth Redirect URIs**:
```
http://localhost:3000/api/auth/instagram/callback
https://yourdomain.com/api/auth/instagram/callback
```

**Deauthorize Callback URL**:
```
https://yourdomain.com/api/auth/instagram/deauthorize
```

**Data Deletion Request URL**:
```
https://yourdomain.com/api/auth/instagram/data-deletion
```

## Environment Variables

Add these to your `.env.local` file:

```env
# Instagram OAuth Configuration
NEXT_PUBLIC_INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Schema

The following columns are added to the `designers` table:

```sql
-- Instagram verification fields
instagram_verified BOOLEAN DEFAULT FALSE,
instagram_user_id TEXT,
instagram_access_token TEXT
```

## API Endpoints

### POST /api/auth/instagram/initiate
Initiates Instagram OAuth flow for the current user.

**Response**:
```json
{
  "success": true,
  "authUrl": "https://api.instagram.com/oauth/authorize?..."
}
```

### GET /api/auth/instagram/callback
Handles Instagram OAuth callback and verifies the account.

**Query Parameters**:
- `code`: Authorization code from Instagram
- `state`: State parameter for security
- `error`: Error code if user denied access

### POST /api/auth/instagram/revoke
Revokes Instagram verification for the current user.

**Response**:
```json
{
  "success": true,
  "message": "Instagram verification revoked successfully"
}
```

## Implementation Details

### Designer Dashboard Integration
- Instagram verification is integrated into the designer dashboard
- Shows verification status with clear visual indicators
- Provides "Verify with Instagram" button for unverified accounts
- Allows revocation of verification if needed

### Public Display
- Verification status is shown on the public designers page
- Verified accounts show green checkmark and "Verified" badge
- Unverified accounts show amber warning and "Unverified" status
- Helps users identify authentic designer accounts

### Database Integration
- Verification status is stored in the `designers` table
- Instagram user ID and access token are securely stored
- Verification status is included in all designer queries

## User Flow

### 1. Adding Instagram Handle
1. Designer enters Instagram handle in profile
2. System shows warning that account is not verified
3. Designer clicks "Verify with Instagram" button

### 2. Verification Process
1. System redirects to Instagram OAuth
2. User logs in to Instagram and grants permissions
3. Instagram redirects back with authorization code
4. System exchanges code for access token
5. System fetches Instagram profile to verify username
6. System updates designer profile with verified status

### 3. Verification Status
- **Unverified**: Shows warning and verify button
- **Verified**: Shows green checkmark and verification badge
- **Revoked**: User can revoke verification if needed

## Security Features

### State Parameter
- Includes user ID and timestamp
- Prevents CSRF attacks
- Validates callback authenticity

### Access Token Storage
- Stored securely in database
- Used for future API calls if needed
- Can be revoked by user

### Username Validation
- Compares entered handle with verified Instagram username
- Prevents handle spoofing
- Updates handle to match verified account

## Error Handling

### Common Errors
- `access_denied`: User cancelled OAuth flow
- `invalid_request`: Missing or invalid parameters
- `verification_failed`: Failed to verify account
- `server_error`: Internal server error

### User Feedback
- Clear error messages for each scenario
- Guidance on how to resolve issues
- Option to retry verification

## Testing

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

## Current Implementation Status

### ✅ Completed Features
- Instagram OAuth initiation endpoint
- OAuth callback handling
- Database schema with verification fields
- Designer dashboard integration
- Verification status display on public pages
- Revocation functionality
- Error handling and user feedback

### 🔧 Setup Required
1. **Instagram App Configuration**
   - Create Instagram Basic Display app
   - Configure redirect URIs
   - Get app ID and secret

2. **Environment Variables**
   - Add Instagram app credentials to `.env.local`
   - Configure app URL for redirects

3. **Database Migration**
   - Ensure Instagram verification columns exist
   - Run any pending migrations

### 📋 Verification Checklist
- [ ] Instagram app created and configured
- [ ] Environment variables set
- [ ] Database schema updated
- [ ] Test OAuth flow in development
- [ ] Verify public display of verification status
- [ ] Test revocation functionality

## Limitations

### Instagram Basic Display API
- Limited to basic profile information
- Requires app review for production use
- May have rate limits

### Alternative Approaches
If Instagram Basic Display API is not suitable:
1. **Manual Verification**: Admin reviews Instagram accounts manually
2. **Email Verification**: Send verification email to Instagram-linked email
3. **Phone Verification**: Use phone number associated with Instagram account

## Maintenance

### Token Refresh
- Instagram access tokens may expire
- Implement refresh logic if needed
- Handle expired token scenarios

### API Changes
- Monitor Instagram API updates
- Update implementation as needed
- Test regularly to ensure functionality

## Support

For issues with Instagram OAuth setup:
1. Check Instagram app configuration
2. Verify environment variables
3. Review server logs for errors
4. Test with different Instagram accounts
5. Contact Instagram developer support if needed

## Next Steps

1. **Set up Instagram App**: Create and configure your Instagram Basic Display app
2. **Add Environment Variables**: Configure your `.env.local` with Instagram credentials
3. **Test the Flow**: Test the complete OAuth verification process
4. **Deploy**: Deploy to production with proper SSL and domain configuration
5. **Monitor**: Set up logging and monitoring for the OAuth flow 