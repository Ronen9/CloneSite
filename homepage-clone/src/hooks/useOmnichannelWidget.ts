/**
 * Microsoft Omnichannel Widget Hook
 *
 * Provides programmatic control over the Microsoft Omnichannel chat widget,
 * including opening the widget, sending messages, and handling transfer flows.
 */

import { useState, useEffect } from 'react';

interface TransferResult {
  success: boolean;
  error?: string;
}

// Selector arrays (try in order of specificity)
const CHAT_BUTTON_SELECTORS = [
  '[data-id="oc-lcw-chat-button"]',
  '.oc-lcw-chat-button',
  '#oc-lcw-chat-button',
  'button[aria-label*="chat" i]',
  'div[role="button"][aria-label*="chat" i]',
  'button[title*="chat" i]',
  // Common Omnichannel button patterns
  'div.oc-lcw-button',
  'button.webchat-button',
  'iframe[title*="chat" i]',
  // Fallback: look for any button-like element with chat-related attributes
  '[id*="chat-button" i]',
  '[class*="chat-button" i]'
];

// Note: TEXTAREA and SEND_BUTTON selectors removed because we cannot access
// the chat widget UI (it's in a cross-origin iframe)

/**
 * Get the iframe document where the cloned website is loaded
 */
const getIframeDocument = (): Document | null => {
  const iframe = document.querySelector('iframe[title="Cloned Website"]') as HTMLIFrameElement;
  if (iframe) {
    try {
      return iframe.contentDocument || iframe.contentWindow?.document || null;
    } catch (e) {
      console.error('❌ Cannot access iframe document (CORS issue):', e);
      return null;
    }
  }
  return null;
};

/**
 * Hook for interacting with Microsoft Omnichannel chat widget
 */
