# ✅ Voice Agent Implementation Checklist

Track your progress implementing the voice agent feature.

---

## 📦 Setup & Prerequisites

- [ ] Azure OpenAI resource created
- [ ] Resource region is `swedencentral` or `eastus2`
- [ ] Model deployed: `gpt-4o-mini-realtime-preview` or `gpt-4o-realtime-preview`
- [ ] API key obtained from Azure portal
- [ ] Repository cloned locally
- [ ] Node.js 18+ installed
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`cd homepage-clone && npm install`)

---

## 🔧 Configuration

### Backend Configuration
- [ ] Created/updated `.env` file in root
- [ ] Added `AZURE_OPENAI_RESOURCE_NAME`
- [ ] Added `AZURE_OPENAI_API_KEY`
- [ ] Added `AZURE_OPENAI_DEPLOYMENT`
- [ ] Added `AZURE_OPENAI_REGION`
- [ ] Added `AZURE_OPENAI_API_VERSION=2025-04-01-preview`
- [ ] Tested: `node -e "require('dotenv').config(); console.log(process.env.AZURE_OPENAI_RESOURCE_NAME)"`

### Frontend Configuration
- [ ] Created `homepage-clone/.env.local`
- [ ] Added `VITE_API_URL=http://localhost:3003`
- [ ] Added `VITE_AZURE_REGION` (matches backend)
- [ ] Added `VITE_AZURE_DEPLOYMENT` (matches backend)
- [ ] Updated `.gitignore` to exclude `.env.local` files

---

## 🔨 Backend Implementation

### Dependencies
- [ ] Installed `express-rate-limit`: `npm install express-rate-limit`

### API Endpoint
- [ ] Imported `express-rate-limit` in `server.js`
- [ ] Created rate limiter (5 requests/minute)
- [ ] Added `POST /api/realtime/session` endpoint
- [ ] Endpoint validates environment variables
- [ ] Endpoint calls Azure sessions API
- [ ] Endpoint returns `{ sessionId, ephemeralKey, expiresAt }`
- [ ] Error handling implemented
- [ ] Tested endpoint with curl:
  ```bash
  curl -X POST http://localhost:3003/api/realtime/session \
    -H "Content-Type: application/json" \
    -d '{"voice":"verse"}'
  ```
- [ ] Response includes valid ephemeral key

---

## 💻 Frontend Implementation

### TypeScript Types
- [ ] Created `homepage-clone/src/types/` folder
- [ ] Created `voiceAgent.types.ts`
- [ ] Defined `VoiceSessionResponse` interface
- [ ] Defined `VoiceAgentConfig` interface
- [ ] Defined `RealtimeEvent` interface
- [ ] Defined `VoiceAgentStatus` type

### Voice Service Layer
- [ ] Created `homepage-clone/src/services/` folder
- [ ] Created `voiceAgentService.ts`
- [ ] Implemented `VoiceAgentService` class:
  - [ ] Constructor accepts config
  - [ ] `initialize(ephemeralKey)` method
  - [ ] Creates `RTCPeerConnection`
  - [ ] Sets up audio element
  - [ ] Gets microphone access with `getUserMedia`
  - [ ] Adds audio track to peer connection
  - [ ] Creates data channel
  - [ ] Sets up data channel listeners
  - [ ] Creates SDP offer
  - [ ] Sends offer to WebRTC URL
  - [ ] Sets remote description
  - [ ] `disconnect()` method for cleanup
  - [ ] `sendEvent()` method
  - [ ] `updateSession()` method
  - [ ] Event handlers for realtime events

### React Hook
- [ ] Created `homepage-clone/src/hooks/` folder
- [ ] Created `useVoiceAgent.ts`
- [ ] Implemented `useVoiceAgent` hook:
  - [ ] `status` state (VoiceAgentStatus)
  - [ ] `error` state (string | null)
  - [ ] `isMuted` state (boolean)
  - [ ] `serviceRef` for VoiceAgentService
  - [ ] `startSession()` function
    - [ ] Fetches ephemeral key from backend
    - [ ] Constructs WebRTC URL
    - [ ] Creates and initializes service
  - [ ] `endSession()` function
  - [ ] `toggleMute()` function
  - [ ] Event listener for `voiceAgentEvent`
  - [ ] Returns all necessary state and functions

### UI Components

#### VoiceButton Component
- [ ] Created `homepage-clone/src/components/VoiceButton.tsx`
- [ ] Installed lucide-react: `cd homepage-clone && npm install lucide-react`
- [ ] Implemented component:
  - [ ] Fixed positioning (bottom-right)
  - [ ] Correct positioning: `bottom-6 right-6`
  - [ ] Z-index set appropriately (z-50)
  - [ ] Icons from lucide-react (Mic, MicOff, Phone)
  - [ ] Color changes based on status:
    - [ ] idle: blue
    - [ ] connecting: yellow
    - [ ] connected/listening/speaking: green with pulse
    - [ ] error: red
  - [ ] Status text displayed when active
  - [ ] onClick handler
  - [ ] Accessible (aria-label)
  - [ ] Responsive styling

#### VoiceAgentModal (Optional)
- [ ] Created `VoiceAgentModal.tsx` (if desired)
- [ ] Displays detailed status
- [ ] Shows controls (mute, volume)
- [ ] Close button
- [ ] Proper positioning relative to button

