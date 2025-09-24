#!/bin/bash
set -e

echo "🐘 Starting PHP Development Environment"

# Create default public directory if it doesn't exist
if [ ! -d "/workspace/public" ]; then
    mkdir -p /workspace/public
fi

# Create default index.php if it doesn't exist
if [ ! -f "/workspace/public/index.php" ]; then
    cat > /workspace/public/index.php << 'EOF'
<?php
echo "<h1>🐘 PHP Development Environment</h1>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>Current Time: " . date('Y-m-d H:i:s') . "</p>";
echo "<p>Server: " . $_SERVER['SERVER_NAME'] . "</p>";

// Bridge orchestrator health check
$bridge_health = @file_get_contents('http://bridge-orchestrator:4000/health');
if ($bridge_health) {
    echo "<p>✅ Bridge Orchestrator: Connected</p>";
} else {
    echo "<p>❌ Bridge Orchestrator: Not connected</p>";
}

phpinfo();
?>
EOF
fi

# Install composer dependencies if composer.json exists
if [ -f "/workspace/composer.json" ]; then
    echo "📦 Installing Composer dependencies..."
    composer install --no-interaction --optimize-autoloader
fi

# Start Apache in foreground
echo "🚀 Starting Apache server on port 80..."
exec "$@"