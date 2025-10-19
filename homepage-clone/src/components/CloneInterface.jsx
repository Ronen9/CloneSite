import React, { useState, useEffect } from 'react';

// Simple Responsive Website Scraper Interface
const CloneInterface = () => {
  const [url, setUrl] = useState('');
  const [chatScript, setChatScript] = useState(''); // Add chat script state
  const [isLoading, setIsLoading] = useState(false);
  const [clonedHtml, setClonedHtml] = useState(null);
  const [error, setError] = useState(null);
  const [showInput, setShowInput] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Make sure URL has protocol
      let processedUrl = url.trim();
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = 'https://' + processedUrl;
      }

      const response = await fetch('/api/clone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: processedUrl,
          chatScript: chatScript.trim() || null // Send chat script if provided
        }),
      });

      console.log('🐛 DEBUG: Sent chatScript:', chatScript.trim() || 'null'); // Debug log

      let data;
      try {
        data = await response.json();
      } catch {
        // If response is not valid JSON
        setError('Server error: Invalid JSON response.');
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.previewHtml) {
        setClonedHtml(data.previewHtml);
        setShowInput(false);
        setUrl('');
      }
    } catch (err) {
      setError(err.message || 'Failed to clone website');
      console.error('Clone error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloneAnother = () => {
    setClonedHtml(null);
    setShowInput(true);
    setError(null);
    // Optionally clear chat script - or keep it for reuse
    // setChatScript('');
  };

  // Removed default chat widget auto-injection: only user-supplied script (sent to backend) will appear in cloned HTML.
  // This effect intentionally left empty to avoid unintended widget duplication.
  useEffect(() => { /* no-op: default chat injection removed */ }, [showInput]);

  // Full screen cloned website view
  if (clonedHtml && !showInput) {
    return (
      <div className="relative w-full h-screen">
        {/* Improved Back Button */}
        <button
          onClick={handleCloneAnother}
          className="fixed top-4 left-4 flex items-center gap-1 px-2 py-1 rounded-full bg-white text-gray-800 font-medium shadow-lg border border-gray-200 hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200 text-xs"
          style={{
            zIndex: 999999,
            position: 'fixed',
            boxShadow: '0 4px 12px 0 rgba(0,0,0,0.1)',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5 text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span>Back</span>
        </button>
        
        {/* Full Screen Iframe - Better for Vercel deployment */}
        <iframe
          srcDoc={clonedHtml}
          className="w-full h-full border-0"
          title="Cloned website"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation allow-modals"
          loading="lazy"
          style={{
            colorScheme: 'normal',
            background: 'white'
          }}
          onLoad={(e) => {
            try {
              const iframe = e.target;
              const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
              if (iframeDoc) {
                const style = iframeDoc.createElement('style');
                style.textContent = `
                  body { 
                    margin: 0 !important; 
                    padding: 0 !important; 
                    overflow-x: hidden !important;
                  }
                  * { box-sizing: border-box !important; }
                `;
                iframeDoc.head.appendChild(style);
              }
            } catch {
              console.log('Could not access iframe content (CORS)');
            }
          }}
        />
      </div>
    );
  }

  // UI identical to https://website-scraper-lemon.vercel.app/
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f8fafc] via-[#a8edea] to-[#fed6e3]">
      <div className="rounded-3xl shadow-4xl flex flex-col items-center px-12 py-16 backdrop-blur-2xl bg-white/80 border-2 border-cyan-300" style={{ minWidth: 480, maxWidth: 560, width: '100%', boxShadow: '0 20px 60px 0 rgba(80,180,220,0.18)' }}>
        <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-6 leading-tight drop-shadow-lg tracking-tight">Website Background<br/>Scraper</h1>
        <p className="text-gray-700 text-lg text-center mb-10 leading-relaxed">Enter any website URL or description to use as your background</p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-10">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL (e.g., apple.com) or description (e.g., 'netflix website')"
            className="w-4/5 text-lg px-6 py-5 rounded-xl border-2 border-cyan-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200/30 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 bg-white/95 shadow-md"
            disabled={isLoading}
            autoFocus
          />
          
          {/* Chat Script Input */}
          <div className="w-4/5 space-y-4">
            <label className="block text-base text-gray-600 font-medium">
              Chat Widget Script (optional):
            </label>
            <textarea
              value={chatScript}
              onChange={(e) => setChatScript(e.target.value)}
              placeholder='Paste your chat script here (e.g., <script id="chat-widget"...></script>)'
              className="w-full text-sm px-5 py-5 rounded-xl border-2 border-cyan-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200/30 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 bg-white/95 shadow-md font-mono h-28 resize-none leading-relaxed"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 leading-relaxed">
              Leave empty to use default chat widget
            </p>
          </div>
          
          <div className="h-4" />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-3/5 py-4 rounded-full text-lg font-extrabold text-white shadow-md transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-200"
          >
            {isLoading ? (
              <span>Scraping...</span>
            ) : (
              'Scrape Website'
            )}
          </button>
        </form>
        {error && (
          <div className="mt-8 bg-red-100 border border-red-300 rounded-2xl p-5 w-full text-center">
            <p className="text-red-600 text-base leading-relaxed">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CloneInterface;