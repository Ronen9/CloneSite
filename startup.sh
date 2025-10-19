#!/bin/sh
# Azure App Service startup script

echo "🚀 Starting Website Cloner application..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install --production

# Build frontend
echo "🏗️ Building TypeScript frontend..."
cd homepage-clone
npm install
npm run build
cd ..

# Start the server
echo "🎯 Starting Node.js server..."
NODE_ENV=production node server.js