export function useOmnichannelWidget() {
  const [isAvailable, setIsAvailable] = useState(false);

  // This approach doesn't work - Copilot Studio stores context on its backend servers
  // We'll handle this differently by sending empty escalationTrigger value

  // Check for widget availability
  useEffect(() => {
    let mounted = true;
    let checkCount = 0;
    const MAX_CHECKS = 60; // Check for 60 seconds (widget loads after page loads)

    const checkWidget = () => {
      if (!mounted) return;

      let found = false;
      const iframeDoc = getIframeDocument();

      if (!iframeDoc && checkCount === 0) {
        console.log('🔍 Waiting for iframe to load...');
      }

      if (iframeDoc) {
        // Method 1: Check for Microsoft Omnichannel API in iframe window
        const iframeWindow = (document.querySelector('iframe[title="Cloned Website"]') as HTMLIFrameElement)?.contentWindow;
        // @ts-ignore
        if (iframeWindow?.Microsoft?.Omnichannel?.LiveChatWidget) {
          found = true;
          console.log('✅ Chat widget detected via Microsoft Omnichannel API in iframe');
        }

        // Method 2: Try to find chat button in iframe using any of the selectors
        if (!found) {
          for (const selector of CHAT_BUTTON_SELECTORS) {
            const button = iframeDoc.querySelector(selector);
            if (button) {
              found = true;
              console.log(`✅ Chat widget detected in iframe with selector: ${selector}`);
              break;
            }
          }
        }
      }

      // If not found yet, log which selectors we tried
      if (!found && checkCount === 0) {
        console.log('🔍 Looking for chat widget in cloned website iframe...', {
          iframeFound: !!iframeDoc,
          selectorsTriedCount: CHAT_BUTTON_SELECTORS.length
        });
      }

      setIsAvailable(found);

      checkCount++;
      if (!found && checkCount < MAX_CHECKS) {
        // Keep checking if not found yet
        setTimeout(checkWidget, 1000);
      } else if (!found && checkCount >= MAX_CHECKS) {
        console.warn('⚠️ Chat widget not detected after 60 seconds.');
        console.warn('Tried Microsoft.Omnichannel.LiveChatWidget API in iframe: not found');
        console.warn('Tried DOM selectors in iframe:', CHAT_BUTTON_SELECTORS);
        console.warn('💡 Make sure you pasted the chat widget script before cloning the website');
      }
    };

    // Start checking immediately
    checkWidget();

    return () => {
      mounted = false;
    };
  }, []);

  // No longer need click interceptor since we're not using escalationTrigger context variable
  // The chat widget will work normally when users click it

  /**
   * Find an element using multiple selectors, searching in ALL iframes (including nested ones)
   */
  const findElement = (selectors: string[]): Element | null => {
    // Helper to recursively search in document and all iframes
    const searchInDocument = (doc: Document, depth: number = 0): Element | null => {
      // Try selectors in this document
      for (const selector of selectors) {
        const element = doc.querySelector(selector);
        if (element) {
          console.log(`✅ Found element at depth ${depth} with selector: ${selector}`);
          return element;
        }
      }

      // Recursively search in all iframes in this document
      const iframes = doc.querySelectorAll('iframe');
      for (const iframe of iframes) {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            const found = searchInDocument(iframeDoc, depth + 1);
            if (found) return found;
          }
        } catch (e) {
          // Cross-origin iframe, skip
        }
      }

      return null;
    };

    // Start search from the cloned website iframe
    const iframeDoc = getIframeDocument();
    if (iframeDoc) {
      const found = searchInDocument(iframeDoc, 0);
      if (found) return found;
    }

    // Fallback: search from main document
    const found = searchInDocument(document, 0);
    if (found) return found;

    console.warn('⚠️ Element not found with any selector:', selectors);
    return null;
  };

  /**
   * Open the Omnichannel chat widget with custom context
   * For voice escalation, we ONLY send the conversation summary to the agent workspace
   * We do NOT use escalationTrigger context variable (causes persistence issues)
   * Instead, we'll send a natural message that triggers escalation via Copilot Studio's topic
   */
  const openChatWidgetWithContext = async (conversationSummary: string, reason?: string, isFromVoiceEscalation: boolean = false): Promise<boolean> => {
    try {
      console.log('🔵 Opening chat widget with custom context...');
      console.log('🔍 isFromVoiceEscalation:', isFromVoiceEscalation);

      // Get the iframe window (where the chat widget lives)
      const iframeWindow = (document.querySelector('iframe[title="Cloned Website"]') as HTMLIFrameElement)?.contentWindow;

      // Method 1: Try Microsoft Omnichannel API with custom context
      // @ts-ignore
      if (iframeWindow?.Microsoft?.Omnichannel?.LiveChatWidget) {
        try {
          console.log('📞 Using Microsoft Omnichannel API...');

          // IMPORTANT: Use setContextProvider for bot variables, NOT customContext in startChat
          // customContext is for agent workspace display only
          // setContextProvider makes variables available to Copilot Studio bot logic
          if (isFromVoiceEscalation) {
            // @ts-ignore
            iframeWindow.Microsoft.Omnichannel.LiveChatWidget.SDK.setContextProvider(function() {
              return {
                'autoEscalate': {'value': 'true', 'isDisplayable': false}
              };
            });
            console.log('📍 Voice escalation: Set context provider with autoEscalate flag');
          }

          // Start chat
          // @ts-ignore
          await iframeWindow.Microsoft.Omnichannel.LiveChatWidget.SDK.startChat({
            inNewWindow: false
          });

          console.log('✅ Chat opened via Omnichannel API');
          return true;
        } catch (apiError) {
          console.warn('⚠️ Omnichannel API failed, trying DOM method:', apiError);
        }
      }

      // Method 2: Fallback - just open without context (if API not available)
      const button = findElement(CHAT_BUTTON_SELECTORS) as HTMLElement;

      if (!button) {
        console.error('❌ Chat button not found in iframe');
        return false;
      }

      // Click the button
      button.click();
      console.log('✅ Chat button clicked in iframe (without context - API not available)');
      console.warn('⚠️ Conversation summary NOT sent (API unavailable)');

      return true;
    } catch (error: any) {
      console.error('❌ Error opening chat widget:', error);
      return false;
    }
  };

  // Note: We cannot send messages programmatically to the Omnichannel chat widget
  // because the chat UI is in a cross-origin iframe that we cannot access.
  // Instead, we use context variables that Copilot Studio can detect.

  /**
   * Complete transfer flow: open widget with custom context
   * For voice escalation, we add an auto-escalation flag that Copilot Studio can detect
   */
  const transferToChat = async (message: string, reason?: string, isFromVoiceEscalation: boolean = false): Promise<TransferResult> => {
    try {
      console.log('🔄 Starting chat transfer flow...');
      console.log('📋 isFromVoiceEscalation:', isFromVoiceEscalation);

      // STEP 1: Open chat widget with custom context
      const opened = await openChatWidgetWithContext(message, reason, isFromVoiceEscalation);

      if (!opened) {
        throw new Error('Failed to open chat widget');
      }

      console.log('✅ Chat widget opened successfully');
      console.log('✅ Conversation summary sent to agent workspace');

      if (isFromVoiceEscalation) {
        console.log('🤖 Voice escalation context sent to Copilot Studio');
        console.log('💡 Copilot Studio should detect autoEscalate flag and trigger transfer');
      }

      return {
        success: true
      };

    } catch (error: any) {
      console.error('❌ Chat transfer failed:', error);

      // Fallback: Copy to clipboard
      console.warn('⚠️ Chat open failed, copying to clipboard as fallback...');

      try {
        await navigator.clipboard.writeText(message);
        return {
          success: true,
          error: 'Message copied to clipboard. Please paste and send in the chat widget.'
        };
      } catch (clipboardError) {
        return {
          success: false,
          error: 'Failed to open chat and clipboard copy failed'
        };
      }
    }
  };

  /**
   * Close/End the current chat session and clear storage
   * This clears the Omnichannel session to prevent context persistence
   */
  const endChat = async (): Promise<boolean> => {
    try {
      const iframeWindow = (document.querySelector('iframe[title="Cloned Website"]') as HTMLIFrameElement)?.contentWindow;

      // Try to close chat via API
      // @ts-ignore
      if (iframeWindow?.Microsoft?.Omnichannel?.LiveChatWidget?.SDK?.closeChat) {
        // @ts-ignore
        await iframeWindow.Microsoft.Omnichannel.LiveChatWidget.SDK.closeChat();
        console.log('✅ Chat session ended via Omnichannel API');
      }

      // IMPORTANT: Clear Omnichannel storage to prevent context persistence
      // This ensures escalationTrigger doesn't persist to next session
      try {
        // Clear session storage
        const sessionKeys = Object.keys(sessionStorage);
        sessionKeys.forEach(key => {
          if (key.includes('Microsoft_Omnichannel') || key.includes('oc-lcw') || key.includes('Omnichannel')) {
            sessionStorage.removeItem(key);
            console.log(`🧹 Cleared session storage: ${key}`);
          }
        });

        // Clear local storage
        const localKeys = Object.keys(localStorage);
        localKeys.forEach(key => {
          if (key.includes('Microsoft_Omnichannel') || key.includes('oc-lcw') || key.includes('Omnichannel')) {
            localStorage.removeItem(key);
            console.log(`🧹 Cleared local storage: ${key}`);
          }
        });

        console.log('✅ Omnichannel storage cleared');
      } catch (storageError) {
        console.warn('⚠️ Could not clear storage:', storageError);
      }

      return true;
    } catch (error: any) {
      console.error('❌ Error ending chat:', error);
      return false;
    }
  };

  return {
    isAvailable,
    transferToChat,
    endChat
  };
}
