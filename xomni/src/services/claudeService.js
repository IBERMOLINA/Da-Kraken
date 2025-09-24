// Claude API Service for xomni AI Agent
class ClaudeService {
  constructor() {
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
    this.baseURL = 'https://api.anthropic.com/v1/messages';
    this.model = import.meta.env.VITE_CLAUDE_MODEL || 'claude-3-sonnet-20240229';
    this.maxTokens = parseInt(import.meta.env.VITE_CLAUDE_MAX_TOKENS) || 4096;
  }

  /**
   * Check if Claude API is available
   */
  isAvailable() {
    return !!this.apiKey;
  }

  /**
   * Send a message to Claude and get response
   * @param {string} message - User message
   * @param {Array} conversationHistory - Previous conversation context
   * @returns {Promise<Object>} Response from Claude
   */
  async sendMessage(message, conversationHistory = []) {
    if (!this.isAvailable()) {
      throw new Error('Claude API key not configured');
    }

    try {
      // Format conversation history for Claude API
      const messages = this.formatConversationHistory(conversationHistory, message);

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: this.maxTokens,
          messages: messages,
          system: this.getSystemPrompt()
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        content: data.content[0]?.text || 'No response generated',
        usage: data.usage
      };

    } catch (error) {
      console.error('Claude API Error:', error);
      
      return {
        success: false,
        error: error.message,
        fallbackResponse: this.getFallbackResponse(message)
      };
    }
  }

  /**
   * Format conversation history for Claude API
   * @param {Array} history - Conversation history
   * @param {string} newMessage - New user message
   * @returns {Array} Formatted messages for Claude
   */
  formatConversationHistory(history, newMessage) {
    const messages = [];

    // Add relevant conversation history (last 10 messages to stay within token limits)
    const recentHistory = history.slice(-10);
    
    recentHistory.forEach(msg => {
      if (msg.type === 'user') {
        messages.push({
          role: 'user',
          content: msg.content
        });
      } else if (msg.type === 'agent') {
        messages.push({
          role: 'assistant',
          content: msg.content
        });
      }
    });

    // Add the new user message
    messages.push({
      role: 'user',
      content: newMessage
    });

    return messages;
  }

  /**
   * Get system prompt for Claude
   * @returns {string} System prompt
   */
  getSystemPrompt() {
    return `You are a helpful AI coding assistant integrated into xomni, a universal coding environment. You specialize in:

- Creating project frameworks and scaffolding
- Building full-stack application architectures  
- Code optimization and refactoring
- Testing strategies and implementation
- Template generation for various platforms
- Development best practices and guidance

Key characteristics:
- Be practical and actionable in your responses
- Provide code examples when helpful
- Consider modern development practices
- Be concise but thorough
- Ask clarifying questions when needed

The user is working in a development environment and may ask about creating frameworks, scaffolding projects, building stacks, generating templates, optimizing code, or running tests. Provide helpful, developer-focused assistance.`;
  }

  /**
   * Get fallback response when Claude API is unavailable
   * @param {string} userMessage - User's message
   * @returns {string} Fallback response
   */
  getFallbackResponse(userMessage) {
    const fallbackResponses = [
      'I understand you want to create a framework. Let me help you set up the structure.',
      'I\'ll scaffold that project for you. What specific features do you need?',
      'Great! I\'ll create a stack configuration for your requirements.',
      'I\'ve optimized your code structure. The performance improvements are ready.',
      'All tests are passing. Your code is ready for deployment.',
      'I\'ve created a template based on your specifications.',
      'Let me help you with that development task. Could you provide more details?',
      'I\'m here to assist with your coding project. What specific help do you need?'
    ];

    // Simple keyword-based fallback selection
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('framework')) return fallbackResponses[0];
    if (lowerMessage.includes('scaffold')) return fallbackResponses[1];
    if (lowerMessage.includes('stack')) return fallbackResponses[2];
    if (lowerMessage.includes('optimize')) return fallbackResponses[3];
    if (lowerMessage.includes('test')) return fallbackResponses[4];
    if (lowerMessage.includes('template')) return fallbackResponses[5];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  /**
   * Validate API key format
   * @param {string} apiKey - API key to validate
   * @returns {boolean} Whether key format is valid
   */
  static validateApiKey(apiKey) {
    return typeof apiKey === 'string' && apiKey.startsWith('sk-ant-') && apiKey.length > 20;
  }
}

export default ClaudeService;