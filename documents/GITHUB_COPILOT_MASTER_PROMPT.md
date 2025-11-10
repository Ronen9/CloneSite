# 🎯 GitHub Copilot Master Prompt: Add Voice Assistant to CloneSite

## 📌 Project Context
You are working on the **CloneSite** project - a React + TypeScript website cloning tool that uses Firecrawl API. The project structure:
- **Frontend:** React + TypeScript + Tailwind CSS + Vite (in `/homepage-clone` folder)
- **Backend:** Express.js with API routes (in `/api` folder and `server.js`)
- **Current Feature:** Clone websites and inject Copilot Studio chat scripts
- **Deployment:** Vercel (primary) and Azure (secondary)

## 🎯 Mission: Add Voice Assistant Feature

Add a new **Voice Chat** tab/page that provides:
1. Real-time voice conversation with Azure OpenAI Realtime API
2. Firecrawl integration to populate knowledge base from websites
3. Conversation transcript with chat bubbles
4. Beautiful UI matching the existing design aesthetic
5. Complete backend API security (no exposed keys in frontend)

## 📂 Existing Project Structure
```
CloneSite/
├── homepage-clone/               # React frontend (TypeScript)
│   ├── src/
│   │   ├── App.tsx              # Main app with website cloning
│   │   ├── components/ui/       # shadcn/ui components
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── styles/
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── api/
│   └── clone.js                 # Vercel serverless function for cloning
├── server.js                    # Express development server
├── package.json                 # Root dependencies
├── vercel.json                  # Vercel deployment config
└── .gitignore
```

---

## 🚀 IMPLEMENTATION PLAN - FOLLOW THESE STAGES SEQUENTIALLY

### 📍 STAGE 1: Environment Setup
**Goal:** Set up environment variables and update .gitignore

**Files to create/modify:**
1. Create `.env` file (root directory)
2. Update `.gitignore` to include `.env`
3. Create `.env.example` template

**Actions:**
```bash
# Create .env file with these credentials:
AZURE_OPENAI_API_KEY=1FdVYUoTnKj9c5BRX6LjgwsY9WQOTaGXQODR7AZubepupsSx8hWGJQQJ99BJACfhMk5XJ3w3AAABACOGly2w
AZURE_OPENAI_ENDPOINT=https://ronen-openai-realtime.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=ronen-deployment-gpt-4o-realtime-preview
AZURE_OPENAI_RESOURCE=ronen-openai-realtime
FIRECRAWL_API_KEY=your-firecrawl-api-key-here
```

**Verify:**
- [ ] `.env` file exists in root directory
- [ ] `.env` is added to `.gitignore`
- [ ] `.env.example` created (without actual values)

---

### 📍 STAGE 2: Backend API Routes
**Goal:** Create secure API routes for Azure OpenAI and Firecrawl

**Files to create:**

#### 2.1: `/api/voice-session.js`
Create Vercel serverless function to generate ephemeral keys for Azure OpenAI Realtime API.

**Requirements:**
- Read `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT` from environment
- POST endpoint that creates a session and returns ephemeral key
- Handle errors gracefully
- CORS enabled

**API Endpoint:** `POST /api/voice-session`
**Request Body:** 
```json
{
  "voice": "coral",
  "temperature": 0.7,
  "instructions": "System instructions here..."
}
```
**Response:**
```json
{
  "sessionId": "...",
  "ephemeralKey": "...",
  "endpoint": "wss://..."
}
```

#### 2.2: `/api/firecrawl-credits.js`
Create endpoint to check Firecrawl credits (avoids exposing API key in frontend).

**Requirements:**
- Read `FIRECRAWL_API_KEY` from environment
- GET endpoint: `GET /api/firecrawl-credits`
- Fetch from `https://api.firecrawl.dev/v2/team/credit-usage`
- Return credits info

**Response:**
```json
{
  "success": true,
  "remainingCredits": 50378,
  "planCredits": 500000,
  "billingPeriodEnd": "2025-11-30T23:59:59Z"
}
```

#### 2.3: `/api/firecrawl-scrape.js`
Create endpoint to scrape websites using Firecrawl (keeps API key secure).

**Requirements:**
- Read `FIRECRAWL_API_KEY` from environment
- POST endpoint: `POST /api/firecrawl-scrape`
- Support both "quick scrape" and "full crawl"
- Handle async crawl job polling

