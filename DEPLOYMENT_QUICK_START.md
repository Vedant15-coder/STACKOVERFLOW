# 🚀 Quick Deployment Reference

## 📦 Files Created

### Configuration Files
- ✅ `vercel.json` - Vercel deployment config
- ✅ `stack/vercel.json` - Frontend-specific config
- ✅ `server/railway.json` - Railway deployment config
- ✅ `server/.railwayignore` - Files to exclude from Railway
- ✅ `docker-compose.yml` - Docker orchestration
- ✅ `server/Dockerfile` - Backend container
- ✅ `stack/Dockerfile` - Frontend container

### Environment Templates
- ✅ `server/.env.production.template` - Backend env vars
- ✅ `stack/env.production.example` - Frontend env vars
- ✅ `.env.docker.example` - Docker env vars

### Scripts
- ✅ `deploy.sh` - Linux/Mac deployment script
- ✅ `deploy.ps1` - Windows deployment script

### Documentation
- ✅ `DEPLOYMENT.md` - Complete deployment guide

---

## ⚡ Quick Start

### Option 1: Vercel + Railway (Recommended)

#### Step 1: Deploy Backend (Railway)
```bash
1. Go to https://railway.app/
2. New Project → Deploy from GitHub
3. Select your repo → Choose 'server' directory
4. Add environment variables from server/.env.production.template
5. Deploy → Copy Railway URL
```

#### Step 2: Deploy Frontend (Vercel)
```bash
1. Go to https://vercel.com/
2. New Project → Import from GitHub
3. Select your repo → Choose 'stack' directory
4. Add environment variables:
   - NEXT_PUBLIC_BACKEND_URL=<Railway URL>
   - NEXT_PUBLIC_APP_NAME=DevQuery
5. Deploy → Copy Vercel URL
```

#### Step 3: Update Backend
```bash
1. Go to Railway dashboard
2. Add FRONTEND_URL=<Vercel URL>
3. Redeploy
```

---

### Option 2: Docker Deployment

```bash
# 1. Copy environment file
cp .env.docker.example .env

# 2. Edit .env with your values
nano .env

# 3. Build and run
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. View logs
docker-compose logs -f
```

---

## 🔐 Required Environment Variables

### Backend (Railway)
```bash
PORT=5000
NODE_ENV=production
MONGODB_URL=<MongoDB Atlas URL>
JWT_SECRET=<64-char random string>
OTP_MODE=real
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email>
EMAIL_PASSWORD=<app-password>
EMAIL_FROM=DevQuery <noreply@devquery.com>
HF_API_KEY=<huggingface-key>
FRONTEND_URL=<Vercel URL>
```

### Frontend (Vercel)
```bash
NEXT_PUBLIC_BACKEND_URL=<Railway URL>
NEXT_PUBLIC_APP_NAME=DevQuery
```

---

## ✅ Verification Checklist

### After Backend Deployment
- [ ] Health check: `https://your-backend.railway.app/health`
- [ ] Returns: `{"status":"ok","message":"Server is running"}`
- [ ] No errors in Railway logs

### After Frontend Deployment
- [ ] Homepage loads: `https://your-app.vercel.app`
- [ ] No console errors
- [ ] Can see login/signup forms

### Full Feature Test
- [ ] User registration works
- [ ] Login with Chrome → Email OTP received
- [ ] Login with Edge → No OTP required
- [ ] Post a question
- [ ] Post an answer
- [ ] AI Assist responds
- [ ] Language switching works
- [ ] Public space posting works

---

## 🐛 Common Issues

### Backend: MongoDB Connection Failed
```bash
# Check:
1. MongoDB Atlas IP whitelist includes 0.0.0.0/0
2. Connection string password is correct
3. Database name is correct
```

### Frontend: API Calls Failing
```bash
# Check:
1. NEXT_PUBLIC_BACKEND_URL is correct (no trailing slash)
2. Backend is running (check Railway logs)
3. CORS is configured (FRONTEND_URL in Railway)
```

### OTP Not Sending
```bash
# Check:
1. OTP_MODE=real in Railway
2. EMAIL_PASSWORD is Gmail app password (not regular password)
3. Check Railway logs for email errors
```

---

## 📞 Support

- **Full Guide**: See `DEPLOYMENT.md`
- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

---

## 🎯 Next Steps After Deployment

1. **Test thoroughly** - All features should work
2. **Monitor logs** - Railway and Vercel dashboards
3. **Set up monitoring** - Consider Sentry for error tracking
4. **Configure backups** - MongoDB Atlas automated backups
5. **Custom domain** - Add in Vercel settings (optional)
6. **SSL/HTTPS** - Automatic with Vercel and Railway

---

**Ready to deploy?** Run `./deploy.ps1` (Windows) or `./deploy.sh` (Linux/Mac) to validate your setup!
