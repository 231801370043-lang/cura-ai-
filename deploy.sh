#!/bin/bash

# 🚀 CuraLink Vercel Deployment Script
# This script helps deploy both frontend and backend to Vercel

echo "🚀 CuraLink Vercel Deployment Script"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_warning "You are not logged in to Vercel. Please login first:"
    vercel login
fi

print_status "Starting CuraLink deployment process..."

# Deploy Backend
print_status "Deploying Backend to Vercel..."
cd "curalink-backend"

if [ ! -f "vercel.json" ]; then
    print_error "vercel.json not found in backend directory"
    exit 1
fi

print_status "Deploying backend..."
vercel --prod

if [ $? -eq 0 ]; then
    print_success "Backend deployed successfully!"
    BACKEND_URL=$(vercel ls | grep curalink-backend | awk '{print $2}' | head -1)
    print_success "Backend URL: https://$BACKEND_URL"
else
    print_error "Backend deployment failed!"
    exit 1
fi

cd ..

# Deploy Frontend
print_status "Deploying Frontend to Vercel..."
cd "curalink-frontend"

if [ ! -f "vercel.json" ]; then
    print_error "vercel.json not found in frontend directory"
    exit 1
fi

# Set environment variable for frontend
print_status "Setting environment variables..."
vercel env add NEXT_PUBLIC_API_URL production

print_status "Deploying frontend..."
vercel --prod

if [ $? -eq 0 ]; then
    print_success "Frontend deployed successfully!"
    FRONTEND_URL=$(vercel ls | grep curalink-frontend | awk '{print $2}' | head -1)
    print_success "Frontend URL: https://$FRONTEND_URL"
else
    print_error "Frontend deployment failed!"
    exit 1
fi

cd ..

# Final success message
echo ""
print_success "🎉 CuraLink deployment completed successfully!"
echo ""
echo "📱 Frontend: https://$FRONTEND_URL"
echo "🔧 Backend:  https://$BACKEND_URL"
echo ""
print_status "Your CuraLink application is now live and ready to use!"
print_status "All real-time features are working in production."
echo ""
print_warning "Don't forget to:"
echo "1. Set up MongoDB Atlas database"
echo "2. Configure environment variables in Vercel dashboard"
echo "3. Test all features after deployment"
echo ""
print_success "Happy coding! 🚀"
