#!/bin/bash

echo "🚀 Starting CuraLink Backend Setup..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q pymysql python-dotenv

# Create database
echo ""
echo "🗄️  Creating database..."
python3 create_database.py

if [ $? -eq 0 ]; then
    echo ""
    echo "📦 Installing all backend dependencies..."
    pip install -q -r requirements.txt
    
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "🚀 Starting FastAPI server..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    python main.py
else
    echo ""
    echo "❌ Database creation failed. Please check the error above."
    exit 1
fi
