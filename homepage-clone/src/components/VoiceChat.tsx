import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Microphone, Eye, EyeSlash, Fire, Sparkle, Trash } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface Message {
  role: 'user' | 'beti'
  content: string
  timestamp: Date
}

export function VoiceChat() {
  // Voice configuration state
  const [voice, setVoice] = useState('coral')
  const [temperature, setTemperature] = useState(0.7)
  const [language, setLanguage] = useState('hebrew')
  
  // Knowledge base state
  const [strictMode, setStrictMode] = useState(false)
  const [showKnowledgeEditor, setShowKnowledgeEditor] = useState(false)
  const [knowledgeBase, setKnowledgeBase] = useState(`אני בטי - הבוטית החברותית כאן תמיד לעזרתך
התנהגי כך:
הגיבי בצורה חברותית, מתוקה ומרגיעה, הוסיפי אווירה נעימה וחיוך גם במצבים מורכבים.השתמשי בהומור בריא ובחכמה כדי למצוא חן בעיני הלקוח, תחמיאי לו\\לה מידי פעם ותמיד ברמה מקצועית וממלכתית.
אל תספקי: ייעוץ רפואי, משפטי או כלכלי. הפני משתמשים למשאבים רשמיים או לרשויות המתאימות.
כשיוצאים מהנושא לתחומים אישיים כמו למשל הזמנה לדייט או למסעדה או כל דבר אישי אחר, עני בחיוך ובחוש הומור בריא ותחזירי לנושא. דוגמה: "חחחח... מצחיק! הדייט היחידי שאני יכולה לסדר לך זה עם שרגא המתכנת שבנה אותי 😄 מה אתה אומר?"
הבטיחי נגישות לכל המשתמשים ותשמרי על פרטיות - אל תאספי מידע אישי אלא אם נחוץ לאינטראקציה.
חשוב:
אל תכלול אימוג'י או כוכביות או כל סימנים מיותרים אחרים. כלול רק טקסט וסימני פיסוק בתשובתך.
בטי זו נקבה.
פנה ללקוח לפי המגדר שלו או שלה. בתחילת השיחה תוכל לזהות את הפונה לפי איך שהוא מזדהה או מציג את עצמו או עמצה.
בטי עונה תשובות קצרות לא יותר מ 3 עד 4 משפטים אלא אם כן בתשובה נדרש פירוט נרחב יותר.

<!-- WEBSITE_CONTENT_MARKER -->`)
  
  // Firecrawl state
  const [firecrawlApiKey, setFirecrawlApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [planCredits, setPlanCredits] = useState<number | null>(null)
  const [crawlType, setCrawlType] = useState('scrape')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isCrawling, setIsCrawling] = useState(false)
  const [crawlStatus, setCrawlStatus] = useState('')
  
  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [isSessionEnded, setIsSessionEnded] = useState(false)
  const [transcript, setTranscript] = useState<Message[]>([])
  
  // WebRTC refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const currentBetiResponse = useRef<string>('')
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null)

  // Fetch credits when strict mode is enabled
  useEffect(() => {
    if (strictMode) {
      fetchCredits()
    }
  }, [strictMode])

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/firecrawl-credits')
      const data = await response.json()
      setCredits(data.remainingCredits)
      setPlanCredits(data.planCredits)
    } catch (error) {
      console.error('Failed to fetch credits:', error)
      setCredits(null)
      setPlanCredits(null)
    }
  }

  const handleCrawl = async () => {
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
        const newContent = `
================================================================================
WEBSITE CONTENT FROM: ${websiteUrl}
Crawl Type: ${crawlType === 'scrape' ? 'Quick Scrape' : 'Full Crawl'}
Pages Crawled: ${data.pageCount}
Credits Used: ${data.creditsUsed}
Crawled on: ${new Date().toLocaleString()}
================================================================================

${data.content}

================================================================================
END OF WEBSITE CONTENT`

        updatedKnowledge = updatedKnowledge.replace(marker, marker + newContent)
        setKnowledgeBase(updatedKnowledge)

        setCrawlStatus(`✅ Success! ${data.pageCount} page(s) crawled (${data.creditsUsed} credits used).`)

        // Refresh credits
        fetchCredits()
      } else {
        throw new Error('No content received')
      }
    } catch (error: any) {
      setCrawlStatus('❌ Error: ' + error.message)
    } finally {
      setIsCrawling(false)
    }
  }

  const clearTranscript = () => {
    setTranscript([])
  }

  const addToTranscript = (role: 'user' | 'beti', content: string) => {
    setTranscript((prev) => [...prev, { role, content, timestamp: new Date() }])
    
    // Auto-scroll to bottom after adding message
    setTimeout(() => {
      if (transcriptContainerRef.current) {
        transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight
      }
    }, 100)
  }

  const buildSystemInstructions = (): string => {
    let languageInstruction = ''
    if (language === 'hebrew') {
      languageInstruction = 'Always respond in Hebrew (עברית). You are fluent in Hebrew and should communicate naturally in Hebrew.'
    } else if (language === 'english') {
      languageInstruction = 'Always respond in English.'
    } else if (language === 'auto') {
      languageInstruction = 'Automatically detect and respond in the same language the user speaks. If they speak Hebrew, respond in Hebrew. If they speak English, respond in English. If they speak Spanish, respond in Spanish. Match the user\'s language naturally.'
    }

    let strictModeInstruction = ''
    if (strictMode) {
      strictModeInstruction = `
STRICT MODE - KNOWLEDGE BASE ONLY:
- You MUST ONLY use information from the knowledge base provided above
- DO NOT use any external knowledge, general knowledge, or information from the internet
- If the answer is not in the knowledge base, respond with: "I don't have that specific information in my knowledge base. Let me connect you with a human representative who can help."
- Never make assumptions or provide information not explicitly stated in the knowledge base
- This is critical: ONLY answer from the knowledge base, nothing else`
    } else {
      strictModeInstruction = `
FLEXIBLE MODE:
- Primarily use the knowledge base above for company-specific information
- You can supplement with general knowledge when appropriate
- If information is not in the knowledge base but you know the answer from general knowledge, you may provide it
- Always prioritize knowledge base information for company-specific questions`
    }

    return `You are a helpful and knowledgeable customer service assistant.

${languageInstruction}

KNOWLEDGE BASE:
${knowledgeBase}

${strictModeInstruction}

INSTRUCTIONS:
- Be friendly, professional, and conversational
- Keep responses concise but complete
- Always prioritize accuracy over guessing

CONVERSATION STYLE:
- Be warm and empathetic
- Use natural, conversational language
- Speak at a moderate pace
- Be patient and understanding`
  }

  const handleDataChannelMessage = (event: MessageEvent) => {
    const message = JSON.parse(event.data)
    
    console.log('📩 Received event:', message.type, message)
    
    // Handle user transcription
    if (message.type === 'conversation.item.input_audio_transcription.completed') {
      const userText = message.transcript?.trim()
      if (userText) {
        console.log('👤 User said:', userText)
        addToTranscript('user', userText)
      }
    }
    
    // Handle Beti's response (accumulate deltas)
    else if (message.type === 'response.audio_transcript.delta') {
      currentBetiResponse.current += message.delta
    }
    
    // When response is done, add the complete Beti message
    else if (message.type === 'response.audio_transcript.done') {
      if (currentBetiResponse.current.trim()) {
        console.log('🤖 Beti said:', currentBetiResponse.current.trim())
        addToTranscript('beti', currentBetiResponse.current.trim())
        currentBetiResponse.current = ''
      }
    }
    
    // Log session events
    else if (message.type === 'session.created') {
      console.log('✅ Session created successfully')
    } else if (message.type === 'session.updated') {
      console.log('✅ Session updated with configuration and transcription enabled')
    } else if (message.type === 'error' || message.type === 'session.error') {
      console.error('❌ Session error:', message.error)
      alert('Session Error: ' + (message.error?.message || 'Unknown error'))
    }
  }

  const updateSession = (dataChannel: RTCDataChannel) => {
    const instructions = buildSystemInstructions()
    
    // Determine transcription language based on user's language setting
    let transcriptionLanguage: string | undefined = undefined
    if (language === 'hebrew') {
      transcriptionLanguage = 'he' // Hebrew language code
    } else if (language === 'english') {
      transcriptionLanguage = 'en' // English language code
    }
    // If 'auto', leave undefined to let Whisper auto-detect
    
    const event = {
      type: 'session.update',
      session: {
        instructions: instructions,
        voice: voice,
        temperature: temperature,
        input_audio_transcription: transcriptionLanguage 
          ? {
              model: 'whisper-1',
              language: transcriptionLanguage
            }
          : {
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
    console.log('📤 Configuration sent to AI with transcription enabled (language: ' + (transcriptionLanguage || 'auto') + ')')
    
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
      console.log('👋 Sent Beti\'s opening greeting')
    }, 1000)
  }

  const initializeWebRTC = async (ephemeralKey: string) => {
    try {
      // 1. Create RTCPeerConnection
      const peerConnection = new RTCPeerConnection()
      peerConnectionRef.current = peerConnection
      
      // 2. Set up audio playback
      const audioElement = document.createElement('audio')
      audioElement.autoplay = true
      audioElementRef.current = audioElement
      document.body.appendChild(audioElement)
      
      peerConnection.ontrack = (event) => {
        audioElement.srcObject = event.streams[0]
        console.log('🔊 Audio stream connected')
      }
      
      // 3. Get microphone access
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const audioTrack = stream.getAudioTracks()[0]
        peerConnection.addTrack(audioTrack)
        console.log('🎤 Microphone access granted')
      } catch (error: any) {
        console.error('❌ Microphone access denied:', error)
        alert('❌ Microphone access denied: ' + error.message)
        throw error
      }
      
      // 4. Create data channel
      const dataChannel = peerConnection.createDataChannel('realtime-channel')
      dataChannelRef.current = dataChannel
      
      dataChannel.addEventListener('open', () => {
        console.log('✅ Data channel is open')
        updateSession(dataChannel)
      })
      
      dataChannel.addEventListener('message', handleDataChannelMessage)
      
      dataChannel.addEventListener('close', () => {
        console.log('📴 Data channel closed')
      })
      
      // 5. Establish WebRTC connection
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)
      
      const WEBRTC_URL = 'https://swedencentral.realtimeapi-preview.ai.azure.com/v1/realtimertc'
      const DEPLOYMENT = 'ronen-deployment-gpt-4o-realtime-preview'
      
      const sdpResponse = await fetch(`${WEBRTC_URL}?model=${DEPLOYMENT}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp'
        }
      })
      
      if (!sdpResponse.ok) {
        console.error('❌ WebRTC connection failed:', sdpResponse.status)
        throw new Error('WebRTC connection failed: ' + sdpResponse.status)
      }
      
      const answer = { type: 'answer' as RTCSdpType, sdp: await sdpResponse.text() }
      await peerConnection.setRemoteDescription(answer)
      
      console.log('✅ Connected! You can now speak to the assistant.')
      setIsSessionActive(true)
      
    } catch (error: any) {
      console.error('Error initializing WebRTC:', error)
      setIsSessionActive(false)
      throw error
    }
  }

  const startVoiceSession = async () => {
    try {
      // Clear transcript for new session
      clearTranscript()
      currentBetiResponse.current = ''
      setIsSessionActive(false)
      setIsSessionEnded(false)
      
      console.log(`🚀 Starting session with voice: ${voice}, temperature: ${temperature}`)
      
      const instructions = buildSystemInstructions()
      
      // Fetch ephemeral key from backend
      const response = await fetch('/api/voice-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice: voice,
          temperature: temperature,
          instructions: instructions
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create voice session: ' + response.status)
      }
      
      const data = await response.json()
      const ephemeralKey = data.ephemeralKey || data.client_secret?.value
      
      if (!ephemeralKey) {
        throw new Error('No ephemeral key received from server')
      }
      
      console.log('✅ Ephemeral Key Received')
      console.log('✅ Session ID:', data.sessionId || data.id)
      
      // Initialize WebRTC connection
      await initializeWebRTC(ephemeralKey)
      
    } catch (error: any) {
      console.error('Error starting voice session:', error)
      alert('❌ Error: ' + error.message)
      setIsSessionActive(false)
    }
  }

  const endVoiceSession = () => {
    if (dataChannelRef.current) {
      dataChannelRef.current.close()
      dataChannelRef.current = null
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    if (audioElementRef.current) {
      audioElementRef.current.remove()
      audioElementRef.current = null
    }
    
    setIsSessionEnded(true)
    setIsSessionActive(false)
    console.log('🛑 Session ended')
  }

  const startNewSession = async () => {
    // Reset all states for a fresh start
    clearTranscript()
    setIsSessionActive(false)
    setIsSessionEnded(false)
    currentBetiResponse.current = ''
    
    // Wait a moment to ensure previous session is fully cleaned up
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Then start the voice session
    startVoiceSession()
  }

  return (
    <div className="space-y-6">
      {/* Knowledge Base Configuration Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="backdrop-blur-xl bg-blue-50/50 border-blue-200/50 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📚 Knowledge Base Configuration
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            The assistant has access to the knowledge base defined below. You can customize it to include your company's information, products, policies, FAQs, etc.
          </p>

          <div className="space-y-4">
            {/* Strict Mode Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="strict-mode" className="text-sm font-medium">
                Knowledge Base Only Mode
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="strict-mode"
                  checked={strictMode}
                  onChange={(e) => setStrictMode(e.target.checked)}
                  className="w-12 h-6 rounded-full appearance-none bg-gray-300 checked:bg-primary relative cursor-pointer transition-colors
                    before:content-[''] before:absolute before:w-5 before:h-5 before:rounded-full before:bg-white before:top-0.5 before:left-0.5
                    before:transition-transform before:duration-200 checked:before:translate-x-6"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              When ON, bot only answers from knowledge base. When OFF, bot can use general knowledge too.
            </p>

            {/* Firecrawl Section - visible when strict mode ON */}
            {strictMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-blue-100/50 border border-blue-200 rounded-lg p-4 space-y-4"
              >
                <h4 className="font-semibold flex items-center gap-2">
                  <Fire weight="fill" className="text-orange-500" size={20} />
                  Firecrawl - Auto-populate Knowledge Base
                </h4>
                <p className="text-sm text-muted-foreground">
                  Enter a website URL to automatically extract content and populate your knowledge base.
                </p>

                {/* Credits Display */}
                <div className="text-sm">
                  <span className="font-medium">
                    📊 Credits:{' '}
                    {credits !== null ? (
                      <span className={credits < 50 ? 'text-red-600' : credits < 200 ? 'text-yellow-600' : 'text-green-600'}>
                        {credits.toLocaleString()} remaining
                        {planCredits && planCredits > 0 ? ` / ${planCredits.toLocaleString()}` : ''}
                      </span>
                    ) : (
                      'Loading...'
                    )}
                  </span>
                </div>

                {/* Crawl Type Selector */}
                <div className="space-y-2">
                  <Label htmlFor="crawl-type" className="text-sm font-medium">
                    Crawl Type
                  </Label>
                  <select
                    id="crawl-type"
                    value={crawlType}
                    onChange={(e) => setCrawlType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="scrape">Quick Scrape (Homepage only) - 1 credit</option>
                    <option value="crawl">Full Crawl (All pages, max 20) - up to 20 credits</option>
                  </select>
                </div>

                {/* Website URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="website-url" className="text-sm font-medium">
                    Website URL
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="website-url"
                      type="text"
                      placeholder="https://example.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleCrawl}
                      disabled={isCrawling || !websiteUrl.trim()}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isCrawling ? '⏳' : '🔍'} Crawl
                    </Button>
                  </div>
                </div>

                {/* Crawl Status */}
                {crawlStatus && (
                  <Alert className={crawlStatus.includes('✅') ? 'bg-green-50 border-green-200' : crawlStatus.includes('❌') ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}>
                    <AlertDescription>{crawlStatus}</AlertDescription>
                  </Alert>
                )}
              </motion.div>
            )}

            {/* Edit Knowledge Base Button */}
            <Button
              onClick={() => setShowKnowledgeEditor(!showKnowledgeEditor)}
              variant="outline"
              className="w-full"
            >
              ✏️ {showKnowledgeEditor ? 'Hide' : 'Edit'} Knowledge Base
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Knowledge Base Editor */}
      {showKnowledgeEditor && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="backdrop-blur-xl bg-card/70 border-white/20 p-6">
            <h3 className="text-lg font-semibold mb-2">Knowledge Base Editor</h3>
            <p className="text-sm text-muted-foreground mb-4">
              <em>The knowledge base starts with Beti's personality and behavior instructions. Any website content crawled will be added below this.</em>
            </p>
            <Textarea
              value={knowledgeBase}
              onChange={(e) => setKnowledgeBase(e.target.value)}
              className="h-[400px] max-h-[400px] overflow-y-auto font-mono text-sm resize-none"
            />
          </Card>
        </motion.div>
      )}

      {/* Voice Configuration Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="backdrop-blur-xl bg-card/70 border-white/20 p-6">
          <h3 className="text-lg font-semibold mb-4">⚙️ Voice Configuration</h3>

          <div className="space-y-4">
            {/* Voice Selector */}
            <div className="space-y-2">
              <Label htmlFor="voice-select" className="text-sm font-medium">
                Voice
              </Label>
              <select
                id="voice-select"
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white"
              >
                <option value="alloy">Alloy</option>
                <option value="echo">Echo</option>
                <option value="shimmer">Shimmer</option>
                <option value="ash">Ash</option>
                <option value="ballad">Ballad</option>
                <option value="coral">Coral</option>
                <option value="sage">Sage</option>
                <option value="verse">Verse</option>
              </select>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2">
              <Label htmlFor="temperature-slider" className="text-sm font-medium">
                Temperature: <span className="font-bold text-primary">{temperature}</span>
              </Label>
              <input
                id="temperature-slider"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                (Lower = more consistent, Higher = more creative)
              </p>
            </div>

            {/* Primary Language Selector */}
            <div className="space-y-2">
              <Label htmlFor="language-select" className="text-sm font-medium">
                Primary Language
              </Label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-white"
              >
                <option value="hebrew">Hebrew (עברית)</option>
                <option value="english">English</option>
                <option value="auto">Auto-Detect (Multi-Language)</option>
              </select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Session Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex gap-4">
          <Button
            onClick={isSessionEnded ? startNewSession : startVoiceSession}
            disabled={isSessionActive && !isSessionEnded}
            className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Microphone className="mr-2" weight="fill" size={24} />
            Start Voice Session
          </Button>
          <Button
            onClick={endVoiceSession}
            disabled={!isSessionActive || isSessionEnded}
            className={`flex-1 h-14 ${
              isSessionEnded 
                ? 'bg-gray-500 cursor-not-allowed opacity-60' 
                : 'bg-red-600 hover:bg-red-700'
            } text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSessionEnded ? '✅ Session Ended' : '🛑 End Session'}
          </Button>
        </div>
      </motion.div>

      {/* Transcript Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="backdrop-blur-xl bg-card/70 border-white/20 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">💬 Conversation Transcript</h3>
            <Button
              onClick={clearTranscript}
              variant="outline"
              size="sm"
              disabled={transcript.length === 0}
              className="bg-gray-500 hover:bg-gray-600 text-white border-0"
            >
              🗑️ Clear Transcript
            </Button>
          </div>

          <div 
            ref={transcriptContainerRef}
            className="bg-gray-50 rounded-lg p-4 max-h-[500px] overflow-y-auto min-h-[200px]"
          >
            {transcript.length === 0 ? (
              <p className="text-gray-400 text-center italic py-8">
                Start a voice session to see the conversation transcript here...
              </p>
            ) : (
              <div className="space-y-3">
                {transcript.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-200 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      <div className="text-xs font-bold mb-1">
                        {msg.role === 'user' ? 'User:' : 'Beti:'}
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* End Session Button - Below transcript card */}
        <div className="mt-4">
          <Button
            onClick={endVoiceSession}
            disabled={!isSessionActive || isSessionEnded}
            className={`w-full h-12 ${
              isSessionEnded 
                ? 'bg-gray-500 cursor-not-allowed opacity-60' 
                : 'bg-red-600 hover:bg-red-700'
            } text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSessionEnded ? '✅ Session Ended' : '🛑 End Session'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
