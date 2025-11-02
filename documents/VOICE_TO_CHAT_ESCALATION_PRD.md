# Voice-to-Chat Escalation Feature - PRD

**Version:** 1.0  
**Last Updated:** October 27, 2025  
**Status:** Ready for Implementation

---

## 1. Executive Summary

### Objective
Enable seamless transfer from voice chat to Omnichannel chat widget when users request human assistance, preserving conversation context and triggering the escalation topic automatically.

### Success Criteria
- ✅ Voice conversation is tracked accurately throughout the session
- ✅ AI detects escalation intent reliably (95%+ accuracy)
- ✅ Chat widget opens automatically without user intervention
- ✅ Conversation summary is sent to chat successfully
- ✅ Escalation topic triggers in Copilot Studio
- ✅ User experience is smooth with clear status updates
- ✅ Zero impact on existing functionality

---

## 2. User Flow
```
┌─────────────────────────────────────────────────────────────┐
│ 1. User interacts with Voice Bot (VoiceBotSideCard)        │
│    - Azure OpenAI Realtime API (gpt-4o-realtime)           │
│    - Messages tracked in background                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. User says escalation phrase                              │
│    - "I want to speak to a human"                           │
│    - "Connect me to an agent"                               │
│    - "I need a real person"                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. AI calls transfer_to_chat function                       │
│    - Realtime API function calling                          │
│    - handleChatTransfer() triggered                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Generate conversation summary                            │
│    - Format last 10 messages with timestamps                │
│    - Add transfer reason if provided                        │
│    - Append: "I'd like to speak to a human rep"             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Open Omnichannel chat widget                             │
│    - Click chat button programmatically                     │
│    - Wait 2 seconds for widget to load                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Send summary to chat                                     │
│    - Find textarea element                                  │
│    - Paste summary text                                     │
│    - Click send button                                      │
│    - OR fallback: copy to clipboard                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Copilot escalation topic triggered                       │
│    - "I'd like to speak to a human rep" detected            │
│    - Escalation flow starts automatically                   │
│    - Customer routed to agent queue                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Show success status to user                              │
│    - "Transferred to Chat" message displayed                │
│    - Voice session continues (NOT stopped)                  │
│    - User can continue talking if needed                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Technical Architecture

### 3.1 Components Overview
```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  VoiceBotSideCard.tsx                                        │
│  ├─ State Management                                         │
│  │  ├─ conversationMessages[]  ← Track all messages         │
│  │  ├─ isTransferring          ← Transfer in progress       │
│  │  └─ transferCompleted       ← Transfer done              │
│  │                                                           │
│  ├─ Functions                                                │
│  │  ├─ trackMessage()          ← Add msg to history         │
│  │  ├─ handleChatTransfer()    ← Execute transfer           │
│  │  └─ Event Listeners         ← Hook into realtime API     │
│  │                                                           │
│  └─ UI Components                                            │
│     ├─ Status indicators                                     │
│     ├─ Transfer progress                                     │
│     └─ Success/error messages                                │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  useOmnichannelWidget.ts (Hook)                              │
│  ├─ isAvailable              ← Widget detection             │
│  ├─ openChatWidget()         ← Click chat button            │
│  ├─ sendChatMessage()        ← Paste & send message         │
│  └─ transferToChat()         ← Complete flow                │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  conversationSummary.ts (Utility)                            │
│  └─ generateChatTransferSummary()                            │
│     ├─ Format messages with timestamps                       │
│     ├─ Truncate if >2900 chars                              │
│     └─ Append trigger phrase                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  server.js (Local Dev)                                       │
│  └─ POST /api/voice-session                                  │
│     └─ Response includes:                                    │
│        ├─ tools: [transfer_to_chat function]                │
│        └─ instructions: "Call transfer_to_chat when..."     │
│                                                              │
│  api/voice-session.js (Vercel Production)                    │
│  └─ Same as server.js                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Azure OpenAI Realtime API                                   │
│  └─ Handles voice <-> text                                   │
│     └─ Calls transfer_to_chat function when triggered       │
│                                                              │
│  Microsoft Omnichannel Chat Widget                           │
│  └─ Loaded via user-provided script                          │
│     ├─ Chat button: [data-id="oc-lcw-chat-button"]          │
│     ├─ Textarea: [data-id="oc-lcw-textarea"]                │
│     └─ Send button: [data-id="oc-lcw-send-message-button"]  │
│                                                              │
│  Microsoft Copilot Studio                                    │
│  └─ Escalation Topic                                         │
│     └─ Triggered by: "I'd like to speak to a human rep"     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Implementation Details