**Request Body:**
```json
{
  "url": "https://example.com",
  "type": "scrape" // or "crawl"
}
```

**Verify Stage 2:**
- [ ] `/api/voice-session.js` created
- [ ] `/api/firecrawl-credits.js` created
- [ ] `/api/firecrawl-scrape.js` created
- [ ] All API routes use environment variables (not hardcoded keys)
- [ ] Error handling implemented
- [ ] CORS properly configured

---

### 📍 STAGE 3: Frontend Tab Navigation
**Goal:** Add tab switcher to App.tsx to toggle between "Clone Site" and "Voice Chat"

**File to modify:** `/homepage-clone/src/App.tsx`

**Requirements:**
1. Add state: `const [activeTab, setActiveTab] = useState<'clone' | 'voice'>('clone')`
2. Create tab navigation UI above the card (matching existing design aesthetic)
3. Conditionally render existing clone UI OR new voice chat component
4. Use Phosphor Icons for tab icons
5. Maintain existing styling patterns (Tailwind, backdrop blur, gradients)

**Tab Design Pattern:**
```tsx
<div className="flex gap-2 mb-4 p-1 bg-white/30 backdrop-blur rounded-lg">
  <button 
    onClick={() => setActiveTab('clone')}
    className={activeTab === 'clone' ? 'active-tab' : 'inactive-tab'}
  >
    <Globe /> Clone Site
  </button>
  <button 
    onClick={() => setActiveTab('voice')}
    className={activeTab === 'voice' ? 'active-tab' : 'inactive-tab'}
  >
    <Microphone /> Voice Chat
  </button>
</div>
```

**Verify Stage 3:**
- [ ] Tab navigation added to App.tsx
- [ ] Tabs switch between "Clone Site" and "Voice Chat"
- [ ] Existing clone functionality still works
- [ ] Design matches existing aesthetic

---

### 📍 STAGE 4: Voice Chat Component (Frontend)
**Goal:** Create the main VoiceChat component

**File to create:** `/homepage-clone/src/components/VoiceChat.tsx`

**Component Structure:**
```tsx
import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// ... other imports

export function VoiceChat() {
  // State management
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [transcript, setTranscript] = useState<Message[]>([])
  const [knowledgeBase, setKnowledgeBase] = useState('')
  const [strictMode, setStrictMode] = useState(false)
  const [voiceConfig, setVoiceConfig] = useState({ voice: 'coral', temperature: 0.7 })
  const [credits, setCredits] = useState<number | null>(null)
  
  // WebRTC and audio refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  return (
    <Card className="backdrop-blur-xl bg-card/70 shadow-2xl border-white/20 p-8">
      {/* Voice Configuration */}
      {/* Knowledge Base Editor */}
      {/* Firecrawl Integration */}
      {/* Start/End Session Buttons */}
      {/* Transcript Display */}
    </Card>
  )
}
```

**Key Features to Implement:**

1. **Voice Configuration Section**
   - Voice selector (8 voices: alloy, echo, shimmer, ash, ballad, coral, sage, verse)
   - Temperature slider (0-1)
   - Primary language selector (Hebrew/English)

2. **Knowledge Base Section**
   - Toggle for "Knowledge Base Only Mode"
   - Editable textarea with Beti's personality (Hebrew instructions)
   - Firecrawl section (visible when strict mode ON)

3. **Firecrawl Integration**
   - API Key input (optional - uses backend by default)
   - Credits display (fetched from `/api/firecrawl-credits`)
   - Crawl type selector (Quick Scrape / Full Crawl)
   - Website URL input
   - "Crawl & Populate" button
   - Status messages

4. **Session Controls**
   - "Start Voice Session" button
   - "End Session" button (disabled after session ends)
   - Microphone permission handling

5. **Transcript Display**
   - Chat bubble UI (user: blue right-aligned, Beti: gray left-aligned)
   - Auto-scroll to latest message
   - "Clear Transcript" button
   - Smooth animations

