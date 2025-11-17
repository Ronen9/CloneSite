// Vercel serverless function for cloning websites
const axios = require('axios');
const { JSDOM } = require('jsdom');

const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;

// Helper: extract clean text content from HTML
function extractTextFromHtml(html) {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove only truly non-content elements (scripts, styles, etc)
    const elementsToRemove = document.querySelectorAll('head, script, style, noscript, iframe, svg, link, meta');
    elementsToRemove.forEach(el => el.remove());

    // Remove only ads and popups, but keep navigation and footer (they have useful content)
    const uiElements = document.querySelectorAll('.ads, .advertisement, [class*="cookie"], [class*="popup"], [id*="cookie"], [id*="popup"]');
    uiElements.forEach(el => el.remove());

    // Get text content from body (include everything)
    const text = document.body?.textContent || '';

    // Clean up the text: normalize whitespace but preserve structure
    const cleanedText = text
      .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
      .replace(/\n\s*\n\s*\n+/g, '\n\n') // Replace 3+ newlines with 2
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .trim();

    return cleanedText;
  } catch (error) {
    console.error('Error extracting text from HTML:', error);
    return '';
  }
}

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

    // Check if it's an Israeli domain to add Hebrew language support
    const isIsraeliDomain = url.includes('.co.il');
    const acceptLanguage = isIsraeliDomain
      ? 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7'
      : 'en-US,en;q=0.9,tr;q=0.8';

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': acceptLanguage,
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Referer': isIsraeliDomain ? 'https://www.google.co.il/' : undefined
      },
      timeout: 15000,
      maxRedirects: 5
    });

    let htmlContent = response.data;

    console.log(`📄 HTML received: ${htmlContent ? 'YES' : 'NO'}, length: ${htmlContent?.length || 0}`);
    console.log(`📄 Contains <html: ${htmlContent?.includes('<html')}`);

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
      
      // Fix relative URLs first
      htmlContent = htmlContent.replace(/src="\/([^"]*?)"/g, `src="${baseUrl}/$1"`);
      htmlContent = htmlContent.replace(/href="\/([^"]*?)"/g, `href="${baseUrl}/$1"`);
      htmlContent = htmlContent.replace(/url\(['"]?\/([^')\s]*?)['"]?\)/g, `url('${baseUrl}/$1')`);

      // Extract text content before returning
      console.log('🔍 Starting text extraction...');
      let textContent = '';
      try {
        textContent = extractTextFromHtml(htmlContent);
        console.log(`📝 Extracted text length: ${textContent.length} characters`);
        console.log(`📝 First 200 chars: ${textContent.substring(0, 200)}`);
      } catch (extractError) {
        console.error('❌ Text extraction error:', extractError.message);
      }

      return { success: true, html: htmlContent, textContent: textContent };
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

    if (!firecrawlApiKey) {
      return res.status(500).json({ error: 'Server configuration error. Missing FIRECRAWL_API_KEY.' });
    }

    try {
      console.log(`🔄 Cloning: ${url}`);

      // Check if URL is from a geo-restricted region (like Israel)
      // Only check the hostname, not the full URL path
      const hostname = new URL(url).hostname;
      const isGeoRestrictedDomain = hostname.endsWith('.co.il');

      if (isGeoRestrictedDomain) {
        console.log('🌍 Geo-restricted domain detected, skipping Firecrawl and using direct fetch');
        throw new Error('Geo-restricted domain - using direct fetch');
      }

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
          excludeTags: ["script", "noscript", "style"],
          // Add mobile headers to bypass some anti-bot protections
          headers: {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
          }
        },
        {
          headers: {
            Authorization: `Bearer ${firecrawlApiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 60000 // Increase timeout to 60 seconds
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
          
          // Inject the chat script into the head (use case-insensitive regex to match <head> with any attributes)
          htmlContent = htmlContent.replace(
            /<head([^>]*)>/i,
            `<head$1>
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
        // Extract clean text for knowledge base
        const extractedText = extractTextFromHtml(htmlContent);

        res.json({
          success: true,
          url: url,
          size: `${(htmlContent.length / 1024).toFixed(2)} KB`,
          status: "Successfully cloned",
          previewHtml: htmlContent,
          html: htmlContent,
          textContent: extractedText // Add extracted text
        });
        console.log(`✅ Successfully cloned: ${url}`);
      } else {
        throw new Error("No HTML content received from Firecrawl API");
      }

    } catch (error) {
      console.error("❌ Firecrawl failed, trying direct fetch:", error.message);
      console.error("Full Firecrawl error:", error);

      // Fallback to direct HTML fetch
      try {
        console.log('🔄 Attempting directHtmlFetch fallback for:', url);
        const fallbackResult = await directHtmlFetch(url, chatScript);
        console.log('📋 Fallback result:', { success: fallbackResult.success, error: fallbackResult.error });

        if (fallbackResult.success) {
          // Use the text content already extracted in directHtmlFetch
          const extractedText = fallbackResult.textContent || '';

          res.json({
            success: true,
            url: url,
            size: `${(fallbackResult.html.length / 1024).toFixed(2)} KB`,
            status: "Successfully cloned (direct fetch)",
            previewHtml: fallbackResult.html,
            html: fallbackResult.html,
            textContent: extractedText // Add extracted text
          });
          console.log(`✅ Successfully cloned via direct fetch: ${url}`);
          console.log(`📝 Text content length in response: ${extractedText.length} characters`);
          return;
        } else {
          console.error("❌ Fallback failed with error:", fallbackResult.error);
        }
      } catch (fallbackError) {
        console.error("❌ Direct fetch exception:", fallbackError.message);
        console.error("Full fallback error:", fallbackError);
      }

      // If all methods fail, provide detailed error
      const firecrawlError = error.response?.data?.error || error.message;
      res.status(500).json({
        error: `Failed to clone website. Firecrawl: ${firecrawlError}. Direct fetch fallback also failed.`,
        url: url,
        details: {
          firecrawl: error.message,
          directFetch: 'Also failed - check server logs'
        }
      });
    }
  } catch (err) {
    // Top-level catch for any unexpected error
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};