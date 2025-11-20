# Deploying to Netlify

This guide explains how to deploy your Bus Reservation Management App to Netlify using serverless functions.

## Overview

The application is deployed as:
- **Frontend**: React/Vite app served as static files
- **Backend**: Netlify serverless functions (converted from Express)
- **Database**: Firebase Firestore (unchanged)

## Prerequisites

1. GitHub account with your code pushed
2. Netlify account (sign up at [netlify.com](https://netlify.com))
3. Firebase credentials JSON file

## Deployment Steps

### 1. Connect to Netlify

1. Log in to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize Netlify
4. Select your repository: `jasonrj12/booking_management`

### 2. Configure Build Settings

Netlify will automatically detect the `netlify.toml` configuration. Verify these settings:

- **Base directory**: `client`
- **Build command**: `npm install && npm run build`
- **Publish directory**: `client/dist`
- **Functions directory**: `netlify/functions`

### 3. Set Up Environment Variables

> [!IMPORTANT]
> You MUST configure Firebase credentials as environment variables in Netlify.

Go to **Site settings** → **Environment variables** and add the following variables from your Firebase credentials JSON file:

```
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=<your-project-id>
FIREBASE_PRIVATE_KEY_ID=<your-private-key-id>
FIREBASE_PRIVATE_KEY=<your-private-key>
FIREBASE_CLIENT_EMAIL=<your-client-email>
FIREBASE_CLIENT_ID=<your-client-id>
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=<your-client-cert-url>
```

#### How to Extract Values from Firebase JSON:

Open your Firebase credentials JSON file (`firebase-credentials.json` or the file in Downloads) and map the values:

```json
{
  "type": "service_account",              → FIREBASE_TYPE
  "project_id": "bus-reservation-52ec0",   → FIREBASE_PROJECT_ID
  "private_key_id": "...",                 → FIREBASE_PRIVATE_KEY_ID
  "private_key": "-----BEGIN...",          → FIREBASE_PRIVATE_KEY (include full key with \\n)
  "client_email": "...",                   → FIREBASE_CLIENT_EMAIL
  "client_id": "...",                      → FIREBASE_CLIENT_ID
  "auth_uri": "...",                       → FIREBASE_AUTH_URI
  "token_uri": "...",                      → FIREBASE_TOKEN_URI
  "auth_provider_x509_cert_url": "...",    → FIREBASE_AUTH_PROVIDER_CERT_URL
  "client_x509_cert_url": "..."            → FIREBASE_CLIENT_CERT_URL
}
```

> [!WARNING]
> **Important for FIREBASE_PRIVATE_KEY**: Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`. The newlines (`\n`) should remain as literal `\n` characters.

### 4. Deploy

1. Click **"Deploy site"**
2. Netlify will build and deploy your application
3. Wait for the deployment to complete (usually 2-5 minutes)
4. Your site will be available at: `https://[your-site-name].netlify.app`

### 5. Custom Domain (Optional)

To use a custom domain:
1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the instructions to configure DNS

## Testing Your Deployment

After deployment:

1. Visit your Netlify URL
2. Select a route (Mannar to Colombo or Colombo to Mannar)
3. Select today's date
4. Try booking a seat
5. Verify the passenger appears in the list
6. Test update and cancel functionality

## Troubleshooting

### Build Fails

- Check the deploy logs in Netlify dashboard
- Verify all dependencies are in `package.json`
- Ensure `netlify.toml` is in the root directory

### Functions Not Working

- Verify environment variables are set correctly
- Check function logs in Netlify dashboard
- Ensure Firebase credentials are valid
- Check that `FIREBASE_PRIVATE_KEY` includes the full key with newlines

### API Errors

- Open browser console (F12) to see error messages
- Check that all environment variables are configured
- Verify Firebase Firestore rules allow access

## Continuous Deployment

Netlify automatically redeploys when you push to GitHub:

1. Make changes to your code
2. Commit and push to GitHub: `git push origin main`
3. Netlify will automatically rebuild and deploy

## Cost

- **Netlify**: Free tier includes:
  - 100 GB bandwidth/month
  - 300 build minutes/month
  - 125k serverless function requests/month
  
- **Firebase**: Free tier includes:
  - 50k document reads/day
  - 20k document writes/day
  - 1 GB storage

Both should be sufficient for moderate usage.

## Need Help?

If you encounter issues:
1. Check Netlify deploy logs
2. Check browser console for errors
3. Review Firebase console for database issues
4. Verify all environment variables are set correctly
