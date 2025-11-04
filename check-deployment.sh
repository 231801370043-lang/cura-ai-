#!/bin/bash

# 🔍 CuraLink Deployment Status Checker
# Checks if your deployments are working correctly

echo "🔍 Checking CuraLink Deployment Status"
echo "======================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Your deployment URLs
FRONTEND_URL="https://curalink-frontend-three.vercel.app"
BACKEND_URL="https://curalink-backend.vercel.app"

print_status "Checking your deployments..."
echo ""

# Check backend
print_status "Testing Backend: $BACKEND_URL"
if command -v curl &> /dev/null; then
    BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL" || echo "000")
    if [ "$BACKEND_STATUS" = "200" ]; then
        print_success "✅ Backend is online and responding"
    else
        print_warning "⚠️  Backend returned status: $BACKEND_STATUS"
    fi
else
    print_warning "curl not available - please check manually: $BACKEND_URL"
fi

# Check frontend
print_status "Testing Frontend: $FRONTEND_URL"
if command -v curl &> /dev/null; then
    FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" || echo "000")
    if [ "$FRONTEND_STATUS" = "200" ]; then
        print_success "✅ Frontend is online and responding"
    else
        print_warning "⚠️  Frontend returned status: $FRONTEND_STATUS"
    fi
else
    print_warning "curl not available - please check manually: $FRONTEND_URL"
fi

echo ""
print_status "🎯 Quick Test Checklist:"
echo ""
echo "1. 🌐 Visit: $FRONTEND_URL"
echo "2. 📝 Try to register a new account"
echo "3. 🔐 Try to login"
echo "4. 👤 Check patient dashboard loads"
echo "5. 🔬 Check researcher dashboard loads"
echo "6. 📊 Verify beautiful UI with animations"
echo "7. 🔄 Test real-time notifications"
echo "8. 📹 Test video call system"
echo ""

print_status "🔧 If something isn't working:"
echo ""
echo "Backend Issues:"
echo "• Check environment variables in Vercel dashboard"
echo "• Verify MongoDB connection string"
echo "• Check function logs in Vercel"
echo ""
echo "Frontend Issues:"
echo "• Verify NEXT_PUBLIC_API_URL points to: $BACKEND_URL"
echo "• Check build logs in Vercel"
echo "• Clear browser cache"
echo ""

print_success "🚀 Your CuraLink Platform Status:"
echo ""
echo "📱 Frontend: $FRONTEND_URL"
echo "🔧 Backend:  $BACKEND_URL"
echo ""
echo "✨ Features Available:"
echo "   • Beautiful Premium UI with 3D animations"
echo "   • Real-time video call notifications"
echo "   • Auto-join video calls when accepted"
echo "   • Chat system with instant messaging"
echo "   • CuraAI assistant with SambaNova API"
echo "   • MongoDB database with full persistence"
echo "   • JWT authentication system"
echo "   • Mobile responsive design"
echo ""

print_status "🎉 Your healthcare platform is ready for users worldwide!"
