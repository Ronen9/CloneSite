/**
 * Conversation Summary Utility
 *
 * Generates formatted conversation summaries for transferring voice chat context
 * to the Omnichannel chat widget.
 */

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Generate a formatted summary of conversation messages for chat transfer
 *
 * @param messages - Array of conversation messages to include in summary
 * @param reason - Optional reason for transfer provided by the AI
 * @returns Formatted string ready to send to chat widget
 */
export function generateChatTransferSummary(
  messages: ConversationMessage[],
  reason?: string
): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // Header with timestamp
  let summary = `[Voice Conversation - ${dateStr}, ${timeStr}]\n\n`;

  // Add transfer reason if provided
  if (reason && reason.trim()) {
    summary += `Reason for transfer: ${reason.trim()}\n\n`;
  }

  // Format messages - take last 10 to keep within reasonable length
  const recentMessages = messages.slice(-10);

  if (recentMessages.length === 0) {
    // No conversation history - just send minimal context
    summary += '[No prior conversation]\n\n';
  } else {
    recentMessages.forEach((msg) => {
      const msgTime = msg.timestamp.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      });

      const speaker = msg.role === 'user' ? 'Customer' : 'Voice Bot';
      const content = msg.content.trim();

      if (content) {
        summary += `[${msgTime}] ${speaker}: ${content}\n`;
      }
    });
    summary += '\n';
  }

  // Add separator and trigger phrase for Copilot escalation topic
  summary += '---\n\n';
  summary += "I'd like to speak to a human rep";

  // Truncate if too long (keep under 2900 chars for safety margin)
  const MAX_LENGTH = 2900;
  if (summary.length > MAX_LENGTH) {
    // Find a good truncation point (after a complete message)
    const truncated = summary.substring(0, MAX_LENGTH);
    const lastNewline = truncated.lastIndexOf('\n');

    if (lastNewline > 0) {
      summary = truncated.substring(0, lastNewline);
      summary += '\n\n[... conversation truncated ...]\n\n';
      summary += '---\n\n';
      summary += "I'd like to speak to a human rep";
    } else {
      // No good truncation point, just hard cut
      summary = truncated.substring(0, MAX_LENGTH - 100);
      summary += '...\n\n---\n\n';
      summary += "I'd like to speak to a human rep";
    }
  }

  return summary;
}

/**
 * Helper function to format a single message (for debugging/testing)
 */
export function formatMessage(msg: ConversationMessage): string {
  const timeStr = msg.timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });
  const speaker = msg.role === 'user' ? 'Customer' : 'Voice Bot';
  return `[${timeStr}] ${speaker}: ${msg.content.trim()}`;
}
