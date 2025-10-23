import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Microphone, Eye, EyeSlash, Fire, Sparkle, Trash, Gear, X } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

const MAX_INSTRUCTIONS_LENGTH = 40000

const truncateKnowledgeBaseContent = (knowledgeBase: string) => {
  if (knowledgeBase.length <= MAX_INSTRUCTIONS_LENGTH) {
    return { content: knowledgeBase, wasTruncated: false }
  }

  const marker = '<!-- WEBSITE_CONTENT_MARKER -->'
  const parts = knowledgeBase.split(marker)
  let processedKnowledgeBase = knowledgeBase
  let wasTruncated = false

  if (parts.length > 1) {
    const baseKnowledge = parts[0] + marker
    const websiteContent = parts[1]
    const remainingSpace = MAX_INSTRUCTIONS_LENGTH - baseKnowledge.length - 300

    if (remainingSpace > 500) {
      // We have space for at least some website content
      const truncatedContent = websiteContent.substring(0, Math.max(0, remainingSpace))
      const lastPageMarker = truncatedContent.lastIndexOf('--- PAGE')

      if (lastPageMarker > 0) {
        // Truncate at page boundary to keep complete pages
        const cleanTruncatedContent = truncatedContent.substring(0, lastPageMarker)
        processedKnowledgeBase = baseKnowledge + cleanTruncatedContent +
          '\n\n[NOTE: Additional website content was truncated due to size limits. The information above represents partial crawled data from the first pages. For complete information, please refer customers to the website or contact details provided above.]'
        wasTruncated = true
        console.warn(`⚠️ Knowledge base truncated from ${knowledgeBase.length} to ${processedKnowledgeBase.length} characters (kept ${lastPageMarker} chars of website content)`)
      } else {
        // No page markers, just truncate cleanly at word boundary
        const lastSpace = truncatedContent.lastIndexOf(' ')
        const cleanContent = lastSpace > 0 ? truncatedContent.substring(0, lastSpace) : truncatedContent
        processedKnowledgeBase = baseKnowledge + cleanContent +
          '\n\n[NOTE: Website content was truncated due to size limits. The information above represents partial crawled data. For complete information, please refer customers to the website or contact details provided above.]'
        wasTruncated = true
        console.warn(`⚠️ Knowledge base truncated from ${knowledgeBase.length} to ${processedKnowledgeBase.length} characters (kept ${cleanContent.length} chars of website content)`)
      }
    } else {
      // Not enough space for website content, but this should rarely happen
      processedKnowledgeBase = baseKnowledge +
        '\n\n[NOTE: Website content was omitted due to size limits. Base knowledge only contains less than 500 characters of space. Consider reducing base instructions.]'
      wasTruncated = true
      console.warn(`⚠️ Knowledge base has only ${remainingSpace} chars remaining. Website content omitted.`)
    }
  } else {
    processedKnowledgeBase = knowledgeBase.substring(0, MAX_INSTRUCTIONS_LENGTH) +
      '\n\n[NOTE: Content was truncated due to size limits.]'
    wasTruncated = true
    console.warn(`⚠️ Knowledge base truncated from ${knowledgeBase.length} to ${processedKnowledgeBase.length} characters`)
  }

  return { content: processedKnowledgeBase, wasTruncated }
}

interface Message {
  role: 'user' | 'beti'
  content: string
  timestamp: Date
}

