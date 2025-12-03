# Clerk Authentication Setup Guide

This project uses [Clerk](https://clerk.com) for authentication with Microsoft OAuth support.

## Prerequisites

- A Clerk account (free tier supports up to 10,000 monthly active users)
- Microsoft Azure AD app (for Microsoft OAuth) - optional but recommended

## Step 1: Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com) and sign up for a free account
2. Create a new application in the Clerk dashboard
3. Give your application a name (e.g., "Ronen's Chatbot Demo")

## Step 2: Get Your Publishable Key

1. In your Clerk dashboard, navigate to **API Keys**
2. Copy the **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Add it to your `homepage-clone/.env` file:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-key-here
```

## Step 3: Enable Microsoft OAuth (Recommended)

### Option A: Using Clerk's Microsoft Integration (Easiest)

1. In Clerk dashboard, go to **User & Authentication** → **Social Connections**
2. Find **Microsoft** and click **Configure**
3. Toggle **Enable for sign-up and sign-in**
4. Clerk will handle the OAuth flow for you
5. Save changes

### Option B: Using Your Own Azure AD App (Advanced)

If you want to use your own Microsoft Azure AD application:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations** → **New registration**
3. Register your app:
   - Name: "Chatbot Demo Auth"
   - Supported account types: "Accounts in this organizational directory only (Microsoft only - Single tenant)"
   - Redirect URI: Get this from Clerk dashboard under Microsoft settings
4. Copy the **Application (client) ID** and **Directory (tenant) ID**
5. Create a **Client Secret** in **Certificates & secrets**
6. In Clerk dashboard, paste these credentials into the Microsoft OAuth configuration

## Step 4: Configure Email Domain Restrictions (Optional)

To restrict sign-ups to only `@microsoft.com` emails:

1. In Clerk dashboard, go to **User & Authentication** → **Restrictions**
2. Under **Allowlist**, add: `microsoft.com`
3. Enable **Block disposable email addresses**
4. Save changes

## Step 5: Test Authentication

1. Start your development server:
   ```bash
   cd homepage-clone
   npm run dev
   ```

2. Navigate to `http://localhost:5173`
3. You should be redirected to the sign-in page
4. Click **Continue with Microsoft**
5. Sign in with your Microsoft account
6. After authentication, you'll be redirected to the main application

## Step 6: Deploy to Vercel

1. Add the environment variable to Vercel:
   ```bash
   vercel env add VITE_CLERK_PUBLISHABLE_KEY
   ```

2. Or add it in the Vercel dashboard:
   - Go to your project → **Settings** → **Environment Variables**
   - Add `VITE_CLERK_PUBLISHABLE_KEY` with your publishable key
   - Make sure it's available for **Production**, **Preview**, and **Development**

3. Redeploy your application

## Step 7: Configure Allowed Redirect URLs (Production)

1. In Clerk dashboard, go to **Paths**
2. Add your production URLs:
   - `https://your-domain.vercel.app`
   - `https://your-domain.vercel.app/sign-in`
   - `https://your-domain.vercel.app/sign-up`

## Troubleshooting

### "Missing Clerk Publishable Key" Error

- Make sure `VITE_CLERK_PUBLISHABLE_KEY` is set in your `.env` file
- Restart your development server after adding environment variables
- Ensure the key starts with `pk_test_` (for development) or `pk_live_` (for production)

### Redirect Loop Issues

- Check that your allowed redirect URLs are configured correctly in Clerk dashboard
- Make sure your publishable key matches the environment (test key for development, live key for production)

### Microsoft Sign-In Not Working

- Verify Microsoft OAuth is enabled in Clerk dashboard
- Check that your Azure AD app redirect URIs match what Clerk expects
- Ensure you're using a valid Microsoft account

## Security Best Practices

1. **Never commit** your `.env` file to git (it's already in `.gitignore`)
2. Use **test keys** for development and **live keys** for production
3. Rotate your API keys periodically
4. Enable **two-factor authentication** on your Clerk account
5. Monitor authentication logs in Clerk dashboard

## User Management

View and manage users in the Clerk dashboard:
- Go to **Users** to see all registered users
- You can manually add users, block users, or delete users
- View user sessions and authentication history

## Free Tier Limits

- ✅ Up to 10,000 monthly active users
- ✅ Unlimited total users
- ✅ Social OAuth (Microsoft, Google, etc.)
- ✅ Email/password authentication
- ✅ Pre-built UI components
- ✅ Standard support

## Support

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Discord Community](https://clerk.com/discord)
- [Clerk Support](https://clerk.com/support)
