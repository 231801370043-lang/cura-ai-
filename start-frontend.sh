#!/bin/bash

echo "🎨 Starting CuraLink Frontend..."
echo ""

cd "$(dirname "$0")/curalink-frontend"

# Start frontend
echo "✅ Frontend starting on http://localhost:3000"
echo ""

npm run dev
