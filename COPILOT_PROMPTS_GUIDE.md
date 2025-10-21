# 🤖 GitHub Copilot Chat Prompts for Voice Agent

This guide contains ready-to-use prompts for GitHub Copilot to help you implement the voice agent feature efficiently.

---

## 🎯 How to Use This Guide

1. Open GitHub Copilot Chat in VS Code (`Ctrl+Alt+I` or `Cmd+Alt+I`)
2. Copy and paste the prompts below
3. Copilot will generate code based on the context from your repository
4. Review and modify the generated code as needed

**Tip:** Use `@workspace` to give Copilot full context of your project!

---

## 📝 Setup & Planning Prompts

### Initial Project Analysis
```
@workspace Analyze the CloneSite project structure and explain where the voice agent components should be added. Consider the existing React frontend structure and Express backend.
```

### Environment Setup
```
@workspace What environment variables do I need to add for Azure OpenAI Realtime API? Show me the .env structure for both backend and frontend.
```

### Dependencies Review
```
@workspace What npm packages do I need to install for WebRTC voice functionality? Include both backend and frontend dependencies.
```

---

## 🔧 Backend Implementation Prompts

### Ephemeral Key Endpoint
```
@workspace In server.js, create a POST /api/realtime/session endpoint that:
1. Uses express-rate-limit to limit requests to 5 per minute
2. Calls Azure OpenAI sessions API with api-key header
3. Returns sessionId and ephemeral key to client
4. Includes proper error handling
5. Uses environment variables for configuration

Reference the Azure OpenAI documentation structure where sessions URL is:
https://{resource}.openai.azure.com/openai/realtimeapi/sessions?api-version=2025-04-01-preview
```

### Rate Limiting
```
@workspace Add rate limiting to the voice session endpoint in server.js. Limit each IP to 5 requests per minute with appropriate error message.
```

### Environment Validation
```
@workspace Add validation in server.js startup to check if all required Azure OpenAI environment variables are present (AZURE_OPENAI_RESOURCE_NAME, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT). Log helpful error messages if missing.
```

### Testing Backend Endpoint
```
@workspace Show me how to test the /api/realtime/session endpoint using curl and also create a simple test with axios in a separate test file.
```

---

## 💻 Frontend - Types Prompts

### TypeScript Interfaces
```
@workspace Create TypeScript types in src/types/voiceAgent.types.ts for:
1. VoiceSessionResponse (sessionId, ephemeralKey, expiresAt)
2. VoiceAgentConfig (webrtcUrl, deployment, voice, instructions)
3. RealtimeEvent (type, event_id, session, error)
4. VoiceAgentStatus union type (idle, connecting, connected, speaking, listening, error, disconnected)
```

---

## 🎙️ Frontend - Service Layer Prompts

### WebRTC Service Class
```
@workspace Create a VoiceAgentService class in src/services/voiceAgentService.ts that:
1. Uses RTCPeerConnection for WebRTC
2. Has initialize(ephemeralKey) method that:
   - Creates peer connection
   - Sets up audio element with autoplay
   - Gets user microphone using navigator.mediaDevices.getUserMedia with echo cancellation
   - Adds audio track to peer connection
   - Creates data channel named 'realtime-channel'
   - Sets up data channel event listeners (open, message, close, error)
   - Creates SDP offer
   - Sends offer to webrtcUrl with Authorization Bearer token
   - Sets remote description from response
3. Has disconnect() method that stops tracks, closes channels, removes audio
4. Has sendEvent(event) method to send events through data channel
5. Dispatches custom 'voiceAgentEvent' events for UI to listen to
6. Uses the types from ../types/voiceAgent.types
```

### Data Channel Event Handling
```
@workspace In the VoiceAgentService, implement proper handling for data channel events including:
1. session.created
2. session.updated
3. session.error
4. response.done
5. input_audio_buffer.speech_started
6. input_audio_buffer.speech_stopped

Emit these as custom events for the UI layer.
```

---

## ⚛️ Frontend - React Hook Prompts

### useVoiceAgent Hook
```
@workspace Create a useVoiceAgent React hook in src/hooks/useVoiceAgent.ts that:
1. Uses useState for status (VoiceAgentStatus), error (string | null), isMuted (boolean)
2. Uses useRef for VoiceAgentService instance
3. Has startSession() that:
   - Sets status to 'connecting'
   - Fetches ephemeral key from POST /api/realtime/session
   - Constructs WebRTC URL from environment variable VITE_AZURE_REGION
   - Creates VoiceAgentService with config
   - Calls service.initialize(ephemeralKey)
   - Handles errors appropriately
4. Has endSession() that disconnects service and resets state
5. Has toggleMute() function
6. Uses useEffect to listen for 'voiceAgentEvent' custom events
7. Returns { status, error, isMuted, startSession, endSession, toggleMute, isConnected }
```

