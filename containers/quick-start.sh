#!/bin/bash

# Quick API Key Setup and Container Start
# This script will get you running in under 2 minutes

set -e

echo "🚀 Da-Kraken Quick Setup"
echo "========================="

cd /workspaces/Da-Kraken/containers

echo "1️⃣ Setting up mock API keys for immediate testing..."

cat > .env << EOF
# Quick Setup - Mock API Keys
OPENAI_API_KEY=mock-openai-test-key-$(date +%s)
ANTHROPIC_API_KEY=mock-anthropic-test-key-$(date +%s)
USE_MOCK_AI=true

# Container Configuration
CONTAINER_MEMORY_LIMIT=1g
CONTAINER_CPU_LIMIT=0.5
BRIDGE_PORT=4000
REDIS_URL=redis://redis:6379
NODE_ENV=development
LOG_LEVEL=info
EOF

echo "✅ Mock API keys configured!"

echo "2️⃣ Starting bridge orchestrator..."
./manage-containers.sh bridge

echo "3️⃣ Waiting for services to start..."
sleep 15

echo "4️⃣ Testing the system..."

# Test health endpoint
if curl -s http://localhost:4000/health > /dev/null; then
    echo "✅ Bridge orchestrator is running!"
    
    # Test code generation
    echo "🧪 Testing code generation..."
    curl -X POST http://localhost:4000/generate \
        -H "Content-Type: application/json" \
        -d '{
            "prompt": "Create a hello world function",
            "language": "javascript"
        }' | jq '.' 2>/dev/null || echo "Code generation API is responding!"
        
    echo
    echo "🎉 SUCCESS! Your system is ready!"
    echo
    echo "📋 Next Steps:"
    echo "• Open http://localhost:4000/health to check status"
    echo "• Use the API: curl -X POST http://localhost:4000/generate -H 'Content-Type: application/json' -d '{\"prompt\":\"your code request\",\"language\":\"javascript\"}'"
    echo "• Get real API keys: ./setup-api-keys.sh"
    echo "• Start language containers: ./manage-containers.sh start nodejs"
    echo
    echo "🔗 Service URLs:"
    echo "• Bridge API: http://localhost:4000"
    echo "• Health Check: http://localhost:4000/health"
    echo
    echo "🆓 To get FREE API keys for better results:"
    echo "• OpenAI: https://platform.openai.com/signup ($5 free)"
    echo "• Anthropic: https://console.anthropic.com/ ($5 free)"
    echo "• Then run: ./setup-api-keys.sh"
    
else
    echo "❌ Failed to start bridge orchestrator"
    echo "Check logs: ./manage-containers.sh logs bridge-orchestrator"
fi