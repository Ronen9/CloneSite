# 📁 What to Share with GitHub Copilot - Quick Reference

## 🎯 Overview
This document tells you EXACTLY which files to share with GitHub Copilot and in what order for best results.

---

## 📂 STAGE-BY-STAGE File Sharing Guide

### 🔹 STAGE 1: Environment Setup

**Share these files with Copilot:**
1. `.gitignore` (existing file - to modify)
2. `GITHUB_COPILOT_MASTER_PROMPT.md` (the master plan)

**Prompt for Copilot:**
```
I need help setting up environment variables for my project. 
Please review the .gitignore file and add .env to it.
Then help me create:
1. .env file with the credentials from GITHUB_COPILOT_MASTER_PROMPT.md Stage 1
2. .env.example template (without actual values)

Make sure .env is properly ignored by git.
```

**Expected Output:**
- Modified `.gitignore`
- New `.env` file
- New `.env.example` file

---

### 🔹 STAGE 2: Backend API Routes

**Share these files with Copilot:**
1. `GITHUB_COPILOT_MASTER_PROMPT.md` (Stage 2 section)
2. `/api/clone.js` (existing - as reference for patterns)
3. `server.js` (existing - to understand Express setup)

**Prompt for Copilot:**
```
I need to create 3 new API routes in the /api folder for my Voice Assistant feature.
Please review /api/clone.js to understand the pattern we use.

Create these files following GITHUB_COPILOT_MASTER_PROMPT.md Stage 2:
1. /api/voice-session.js - for Azure OpenAI ephemeral key generation
2. /api/firecrawl-credits.js - for checking Firecrawl credits
3. /api/firecrawl-scrape.js - for website scraping

All routes should:
- Use environment variables (never hardcode keys)
- Have proper error handling
- Enable CORS
- Follow the same pattern as clone.js
```

**Expected Output:**
- `/api/voice-session.js`
- `/api/firecrawl-credits.js`
- `/api/firecrawl-scrape.js`

---

### 🔹 STAGE 3: Frontend Tab Navigation

**Share these files with Copilot:**
1. `GITHUB_COPILOT_MASTER_PROMPT.md` (Stage 3 section)
2. `/homepage-clone/src/App.tsx` (existing - to modify)
3. `/homepage-clone/src/components/ui/card.tsx` (for UI components reference)

**Prompt for Copilot:**
```
I need to add tab navigation to App.tsx to switch between "Clone Site" and "Voice Chat".

Please modify /homepage-clone/src/App.tsx following Stage 3 of GITHUB_COPILOT_MASTER_PROMPT.md:
1. Add tab state management
2. Create tab navigation UI above the main card
3. Use Phosphor Icons (Globe for Clone Site, Microphone for Voice Chat)
4. Match the existing design aesthetic (backdrop blur, gradients, etc.)
5. Conditionally render existing clone UI or new <VoiceChat /> component

Keep all existing clone functionality working!
```

**Expected Output:**
- Modified `/homepage-clone/src/App.tsx` with tabs

---

### 🔹 STAGE 4: Voice Chat Component Structure

**Share these files with Copilot:**
1. `GITHUB_COPILOT_MASTER_PROMPT.md` (Stage 4 section)
2. `/homepage-clone/src/App.tsx` (for design patterns)
3. `/homepage-clone/src/components/ui/*` (all UI components)

**Prompt for Copilot:**
```
Create the main VoiceChat component following Stage 4 of GITHUB_COPILOT_MASTER_PROMPT.md.

The component should have these sections:
1. Voice Configuration (voice selector, temperature slider, language)
2. Knowledge Base Editor (textarea with Beti's Hebrew personality)
3. Knowledge Base Only Mode toggle
4. Firecrawl Integration section (visible when strict mode ON)
5. Session Control buttons (Start/End Session)
6. Transcript display placeholder

Create /homepage-clone/src/components/VoiceChat.tsx with:
- All state management
- UI structure (no logic yet)
- TypeScript types
- Matching the existing design aesthetic from App.tsx

Don't implement WebRTC logic yet - just the UI structure and state.
```

**Expected Output:**
- `/homepage-clone/src/components/VoiceChat.tsx` (structure only)

