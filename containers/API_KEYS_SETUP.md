# API Keys Setup Guide

## Required API Keys

The Da-Kraken container system requires API keys for AI-powered code generation:

1. **OpenAI API Key** - For GPT models
2. **Anthropic API Key** - For Claude models

## Option 1: Get Official API Keys (Recommended)

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create new secret key
5. **Free tier**: $5 free credits for new accounts

### Anthropic API Key
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create new API key
5. **Free tier**: $5 free credits for new accounts

## Option 2: Free Alternatives & Temporary Solutions

### Local AI Models (No API Key Required)
```bash
# Install Ollama for local AI
curl -fsSL https://ollama.com/install.sh | sh

# Pull a coding model
ollama pull codellama:13b
ollama pull deepseek-coder:6.7b
```

### Free API Services
1. **Hugging Face Inference API**
   - Free tier: 30,000 characters/month
   - Sign up at https://huggingface.co/
   
2. **Cohere API**
   - Free tier: 100 API calls/month
   - Sign up at https://cohere.ai/

3. **Google AI Studio (Gemini)**
   - Free tier available
   - Visit https://makersuite.google.com/

## Option 3: Mock API for Development

For testing purposes, you can use mock responses:

### Create Mock API Keys
```bash
export OPENAI_API_KEY="mock-openai-key-for-testing"
export ANTHROPIC_API_KEY="mock-anthropic-key-for-testing"
```

## Setup Instructions

### 1. Create Environment File
```bash
cd /workspaces/Da-Kraken/containers
cp .env.example .env
```

### 2. Add Your API Keys
Edit the `.env` file:
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# Anthropic Configuration  
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-haiku-20240307

# Alternative: Local AI Models
USE_LOCAL_AI=false
OLLAMA_HOST=http://localhost:11434
LOCAL_MODEL=codellama:13b

# Alternative: Hugging Face
HUGGINGFACE_API_KEY=your_hf_token_here
HF_MODEL=microsoft/DialoGPT-medium
```

### 3. Alternative Configuration for Free Services

If you want to use free alternatives, here's how to configure each:

#### Hugging Face Setup
```bash
# Get free API token from https://huggingface.co/settings/tokens
export HUGGINGFACE_API_KEY="hf_your_token_here"
```

#### Local Ollama Setup
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
ollama serve &

# Pull coding models
ollama pull codellama:7b
ollama pull deepseek-coder:6.7b
```

## Quick Start with Mock Keys (For Testing)

If you just want to test the system without real API keys:

```bash
cd /workspaces/Da-Kraken/containers

# Create .env with mock keys
cat > .env << EOF
OPENAI_API_KEY=mock-openai-test-key
ANTHROPIC_API_KEY=mock-anthropic-test-key
USE_MOCK_AI=true
EOF

# Start the system
./manage-containers.sh start
```

## API Key Security Best Practices

1. **Never commit API keys to git**
2. **Use environment variables**
3. **Rotate keys regularly**
4. **Set usage limits**
5. **Monitor API usage**

## Testing Your Setup

### Test OpenAI Connection
```bash
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 10
  }'
```

### Test Anthropic Connection
```bash
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-haiku-20240307",
    "max_tokens": 10,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Test Container System
```bash
# Start containers
./manage-containers.sh start

# Test code generation
curl -X POST http://localhost:4000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a simple hello world function",
    "language": "javascript"
  }'
```

## Cost Management

### Free Tier Limits
- **OpenAI**: $5 free credits (expires after 3 months)
- **Anthropic**: $5 free credits
- **Hugging Face**: 30,000 characters/month free

### Tips to Reduce Costs
1. Use shorter prompts
2. Set max_tokens limits
3. Cache common responses
4. Use cheaper models (gpt-3.5-turbo vs gpt-4)
5. Monitor usage via API dashboards

## Troubleshooting

### Common Issues
1. **"Invalid API Key"** - Check key format and permissions
2. **"Rate limit exceeded"** - Wait or upgrade plan
3. **"Insufficient credits"** - Add billing info or use free alternatives

### Debug Mode
```bash
# Enable debug logging
export DEBUG=true
./manage-containers.sh start
```

Choose the option that works best for your needs - official API keys for production use, or free alternatives for development and testing!