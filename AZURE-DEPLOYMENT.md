# Azure Deployment Guide - Website Cloner

## Prerequisites

✅ **Microsoft Employee Account** with Azure access  
✅ **Azure CLI** installed ([Download here](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli))  
✅ **Node.js 18+** installed

---

## Deployment Options

### **Option 1: Azure App Service (Recommended)**
Full-stack deployment with backend + frontend in one service.

### **Option 2: Azure Static Web Apps + Functions**
Frontend as static site, backend as serverless functions.

---

## 🔷 Option 1: Azure App Service Deployment

### Step 1: Login to Azure

```powershell
# Login to Azure
az login

# Set your subscription (if you have multiple)
az account list --output table
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### Step 2: Create Resource Group

```powershell
# Create a resource group
az group create --name rg-website-cloner --location eastus
```

### Step 3: Create App Service Plan

```powershell
# Create Linux App Service Plan (Free tier for testing)
az appservice plan create `
  --name plan-website-cloner `
  --resource-group rg-website-cloner `
  --is-linux `
  --sku B1

# For production, use Standard tier:
# --sku S1
```

### Step 4: Create Web App

```powershell
# Create Web App with Node.js 18
az webapp create `
  --name website-cloner-app `
  --resource-group rg-website-cloner `
  --plan plan-website-cloner `
  --runtime "NODE:18-lts"
```

### Step 5: Configure Environment Variables

```powershell
# Set Firecrawl API key
az webapp config appsettings set `
  --name website-cloner-app `
  --resource-group rg-website-cloner `
  --settings FIRECRAWL_API_KEY="your-firecrawl-api-key-here"

# Set Node.js startup command
az webapp config set `
  --name website-cloner-app `
  --resource-group rg-website-cloner `
  --startup-file "node server.js"
```

### Step 6: Build Frontend Locally

```powershell
# Navigate to project root
cd C:\Users\rehrenreich\CloneSite

# Build the frontend
cd homepage-clone
npm install
npm run build
cd ..
```

### Step 7: Deploy to Azure

```powershell
# Option A: Deploy using ZIP file
# Create deployment package
Compress-Archive -Path * -DestinationPath deploy.zip -Force

# Deploy the ZIP
az webapp deployment source config-zip `
  --name website-cloner-app `
  --resource-group rg-website-cloner `
  --src deploy.zip
```

```powershell
# Option B: Deploy using Git (recommended)
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for Azure deployment"

# Get deployment credentials
$credentials = az webapp deployment list-publishing-credentials `
  --name website-cloner-app `
  --resource-group rg-website-cloner | ConvertFrom-Json

# Add Azure remote
git remote add azure $credentials.scmUri

# Push to Azure
git push azure main:master
```

### Step 8: Update server.js for Production

Before deploying, update `server.js` to serve built frontend:

```javascript
// Add this at the top of server.js after express initialization
const path = require('path');

// Serve static files from the built frontend
app.use(express.static(path.join(__dirname, 'homepage-clone/dist')));

// Serve index.html for all routes (SPA support)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next(); // Skip API routes
  }
  res.sendFile(path.join(__dirname, 'homepage-clone/dist/index.html'));
});
```

### Step 9: Verify Deployment

```powershell
# Get app URL
az webapp show `
  --name website-cloner-app `
  --resource-group rg-website-cloner `
  --query "defaultHostName" --output tsv
```

Visit: `https://website-cloner-app.azurewebsites.net`

---

## 🔷 Option 2: Azure Static Web Apps + Functions

### Step 1: Create Static Web App

```powershell
# Install Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Create Static Web App
az staticwebapp create `
  --name website-cloner-static `
  --resource-group rg-website-cloner `
  --source https://github.com/Ronen9/CloneSite `
  --location eastus2 `
  --branch main `
  --app-location "/homepage-clone" `
  --output-location "dist"
```

### Step 2: Convert Backend to Azure Functions

Create `api/clone/function.json`:
```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["post"],
      "route": "clone"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

Create `api/clone/index.js`:
```javascript
const axios = require('axios');