**Default Knowledge Base (Hebrew):**
```
אני בטי - הבוטית החברותית כאן תמיד לעזרתך
התנהגי כך:
הגיבי בצורה חברותית, מתוקה ומרגיעה, הוסיפי אווירה נעימה וחיוך גם במצבים מורכבים.השתמשי בהומור בריא ובחכמה כדי למצוא חן בעיני הלקוח, תחמיאי לו\לה מידי פעם ותמיד ברמה מקצועית וממלכתית.
אל תספקי: ייעוץ רפואי, משפטי או כלכלי. הפני משתמשים למשאבים רשמיים או לרשויות המתאימות.
כשיוצאים מהנושא לתחומים אישיים כמו למשל הזמנה לדייט או למסעדה או כל דבר אישי אחר, עני בחיוך ובחוש הומור בריא ותחזירי לנושא. דוגמה: "חחחח... מצחיק! הדייט היחידי שאני יכולה לסדר לך זה עם שרגא המתכנת שבנה אותי 😄 מה אתה אומר?"
הבטיחי נגישות לכל המשתמשים ותשמרי על פרטיות - אל תאספי מידע אישי אלא אם נחוץ לאינטראקציה.
חשוב:
אל תכלול אימוג'י או כוכביות או כל סימנים מיותרים אחרים. כלול רק טקסט וסימני פיסוק בתשובתך.
בטי זו נקבה.
פנה ללקוח לפי המגדר שלו או שלה. בתחילת השיחה תוכל לזהות את הפונה לפי איך שהוא מזדהה או מציג את עצמו או עמצה.
בטי עונה תשובות קצרות לא יותר מ 3 עד 4 משפטים אלא אם כן בתשובה נדרש פירוט נרחב יותר.

<!-- WEBSITE_CONTENT_MARKER -->
```

**Verify Stage 4:**
- [ ] VoiceChat.tsx component created
- [ ] All UI sections implemented
- [ ] State management in place
- [ ] No API keys in frontend code
- [ ] TypeScript types defined properly

---

### 📍 STAGE 5: WebRTC Voice Connection Logic
**Goal:** Implement Azure OpenAI Realtime API connection with WebRTC

**File to modify:** `/homepage-clone/src/components/VoiceChat.tsx`

**Add these functions:**

#### 5.1: `startVoiceSession()`
```typescript
const startVoiceSession = async () => {
  try {
    // 1. Fetch ephemeral key from backend
    const response = await fetch('/api/voice-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voice: voiceConfig.voice,
        temperature: voiceConfig.temperature,
        instructions: knowledgeBase
      })
    })
    
    const { sessionId, ephemeralKey, endpoint } = await response.json()
    
    // 2. Initialize WebRTC
    await initializeWebRTC(ephemeralKey)
    
    setIsSessionActive(true)
  } catch (error) {
    console.error('Failed to start session:', error)
  }
}
```

