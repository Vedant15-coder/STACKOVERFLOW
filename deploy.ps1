# ================================
# DevQuery Deployment Script (Windows)
# Vercel + Railway Deployment
# ================================

Write-Host "🚀 DevQuery Deployment Script" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if required tools are installed
function Check-Requirements {
    Write-Host "📋 Checking requirements..." -ForegroundColor Yellow
    
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Node.js is not installed" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Host "❌ npm is not installed" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Git is not installed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ All requirements met" -ForegroundColor Green
    Write-Host ""
}

# Test backend build
function Test-Backend {
    Write-Host "🔧 Testing backend..." -ForegroundColor Yellow
    Set-Location server
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    Write-Host "✅ Backend ready for deployment" -ForegroundColor Green
    Set-Location ..
    Write-Host ""
}

# Test frontend build
function Test-Frontend {
    Write-Host "🎨 Testing frontend build..." -ForegroundColor Yellow
    Set-Location stack
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    Write-Host "🏗️  Building Next.js application..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend build failed" -ForegroundColor Red
        exit 1
    }
    
    Set-Location ..
    Write-Host ""
}

# Main deployment instructions
function Main {
    Check-Requirements
    Test-Backend
    Test-Frontend
    
    Write-Host "==============================" -ForegroundColor Cyan
    Write-Host "✅ Pre-deployment checks passed!" -ForegroundColor Green
    Write-Host "==============================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1️⃣  BACKEND DEPLOYMENT (Railway):" -ForegroundColor Cyan
    Write-Host "   → Go to https://railway.app/"
    Write-Host "   → Create new project from GitHub"
    Write-Host "   → Select 'server' directory"
    Write-Host "   → Add environment variables (see .env.production.template)"
    Write-Host "   → Deploy and copy Railway URL"
    Write-Host ""
    Write-Host "2️⃣  FRONTEND DEPLOYMENT (Vercel):" -ForegroundColor Cyan
    Write-Host "   → Go to https://vercel.com/"
    Write-Host "   → Import GitHub repository"
    Write-Host "   → Select 'stack' directory"
    Write-Host "   → Add NEXT_PUBLIC_BACKEND_URL (Railway URL)"
    Write-Host "   → Deploy and copy Vercel URL"
    Write-Host ""
    Write-Host "3️⃣  UPDATE BACKEND:" -ForegroundColor Cyan
    Write-Host "   → Add FRONTEND_URL in Railway (Vercel URL)"
    Write-Host "   → Redeploy backend"
    Write-Host ""
    Write-Host "📖 Full guide: See DEPLOYMENT.md" -ForegroundColor Yellow
    Write-Host ""
}

Main
