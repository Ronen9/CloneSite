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

const TEXTAREA_SELECTORS = [
  '[data-id="oc-lcw-textarea"]',
  'textarea[aria-label*="message" i]',
  'textarea[placeholder*="Type" i]',
  'textarea[placeholder*="type" i]',
  'textarea[id*="webchat" i]',
  'textarea[class*="webchat" i]',
  '#oc-lcw-textarea',
  'textarea',  // Last resort: any textarea
  'div[contenteditable="true"]', // Some chat widgets use contenteditable divs
  'input[type="text"][placeholder*="message" i]'
];

const SEND_BUTTON_SELECTORS = [
  '[data-id="oc-lcw-send-message-button"]',
  'button[aria-label*="send" i]',
  'button[title*="Send" i]',
  '#oc-lcw-send-button'
];

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
   */
  const openChatWidgetWithContext = async (conversationSummary: string, reason?: string): Promise<boolean> => {
    try {
      console.log('🔵 Opening chat widget with custom context...');

      // Get the iframe window (where the chat widget lives)
      const iframeWindow = (document.querySelector('iframe[title="Cloned Website"]') as HTMLIFrameElement)?.contentWindow;

      // Method 1: Try Microsoft Omnichannel API with custom context
      // @ts-ignore
      if (iframeWindow?.Microsoft?.Omnichannel?.LiveChatWidget) {
        try {
          console.log('📞 Using Microsoft Omnichannel API with custom context...');

          // Prepare custom context to send to agent
          const customContext = {
            'voiceConversationSummary': {
              'value': conversationSummary,
              'isDisplayable': true  // Agent can see this in their workspace
            },
            'escalationReason': {
              'value': reason || 'Customer requested human agent',
              'isDisplayable': true
            },
            'sourceChannel': {
              'value': 'Voice Bot',
              'isDisplayable': true
            },
            'escalationTrigger': {
              'value': 'voice_to_human',
              'isDisplayable': false  // Hidden, can be used for routing rules
            }
          };

          console.log('📋 Custom context:', customContext);

          // Start chat with custom context
          // @ts-ignore
          await iframeWindow.Microsoft.Omnichannel.LiveChatWidget.SDK.startChat({
            inNewWindow: false,
            customContext: customContext
          });

          console.log('✅ Chat opened via Omnichannel API with custom context');
          console.log('💡 Conversation summary sent to agent workspace');
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

  /**
   * Wait for chat widget to be fully loaded and ready
   */
  const waitForWidgetReady = async (): Promise<boolean> => {
    console.log('⏳ Waiting for chat widget conversation UI to load...');

    // Wait up to 30 seconds for textarea to appear (chat UI loads in nested iframe)
    for (let i = 0; i < 60; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));

      const textarea = findElement(TEXTAREA_SELECTORS);
      if (textarea) {
        console.log(`✅ Chat widget is ready (textarea found after ${(i + 1) * 0.5} seconds)`);
        return true;
      }

      // Log progress every 5 seconds
      if ((i + 1) % 10 === 0) {
        console.log(`⏳ Still waiting... (${(i + 1) * 0.5} seconds elapsed)`);
      }
    }

    console.warn('⚠️ Chat widget textarea not found after 30 seconds');
    console.warn('💡 The chat conversation UI may be in a cross-origin iframe or uses a different structure');
    return false;
  };

  /**
   * Send a message to the chat widget
   */
  const sendChatMessage = async (message: string): Promise<boolean> => {
    try {
      console.log('💬 Sending message to chat...');

      // Wait for widget to be fully ready
      const isReady = await waitForWidgetReady();
      if (!isReady) {
        console.error('❌ Chat widget failed to load');
        return false;
      }

      // Additional wait to ensure greeting message has appeared
      console.log('⏳ Waiting for greeting message...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Find textarea
      const textarea = findElement(TEXTAREA_SELECTORS) as HTMLTextAreaElement;

      if (!textarea) {
        console.error('❌ Chat textarea not found');
        return false;
      }

      // Set the message value
      textarea.value = message;

      // Trigger input events to ensure the widget recognizes the change
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));

      console.log('✅ Message pasted into textarea');

      // Wait a moment for the widget to process
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find and click send button
      const sendButton = findElement(SEND_BUTTON_SELECTORS) as HTMLElement;

      if (!sendButton) {
        console.error('❌ Send button not found');
        // Message is in textarea, user can send manually
        return false;
      }

      sendButton.click();
      console.log('✅ Send button clicked');

      return true;
    } catch (error: any) {
      console.error('❌ Error sending chat message:', error);
      return false;
    }
  };

  /**
   * Complete transfer flow: open widget with custom context
   * This sends the conversation summary directly to the agent workspace via API
   */
  const transferToChat = async (message: string, reason?: string): Promise<TransferResult> => {
    try {
      console.log('🔄 Starting chat transfer flow with custom context...');

      // Open chat widget with custom context (sends summary to agent directly)
      const opened = await openChatWidgetWithContext(message, reason);

      if (!opened) {
        throw new Error('Failed to open chat widget');
      }

      // Success! The custom context has been sent to the agent workspace
      console.log('✅ Chat transfer completed - conversation summary sent to agent workspace');

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

  return {
    isAvailable,
    transferToChat
  };
}