#### 5.2: `initializeWebRTC(ephemeralKey)`
```typescript
const initializeWebRTC = async (ephemeralKey: string) => {
  // 1. Create RTCPeerConnection
  const peerConnection = new RTCPeerConnection()
  peerConnectionRef.current = peerConnection
  
  // 2. Set up audio playback
  const audioElement = document.createElement('audio')
  audioElement.autoplay = true
  audioElementRef.current = audioElement
  
  peerConnection.ontrack = (event) => {
    audioElement.srcObject = event.streams[0]
  }
  
  // 3. Get microphone access
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const audioTrack = stream.getAudioTracks()[0]
  peerConnection.addTrack(audioTrack)
  
  // 4. Create data channel
  const dataChannel = peerConnection.createDataChannel('realtime-channel')
  dataChannelRef.current = dataChannel
  
  dataChannel.addEventListener('open', () => {
    updateSession(dataChannel)
  })
  
  dataChannel.addEventListener('message', handleDataChannelMessage)
  
  // 5. Establish WebRTC connection
  const offer = await peerConnection.createOffer()
  await peerConnection.setLocalDescription(offer)
  
  const sdpResponse = await fetch(
    `https://ronen-openai-realtime.openai.azure.com/openai/realtime?api-version=2024-10-01-preview&deployment=ronen-deployment-gpt-4o-realtime-preview`,
    {
      method: 'POST',
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${ephemeralKey}`,
        'Content-Type': 'application/sdp'
      }
    }
  )
  
  const answer = { type: 'answer' as RTCSdpType, sdp: await sdpResponse.text() }
  await peerConnection.setRemoteDescription(answer)
}
```

#### 5.3: `updateSession(dataChannel)`
```typescript
const updateSession = (dataChannel: RTCDataChannel) => {
  const event = {
    type: 'session.update',
    session: {
      instructions: knowledgeBase,
      voice: voiceConfig.voice,
      temperature: voiceConfig.temperature,
      input_audio_transcription: {
        model: 'whisper-1'
      },
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500
      },
      modalities: ['text', 'audio']
    }
  }
  
  dataChannel.send(JSON.stringify(event))
  
  // Send Beti's opening greeting after 1 second
  setTimeout(() => {
    const greetingEvent = {
      type: 'response.create',
      response: {
        modalities: ['text', 'audio'],
        instructions: 'Say exactly this in Hebrew: היי אני בטי, עם מי יש לי את הכבוד?'
      }
    }
    dataChannel.send(JSON.stringify(greetingEvent))
  }, 1000)
}
```

#### 5.4: `handleDataChannelMessage(event)`
```typescript
const handleDataChannelMessage = (event: MessageEvent) => {
  const message = JSON.parse(event.data)
  
  // Handle user transcription
  if (message.type === 'conversation.item.input_audio_transcription.completed') {
    addToTranscript('user', message.transcript)
  }
  
  // Handle Beti's response (accumulate deltas)
  if (message.type === 'response.audio_transcript.delta') {
    currentBetiResponse += message.delta
  }
  
  // Handle complete response
  if (message.type === 'response.audio_transcript.done') {
    if (currentBetiResponse.trim()) {
      addToTranscript('beti', currentBetiResponse.trim())
      currentBetiResponse = ''
    }
  }
  
  // Handle errors
  if (message.type === 'error') {
    console.error('Session error:', message.error)
  }
}
```

#### 5.5: `endVoiceSession()`
```typescript
const endVoiceSession = () => {
  if (dataChannelRef.current) dataChannelRef.current.close()
  if (peerConnectionRef.current) peerConnectionRef.current.close()
  if (audioElementRef.current) audioElementRef.current.remove()
  
  setIsSessionActive(false)
}
```

**Verify Stage 5:**
- [ ] WebRTC connection logic implemented
- [ ] Audio playback works
- [ ] Microphone capture works
- [ ] Data channel message handling works
- [ ] Session start/end functions work
- [ ] Error handling in place

---

### 📍 STAGE 6: Transcript UI Component
**Goal:** Create beautiful chat bubble transcript display

**File to create:** `/homepage-clone/src/components/VoiceTranscript.tsx`

**Requirements:**
```typescript
interface Message {
  role: 'user' | 'beti'
  content: string
  timestamp: Date
}

export function VoiceTranscript({ 
  messages, 
  onClear 
}: { 
  messages: Message[]
  onClear: () => void 
}) {
  const transcriptRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [messages])
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">💬 Conversation Transcript</h3>
        <Button onClick={onClear} variant="outline" size="sm">
          🗑️ Clear Transcript
        </Button>
      </div>
      
      <div 
        ref={transcriptRef}
        className="bg-gray-50 rounded-lg p-4 max-h-[500px] overflow-y-auto"
      >
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center italic">
            Start a voice session to see the conversation transcript here...
          </p>
        ) : (
          messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] rounded-2xl p-3 ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white rounded-br-sm' 
                  : 'bg-gray-200 text-gray-800 rounded-bl-sm'
              }`}>
                <div className="text-xs font-bold mb-1">
                  {msg.role === 'user' ? 'User:' : 'Beti:'}
                </div>
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
```

**Styling Requirements:**
- User messages: Blue (#0078d4), right-aligned
- Beti messages: Gray (#e9ecef), left-aligned
- Smooth fade-in animations
- Auto-scroll to latest
- Empty state message
- RTL support for Hebrew

**Verify Stage 6:**
- [ ] VoiceTranscript component created
- [ ] Chat bubbles display correctly
- [ ] Auto-scroll works
- [ ] Clear button works
- [ ] Animations smooth
- [ ] Hebrew text displays correctly

---

### 📍 STAGE 7: Firecrawl Integration (Frontend)
**Goal:** Implement Firecrawl crawling and knowledge base population

**File to modify:** `/homepage-clone/src/components/VoiceChat.tsx`

**Add these functions:**

#### 7.1: `fetchCredits()`
```typescript
const fetchCredits = async () => {
  try {
    const response = await fetch('/api/firecrawl-credits')
    const data = await response.json()
    setCredits(data.remainingCredits)
  } catch (error) {
    console.error('Failed to fetch credits:', error)
    setCredits(null)
  }
}

