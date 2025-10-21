# 📚 Voice Agent Documentation Index

Welcome! This is your complete guide to implementing the Azure OpenAI Realtime Voice Agent in CloneSite.

---

## 🎯 Quick Navigation

### For First-Time Implementation
**Start here →** [VOICE_AGENT_QUICKSTART.md](./VOICE_AGENT_QUICKSTART.md)

This guide walks you through the implementation step-by-step, from setup to your first working voice session.

### For Detailed Planning
**Reference →** [VOICE_AGENT_IMPLEMENTATION_PLAN.md](./VOICE_AGENT_IMPLEMENTATION_PLAN.md)

Comprehensive technical specification covering architecture, security, all implementation phases, and best practices.

### For Progress Tracking
**Track →** [VOICE_AGENT_CHECKLIST.md](./VOICE_AGENT_CHECKLIST.md)

Detailed checklist to mark off tasks as you complete them. Covers setup, backend, frontend, testing, and deployment.

### For GitHub Copilot Users
**Use →** [COPILOT_PROMPTS_GUIDE.md](./COPILOT_PROMPTS_GUIDE.md)

Ready-to-use Copilot Chat prompts for generating code, debugging, testing, and enhancing your implementation.

---

## 📖 What You'll Build

A real-time voice AI assistant that:
- ✅ Appears as a floating button in the bottom-right corner
- ✅ Uses Azure OpenAI's GPT Realtime API via WebRTC
- ✅ Enables natural voice conversations with low latency
- ✅ Works seamlessly alongside your existing Copilot Studio chat widget
- ✅ Handles microphone permissions, errors, and state management
- ✅ Provides visual feedback with animated status indicators

---

## 🚀 Implementation Overview

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│                     User Browser                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  React Frontend (Port 5173)                      │  │
│  │  ├─ VoiceButton Component (Bottom-Right)        │  │
│  │  ├─ useVoiceAgent Hook                          │  │
│  │  └─ VoiceAgentService (WebRTC)                  │  │
│  └──────────────────────────────────────────────────┘  │
│            │                          ↕                  │
│            │ Ephemeral Key         Audio Stream          │
│            ↓                          ↕                  │
└─────────────────────────────────────────────────────────┘
            │                          ↕
            │                          ↕
