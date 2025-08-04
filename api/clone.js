// Vercel serverless function for cloning websites
import axios from 'axios';

const firecrawlApiKey = "fc-0515511a88e4440292549c718ed2821a";

export default async function handler(req, res) {
  // Enable CORS
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
    
    const response = await axios.post(
      "https://api.firecrawl.dev/v0/scrape",
      {
        url: url,
        formats: ["html"],
        onlyMainContent: false,
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

    // Handle both html and content formats from Firecrawl
    let htmlContent = null;
    if (response.data && response.data.data) {
      if (response.data.data.html) {
        htmlContent = response.data.data.html;
      } else if (response.data.data.content) {
        // Convert markdown content to basic HTML structure
        const content = response.data.data.content;
        htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloned Homepage</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333; }
      h1, h2, h3 { color: #222; margin: 1.5em 0 0.5em 0; }
      h1 { font-size: 2.5em; }
      h2 { font-size: 2em; }
      h3 { font-size: 1.5em; }
      p { margin: 1em 0; }
      a { color: #0066cc; text-decoration: none; }
      a:hover { text-decoration: underline; }
      .content { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      ul, ol { margin: 1em 0; padding-left: 2em; }
      li { margin: 0.5em 0; }
    </style>
</head>
<body>
    <div class="content">
        ${content.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>')}
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
    console.error("❌ Clone error:", error.message);
    res.status(500).json({ 
      error: `Failed to clone website: ${error.message}`,
      url: url
    });
  }
}