### 4.1 Backend Changes

#### File: `server.js` (Line ~580)
**Location:** `/api/voice-session` endpoint

**Add to session configuration:**
```javascript
{
  model: deployment,
  voice: voice,
  temperature: temperature,
  
  // ADD THIS:
  instructions: `You are a helpful voice assistant for customer support.

Key guidelines:
- Assist customers professionally and courteously
- If customer requests to speak with a human agent, live representative, or real person, immediately call the transfer_to_chat function
- Common escalation phrases: "human", "agent", "representative", "real person", "live help"
- Acknowledge their request: "I'll transfer you to a human agent right away"

Always be polite and helpful.`,
  
  // ADD THIS:
  tools: [
    {
      type: "function",
      name: "transfer_to_chat",
      description: "Call this function when the user explicitly requests to speak with a human agent, live representative, or real person. This transfers them to the chat widget where they can connect with a live agent.",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description: "Brief reason why user wants human assistance (optional, 1-2 sentences)"
          }
        },
        required: []
      }
    }
  ]
}
```

#### File: `api/voice-session.js`
**Make identical changes as server.js**

---

### 4.2 New Files to Create

#### File: `homepage-clone/src/utils/conversationSummary.ts`

**Purpose:** Generate formatted conversation summaries for chat transfer

**Exports:**
- `ConversationMessage` interface
- `generateChatTransferSummary()` function

**Key Logic:**
```typescript
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function generateChatTransferSummary(
  messages: ConversationMessage[],
  reason?: string
): string {
  // 1. Add header with timestamp
  // 2. Include transfer reason if provided
  // 3. Format last 10 messages with timestamps
  // 4. Truncate if >2900 chars
  // 5. Append: "---\n\nI'd like to speak to a human rep"
  
  return formattedSummary;
}
```

**Format Example:**
```
[Voice Conversation - Oct 27, 2:30 PM]

Reason for transfer: Customer needs technical support

[2:28 PM] Customer: Hi, I need help with my account
[2:28 PM] Voice Bot: I'd be happy to help with your account. What do you need assistance with?
[2:29 PM] Customer: I can't login
[2:29 PM] Voice Bot: I understand you're having trouble logging in. Let me help you with that...
[2:30 PM] Customer: Can I speak to a human?

---

I'd like to speak to a human rep
```

---

#### File: `homepage-clone/src/hooks/useOmnichannelWidget.ts`

**Purpose:** React hook to control Microsoft Omnichannel chat widget

**Exports:**
- `useOmnichannelWidget()` hook

**Returns:**
```typescript
{
  isAvailable: boolean;              // Is widget loaded on page?
  openChatWidget: () => Promise;  // Click chat button
  sendChatMessage: (msg: string) => Promise; // Send message
  transferToChat: (msg: string) => Promise; // Complete flow
}
```

