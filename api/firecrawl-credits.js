/**
 * Firecrawl Credits Check Endpoint
 * Securely fetches Firecrawl API credit usage without exposing API key in frontend
 * 
 * GET /api/firecrawl-credits
 * Returns: { success, remainingCredits, planCredits, billingPeriodEnd, usage }
 */

export default async function handler(req, res) {
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

    // Validate environment variable
    if (!apiKey) {
      console.error('Missing FIRECRAWL_API_KEY environment variable');
      return res.status(500).json({ 
        error: 'Server configuration error. Missing FIRECRAWL_API_KEY.' 
      });
    }

    // Fetch credit usage from Firecrawl API (v2)
    const response = await fetch('https://api.firecrawl.dev/v2/team/credit-usage', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firecrawl API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Failed to fetch credits from Firecrawl',
        details: errorText
      });
    }

    const data = await response.json();

    // Parse and return credit information (v2 API format - matches reference implementation)
    // Response format: { success: true, data: { remainingCredits: ..., planCredits: ..., billingPeriodEnd: ... } }
    const remaining = data.data?.remainingCredits || 0;
    const planCredits = data.data?.planCredits || 0;
    const billingPeriodEnd = data.data?.billingPeriodEnd;

    return res.status(200).json({
      success: true,
      remainingCredits: remaining,
      planCredits: planCredits,
      billingPeriodEnd: billingPeriodEnd,
      usage: {
        used: planCredits - remaining,
        percentage: planCredits > 0 
          ? Math.round(((planCredits - remaining) / planCredits) * 100) 
          : 0
      }
    });

  } catch (error) {
    console.error('Credits fetch error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
