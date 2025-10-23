# ✅ Quick Start Checklist - Voice Assistant Integration

## 📋 Before You Start

Print this checklist and check off items as you complete them!

---

## 🎯 Phase 1: Preparation (5 minutes)

- [ ] **Clone your repo locally** (if not already)
  ```bash
  git clone https://github.com/Ronen9/CloneSite.git
  cd CloneSite
  ```

- [ ] **Create a new branch** for this feature
  ```bash
  git checkout -b feature/voice-assistant
  ```

- [ ] **Install dependencies**
  ```bash
  npm install
  cd homepage-clone
  npm install
  cd ..
  ```

- [ ] **Open project in VS Code**
  ```bash
  code .
  ```

- [ ] **Have GitHub Copilot enabled** in VS Code
  - Check: VS Code status bar should show Copilot icon

---

## 🎯 Phase 2: Share Documents with Copilot (2 minutes)

Open these files in VS Code and pin them (right-click tab → Pin):

- [ ] Open `GITHUB_COPILOT_MASTER_PROMPT.md`
- [ ] Open `COPILOT_FILE_SHARING_GUIDE.md`
- [ ] Open `ENVIRONMENT_VARIABLES_REFERENCE.md`
- [ ] Open `/homepage-clone/src/App.tsx`
- [ ] Open `/api/clone.js`

**These will stay open as reference for Copilot throughout the project!**

---

## 🎯 Phase 3: Stage 1 - Environment Setup (10 minutes)

- [ ] Create `.env` file in root directory
  - Copy credentials from `ENVIRONMENT_VARIABLES_REFERENCE.md`
  
- [ ] Update `.gitignore` to include `.env`
  - Ask Copilot: "Review .gitignore and add .env to it"

- [ ] Create `.env.example`
  - Ask Copilot: "Create .env.example with placeholder values"

- [ ] Test environment variables
  ```bash
  node test-env.js
  ```
  (Create test-env.js if needed from ENVIRONMENT_VARIABLES_REFERENCE.md)

- [ ] Commit changes
  ```bash
  git add .gitignore .env.example
  git commit -m "chore: add environment setup"
  ```

**✅ Checkpoint:** .env file exists, .gitignore updated, test passes

---

## 🎯 Phase 4: Stage 2 - Backend API Routes (30 minutes)

### Create voice-session.js
- [ ] Share with Copilot: `GITHUB_COPILOT_MASTER_PROMPT.md` (Stage 2.1) + `/api/clone.js`
- [ ] Ask Copilot to create `/api/voice-session.js`
- [ ] Review code - check no hardcoded keys
- [ ] Test endpoint manually (Postman or curl)

### Create firecrawl-credits.js
- [ ] Ask Copilot to create `/api/firecrawl-credits.js`
- [ ] Review code
- [ ] Test endpoint

### Create firecrawl-scrape.js
- [ ] Ask Copilot to create `/api/firecrawl-scrape.js`
- [ ] Review code
- [ ] Test endpoint

- [ ] Commit API routes
  ```bash
  git add api/
  git commit -m "feat: add voice assistant API routes"
  ```

**✅ Checkpoint:** All 3 API routes created, tested, no hardcoded keys

---

## 🎯 Phase 5: Stage 3 - Tab Navigation (20 minutes)

- [ ] Share with Copilot: `GITHUB_COPILOT_MASTER_PROMPT.md` (Stage 3) + `App.tsx`

- [ ] Ask Copilot to add tab navigation to App.tsx

- [ ] Test tabs in browser
  ```bash
  npm run dev
  # Open http://localhost:5180
  ```

- [ ] Verify:
  - [ ] Clone Site tab still works
  - [ ] Voice Chat tab shows placeholder
  - [ ] Tab switching smooth
  - [ ] Design matches existing aesthetic

- [ ] Commit changes
  ```bash
  git add homepage-clone/src/App.tsx
  git commit -m "feat: add tab navigation for voice chat"
  ```

**✅ Checkpoint:** Tabs work, clone site still functional

---

## 🎯 Phase 6: Stage 4 - VoiceChat Component Structure (30 minutes)

- [ ] Share with Copilot: `GITHUB_COPILOT_MASTER_PROMPT.md` (Stage 4) + UI components

- [ ] Ask Copilot to create `VoiceChat.tsx` (structure only)

- [ ] Review component structure:
  - [ ] All sections present
  - [ ] State management set up
  - [ ] TypeScript types defined
  - [ ] UI matches design

- [ ] Test in browser - should render empty component

