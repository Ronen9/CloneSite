const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { directHtmlFetch } = require('./fallback-scraper');

const app = express();
const PORT = 3003;

const firecrawlApiKey = "fc-0515511a88e4440292549c718ed2821a";

app.use(cors());
app.use(express.json());

// Clone website endpoint
app.post('/clone', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    console.log(`🔄 Cloning: ${url}`);
    
    const response = await axios.post(
      "https://api.firecrawl.dev/v0/scrape",
      {
        url: url,
        formats: ["html"],
        onlyMainContent: false,
        includeHtml: true,
        waitFor: 5000,
        screenshot: false,
        removeBase64Images: false
      },
      {
        headers: {
          Authorization: `Bearer ${firecrawlApiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

        // Handle both html and content formats from Firecrawl
    let htmlContent = null;
    if (response.data && response.data.data) {
      if (response.data.data.html) {
        // Clean and enhance the HTML content while preserving original styling
        htmlContent = response.data.data.html;
        
        // Add base tag to handle relative URLs but preserve original head structure
        const baseUrl = new URL(url).origin;
        
        if (!htmlContent.includes('<base')) {
          htmlContent = htmlContent.replace(
            /<head([^>]*)>/i,
            `<head$1>
            <base href="${baseUrl}/">
            <script id="Microsoft_Omnichannel_LCWidget"
              src="https://oc-cdn-public-eur.azureedge.net/livechatwidget/scripts/LiveChatBootstrapper.js"
              data-app-id="35501611-0d9e-4449-a089-15db04dc1540" data-lcw-version="prod"
              data-org-id="28ef5156-a985-ef11-ac1c-7c1e52504374" data-org-url="https://m-28ef5156-a985-ef11-ac1c-7c1e52504374.eu.omnichannelengagementhub.com"></script>`
          );
        }
        
        // Fix all types of relative URLs while keeping the original structure
        htmlContent = htmlContent.replace(/src="\/([^"]*?)"/g, `src="${baseUrl}/$1"`);
        htmlContent = htmlContent.replace(/href="\/([^"]*?)"/g, `href="${baseUrl}/$1"`);
        htmlContent = htmlContent.replace(/url\(\s*['"]?\/([^'")]+)['"]?\s*\)/g, `url("${baseUrl}/$1")`);
        htmlContent = htmlContent.replace(/srcset="([^"]*)"/g, (match, srcset) => {
          const fixedSrcset = srcset.replace(/\/([^,\s]+)/g, `${baseUrl}/$1`);
          return `srcset="${fixedSrcset}"`;
        });
        htmlContent = htmlContent.replace(/data-src="\/([^"]*?)"/g, `data-src="${baseUrl}/$1"`);
        
        // Only remove potentially problematic external scripts but keep CSS and inline styles
        htmlContent = htmlContent.replace(/<script\b[^>]*?\bsrc\s*=\s*[^>]*?><\/script>/gi, '');
        htmlContent = htmlContent.replace(/<script\b[^>]*?>\s*(?:(?!<\/script>)[\s\S])*?\b(?:fetch|XMLHttpRequest|window\.location|document\.location)\b[\s\S]*?<\/script>/gi, '');
        
      } else if (response.data.data.content) {"${baseUrl}/">
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script id="Microsoft_Omnichannel_LCWidget"
          src="https://oc-cdn-public-eur.azureedge.net/livechatwidget/scripts/LiveChatBootstrapper.js"
          data-app-id="35501611-0d9e-4449-a089-15db04dc1540" data-lcw-version="prod"
          data-org-id="28ef5156-a985-ef11-ac1c-7c1e52504374" data-org-url="https://m-28ef5156-a985-ef11-ac1c-7c1e52504374.eu.omnichannelengagementhub.com"></script>`
      );
      
      // Fix all types of URLs while preserving original styling
      // Fix relative URLs that start with /
      htmlContent = htmlContent.replace(/src="\/([^"]*?)"/g, `src="${baseUrl}/$1"`);
      htmlContent = htmlContent.replace(/href="\/([^"]*?)"/g, `href="${baseUrl}/$1"`);
      
      // Fix CSS url() references
      htmlContent = htmlContent.replace(/url\(\s*['"]?\/([^'")]+)['"]?\s*\)/g, `url("${baseUrl}/$1")`);
      
      // Fix srcset attributes for responsive images
      htmlContent = htmlContent.replace(/srcset="([^"]*)"/g, (match, srcset) => {
        const fixedSrcset = srcset.replace(/\/([^,\s]+)/g, `${baseUrl}/$1`);
        return `srcset="${fixedSrcset}"`;
      });
      
      // Fix data-src and other lazy loading attributes
      htmlContent = htmlContent.replace(/data-src="\/([^"]*?)"/g, `data-src="${baseUrl}/$1"`);
      
      // Remove only problematic scripts but keep inline CSS and styles
      htmlContent = htmlContent.replace(/<script\b[^>]*?\bsrc\s*=\s*[^>]*?><\/script>/gi, '');
      htmlContent = htmlContent.replace(/<script\b[^>]*?>\s*(?:(?!<\/script>)[\s\S])*?\bfetch\b[\s\S]*?<\/script>/gi, '');
      htmlContent = htmlContent.replace(/<script\b[^>]*?>\s*(?:(?!<\/script>)[\s\S])*?\bXMLHttpRequest\b[\s\S]*?<\/script>/gi, '');
      
      return { success: true, html: htmlContent };
    }
    
    throw new Error('No valid HTML content found');
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}`
        );
        
        // Remove any script tags that might cause issues
        htmlContent = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        // Fix relative image and CSS URLs
        htmlContent = htmlContent.replace(/src="\/([^"]*?)"/g, `src="${new URL(url).origin}/$1"`);
        htmlContent = htmlContent.replace(/href="\/([^"]*?)"/g, `href="${new URL(url).origin}/$1"`);
        htmlContent = htmlContent.replace(/url\(\/([^)]*?)\)/g, `url(${new URL(url).origin}/$1)`);
        
      } else if (response.data.data.content) {
        // Convert markdown content to enhanced HTML structure
        const content = response.data.data.content;
        
        // Enhanced HTML template that looks more like a real website
        htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloned Website</title>
    <script id="Microsoft_Omnichannel_LCWidget"
      src="https://oc-cdn-public-eur.azureedge.net/livechatwidget/scripts/LiveChatBootstrapper.js"
      data-app-id="35501611-0d9e-4449-a089-15db04dc1540" data-lcw-version="prod"
      data-org-id="28ef5156-a985-ef11-ac1c-7c1e52504374" data-org-url="https://m-28ef5156-a985-ef11-ac1c-7c1e52504374.eu.omnichannelengagementhub.com"></script>
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
    } else {
      throw new Error("No HTML content received from Firecrawl API");
    }

  } catch (error) {
    console.error("❌ Firecrawl failed, trying direct fetch:", error.message);
    
    // Fallback to direct HTML fetch
    try {
      const fallbackResult = await directHtmlFetch(url);
      
      if (fallbackResult.success) {
        res.json({
          success: true,
          url: url,
          size: `${(fallbackResult.html.length / 1024).toFixed(2)} KB`,
          status: "Successfully cloned (direct fetch)",
          previewHtml: fallbackResult.html,
          html: fallbackResult.html,
          method: fallbackResult.method
        });
        console.log(`✅ Successfully cloned via direct fetch: ${url}`);
        return;
      }
    } catch (fallbackError) {
      console.error("❌ Direct fetch also failed:", fallbackError.message);
    }
    
    // If both methods fail
    res.status(500).json({ 
      error: `Failed to clone website: ${error.message}`,
      url: url
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Clone API server running on http://localhost:${PORT}`);
  console.log(`📡 Firecrawl API Key: ${firecrawlApiKey.substring(0, 10)}...`);
});