**Key Implementation:**
```typescript
export function useOmnichannelWidget() {
  const [isAvailable, setIsAvailable] = useState(false);

  // Check if widget exists every second for 30 seconds
  useEffect(() => {
    const checkWidget = () => {
      const button = document.querySelector('[data-id="oc-lcw-chat-button"]');
      setIsAvailable(!!button);
    };
    
    checkWidget();
    const interval = setInterval(checkWidget, 1000);
    setTimeout(() => clearInterval(interval), 30000);
    
    return () => clearInterval(interval);
  }, []);

  const openChatWidget = async () => {
    // Try multiple selectors to find chat button
    // Click the button
    // Return true if successful
  };

  const sendChatMessage = async (message: string) => {
    // Wait 2 seconds for widget to load
    // Find textarea: [data-id="oc-lcw-textarea"]
    // Set value and trigger events
    // Find send button: [data-id="oc-lcw-send-message-button"]
    // Click button
    // Return true if successful
  };

  const transferToChat = async (message: string) => {
    // Open widget
    // Send message
    // Return {success, error}
    // If fails, copy to clipboard as fallback
  };

  return { isAvailable, openChatWidget, sendChatMessage, transferToChat };
}
```

**Selectors Reference:**
```typescript
// Chat Button Selectors (try in order):
[
  '[data-id="oc-lcw-chat-button"]',
  '.oc-lcw-chat-button',
  '#oc-lcw-chat-button',
  'button[aria-label*="chat" i]'
]

// Textarea Selectors:
[
  '[data-id="oc-lcw-textarea"]',
  'textarea[aria-label*="message" i]',
  'textarea[placeholder*="Type" i]'
]

// Send Button Selectors:
[
  '[data-id="oc-lcw-send-message-button"]',
  'button[aria-label*="send" i]',
  'button[title*="Send" i]'
]
```

---

### 4.3 Component Changes

#### File: `homepage-clone/src/components/VoiceBotSideCard.tsx`

**Changes Required:**

1. **Add Imports:**
```typescript
import { useOmnichannelWidget } from '@/hooks/useOmnichannelWidget';
import { generateChatTransferSummary, ConversationMessage } from '@/utils/conversationSummary';
```

2. **Add State Variables:**
```typescript
const [conversationMessages, setConversationMessages] = useState([]);
const [isTransferring, setIsTransferring] = useState(false);
const [transferCompleted, setTransferCompleted] = useState(false);
const omnichannelWidget = useOmnichannelWidget();
```

3. **Add Message Tracking Function:**
```typescript
const trackMessage = useCallback((role: 'user' | 'assistant', content: string) => {
  if (!content?.trim()) return;
  
  setConversationMessages(prev => [...prev, {
    role,
    content: content.trim(),
    timestamp: new Date()
  }]);
}, []);
```

4. **Add Transfer Handler:**
```typescript
const handleChatTransfer = useCallback(async (reason?: string) => {
  if (isTransferring || transferCompleted) return;
  
  try {
    setIsTransferring(true);
    
    // Validate widget availability
    if (!omnichannelWidget.isAvailable) {
      throw new Error('Chat widget not available');
    }
    
    // Generate summary with trigger phrase
    const message = generateChatTransferSummary(conversationMessages, reason);
    
    // Execute transfer
    const result = await omnichannelWidget.transferToChat(message);
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    setTransferCompleted(true);
    
  } catch (error: any) {
    alert(`Transfer failed: ${error.message}`);
  } finally {
    setIsTransferring(false);
  }
}, [conversationMessages, omnichannelWidget]);
```

5. **Hook Into Realtime Events:**

Find existing event listeners and add tracking:
```typescript
// When assistant speaks (find existing handler and ADD):
realtimeClient.on('conversation.item.created', (event: any) => {
  // ... existing code ...
  
  // ADD: Track assistant messages
  if (event.item.type === 'message' && event.item.role === 'assistant') {
    const content = event.item.content?.[0]?.transcript || 
                    event.item.content?.[0]?.text || '';
    if (content) trackMessage('assistant', content);
  }
  
  // ADD: Detect transfer function call
  if (event.item.type === 'function_call' && event.item.name === 'transfer_to_chat') {
    const args = JSON.parse(event.item.arguments || '{}');
    handleChatTransfer(args.reason);
  }
});

// When user speaks (find existing handler and ADD):
realtimeClient.on('conversation.item.input_audio_transcription.completed', (event: any) => {
  // ... existing code ...
  
  // ADD: Track user messages
  if (event.transcript) trackMessage('user', event.transcript);
});
```

