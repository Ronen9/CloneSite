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
        {/* Microsoft Fluent Style Back Button */}
        <button
          onClick={handleCloneAnother}
          className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-gray-800 font-semibold shadow-lg border border-gray-200/50 hover:bg-gray-50 hover:shadow-xl active:scale-95 transition-all duration-150 text-sm"
          style={{
            zIndex: 999999,
            position: 'fixed',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-[#0078d4]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span>Back to Clone</span>
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

  // Microsoft Fluent Design inspired UI
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f3f2f1] via-[#e1dfdd] to-[#d2d0ce] relative overflow-hidden">
      {/* Background decorative elements - Microsoft style */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#0078d4]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00188f]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-2xl mx-4 sm:mx-6 lg:mx-8">
        {/* Main card with Microsoft Fluent shadow and acrylic effect */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden backdrop-blur-xl" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.08)' }}>
          
          {/* Header section with gradient accent */}
          <div className="bg-gradient-to-r from-[#0078d4] to-[#00188f] px-8 sm:px-12 py-10 sm:py-12 text-white">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 sm:w-14 sm:h-14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-center mb-3 tracking-tight">
              CloneSite
            </h1>
            <p className="text-base sm:text-lg text-center text-blue-50 font-light">
              Clone and capture any website with ease
            </p>
          </div>

          {/* Form section */}
          <div className="px-8 sm:px-12 py-10 sm:py-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* URL Input */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-800">
                  Website URL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter URL (e.g., stripe.com, github.com)"
                    className="w-full text-base px-4 py-3.5 rounded-lg border-2 border-gray-300 focus:border-[#0078d4] focus:ring-2 focus:ring-[#0078d4]/20 outline-none transition-all duration-150 text-gray-800 placeholder-gray-400 bg-white hover:border-gray-400"
                    disabled={isLoading}
                    autoFocus
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Chat Script Input - Collapsible */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-800">
                  Chat Widget Script <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={chatScript}
                  onChange={(e) => setChatScript(e.target.value)}
                  placeholder='<script src="https://your-chat-widget.js"></script>'
                  className="w-full text-sm px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#0078d4] focus:ring-2 focus:ring-[#0078d4]/20 outline-none transition-all duration-150 text-gray-700 placeholder-gray-400 bg-white hover:border-gray-400 font-mono resize-none"
                  rows="3"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Add a custom chat widget to the cloned website
                </p>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="w-full py-3.5 rounded-lg text-base font-semibold text-white shadow-lg transition-all duration-150 bg-[#0078d4] hover:bg-[#106ebe] active:bg-[#005a9e] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 hover:shadow-xl"
                style={{ 
                  boxShadow: isLoading || !url.trim() ? 'none' : '0 4px 12px rgba(0, 120, 212, 0.3)'
                }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Cloning website...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Clone Website</span>
                  </>
                )}
              </button>
            </form>

            {/* Error Display */}
            {error && (
              <div className="mt-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 flex items-start gap-3 animate-fade-in-up">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-800">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-8 sm:px-12 pb-8 text-center">
            <p className="text-xs text-gray-500">
              Powered by advanced web scraping technology
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloneInterface;