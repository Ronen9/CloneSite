# 🚀 Vercel Deployment Guide

## 📖 Understanding the Setup

### **Development (Local)**
- **You only need ONE link:** `http://localhost:5175` (frontend)
- **Run ONE command:** `npm run dev` (starts both frontend + backend)
- **Two servers run automatically:** Frontend (port 5175) + Backend API (port 3001)

### **Production (Vercel)**
- **One deployed URL:** Your Vercel domain (e.g., `homepage-cloner.vercel.app`)
- **Serverless functions:** API routes handle backend automatically
- **No separate servers needed**

## 🌐 Deploy to Vercel

### **Option 1: Vercel CLI (Recommended)**

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy from project root:**
```bash
cd C:\Users\rehrenreich\CloneSite
vercel
```

3. **Follow the prompts:**
- Project name: `homepage-cloner`
- Framework: `Other`
- Build command: `cd homepage-clone && npm install && npm run build`
- Output directory: `homepage-clone/dist`

### **Option 2: GitHub + Vercel Dashboard**

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Homepage cloner ready for deployment"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. **Connect to Vercel:**
- Go to [vercel.com](https://vercel.com)
- Click "Import Project"
- Select your GitHub repo
- Configure:
  - **Framework Preset:** Other
  - **Root Directory:** `./`
  - **Build Command:** `cd homepage-clone && npm install && npm run build`
  - **Output Directory:** `homepage-clone/dist`

## ⚙️ Vercel Configuration

The project includes:
- ✅ `vercel.json` - Vercel configuration
- ✅ `api/clone.js` - Serverless function for website cloning
- ✅ Optimized build settings

## 🔧 Environment Variables

In Vercel dashboard, add:
- **Name:** `FIRECRAWL_API_KEY`
- **Value:** `fc-0515511a88e4440292549c718ed2821a`

## 🎯 How It Works in Production

### **User Journey:**
1. User visits `your-app.vercel.app`
2. Enters website URL (e.g., "stripe.com")
3. Frontend calls `/api/clone` serverless function
4. Serverless function uses Firecrawl API
5. Results displayed instantly

### **Architecture:**
```
User → Vercel CDN → React App → Serverless Function → Firecrawl API
```

## 📱 Testing Production

### **Local Development:**
```bash
# Test locally first
npm run dev
# Visit: http://localhost:5175
```

### **Production Testing:**
```bash
# Deploy to Vercel
vercel

# Visit your deployed URL
# Test with: stripe.com, github.com, example.com
```

## 🐛 Troubleshooting

### **Build Errors:**
- Ensure all dependencies are in `homepage-clone/package.json`
- Check build command: `cd homepage-clone && npm run build`

### **API Errors:**
- Verify `api/clone.js` is in project root
- Check Firecrawl API key in environment variables

### **CORS Issues:**
- `api/clone.js` includes CORS headers
- No additional CORS configuration needed

## ✅ Production Checklist

- [ ] Vercel account created
- [ ] Project deployed successfully
- [ ] Environment variables configured
- [ ] API endpoint working (`/api/clone`)
- [ ] Frontend loads correctly
- [ ] Website cloning functionality tested

## 🎉 Ready for Production!

Your homepage cloner will be:
- ⚡ **Fast** - Vercel CDN + serverless functions
- 🌍 **Global** - Available worldwide
- 📱 **Responsive** - Works on all devices
- 🔒 **Secure** - HTTPS by default

**Perfect for sharing with users! 🚀**