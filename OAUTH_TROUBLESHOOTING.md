# 🔧 Fix Google OAuth "Invalid Client" Error

## 🚨 Current Issue
Your app is getting "invalid_client: Invalid client identifier" because the Google OAuth credentials need to be properly configured.

## ✅ Step-by-Step Fix

### Step 1: Verify Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Select your project** (or create new one)
3. **Navigate to**: APIs & Services → Credentials
4. **Find your OAuth 2.0 Client ID**: `1054650962262-cqghostie1hibd0m6ud08m510gfuc7rl.apps.googleusercontent.com`

### Step 2: Configure Authorized Redirect URIs

**CRITICAL**: Your Google OAuth client must have these **exact** redirect URIs:

```
Authorized redirect URIs:
http://localhost:3000/api/auth/callback/google
http://127.0.0.1:3000/api/auth/callback/google
```

### Step 3: Configure Authorized JavaScript Origins

```
Authorized JavaScript origins:
http://localhost:3000
http://127.0.0.1:3000
```

### Step 4: Restart Development Server

After fixing the environment variables, restart your server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd "C:\Users\user\Desktop\bootcamp\week-3\person-search"
pnpm dev
```

### Step 5: Test OAuth Flow

1. **Visit**: http://localhost:3000/auth/login
2. **Click**: "Sign in with Google"
3. **Should work**: Redirect to Google OAuth successfully

## 🔍 Troubleshooting

### If still getting "invalid_client" error:

**Check Google Cloud Console**:
1. Make sure the OAuth client is **enabled**
2. Verify the **Client ID** matches your .env.local exactly
3. Ensure **redirect URIs** are configured correctly
4. Check if you need to **verify your app** (if using external user type)

### If getting "redirect_uri_mismatch" error:

**Add these redirect URIs to Google Cloud Console**:
```
http://localhost:3000/api/auth/callback/google
http://127.0.0.1:3000/api/auth/callback/google
```

### If getting "access_blocked" error:

Your OAuth app might need **verification** or you need to add test users:
1. Go to **OAuth consent screen** in Google Cloud Console
2. Add your email as a **test user**
3. Or complete the **app verification** process

## 📋 Current Configuration

Your `.env.local` now has:
```env
GOOGLE_CLIENT_ID=1054650962262-cqghostie1hibd0m6ud08m510gfuc7rl.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1054650962262-cqghostie1hibd0m6ud08m510gfuc7rl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

## 🎯 Next Steps

1. **Restart your dev server** (`pnpm dev`)
2. **Check Google Cloud Console** redirect URIs
3. **Test OAuth flow** again
4. **If still issues**, share the specific error message

The OAuth flow should work once the redirect URIs are properly configured in Google Cloud Console!