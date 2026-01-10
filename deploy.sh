#!/bin/bash

# ================================
# DevQuery Deployment Script
# Vercel + Railway Deployment
# ================================

set -e

echo "🚀 DevQuery Deployment Script"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All requirements met${NC}"
    echo ""
}

# Test backend build
test_backend() {
    echo "🔧 Testing backend..."
    cd server
    
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing backend dependencies..."
        npm install
    fi
    
    echo "✅ Backend ready for deployment"
    cd ..
    echo ""
}

# Test frontend build
test_frontend() {
    echo "🎨 Testing frontend build..."
    cd stack
    
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    echo "🏗️  Building Next.js application..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend build successful${NC}"
    else
        echo -e "${RED}❌ Frontend build failed${NC}"
        exit 1
    fi
    
    cd ..
    echo ""
}

# Main deployment instructions
main() {
    check_requirements
    test_backend
    test_frontend
    
    echo "=============================="
    echo -e "${GREEN}✅ Pre-deployment checks passed!${NC}"
    echo "=============================="
    echo ""
    echo "📝 Next Steps:"
    echo ""
    echo "1️⃣  BACKEND DEPLOYMENT (Railway):"
    echo "   → Go to https://railway.app/"
    echo "   → Create new project from GitHub"
    echo "   → Select 'server' directory"
    echo "   → Add environment variables (see .env.production.template)"
    echo "   → Deploy and copy Railway URL"
    echo ""
    echo "2️⃣  FRONTEND DEPLOYMENT (Vercel):"
    echo "   → Go to https://vercel.com/"
    echo "   → Import GitHub repository"
    echo "   → Select 'stack' directory"
    echo "   → Add NEXT_PUBLIC_BACKEND_URL (Railway URL)"
    echo "   → Deploy and copy Vercel URL"
    echo ""
    echo "3️⃣  UPDATE BACKEND:"
    echo "   → Add FRONTEND_URL in Railway (Vercel URL)"
    echo "   → Redeploy backend"
    echo ""
    echo "📖 Full guide: See DEPLOYMENT.md"
    echo ""
}

main