// Call on component mount and after each crawl
useEffect(() => {
  if (strictMode) {
    fetchCredits()
  }
}, [strictMode])
```

#### 7.2: `handleCrawl()`
```typescript
const handleCrawl = async () => {
  const websiteUrl = document.getElementById('websiteUrl').value
  const crawlType = document.getElementById('crawlType').value
  
  if (!websiteUrl.trim()) {
    alert('Please enter a website URL')
    return
  }
  
  setIsCrawling(true)
  setCrawlStatus('Starting crawl...')
  
  try {
    const response = await fetch('/api/firecrawl-scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: websiteUrl,
        type: crawlType
      })
    })
    
    const data = await response.json()
    
    if (data.content) {
      // Remove old website content if exists
      let updatedKnowledge = knowledgeBase
      const marker = '<!-- WEBSITE_CONTENT_MARKER -->'
      
      if (updatedKnowledge.includes(marker)) {
        updatedKnowledge = updatedKnowledge.split(marker)[0] + marker
      }
      
      // Add new content
      const newContent = `\n================================================================================
WEBSITE CONTENT FROM: ${websiteUrl}
Crawl Type: ${crawlType === 'scrape' ? 'Quick Scrape' : 'Full Crawl'}
Crawled on: ${new Date().toLocaleString()}
================================================================================

${data.content}

================================================================================
END OF WEBSITE CONTENT`
      
      updatedKnowledge = updatedKnowledge.replace(marker, marker + newContent)
      setKnowledgeBase(updatedKnowledge)
      
      setCrawlStatus('✅ Success! Content has been added to knowledge base.')
      
      // Refresh credits
      fetchCredits()
    } else {
      throw new Error('No content received')
    }
  } catch (error) {
    setCrawlStatus('❌ Error: ' + error.message)
  } finally {
    setIsCrawling(false)
  }
}
```

**Verify Stage 7:**
- [ ] Credits display works
- [ ] Quick Scrape works
- [ ] Full Crawl works
- [ ] Knowledge base updates correctly
- [ ] Old content replaced properly
- [ ] Status messages display
- [ ] Credits refresh after crawl

---

### 📍 STAGE 8: Styling and Polish
**Goal:** Match existing design aesthetic and add final polish

**Requirements:**

1. **Color Scheme** (match existing App.tsx):
   - Background: `bg-gradient-to-br from-violet-100/30 via-indigo-50/30 to-rose-100/30`
   - Cards: `backdrop-blur-xl bg-card/70 shadow-2xl border-white/20`
   - Primary button: `bg-gradient-to-r from-primary to-secondary`
   - Text: Use existing color variables

2. **Animations:**
   - Use Framer Motion for smooth transitions
   - Fade-in effects for new content
   - Smooth tab switching
   - Chat bubble animations

3. **Icons:**
   - Use Phosphor Icons (already in project)
   - Microphone icon for Voice Chat tab
   - Globe icon for Clone Site tab
   - Other relevant icons

4. **Responsive Design:**
   - Mobile-friendly layout
   - Tablet optimization
   - Desktop full experience

5. **Loading States:**
   - Crawling spinner
   - Session starting indicator
   - Disabled button states

**Verify Stage 8:**
- [ ] Design matches existing aesthetic
- [ ] All animations smooth
- [ ] Icons properly used
- [ ] Responsive on all screen sizes
- [ ] Loading states clear
- [ ] No visual bugs

---

### 📍 STAGE 9: Testing and Bug Fixes
**Goal:** Test all functionality and fix any issues

**Testing Checklist:**

#### Tab Navigation
- [ ] Tabs switch smoothly
- [ ] Clone Site tab still works
- [ ] Voice Chat tab displays correctly
- [ ] No console errors

#### Voice Session
- [ ] Microphone permission requested
- [ ] Audio plays back correctly
- [ ] Transcription works (Hebrew & English)
- [ ] Beti's opening greeting plays
- [ ] End session button works
- [ ] Button disabled after session ends

#### Knowledge Base
- [ ] Default Beti text loads
- [ ] Editable textarea works
- [ ] Strict mode toggle works
- [ ] Knowledge base used in session

#### Firecrawl
- [ ] Credits display correctly
- [ ] Quick Scrape works
- [ ] Full Crawl works
- [ ] Old content replaced
- [ ] Status messages accurate
- [ ] Credits update after crawl

#### Transcript
- [ ] User messages appear (blue, right)
- [ ] Beti messages appear (gray, left)
- [ ] Auto-scroll works
- [ ] Clear button works
- [ ] Hebrew text displays correctly

#### Security
- [ ] No API keys in frontend code
- [ ] All keys in .env
- [ ] .env in .gitignore
- [ ] Backend routes secured

**Verify Stage 9:**
- [ ] All features tested
- [ ] All bugs fixed
- [ ] Console clean (no errors)
- [ ] Ready for deployment

---

### 📍 STAGE 10: Deployment Configuration
**Goal:** Prepare for Vercel and Azure deployment

#### 10.1: Update `vercel.json`
Add environment variables configuration:
```json
{
  "version": 2,
  "env": {
    "AZURE_OPENAI_API_KEY": "@azure-openai-api-key",
    "AZURE_OPENAI_ENDPOINT": "@azure-openai-endpoint",
    "AZURE_OPENAI_DEPLOYMENT": "@azure-openai-deployment",
    "FIRECRAWL_API_KEY": "@firecrawl-api-key"
  },
  "builds": [
    {
      "src": "homepage-clone/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/homepage-clone/dist/$1" }
  ]
}
```

#### 10.2: Vercel Environment Variables Setup
Instructions for user:
```bash
# In Vercel dashboard, add these environment variables:
AZURE_OPENAI_API_KEY=1FdVYUoTnKj9c5BRX6LjgwsY9WQOTaGXQODR7AZubepupsSx8hWGJQQJ99BJACfhMk5XJ3w3AAABACOGly2w
AZURE_OPENAI_ENDPOINT=https://ronen-openai-realtime.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=ronen-deployment-gpt-4o-realtime-preview
AZURE_OPENAI_RESOURCE=ronen-openai-realtime
FIRECRAWL_API_KEY=your-firecrawl-api-key-here
```

#### 10.3: Test Deployment
```bash
# Test locally first
npm run dev

