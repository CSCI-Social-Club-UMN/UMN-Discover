# Google OAuth Setup Guide for UDiscover

This guide will walk you through setting up Google OAuth authentication for the UDiscover application.

## Quick Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" or select an existing project
3. Name your project (e.g., "UDiscover")
4. Note your Project ID

### 2. Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" 
3. Click on it and press "Enable"

### 3. Configure OAuth Consent Screen (You can skip this third part for dev server)

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have Google Workspace)
3. Fill in the required information:
   - **App name**: UDiscover
   - **User support email**: Your email
   - **Developer contact email**: Your email
   - **App domain**: `http://localhost:3000` (for development)
   - **Authorized domains**: Add `localhost` for development
4. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
5. Add test users (your UMN email addresses for testing)

### 4. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Configure:
   - **Name**: UDiscover Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (development)
     - `http://localhost:3001` (development)
     - `http://your-dmian-name` (productionB)
   - **Authorized redirect URIs**:
     - `http://localhost:3001/api/auth/google/callback` (development)
     - `https://your-domain-name/api/auth/google/callback` (production)
5. Click "Create"
6. **Save your Client ID and Client Secret!**

### 5. Environment Configuration

1. Make env file in the server folder `server/.env`
2. Fill in your Google OAuth credentials:

```env
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

CLIENT_URL=http://localhost:3000

JWT_SECRET=umn-discover-secret-key-2025
SESSION_SECRET=umn-discover-session-secret-2025

DB_USER=umn-app
DB_HOST=localhost
DB_NAME=umn_discover
DB_PASSWORD=umn1234
DB_PORT=5432

NODE_ENV=development
```

### 8. Test the Setup

1. Start your server: `pnpm -r dev`
2. Try logging in with a UMN email address

## Security Notes

### Email Domain Validation
The system automatically validates that users have UMN email addresses:
- `@umn.edu`
- `@tc.umn.edu` 
- `@d.umn.edu`
- `@r.umn.edu`
- `@c.umn.edu`
- `@m.umn.edu`
- `@crk.umn.edu`
- `@morris.umn.edu`
- `@duluth.umn.edu`
- `@rochester.umn.edu`

### Production Considerations

For production deployment:

1. **Update OAuth settings**:
   - Add your production domain to authorized origins
   - Update callback URL to production URL
   - Remove localhost from authorized domains

2. **Environment variables**:
   - Use strong, unique secrets
   - Update CLIENT_URL to production URL

## Issues

### Common Issues

1. **"redirect_uri_mismatch"**: Check that your callback URL exactly matches what's configured in Google Cloud Console

2. **"invalid_client"**: Verify your Client ID and Client Secret are correct

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Passport Google OAuth Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)

## Support

If you encounter issues:
1. Check the server console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure your Google Cloud project has the necessary APIs enabled
4. Check that your test user emails are added to the OAuth consent screen