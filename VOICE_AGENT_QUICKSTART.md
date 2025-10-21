# 🚀 Voice Agent Quick Start Guide

This guide will help you implement the voice agent feature step-by-step.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Azure OpenAI account with access to Realtime API
- [ ] Azure OpenAI resource deployed in **swedencentral** or **eastus2**
- [ ] Model deployment: `gpt-4o-mini-realtime-preview` or `gpt-4o-realtime-preview`
- [ ] API key from Azure OpenAI resource
- [ ] Node.js 18+ installed
- [ ] Your CloneSite repo cloned locally

---

## 🎯 Implementation Order

Follow these steps in order:

### Step 1: Set Up Azure OpenAI (5 minutes)

1. **Go to Azure Portal**
   - Navigate to your Azure OpenAI resource
   - Note down:
     - Resource name (e.g., `my-openai-resource`)
     - Region (must be `swedencentral` or `eastus2`)
     - API key (Keys and Endpoint section)

2. **Deploy the Model**
   - Go to "Model deployments"
   - Click "Create new deployment"
   - Select: `gpt-4o-mini-realtime-preview` (recommended) or `gpt-4o-realtime-preview`
   - Give it a deployment name (e.g., `realtime-voice`)
   - Click "Deploy"

### Step 2: Configure Environment Variables (5 minutes)

**Backend (.env file in root):**
```bash
cd CloneSite
cp .env.example .env  # If you don't have .env yet
```

Add these to your `.env`:
```env
# Existing
FIRECRAWL_API_KEY=fc-0515511a88e4440292549c718ed2821a

# New - Add these lines
AZURE_OPENAI_RESOURCE_NAME=your-resource-name-here
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT=realtime-voice
AZURE_OPENAI_REGION=swedencentral
AZURE_OPENAI_API_VERSION=2025-04-01-preview
```

**Frontend (homepage-clone/.env.local):**
```bash
cd homepage-clone
touch .env.local
```

Add to `homepage-clone/.env.local`:
```env
VITE_API_URL=http://localhost:3003
VITE_AZURE_REGION=swedencentral
VITE_AZURE_DEPLOYMENT=realtime-voice
```

### Step 3: Install Dependencies (2 minutes)

**Backend:**
```bash
cd CloneSite
npm install express-rate-limit
```

**Frontend:**
```bash
cd homepage-clone
npm install lucide-react
```

### Step 4: Create Backend Endpoint (10 minutes)

**Edit `server.js`** - Add this route after your existing routes:

```javascript
// Add at the top with other requires
const rateLimit = require('express-rate-limit');

// Voice session rate limiter (after other middleware)
const voiceSessionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 5, // 5 requests per IP per minute
  message: { error: 'Too many voice session requests, please try again later.' }
});

// New endpoint: Generate ephemeral key for voice sessions
app.post('/api/realtime/session', voiceSessionLimiter, async (req, res) => {
  try {
    const { voice = 'verse' } = req.body;
    
    // Validate environment variables
    if (!process.env.AZURE_OPENAI_RESOURCE_NAME || !process.env.AZURE_OPENAI_API_KEY) {
      throw new Error('Azure OpenAI configuration missing');
    }
    
    const sessionsUrl = `https://${process.env.AZURE_OPENAI_RESOURCE_NAME}.openai.azure.com/openai/realtimeapi/sessions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`;
    
    console.log('🎙️ Requesting ephemeral key for voice session...');
    
    const response = await axios.post(
      sessionsUrl,
      {
        model: process.env.AZURE_OPENAI_DEPLOYMENT,
        voice: voice
      },
      {
        headers: {
          'api-key': process.env.AZURE_OPENAI_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Ephemeral key generated successfully');
    
    // Return ephemeral key to client
    res.json({
      sessionId: response.data.id,
      ephemeralKey: response.data.client_secret?.value,
      expiresAt: response.data.expires_at
    });
    
  } catch (error) {
    console.error('❌ Error generating ephemeral key:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate ephemeral key',
      message: error.message,
      details: error.response?.data
    });
  }
});
```

**Test the endpoint:**
```bash
npm run server
```

Then in another terminal:
```bash
curl -X POST http://localhost:3003/api/realtime/session \
  -H "Content-Type: application/json" \
  -d '{"voice":"verse"}'