# Test production build
npm run build

# Deploy to Vercel
vercel --prod
```

**Verify Stage 10:**
- [ ] vercel.json updated
- [ ] Environment variables documented
- [ ] Local dev works
- [ ] Production build works
- [ ] Deployed successfully

---

## 📝 File Checklist

After completing all stages, you should have these new/modified files:

### New Files:
- [ ] `.env` (root)
- [ ] `.env.example` (root)
- [ ] `/api/voice-session.js`
- [ ] `/api/firecrawl-credits.js`
- [ ] `/api/firecrawl-scrape.js`
- [ ] `/homepage-clone/src/components/VoiceChat.tsx`
- [ ] `/homepage-clone/src/components/VoiceTranscript.tsx`

### Modified Files:
- [ ] `.gitignore` (add .env)
- [ ] `/homepage-clone/src/App.tsx` (add tab navigation)
- [ ] `vercel.json` (add env vars)

---

## 🚀 Development Workflow

### Local Development:
```bash
# 1. Clone repo and install dependencies
git clone https://github.com/Ronen9/CloneSite.git
cd CloneSite
npm install
cd homepage-clone
npm install
cd ..

# 2. Create .env file with credentials

# 3. Start development server
npm run dev

# 4. Open browser
# http://localhost:5180
```

### Testing:
```bash
# Test Clone Site tab
# Test Voice Chat tab
# Test Firecrawl integration
# Test voice session
# Test transcript
```

### Deployment:
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

## 🎯 Success Criteria

✅ **Complete when:**
1. Tab navigation works between Clone Site and Voice Chat
2. Voice session connects and works
3. Transcription displays in chat bubbles
4. Firecrawl integration populates knowledge base
5. Credits display correctly
6. All API keys secured in backend
7. No console errors
8. Design matches existing aesthetic
9. Responsive on all devices
10. Deployed successfully on Vercel

---

## 📞 Help & Troubleshooting

### Common Issues:

**CORS errors:**
- Make sure using `npm run dev` (not opening file directly)
- Check API routes have proper CORS headers

**Microphone not working:**
- Check browser permissions
- Must be HTTPS (or localhost)

**Transcription not appearing:**
- Check console for errors
- Verify data channel messages
- Check event types match

**Firecrawl failing:**
- Verify API key in .env
- Check credits not depleted
- Verify URL format

---

## 🎉 Next Steps After Completion

Once all stages are complete:
1. Test thoroughly
2. Fix any remaining bugs
3. Deploy to Vercel
4. Share demo link
5. (Optional) Deploy to Azure
6. Add documentation

---

**Good luck with the implementation! Follow the stages sequentially and verify each stage before moving to the next. 🚀**