### Event Listener for Realtime Events
```
@workspace In useVoiceAgent hook, add a useEffect that listens for 'voiceAgentEvent' custom events and updates the status state based on event types:
- session.created → 'connected'
- session.updated → 'listening'
- input_audio_buffer.speech_started → 'listening'
- response.audio.delta → 'speaking'
- error → 'error'
- session.end → 'disconnected'
```

---

## 🎨 Frontend - UI Component Prompts

### VoiceButton Component
```
@workspace Create a VoiceButton component in src/components/VoiceButton.tsx that:
1. Is a floating button in the bottom-right corner (fixed position)
2. Uses lucide-react icons (Mic, MicOff, Phone)
3. Changes color based on status prop:
   - idle: bg-blue-500
   - connecting: bg-yellow-500
   - connected/listening/speaking: bg-green-500 with animate-pulse
   - error: bg-red-500
4. Shows status text above button when active
5. Has onClick handler from props
6. Uses Tailwind CSS classes
7. Has proper z-index (z-50) to float above content
8. Positioned at bottom-6 right-6
9. Include accessibility attributes (aria-label)
10. Has smooth hover and transition effects
```

### Status Indicator
```
@workspace In VoiceButton component, add a small status indicator that shows:
1. Pulse animation when listening/speaking
2. Color-coded dot (green=active, yellow=connecting, red=error)
3. Positioned above the main button
4. Fades in/out smoothly
5. Shows current status text
```

### VoiceAgentModal Component (Optional)
```
@workspace Create an optional VoiceAgentModal component in src/components/VoiceAgentModal.tsx that:
1. Shows when voice session is active
2. Positioned bottom-24 right-6 (above the button)
3. Displays:
   - Animated microphone icon based on status
   - Status text and description
   - Mute/unmute button
   - Close button
4. Uses Tailwind CSS for styling
5. Has smooth open/close animations
6. Includes waveform visualization (optional)
```

---

## 🔌 Frontend - Integration Prompts

### App.tsx Integration
```
@workspace In src/App.tsx:
1. Import VoiceButton and useVoiceAgent hook
2. Add voice agent state using the hook
3. Create handleVoiceToggle function that starts/ends session
4. Add VoiceButton component at the bottom before closing div
5. Add error notification UI that displays when error state exists
6. Ensure no overlap with existing Copilot Studio chat widget
7. Make sure VoiceButton is inside the main app container with proper positioning
```

### Positioning Fix
```
@workspace The voice button needs to appear in the bottom-right corner without overlapping the Copilot Studio chat widget in bottom-left. Review App.tsx structure and ensure proper positioning with z-index management.
```

---

## 🧪 Testing & Debugging Prompts

### Debug Connection Issues
```
@workspace The WebRTC connection is failing. Help me debug by:
1. Adding console.log statements at key points
2. Checking if ephemeral key is valid
3. Verifying WebRTC URL construction
4. Checking data channel state
5. Inspecting RTCPeerConnection state
```

### Microphone Permission Handling
```
@workspace Add better error handling for microphone permission denial in VoiceAgentService. Show user-friendly error message and provide instructions for enabling microphone.
```

### Audio Playback Issues
```
@workspace The audio element is created but I can't hear the AI response. Help me debug:
1. Check if audio element is properly appended
2. Verify ontrack event handler
3. Check if srcObject is set correctly
4. Add console logs for audio track info
5. Check browser audio settings
```

### Test Voice Session Flow
```
@workspace Create a simple test scenario that:
1. Mocks the fetch call to /api/realtime/session
2. Tests the startSession flow
3. Verifies status changes
4. Tests error handling
Use React Testing Library
```

---

## 🎭 Enhancement Prompts

### Add Transcript Display
```
@workspace Add a transcript feature to VoiceAgentModal that:
1. Listens for conversation.item.created events
2. Displays user speech and AI responses as text
3. Scrolls automatically to latest message
4. Styles user and AI messages differently
5. Stores in useState array
```

### Voice Waveform Visualization
```
@workspace Add a voice waveform visualization to VoiceAgentModal using Web Audio API that:
1. Shows when user is speaking
2. Animates based on audio input level
3. Uses canvas or CSS animation
4. Smooth and performant
```

### Add Mute Functionality
```
@workspace Implement actual mute/unmute functionality in VoiceAgentService that:
1. Stops/starts the audio track
2. Sends appropriate event to data channel
3. Updates UI state
4. Preserves connection while muted
```

### Conversation History
```
@workspace Add conversation history feature that:
1. Stores past conversations in localStorage
2. Shows list of previous sessions
3. Allows replaying old conversations (audio if saved)
4. Includes timestamps and summaries
```

### Multi-language Support
```
@workspace Add language selection to voice agent that:
1. Lets user choose language before starting session
2. Passes language parameter to session endpoint
3. Updates instructions based on language
4. UI labels change with selected language
```