---

### 🔹 STAGE 5: WebRTC Voice Connection Logic

**Share these files with Copilot:**
1. `GITHUB_COPILOT_MASTER_PROMPT.md` (Stage 5 section)
2. `/homepage-clone/src/components/VoiceChat.tsx` (from Stage 4)

**Prompt for Copilot:**
```
Now I need to implement the WebRTC voice connection logic in VoiceChat.tsx.

Add these functions following Stage 5 of GITHUB_COPILOT_MASTER_PROMPT.md:
1. startVoiceSession() - fetches ephemeral key and initializes WebRTC
2. initializeWebRTC() - creates peer connection, audio, microphone, data channel
3. updateSession() - sends session config and Beti's greeting
4. handleDataChannelMessage() - processes transcription and responses
5. endVoiceSession() - cleans up connections

Make sure to:
- Use the /api/voice-session endpoint (don't hardcode keys!)
- Handle microphone permissions
- Process transcription events
- Accumulate Beti's response deltas
- Add messages to transcript state
```

**Expected Output:**
- `/homepage-clone/src/components/VoiceChat.tsx` (with WebRTC logic)

---

### 🔹 STAGE 6: Transcript UI Component

**Share these files with Copilot:**
1. `GITHUB_COPILOT_MASTER_PROMPT.md` (Stage 6 section)
2. `/homepage-clone/src/App.tsx` (for design reference)

**Prompt for Copilot:**
```
Create a beautiful chat bubble transcript component following Stage 6 of GITHUB_COPILOT_MASTER_PROMPT.md.

Create /homepage-clone/src/components/VoiceTranscript.tsx with:
- WhatsApp/iMessage style chat bubbles
- User messages: blue, right-aligned
- Beti messages: gray, left-aligned
- Auto-scroll to latest message
- Clear transcript button
- Smooth fade-in animations using Framer Motion
- Empty state message
- RTL support for Hebrew text

Match the design aesthetic from App.tsx (backdrop blur, rounded corners, etc.)
```

**Expected Output:**
- `/homepage-clone/src/components/VoiceTranscript.tsx`

---

### 🔹 STAGE 7: Firecrawl Integration

**Share these files with Copilot:**
1. `GITHUB_COPILOT_MASTER_PROMPT.md` (Stage 7 section)
2. `/homepage-clone/src/components/VoiceChat.tsx` (to modify)

**Prompt for Copilot:**
```
Add Firecrawl integration logic to VoiceChat.tsx following Stage 7 of GITHUB_COPILOT_MASTER_PROMPT.md.

Implement:
1. fetchCredits() - calls /api/firecrawl-credits endpoint
2. handleCrawl() - calls /api/firecrawl-scrape endpoint
3. Knowledge base update logic (replace old content with MARKER system)
4. Status messages and loading states
5. Credits refresh after crawl

The flow should be:
- User enters URL and clicks "Crawl & Populate"
- Show loading status
- Call backend API (keeps API key secure)
- Update knowledge base (remove old website content, add new)
- Refresh credits display
- Show success message
```

**Expected Output:**
- Updated `/homepage-clone/src/components/VoiceChat.tsx` with Firecrawl integration

---

### 🔹 STAGE 8: Styling and Polish

**Share these files with Copilot:**
1. `GITHUB_COPILOT_MASTER_PROMPT.md` (Stage 8 section)
2. All VoiceChat component files
3. `/homepage-clone/src/App.tsx` (for reference)
4. `/homepage-clone/tailwind.config.ts` (for colors)

**Prompt for Copilot:**
```
Polish the Voice Chat UI to match the existing CloneSite design following Stage 8.

Review all Voice Chat components and:
1. Match color scheme from App.tsx (violet/indigo/rose gradients)
2. Use backdrop-blur-xl and glassmorphism effects
3. Add Framer Motion animations for smooth transitions
4. Use Phosphor Icons consistently
5. Make fully responsive (mobile, tablet, desktop)
6. Add loading states with spinners
7. Ensure button states (disabled, hover, active) are clear

Make it look like it's part of the original app!
```

**Expected Output:**
- Polished VoiceChat components matching design

---

### 🔹 STAGE 9: Testing and Bug Fixes

