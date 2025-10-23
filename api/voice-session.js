/**
 * Azure OpenAI Realtime API - Voice Session Endpoint
 * Creates ephemeral authentication tokens for WebRTC connections
 * 
 * POST /api/voice-session
 * Body: { voice, temperature, instructions }
 * Returns: { sessionId, ephemeralKey, endpoint }
 */

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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
    // Get environment variables
    const apiKey = process.env.AZURE_OPENAI_API_KEY;
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

    // Validate environment variables
    if (!apiKey || !endpoint || !deployment) {
      console.error('Missing environment variables:', {
        hasApiKey: !!apiKey,
        hasEndpoint: !!endpoint,
        hasDeployment: !!deployment
      });
      return res.status(500).json({ 
        error: 'Server configuration error. Missing required environment variables.' 
      });
    }

    // Get request parameters
    const { voice = 'coral', temperature = 0.7, instructions = '' } = req.body;

    // Validate parameters
    const validVoices = ['alloy', 'echo', 'shimmer', 'ash', 'ballad', 'coral', 'sage', 'verse'];
    if (!validVoices.includes(voice)) {
      return res.status(400).json({ 
        error: `Invalid voice. Must be one of: ${validVoices.join(', ')}` 
      });
    }

    if (temperature < 0 || temperature > 1) {
      return res.status(400).json({ 
        error: 'Invalid temperature. Must be between 0 and 1.' 
      });
    }

    // Create session with Azure OpenAI Realtime API (matches reference implementation)
    const sessionUrl = `${endpoint}/openai/realtimeapi/sessions?api-version=2025-04-01-preview`;
    
    const sessionResponse = await fetch(sessionUrl, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: deployment,
        voice: voice
      })
    });

    if (!sessionResponse.ok) {
      const errorText = await sessionResponse.text();
      console.error('Azure OpenAI session creation failed:', errorText);
      return res.status(sessionResponse.status).json({ 
        error: 'Failed to create voice session',
        details: errorText
      });
    }

    const sessionData = await sessionResponse.json();

    // Extract session details (matches reference implementation)
    const sessionId = sessionData.id;
    const ephemeralKey = sessionData.client_secret?.value;

    if (!sessionId || !ephemeralKey) {
      console.error('Invalid session response:', sessionData);
      return res.status(500).json({ 
        error: 'Failed to extract session credentials from Azure response' 
      });
    }

    // Return session information to client (temperature and instructions configured client-side)
    // Include WebRTC endpoint for client connection
    const resource = process.env.AZURE_OPENAI_RESOURCE;
    const webrtcEndpoint = `https://swedencentral.realtimeapi-preview.ai.azure.com/v1/realtimertc`;
    
    return res.status(200).json({
      success: true,
      sessionId: sessionId,
      ephemeralKey: ephemeralKey,
      deployment: deployment,
      endpoint: webrtcEndpoint
    });

  } catch (error) {
    console.error('Voice session error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
