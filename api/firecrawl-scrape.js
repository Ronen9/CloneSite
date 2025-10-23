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
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          const errorText = await response.text();
          console.error('Firecrawl scrape error (non-JSON):', response.status, errorText);
          return res.status(response.status).json({
            error: `Scrape failed with status ${response.status}`,
            details: errorText.substring(0, 200)
          });
        }
        console.error('Firecrawl scrape error:', errorData);
        return res.status(response.status).json({
          error: errorData.error || errorData.message || `Scrape failed with status ${response.status}`
        });
      }

      const data = await response.json();
      console.log('Firecrawl scrape response structure:', JSON.stringify(Object.keys(data), null, 2));

      // Extract markdown content - handle different response formats
      let content = '';
      if (data.data && data.data.markdown) {
        content = data.data.markdown;
      } else if (data.markdown) {
        content = data.markdown;
      } else if (data.data && typeof data.data === 'string') {
        content = data.data;
      } else if (data.content) {
        content = data.content;
      } else {
        console.error('Unexpected Firecrawl response format:', JSON.stringify(data, null, 2));
        return res.status(500).json({
          error: 'No content extracted from the website',
          responseKeys: Object.keys(data),
          hint: 'Response format may have changed'
        });
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
      // Check if this is a status check request
      const { jobId } = req.body;
      
      if (jobId) {
        // This is a status check - poll the crawl job
        const statusResponse = await fetch(`https://api.firecrawl.dev/v1/crawl/${jobId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });

        if (!statusResponse.ok) {
          return res.status(statusResponse.status).json({ 
            error: `Status check failed with status ${statusResponse.status}` 
          });
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
            return res.status(500).json({ error: 'No content extracted from crawled pages' });
          }

          return res.status(200).json({
            success: true,
            content: allContent,
            pageCount: pageCount,
            creditsUsed: pageCount,
            type: 'crawl',
            status: 'completed'
          });
        } else if (statusData.status === 'failed') {
          return res.status(500).json({ 
            error: 'Crawl job failed',
            status: 'failed'
          });
        } else {
          // Still in progress
          return res.status(200).json({
            status: statusData.status || 'processing',
            completed: statusData.completed || 0,
            total: statusData.total || maxPages
          });
        }
      }
      
      // This is a new crawl request - start the job and return immediately
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
        let errorData;
        try {
          errorData = await crawlResponse.json();
        } catch (e) {
          const errorText = await crawlResponse.text();
          console.error('Firecrawl crawl error (non-JSON):', crawlResponse.status, errorText);
          return res.status(crawlResponse.status).json({
            error: `Crawl start failed with status ${crawlResponse.status}`,
            details: errorText.substring(0, 200)
          });
        }
        console.error('Firecrawl crawl start error:', errorData);
        return res.status(crawlResponse.status).json({
          error: errorData.error || errorData.message || `Crawl start failed with status ${crawlResponse.status}`
        });
      }

      const crawlData = await crawlResponse.json();
      console.log('Firecrawl crawl response:', JSON.stringify(crawlData, null, 2));

      const newJobId = crawlData.id || crawlData.jobId;

      if (!newJobId) {
        console.error('No job ID in response. Response keys:', Object.keys(crawlData));
        return res.status(500).json({
          error: 'No job ID returned from crawl request',
          responseKeys: Object.keys(crawlData)
        });
      }

      // Return job ID immediately for frontend polling
      return res.status(200).json({
        success: true,
        jobId: newJobId,
        status: 'started',
        message: 'Crawl job started. Poll for status.'
      });
    }

  } catch (error) {
    console.error('Firecrawl API error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      type: error.name || 'Unknown'
    });
  }
}