6. **Add UI Status Indicators:**

Add to JSX return (near top of component):
```typescript
{/* Widget Availability Warning */}
{!omnichannelWidget.isAvailable && (
  
    
    
      Chat widget not detected. Human transfer unavailable.
    
  
)}

{/* Transfer In Progress */}
{isTransferring && (
  
    
    Transferring to chat...
    
      Opening chat and sending conversation summary
    
  
)}

{/* Transfer Completed */}
{transferCompleted && (
  
    
    Transferred to Chat
    
      Your conversation has been sent to chat. A human agent will assist you shortly.
    
  
)}
```

---

## 5. Message Format & Examples

### 5.1 Transfer Message Format
```
[Voice Conversation - {timestamp}]

{optional: Reason for transfer: {reason}}

[{time}] Customer: {message}
[{time}] Voice Bot: {message}
[{time}] Customer: {message}
...

---

I'd like to speak to a human rep
```

### 5.2 Example Messages

**Example 1: Short Conversation**
```
[Voice Conversation - Oct 27, 2:30 PM]

Reason for transfer: Customer needs technical support

[2:30 PM] Customer: I need help with billing
[2:30 PM] Voice Bot: I can help with billing questions
[2:30 PM] Customer: Can I talk to someone?

---

I'd like to speak to a human rep
```

**Example 2: Longer Conversation**
```
[Voice Conversation - Oct 27, 3:15 PM]

[3:10 PM] Customer: Hi there
[3:10 PM] Voice Bot: Hello! How can I help you today?
[3:11 PM] Customer: I'm having trouble with my order
[3:11 PM] Voice Bot: I'd be happy to help. Can you tell me your order number?
[3:12 PM] Customer: It's 12345
[3:12 PM] Voice Bot: Let me look that up for you...
[3:13 PM] Customer: This is taking too long
[3:14 PM] Voice Bot: I apologize for the delay
[3:15 PM] Customer: I want to speak to a person

---

I'd like to speak to a human rep
```

---

## 6. Error Handling & Fallbacks

### 6.1 Error Scenarios

| Scenario | Detection | Handling |
|----------|-----------|----------|
| Widget not loaded | `!omnichannelWidget.isAvailable` | Show warning banner, prevent transfer |
| Button click fails | `openChatWidget()` returns false | Alert user to open manually |
| Message send fails | `sendChatMessage()` returns false | Copy to clipboard, instruct user |
| No conversation history | `conversationMessages.length === 0` | Send minimal message with trigger phrase |
| Parsing error | JSON.parse fails | Use default transfer (no reason) |

### 6.2 Fallback Strategy
```typescript
// Primary: Automated transfer
try {
  await omnichannelWidget.transferToChat(message);
} catch (error) {
  // Fallback: Clipboard + instructions
  await navigator.clipboard.writeText(message);
  alert('Chat opened! Message copied to clipboard. Please paste and send.');
}
```

---

## 7. Testing Strategy

### 7.1 Unit Tests (Optional)

- `generateChatTransferSummary()` with various message counts
- `trackMessage()` with empty/null values
- Message truncation at 2900 chars

### 7.2 Integration Tests

**Test Case 1: Basic Transfer Flow**
```
GIVEN voice session is active
WHEN user says "I want a human"
THEN transfer_to_chat function is called
AND chat widget opens
AND summary message is sent
AND "Transferred to Chat" status appears
```

**Test Case 2: No Widget Available**
```
GIVEN chat script is not loaded
WHEN user requests transfer
THEN warning message is shown
AND transfer is prevented
```

**Test Case 3: Auto-send Fails**
```
GIVEN chat widget is available
AND auto-send fails
WHEN transfer is attempted
THEN message is copied to clipboard
AND user is instructed to paste manually
```

### 7.3 Manual Test Scenarios

1. **Trigger Phrases:**
   - "I want to speak to a human"
   - "Connect me to an agent"
   - "I need a real person"
   - "Get me a live representative"
   - "Transfer me to chat"

