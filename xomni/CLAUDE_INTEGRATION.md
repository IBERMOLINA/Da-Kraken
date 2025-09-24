# Claude AI Integration for xomni

This document explains how to configure and use Claude AI as the chat assistant in xomni.

## Overview

The xomni Agent Panel now supports integration with Anthropic's Claude AI for intelligent conversation and coding assistance. When configured, Claude provides real-time responses to development queries. When not configured, the system gracefully falls back to simulation mode.

## Setup

### 1. Get Claude API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Generate a new API key
4. Copy the API key (starts with `sk-ant-`)

### 2. Configure Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your API key:
   ```env
   VITE_CLAUDE_API_KEY=sk-ant-your-api-key-here
   ```

3. Optional configuration:
   ```env
   # Configure Claude model (default: claude-3-sonnet-20240229)
   VITE_CLAUDE_MODEL=claude-3-sonnet-20240229
   
   # Configure max tokens (default: 4096)
   VITE_CLAUDE_MAX_TOKENS=4096
   ```

### 3. Restart Development Server

```bash
npm run dev
```

## Features

### Automatic Fallback
- **With API Key**: Shows "Claude AI Ready" status with ✨ icon
- **Without API Key**: Shows "Online (Simulation Mode)" status with 🤖 icon
- Graceful degradation ensures the interface always works

### Chat Interface
- Real-time conversation with Claude AI
- Context-aware responses based on conversation history
- Specialized prompts for development tasks
- Visual indicators for message sources (Claude AI, Fallback, etc.)

### Quick Actions
Pre-configured prompts for common development tasks:
- 🏗️ **Framework**: Create project frameworks
- 📦 **Scaffold**: Set up project scaffolding  
- 📚 **Stack**: Build full-stack applications
- 🎯 **Template**: Generate templates
- 🔧 **Optimize**: Code optimization
- 🧪 **Test**: Testing strategies

## Usage

1. Navigate to the Agent Panel (🤖 button in header)
2. Type your development question or use quick action buttons
3. Receive intelligent responses from Claude AI
4. Continue the conversation with context preservation

## System Prompts

Claude is configured with specialized system prompts for:
- Project framework creation
- Code scaffolding and architecture
- Development best practices
- Testing strategies
- Template generation
- Code optimization

## Error Handling

- API failures automatically fall back to simulation responses
- Network errors are handled gracefully
- Invalid API keys show clear error indicators
- Rate limiting and quota warnings (when implemented by Anthropic)

## Security

- API keys are stored in environment variables only
- No API keys are committed to the repository
- All API communication uses HTTPS
- Conversation history is limited to prevent token overflow

## Troubleshooting

### Common Issues

1. **"Simulation Mode" when API key is set**
   - Check API key format (should start with `sk-ant-`)
   - Verify environment variable name: `VITE_CLAUDE_API_KEY`
   - Restart development server after adding API key

2. **API Errors**
   - Check API key validity in Anthropic Console
   - Verify account has remaining credits
   - Check browser console for detailed error messages

3. **Slow Responses**
   - Claude API responses typically take 1-3 seconds
   - Network latency may affect response times
   - Large conversation histories may slow processing

### Debug Mode

Enable debug logging by checking browser console for:
- Claude API requests and responses
- Fallback activations
- Error details

## Development

### Service Architecture

The Claude integration uses a service-oriented architecture:

```
AgentPanel (UI) → ClaudeService → Anthropic API
                      ↓
                 Fallback Responses
```

### Key Files

- `src/services/claudeService.js` - Main Claude API integration
- `src/components/AgentPanel.jsx` - Updated UI component
- `.env.example` - Environment configuration template

### Extending

To add new features:

1. Modify `ClaudeService` for API changes
2. Update `AgentPanel` for UI enhancements
3. Add new quick actions in the `quickActions` array
4. Update system prompts in `getSystemPrompt()`

## License

This integration follows the same MIT license as the main xomni project.