### App Integration
- [ ] Opened `homepage-clone/src/App.tsx`
- [ ] Imported `useState` from React
- [ ] Imported `VoiceButton` component
- [ ] Imported `useVoiceAgent` hook
- [ ] Added voice agent hook usage
- [ ] Created `handleVoiceToggle` function
- [ ] Added `<VoiceButton />` component at bottom
- [ ] Added error notification UI
- [ ] Verified no overlap with Copilot chat widget (bottom-left)

---

## 🧪 Testing

### Backend Testing
- [ ] Server starts without errors: `npm run server`
- [ ] Environment variables load correctly
- [ ] Can generate ephemeral key via curl
- [ ] Rate limiting works (test 6 requests in quick succession)
- [ ] Error handling works (test with invalid config)
- [ ] API key not exposed in responses

### Frontend Testing
- [ ] Frontend starts without errors: `cd homepage-clone && npm run dev`
- [ ] No TypeScript errors
- [ ] Voice button visible in bottom-right
- [ ] Button positioned correctly
- [ ] No overlap with existing Copilot chat widget

### Integration Testing
- [ ] Both backend and frontend running
- [ ] Can click voice button
- [ ] Microphone permission prompt appears
- [ ] Permission granted
- [ ] Button changes from blue to yellow (connecting)
- [ ] Button changes to green (connected)
- [ ] Console shows "Data channel opened"
- [ ] Can speak and hear echo/response
- [ ] Can click button again to disconnect
- [ ] Button returns to blue (idle)
- [ ] No errors in console

### Browser Testing
- [ ] Works in Chrome
- [ ] Works in Edge  
- [ ] Works in Firefox
- [ ] Works in Safari (if on Mac)

### Error Handling Testing
- [ ] Handles microphone permission denial gracefully
- [ ] Shows error message if backend is down
- [ ] Shows error if ephemeral key generation fails
- [ ] Shows error if WebRTC connection fails
- [ ] Can recover from errors

### Audio Quality Testing
- [ ] Audio is clear (no distortion)
- [ ] No echo or feedback
- [ ] Latency acceptable (<500ms)
- [ ] AI responses audible
- [ ] User input captured correctly

---

## 🎨 UI/UX Polish

- [ ] Button animations smooth
- [ ] Hover effects work
- [ ] Focus states accessible
- [ ] Status text readable
- [ ] Colors provide good contrast
- [ ] Loading states clear
- [ ] Error states obvious
- [ ] Responsive on mobile (if applicable)
- [ ] No UI jank or flicker
- [ ] Transitions smooth

---

## 🔒 Security Review

- [ ] Standard API key in backend `.env` only
- [ ] API key NOT in frontend code
- [ ] API key NOT in git repository
- [ ] Ephemeral keys used for WebRTC
- [ ] Rate limiting active
- [ ] CORS configured properly
- [ ] No sensitive data in console logs (production)
- [ ] Environment files in `.gitignore`

---

## 📱 Production Readiness

- [ ] Error boundaries added
- [ ] Logging implemented
- [ ] Analytics tracking (optional)
- [ ] Environment variables set in hosting platform
- [ ] HTTPS enabled (required for microphone access)
- [ ] Tested on production URL
- [ ] Performance acceptable
- [ ] No memory leaks
- [ ] Cleanup on unmount

---

## 📚 Documentation

- [ ] Code comments added where needed
- [ ] README updated with voice agent feature
- [ ] Environment variables documented
- [ ] Setup instructions clear
- [ ] Troubleshooting guide available
- [ ] API endpoint documented

---

## 🚀 Deployment

- [ ] Backend deployed with environment variables
- [ ] Frontend deployed with environment variables
- [ ] DNS/domain configured
- [ ] HTTPS certificate installed
- [ ] Tested on production domain
- [ ] Monitoring set up
- [ ] Alerts configured

---

## ✨ Nice-to-Have Enhancements

- [ ] Voice waveform visualization
- [ ] Transcript display (show text)
- [ ] Conversation history
- [ ] Multiple voice options
- [ ] Language selection
- [ ] Dark mode support
- [ ] Keyboard shortcuts
- [ ] Mobile optimization
- [ ] Accessibility improvements
- [ ] Unit tests
- [ ] E2E tests
- [ ] Performance monitoring
- [ ] Usage analytics

---

## 🐛 Known Issues

List any issues you encounter:

1. _Issue description_
   - [ ] Reproduced
   - [ ] Root cause identified
   - [ ] Fix implemented
   - [ ] Tested

---

## 📝 Notes

Add any important notes or observations:

- 
- 
- 

---

## 🎯 Success Criteria

The voice agent is complete when:

- [x] Voice button appears in bottom-right corner
- [x] No interference with existing Copilot chat (bottom-left)
- [x] Can start voice session with one click
- [x] Microphone permission handled gracefully
- [x] Real-time audio works both ways
- [x] Can hear AI responses clearly
- [x] AI can hear user input
- [x] Can end session cleanly
- [x] Status updates clear and accurate
- [x] Error messages helpful
- [x] No API keys exposed to frontend
- [x] Rate limiting prevents abuse
- [x] Works in major browsers
- [x] Performance acceptable (low latency)
- [x] UI/UX polished and professional

---

**Started:** ___________  
**Completed:** ___________  
**Total Time:** ___________  

**Implemented by:** ___________  
**Reviewed by:** ___________  

---

## 🎉 Celebration

Once all critical items are checked:

- [ ] Demo'd to team
- [ ] Shared on social media (optional)
- [ ] Blogged about it (optional)
- [ ] Updated portfolio (optional)

**Congratulations on implementing voice AI! 🚀🎙️**
