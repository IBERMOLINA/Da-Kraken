# GPT Apps Integration Documentation

## Overview

The Da-Kraken platform now includes comprehensive GPT applications import and management capabilities. This system allows you to install, manage, and use various AI-powered applications directly within the platform.

## Features

### 🏪 Built-in App Store
- **Code Assistant GPT**: AI-powered coding assistant for all supported languages
- **Project Architect GPT**: AI architect for project planning and structure
- **DevOps Specialist GPT**: AI specialist for deployment and infrastructure
- **UI/UX Designer GPT**: AI designer for user interfaces and experiences
- **Data Analyst GPT**: AI analyst for data processing and insights

### 📥 Import Capabilities
- **From File**: Import custom GPT apps from JSON configuration files
- **From URL**: Import GPT apps directly from web URLs
- **OpenAI Integration**: Direct ChatGPT and OpenAI API integration
- **Anthropic Integration**: Claude AI assistant integration
- **Custom GPT Support**: Build and import your own GPT applications

### 🔐 Security Features
- **Secure API Key Management**: Integration with existing secure key system
- **Sandboxed Execution**: Apps run in controlled environments
- **Permission System**: Fine-grained control over app capabilities
- **Authentication**: Secure connection to external AI services

## Installation

### Prerequisites
1. OpenAI API key (for OpenAI-based apps)
2. Anthropic API key (for Claude-based apps)
3. Da-Kraken platform with modern UI

### Setup API Keys
1. Navigate to the containers directory
2. Edit the `.env` file and replace placeholder keys:
   ```bash
   OPENAI_API_KEY=your_actual_openai_key
   ANTHROPIC_API_KEY=your_actual_anthropic_key
   ```

### Include GPT Apps Manager
Add to your HTML:
```html
<link rel="stylesheet" href="css/gpt-apps.css">
<script src="js/gpt-apps-manager.js"></script>
```

## Usage

### Installing Built-in Apps
1. Click the "🏪 App Store" button in the GPT Applications section
2. Browse available applications
3. Click "Install" on any app you want to use
4. Wait for installation to complete

### Using Installed Apps
1. Find your installed app in the GPT Applications section
2. Click the play button (▶️) to open the app interface
3. Interact with the app through the provided interface

### Importing Custom Apps

#### From File
1. Click "Import" in the GPT Applications section
2. Select "📁 From File" tab
3. Choose your JSON configuration file
4. Click "Import File"

#### From URL
1. Click "Import" in the GPT Applications section
2. Select "🌐 From URL" tab
3. Enter the URL to your app configuration
4. Click "Import URL"

## Custom GPT App Configuration

### Basic Structure
```json
{
  "id": "my-custom-app",
  "name": "My Custom GPT App",
  "description": "A custom AI application",
  "version": "1.0.0",
  "author": "Your Name",
  "category": "custom",
  "symbol": "🤖",
  "icon": "fas fa-robot",
  "capabilities": ["chat", "analysis"],
  "languages": ["all"],
  "config": {
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 2000
  }
}
```

### Required Fields
- `id`: Unique identifier for your app
- `name`: Display name of the app
- `description`: Brief description of what the app does
- `version`: Version number (semantic versioning)

### Optional Fields
- `author`: App creator name
- `category`: App category (custom, development, design, etc.)
- `symbol`: Emoji symbol for display
- `icon`: Font Awesome icon class
- `capabilities`: Array of app capabilities
- `languages`: Supported programming languages
- `config`: AI model configuration
- `metadata`: Additional metadata
- `requirements`: API keys and permissions needed
- `customFunctions`: Custom functionality definitions

### Advanced Configuration
```json
{
  "config": {
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 2000,
    "systemPrompt": "You are a specialized assistant...",
    "customSettings": {
      "responseFormat": "detailed",
      "includeExamples": true
    }
  },
  "requirements": {
    "apiKeys": ["OPENAI_API_KEY"],
    "permissions": ["chat", "files"],
    "minVersion": "1.0.0"
  },
  "customFunctions": [
    {
      "name": "processInput",
      "description": "Process specialized input",
      "parameters": {
        "input": "string",
        "options": "object"
      }
    }
  ]
}
```

## API Integration

### Using GPT Apps Programmatically
```javascript
// Get the GPT Apps Manager instance
const gptManager = window.gptAppsManager;

// Install an app
await gptManager.installApp('code-assistant');

// Use an app
const response = await gptManager.useApp('code-assistant', 
  'Help me write a Python function to sort a list', 
  { language: 'python' }
);

console.log(response.content);
```

### Integration with Existing Systems
The GPT Apps Manager integrates seamlessly with:
- **xomni Agent Panel**: Existing AI conversation system
- **Modern UI**: 3D mechanical interface with symbols
- **Secure API Client**: Existing authentication system
- **Socket.io**: Real-time communication
- **Container System**: Multi-language development environment

## Troubleshooting

### Common Issues

#### API Key Errors
- **Problem**: "OpenAI API key required for installation"
- **Solution**: Update your `.env` file with valid API keys

#### Installation Failures
- **Problem**: App fails to install
- **Solution**: Check network connection and API key validity

#### App Not Responding
- **Problem**: Installed app doesn't respond
- **Solution**: Check app status and reinstall if necessary

### Debug Mode
Enable debug logging:
```javascript
window.gptAppsManager.debugMode = true;
```

## Examples

### Example Custom GPT App
See `/containers/modern-ui/examples/custom-gpt-app.json` for a complete example configuration.

### Code Assistant Usage
```javascript
// Use the code assistant for Python development
const response = await gptManager.useApp('code-assistant', 
  'Create a FastAPI endpoint for user authentication', 
  { 
    language: 'python',
    framework: 'fastapi'
  }
);
```

### Project Architect Usage
```javascript
// Use the project architect for planning
const response = await gptManager.useApp('project-architect', 
  'Design a microservices architecture for an e-commerce platform'
);
```

## Development

### Adding New Built-in Apps
1. Edit `gpt-apps-manager.js`
2. Add your app configuration to the `builtInApps` array in `setupAppStore()`
3. Implement any custom logic in `installBuiltInApp()`

### Extending Functionality
- **Custom API Clients**: Add support for new AI providers
- **Enhanced UI**: Customize the interface in `gpt-apps.css`
- **Plugin System**: Extend with additional plugin capabilities

## Security Considerations

1. **API Key Storage**: Never commit real API keys to version control
2. **App Validation**: All imported apps are validated before installation
3. **Sandboxing**: Apps run in controlled environments
4. **Permission System**: Apps can only access granted capabilities
5. **Secure Communication**: All API calls use HTTPS

## Contributing

To contribute to the GPT Apps system:
1. Fork the repository
2. Create a feature branch
3. Add your improvements
4. Submit a pull request

## Support

For support with GPT Apps:
- Check the troubleshooting section above
- Review the configuration examples
- Ensure API keys are properly configured
- Test with built-in apps first before custom imports

---

**Note**: This system leverages the existing Da-Kraken infrastructure including the modern UI, secure key management, and container system. Make sure these components are properly configured before using GPT Apps.