import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Microphone,
  X,
  Gear,
  Fire,
  Trash,
  Waveform
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { WaveformAnimation } from './WaveformAnimation'

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

export function VoiceBotSideCard() {
  // UI state
  const [isOpen, setIsOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showKnowledgeEditor, setShowKnowledgeEditor] = useState(false)

  // Voice configuration
  const [voice, setVoice] = useState('coral')
  const [temperature, setTemperature] = useState(0.7)
  const [language, setLanguage] = useState('hebrew')

  // Knowledge base
  const [strictMode, setStrictMode] = useState(false)
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
  const [firecrawlApiKey] = useState('fc-0515511a88e4440292549c718ed2821a')
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
  const [isSpeaking, setIsSpeaking] = useState(false)

  // WebRTC refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const currentBetiResponse = useRef<string>('')
  const transcriptContainerRef = useRef<HTMLDivElement>(null)
  const sessionDataRef = useRef<any>(null)
  const isOpeningGreeting = useRef<boolean>(false)
  const openingGreetingResponseId = useRef<string | null>(null)

  // Fetch credits on mount if strict mode
  useEffect(() => {
    if (strictMode) {
      fetchCredits()
    }
  }, [strictMode])

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/firecrawl-credits')
      if (!response.ok) {
        if (response.status === 504) {
          console.warn('Credits fetch timeout')
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
    setTranscript(prev => [...prev, { role, content, timestamp: new Date() }])
    setTimeout(() => {
      if (transcriptContainerRef.current) {
        transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight
      }
    }, 100)
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
      // NOTE: Don't set isSpeaking(false) here - audio is still playing!
      // The audio_buffer.stopped event will handle that
    }

    // Track when Beti starts speaking (audio buffer started)
    else if (message.type === 'output_audio_buffer.started') {
      console.log('🔊 Beti started speaking (audio buffer started)')
      setIsSpeaking(true)
    }

    // Track when Beti stops speaking (audio buffer stopped)
    else if (message.type === 'output_audio_buffer.stopped') {
      console.log('🔇 Beti stopped speaking (audio buffer stopped)')
      setIsSpeaking(false)
    }

    // Track when user starts speaking (to stop waveform during interruption)
    else if (message.type === 'input_audio_buffer.speech_started') {
      console.log('👤 User started speaking - stopping waveform')
      // Only allow interruption if NOT during opening greeting
      if (!isOpeningGreeting.current) {
        setIsSpeaking(false)
      } else {
        console.log('🚫 Opening greeting in progress - interruption blocked')
      }
    }

    // Track response creation (to identify opening greeting)
    else if (message.type === 'response.created') {
      console.log('📝 Response created:', message.response?.id)
      // Check if this is the opening greeting response
      if (openingGreetingResponseId.current === null && isOpeningGreeting.current) {
        openingGreetingResponseId.current = message.response?.id || null
        console.log('🎯 Opening greeting response ID:', openingGreetingResponseId.current)
      }
    }

    // Track when response is done (to release opening greeting protection)
    else if (message.type === 'response.done') {
      console.log('✅ Response done:', message.response?.id)
      // If this was the opening greeting, release the protection
      if (message.response?.id === openingGreetingResponseId.current) {
        console.log('🔓 Opening greeting completed - interruption now allowed')
        isOpeningGreeting.current = false
        openingGreetingResponseId.current = null
      }
    }

    // Track response cancellation due to interruption
    else if (message.type === 'response.cancelled') {
      console.log('⚠️ Response cancelled (user interrupted)')
      // Only stop speaking if NOT during opening greeting
      if (!isOpeningGreeting.current) {
        setIsSpeaking(false)
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

  const updateSession = (dataChannel: RTCDataChannel) => {
    const instructions = buildSystemInstructions()

    let transcriptionLanguage: string | undefined = undefined
    if (language === 'hebrew') {
      transcriptionLanguage = 'he'
    } else if (language === 'english') {
      transcriptionLanguage = 'en'
    }

    const event = {
      type: 'session.update',
      session: {
        instructions,
        voice,
        temperature,
        input_audio_transcription: transcriptionLanguage
          ? { model: 'whisper-1', language: transcriptionLanguage }
          : { model: 'whisper-1' },
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

    setTimeout(() => {
      // Set flag to protect opening greeting from interruption
      isOpeningGreeting.current = true
      console.log('🔒 Opening greeting protection enabled')

      // Temporarily disable turn detection for the opening greeting
      const disableTurnDetection = {
        type: 'session.update',
        session: {
          turn_detection: null
        }
      }
      dataChannel.send(JSON.stringify(disableTurnDetection))

      // Send the opening greeting
      const greetingEvent = {
        type: 'response.create',
        response: {
          modalities: ['text', 'audio'],
          instructions: 'Say exactly this in Hebrew: היי אני בטי, עם מי יש לי את הכבוד?'
        }
      }
      dataChannel.send(JSON.stringify(greetingEvent))

      // Re-enable turn detection after greeting is done (with delay to ensure greeting completes)
      setTimeout(() => {
        const enableTurnDetection = {
          type: 'session.update',
          session: {
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500
            }
          }
        }
        dataChannel.send(JSON.stringify(enableTurnDetection))
        console.log('🔊 Turn detection re-enabled')
      }, 5000) // 5 seconds should be enough for the greeting
    }, 1000)
  }

  const initializeWebRTC = async (ephemeralKey: string) => {
    try {
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

      const audioElement = document.createElement('audio')
      audioElement.autoplay = true
      audioElementRef.current = audioElement
      document.body.appendChild(audioElement)

      peerConnection.ontrack = (event) => {
        audioElement.srcObject = event.streams[0]
        console.log('🔊 Audio stream connected')
      }

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

      console.log('📊 Data channel created, readyState:', dataChannel.readyState)

      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      // Use endpoint and deployment from session data ref
      const sessionData = sessionDataRef.current
      console.log('📦 Session data:', sessionData)

      if (!sessionData?.endpoint || !sessionData?.deployment) {
        console.error('❌ Missing endpoint or deployment:', { endpoint: sessionData?.endpoint, deployment: sessionData?.deployment })
        throw new Error('Missing WebRTC endpoint or deployment information')
      }

      const webrtcUrl = `${sessionData.endpoint}?model=${sessionData.deployment}`
      console.log('🌐 Connecting to WebRTC endpoint:', webrtcUrl)

      const sdpResponse = await fetch(webrtcUrl, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp'
        }
      })

      console.log('📡 WebRTC response status:', sdpResponse.status)

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text()
        console.error('❌ WebRTC connection failed:', sdpResponse.status, errorText)
        throw new Error(`WebRTC connection failed: ${sdpResponse.status} - ${errorText}`)
      }

      const answer = { type: 'answer' as RTCSdpType, sdp: await sdpResponse.text() }
      await peerConnection.setRemoteDescription(answer)

      console.log('✅ Connected! You can now speak to the assistant.')
      setIsSessionActive(true)
    } catch (error: any) {
      console.error('❌ Error initializing WebRTC:', error)
      console.error('Error details:', error.message, error)
      setIsSessionActive(false)
      throw error
    }
  }

  const startVoiceSession = async () => {
    try {
      clearTranscript()
      currentBetiResponse.current = ''
      setIsSessionActive(false)
      setIsSessionEnded(false)

      const response = await fetch('/api/voice-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice,
          temperature,
          instructions: buildSystemInstructions()
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

      // Store complete session data for WebRTC initialization
      sessionDataRef.current = data

      console.log('🚀 Starting WebRTC initialization...')
      await initializeWebRTC(ephemeralKey)
    } catch (error: any) {
      console.error('❌ Error starting voice session:', error)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
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
    setIsSpeaking(false)
    console.log('🛑 Session ended and cleaned up')
  }

  return (
    <>
      {/* VoiceBot Button - Bottom Right */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-[90]"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white hover:scale-110 transition-all duration-300"
            >
              <Microphone weight="fill" size={28} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Card */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay - blocks other interactions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/10 z-[85] pointer-events-auto"
              onClick={() => {
                if (!isSessionActive && !showSettings) {
                  setIsOpen(false)
                }
              }}
            />

            {/* Side Card Container */}
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-screen w-full sm:w-[450px] bg-white shadow-2xl z-[90] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Microphone weight="fill" size={24} />
                  <span className="font-semibold text-lg">VoiceBot - Beti</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                    className="text-white hover:bg-white/20"
                  >
                    <Gear size={20} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X size={24} />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Session Controls */}
                <div className="flex gap-2">
                  <Button
                    onClick={startVoiceSession}
                    disabled={isSessionActive || isCrawling}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    <Microphone className="mr-2" weight="fill" size={20} />
                    {isSessionActive ? '🔴 Active' : 'Start Session'}
                  </Button>
                  <Button
                    onClick={endVoiceSession}
                    disabled={!isSessionActive}
                    className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
                  >
                    End Session
                  </Button>
                </div>

                {/* Transcript */}
                <Card className="p-4 min-h-[300px] max-h-[380px] overflow-y-auto bg-gray-50" ref={transcriptContainerRef}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">Conversation</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearTranscript}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                  {transcript.length === 0 ? (
                    <p className="text-gray-400 text-sm italic text-center py-8">
                      Start a session to begin conversation...
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {transcript.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Speaking Indicator - Debug: always show state */}
                {isSessionActive && (
                  <div className="text-xs text-gray-500 text-center">
                    Speaking state: {isSpeaking ? '🔊 TRUE' : '🔇 FALSE'}
                  </div>
                )}

                {/* Speaking Indicator */}
                <AnimatePresence>
                  {isSpeaking && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
                    >
                      <span className="text-sm font-medium text-purple-700">Beti is speaking</span>
                      <WaveformAnimation
                        isActive={isSpeaking}
                        color="#8b5cf6"
                        barCount={10}
                        height={60}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Settings Modal */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-[95] flex items-center justify-center p-4"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setShowSettings(false)
                    }
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                  >
                    {/* Sticky Header */}
                    <div className="sticky top-0 bg-white z-10 p-6 pb-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Settings</h2>
                        <Button
                          variant="ghost"
                          onClick={() => setShowSettings(false)}
                        >
                          <X size={24} />
                        </Button>
                      </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto p-6 pt-4 space-y-6">

                      {/* Knowledge Base Configuration */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Fire weight="fill" size={20} className="text-orange-500" />
                          Knowledge Base Configuration
                        </h3>

                        {/* Strict Mode Toggle */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div>
                            <Label className="font-medium">Knowledge Base Only Mode</Label>
                            <p className="text-sm text-gray-600">Limit responses to knowledge base content only</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={strictMode}
                              onChange={(e) => setStrictMode(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {/* Firecrawl Integration - Only shown when strict mode is ON */}
                        {strictMode && (
                          <Card className="p-4 bg-orange-50 border-orange-200">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Fire weight="fill" size={18} className="text-orange-500" />
                              Firecrawl - Auto-populate Knowledge Base
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">
                              Enter a website URL to automatically extract content and populate your knowledge base.
                            </p>

                            {/* Credits Display */}
                            <div className="text-sm mb-3">
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
                            <div className="space-y-2 mb-3">
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
                              <Label htmlFor="website-url-fc" className="text-sm font-medium">
                                Website URL
                              </Label>
                              <div className="flex gap-2">
                                <Input
                                  id="website-url-fc"
                                  type="text"
                                  placeholder="https://example.com"
                                  value={websiteUrl}
                                  onChange={(e) => setWebsiteUrl(e.target.value)}
                                  className="flex-1"
                                />
                                <Button
                                  onClick={handleCrawl}
                                  disabled={isCrawling || !websiteUrl.trim()}
                                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
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
                              <Alert className={`mt-3 ${crawlStatus.includes('✅') ? 'bg-green-50 border-green-200' : crawlStatus.includes('❌') ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                <AlertDescription>{crawlStatus}</AlertDescription>
                              </Alert>
                            )}
                          </Card>
                        )}

                        {/* Edit Knowledge Base Button */}
                        <Button
                          onClick={() => setShowKnowledgeEditor(!showKnowledgeEditor)}
                          variant="outline"
                          className="w-full"
                        >
                          ✏️ {showKnowledgeEditor ? 'Hide' : 'Edit'} Knowledge Base
                        </Button>

                        {/* Knowledge Base Editor */}
                        {showKnowledgeEditor && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              <em>The knowledge base starts with Beti's personality. Website content will be added below.</em>
                            </p>
                            <Textarea
                              value={knowledgeBase}
                              onChange={(e) => setKnowledgeBase(e.target.value)}
                              className="h-[400px] max-h-[400px] overflow-y-auto font-mono text-sm resize-none"
                              maxLength={40000}
                            />
                            <div className={`text-sm text-right ${knowledgeBase.length > 38000 ? 'text-red-600 font-bold' : knowledgeBase.length > 35000 ? 'text-orange-600' : 'text-gray-500'}`}>
                              {knowledgeBase.length.toLocaleString()} / 40,000 characters
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Voice Configuration */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Voice Configuration</h3>

                        <div className="space-y-2">
                          <Label>Voice</Label>
                          <select
                            value={voice}
                            onChange={(e) => setVoice(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
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

                        <div className="space-y-2">
                          <Label>Temperature (Creativity): {temperature}</Label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Language</Label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                          >
                            <option value="hebrew">Hebrew</option>
                            <option value="english">English</option>
                            <option value="auto">Auto-detect</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    {/* End of scrollable content */}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>

      {/* Speaking Indicator - Center of Screen */}
      <AnimatePresence>
        {isSpeaking && isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100]"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-8 shadow-2xl"
            >
              <Waveform weight="fill" size={64} className="text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
