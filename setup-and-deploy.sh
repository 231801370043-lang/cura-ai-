#!/bin/bash

# 🚀 CuraLink Complete Setup and Deployment Script
# This script will install dependencies and deploy to Vercel

echo "🚀 CuraLink Complete Setup and Deployment"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${PURPLE}$1${NC}"
    echo "----------------------------------------"
}

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_header "🔧 STEP 1: Installing Required Dependencies"

# Check and install Node.js
if ! command_exists node; then
    print_warning "Node.js not found. Installing Node.js..."
    
    # Try different installation methods
    if command_exists curl; then
        print_status "Installing Node.js using NodeSource installer..."
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_status "macOS detected. Please install Node.js manually:"
        echo "1. Go to https://nodejs.org/"
        echo "2. Download and install the LTS version"
        echo "3. Restart your terminal"
        echo "4. Run this script again"
        exit 1
    else
        print_error "Please install Node.js manually from https://nodejs.org/"
        exit 1
    fi
else
    print_success "Node.js is already installed: $(node --version)"
fi

# Check and install npm
if ! command_exists npm; then
    print_error "npm not found. Please install Node.js which includes npm."
    exit 1
else
    print_success "npm is available: $(npm --version)"
fi

# Install Vercel CLI
if ! command_exists vercel; then
    print_status "Installing Vercel CLI..."
    npm install -g vercel
    if [ $? -eq 0 ]; then
        print_success "Vercel CLI installed successfully!"
    else
        print_error "Failed to install Vercel CLI. Please run: npm install -g vercel"
        exit 1
    fi
else
    print_success "Vercel CLI is already installed: $(vercel --version)"
fi

print_header "🔑 STEP 2: Vercel Authentication"

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_warning "You need to login to Vercel first."
    print_status "Opening Vercel login..."
    vercel login
    
    if ! vercel whoami &> /dev/null; then
        print_error "Vercel login failed. Please try again."
        exit 1
    fi
fi

VERCEL_USER=$(vercel whoami)
print_success "Logged in to Vercel as: $VERCEL_USER"

print_header "🗄️ STEP 3: Database Setup Instructions"

print_warning "IMPORTANT: You need to set up MongoDB Atlas first!"
echo ""
echo "📋 MongoDB Atlas Setup Steps:"
echo "1. Go to https://mongodb.com/atlas"
echo "2. Create a free account"
echo "3. Create a new cluster"
echo "4. Create a database user"
echo "5. Set network access to 0.0.0.0/0 (allow all)"
echo "6. Get your connection string"
echo ""
read -p "Have you completed MongoDB Atlas setup? (y/n): " mongodb_ready

if [[ $mongodb_ready != "y" && $mongodb_ready != "Y" ]]; then
    print_warning "Please complete MongoDB Atlas setup first, then run this script again."
    echo ""
    echo "Quick setup guide:"
    echo "1. Visit: https://mongodb.com/atlas"
    echo "2. Create cluster → Create database user → Set network access"
    echo "3. Get connection string (replace <password> and <dbname>)"
    echo "4. Come back and run: ./setup-and-deploy.sh"
    exit 0
fi

print_header "🔧 STEP 4: Deploying Backend"

cd curalink-backend

print_status "Deploying backend to Vercel..."
vercel --prod --yes

if [ $? -eq 0 ]; then
    print_success "Backend deployed successfully!"
    
    # Get the backend URL
    BACKEND_URL=$(vercel ls 2>/dev/null | grep "curalink-backend" | head -1 | awk '{print "https://" $2}')
    if [ -z "$BACKEND_URL" ]; then
        BACKEND_URL="https://curalink-backend.vercel.app"
    fi
    
    print_success "Backend URL: $BACKEND_URL"
    
    # Set environment variables
    print_status "Setting up environment variables..."
    echo ""
    echo "🔑 Please set these environment variables in Vercel dashboard:"
    echo "   Go to: https://vercel.com/dashboard → Your backend project → Settings → Environment Variables"
    echo ""
    echo "   MONGODB_URL = your-mongodb-connection-string"
    echo "   JWT_SECRET = your-super-long-secure-jwt-secret-key"
    echo "   SAMBANOVA_API_KEY = bf368194-8726-452b-a7ca-6eb8c4aaeb21"
    echo ""
    read -p "Have you set the environment variables? (y/n): " env_set
    
    if [[ $env_set == "y" || $env_set == "Y" ]]; then
        print_status "Redeploying backend with environment variables..."
        vercel --prod --yes
    fi
    
else
    print_error "Backend deployment failed!"
    exit 1
fi

cd ..

print_header "🎨 STEP 5: Deploying Frontend"

cd curalink-frontend

# Update the environment variable
echo "NEXT_PUBLIC_API_URL=$BACKEND_URL" > .env.production

print_status "Deploying frontend to Vercel..."
vercel --prod --yes

if [ $? -eq 0 ]; then
    print_success "Frontend deployed successfully!"
    
    # Get the frontend URL
    FRONTEND_URL=$(vercel ls 2>/dev/null | grep "curalink-frontend" | head -1 | awk '{print "https://" $2}')
    if [ -z "$FRONTEND_URL" ]; then
        FRONTEND_URL="https://curalink-frontend.vercel.app"
    fi
    
    print_success "Frontend URL: $FRONTEND_URL"
else
    print_error "Frontend deployment failed!"
    exit 1
fi

cd ..

print_header "🎉 DEPLOYMENT COMPLETE!"

echo ""
print_success "🌟 CuraLink is now live in production!"
echo ""
echo "📱 Frontend: $FRONTEND_URL"
echo "🔧 Backend:  $BACKEND_URL"
echo ""
print_status "✅ Features Available:"
echo "   • Beautiful Premium UI with animations"
echo "   • Real-time notifications (5-second polling)"
echo "   • Video call system with accept/decline"
echo "   • Auto-join video calls when accepted"
echo "   • Chat system with real-time messages"
echo "   • CuraAI assistant with SambaNova API"
echo "   • Meeting management system"
echo "   • User authentication with JWT"
echo "   • MongoDB database persistence"
echo ""
print_warning "🔧 Next Steps:"
echo "1. Test your application at: $FRONTEND_URL"
echo "2. Create test accounts (patient and researcher)"
echo "3. Test all real-time features"
echo "4. Verify database operations"
echo ""
print_success "🚀 Your healthcare platform is ready for users worldwide!"
echo ""
print_status "Need help? Check the DEPLOYMENT_GUIDE.md for detailed instructions."
