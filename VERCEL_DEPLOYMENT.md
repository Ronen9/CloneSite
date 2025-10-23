# 🚀 Vercel Deployment Guide

## Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- Environment variables ready

## 📝 Environment Variables Setup

In your Vercel project dashboard, add these environment variables:

### Required Variables

```bash
# Azure OpenAI Realtime API
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
AZURE_OPENAI_RESOURCE=your-resource-name

# Firecrawl API
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

## 🔧 Deployment Steps

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Add environment variables in the project settings
6. Click "Deploy"

## ✅ Verification Checklist

After deployment, verify:

- [ ] Frontend loads at your Vercel URL
- [ ] Clone Site tab works (tests `/api/clone`)
- [ ] Voice Chat tab loads
- [ ] Firecrawl credits display (tests `/api/firecrawl-credits`)
- [ ] Voice session can start (tests `/api/voice-session`)
- [ ] Website scraping works (tests `/api/firecrawl-scrape`)

## 🔍 Testing API Endpoints

```bash
# Test credits endpoint
curl https://your-app.vercel.app/api/firecrawl-credits

# Test voice session endpoint
curl -X POST https://your-app.vercel.app/api/voice-session \
  -H "Content-Type: application/json" \
  -d '{"voice":"coral"}'

# Test scrape endpoint
curl -X POST https://your-app.vercel.app/api/firecrawl-scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","type":"scrape"}'
```

## 🐛 Troubleshooting

### API Routes Return 404
- Check that `/api` folder is in repository root
- Verify `vercel.json` has correct rewrites
- Check Vercel function logs in dashboard

### Environment Variables Not Working
- Go to Project Settings → Environment Variables
- Ensure variables are added for "Production" environment
- Redeploy after adding variables

### Function Timeout
- Check function duration in Vercel dashboard
- Increase `maxDuration` in `vercel.json` if needed
- Maximum is 60 seconds on Pro plan, 10 seconds on Hobby

### CORS Errors
- Verify headers configuration in `vercel.json`
- Check browser console for specific CORS issues
- Ensure API routes set proper CORS headers

## 📊 Monitoring

After deployment, monitor:
- Vercel Dashboard → Analytics
- Function logs in Vercel Dashboard → Logs
- Error tracking in Vercel Dashboard → Errors

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to main branch:

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

Vercel will:
1. Detect the push
2. Run the build
3. Deploy to production
4. Provide a deployment URL

## 🌐 Custom Domain

To add a custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

## 📝 Notes

- **Local Development:** Uses Express server (`npm run dev`)
- **Production:** Uses Vercel serverless functions
- Both setups use the same `/api` routes
- Environment variables must be set in both `.env` (local) and Vercel dashboard (production)
