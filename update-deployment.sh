#!/bin/bash

# 🔄 CuraLink Deployment Update Script
# Updates your existing Vercel deployments with latest code

echo "🔄 Updating CuraLink Deployments"
echo "================================"

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

print_status "Your current deployments:"
echo "  Frontend: $FRONTEND_URL"
echo "  Backend:  $BACKEND_URL"
echo ""

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

print_status "Preparing code for deployment..."

# Initialize git repositories if not already done
if [ ! -d "curalink-backend/.git" ]; then
    print_status "Initializing backend git repository..."
    cd curalink-backend
    git init
    git add .
    git commit -m "Initial commit with MongoDB and video call features"
    cd ..
fi

if [ ! -d "curalink-frontend/.git" ]; then
    print_status "Initializing frontend git repository..."
    cd curalink-frontend
    git init
    git add .
    git commit -m "Initial commit with beautiful UI and video call features"
    cd ..
fi

print_success "Code prepared for deployment!"
echo ""

print_warning "MANUAL DEPLOYMENT STEPS:"
echo ""
echo "🔧 BACKEND UPDATE:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Find your 'curalink-backend' project"
echo "3. Go to Settings → Git"
echo "4. Connect to a GitHub repository (create one if needed)"
echo "5. Push your backend code to that repository"
echo "6. Vercel will auto-deploy the updates"
echo ""

echo "🎨 FRONTEND UPDATE:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Find your 'curalink-frontend' project"
echo "3. Go to Settings → Git"
echo "4. Connect to a GitHub repository (create one if needed)"
echo "5. Push your frontend code to that repository"
echo "6. Vercel will auto-deploy the updates"
echo ""

print_warning "ENVIRONMENT VARIABLES CHECK:"
echo ""
echo "🔑 Backend Environment Variables (in Vercel dashboard):"
echo "   MONGODB_URL = your-mongodb-connection-string"
echo "   JWT_SECRET = your-secure-jwt-secret"
echo "   SAMBANOVA_API_KEY = bf368194-8726-452b-a7ca-6eb8c4aaeb21"
echo ""
echo "🔑 Frontend Environment Variables (in Vercel dashboard):"
echo "   NEXT_PUBLIC_API_URL = https://curalink-backend.vercel.app"
echo ""

print_success "🎉 WHAT'S NEW IN YOUR UPDATED DEPLOYMENT:"
echo ""
echo "✨ Beautiful Premium UI:"
echo "   • Stunning gradient backgrounds with floating orbs"
echo "   • 3D animations and hover effects"
echo "   • Glass morphism cards with backdrop blur"
echo "   • Floating particle effects"
echo "   • Perfect color schemes for both themes"
echo ""
echo "🔄 Real-Time Video Call System:"
echo "   • Video call notifications with Accept/Decline buttons"
echo "   • Auto-join video calls when accepted"
echo "   • Real-time notifications (5-second polling)"
echo "   • Chat system with instant messages"
echo "   • CuraAI assistant integration"
echo ""
echo "🗄️ MongoDB Database:"
echo "   • Full data persistence"
echo "   • User authentication with JWT"
echo "   • Meeting management system"
echo "   • Notification system"
echo ""

print_status "🚀 After updating your deployments:"
echo "1. Test at: $FRONTEND_URL"
echo "2. Create test accounts (patient & researcher)"
echo "3. Test video call notifications"
echo "4. Test real-time chat"
echo "5. Verify beautiful UI animations"
echo ""

print_success "Your CuraLink platform will be updated with all the latest features!"