┌───────────┴────────────┐   ┌────────┴──────────────────┐
│  Express Backend       │   │   Azure OpenAI            │
│  (Port 3003)          │   │   Realtime API            │
│  POST /api/realtime/  │   │   (WebRTC Endpoint)       │
│  session              │   │                           │
│  ├─ Rate Limiting    │   │   ├─ Speech Recognition   │
│  ├─ Auth with API Key│   │   ├─ AI Processing        │
│  └─ Return           │   │   └─ Speech Synthesis     │
│     Ephemeral Key    │   │                           │
└──────────────────────┘   └───────────────────────────┘
```

### Key Features
1. **Secure Authentication** - Ephemeral keys prevent API key exposure
2. **WebRTC for Low Latency** - Sub-500ms audio streaming
3. **Rate Limiting** - Protection against abuse (5 requests/minute)
4. **Visual Feedback** - Status indicators for connecting, listening, speaking
5. **Error Handling** - Graceful handling of network, permissions, API errors
6. **No Overlap** - Positioned to avoid Copilot Studio widget

---

## ⏱️ Time Estimates

| Phase | Task | Estimated Time |
|-------|------|---------------|
| **Setup** | Azure OpenAI resource + environment variables | 10 min |
| **Backend** | API endpoint + rate limiting | 15 min |
| **Types** | TypeScript interfaces | 5 min |
| **Service** | WebRTC service layer | 25 min |
| **Hook** | React hook | 20 min |
| **UI** | Button component | 15 min |
| **Integration** | Add to App.tsx | 10 min |
| **Testing** | Manual testing + debugging | 30 min |
| **Polish** | UI/UX improvements | 20 min |
| **Total** | **~2.5 hours** | |

*Times assume familiarity with React, TypeScript, and WebRTC concepts*

---

## 🎓 Learning Path

### Recommended Order

1. **Start Simple** 
   - Follow [VOICE_AGENT_QUICKSTART.md](./VOICE_AGENT_QUICKSTART.md)
   - Get basic functionality working first

2. **Understand the Architecture**
   - Read Phase 1-3 of [VOICE_AGENT_IMPLEMENTATION_PLAN.md](./VOICE_AGENT_IMPLEMENTATION_PLAN.md)
   - Understand security model (ephemeral keys)

3. **Implement with Copilot**
   - Use prompts from [COPILOT_PROMPTS_GUIDE.md](./COPILOT_PROMPTS_GUIDE.md)
   - Copy-paste prompts into Copilot Chat

4. **Track Progress**
   - Mark off items in [VOICE_AGENT_CHECKLIST.md](./VOICE_AGENT_CHECKLIST.md)
   - Test each component as you build

5. **Enhance & Polish**
   - Add animations, better UX
   - Implement advanced features
   - Deploy to production

---

## 🛠️ Prerequisites

Before you start, ensure you have:

- [ ] **Azure OpenAI Account** with Realtime API access
- [ ] **Azure OpenAI Resource** deployed in `swedencentral` or `eastus2`
- [ ] **Model Deployment** of `gpt-4o-mini-realtime-preview` or `gpt-4o-realtime-preview`
- [ ] **Node.js 18+** installed locally
- [ ] **VS Code** with GitHub Copilot (recommended)
- [ ] **CloneSite Repository** cloned locally
- [ ] **Basic Understanding** of React, TypeScript, WebRTC concepts

---

## 📦 File Structure

After implementation, your project will have:

```
CloneSite/
├── .env                                    # Backend environment variables
├── server.js                              # Updated with /api/realtime/session
├── homepage-clone/
│   ├── .env.local                         # Frontend environment variables
│   ├── src/
│   │   ├── types/
│   │   │   └── voiceAgent.types.ts       # TypeScript interfaces
│   │   ├── services/
│   │   │   └── voiceAgentService.ts      # WebRTC service
│   │   ├── hooks/
│   │   │   └── useVoiceAgent.ts          # React hook
│   │   ├── components/
│   │   │   ├── VoiceButton.tsx           # Floating button UI
│   │   │   └── VoiceAgentModal.tsx       # Optional modal (enhanced UI)
│   │   └── App.tsx                        # Updated with voice agent
├── VOICE_AGENT_QUICKSTART.md             # This guide!
├── VOICE_AGENT_IMPLEMENTATION_PLAN.md    # Detailed specification
├── VOICE_AGENT_CHECKLIST.md              # Progress tracker
└── COPILOT_PROMPTS_GUIDE.md              # Copilot prompts
```

---

## 🔑 Key Concepts

### Ephemeral Keys
- **What:** Temporary authentication tokens valid for 1 minute
- **Why:** Prevents exposing your standard API key to the frontend
- **How:** Backend mints them using standard API key, returns to frontend

### WebRTC (Web Real-Time Communication)
- **What:** Browser standard for real-time audio/video
- **Why:** Lower latency than WebSockets (~100-300ms vs 500-1000ms)
- **How:** Direct peer connection between browser and Azure OpenAI

### Data Channel
- **What:** WebRTC channel for sending/receiving control events
- **Why:** Separate from audio for configuration and status updates
- **How:** JSON messages sent over RTCDataChannel

### Voice Agent Status States
- `idle` - Not connected, ready to start
- `connecting` - Establishing connection
- `connected` - Connection established, ready
- `listening` - User is speaking
- `speaking` - AI is responding
- `error` - Something went wrong
- `disconnected` - Session ended

---

## 🐛 Common Issues & Solutions

### 1. "Failed to get ephemeral key"
**Cause:** Backend can't reach Azure OpenAI API  
**Fix:** Check `.env` variables, verify API key and resource name

### 2. "Microphone permission denied"
**Cause:** User blocked microphone access  
**Fix:** Guide user to browser settings to enable microphone

### 3. "WebRTC connection failed"
**Cause:** Region mismatch or expired ephemeral key  
**Fix:** Ensure frontend region matches backend resource region

### 4. "Can't hear AI responses"
**Cause:** Audio element not properly set up  
**Fix:** Check browser audio settings, verify ontrack handler

### 5. "Voice button overlaps with chat widget"
**Cause:** Z-index or positioning conflict  
**Fix:** Ensure button is `bottom-6 right-6`, chat widget is `bottom-6 left-6`

See detailed troubleshooting in [VOICE_AGENT_QUICKSTART.md](./VOICE_AGENT_QUICKSTART.md#-common-issues--solutions)

---

## 🎯 Success Criteria

Your implementation is complete when:

- ✅ Voice button appears in bottom-right corner
- ✅ No overlap with Copilot Studio chat widget
- ✅ Can click button to start voice session
- ✅ Microphone permission handled gracefully
- ✅ Can hear AI responses in real-time
- ✅ AI can hear and understand user speech
- ✅ Status indicators update correctly
- ✅ Can end session cleanly
- ✅ Error messages are clear and helpful
- ✅ No API keys exposed in frontend code
- ✅ Rate limiting prevents abuse
- ✅ Works in Chrome, Edge, Firefox
- ✅ Performance is acceptable (<500ms latency)

---

## 🚀 Next Steps After Basic Implementation

Once you have the basic voice agent working:

### Phase 1: Enhance UX
- [ ] Add voice waveform visualization
- [ ] Display real-time transcript
- [ ] Show conversation history
- [ ] Add keyboard shortcuts (spacebar to talk)
- [ ] Implement dark mode support

### Phase 2: Advanced Features
- [ ] Multi-language support
- [ ] Voice interruption handling
- [ ] Context awareness (use cloned website data)
- [ ] Voice selection (different voices)
- [ ] Speed/tone controls

### Phase 3: Production Readiness
- [ ] Add comprehensive error boundaries
- [ ] Implement retry logic
- [ ] Add analytics and monitoring
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing

### Phase 4: Mobile Support
- [ ] Optimize for mobile browsers
- [ ] Touch-friendly controls
- [ ] Responsive modal design
- [ ] PWA capabilities

---

## 📚 Additional Resources

### Azure Documentation
- [Azure OpenAI Realtime API Quickstart](https://learn.microsoft.com/azure/ai-services/openai/realtime-audio-quickstart)
- [Azure OpenAI Service Documentation](https://learn.microsoft.com/azure/ai-services/openai/)

### Web APIs
- [WebRTC API (MDN)](https://developer.mozilla.org/docs/Web/API/WebRTC_API)
- [MediaStream API (MDN)](https://developer.mozilla.org/docs/Web/API/MediaStream)
- [getUserMedia (MDN)](https://developer.mozilla.org/docs/Web/API/MediaDevices/getUserMedia)

### React Resources
- [React Hooks Documentation](https://react.dev/reference/react)
- [TypeScript with React](https://react.dev/learn/typescript)

### GitHub Copilot
- [Copilot Chat Documentation](https://docs.github.com/copilot/using-github-copilot/asking-github-copilot-questions-in-your-ide)
- [Copilot Best Practices](https://docs.github.com/copilot/using-github-copilot/best-practices-for-using-github-copilot)

---

## 💬 Getting Help

If you get stuck:

1. **Check the Documentation**
   - Review the relevant guide from this index
   - Search for your specific error in the troubleshooting sections

2. **Use GitHub Copilot**
   - Reference [COPILOT_PROMPTS_GUIDE.md](./COPILOT_PROMPTS_GUIDE.md)
   - Ask specific questions about errors

3. **Check Browser Console**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

4. **Verify Environment**
   - Ensure all environment variables are set correctly
   - Check that Azure OpenAI resource is in correct region
   - Verify API key is valid

5. **Test Components Individually**
   - Test backend endpoint with curl first
   - Test frontend components in isolation
   - Use React DevTools to inspect state

---

## 🎉 Ready to Build?

Choose your starting point:

- **New to voice AI?** → Start with [VOICE_AGENT_QUICKSTART.md](./VOICE_AGENT_QUICKSTART.md)
- **Want all the details?** → Read [VOICE_AGENT_IMPLEMENTATION_PLAN.md](./VOICE_AGENT_IMPLEMENTATION_PLAN.md)
- **Using GitHub Copilot?** → Jump to [COPILOT_PROMPTS_GUIDE.md](./COPILOT_PROMPTS_GUIDE.md)
- **Need to track progress?** → Open [VOICE_AGENT_CHECKLIST.md](./VOICE_AGENT_CHECKLIST.md)

---

## 📧 Questions?

If you have questions about this implementation:

1. Check the documentation files listed above
2. Review the Azure OpenAI documentation
3. Use GitHub Copilot for code-specific questions
4. Refer to the troubleshooting sections

---

**Good luck with your voice agent implementation! 🎙️🚀**

You're about to add a cutting-edge voice AI feature to your app. Let's make it amazing!

---

*Last Updated: October 21, 2025*  
*Documentation Version: 1.0*  
*Compatible with: Azure OpenAI Realtime API (2025-04-01-preview)*