**Share these files with Copilot:**
1. `GITHUB_COPILOT_MASTER_PROMPT.md` (Stage 9 section)
2. All project files for review

**Prompt for Copilot:**
```
Review all Voice Chat code following the Stage 9 testing checklist in GITHUB_COPILOT_MASTER_PROMPT.md.

Check for:
- Tab navigation working
- Voice session functioning
- Transcription displaying
- Firecrawl integration working
- Security (no hardcoded keys)
- Console errors
- TypeScript errors
- Responsive design issues

Fix any bugs you find.
```

**Expected Output:**
- Bug fixes and improvements

---

### 🔹 STAGE 10: Deployment Configuration

**Share these files with Copilot:**
1. `GITHUB_COPILOT_MASTER_PROMPT.md` (Stage 10 section)
2. `vercel.json` (existing - to modify)
3. `package.json` (root - may need updates)

**Prompt for Copilot:**
```
Prepare the project for Vercel deployment following Stage 10.

Update:
1. vercel.json - add environment variable configuration
2. Ensure all API routes are properly configured
3. Check build scripts in package.json

Provide instructions for:
- Setting environment variables in Vercel dashboard
- Testing locally before deployment
- Deployment process
```

**Expected Output:**
- Updated `vercel.json`
- Deployment instructions

---

## 🎯 Pro Tips for Working with GitHub Copilot

### 1. **Share Context First**
Always start by sharing the master prompt and relevant existing files before asking Copilot to create something new.

### 2. **One Stage at a Time**
Complete each stage fully and test it before moving to the next. Don't try to do multiple stages at once.

### 3. **Reference Existing Patterns**
When creating new files, always share similar existing files (like `/api/clone.js`) so Copilot understands your patterns.

### 4. **Be Specific**
Instead of "create a voice chat component", say "create VoiceChat.tsx following Stage 4 of the master prompt with state management for session, transcript, and config".

### 5. **Iterate**
If Copilot's first attempt isn't perfect, share the generated code and ask for specific improvements:
```
Review this code and:
1. Add TypeScript types for all state variables
2. Add error handling to the API call
3. Match the button styling from App.tsx
```

### 6. **Test After Each Stage**
Run `npm run dev` and test each feature as you build it. Fix issues immediately.

---

## 📝 Quick Checklist

Before asking Copilot for help, make sure you have:
- [ ] Shared GITHUB_COPILOT_MASTER_PROMPT.md
- [ ] Shared relevant existing files for reference
- [ ] Specified which STAGE you're working on
- [ ] Been clear about the expected output
- [ ] Mentioned any specific patterns or styles to follow

---

## 🚫 Common Mistakes to Avoid

❌ **Don't:** Share entire codebase at once - Copilot will get confused
✅ **Do:** Share only relevant files for current stage

❌ **Don't:** Skip stages or try to do multiple stages together
✅ **Do:** Follow stages sequentially and verify each one works

❌ **Don't:** Accept code with hardcoded API keys
✅ **Do:** Always use environment variables and backend API routes

❌ **Don't:** Forget to share the master prompt
✅ **Do:** Always start with GITHUB_COPILOT_MASTER_PROMPT.md

❌ **Don't:** Move forward if something doesn't work
✅ **Do:** Fix issues immediately before proceeding

---

## 🎉 Success Pattern

**The winning formula:**
1. Share master prompt + relevant files
2. Ask for one specific thing (one stage)
3. Review generated code
4. Test it (`npm run dev`)
5. Fix any issues
6. Move to next stage

**Example conversation:**
```
YOU: "Here's GITHUB_COPILOT_MASTER_PROMPT.md and App.tsx. 
I'm working on Stage 3 - adding tab navigation. 
Please modify App.tsx to add tabs for 'Clone Site' and 'Voice Chat' 
matching the existing design aesthetic."

COPILOT: [generates code]

YOU: "Great! Let me test this... The tabs work but the Voice Chat icon 
is wrong. Can you use the Microphone icon from Phosphor instead?"

COPILOT: [fixes icon]

YOU: "Perfect! Now moving to Stage 4..."
```

---

**Follow this guide and you'll have a smooth experience with GitHub Copilot! 🚀**