---

## 🐛 Troubleshooting Prompts

### General Debugging
```
@workspace I'm getting error "[specific error message]". Help me:
1. Identify the root cause
2. Suggest fixes
3. Add better error handling
4. Prevent this error in the future
```

### CORS Issues
```
@workspace I'm getting CORS errors when calling the Azure OpenAI API. Review the server.js CORS configuration and suggest fixes.
```

### Ephemeral Key Expiration
```
@workspace The ephemeral key expires after 1 minute. Add logic to:
1. Detect when key is about to expire
2. Request a new key before expiration
3. Seamlessly transition to new session
4. Notify user if refresh fails
```

### Performance Issues
```
@workspace The voice connection has high latency. Help me optimize:
1. Audio codec settings
2. Peer connection configuration
3. Network handling
4. Buffer sizes
5. Add performance monitoring
```

---

## 📦 Deployment Prompts

### Environment Variables for Production
```
@workspace I'm deploying to Vercel. Help me:
1. List all environment variables needed
2. Show how to set them in Vercel dashboard
3. Update code to use production URLs
4. Add environment-specific configurations
```

### HTTPS Requirements
```
@workspace Microphone access requires HTTPS. Help me:
1. Configure local development with HTTPS
2. Update Vite config for HTTPS
3. Handle certificate for localhost
4. Test with self-signed certificate
```

### Build Optimization
```
@workspace Optimize the production build:
1. Code splitting for voice agent features
2. Lazy loading components
3. Minimize bundle size
4. Tree-shaking unused code
```

---

## 🔍 Code Review Prompts

### Security Review
```
@workspace Review the voice agent implementation for security issues:
1. Check if API keys are exposed
2. Verify rate limiting is effective
3. Review CORS configuration
4. Check for XSS vulnerabilities
5. Validate input sanitization
```

### Performance Review
```
@workspace Review the voice agent code for performance issues:
1. Check for memory leaks
2. Identify unnecessary re-renders
3. Optimize state updates
4. Review event listener cleanup
5. Check for expensive operations
```

### Accessibility Review
```
@workspace Review voice agent UI for accessibility:
1. Check ARIA labels
2. Verify keyboard navigation
3. Test with screen readers
4. Check color contrast
5. Add focus indicators
```

---

## 📚 Documentation Prompts

### Generate JSDoc Comments
```
@workspace Add comprehensive JSDoc comments to VoiceAgentService class including:
1. Class description
2. Method descriptions
3. Parameter types and descriptions
4. Return types
5. Usage examples
```

### Create README Section
```
@workspace Create a README section documenting the voice agent feature including:
1. Feature overview
2. Prerequisites
3. Setup instructions
4. Usage guide
5. Troubleshooting tips
6. API reference
```

### API Documentation
```
@workspace Document the /api/realtime/session endpoint in OpenAPI/Swagger format including:
1. Request parameters
2. Response schema
3. Error codes
4. Example requests
5. Rate limiting details
```

---

## 💡 Quick Tips for Using These Prompts

1. **Be Specific:** The more context you provide, the better Copilot's suggestions
2. **Iterate:** Start with basic prompts, then refine based on results
3. **Reference Files:** Use `@workspace /path/to/file` to reference specific files
4. **Use /commands:** Try `/explain`, `/tests`, `/fix` for specific tasks
5. **Break It Down:** For complex features, use multiple smaller prompts
6. **Review Code:** Always review and test generated code before committing

---

## 🎯 Example Workflow

Here's a sample workflow using these prompts:

1. **Start with analysis:**
   ```
   @workspace Analyze where voice agent should be integrated
   ```

2. **Set up backend:**
   ```
   @workspace Create the ephemeral key endpoint in server.js
   ```

3. **Create types:**
   ```
   @workspace Create voice agent TypeScript types
   ```

4. **Build service:**
   ```
   @workspace Create VoiceAgentService class with WebRTC
   ```

5. **Create hook:**
   ```
   @workspace Create useVoiceAgent React hook
   ```

6. **Build UI:**
   ```
   @workspace Create VoiceButton component
   ```

7. **Integrate:**
   ```
   @workspace Integrate voice agent into App.tsx
   ```

8. **Test:**
   ```
   @workspace Help me test the voice session flow
   ```

9. **Debug:**
   ```
   @workspace Debug why audio isn't working
   ```

10. **Polish:**
    ```
    @workspace Add animations and better UX
    ```

---

## 🚀 Ready to Start?

Copy any prompt above and paste it into GitHub Copilot Chat (`Ctrl+Alt+I`). Copilot will use your project context to generate relevant code!

**Pro Tip:** Open the files you want to modify before running prompts so Copilot has full context.

Good luck! 🎙️✨
