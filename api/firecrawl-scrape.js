/**
 * Firecrawl Scrape/Crawl Endpoint
 * Securely scrapes or crawls websites using Firecrawl API
 * 
 * POST /api/firecrawl-scrape
 * Body: { url, type: "scrape" | "crawl", maxPages: number }
 * Returns: { success, content, pageCount, creditsUsed }
 */

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // Get Firecrawl API key from environment
    const apiKey = process.env.FIRECRAWL_API_KEY;

    // Validate environment variable
    if (!apiKey) {
      console.error('Missing FIRECRAWL_API_KEY environment variable');
      return res.status(500).json({ 
        error: 'Server configuration error. Missing FIRECRAWL_API_KEY.' 
      });
    }

    // Get request parameters
    const { url, type = 'scrape', maxPages = 1 } = req.body;

    // Validate parameters
    if (!url || !url.trim()) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    if (type !== 'scrape' && type !== 'crawl') {
      return res.status(400).json({ error: 'Type must be "scrape" or "crawl"' });
    }

    // Handle Quick Scrape (single page)
    if (type === 'scrape') {
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          url: url,
          formats: ['markdown'],
          onlyMainContent: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Firecrawl scrape error:', errorData);
        return res.status(response.status).json({ 
          error: errorData.error || `Scrape failed with status ${response.status}` 
        });
      }

      const data = await response.json();

      // Extract markdown content
      let content = '';
      if (data.data && data.data.markdown) {
        content = data.data.markdown;
      } else if (data.markdown) {
        content = data.markdown;
      } else {
        return res.status(500).json({ error: 'No content extracted from the website' });
      }

      return res.status(200).json({
        success: true,
        content: content,
        pageCount: 1,
        creditsUsed: 1,
        type: 'scrape'
      });
    }

    // Handle Full Crawl (multiple pages)
    if (type === 'crawl') {
      // Start the crawl with specified page limit
      const crawlResponse = await fetch('https://api.firecrawl.dev/v1/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          url: url,
          limit: maxPages,
          scrapeOptions: {
            formats: ['markdown'],
            onlyMainContent: true
          }
        })
      });

      if (!crawlResponse.ok) {
        const errorData = await crawlResponse.json();
        console.error('Firecrawl crawl start error:', errorData);
        return res.status(crawlResponse.status).json({ 
          error: errorData.error || `Crawl start failed with status ${crawlResponse.status}` 
        });
      }

      const crawlData = await crawlResponse.json();
      const jobId = crawlData.id;

      if (!jobId) {
        return res.status(500).json({ error: 'No job ID returned from crawl request' });
      }

      // Poll for completion (max 60 attempts = 5 minutes)
      let attempts = 0;
      const maxAttempts = 60;

      const checkStatus = async () => {
        attempts++;

        const statusResponse = await fetch(`https://api.firecrawl.dev/v1/crawl/${jobId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });

        if (!statusResponse.ok) {
          throw new Error(`Status check failed with status ${statusResponse.status}`);
        }

        const statusData = await statusResponse.json();

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

          return res.status(200).json({
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

  } catch (error) {
    console.error('Firecrawl scrape/crawl error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
