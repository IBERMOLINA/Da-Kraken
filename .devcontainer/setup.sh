#!/bin/bash
set -e

echo "🚀 Da-Kraken Codespace Setup Starting..."

# Check Node.js version
node --version
npm --version

# Navigate to xomni directory and install dependencies
cd xomni

echo "📦 Installing xomni dependencies..."
npm install

echo "🧹 Clearing npm cache..."
npm cache clean --force

echo "🔍 Verifying installation..."
npm list --depth=0

echo "✅ All dependencies installed successfully!"
echo "🎉 Da-Kraken development environment is ready!"

# Display helpful information
echo ""
echo "📋 Available commands:"
echo "  - npm run dev (in xomni/)    : Start development server"
echo "  - npm run server (in xomni/) : Start backend server"  
echo "  - npm run build (in xomni/)  : Build for production"
echo ""
echo "🌐 Default ports:"
echo "  - 3000: Xomni Frontend"
echo "  - 3001: Xomni Backend"
echo "  - 8000: Local Server"