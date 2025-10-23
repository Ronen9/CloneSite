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
  const [transcript, setTranscript] = useState<Message[]>([])
  
  // WebRTC refs (to be implemented in Stage 5)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

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

  const startVoiceSession = async () => {
    // To be implemented in Stage 5
    console.log('Starting voice session...')
  }

  const endVoiceSession = () => {
    // To be implemented in Stage 5
    console.log('Ending voice session...')
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
              rows={15}
              className="font-mono text-sm"
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
            onClick={startVoiceSession}
            disabled={isSessionActive}
            className="flex-1 h-14 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl"
          >
            <Microphone className="mr-2" weight="fill" size={20} />
            {isSessionActive ? 'Session Active...' : 'Start Voice Session'}
            <Sparkle className="ml-2" weight="fill" size={20} />
          </Button>
          {isSessionActive && (
            <Button
              onClick={endVoiceSession}
              variant="outline"
              className="h-14 px-8 border-2"
            >
              🛑 End Session
            </Button>
          )}
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
            >
              <Trash className="mr-2" size={16} />
              Clear
            </Button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 max-h-[500px] overflow-y-auto min-h-[200px]">
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
                      className={`max-w-[70%] rounded-2xl p-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-500 text-white rounded-br-sm'
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
      </motion.div>
    </div>
  )
}
