import React, { useState, useEffect } from 'react';

// Simple Responsive Website Scraper Interface
const CloneInterface = () => {
  const [url, setUrl] = useState('');
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
        body: JSON.stringify({ url: processedUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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
  };

  // Inject Microsoft Omnichannel chat widget on all pages (homepage and after scrape)
  useEffect(() => {
    // Prevent duplicate script injection
    if (!document.getElementById('Microsoft_Omnichannel_LCWidget')) {
      const script = document.createElement('script');
      script.id = 'Microsoft_Omnichannel_LCWidget';
      script.src = 'https://oc-cdn-public-eur.azureedge.net/livechatwidget/scripts/LiveChatBootstrapper.js';
      script.setAttribute('data-app-id', '35501611-0d9e-4449-a089-15db04dc1540');
      script.setAttribute('data-lcw-version', 'prod');
      script.setAttribute('data-org-id', '28ef5156-a985-ef11-ac1c-7c1e52504374');
      script.setAttribute('data-org-url', 'https://m-28ef5156-a985-ef11-ac1c-7c1e52504374.eu.omnichannelengagementhub.com');
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

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
      <div className="rounded-3xl shadow-4xl flex flex-col items-center px-10 py-12 backdrop-blur-2xl bg-white/80 border-2 border-cyan-300" style={{ minWidth: 370, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px 0 rgba(80,180,220,0.18)' }}>
        <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-4 leading-tight drop-shadow-lg tracking-tight">Website Background<br/>Scraper</h1>
        <p className="text-gray-700 text-lg text-center mb-8">Enter any website URL or description to use as your background</p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-6">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL (e.g., apple.com) or description (e.g., 'netflix website')"
            className="w-5/6 max-w-xs text-lg px-5 py-3 rounded-xl border-2 border-cyan-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-200/30 outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 bg-white/95 shadow-md"
            disabled={isLoading}
            autoFocus
          />
          <div className="h-10" />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-1/2 py-2 rounded-full text-base font-extrabold text-white shadow-md transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-200"
            style={{marginTop: '0.5rem'}}
          >
            {isLoading ? (
              <span>Scraping...</span>
            ) : (
              'Scrape Website'
            )}
          </button>
        </form>
        {error && (
          <div className="mt-6 bg-red-100 border border-red-300 rounded-2xl p-4 w-full text-center">
            <p className="text-red-600 text-base">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CloneInterface;