- [ ] Commit
  ```bash
  git add homepage-clone/src/components/VoiceChat.tsx
  git commit -m "feat: add VoiceChat component structure"
  ```

**✅ Checkpoint:** VoiceChat component renders, all sections visible

---

## 🎯 Phase 7: Stage 5 - WebRTC Logic (45 minutes)

- [ ] Share with Copilot: `GITHUB_COPILOT_MASTER_PROMPT.md` (Stage 5) + `VoiceChat.tsx`

- [ ] Ask Copilot to add WebRTC functions

- [ ] Review WebRTC logic carefully:
  - [ ] Uses `/api/voice-session` endpoint
  - [ ] No hardcoded keys
  - [ ] Error handling present
  - [ ] Microphone permission handling

- [ ] Test voice session:
  - [ ] Click "Start Voice Session"
  - [ ] Allow microphone
  - [ ] Hear Beti's greeting (Hebrew)
  - [ ] Speak - audio should play back
  - [ ] End session works

- [ ] Commit
  ```bash
  git add homepage-clone/src/components/VoiceChat.tsx
  git commit -m "feat: implement WebRTC voice connection"
  ```

**✅ Checkpoint:** Voice session connects, audio works both ways

---

## 🎯 Phase 8: Stage 6 - Transcript Component (30 minutes)

- [ ] Share with Copilot: `GITHUB_COPILOT_MASTER_PROMPT.md` (Stage 6)

- [ ] Ask Copilot to create `VoiceTranscript.tsx`

- [ ] Test transcript:
  - [ ] User messages appear (blue, right)
  - [ ] Beti messages appear (gray, left)
  - [ ] Auto-scroll works
  - [ ] Clear button works
  - [ ] Hebrew displays correctly
  - [ ] Animations smooth

- [ ] Commit
  ```bash
  git add homepage-clone/src/components/VoiceTranscript.tsx
  git commit -m "feat: add voice transcript component"
  ```

**✅ Checkpoint:** Transcript displays beautifully

---

## 🎯 Phase 9: Stage 7 - Firecrawl Integration (30 minutes)

- [ ] Share with Copilot: `GITHUB_COPILOT_MASTER_PROMPT.md` (Stage 7)

- [ ] Ask Copilot to add Firecrawl functions to VoiceChat.tsx

- [ ] Test Firecrawl:
  - [ ] Credits display on page load
  - [ ] Enter URL and click "Crawl & Populate"
  - [ ] Knowledge base updates with website content
  - [ ] Old content replaced (not duplicated)
  - [ ] Credits refresh after crawl

- [ ] Commit
  ```bash
  git add homepage-clone/src/components/VoiceChat.tsx
  git commit -m "feat: integrate Firecrawl for knowledge base"
  ```

**✅ Checkpoint:** Firecrawl integration works, knowledge base updates

---

## 🎯 Phase 10: Stage 8 - Polish & Styling (30 minutes)

- [ ] Share with Copilot: `GITHUB_COPILOT_MASTER_PROMPT.md` (Stage 8) + all components

- [ ] Ask Copilot to polish styling

- [ ] Review and test:
  - [ ] Colors match App.tsx
  - [ ] Animations smooth
  - [ ] Icons consistent
  - [ ] Responsive (test mobile, tablet, desktop)
  - [ ] Loading states clear
  - [ ] Button states obvious

- [ ] Commit
  ```bash
  git add homepage-clone/src/components/
  git commit -m "style: polish voice chat UI"
  ```

**✅ Checkpoint:** Design cohesive, looks professional

---

## 🎯 Phase 11: Stage 9 - Testing & Bug Fixes (45 minutes)

- [ ] **Tab Navigation Testing**
  - [ ] Tabs switch smoothly
  - [ ] Clone Site still works
  - [ ] Voice Chat displays correctly
  - [ ] No console errors

- [ ] **Voice Session Testing**
  - [ ] Microphone permission works
  - [ ] Audio playback works
  - [ ] Transcription appears (try Hebrew & English)
  - [ ] Beti's greeting plays
  - [ ] End session button works
  - [ ] Button disabled after end

- [ ] **Knowledge Base Testing**
  - [ ] Default text loads
  - [ ] Textarea editable
  - [ ] Strict mode toggle works
  - [ ] Knowledge base used in session

- [ ] **Firecrawl Testing**
  - [ ] Credits display correctly
  - [ ] Quick Scrape works
  - [ ] Full Crawl works
  - [ ] Old content replaced
  - [ ] Status messages accurate