export function VoiceChat() {
  // UI state - Settings panel visibility
  const [showSettings, setShowSettings] = useState(false)
  
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
כשיוצאים מהנושא לתחומים אישיים כמו למשל הזמנה לדייט או למסעדה או כל דבר אישי אחר, עני בחיוך ובחוש הומור בריא ותחזירי לנושא. דוגמה: "חחחח... [צחוק אנושי אמיתי] מצחיק! הדייט היחידי שאני יכולה לסדר לך זה עם שרגא המתכנת שבנה אותי 😄 מה אתה אומר?"
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
  const sessionDataRef = useRef<any>(null)

  const knowledgeBaseCharsRemaining = MAX_INSTRUCTIONS_LENGTH - knowledgeBase.length
  const knowledgeBaseCounterClass = knowledgeBaseCharsRemaining < 0
    ? 'text-red-500'
    : knowledgeBaseCharsRemaining < 1000
      ? 'text-orange-500'
      : 'text-muted-foreground'

  // Fetch credits when strict mode is enabled
  useEffect(() => {
    if (strictMode) {
      fetchCredits()
    }
  }, [strictMode])

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/firecrawl-credits')

      if (!response.ok) {
        // Handle timeout or error responses
        if (response.status === 504) {
          console.warn('Credits fetch timeout - server took too long to respond')
          setCredits(null)
          setPlanCredits(null)
          return
        }
        throw new Error(`Failed to fetch credits: ${response.status}`)
      }

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
      // Parse crawl type and page limit
      let type = 'scrape'
      let maxPages = 1
      
      if (crawlType === 'scrape') {
        type = 'scrape'
        maxPages = 1
      } else if (crawlType.startsWith('crawl-')) {
        type = 'crawl'
        maxPages = parseInt(crawlType.split('-')[1])
      }

      // Start the crawl/scrape
      const response = await fetch('/api/firecrawl-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: websiteUrl,
          type: type,
          maxPages: maxPages
        })
      })

      if (!response.ok) {
        // Handle timeout errors specifically
        if (response.status === 504) {
          throw new Error('Request timeout. The server took too long to respond. Please try again or use a smaller page limit.')
        }

        // Try to parse error message from JSON
        let errorMessage = `Request failed with status ${response.status}`
        try {
          const data = await response.json()
          // Include all error details from server
          if (data.error) {
            errorMessage = data.error
            if (data.message && data.message !== data.error) {
              errorMessage += `: ${data.message}`
            }
            if (data.details) {
              errorMessage += ` (Details: ${data.details})`
            }
            if (data.responseKeys) {
              console.error('Server response keys:', data.responseKeys)
            }
          }
        } catch (parseError) {
          // Response is not JSON (likely HTML error page)
          const text = await response.text()
          console.error('Non-JSON error response:', text.substring(0, 200))
          if (text.includes('FUNCTION_INVOCATION_TIMEOUT')) {
            errorMessage = 'Function timeout. The crawl is taking too long. Try reducing the number of pages.'
          }
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      // For scrape (single page), content is returned immediately
      if (type === 'scrape' && data.content) {
        processContent(data, type, maxPages)
        return
      }

      // For crawl, we need to poll for completion
      if (type === 'crawl' && data.jobId) {
        setCrawlStatus(`⏳ Crawling ${maxPages} page(s)... This may take a minute.`)
        await pollCrawlStatus(data.jobId, maxPages)
      } else if (data.content) {
        // Fallback if content was returned immediately
        processContent(data, type, maxPages)
      } else {
        throw new Error('Unexpected response format from server')
      }

    } catch (error: any) {
      setCrawlStatus('❌ Error: ' + error.message)
      setIsCrawling(false)
    }
  }

  const pollCrawlStatus = async (jobId: string, maxPages: number) => {
    let attempts = 0
    const maxAttempts = 60 // 5 minutes max

    const checkStatus = async (): Promise<void> => {
      attempts++

      const statusResponse = await fetch('/api/firecrawl-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'crawl',
          jobId: jobId,
          url: websiteUrl // Include for validation
        })
      })

      const statusData = await statusResponse.json()

      if (statusData.status === 'completed' && statusData.content) {
        // Crawl is complete
        processContent(statusData, 'crawl', maxPages)
        return
      } else if (statusData.status === 'failed') {
        throw new Error(statusData.error || 'Crawl job failed')
      } else {
        // Still in progress
        const completed = statusData.completed || 0
        const total = statusData.total || maxPages
        setCrawlStatus(`⏳ Crawling... ${completed}/${total} pages processed. Please wait...`)

        if (attempts >= maxAttempts) {
          throw new Error('Crawl took too long (timeout after 5 minutes)')
        }

        // Wait 5 seconds and check again
        await new Promise(resolve => setTimeout(resolve, 5000))
        return checkStatus()
      }
    }

    await checkStatus()
  }

  const processContent = (data: any, type: string, maxPages: number) => {
    // Remove old website content if exists
    let updatedKnowledge = knowledgeBase
    const marker = '<!-- WEBSITE_CONTENT_MARKER -->'

    if (updatedKnowledge.includes(marker)) {
      updatedKnowledge = updatedKnowledge.split(marker)[0] + marker
    }

    // Add new content
    const crawlTypeLabel = type === 'scrape' ? 'Quick Scrape (1 page)' : `Crawl (up to ${maxPages} pages)`
    const newContent = `
================================================================================
WEBSITE CONTENT FROM: ${websiteUrl}
Crawl Type: ${crawlTypeLabel}
Pages Crawled: ${data.pageCount}
Credits Used: ${data.creditsUsed}
Crawled on: ${new Date().toLocaleString()}
================================================================================

${data.content}

================================================================================
END OF WEBSITE CONTENT`

    updatedKnowledge = updatedKnowledge.replace(marker, marker + newContent)
    const { content: limitedKnowledge, wasTruncated } = truncateKnowledgeBaseContent(updatedKnowledge)
    setKnowledgeBase(limitedKnowledge)

    let statusMessage = `✅ Success! ${data.pageCount} page(s) crawled (${data.creditsUsed} credits used).`
    if (wasTruncated) {
      statusMessage += ' ⚠️ Some website content was truncated to fit the 40,000 character limit.'
    }
    setCrawlStatus(statusMessage)
    setIsCrawling(false)

    // Refresh credits
    fetchCredits()
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

    const { content: processedKnowledgeBase } = truncateKnowledgeBaseContent(knowledgeBase)
    
    const finalInstructions = `You are a helpful and knowledgeable customer service assistant.

${languageInstruction}

KNOWLEDGE BASE:
${processedKnowledgeBase}

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

    console.log(`📊 Instructions size: ${finalInstructions.length} characters (~${Math.round(finalInstructions.length / 4)} tokens)`)
    
    return finalInstructions
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
    } else if (message.type === 'error') {
      const errorMessage = message.error?.message || 'Unknown error'
      console.error('❌ Session error:', message.error)
      
      // Don't alert for transcription-related errors, just log them
      if (errorMessage.includes('truncated') || errorMessage.includes('audio messages')) {
        console.warn('⚠️ Transcription error (non-critical):', errorMessage)
      } else {
        alert('Session Error: ' + errorMessage)
      }
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

      // Log connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('📡 Connection state:', peerConnection.connectionState)
      }

      peerConnection.oniceconnectionstatechange = () => {
        console.log('🧊 ICE connection state:', peerConnection.iceConnectionState)
      }

      peerConnection.onicegatheringstatechange = () => {
        console.log('🧊 ICE gathering state:', peerConnection.iceGatheringState)
      }

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

      dataChannel.addEventListener('error', (error) => {
        console.error('❌ Data channel error:', error)
      })

      // Log data channel state changes
      console.log('📊 Data channel created, readyState:', dataChannel.readyState)
      
      // 5. Establish WebRTC connection
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)
      
      // Use endpoint and deployment from session data
      const sessionData = sessionDataRef.current
      if (!sessionData?.endpoint || !sessionData?.deployment) {
        throw new Error('Missing WebRTC endpoint or deployment information')
      }
      
      const sdpResponse = await fetch(`${sessionData.endpoint}?model=${sessionData.deployment}`, {
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
      
      // Store complete session data for WebRTC initialization
      sessionDataRef.current = data
      
      // Initialize WebRTC connection
      await initializeWebRTC(ephemeralKey)
      
    } catch (error: any) {
      console.error('Error starting voice session:', error)
      alert('❌ Error: ' + error.message)
      setIsSessionActive(false)
    }
  }

  const endVoiceSession = () => {
    // Close data channel first
    if (dataChannelRef.current) {
      try {
        dataChannelRef.current.close()
      } catch (e) {
        console.warn('Error closing data channel:', e)
      }
      dataChannelRef.current = null
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      try {
        // Stop all tracks
        peerConnectionRef.current.getSenders().forEach(sender => {
          if (sender.track) {
            sender.track.stop()
          }
        })
        peerConnectionRef.current.close()
      } catch (e) {
        console.warn('Error closing peer connection:', e)
      }
      peerConnectionRef.current = null
    }
    
    // Remove audio element
    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause()
        audioElementRef.current.srcObject = null
        audioElementRef.current.remove()
      } catch (e) {
        console.warn('Error removing audio element:', e)
      }
      audioElementRef.current = null
    }
    
    // Reset response accumulator
    currentBetiResponse.current = ''
    
    setIsSessionEnded(true)
    setIsSessionActive(false)
    console.log('🛑 Session ended and cleaned up')
  }

  const startNewSession = async () => {
    console.log('🔄 Starting new session...')
    
    // First, ensure previous session is fully closed
    endVoiceSession()
    
    // Reset all states for a fresh start
    clearTranscript()
    setIsSessionActive(false)
    setIsSessionEnded(false)
    currentBetiResponse.current = ''
    
    // Wait longer to ensure complete cleanup (1 second)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Then start the voice session
    startVoiceSession()
  }

  return (
    <div className="space-y-6">
      {/* Settings Toggle Button - Floating at top right */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowSettings(!showSettings)}
          variant="outline"
          className="bg-white/80 backdrop-blur-md hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
        >
          {showSettings ? (
            <>
              <X weight="bold" size={20} />
              <span>Close Settings</span>
            </>
          ) : (
            <>
              <Gear weight="fill" size={20} />
              <span>Settings</span>
            </>
          )}
        </Button>
      </div>

      {/* Configuration Sections - Only visible when settings is open */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Knowledge Base Configuration Section */}
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
            >
              <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-50/60 via-indigo-50/60 to-violet-50/60 border-white/40 shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 flex items-center gap-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            📚 Knowledge Base Configuration
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
            The assistant has access to the knowledge base defined below. You can customize it to include your company's information, products, policies, FAQs, etc.
          </p>

          <div className="space-y-4">
            {/* Strict Mode Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="strict-mode" className="text-sm font-medium flex items-center gap-2">
                🔒 Knowledge Base Only Mode
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
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 120 }}
                className="bg-gradient-to-br from-orange-50/80 to-red-50/80 border border-orange-200/60 rounded-lg p-4 space-y-4 shadow-md"
              >
                <h4 className="font-semibold flex items-center gap-2">
                  <Fire weight="fill" className="text-orange-500 animate-pulse" size={20} />
                  <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Firecrawl - Auto-populate Knowledge Base</span>
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
                    <option value="crawl-2">Crawl up to 2 pages - up to 2 credits</option>
                    <option value="crawl-3">Crawl up to 3 pages - up to 3 credits</option>
                    <option value="crawl-4">Crawl up to 4 pages - up to 4 credits</option>
                    <option value="crawl-5">Crawl up to 5 pages - up to 5 credits</option>
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
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      {isCrawling ? (
                        <><span className="animate-spin">⏳</span> Crawling...</>
                      ) : (
                        <><Fire weight="fill" size={16} className="mr-1" /> Crawl</>
                      )}
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
              className="w-full hover:bg-primary/10 hover:border-primary transition-all duration-200"
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
              maxLength={MAX_INSTRUCTIONS_LENGTH}
              className="h-[400px] max-h-[400px] overflow-y-auto font-mono text-sm resize-none"
            />
            <div className={`mt-2 text-xs text-right ${knowledgeBaseCounterClass}`}>
              {knowledgeBase.length.toLocaleString()} / {MAX_INSTRUCTIONS_LENGTH.toLocaleString()} characters
            </div>
          </Card>
        </motion.div>
      )}

      {/* Voice Configuration Section */}
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
      >
        <Card className="backdrop-blur-xl bg-gradient-to-br from-violet-50/60 via-purple-50/60 to-pink-50/60 border-white/40 shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">⚙️ Voice Configuration</h3>

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
          </>
        )}
      </AnimatePresence>

      {/* Session Controls - Always visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
      >
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <Button
            onClick={() => {
              console.log('🔘 Start button clicked!', {
                isSessionEnded,
                isSessionActive,
                isCrawling,
                disabled: (isSessionActive && !isSessionEnded) || isCrawling
              });
              if (isSessionEnded) {
                startNewSession();
              } else {
                startVoiceSession();
              }
            }}
            disabled={isSessionActive && !isSessionEnded || isCrawling}
            className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Microphone className="mr-2" weight="fill" size={20} />
            <span className="hidden sm:inline">
              {isCrawling ? (
                '⏳ Crawling in progress...'
              ) : isSessionActive && !isSessionEnded ? (
                <><span className="animate-pulse">🔴</span> Session Active</>
              ) : (
                'Start Voice Session'
              )}
            </span>
            <span className="sm:hidden">
              {isCrawling ? 'Crawling...' : isSessionActive && !isSessionEnded ? 'Active' : 'Start'}
            </span>
          </Button>
          <Button
            onClick={endVoiceSession}
            disabled={!isSessionActive || isSessionEnded}
            className={`flex-1 h-12 sm:h-14 ${
              isSessionEnded 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 cursor-not-allowed opacity-80' 
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
            } text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          >
            <span className="hidden sm:inline">
              {isSessionEnded ? '✅ Session Ended' : '🛑 End Session'}
            </span>
            <span className="sm:hidden">
              {isSessionEnded ? '✅ Ended' : '🛑 End'}
            </span>
          </Button>
        </div>
      </motion.div>

      {/* Transcript Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
      >
        <Card className="backdrop-blur-xl bg-gradient-to-br from-slate-50/60 via-gray-50/60 to-zinc-50/60 border-white/40 shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h3 className="text-base md:text-lg font-semibold bg-gradient-to-r from-slate-700 to-gray-700 bg-clip-text text-transparent">💬 Conversation Transcript</h3>
            <Button
              onClick={clearTranscript}
              variant="outline"
              size="sm"
              disabled={transcript.length === 0}
              className="bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              🗑️ Clear Transcript
            </Button>
          </div>

          <div 
            ref={transcriptContainerRef}
            className="bg-gray-50 rounded-lg p-3 md:p-4 max-h-[400px] md:max-h-[500px] overflow-y-auto min-h-[200px]"
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
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-2.5 md:p-3 shadow-md hover:shadow-lg transition-shadow duration-200 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm'
                          : 'bg-gradient-to-br from-gray-100 to-slate-100 text-gray-800 rounded-bl-sm border border-gray-200'
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
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 cursor-not-allowed opacity-80' 
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
            } text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          >
            {isSessionEnded ? '✅ Session Ended' : '🛑 End Session'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
