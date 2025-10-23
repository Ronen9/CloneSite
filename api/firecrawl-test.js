/**
 * Firecrawl API Test Endpoint
 * Tests if the Firecrawl API key is working
 *
 * GET /api/firecrawl-test
 * Returns: Status of API key and simple scrape test
 */

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    // Get Firecrawl API key from environment
    const apiKey = process.env.FIRECRAWL_API_KEY;

    // Check if API key exists
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'FIRECRAWL_API_KEY environment variable is not set',
        apiKeyPresent: false
      });
    }

    // Test 1: Check if API key format is correct
    const apiKeyFormat = apiKey.startsWith('fc-') ? 'Valid format' : 'Invalid format (should start with fc-)';
    const apiKeyLength = apiKey.length;
    const apiKeyPreview = apiKey.substring(0, 10) + '...';

    console.log('API Key Test:');
    console.log('- Format:', apiKeyFormat);
    console.log('- Length:', apiKeyLength);
    console.log('- Preview:', apiKeyPreview);

    // Test 2: Try to fetch credits (simple API call)
    console.log('Testing credits endpoint...');
    const creditsResponse = await fetch('https://api.firecrawl.dev/v2/team/credit-usage', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const creditsStatus = creditsResponse.status;
    console.log('Credits endpoint status:', creditsStatus);

    if (!creditsResponse.ok) {
      const errorText = await creditsResponse.text();
      console.error('Credits endpoint error:', errorText);

      return res.status(200).json({
        success: false,
        apiKeyPresent: true,
        apiKeyFormat: apiKeyFormat,
        apiKeyLength: apiKeyLength,
        apiKeyPreview: apiKeyPreview,
        creditsTest: {
          success: false,
          status: creditsStatus,
          error: errorText.substring(0, 200)
        },
        message: 'API key exists but credits endpoint failed. This suggests the API key may be invalid or expired.'
      });
    }

    const creditsData = await creditsResponse.json();
    console.log('Credits data:', JSON.stringify(creditsData, null, 2));

    // Test 3: Try a simple scrape (using example.com which is always accessible)
    console.log('Testing scrape endpoint with example.com...');
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        url: 'https://example.com',
        formats: ['markdown'],
        onlyMainContent: true
      })
    });

    const scrapeStatus = scrapeResponse.status;
    console.log('Scrape endpoint status:', scrapeStatus);

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error('Scrape endpoint error:', errorText);

      return res.status(200).json({
        success: false,
        apiKeyPresent: true,
        apiKeyFormat: apiKeyFormat,
        apiKeyLength: apiKeyLength,
        apiKeyPreview: apiKeyPreview,
        creditsTest: {
          success: true,
          remainingCredits: creditsData.data?.remainingCredits || 0
        },
        scrapeTest: {
          success: false,
          status: scrapeStatus,
          error: errorText.substring(0, 200)
        },
        message: 'API key is valid (credits work) but scrape endpoint failed.'
      });
    }

    const scrapeData = await scrapeResponse.json();
    console.log('Scrape data keys:', Object.keys(scrapeData));

    // All tests passed!
    return res.status(200).json({
      success: true,
      apiKeyPresent: true,
      apiKeyFormat: apiKeyFormat,
      apiKeyLength: apiKeyLength,
      apiKeyPreview: apiKeyPreview,
      creditsTest: {
        success: true,
        remainingCredits: creditsData.data?.remainingCredits || 0,
        planCredits: creditsData.data?.planCredits || 0
      },
      scrapeTest: {
        success: true,
        status: scrapeStatus,
        responseKeys: Object.keys(scrapeData),
        hasContent: !!scrapeData.data?.markdown || !!scrapeData.markdown
      },
      message: 'All tests passed! Firecrawl API is working correctly.'
    });

  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({
      success: false,
      error: 'Test failed with exception',
      message: error.message,
      stack: error.stack
    });
  }
}