2. **Conversation Lengths:**
   - 0 messages (immediate transfer)
   - 2-3 messages (short)
   - 10+ messages (full context)
   - 20+ messages (truncation)

3. **Edge Cases:**
   - Multiple transfer requests (only first succeeds)
   - Transfer during voice bot response
   - Chat already open when transfer triggered
   - Very long messages (emoji, special chars)

### 7.4 Production Validation

- ✅ Escalation topic triggers in Copilot Studio
- ✅ Agent receives conversation context
- ✅ Customer placed in correct queue
- ✅ No errors in console logs
- ✅ Voice session remains functional

---

## 8. Deployment Checklist

### 8.1 Pre-Deployment

- [ ] All files created/modified per specification
- [ ] Console logs added for debugging
- [ ] Error handling implemented
- [ ] UI status indicators working
- [ ] TypeScript types defined
- [ ] Code reviewed

### 8.2 Local Testing

- [ ] Test with `npm run dev`
- [ ] Verify backend function definition
- [ ] Test chat widget detection
- [ ] Test message tracking
- [ ] Test transfer flow end-to-end
- [ ] Test fallback scenarios

### 8.3 Production Deployment

- [ ] Deploy to Vercel
- [ ] Verify environment variables
- [ ] Test in production with real Omnichannel widget
- [ ] Verify escalation topic triggers
- [ ] Monitor logs for errors
- [ ] Test with real agent handoff

### 8.4 Post-Deployment

- [ ] Monitor success rate of transfers
- [ ] Check Copilot Studio analytics
- [ ] Review agent feedback
- [ ] Fix any edge cases discovered
- [ ] Document any quirks/learnings

---

## 9. Success Metrics

### 9.1 Technical Metrics

- **Function Call Accuracy:** >95% of escalation phrases detected
- **Widget Open Success:** >90% automatic opens succeed
- **Message Send Success:** >85% auto-sends succeed (rest clipboard)
- **Zero Breaking Changes:** 100% existing functionality preserved

### 9.2 Business Metrics

- **Agent Context Quality:** Agents report useful conversation context
- **Transfer Time:** <10 seconds from trigger to agent queue
- **Customer Satisfaction:** Smooth handoff experience
- **Escalation Rate:** Track % of voice sessions that escalate

---

## 10. Constraints & Assumptions

### 10.1 Constraints

- Omnichannel widget must be loaded via user-provided script
- Chat widget uses standard Microsoft Omnichannel selectors
- Message length limit: 3000 characters (safety margin: 2900)
- Function calling requires Azure OpenAI Realtime API
- DOM manipulation may be fragile (widget updates)

### 10.2 Assumptions

- User has active Copilot Studio with escalation topic configured
- Escalation topic triggers on phrase: "I'd like to speak to a human rep"
- Voice session can continue after transfer (NOT stopped)
- Widget loads within 30 seconds of page load
- Standard Omnichannel widget (not heavily customized)

---

## 11. Future Enhancements (Out of Scope)

- [ ] Voice recording/playback in chat transfer
- [ ] Sentiment analysis for prioritization
- [ ] Custom trigger phrases per tenant
- [ ] Real-time agent availability check
- [ ] Transfer summary to external CRM
- [ ] Multi-language support for summaries
- [ ] Analytics dashboard for transfers

---

## 12. References

### 12.1 Documentation