- [ ] **Transcript Testing**
  - [ ] User messages (blue, right)
  - [ ] Beti messages (gray, left)
  - [ ] Auto-scroll works
  - [ ] Clear button works
  - [ ] Hebrew displays correctly

- [ ] **Security Check**
  - [ ] No API keys in frontend code
  - [ ] All keys in .env
  - [ ] .env in .gitignore

- [ ] Fix any bugs found

- [ ] Commit bug fixes
  ```bash
  git add .
  git commit -m "fix: resolve bugs from testing"
  ```

**✅ Checkpoint:** All features work, no bugs, console clean

---

## 🎯 Phase 12: Stage 10 - Deployment Prep (20 minutes)

- [ ] Update `vercel.json` (ask Copilot)

- [ ] Test production build locally
  ```bash
  npm run build
  npm start
  ```

- [ ] Verify build works

- [ ] Commit deployment config
  ```bash
  git add vercel.json
  git commit -m "chore: update Vercel configuration"
  ```

- [ ] Push to GitHub
  ```bash
  git push origin feature/voice-assistant
  ```

- [ ] Create Pull Request on GitHub

- [ ] Merge to main (after review)

**✅ Checkpoint:** Code pushed, ready for deployment

---

## 🎯 Phase 13: Deploy to Vercel (15 minutes)

- [ ] Go to Vercel dashboard

- [ ] Select your CloneSite project

- [ ] Go to Settings → Environment Variables

- [ ] Add all variables from `ENVIRONMENT_VARIABLES_REFERENCE.md`:
  - [ ] `AZURE_OPENAI_API_KEY`
  - [ ] `AZURE_OPENAI_ENDPOINT`
  - [ ] `AZURE_OPENAI_DEPLOYMENT`
  - [ ] `AZURE_OPENAI_RESOURCE`
  - [ ] `FIRECRAWL_API_KEY`

- [ ] Enable for all environments (Production, Preview, Development)

- [ ] Trigger new deployment
  ```bash
  vercel --prod
  ```
  OR just push to main branch (auto-deploys)

- [ ] Wait for deployment to complete

- [ ] Test deployed app:
  - [ ] Visit your Vercel URL
  - [ ] Test Clone Site tab
  - [ ] Test Voice Chat tab
  - [ ] Test full voice session
  - [ ] Test Firecrawl
  - [ ] Check for errors

**✅ Checkpoint:** App deployed and working on Vercel!

---

## 🎯 Final Checklist

- [ ] All features work locally
- [ ] All features work on Vercel
- [ ] No API keys exposed in code
- [ ] No console errors
- [ ] Responsive design works
- [ ] Documentation updated
- [ ] Teammates can clone and run
- [ ] Ready for demo!

---

## 📊 Time Estimates

| Phase | Estimated Time |
|-------|---------------|
| Phase 1-2: Preparation | 7 min |
| Phase 3: Environment Setup | 10 min |
| Phase 4: Backend API | 30 min |
| Phase 5: Tab Navigation | 20 min |
| Phase 6: Component Structure | 30 min |
| Phase 7: WebRTC Logic | 45 min |
| Phase 8: Transcript UI | 30 min |
| Phase 9: Firecrawl | 30 min |
| Phase 10: Polish | 30 min |
| Phase 11: Testing | 45 min |
| Phase 12: Deployment Prep | 20 min |
| Phase 13: Deploy | 15 min |
| **Total** | **~5.5 hours** |

**Realistic timeline with breaks: 1 full day**

---

## 🆘 Emergency Contacts

**If you get stuck:**

1. **Check the guides:**
   - GITHUB_COPILOT_MASTER_PROMPT.md
   - COPILOT_FILE_SHARING_GUIDE.md
   - ENVIRONMENT_VARIABLES_REFERENCE.md

2. **Common Issues:**
   - CORS error → Make sure using `npm run dev`
   - API keys not working → Check `.env` file exists and is loaded
   - Microphone not working → Check browser permissions (must be HTTPS or localhost)
   - Build fails → Check TypeScript errors, missing imports

3. **Ask Copilot:**
   - "Review this error and suggest a fix: [paste error]"
   - "Why isn't [feature] working?"
   - "How do I fix this TypeScript error: [paste error]"

---

## 🎉 Success Celebration!

When you've checked off everything:

- [ ] Take a screenshot of your working Voice Chat
- [ ] Share your demo URL with team
- [ ] Update project README
- [ ] Celebrate! 🎊

---

**Remember:** Follow stages sequentially. Test after each stage. Don't move forward if something doesn't work!

**You've got this! 🚀**
