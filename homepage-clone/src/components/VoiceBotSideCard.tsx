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
    const realtimeEvent = JSON.parse(event.data)

    if (realtimeEvent.type === 'conversation.item.input_audio_transcription.completed') {
      const userText = realtimeEvent.transcript
      if (userText && userText.trim()) {
        addToTranscript('user', userText)
      }
    } else if (realtimeEvent.type === 'response.audio_transcript.delta') {
      const delta = realtimeEvent.delta
      if (delta) {
        currentBetiResponse.current += delta
      }
    } else if (realtimeEvent.type === 'response.audio_transcript.done') {
      if (currentBetiResponse.current.trim()) {
        addToTranscript('beti', currentBetiResponse.current.trim())
        currentBetiResponse.current = ''
      }
      setIsSpeaking(false)
    } else if (realtimeEvent.type === 'response.audio.delta') {
      setIsSpeaking(true)
    }
  }

  const buildSystemInstructions = () => {
    let instructions = knowledgeBase

    if (language === 'hebrew') {
      instructions += '\n\nחשוב מאוד: תענה רקרק בעברית. כל תשובה חייבת להיות בעברית בלבד.'
    } else if (language === 'english') {
      instructions += '\n\nIMPORTANT: Respond ONLY in English. Every response must be in English only.'
    }

    if (strictMode) {
      instructions += '\n\nחשוב מאוד: ענה רק על בסיס המידע שבבסיס הידע שלך. אם אין מידע רלוונטי, תגיד "אין לי מידע על כך בבסיס הידע שלי."'
    }

    return instructions
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

  const initializeWebRTC = async (ephemeralKey: string) => {
    try {
      const peerConnection = new RTCPeerConnection()
      peerConnectionRef.current = peerConnection

      const audioElement = document.createElement('audio')
      audioElement.autoplay = true
      audioElementRef.current = audioElement
      document.body.appendChild(audioElement)

      peerConnection.ontrack = (event) => {
        audioElement.srcObject = event.streams[0]
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const audioTrack = stream.getAudioTracks()[0]
        peerConnection.addTrack(audioTrack)
      } catch (error: any) {
        console.error('Microphone access denied:', error)
        alert('Microphone access denied: ' + error.message)
        throw error
      }

      const dataChannel = peerConnection.createDataChannel('realtime-channel')
      dataChannelRef.current = dataChannel

      dataChannel.addEventListener('open', () => {
        updateSession(dataChannel)
      })

      dataChannel.addEventListener('message', handleDataChannelMessage)

      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      const response = await fetch('/api/voice-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice, temperature, instructions: buildSystemInstructions() })
      })

      if (!response.ok) {
        throw new Error('Failed to create voice session: ' + response.status)
      }

      const data = await response.json()
      const endpoint = data.endpoint
      const deployment = data.deployment

      const sdpResponse = await fetch(`${endpoint}?model=${deployment}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey || data.ephemeralKey}`,
          'Content-Type': 'application/sdp'
        }
      })

      if (!sdpResponse.ok) {
        throw new Error('WebRTC connection failed: ' + sdpResponse.status)
      }

      const answer = { type: 'answer' as RTCSdpType, sdp: await sdpResponse.text() }
      await peerConnection.setRemoteDescription(answer)

      setIsSessionActive(true)
    } catch (error: any) {
      console.error('Error initializing WebRTC:', error)
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

      await initializeWebRTC(ephemeralKey)
    } catch (error: any) {
      console.error('Error starting voice session:', error)
      alert('Error: ' + error.message)
      setIsSessionActive(false)
    }
  }

  const endVoiceSession = () => {
    if (dataChannelRef.current) {
      try {
        dataChannelRef.current.close()
      } catch (e) {
        console.warn('Error closing data channel:', e)
      }
      dataChannelRef.current = null
    }

    if (peerConnectionRef.current) {
      try {
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

    if (audioElementRef.current) {
      try {
        audioElementRef.current.remove()
      } catch (e) {
        console.warn('Error removing audio element:', e)
      }
      audioElementRef.current = null
    }

    currentBetiResponse.current = ''
    setIsSessionActive(false)
    setIsSessionEnded(true)
    setIsSpeaking(false)
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
                <Card className="p-4 min-h-[400px] max-h-[500px] overflow-y-auto bg-gray-50" ref={transcriptContainerRef}>
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
                    className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  >
                    <div className="p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Settings</h2>
                        <Button
                          variant="ghost"
                          onClick={() => setShowSettings(false)}
                        >
                          <X size={24} />
                        </Button>
                      </div>

                      {/* Voice Settings */}
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

                        <div className="space-y-2">
                          <Label>Knowledge Base Editor</Label>
                          <Button
                            variant="outline"
                            onClick={() => setShowKnowledgeEditor(!showKnowledgeEditor)}
                            className="w-full"
                          >
                            {showKnowledgeEditor ? 'Hide' : 'Edit'} Knowledge Base
                          </Button>
                        </div>

                        {showKnowledgeEditor && (
                          <Textarea
                            value={knowledgeBase}
                            onChange={(e) => setKnowledgeBase(e.target.value)}
                            className="min-h-[300px] font-mono text-sm"
                          />
                        )}
                      </div>
                    </div>
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
