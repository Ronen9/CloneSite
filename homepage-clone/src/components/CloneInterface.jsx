import React, { useState } from 'react';

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

  // Full screen cloned website view
  if (clonedHtml && !showInput) {
    return (
      <div className="relative w-full h-screen">
        {/* Floating Clone Another Button */}
        <button
          onClick={handleCloneAnother}
          className="fixed top-4 right-4 z-50 bg-black bg-opacity-80 hover:bg-opacity-90 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm border border-white border-opacity-20"
        >
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Clone Another Website
        </button>
        
        {/* Full Screen Iframe */}
        <iframe
          srcDoc={clonedHtml}
          className="w-full h-full border-0"
          title="Cloned website"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
          loading="lazy"
          style={{
            colorScheme: 'normal',
            background: 'white'
          }}
          onLoad={(e) => {
            // Ensure iframe content is properly styled
            try {
              const iframe = e.target;
              const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
              if (iframeDoc) {
                // Add additional styling if needed
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
            } catch (err) {
              console.log('Could not access iframe content (CORS)');
            }
          }}
        />
      </div>
    );
  }

  // Minimal input interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Minimal Search Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <div className="flex items-center bg-white rounded-full px-6 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter a website URL"
                className="flex-1 text-lg outline-none text-gray-700 placeholder-gray-400"
                disabled={isLoading}
                autoFocus
              />
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="ml-4 bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center font-medium shadow-lg"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cloning...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Clone
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CloneInterface;