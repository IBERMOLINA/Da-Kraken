# Google OAuth Setup Guide

This guide will help you configure Google Sign-in for Da-Kraken AI Console.

## Prerequisites

- Google Cloud Platform account
- Da-Kraken development environment
- Basic understanding of OAuth2 flow

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Create Project" or select existing project
3. Enter project name: `da-kraken-auth` (or your preferred name)
4. Note the Project ID for later use

## Step 2: Enable Google+ API

1. In the Google Cloud Console, navigate to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on "Google+ API" and press **Enable**
4. Also enable "Google OAuth2 API"

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (or Internal for G Suite domains)
3. Fill in the application information:
   ```
   Application Name: Da-Kraken AI Console
   User Support Email: your-email@domain.com
   Application Logo: (optional)
   Application Homepage: http://localhost:3000
   Privacy Policy: http://localhost:3000/privacy
   Terms of Service: http://localhost:3000/terms
   ```
4. Add scopes:
   - `userinfo.email`
   - `userinfo.profile`
5. Add test users (for development):
   - Add your email address
   - Add team member emails

## Step 4: Create OAuth2 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Configure the client:
   ```
   Name: Da-Kraken Web Client
   
   Authorized JavaScript Origins:
   - http://localhost:3000
   - http://localhost:4002
   - https://your-domain.com (for production)
   
   Authorized Redirect URIs:
   - http://localhost:3000/auth/callback
   - http://localhost:4002/auth/google/callback
   - https://your-domain.com/auth/callback (for production)
   ```
5. Click **Create**
6. **IMPORTANT**: Copy the Client ID and Client Secret

## Step 5: Configure Environment Variables

Create or update your `.env` file in the Da-Kraken root directory:

```bash
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend Configuration
REACT_APP_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
FRONTEND_URL=http://localhost:3000

# Authentication Service
GOOGLE_OAUTH_ENABLED=true
```

## Step 6: Update Docker Compose

The docker-compose.yml should already include Google OAuth environment variables:

```yaml
services:
  google-auth-service:
    environment:
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-}
      - JWT_SECRET=${JWT_SECRET:-da-kraken-secret-key}
```

## Step 7: Test Authentication Flow

1. Start Da-Kraken services:
   ```bash
   cd containers
   docker-compose up -d
   ```

2. Open browser to http://localhost:3000

3. Click "Sign in with Google"

4. You should be redirected to Google's OAuth consent screen

5. After authorization, you'll be redirected back to Da-Kraken

## Step 8: Verify Authentication

Test the authentication endpoints:

```bash
# Health check
curl http://localhost:4002/health

# Initiate Google auth (returns auth URL)
curl http://localhost:4002/auth/google

# Check if user is authenticated (requires valid JWT)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:4002/auth/profile
```

## Production Configuration

For production deployment:

### 1. Update OAuth Credentials
- Add production domain to authorized origins
- Add production callback URLs
- Remove localhost URLs

### 2. Environment Variables
```bash
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
JWT_SECRET=very-strong-random-secret-key
FRONTEND_URL=https://your-production-domain.com
NODE_ENV=production
```

### 3. Security Considerations
- Use HTTPS in production
- Set secure cookies
- Configure proper CORS origins
- Use strong JWT secrets
- Enable rate limiting
- Monitor authentication logs

### 4. Domain Verification
For production domains, you may need to:
1. Verify domain ownership in Google Cloud Console
2. Update OAuth consent screen with production URLs
3. Submit for verification if using sensitive scopes

## Troubleshooting

### Common Issues

**Error: "OAuth client not found"**
- Verify Client ID is correct
- Check that client ID matches in all config files

**Error: "Redirect URI mismatch"**
- Ensure redirect URIs in Google Console match exactly
- Include protocol (http/https) and port numbers

**Error: "Access blocked: This app's request is invalid"**
- Complete OAuth consent screen configuration
- Add test users for development
- Verify domain ownership for production

**Error: "Invalid JWT token"**
- Check JWT_SECRET is consistent across services
- Verify token hasn't expired
- Ensure proper token format (Bearer token)

### Debug Mode

Enable debug logging:

```bash
# In auth service container
docker logs -f da-kraken-auth

# Check authentication service health
curl http://localhost:4002/health
```

### Support

For additional help:
- Check [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- Review Da-Kraken logs: `docker-compose logs auth-service`
- Open issue on [GitHub](https://github.com/IBERMOLINA/Da-Kraken/issues)

---

*Last updated: September 2025*