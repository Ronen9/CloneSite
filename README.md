# 🌐 CloneSite - Website Cloner with AI Voice Assistant

A modern website cloning tool with an integrated AI voice assistant powered by Azure OpenAI. Clone any website and interact with it using a Hebrew-speaking AI assistant named "Beti".

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![React](https://img.shields.io/badge/React-19-blue)

---

## 📋 Table of Contents

1. [Features](#-features)
2. [Quick Start Guide](#-quick-start-guide-for-beginners)
3. [Getting Your API Keys](#-getting-your-api-keys)
4. [Installation Steps](#-installation-steps)
5. [How to Use](#-how-to-use)
6. [Troubleshooting](#-troubleshooting)
7. [Tech Stack](#-tech-stack)

---

## ✨ Features

- 🎯 **Website Cloning** - Clone and display any public website
- 🎤 **AI Voice Assistant** - Hebrew-speaking AI assistant "Beti" powered by Azure OpenAI
- 💬 **Real-time Voice Chat** - Talk naturally with WebRTC audio
- 🔄 **Human Handoff** - Seamlessly transfer conversations to Microsoft Omnichannel chat
- 🌐 **Web Scraping** - Automatically crawl websites to build AI knowledge base
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔒 **Secure Authentication** - Microsoft OAuth integration via Clerk
- 👥 **User Management** - Control access with email-based authentication
- 🤖 **Multiple Bot Personalities** - Switch between different AI assistants (Beti, Sales Pro, Tech Support, Friendly Assistant)

---

## 🚀 Quick Start Guide (For Beginners)

### Step 1: Download the Project

1. **Click the green "Code" button** at the top of this page
2. **Select "Download ZIP"**
3. **Extract the ZIP file** to a folder on your computer (e.g., `C:\Projects\CloneSite`)

### Step 2: Install Node.js

**What is Node.js?** It's the software that runs this project.

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS version** (recommended for most users)
3. Run the installer and click "Next" through all steps
4. To verify installation, open **Command Prompt** (Windows) or **Terminal** (Mac) and type:
   ```bash
   node --version
   ```
   You should see something like `v18.0.0` or higher

### Step 3: Get Your API Keys

You need **4 API keys** to use all features:

#### 🔑 **0. Clerk Publishable Key** (For authentication)

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a **free account**
3. Create a new application
4. Go to **API Keys** in the dashboard
5. Copy your **Publishable Key** (starts with `pk_test_`)
6. **Enable Microsoft OAuth**: Go to **User & Authentication** → **Social Connections** → Enable **Microsoft**
7. **Save the key** - you'll need it in Step 4
8. For detailed setup, see [CLERK_SETUP.md](CLERK_SETUP.md)

#### 🔑 **1. Firecrawl API Key** (For website cloning)

1. Go to [https://firecrawl.dev](https://firecrawl.dev)
2. Click **"Sign Up"** or **"Get Started"**
3. Create a free account
4. Go to your **Dashboard**
5. Copy your **API Key** (starts with `fc-`)
6. **Save it somewhere safe** - you'll need it in Step 4

#### 🔑 **2. Azure OpenAI API Key** (For voice assistant)

1. Go to [https://portal.azure.com](https://portal.azure.com)
2. Sign in or create a Microsoft Azure account
3. Search for **"Azure OpenAI"** in the top search bar
4. Click **"Create"** to create a new Azure OpenAI resource
5. Fill in the required information and click **"Review + Create"**
6. Once created, go to **"Keys and Endpoint"** in the left menu
7. Copy **Key 1** (this is your API key)
8. Also copy the **Endpoint URL** (looks like `https://YOUR-RESOURCE.openai.azure.com/`)
9. **Save both** - you'll need them in Step 4

#### 🔑 **3. Azure OpenAI Deployment Name** (For voice model)

1. In your Azure OpenAI resource, click **"Model deployments"**
2. Click **"Create new deployment"**
3. Select model: **gpt-4o-realtime-preview**
4. Give it a name (e.g., `gpt-4o-realtime`)
5. Click **"Create"**
6. **Save the deployment name** - you'll need it in Step 4

---

## 📝 Installation Steps

### Step 4: Set Up Your Environment File

1. **Open the project folder** you extracted in Step 1
2. **Find the file called `.env.example`** (if it doesn't exist, create a new file)
3. **Create a new file** in the same folder called `.env` (without "example")
4. **Open `.env` with Notepad** (right-click → Open with → Notepad)
5. **Copy and paste** this template:

```bash
# Clerk Authentication (for user login)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-key-here

# Firecrawl API Key (for website cloning)
FIRECRAWL_API_KEY=your-firecrawl-key-here

# Azure OpenAI Settings (for voice assistant)
AZURE_OPENAI_API_KEY=your-azure-openai-key-here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o-realtime
AZURE_OPENAI_RESOURCE=your-resource-name-here
```

6. **Replace the placeholder values** with your actual API keys:
   - Replace `pk_test_your-clerk-key-here` with your Clerk publishable key from Step 3
   - Replace `your-firecrawl-key-here` with your Firecrawl API key from Step 3
   - Replace `your-azure-openai-key-here` with your Azure OpenAI API key from Step 3
   - Replace `https://your-resource.openai.azure.com/` with your Azure endpoint from Step 3
   - Replace `gpt-4o-realtime` with your deployment name from Step 3 (if different)
   - Replace `your-resource-name-here` with your Azure resource name (e.g., `my-openai`)

7. **Save the file** and close Notepad

**Example of what it should look like:**
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_abc123def456ghi789
FIRECRAWL_API_KEY=fc-abc123def456ghi789
AZURE_OPENAI_API_KEY=1234567890abcdef1234567890abcdef
AZURE_OPENAI_ENDPOINT=https://my-openai.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o-realtime
AZURE_OPENAI_RESOURCE=my-openai
```

### Step 5: Install Project Dependencies

1. **Open Command Prompt** (Windows) or **Terminal** (Mac)
2. **Navigate to your project folder:**
   ```bash
   cd C:\Projects\CloneSite
   ```
   *(Replace with your actual folder path)*

3. **Install the required packages:**
   ```bash
   npm install
   ```
   This will take 2-5 minutes. You'll see lots of text - this is normal!

### Step 6: Start the Application

1. **In the same Command Prompt/Terminal, type:**
   ```bash
   npm run dev
   ```

2. **Wait for these messages:**
   ```
   🚀 Clone API server running on http://localhost:3003
   ➜  Local:   http://localhost:5173/
   ```

3. **Open your web browser** and go to:
   ```
   http://localhost:5173
   ```

**🎉 Congratulations! The app is now running!**

---

## 🎯 How to Use

### Cloning a Website

1. **Enter a website URL** in the input field (e.g., `www.apple.com`)
2. *(Optional)* Click **"Expand"** to add a **chat widget script** from Microsoft Omnichannel
   - The chat script field is collapsed by default to keep the interface clean
   - Click the expand button next to "Chat Widget Script (Optional)" to reveal it
   - Paste your Omnichannel chat widget code if you have one
3. **Click "Clone Website"**
4. Wait 5-15 seconds while the website loads
5. The cloned website will appear in **full screen**

### Using the Voice Assistant "Beti"

Once a website is cloned, you'll see a **floating voice assistant panel** on the right side:

#### Starting a Conversation

1. **Click the microphone button** to start talking
2. **Speak in Hebrew or English** - Beti will understand both
3. **Wait for Beti's response** - she'll speak back to you
4. The conversation **transcript appears below**

#### Crawling Website Content

Want Beti to know about the cloned website?

1. Find the **"Knowledge Base"** section in the settings (gear icon ⚙️)
2. **Enter the website URL** (same one you cloned)
3. **Select crawl type:**
   - **Quick Scrape** - 1 page only (fast)
   - **Crawl** - Multiple pages (2, 5, 10, or 20 pages)
4. **Click "Crawl Website"**
5. Wait for completion - the content will be **added to Beti's knowledge**

#### Transferring to a Human Agent

**Important:** Beti will **never transfer you automatically**. She only transfers when you explicitly request it.

To request a transfer:

1. **Say in Hebrew:** "אני רוצה לדבר עם נציג אנושי" (I want to speak with a human representative)
2. **Or say in English:** "I need to speak with a human agent"
3. Beti will say goodbye and **automatically transfer you** to the chat widget

**Note:** If Beti doesn't know something, she will tell you she doesn't know, but she won't suggest transferring you to a human on her own. You must ask for the transfer yourself.

#### Adjusting Settings

Click the **⚙️ gear icon** to access:

- **Voice Settings** - Change Beti's voice
- **Temperature** - Adjust AI creativity (0.0 = precise, 1.0 = creative)
- **Language** - Hebrew, English, or Auto-detect
- **Strict Mode** - Force Beti to only use knowledge base information
- **Knowledge Base Editor** - View and edit what Beti knows

---

## 🐛 Troubleshooting

### "API key is missing" error

**Fix:** Make sure your `.env` file exists in the **root folder** (not inside `homepage-clone`) and contains all three API keys.

### Website shows a white screen after cloning

**Possible causes:**
1. The website uses heavy JavaScript that doesn't work in iframes
2. The website blocks iframe embedding for security

**Try these websites instead:**
- `www.clalit.co.il`
- `www.telefonica.com`
- `www.github.com`

### Voice assistant doesn't respond

**Check:**
1. Your **microphone is enabled** in browser settings
2. Your **Azure OpenAI API key** is correct in `.env`
3. Your Azure OpenAI deployment uses **gpt-4o-realtime-preview** model
4. Your browser **supports WebRTC** (Chrome, Edge, Firefox recommended)

### "Port already in use" error

**Fix:**
1. Close the Command Prompt/Terminal
2. Open **Task Manager** (Ctrl+Shift+Esc on Windows)
3. Find any **Node.js** processes and **End Task**
4. Try `npm run dev` again

### Can't hear Beti speaking

**Check:**
1. Your **speakers/headphones** are working
2. The browser has **audio permission** granted
3. The **volume slider** in Beti's panel isn't muted
4. Try refreshing the page and starting a new session

---

## 🛠️ Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS 4
- Framer Motion (animations)
- shadcn/ui components

**Backend:**
- Node.js 18+
- Express.js
- Vercel Serverless Functions

**AI & Voice:**
- Azure OpenAI Realtime API (gpt-4o-realtime-preview)
- WebRTC for audio

**Web Scraping:**
- Firecrawl API

**Deployment:**
- Vercel

---

## 📦 Project Structure

```
CloneSite/
├── .env                          # ⚠️ YOUR API KEYS GO HERE
├── package.json                  # Backend dependencies
├── server.js                     # Development server
├── fallback-scraper.js          # Direct HTML fetching
├── vercel.json                  # Vercel deployment config
├── api/                         # Vercel serverless functions
│   ├── clone.js                 # Website cloning endpoint
│   ├── voice-session.js        # Azure OpenAI voice endpoint
│   ├── firecrawl-scrape.js     # Firecrawl scraping endpoint
│   └── firecrawl-credits.js    # Check Firecrawl credits
└── homepage-clone/              # React frontend
    ├── src/
    │   ├── App.tsx              # Main app component
    │   ├── components/
    │   │   ├── VoiceBotSideCard.tsx    # Voice assistant UI
    │   │   └── ui/              # shadcn/ui components
    │   └── hooks/
    │       └── useOmnichannelWidget.ts  # Chat widget integration
    └── package.json             # Frontend dependencies
```

---

## 🚀 Deploying to Vercel

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up or log in with GitHub
3. Click **"New Project"**
4. Click **"Import Git Repository"**
5. Select your GitHub repository (or upload this folder)
6. Vercel will **auto-detect settings**
7. Add your **environment variables** in the settings:
   - `FIRECRAWL_API_KEY`
   - `AZURE_OPENAI_API_KEY`
   - `AZURE_OPENAI_ENDPOINT`
   - `AZURE_OPENAI_DEPLOYMENT`
   - `AZURE_OPENAI_RESOURCE`
8. Click **"Deploy"**

### Option 2: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

Follow the prompts and add environment variables when asked.

---

## 📞 Support & Contributing

### Need Help?

- Open an **Issue** on GitHub
- Check the **Troubleshooting** section above

### Want to Contribute?

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Firecrawl** - Website scraping API
- **Azure OpenAI** - Realtime voice AI
- **Microsoft Omnichannel** - Chat widget integration
- **React** - Frontend framework
- **Vercel** - Hosting platform

---

**Made with ❤️ for seamless AI-powered customer support**

*Last updated: November 20, 2025*