```

You should get back a JSON with `sessionId` and `ephemeralKey`.

### Step 5: Create TypeScript Types (5 minutes)

Create folder and file:
```bash
cd homepage-clone/src
mkdir types
touch types/voiceAgent.types.ts
```

Copy this content into `types/voiceAgent.types.ts`:
```typescript
export interface VoiceSessionResponse {
  sessionId: string;
  ephemeralKey: string;
  expiresAt: number;
}

export interface VoiceAgentConfig {
  webrtcUrl: string;
  deployment: string;
  voice: 'alloy' | 'echo' | 'shimmer' | 'verse';
  instructions?: string;
}

export interface RealtimeEvent {
  type: string;
  event_id?: string;
  session?: any;
  error?: {
    message: string;
    code?: string;
  };
}

export type VoiceAgentStatus = 
  | 'idle' 
  | 'connecting' 
  | 'connected' 
  | 'speaking' 
  | 'listening' 
  | 'error' 
  | 'disconnected';
```

### Step 6: Create Voice Service (20 minutes)

Create folder and file:
```bash
cd homepage-clone/src
mkdir services
touch services/voiceAgentService.ts
```

**For GitHub Copilot users:**
Open `voiceAgentService.ts` and use this prompt in Copilot Chat:

```
@workspace Create a VoiceAgentService class that:
1. Uses WebRTC RTCPeerConnection for real-time audio
2. Gets user microphone with getUserMedia
3. Creates a data channel for sending/receiving events
4. Implements initialize(ephemeralKey) method that:
   - Creates peer connection
   - Sets up audio element for playback
   - Gets microphone access
   - Creates SDP offer
   - Sends offer to ${webrtcUrl}?model=${deployment} with Bearer token
   - Sets remote description from response
5. Has disconnect() method to cleanup
6. Emits custom events for UI to listen to
7. Use the types from ../types/voiceAgent.types

Reference: /VOICE_AGENT_IMPLEMENTATION_PLAN.md Phase 3
```

**Or copy from the main plan:** See Phase 3 in VOICE_AGENT_IMPLEMENTATION_PLAN.md

### Step 7: Create React Hook (15 minutes)

Create folder and file:
```bash
cd homepage-clone/src
mkdir -p hooks
touch hooks/useVoiceAgent.ts
```

**For GitHub Copilot users:**
Open `useVoiceAgent.ts` and use this prompt:

```
@workspace Create a useVoiceAgent React hook that:
1. Uses useState for status, error, isMuted
2. Uses useRef for VoiceAgentService instance
3. Implements startSession() that:
   - Calls POST /api/realtime/session to get ephemeral key
   - Creates VoiceAgentService and calls initialize()
4. Implements endSession() to cleanup
5. Listens for voiceAgentEvent custom events
6. Returns { status, error, isMuted, startSession, endSession, toggleMute, isConnected }

Reference: /VOICE_AGENT_IMPLEMENTATION_PLAN.md Phase 4
```

**Or copy from the main plan:** See Phase 4 in VOICE_AGENT_IMPLEMENTATION_PLAN.md

### Step 8: Create UI Components (20 minutes)

Create components:
```bash
cd homepage-clone/src/components
touch VoiceButton.tsx
```

**For GitHub Copilot users:**
Open `VoiceButton.tsx` and use this prompt:

```
@workspace Create a VoiceButton component that:
1. Shows a floating button in bottom-right corner (fixed positioning)
2. Uses lucide-react icons (Mic, MicOff, Phone)
3. Changes color based on status:
   - idle: blue
   - connecting: yellow
   - connected/listening: green with pulse animation
   - error: red
4. Has onClick handler
5. Shows status text above button when active
6. Uses Tailwind CSS for styling

