// Vercel serverless function for cloning websites
const axios = require('axios');

const firecrawlApiKey = process.env.FIRECRAWL_API_KEY || "fc-0515511a88e4440292549c718ed2821a";

// Direct HTML fetch fallback function
async function directHtmlFetch(url) {
  try {
    console.log(`🔄 Direct fetch: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      timeout: 10000,
      maxRedirects: 5
    });

    let htmlContent = response.data;
    
    if (htmlContent && htmlContent.includes('<html')) {
      const baseUrl = new URL(url).origin;
      
      // Add base tag and enhancements
      htmlContent = htmlContent.replace(
        /<head([^>]*)>/i,
        `<head$1>
        <base href="${baseUrl}/">
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script id="Microsoft_Omnichannel_LCWidget"
          src="https://oc-cdn-public-eur.azureedge.net/livechatwidget/scripts/LiveChatBootstrapper.js"
          data-app-id="35501611-0d9e-4449-a089-15db04dc1540" data-lcw-version="prod"
          data-org-id="28ef5156-a985-ef11-ac1c-7c1e52504374" data-org-url="https://m-28ef5156-a985-ef11-ac1c-7c1e52504374.eu.omnichannelengagementhub.com"></script>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; }
          img { max-width: 100%; height: auto; }
          .container, .wrapper { max-width: 100%; }
        </style>`
      );
      
      // Remove scripts and fix URLs
      htmlContent = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      htmlContent = htmlContent.replace(/src="\/([^"]*?)"/g, `src="${baseUrl}/$1"`);
      htmlContent = htmlContent.replace(/href="\/([^"]*?)"/g, `href="${baseUrl}/$1"`);
      htmlContent = htmlContent.replace(/url\(['"]?\/([^'")\s]*?)['"]?\)/g, `url('${baseUrl}/$1')`);
      
      return { success: true, html: htmlContent };
    }
    
    throw new Error('No valid HTML content found');
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = async function handler(req, res) {
  try {
    // Always set JSON headers and CORS
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    try {
      console.log(`🔄 Cloning: ${url}`);
      // Log Firecrawl request
      console.log('Firecrawl request payload:', {
        url: url,
        formats: ["html"],
        onlyMainContent: false,
        waitFor: 3000,
        screenshot: false,
        includeTags: ["a", "img", "h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "span", "nav", "header", "footer", "section", "article"],
        excludeTags: ["script", "style", "meta", "link"]
      });
      const response = await axios.post(
        "https://api.firecrawl.dev/v0/scrape",
        {
          url: url,
          formats: ["html"],
          onlyMainContent: false,
          waitFor: 3000,
          screenshot: false,
          includeTags: ["a", "img", "h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "span", "nav", "header", "footer", "section", "article"],
          excludeTags: ["script", "style", "meta", "link"]
        },
        {
          headers: {
            Authorization: `Bearer ${firecrawlApiKey}`,
            "Content-Type": "application/json"
          }
        }
      );
      console.log('Firecrawl response:', response.status, response.data);

      // Handle both html and content formats from Firecrawl
      let htmlContent = null;
      if (response.data && response.data.data) {
        if (response.data.data.html) {
          // Clean and enhance the HTML content
          htmlContent = response.data.data.html;
          // Add base tag to handle relative URLs
          const baseUrl = new URL(url).origin;
          htmlContent = htmlContent.replace(
            '<head>',
            `<head>
            <base href="${baseUrl}/">
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script id="Microsoft_Omnichannel_LCWidget"
              src="https://oc-cdn-public-eur.azureedge.net/livechatwidget/scripts/LiveChatBootstrapper.js"
              data-app-id="35501611-0d9e-4449-a089-15db04dc1540" data-lcw-version="prod"
              data-org-id="28ef5156-a985-ef11-ac1c-7c1e52504374" data-org-url="https://m-28ef5156-a985-ef11-ac1c-7c1e52504374.eu.omnichannelengagementhub.com"></script>
            <style>
              * { box-sizing: border-box; }
              body { margin: 0; padding: 0; overflow-x: hidden; }
              img { max-width: 100%; height: auto; }
              .container, .wrapper { max-width: 100%; }
            </style>`
          );
          // Remove potentially problematic scripts
          htmlContent = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
          // Fix relative URLs
          htmlContent = htmlContent.replace(/src="\/([^\"]*?)"/g, `src="${baseUrl}/$1"`);
          htmlContent = htmlContent.replace(/href="\/([^\"]*?)"/g, `href="${baseUrl}/$1"`);
          htmlContent = htmlContent.replace(/url\(\/([^)]*?)\)/g, `url(${baseUrl}/$1)`);
        } else if (response.data.data.content) {
          // Convert markdown content to enhanced HTML
          const content = response.data.data.content;
          const baseUrl = new URL(url).origin;
          htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base href="${baseUrl}/">
    <title>Cloned Website</title>
    <script id="Microsoft_Omnichannel_LCWidget"
      src="https://oc-cdn-public-eur.azureedge.net/livechatwidget/scripts/LiveChatBootstrapper.js"
      data-app-id="35501611-0d9e-4449-a089-15db04dc1540" data-lcw-version="prod"
      data-org-id="28ef5156-a985-ef11-ac1c-7c1e52504374" data-org-url="https://m-28ef5156-a985-ef11-ac1c-7c1e52504374.eu.omnichannelengagementhub.com"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
        line-height: 1.6; 
        color: #333; 
        background: #fff;
        padding: 2rem;
      }
      .container { max-width: 1200px; margin: 0 auto; }
      h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #1e293b; }
      h2 { font-size: 2rem; font-weight: 600; margin: 2rem 0 1rem 0; color: #334155; }
      h3 { font-size: 1.5rem; font-weight: 600; margin: 1.5rem 0 0.75rem 0; color: #475569; }
      p { margin-bottom: 1rem; color: #64748b; font-size: 1.1rem; }
      a { color: #2563eb; text-decoration: none; font-weight: 500; }
      a:hover { color: #1d4ed8; text-decoration: underline; }
      ul, ol { margin: 1rem 0; padding-left: 2rem; color: #64748b; }
      li { margin: 0.5rem 0; }
    </style>
</head>
<body>
    <div class="container">
        ${content
          .replace(/^# (.*$)/gm, '<h1>$1</h1>')
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
        }
    </div>
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
      console.error("❌ Firecrawl failed, trying direct fetch:", error.message, error.stack);
      // Fallback to direct HTML fetch
      try {
        console.log('Attempting directHtmlFetch fallback for:', url);
        const fallbackResult = await directHtmlFetch(url);
        console.log('Fallback result:', fallbackResult);
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
        console.error("❌ Direct fetch also failed:", fallbackError.message, fallbackError.stack);
      }
      // If both methods fail
      res.status(500).json({ 
        error: `Failed to clone website: ${error.message}`,
        url: url
      });
    }
  } catch (err) {
    // Top-level catch for any unexpected error
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};