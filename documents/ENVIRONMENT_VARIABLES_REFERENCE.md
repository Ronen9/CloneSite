# 🔐 Environment Variables Reference

## .env File Template

Create a `.env` file in the **root directory** of your project with these exact values:

```env
# Azure OpenAI Realtime API Configuration
AZURE_OPENAI_API_KEY=1FdVYUoTnKj9c5BRX6LjgwsY9WQOTaGXQODR7AZubepupsSx8hWGJQQJ99BJACfhMk5XJ3w3AAABACOGly2w
AZURE_OPENAI_ENDPOINT=https://ronen-openai-realtime.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=ronen-deployment-gpt-4o-realtime-preview
AZURE_OPENAI_RESOURCE=ronen-openai-realtime

# Firecrawl API Configuration
FIRECRAWL_API_KEY=fc-0515511a88e4440292549c718ed2821a
```

---

## .env.example File Template

Create a `.env.example` file (for Git repository, without actual values):

```env
# Azure OpenAI Realtime API Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
AZURE_OPENAI_RESOURCE=your-resource-name

# Firecrawl API Configuration
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

---

## .gitignore Update

Make sure your `.gitignore` includes:

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Dependencies
node_modules/

# Build outputs
dist/
build/
homepage-clone/dist/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

---

## Vercel Environment Variables

When deploying to Vercel, add these environment variables in the Vercel dashboard:

### 1. Go to your project in Vercel
### 2. Navigate to: Settings → Environment Variables
### 3. Add each variable:

| Variable Name | Value |
|--------------|-------|
| `AZURE_OPENAI_API_KEY` | `1FdVYUoTnKj9c5BRX6LjgwsY9WQOTaGXQODR7AZubepupsSx8hWGJQQJ99BJACfhMk5XJ3w3AAABACOGly2w` |
| `AZURE_OPENAI_ENDPOINT` | `https://ronen-openai-realtime.openai.azure.com` |
| `AZURE_OPENAI_DEPLOYMENT` | `ronen-deployment-gpt-4o-realtime-preview` |
| `AZURE_OPENAI_RESOURCE` | `ronen-openai-realtime` |
| `FIRECRAWL_API_KEY` | `fc-0515511a88e4440292549c718ed2821a` |

### 4. Make sure to add them for all environments:
- ✅ Production
- ✅ Preview
- ✅ Development

---

## Azure App Service Environment Variables

If deploying to Azure, add these in the Azure Portal:

### 1. Go to: Azure Portal → App Services → Your App
### 2. Navigate to: Configuration → Application settings
### 3. Add each variable:

Same variables as above, but in Azure format:
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_DEPLOYMENT`
- `AZURE_OPENAI_RESOURCE`
- `FIRECRAWL_API_KEY`

---

## API Endpoint URLs Reference

These are the API endpoints you'll be using:

### Azure OpenAI Realtime API
- **Sessions Endpoint:** `https://ronen-openai-realtime.openai.azure.com/openai/realtime/sessions?api-version=2024-10-01-preview&deployment=ronen-deployment-gpt-4o-realtime-preview`
- **WebRTC Endpoint:** `https://ronen-openai-realtime.openai.azure.com/openai/realtime?api-version=2024-10-01-preview&deployment=ronen-deployment-gpt-4o-realtime-preview`

### Firecrawl API
- **Scrape Endpoint:** `https://api.firecrawl.dev/v1/scrape`
- **Crawl Endpoint:** `https://api.firecrawl.dev/v1/crawl`
- **Crawl Status:** `https://api.firecrawl.dev/v1/crawl/{jobId}`
- **Credits Check:** `https://api.firecrawl.dev/v2/team/credit-usage`

---

## Security Checklist

Before committing code:
- [ ] `.env` file is in `.gitignore`
- [ ] No API keys hardcoded in any file
- [ ] `.env.example` has placeholder values only
- [ ] All API calls go through backend routes (not frontend)
- [ ] Environment variables loaded in API route files
- [ ] Vercel/Azure environment variables configured

---

## Testing Environment Variables Locally

### 1. Check if .env is loaded:

Create a test file `test-env.js`:
```javascript
require('dotenv').config()

console.log('AZURE_OPENAI_API_KEY:', process.env.AZURE_OPENAI_API_KEY ? '✅ Loaded' : '❌ Missing')
console.log('AZURE_OPENAI_ENDPOINT:', process.env.AZURE_OPENAI_ENDPOINT ? '✅ Loaded' : '❌ Missing')
console.log('AZURE_OPENAI_DEPLOYMENT:', process.env.AZURE_OPENAI_DEPLOYMENT ? '✅ Loaded' : '❌ Missing')
console.log('FIRECRAWL_API_KEY:', process.env.FIRECRAWL_API_KEY ? '✅ Loaded' : '❌ Missing')
```

Run: `node test-env.js`

Expected output:
```
AZURE_OPENAI_API_KEY: ✅ Loaded
AZURE_OPENAI_ENDPOINT: ✅ Loaded
AZURE_OPENAI_DEPLOYMENT: ✅ Loaded
FIRECRAWL_API_KEY: ✅ Loaded
```

### 2. Install dotenv if not already installed:
```bash
npm install dotenv
```

### 3. Load dotenv in your API routes:
```javascript
require('dotenv').config()

// Now you can use process.env.AZURE_OPENAI_API_KEY
```

---

## Troubleshooting

### ❌ Problem: "Cannot find module 'dotenv'"
**Solution:** 
```bash
npm install dotenv
```

### ❌ Problem: Environment variables are undefined
**Solution:** 
1. Check `.env` file exists in root directory (not in `/api` or `/homepage-clone`)
2. Make sure you're calling `require('dotenv').config()` at the top of your API files
3. Restart your dev server after changing `.env`

### ❌ Problem: API keys exposed in frontend
**Solution:**
1. Never import .env in frontend code
2. All API calls should go through backend routes (`/api/*`)
3. Backend routes read from `process.env`
4. Frontend never sees the actual keys

### ❌ Problem: Works locally but not on Vercel
**Solution:**
1. Check Vercel environment variables are set correctly
2. Make sure they're enabled for all environments (Production/Preview/Development)
3. Redeploy after adding environment variables

---

## Quick Setup Commands

```bash
# 1. Navigate to project root
cd CloneSite

# 2. Create .env file
touch .env

# 3. Edit .env file (paste the credentials above)
# Use your favorite editor: nano, vim, or VS Code

# 4. Verify .gitignore includes .env
cat .gitignore | grep ".env"

# 5. Install dependencies if needed
npm install dotenv

# 6. Test environment variables
node test-env.js

# 7. Start dev server
npm run dev
```

---

## Environment Variable Naming Conventions

We use these conventions:
- `UPPERCASE_WITH_UNDERSCORES` for all environment variables
- `AZURE_` prefix for Azure-related variables
- `FIRECRAWL_` prefix for Firecrawl-related variables
- Clear, descriptive names (not abbreviations)

---

## 🔒 Security Best Practices

1. **Never commit `.env` file to Git**
   - Always in `.gitignore`
   - Use `.env.example` for templates

2. **Rotate keys regularly**
   - Especially if accidentally exposed
   - Update in all environments

3. **Use backend API routes**
   - Never expose keys in frontend
   - All sensitive operations through `/api/*`

4. **Different keys for different environments**
   - Separate dev/staging/production keys (if available)
   - Use Vercel environment variable scoping

5. **Monitor usage**
   - Check Azure OpenAI usage dashboard
   - Monitor Firecrawl credits

---

**Remember: Security first! Never commit API keys to Git! 🔐**
