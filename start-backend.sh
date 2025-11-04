#!/bin/bash

echo "🚀 Starting CuraLink Backend..."
echo ""

cd "$(dirname "$0")/curalink-backend"

# Activate virtual environment
source venv/bin/activate

# Start backend
echo "✅ Backend starting on http://localhost:8000"
echo "📚 API Docs available at http://localhost:8000/docs"
echo ""

python main.py