module.exports = async function (context, req) {
    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    
    // Your existing clone.js logic here
    // Return response via context.res
    
    context.res = {
        status: 200,
        body: { success: true, previewHtml: clonedHtml }
    };
};
```

### Step 3: Deploy

```powershell
# Build frontend
cd homepage-clone
npm run build
cd ..

# Deploy via GitHub Actions (auto-configured)
git push origin main
```

---

## 🔧 Configuration Files for Azure

### Update `package.json` (root)

```json
{
  "scripts": {
    "start": "node server.js",
    "build": "cd homepage-clone && npm install && npm run build",
    "postinstall": "cd homepage-clone && npm install"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### Create `web.config` (for Windows App Service)

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <webSocket enabled="false" />
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{PATH_INFO}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="server.js"/>
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

### Create `.deployment`

```ini
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
WEBSITE_NODE_DEFAULT_VERSION=18-lts
```

---

## 📊 Monitoring & Logs

```powershell
# View live logs
az webapp log tail `
  --name website-cloner-app `
  --resource-group rg-website-cloner

# Enable logging
az webapp log config `
  --name website-cloner-app `
  --resource-group rg-website-cloner `
  --application-logging filesystem `
  --level information
```

---

## 🔐 Security Best Practices

1. **Store API Keys in Key Vault**
```powershell
# Create Key Vault
az keyvault create `
  --name kv-website-cloner `
  --resource-group rg-website-cloner `
  --location eastus

# Add secret
az keyvault secret set `
  --vault-name kv-website-cloner `
  --name FirecrawlApiKey `
  --value "your-firecrawl-api-key-here"

# Give App Service access
az webapp identity assign `
  --name website-cloner-app `
  --resource-group rg-website-cloner

# Reference in App Settings
az webapp config appsettings set `
  --name website-cloner-app `
  --resource-group rg-website-cloner `
  --settings FIRECRAWL_API_KEY="@Microsoft.KeyVault(SecretUri=https://kv-website-cloner.vault.azure.net/secrets/FirecrawlApiKey/)"
```

2. **Enable HTTPS Only**
```powershell
az webapp update `
  --name website-cloner-app `
  --resource-group rg-website-cloner `
  --https-only true
```

3. **Configure CORS** (if needed)
```powershell
az webapp cors add `
  --name website-cloner-app `
  --resource-group rg-website-cloner `
  --allowed-origins "https://yourdomain.com"
```

---

## 💰 Cost Estimation

### App Service Plan B1 (Basic)
- **Monthly**: ~$13 USD
- **Includes**: 1.75 GB RAM, 10 GB Storage
- **Best for**: Development/Testing

### App Service Plan S1 (Standard)
- **Monthly**: ~$70 USD
- **Includes**: 1.75 GB RAM, 50 GB Storage, Custom domains, SSL
- **Best for**: Production

### Static Web Apps (Free Tier)
- **Monthly**: $0
- **Includes**: 100 GB bandwidth, 2 custom domains
- **Best for**: Small projects

---

## 🎯 Quick Commands Reference

```powershell
# Restart app
az webapp restart --name website-cloner-app --resource-group rg-website-cloner

# Scale up
az appservice plan update --name plan-website-cloner --resource-group rg-website-cloner --sku S1

# Delete resources
az group delete --name rg-website-cloner --yes
```

---

## 🐛 Troubleshooting

### Issue: App not starting
```powershell
# Check logs
az webapp log tail --name website-cloner-app --resource-group rg-website-cloner

# Verify Node version
az webapp config show --name website-cloner-app --resource-group rg-website-cloner
```

### Issue: API calls failing
- Check CORS settings
- Verify API key in App Settings
- Check Network Security Groups (NSGs)

### Issue: Build failures
```powershell
# Check Kudu logs
https://website-cloner-app.scm.azurewebsites.net/api/logs/docker
```

---

## 📚 Additional Resources

- [Azure App Service Docs](https://learn.microsoft.com/en-us/azure/app-service/)
- [Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/)
- [Microsoft Employee Benefits Portal](https://microsoft.sharepoint.com/sites/benefits)

---

**Need Help?** Contact Azure Support via your Microsoft employee portal.
