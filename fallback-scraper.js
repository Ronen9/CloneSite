const axios = require('axios');

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
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000,
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
      
      // Remove potentially problematic scripts but keep essential ones and chat widgets
      htmlContent = htmlContent.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (match) => {
        // Keep essential scripts (like those for CSS frameworks) and chat widgets
        if (match.includes('css') || match.includes('style') || match.includes('font') || 
            match.includes('chat') || match.includes('widget') || match.includes('omnichannel') || match.includes('livechat')) {
          return match;
        }
        return '';
      });
      
      // Fix relative URLs
      htmlContent = htmlContent.replace(/src="\/([^"]*?)"/g, `src="${baseUrl}/$1"`);
      htmlContent = htmlContent.replace(/href="\/([^"]*?)"/g, `href="${baseUrl}/$1"`);
      htmlContent = htmlContent.replace(/url\(['"]?\/([^'")\s]*?)['"]?\)/g, `url('${baseUrl}/$1')`);
      
      // Fix protocol-relative URLs
      htmlContent = htmlContent.replace(/src="\/\/([^"]*?)"/g, `src="https://$1"`);
      htmlContent = htmlContent.replace(/href="\/\/([^"]*?)"/g, `href="https://$1"`);
      
      return {
        success: true,
        html: htmlContent,
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