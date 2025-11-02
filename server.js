const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const { directHtmlFetch } = require('./fallback-scraper');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3003;

const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;

app.use(cors());
app.use(express.json());

// Serve static files from the built frontend (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'homepage-clone/dist')));
}

// Helper: only inject user-provided chat script (no default fallback)
function getChatScriptToInject(userScript) {
  if (userScript && userScript.trim()) {
    const cleaned = userScript.trim().replace(/^['"]|['"]$/g, '');
    console.log('🐛 DEBUG: Using USER PROVIDED chat script snippet:', cleaned.substring(0, 120) + '...');
    return cleaned;
  }
  console.log('ℹ️ INFO: No chat script provided – none will be injected');
  return '';
}
// Clone website endpoint
// Support both legacy "/clone" and preferred REST namespace "/api/clone"
app.post(['/clone', '/api/clone'], async (req, res) => {
  const { url, chatScript } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    console.log(`🔄 Cloning: ${url}`);
    console.log('🐛 DEBUG: Received chatScript:', chatScript ? 'PROVIDED' : 'NULL'); // Debug log
    
    const response = await axios.post(
      "https://api.firecrawl.dev/v0/scrape",
      {
        url: url,
        formats: ["html"],
        onlyMainContent: false,
        waitFor: 3000,
        screenshot: false,
        extractorOptions: {
          mode: "llm-extraction-from-raw-html"
        }
      },
      {
        headers: {
          Authorization: `Bearer ${firecrawlApiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Handle both html and content formats from Firecrawl
    let htmlContent = null;
    if (response.data && response.data.data) {
      if (response.data.data.html) {
        // Clean and enhance the HTML content
        htmlContent = response.data.data.html;
        
        // Add base tag to handle relative URLs and improve CSS loading
        const baseUrl = new URL(url).origin;
        const scriptToInject = getChatScriptToInject(chatScript);
        
        htmlContent = htmlContent.replace(
          '<head>',
          `<head>
          <base href="${baseUrl}/">
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* CORS Font Fallback - Prevent font loading errors */
            @font-face {
              font-family: 'Heebo';
              font-style: normal;
              font-weight: 300 900;
              font-display: swap;
              src: local('Arial'), local('Helvetica'), local('sans-serif');
            }

            /* Universal font fallback for Hebrew and other languages */
            * {
              font-family: 'Heebo', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
                           'Helvetica Neue', Arial, 'Noto Sans', sans-serif,
                           'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
                           'Noto Color Emoji' !important;
            }

            /* Ensure all elements are visible and properly styled */
            * { box-sizing: border-box; }
            body { margin: 0; padding: 0; overflow-x: hidden; }
            img { max-width: 100%; height: auto; }
            /* Fix any broken layouts */
            .container, .wrapper { max-width: 100%; }
          </style>
          ${scriptToInject}`
        );
        
        // Remove any script tags that might cause issues but preserve chat widgets
        htmlContent = htmlContent.replace(/<script\b(?![^>]*(?:chat|widget|omnichannel|livechat|jquery|bootstrap))[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        // Fix relative image and CSS URLs
        htmlContent = htmlContent.replace(/src="\/([^"]*?)"/g, `src="${new URL(url).origin}/$1"`);
        htmlContent = htmlContent.replace(/href="\/([^"]*?)"/g, `href="${new URL(url).origin}/$1"`);
        htmlContent = htmlContent.replace(/url\(\/([^)]*?)\)/g, `url(${new URL(url).origin}/$1)`);
        
      } else if (response.data.data.content) {
        // Convert markdown content to enhanced HTML structure
        const content = response.data.data.content;
        const baseUrl = new URL(url).origin;
        const scriptToInject = getChatScriptToInject(chatScript);
        
        // Enhanced HTML template that looks more like a real website
        htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloned Website</title>
    ${scriptToInject}
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; 
        line-height: 1.6; 
        color: #333; 
        background: #fff;
      }
      .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
      
      /* Header Styles */
      header { background: #fff; border-bottom: 1px solid #e1e5e9; padding: 1rem 0; }
      .header-content { display: flex; justify-content: space-between; align-items: center; }
      .logo { font-size: 1.5rem; font-weight: bold; color: #2563eb; }
      nav { display: flex; gap: 2rem; }
      nav a { color: #64748b; text-decoration: none; font-weight: 500; }
      nav a:hover { color: #2563eb; }
      
      /* Main Content */
      main { padding: 3rem 0; }
      
      /* Typography */
      h1 { 
        font-size: 3rem; 
        font-weight: 700; 
        margin-bottom: 1.5rem; 
        color: #1e293b;
        line-height: 1.2;
      }
      h2 { 
        font-size: 2rem; 
        font-weight: 600; 
        margin: 2rem 0 1rem 0; 
        color: #334155;
      }
      h3 { 
        font-size: 1.5rem; 
        font-weight: 600; 
        margin: 1.5rem 0 0.75rem 0; 
        color: #475569;
      }
      
      p { 
        margin-bottom: 1.25rem; 
        color: #64748b; 
        font-size: 1.1rem;
      }
      
      /* Links */
      a { 
        color: #2563eb; 
        text-decoration: none; 
        font-weight: 500;
        transition: color 0.2s;
      }
      a:hover { 
        color: #1d4ed8; 
        text-decoration: underline; 
      }
      
      /* Lists */
      ul, ol { 
        margin: 1rem 0; 
        padding-left: 2rem; 
        color: #64748b;
      }
      li { 
        margin: 0.5rem 0; 
        line-height: 1.6;
      }
      
      /* Buttons/CTA Style */
      .cta-button {
        display: inline-block;
        background: #2563eb;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        text-decoration: none;
        margin: 1rem 0;
        transition: background-color 0.2s;
      }
      .cta-button:hover {
        background: #1d4ed8;
        color: white;
      }
      
      /* Sections */
      .hero { 
        text-align: center; 
        padding: 4rem 0; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        margin-bottom: 3rem;
      }
      .hero h1 { color: white; }
      .hero p { color: rgba(255,255,255,0.9); }
      
      .content-section { 
        margin: 3rem 0; 
        padding: 2rem 0;
      }
      
      .grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
        gap: 2rem; 
        margin: 2rem 0;
      }
      
      .card {
        background: #f8fafc;
        padding: 2rem;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
      }
      
      /* Footer */
      footer { 
        background: #1e293b; 
        color: white; 
        padding: 2rem 0; 
        margin-top: 4rem;
        text-align: center;
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        h1 { font-size: 2rem; }
        .container { padding: 0 1rem; }
        nav { gap: 1rem; }
      }
    </style>
</head>
<body>
    <header>
      <div class="container">
        <div class="header-content">
          <div class="logo">Cloned Website</div>
          <nav>
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </div>
    </header>
    
    <main>
      <div class="container">
        <div class="content">
          ${content
            .replace(/^# (.*$)/gm, '<div class="hero"><h1>$1</h1></div>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(?!<[h|div])/, '<p>')
            .replace(/(?<!>)$/, '</p>')
            .replace(/<p><\/p>/g, '')
            .replace(/<p>(<h[1-6]>)/g, '$1')
            .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
            .replace(/<p>(<div)/g, '$1')
            .replace(/(<\/div>)<\/p>/g, '$1')
          }
        </div>
      </div>
    </main>
    
    <footer>
      <div class="container">
        <p>&copy; 2024 Cloned Website. All rights reserved.</p>
      </div>
    </footer>
</body>
</html>`;
      }
    }

    if (htmlContent) {
      res.json({
        success: true,
        url: url,
        size: `${(htmlContent.length / 1024).toFixed(2)} KB`,
        status: "Successfully cloned",
        previewHtml: htmlContent,
        html: htmlContent
      });
      console.log(`✅ Successfully cloned: ${url}`);
      return;
    } else {
      throw new Error("No HTML content received from Firecrawl API");
    }

  } catch (error) {
    console.error("❌ Firecrawl HTML failed:", error.message);
  }
  
  // STEP 2: Try direct HTML fetch
  try {
    console.log('🔄 Attempting direct HTML fetch fallback...');
    const fallbackResult = await directHtmlFetch(url, chatScript);
    
    if (fallbackResult.success) {
      res.json({
        success: true,
        url: url,
        size: `${(fallbackResult.html.length / 1024).toFixed(2)} KB`,
        status: "Successfully cloned (direct fetch)",
        previewHtml: fallbackResult.html,
        html: fallbackResult.html
      });
      console.log(`✅ Successfully cloned via direct fetch: ${url}`);
      return;
    }
  } catch (fallbackError) {
    console.error("❌ Direct fetch also failed:", fallbackError.message);
  }
  
  // All methods failed
  res.status(500).json({ 
    error: `Failed to clone website. Firecrawl HTML scraping and direct fetch both failed.`,
    url: url
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Voice session endpoint - Generate ephemeral keys for Azure OpenAI
app.post('/api/voice-session', async (req, res) => {
  try {
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

    if (!apiKey || !endpoint || !deployment) {
      console.error('Missing environment variables:', {
        hasApiKey: !!apiKey,
        hasEndpoint: !!endpoint,
        hasDeployment: !!deployment
      });
      return res.status(500).json({ error: 'Server configuration error. Missing required environment variables.' });
    }

    const { voice = 'coral', temperature = 0.7, instructions = '' } = req.body;

    // Validate voice
    const validVoices = ['alloy', 'echo', 'shimmer', 'ash', 'ballad', 'coral', 'sage', 'verse'];
    if (!validVoices.includes(voice)) {
      return res.status(400).json({ error: `Invalid voice. Must be one of: ${validVoices.join(', ')}` });
    }

    if (temperature < 0 || temperature > 1) {
      return res.status(400).json({ error: 'Invalid temperature. Must be between 0 and 1.' });
    }

    const sessionUrl = `${endpoint}/openai/realtimeapi/sessions?api-version=2025-04-01-preview`;

    const sessionResponse = await axios.post(sessionUrl, {
      model: deployment,
      voice: voice
    }, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!sessionResponse.data) {
      return res.status(500).json({ error: 'Failed to create voice session' });
    }

    const sessionId = sessionResponse.data.id;
    const ephemeralKey = sessionResponse.data.client_secret?.value;

    if (!sessionId || !ephemeralKey) {
      console.error('Invalid session response:', sessionResponse.data);
      return res.status(500).json({ error: 'Failed to extract session credentials from Azure response' });
    }

    // Determine WebRTC region
    let region = process.env.AZURE_OPENAI_REGION || 'eastus2';

    if (!process.env.AZURE_OPENAI_REGION) {
      try {
        const endpointUrl = new URL(endpoint);
        const resourceName = endpointUrl.hostname.split('.')[0];

        const regionMapping = {
          'sweden': 'swedencentral',
          'us': 'eastus',
          'east': 'eastus',
          'west': 'westus',
          'europe': 'westeurope',
          'uk': 'uksouth',
          'australia': 'australiaeast',
          'canada': 'canadaeast',
          'france': 'francecentral',
          'japan': 'japaneast',
          'korea': 'koreacentral'
        };

        for (const [key, value] of Object.entries(regionMapping)) {
          if (resourceName.toLowerCase().includes(key)) {
            region = value;
            console.log(`Detected region '${region}' from resource name '${resourceName}'`);
            break;
          }
        }

        const azureResource = process.env.AZURE_OPENAI_RESOURCE;
        if (azureResource) {
          for (const [key, value] of Object.entries(regionMapping)) {
            if (azureResource.toLowerCase().includes(key)) {
              region = value;
              console.log(`Detected region '${region}' from AZURE_OPENAI_RESOURCE '${azureResource}'`);
              break;
            }
          }
        }
      } catch (e) {
        console.warn('Could not parse Azure endpoint for region detection, using default:', region);
      }
    }

    const webrtcEndpoint = `https://${region}.realtimeapi-preview.ai.azure.com/v1/realtimertc`;
    console.log('=== Voice Session Debug Info ===');
    console.log(`WebRTC endpoint: ${webrtcEndpoint}`);
    console.log(`Deployment: ${deployment}`);
    console.log(`Azure endpoint: ${endpoint}`);
    console.log(`Region: ${region}`);
    console.log(`Session ID: ${sessionId}`);
    console.log('================================');

    // Define the transfer_to_chat function tool for the frontend to use
    const tools = [
      {
        type: "function",
        name: "transfer_to_chat",
        description: "Call this function when the user explicitly requests to speak with a human agent, live representative, or real person. This transfers them to the chat widget where they can connect with a live agent.",
        parameters: {
          type: "object",
          properties: {
            reason: {
              type: "string",
              description: "Brief reason why user wants human assistance (optional, 1-2 sentences)"
            }
          },
          required: []
        }
      }
    ];

    // Define enhanced instructions for escalation handling
    const enhancedInstructions = `You are a helpful voice assistant for customer support.

Key guidelines:
- Assist customers professionally and courteously
- If customer requests to speak with a human agent, live representative, or real person, immediately call the transfer_to_chat function
- Common escalation phrases: "human", "agent", "representative", "real person", "live help"
- Acknowledge their request: "I'll transfer you to a human agent right away"

Always be polite and helpful.`;

    res.json({
      success: true,
      sessionId: sessionId,
      ephemeralKey: ephemeralKey,
      deployment: deployment,
      endpoint: webrtcEndpoint,
      region: region,
      azureEndpoint: endpoint,
      tools: tools,
      instructions: enhancedInstructions
    });
  } catch (error) {
    console.error('Voice session error:', error.message);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Firecrawl credits endpoint
app.get('/api/firecrawl-credits', async (req, res) => {
  try {
    const apiKey = process.env.FIRECRAWL_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing FIRECRAWL_API_KEY' });
    }

    const response = await axios.get('https://api.firecrawl.dev/v2/team/credit-usage', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const data = response.data;
    const remaining = data.data?.remainingCredits || 0;
    const planCredits = data.data?.planCredits || 0;
    const billingPeriodEnd = data.data?.billingPeriodEnd;

    res.json({
      success: true,
      remainingCredits: remaining,
      planCredits: planCredits,
      billingPeriodEnd: billingPeriodEnd,
      usage: {
        used: planCredits - remaining,
        percentage: planCredits > 0 ? Math.round(((planCredits - remaining) / planCredits) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Credits fetch error:', error.message);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Firecrawl scrape/crawl endpoint
app.post('/api/firecrawl-scrape', async (req, res) => {
  try {
    const apiKey = process.env.FIRECRAWL_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing FIRECRAWL_API_KEY' });
    }

    const { url, type = 'scrape', maxPages = 1 } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (type === 'scrape') {
      const response = await axios.post('https://api.firecrawl.dev/v1/scrape', {
        url: url,
        formats: ['markdown'],
        onlyMainContent: true
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      let content = '';
      if (response.data.data && response.data.data.markdown) {
        content = response.data.data.markdown;
      } else if (response.data.markdown) {
        content = response.data.markdown;
      } else {
        return res.status(500).json({ error: 'No content extracted' });
      }

      return res.json({
        success: true,
        content: content,
        pageCount: 1,
        creditsUsed: 1,
        type: 'scrape'
      });
    }

    if (type === 'crawl') {
      // Start the crawl with specified page limit
      const crawlResponse = await axios.post('https://api.firecrawl.dev/v1/crawl', {
        url: url,
        limit: maxPages,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const jobId = crawlResponse.data.id;

      if (!jobId) {
        return res.status(500).json({ error: 'No job ID returned from crawl request' });
      }

      // Poll for completion (max 60 attempts = 5 minutes)
      let attempts = 0;
      const maxAttempts = 60;

      const checkStatus = async () => {
        attempts++;

        const statusResponse = await axios.get(`https://api.firecrawl.dev/v1/crawl/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });

        const statusData = statusResponse.data;

        if (statusData.status === 'completed') {
          // Extract all content
          let allContent = '';
          let pageCount = 0;

          if (statusData.data && Array.isArray(statusData.data)) {
            pageCount = statusData.data.length;
            statusData.data.forEach((page, index) => {
              if (page.markdown) {
                allContent += `\n\n--- PAGE ${index + 1}: ${page.metadata?.sourceURL || page.url || 'Unknown URL'} ---\n\n`;
                allContent += page.markdown;
              }
            });
          }

          if (!allContent) {
            throw new Error('No content extracted from crawled pages');
          }

          return res.json({
            success: true,
            content: allContent,
            pageCount: pageCount,
            creditsUsed: pageCount,
            type: 'crawl'
          });

        } else if (statusData.status === 'failed') {
          throw new Error('Crawl job failed: ' + (statusData.error || 'Unknown error'));
        } else {
          // Still in progress
          if (attempts < maxAttempts) {
            // Wait 5 seconds and check again
            await new Promise(resolve => setTimeout(resolve, 5000));
            return checkStatus();
          } else {
            throw new Error('Crawl took too long (timeout after 5 minutes)');
          }
        }
      };

      // Start polling
      return await checkStatus();
    }

    res.status(400).json({ error: 'Type must be "scrape" or "crawl"' });
  } catch (error) {
    console.error('Scrape error:', error.message);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Serve index.html for all other routes (SPA support for production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'homepage-clone/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Clone API server running on http://localhost:${PORT}`);
  console.log(`📡 Firecrawl API Key: ${firecrawlApiKey.substring(0, 10)}...`);
});