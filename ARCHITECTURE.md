# 🏗️ Dual Environment Architecture

This project is designed to work seamlessly in both **local development** and **Vercel production** environments.

## 📂 Architecture Overview

```
CloneSite/
├── api/                          # Vercel Serverless Functions (Production)
│   ├── clone.js                  # module.exports format
│   ├── voice-session.js          # module.exports format
│   ├── firecrawl-credits.js      # module.exports format
│   └── firecrawl-scrape.js       # module.exports format
├── server.js                     # Express Server (Local Development)
├── vercel.json                   # Vercel Configuration
└── .env                          # Local Environment Variables
```

## 🔄 How It Works

### Local Development (`npm run dev`)

When you run `npm run dev`, the system starts:

1. **Express Server** (`server.js` on port 3003)
   - Loads environment variables from `.env` file
   - Hosts API routes: `/api/clone`, `/api/voice-session`, etc.
   - Uses `axios` for HTTP requests

2. **Vite Dev Server** (port 5173)
   - Serves React frontend
   - Proxies `/api/*` requests to Express server (port 3003)
   - Configured in `homepage-clone/vite.config.ts`

**Request Flow (Local):**
```
Browser → Vite (5173) → Proxy → Express (3003) → API Logic → Response
```

### Production (Vercel)

When deployed to Vercel:

1. **Serverless Functions** (`/api` folder)
   - Each `.js` file becomes a serverless endpoint
   - Auto-deployed and managed by Vercel
   - Environment variables from Vercel dashboard

2. **Static Frontend** (built React app)
   - Served from `homepage-clone/dist`
   - Configured in `vercel.json`

**Request Flow (Production):**
```
Browser → Vercel Edge → Serverless Function → API Logic → Response
```

## 🔑 Environment Variables

### Local Development
Stored in `.env` file (git-ignored):
```bash
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=...
AZURE_OPENAI_DEPLOYMENT=...
FIRECRAWL_API_KEY=...
```

### Production (Vercel)
Set in Vercel Dashboard → Project Settings → Environment Variables

## 📝 Code Compatibility

### API Functions Format

**Local (Express - server.js):**
```javascript
app.post('/api/voice-session', async (req, res) => {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  // ... logic
});
```

**Production (Vercel - api/voice-session.js):**
```javascript
module.exports = async function handler(req, res) {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  // ... same logic
};
```

Both use:
- ✅ Same environment variable names
- ✅ Same request/response patterns
- ✅ Same error handling
- ✅ Same CORS configuration

## 🚀 Development Workflow

```bash
# 1. Local Development
npm run dev                    # Starts both Express + Vite
# → Test at http://localhost:5173

# 2. Test Production Build Locally
npm run build                  # Build frontend
npm start                      # Start production Express server
# → Test at http://localhost:3003

# 3. Deploy to Vercel
git push origin main           # Auto-deploys via Vercel GitHub integration
# → Live at https://your-app.vercel.app
```

## ⚙️ Configuration Files

### `vercel.json`
Defines:
- Build command
- Output directory
- API function settings (maxDuration)
- URL rewrites
- CORS headers

### `vite.config.ts`
Defines:
- Proxy configuration (local dev only)
- API requests forwarded to Express server

### `server.js`
Defines:
- Express routes (mirrors Vercel functions)
- CORS middleware
- Environment variable loading

## 🔍 Testing Both Environments

### Test Local Development
```bash
npm run dev

# Test credits endpoint
curl http://localhost:5173/api/firecrawl-credits

# Test voice session
curl -X POST http://localhost:5173/api/voice-session \
  -H "Content-Type: application/json" \
  -d '{"voice":"coral"}'
```

### Test Production (after deploy)
```bash
# Test credits endpoint
curl https://your-app.vercel.app/api/firecrawl-credits

# Test voice session
curl -X POST https://your-app.vercel.app/api/voice-session \
  -H "Content-Type: application/json" \
  -d '{"voice":"coral"}'
```

## 🎯 Key Benefits

1. **Consistent API Routes**: Same `/api/*` paths in both environments
2. **Environment Isolation**: Local `.env` vs Vercel dashboard
3. **Fast Development**: No need to deploy to test
4. **Production-Ready**: Serverless functions auto-scale
5. **Cost-Effective**: Pay-per-execution in production

## 📊 Monitoring

### Local Development
- Console logs in terminal
- Browser DevTools Network tab
- Express server logs

### Production (Vercel)
- Vercel Dashboard → Analytics
- Function logs in real-time
- Error tracking
- Performance metrics

## 🔧 Troubleshooting

### "API route 404" in local dev
- Check Express server is running (port 3003)
- Verify Vite proxy configuration
- Check API route path in server.js

### "API route 404" in production
- Verify function file is in `/api` folder
- Check `module.exports` format
- Verify environment variables in Vercel dashboard
- Check Vercel function logs

### Environment variables not working
- **Local**: Check `.env` file exists in root
- **Production**: Check Vercel dashboard environment variables
- Restart servers after changes

## ✅ Best Practices

1. **Keep Logic Identical**: API logic should be same in both environments
2. **Use Environment Variables**: Never hardcode credentials
3. **Test Locally First**: Verify before deploying
4. **Monitor Production**: Check Vercel logs regularly
5. **Version Control**: Keep `vercel.json` and `server.js` in sync

---

This dual-environment setup ensures a smooth development experience while maintaining production reliability! 🚀
