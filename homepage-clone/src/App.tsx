import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SplashCursor } from '@/components/ui/splash-cursor'
import { VoiceChat } from '@/components/VoiceChat'
import { VoiceBotSideCard } from '@/components/VoiceBotSideCard'
import { Globe, Code, Sparkle, WarningCircle, Microphone, CaretDown, CaretUp } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  // Tab navigation state
  const [activeTab, setActiveTab] = useState<'clone' | 'voice'>('clone')

  // Collapse/expand state for chat script textarea
  const [isScriptExpanded, setIsScriptExpanded] = useState(false)
  
  // Replaced Spark KV (was causing 401 Unauthorized) with local state + localStorage persistence
  const [url, setUrl] = useState<string>(() => localStorage.getItem('website-url') || '')
  const [script, setScript] = useState<string>(() => localStorage.getItem('chat-script') || '')
    // Persist to localStorage when values change (simple, no external auth required)
    useEffect(() => { localStorage.setItem('website-url', url) }, [url])
    useEffect(() => { localStorage.setItem('chat-script', script) }, [script])
  const [isCloning, setIsCloning] = useState(false)
  const [isCloned, setIsCloned] = useState(false)
  const [clonedHtml, setClonedHtml] = useState<string | null>(null)
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Create a blob URL for the iframe to avoid "about:srcdoc" base URL issues
  useEffect(() => {
    if (clonedHtml) {
      const blob = new Blob([clonedHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      setIframeUrl(url)

      // Cleanup: revoke the blob URL when component unmounts or HTML changes
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setIframeUrl(null)
    }
  }, [clonedHtml])

  const isValidUrl = (urlString: string | undefined) => {
    if (!urlString || !urlString.trim()) return false
    try {
      const urlObj = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleClone = async () => {
    setError('')
    
    if (!isValidUrl(url)) {
      setError('Please enter a valid website URL')
      return
    }

    setIsCloning(true)
    
    try {
      // Make sure URL has protocol
      let processedUrl = url.trim()
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = 'https://' + processedUrl
      }

      const response = await fetch('/api/clone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: processedUrl,
          chatScript: script?.trim() || null
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to clone website' }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.previewHtml) {
        setClonedHtml(data.previewHtml)
        setIsCloned(true)
      } else {
        throw new Error('No HTML content received from server')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to clone website')
      console.error('Clone error:', err)
    } finally {
      setIsCloning(false)
    }
  }

  const handleReset = () => {
    setIsCloned(false)
    setClonedHtml(null)
    setIframeUrl(null)
    setError('')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SplashCursor />
      <div 
        className="absolute inset-0 bg-gradient-to-br from-violet-100/30 via-indigo-50/30 to-rose-100/30 pointer-events-none z-0"
        style={{
          background: 'linear-gradient(135deg, oklch(0.92 0.05 290 / 0.3) 0%, oklch(0.95 0.03 260 / 0.3) 50%, oklch(0.93 0.04 25 / 0.3) 100%)'
        }}
      />
      <AnimatePresence>
        {isCloned && clonedHtml && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white"
          >
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="absolute top-4 left-4 z-[100] shadow-lg hover:shadow-xl bg-white/95 backdrop-blur"
            >
              ← Back
            </Button>
            <iframe
              src={iframeUrl || undefined}
              className="w-full h-full border-0"
              title="Cloned Website"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
            {/* VoiceBot Side Card - Only shown when website is cloned */}
            <VoiceBotSideCard />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 pt-8">
        <AnimatePresence mode="wait">
          {!isCloned ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl"
            >
              {/* Tab Navigation */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="hidden flex gap-2 mb-4 p-1 bg-white/30 backdrop-blur-md rounded-lg shadow-lg"
              >
                <button
                  onClick={() => setActiveTab('clone')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'clone'
                      ? 'bg-white shadow-md text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                  }`}
                >
                  <Globe weight={activeTab === 'clone' ? 'fill' : 'regular'} size={20} />
                  Clone Site
                </button>
                <button
                  onClick={() => setActiveTab('voice')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                    activeTab === 'voice'
                      ? 'bg-white shadow-md text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                  }`}
                >
                  <Microphone weight={activeTab === 'voice' ? 'fill' : 'regular'} size={20} />
                  Voice Chat
                </button>
              </motion.div>

              {/* Clone Site Tab Content */}
              {activeTab === 'clone' && (
              <Card className="backdrop-blur-xl bg-card/70 shadow-2xl border-white/20 p-8 md:p-10">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, type: 'spring' }}
                    >
                      <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight leading-tight">Ronen's Tailored Chatbot Demo</h1>
                    </motion.div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label 
                        htmlFor="website-url" 
                        className="text-sm font-medium uppercase tracking-wide flex items-center gap-2"
                      >
                        <Globe className="text-primary" weight="duotone" size={18} />
                        Website URL TO CLONE
                      </Label>
                      <Input
                        id="website-url"
                        type="text"
                        placeholder="apple.com or 'netflix homepage'"
                        value={url}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                        className="h-12 px-4 text-base border-2 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="space-y-3">
                      <div
                        onClick={() => setIsScriptExpanded(!isScriptExpanded)}
                        className="flex items-center justify-between cursor-pointer group"
                      >
                        <Label
                          htmlFor="chat-script"
                          className="text-sm font-medium uppercase tracking-wide flex items-center gap-2 text-muted-foreground cursor-pointer"
                        >
                          <Code className="text-secondary" weight="duotone" size={18} />
                          Chat Widget Script (Optional)
                        </Label>
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isScriptExpanded ? (
                            <>
                              <CaretUp size={16} weight="bold" />
                              <span>Collapse</span>
                            </>
                          ) : (
                            <>
                              <CaretDown size={16} weight="bold" />
                              <span>Expand</span>
                            </>
                          )}
                        </button>
                      </div>
                      <AnimatePresence>
                        {isScriptExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            style={{ overflow: 'hidden' }}
                          >
                            <Textarea
                              id="chat-script"
                              placeholder='<script src="..."></script>'
                              value={script}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setScript(e.target.value)}
                              className="min-h-[120px] px-4 py-3 text-sm font-mono border-2 focus:border-secondary focus:ring-4 focus:ring-secondary/20 transition-all resize-none"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Alert variant="destructive" className="border-2">
                          <WarningCircle className="h-5 w-5" weight="fill" />
                          <AlertDescription className="ml-2">
                            {error}
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    <Button
                      onClick={handleClone}
                      disabled={!url?.trim() || isCloning}
                      className={`w-full h-14 text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 ${
                        url?.trim() && !isCloning ? 'cursor-pointer' : 'cursor-not-allowed'
                      }`}
                    >
                      <Sparkle className="mr-2" weight="fill" size={20} />
                      {isCloning ? 'Cloning Website...' : 'Clone Website'}
                      <Sparkle className="ml-2" weight="fill" size={20} />
                    </Button>
                  </div>
                </div>
              </Card>
              )}

              {/* Voice Chat Tab Content */}
              {activeTab === 'voice' && (
                <VoiceChat />
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App