Reference: /VOICE_AGENT_IMPLEMENTATION_PLAN.md Phase 5.1
```

**Or copy from the main plan:** See Phase 5.1 in VOICE_AGENT_IMPLEMENTATION_PLAN.md

### Step 9: Integrate with App (10 minutes)

**Edit `homepage-clone/src/App.tsx`:**

Add imports at the top:
```typescript
import { useState } from 'react';
import { VoiceButton } from './components/VoiceButton';
import { useVoiceAgent } from './hooks/useVoiceAgent';
```

Inside your `App` component, add:
```typescript
function App() {
  // Existing state...
  
  // Add voice agent hook
  const { 
    status, 
    error, 
    isMuted, 
    startSession, 
    endSession, 
    toggleMute, 
    isConnected 
  } = useVoiceAgent();

  const handleVoiceToggle = () => {
    if (isConnected) {
      endSession();
    } else {
      startSession();
    }
  };

  return (
    <div className="app-container">
      {/* Your existing content */}
      
      {/* Add at the end, before closing div */}
      <VoiceButton 
        status={status}
        onToggle={handleVoiceToggle}
        isMuted={isMuted}
      />
      
      {/* Error notification */}
      {error && (
        <div className="fixed bottom-24 right-6 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
}
```

### Step 10: Test Everything (10 minutes)

**Start both servers:**
```bash
# Terminal 1 - Backend
cd CloneSite
npm run server

# Terminal 2 - Frontend
cd homepage-clone
npm run dev
```

**Open browser:**
```
http://localhost:5173  # Or whatever port Vite shows
```

**Test flow:**
1. You should see a blue microphone button in bottom-right
2. Click the button
3. Allow microphone access when prompted
4. Button should turn green and pulse
5. Speak to the AI - "Hello, can you hear me?"
6. You should hear the AI respond
7. Click button again to disconnect

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to generate ephemeral key"
**Solution:** 
- Check `.env` file has correct Azure credentials
- Verify resource name doesn't include `.openai.azure.com`
- Check API key is valid

### Issue: "Microphone permission denied"
**Solution:**
- Click the lock icon in browser address bar
- Allow microphone access
- Refresh page and try again
- Note: HTTPS required in production

### Issue: "WebRTC connection failed"
**Solution:**
- Verify region in `.env.local` matches your Azure resource region
- Check deployment name is correct
- Ensure ephemeral key hasn't expired (1 min lifetime)

### Issue: "No audio playback"
**Solution:**
- Check browser audio isn't muted
- Check system audio settings
- Try different browser (Chrome recommended)

### Issue: "Rate limit exceeded"
**Solution:**
- Wait 1 minute before trying again
- Each IP limited to 5 requests per minute

---

## 🎯 Next Steps After Basic Implementation

Once you have the basic voice agent working:

1. **Add Visual Feedback**
   - Voice waveform visualization
   - Transcript display
   - Speaking/listening indicators

2. **Enhance UX**
   - Add modal with better controls
   - Show conversation history
   - Add mute/unmute functionality

3. **Add Features**
   - Interrupt AI while speaking
   - Context awareness (use cloned website data)
   - Multi-language support

4. **Production Readiness**
   - Add proper error boundaries
   - Implement retry logic
   - Add analytics/monitoring
   - Security audit

---

## 📚 Helpful Copilot Chat Prompts

Use these prompts with GitHub Copilot as you implement:

**Understanding the code:**
```
@workspace Explain how the voice agent WebRTC connection works
```

**Debugging:**
```
@workspace Why might the ephemeral key generation fail? Show debugging steps
```

**Testing:**
```
/tests Generate unit tests for the useVoiceAgent hook
```

**Improving:**
```
@workspace How can I add a transcript display to show what the user and AI are saying?
```

---

## ✅ Verification Checklist

After implementation, verify:

- [ ] Backend /api/realtime/session endpoint works
- [ ] Frontend can fetch ephemeral keys
- [ ] Voice button appears in bottom-right
- [ ] No overlap with existing chat widget (bottom-left)
- [ ] Microphone permission request appears
- [ ] WebRTC connection establishes
- [ ] Can hear AI responses
- [ ] AI can hear user input
- [ ] Button status updates correctly
- [ ] Can disconnect cleanly
- [ ] Error messages display properly
- [ ] Works in Chrome/Edge/Firefox
- [ ] Responsive on different screen sizes

---

## 🆘 Need Help?

If you get stuck:

1. **Check the logs:**
   - Backend: Terminal running `npm run server`
   - Frontend: Browser DevTools Console (F12)

2. **Use Copilot:**
   - Ask specific questions about errors
   - Reference files: `@workspace /path/to/file.ts`

3. **Reference documentation:**
   - Main plan: `VOICE_AGENT_IMPLEMENTATION_PLAN.md`
   - Azure docs: https://learn.microsoft.com/azure/ai-services/openai/realtime-audio-quickstart

4. **Common debugging commands:**
   ```bash
   # Check if backend env vars loaded
   node -e "require('dotenv').config(); console.log(process.env.AZURE_OPENAI_RESOURCE_NAME)"
   
   # Test ephemeral key endpoint
   curl -X POST http://localhost:3003/api/realtime/session -H "Content-Type: application/json" -d '{"voice":"verse"}'
   ```

---

**Good luck! 🚀**

You're about to add a powerful voice AI feature to your CloneSite app!
