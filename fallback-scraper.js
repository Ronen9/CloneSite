const axios = require('axios');
const { JSDOM } = require('jsdom');

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
    console.error('❌ Text extraction error:', error.message);
    return '';
  }
}

// Helper: only inject chat script if user provided one
function getChatScriptToInject(userScript) {
  if (userScript && userScript.trim()) {
    const cleaned = userScript.trim();
    console.log('🐛 DEBUG (FALLBACK): Using USER PROVIDED chat script snippet:', cleaned.substring(0, 120) + '...');
    return cleaned;
  }
  console.log('ℹ️ INFO (FALLBACK): No chat script provided – skipping injection');
  return '';
}

async function directHtmlFetch(url, chatScript) {
  try {
    console.log(`🔄 Direct fetch: ${url}`);

    // Check if it's an Israeli domain to add Hebrew language support
    const isIsraeliDomain = url.includes('.co.il');
    const acceptLanguage = isIsraeliDomain
      ? 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7'
      : 'en-US,en;q=0.5';

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': acceptLanguage,
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Referer': isIsraeliDomain ? 'https://www.google.co.il/' : undefined
      },
      timeout: 15000,
      maxRedirects: 5
    });

    let htmlContent = response.data;
    
    if (htmlContent && htmlContent.includes('<html')) {
      // Clean and enhance the HTML
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

          /* Preserve original styling while ensuring compatibility */
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; }
          img { max-width: 100%; height: auto; }

          /* Fix common layout issues */
          .container, .wrapper, .main-content { max-width: 100%; }

          /* Ensure proper text rendering */
          body, * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* Handle responsive design */
          @media (max-width: 768px) {
            body { font-size: 14px; }
            .mobile-hidden { display: none !important; }
          }
        </style>`
      );
      
      // Fix relative URLs (don't remove scripts - they're needed for the website to function)
      htmlContent = htmlContent.replace(/src="\/([^"]*?)"/g, `src="${baseUrl}/$1"`);
      htmlContent = htmlContent.replace(/href="\/([^"]*?)"/g, `href="${baseUrl}/$1"`);
      htmlContent = htmlContent.replace(/url\(['"]?\/([^'")\s]*?)['"]?\)/g, `url('${baseUrl}/$1')`);
      
      // Fix protocol-relative URLs
      htmlContent = htmlContent.replace(/src="\/\/([^"]*?)"/g, `src="https://$1"`);
      htmlContent = htmlContent.replace(/href="\/\/([^"]*?)"/g, `href="https://$1"`);

      // Extract clean text content
      const textContent = extractTextFromHtml(htmlContent);
      console.log(`📝 Extracted ${textContent.length} characters of text`);
      console.log(`📝 First 300 chars: ${textContent.substring(0, 300)}`);

      return {
        success: true,
        html: htmlContent,
        textContent: textContent,
        method: 'direct-fetch'
      };
    }
    
    throw new Error('No valid HTML content found');
    
  } catch (error) {
    console.error('❌ Direct fetch failed:', error.message);
    return {
      success: false,
      error: error.message,
      method: 'direct-fetch'
    };
  }
}

module.exports = { directHtmlFetch };