// Vercel serverless function for cloning websites
const axios = require('axios');

const firecrawlApiKey = process.env.FIRECRAWL_API_KEY || "fc-0515511a88e4440292549c718ed2821a";

// Helper: only inject a chat script if user provided one (no default anymore)
function getChatScriptToInject(userScript) {
  if (userScript && userScript.trim()) {
    const cleaned = userScript.trim().replace(/^['"]|['"]$/g, '');
    console.log('🐛 DEBUG: Using user-provided chat script snippet:', cleaned.substring(0, 120) + '...');
    return cleaned;
  }
  console.log('ℹ️ INFO: No user chat script supplied – skipping chat widget injection');
  return '';
}

// Direct HTML fetch fallback function
async function directHtmlFetch(url, chatScript) {
  try {
    console.log(`🔄 Direct fetch: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,tr;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000,
      maxRedirects: 5
    });

    let htmlContent = response.data;
    
    if (htmlContent && htmlContent.includes('<html')) {
      const baseUrl = new URL(url).origin;
      const scriptToInject = getChatScriptToInject(chatScript);
      
      // Add base tag and enhancements
      htmlContent = htmlContent.replace(
        /<head([^>]*)>/i,
        `<head$1>
        <base href="${baseUrl}/">
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${scriptToInject}
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; }
          img { max-width: 100%; height: auto; }
          .container, .wrapper { max-width: 100%; }
        </style>`
      );
      
      // Remove potentially problematic scripts but preserve chat widgets and essential scripts
      htmlContent = htmlContent.replace(/<script\b(?![^>]*(?:chat|widget|omnichannel|livechat|jquery|bootstrap|cdn|font|css))[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
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

    const { url, chatScript } = req.body;

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
        includeHtml: true,
        includeRawHtml: true,
        includeTags: ["a", "img", "h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "span", "nav", "header", "footer", "section", "article", "body", "main"],
        excludeTags: ["script", "noscript", "style"]
      });
      const response = await axios.post(
        "https://api.firecrawl.dev/v0/scrape",
        {
          url: url,
          formats: ["html"],
          onlyMainContent: false,
          waitFor: 3000,
          screenshot: false,
          includeHtml: true,
          includeRawHtml: true,
          includeTags: ["a", "img", "h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "span", "nav", "header", "footer", "section", "article", "body", "main"],
          excludeTags: ["script", "noscript", "style"]
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
          const scriptToInject = getChatScriptToInject(chatScript);
          
          console.log('🐛 DEBUG: Script to inject:', scriptToInject.substring(0, 200) + '...');
          console.log('🐛 DEBUG: HTML content length before injection:', htmlContent.length);
          
          // First, remove potentially problematic scripts but preserve chat widgets and essential scripts
          console.log('🐛 DEBUG: HTML content length before script removal:', htmlContent.length);
          htmlContent = htmlContent.replace(/<script\b(?![^>]*(?:chat|widget|omnichannel|livechat|jquery|bootstrap|cdn|font|css))[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
          console.log('🐛 DEBUG: HTML content length after script removal:', htmlContent.length);
          
          // Then inject the chat script into the head
          htmlContent = htmlContent.replace(
            '<head>',
            `<head>
            <base href="${baseUrl}/">
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${scriptToInject}
            <style>
              * { box-sizing: border-box; }
              body { margin: 0; padding: 0; overflow-x: hidden; }
              img { max-width: 100%; height: auto; }
              .container, .wrapper { max-width: 100%; }
            </style>`
          );
          
          console.log('🐛 DEBUG: Chat script still present:', htmlContent.includes('Microsoft_Omnichannel_LCWidget') || htmlContent.includes('livechat') || htmlContent.includes('widget'));
          // Fix relative URLs
          htmlContent = htmlContent.replace(/src="\/([^\"]*?)"/g, `src="${baseUrl}/$1"`);
          htmlContent = htmlContent.replace(/href="\/([^\"]*?)"/g, `href="${baseUrl}/$1"`);
          htmlContent = htmlContent.replace(/url\(\/([^)]*?)\)/g, `url(${baseUrl}/$1)`);
        } else if (response.data.data.content) {
          // If Firecrawl returns content instead of HTML, fall back immediately
          console.log("⚠️ Firecrawl returned content instead of HTML, falling back to direct fetch...");
          throw new Error("Firecrawl returned text content - using direct fetch fallback");
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
        console.log('🔄 Attempting directHtmlFetch fallback for:', url);
        const fallbackResult = await directHtmlFetch(url, chatScript);
        console.log('📋 Fallback result success:', fallbackResult.success);
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
        } else {
          console.error("❌ Fallback failed with error:", fallbackResult.error);
        }
      } catch (fallbackError) {
        console.error("❌ Direct fetch exception:", fallbackError.message);
      }
      // If all methods fail
      res.status(500).json({ 
        error: `Failed to clone website. Firecrawl: ${error.message}. Direct fetch fallback also failed.`,
        url: url
      });
    }
  } catch (err) {
    // Top-level catch for any unexpected error
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};