#!/bin/bash
# Kraken Mesh Container Integration
# Replaces bridge orchestrator with peer-to-peer mesh communication

set -e

CONTAINER_NAME=${1:-$(basename "$(pwd)")}
SERVICE_NAME=${2:-$CONTAINER_NAME}
MESH_PORT=${3:-$(shuf -i 8000-8999 -n 1)}

echo "🕸️ Initializing Kraken Mesh for $SERVICE_NAME"
echo "📡 Port: $MESH_PORT"

# Create mesh configuration
cat > /tmp/mesh-config.json << EOF
{
    "nodeId": "${HOSTNAME:-$(uuidgen)}",
    "serviceName": "$SERVICE_NAME",
    "port": $MESH_PORT,
    "capabilities": [],
    "aiEnabled": true,
    "storageOptimized": true,
    "realTimeUpdates": true
}
EOF

# Set environment variables
export MESH_PORT=$MESH_PORT
export SERVICE_NAME=$SERVICE_NAME
export MESH_CONFIG="/tmp/mesh-config.json"
export AI_ENABLED=true
export STORAGE_OPTIMIZED=true

# Start mesh node
echo "🚀 Starting mesh node..."
node /shared/kraken-mesh.js $SERVICE_NAME $MESH_PORT &
MESH_PID=$!

echo "✅ Mesh node started (PID: $MESH_PID)"
echo "🔍 Discovery endpoint: http://localhost:$MESH_PORT/mesh/discover"
echo "🧠 AI Chat endpoint: http://localhost:$MESH_PORT/mesh/ai/chat"
echo "⚡ Execute endpoint: http://localhost:$MESH_PORT/mesh/execute"

# Health check
sleep 2
if curl -s "http://localhost:$MESH_PORT/mesh/health" > /dev/null; then
    echo "✅ Mesh node is healthy"
else
    echo "❌ Mesh node health check failed"
    exit 1
fi

# Store PID for cleanup
echo $MESH_PID > /tmp/mesh.pid

echo "🎯 Mesh integration complete for $SERVICE_NAME"