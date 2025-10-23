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
    // Include WebRTC endpoint for client connection - MUST match your Azure region!

    // Check if region is explicitly set via environment variable (recommended)
    // NOTE: Only eastus2 and swedencentral support WebRTC Realtime API
    let region = process.env.AZURE_OPENAI_REGION || 'eastus2'; // Changed default to eastus2 for better compatibility

    // If not explicitly set, try to extract from endpoint or resource name
    if (!process.env.AZURE_OPENAI_REGION) {
      try {
        // Try to extract region from endpoint URL
        const endpointUrl = new URL(endpoint);
        const hostname = endpointUrl.hostname; // e.g., "your-resource.openai.azure.com"

        // Check if resource name contains region hint
        const resourceName = hostname.split('.')[0];

        // Common Azure OpenAI regions
        const regionMapping = {
          'sweden': 'swedencentral',
          'us': 'eastus',
          'east': 'eastus',
          'west': 'westus',
          'europe': 'westeurope',
          'uk': 'uksouth',
          'australia': 'australiaeast',
          'canada': 'canadaeast',
          'france': 'francecentral',
          'japan': 'japaneast',
          'korea': 'koreacentral'
        };

        // Try to detect region from resource name
        for (const [key, value] of Object.entries(regionMapping)) {
          if (resourceName.toLowerCase().includes(key)) {
            region = value;
            console.log(`Detected region '${region}' from resource name '${resourceName}'`);
            break;
          }
        }

        // If AZURE_OPENAI_RESOURCE env var is set, use it to determine region
        const azureResource = process.env.AZURE_OPENAI_RESOURCE;
        if (azureResource) {
          for (const [key, value] of Object.entries(regionMapping)) {
            if (azureResource.toLowerCase().includes(key)) {
              region = value;
              console.log(`Detected region '${region}' from AZURE_OPENAI_RESOURCE '${azureResource}'`);
              break;
            }
          }
        }
      } catch (e) {
        console.warn('Could not parse Azure endpoint for region detection, using default:', region);
      }
    }

    const webrtcEndpoint = `https://${region}.realtimeapi-preview.ai.azure.com/v1/realtimertc`;
    console.log('=== Voice Session Debug Info ===');
    console.log(`WebRTC endpoint: ${webrtcEndpoint}`);
    console.log(`Deployment: ${deployment}`);
    console.log(`Azure endpoint: ${endpoint}`);
    console.log(`Region: ${region}`);
    console.log(`Session ID: ${sessionId}`);
    console.log('================================');

    return res.status(200).json({
      success: true,
      sessionId: sessionId,
      ephemeralKey: ephemeralKey,
      deployment: deployment,
      endpoint: webrtcEndpoint,
      region: region, // Include region for debugging
      azureEndpoint: endpoint // Include original endpoint for debugging
    });

  } catch (error) {
    console.error('Voice session error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