- [Microsoft Omnichannel Developer Guide](https://learn.microsoft.com/en-us/dynamics365/customer-service/develop/omnichannel-reference)
- [Azure OpenAI Realtime API Docs](https://learn.microsoft.com/en-us/azure/ai-services/openai/realtime-audio-quickstart)
- [Function Calling in OpenAI](https://platform.openai.com/docs/guides/function-calling)

### 12.2 Existing Implementation

- **Voice Bot Component:** `homepage-clone/src/components/VoiceBotSideCard.tsx`
- **Voice Session Endpoint:** `server.js` (line ~580) and `api/voice-session.js`
- **Omnichannel Script:** User-provided in App.tsx

### 12.3 Key Selectors
```typescript
// Omnichannel Widget Selectors
const SELECTORS = {
  chatButton: '[data-id="oc-lcw-chat-button"]',
  textarea: '[data-id="oc-lcw-textarea"]',
  sendButton: '[data-id="oc-lcw-send-message-button"]'
};
```

---

## Appendix A: Implementation Checklist
```
Phase 1: Backend Setup
[ ] Modify server.js - add tools array
[ ] Modify server.js - update instructions
[ ] Modify api/voice-session.js - add tools array  
[ ] Modify api/voice-session.js - update instructions
[ ] Test voice session still works

Phase 2: Utility Files
[ ] Create conversationSummary.ts
[ ] Implement ConversationMessage interface
[ ] Implement generateChatTransferSummary()
[ ] Test summary generation with mock data
[ ] Create useOmnichannelWidget.ts
[ ] Implement isAvailable detection
[ ] Implement openChatWidget()
[ ] Implement sendChatMessage()
[ ] Implement transferToChat()
[ ] Test hook with mock widget

Phase 3: Component Integration
[ ] Add imports to VoiceBotSideCard.tsx
[ ] Add state variables
[ ] Implement trackMessage()
[ ] Implement handleChatTransfer()
[ ] Hook into assistant message events
[ ] Hook into user message events
[ ] Hook into function call events
[ ] Add UI status indicators
[ ] Test message tracking
[ ] Test transfer flow

Phase 4: Testing
[ ] Test with real Omnichannel widget
[ ] Test all trigger phrases
[ ] Test short conversations
[ ] Test long conversations
[ ] Test error scenarios
[ ] Test fallback (clipboard)
[ ] Verify escalation topic triggers
[ ] Get agent feedback

Phase 5: Deployment
[ ] Code review
[ ] Local testing complete
[ ] Deploy to Vercel
[ ] Production smoke test
[ ] Monitor logs
[ ] Gather user feedback
```

---

## Appendix B: Code Snippets

### B.1 Function Definition (Backend)
```javascript
{
  type: "function",
  name: "transfer_to_chat",
  description: "Call this function when the user explicitly requests to speak with a human agent, live representative, or real person. This transfers them to the chat widget where they can connect with a live agent.",
  parameters: {
    type: "object",
    properties: {
      reason: {
        type: "string",
        description: "Brief reason why user wants human assistance (optional, 1-2 sentences)"
      }
    },
    required: []
  }
}
```

### B.2 Transfer Handler (Frontend)
```typescript
const handleChatTransfer = useCallback(async (reason?: string) => {
  if (isTransferring || transferCompleted) return;
  
  try {
    setIsTransferring(true);
    
    if (!omnichannelWidget.isAvailable) {
      throw new Error('Chat widget not available');
    }
    
    const message = generateChatTransferSummary(conversationMessages, reason);
    const result = await omnichannelWidget.transferToChat(message);
    
    if (!result.success) throw new Error(result.error);
    
    setTransferCompleted(true);
  } catch (error: any) {
    alert(`Transfer failed: ${error.message}`);
  } finally {
    setIsTransferring(false);
  }
}, [conversationMessages, omnichannelWidget]);
```

### B.3 Event Listener Integration
```typescript
realtimeClient.on('conversation.item.created', (event: any) => {
  if (event.item.type === 'message' && event.item.role === 'assistant') {
    const content = event.item.content?.[0]?.transcript || '';
    if (content) trackMessage('assistant', content);
  }
  
  if (event.item.type === 'function_call' && event.item.name === 'transfer_to_chat') {
    const args = JSON.parse(event.item.arguments || '{}');
    handleChatTransfer(args.reason);
  }
});
```

---

**END OF PRD**

*This document serves as the complete specification for implementing the voice-to-chat escalation feature. All implementation should reference this PRD as the source of truth.*
```