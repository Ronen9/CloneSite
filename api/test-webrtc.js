/**
 * WebRTC Connection Test Endpoint
 * Tests if WebRTC endpoint is reachable
 *
 * GET /api/test-webrtc
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

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const region = process.env.AZURE_OPENAI_REGION || 'swedencentral';

    const webrtcEndpoint = `https://${region}.realtimeapi-preview.ai.azure.com`;

    // Try to test connectivity (just a simple HEAD request)
    const testUrl = `${webrtcEndpoint}/`;

    console.log(`Testing WebRTC endpoint: ${testUrl}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(testUrl, {
        method: 'HEAD',
        signal: controller.signal
      });

      clearTimeout(timeout);

      return res.status(200).json({
        success: true,
        message: 'WebRTC endpoint is reachable',
        endpoint: webrtcEndpoint,
        region: region,
        deployment: deployment,
        azureEndpoint: endpoint,
        testResponse: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        }
      });
    } catch (fetchError) {
      clearTimeout(timeout);

      return res.status(200).json({
        success: false,
        message: 'WebRTC endpoint is NOT reachable',
        endpoint: webrtcEndpoint,
        region: region,
        deployment: deployment,
        azureEndpoint: endpoint,
        error: fetchError.name === 'AbortError' ? 'Connection timeout' : fetchError.message,
        suggestion: 'Try setting AZURE_OPENAI_REGION to "eastus2" if you have a Global Standard deployment'
      });
    }

  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({
      success: false,
      error: 'Test failed',
      message: error.message
    });
  }
}
