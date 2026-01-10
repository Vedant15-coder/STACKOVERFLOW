# 🚀 DevQuery Production Deployment Guide

Complete guide for deploying DevQuery to production using Vercel (frontend) and Railway (backend).

---

## 📋 Pre-Deployment Checklist

### Required Accounts
- ✅ [Vercel Account](https://vercel.com/signup) (free tier available)
- ✅ [Railway Account](https://railway.app/) (free tier: $5 credit/month)
- ✅ [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (production cluster)
- ✅ [Hugging Face](https://huggingface.co/) (API key for AI Assist)
- ✅ Email service (Gmail with app password recommended)
- ✅ SMS provider (Twilio recommended, or use mock mode)

### Required Credentials
- MongoDB Atlas connection string (production cluster)
- JWT secret (strong random string)
- Email SMTP credentials
- Hugging Face API key
- SMS provider credentials (optional - can use mock mode)

---

## 🗄️ Step 1: MongoDB Atlas Setup

### 1.1 Create Production Cluster
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (M0 free tier available)
3. Name it: `devquery-production`
4. Choose your preferred region

### 1.2 Create Database User
1. Go to **Database Access**
2. Click **Add New Database User**
3. Create username and strong password
4. Grant **Read and Write** to any database

### 1.3 Whitelist IP Addresses
1. Go to **Network Access**
2. Click **Add IP Address**
3. Add `0.0.0.0/0` (allow from anywhere) - Railway uses dynamic IPs
4. Or add specific Railway IP ranges if available

### 1.4 Get Connection String
1. Click **Connect** on your cluster
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `myFirstDatabase` with `devquery-prod`

Example:
```
mongodb+srv://devquery-user:YOUR_PASSWORD@devquery-production.xxxxx.mongodb.net/devquery-prod?retryWrites=true&w=majority
```

---

## 🔧 Step 2: Backend Deployment (Railway)

### 2.1 Create Railway Project
1. Go to [Railway](https://railway.app/)
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Connect your GitHub account
5. Select your repository
6. Choose the `server` directory as root

### 2.2 Configure Environment Variables

In Railway dashboard, go to **Variables** and add:

```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Atlas
MONGODB_URL=mongodb+srv://devquery-user:YOUR_PASSWORD@devquery-production.xxxxx.mongodb.net/devquery-prod?retryWrites=true&w=majority

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your_generated_64_character_random_hex_string_here

# OTP Mode - CRITICAL: Set to 'real' for production
OTP_MODE=real

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=DevQuery <noreply@devquery.com>

# SMS Configuration (Twilio example - or use mock)
SMS_PROVIDER=twilio
SMS_ACCOUNT_SID=your_twilio_account_sid
SMS_AUTH_TOKEN=your_twilio_auth_token
SMS_API_KEY=your_twilio_api_key
SMS_SENDER_ID=+1234567890

# Hugging Face AI
HF_API_KEY=hf_your_huggingface_api_key

# Google Gemini AI (backup)
GEMINI_API_KEY=your_gemini_api_key

# Frontend URL (add after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app

# Razorpay (mock for now)
RAZORPAY_KEY_ID=mock_key_id
RAZORPAY_KEY_SECRET=mock_key_secret
```

### 2.3 Deploy Backend
1. Railway will automatically deploy after adding variables
2. Wait for deployment to complete
3. Copy your Railway URL: `https://your-backend.railway.app`
4. Test health endpoint: `https://your-backend.railway.app/health`

---

## 🎨 Step 3: Frontend Deployment (Vercel)

### 3.1 Create Vercel Project
1. Go to [Vercel](https://vercel.com/)
2. Click **Add New Project**
3. Import your GitHub repository
4. Select the `stack` directory as root
5. Framework Preset: **Next.js** (auto-detected)

### 3.2 Configure Environment Variables

In Vercel dashboard, go to **Settings > Environment Variables** and add:

```bash
# Backend API URL (from Railway)
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app

# App Name
NEXT_PUBLIC_APP_NAME=DevQuery
```

### 3.3 Deploy Frontend
1. Click **Deploy**
2. Wait for build to complete
3. Copy your Vercel URL: `https://your-app.vercel.app`

### 3.4 Update Backend FRONTEND_URL
1. Go back to Railway dashboard
2. Update `FRONTEND_URL` variable with your Vercel URL
3. Redeploy backend (Railway will auto-redeploy)

---

## 🔐 Step 4: Security Configuration

### 4.1 Generate Strong JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4.2 Gmail App Password Setup
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to **App Passwords**
4. Generate password for "Mail"
5. Use this password in `EMAIL_PASSWORD`

### 4.3 Hugging Face API Key
1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create new token with **Read** access
3. Copy token to `HF_API_KEY`

### 4.4 Twilio Setup (Optional - for real SMS)
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get Account SID and Auth Token
3. Get a phone number
4. Add credentials to Railway

**Alternative**: Keep `OTP_MODE=mock` and SMS will log to console

---

## ✅ Step 5: Post-Deployment Verification

### 5.1 Backend Health Check
```bash
curl https://your-backend.railway.app/health
# Expected: {"status":"ok","message":"Server is running"}
```

### 5.2 Frontend Access
Visit: `https://your-app.vercel.app`
- Should load DevQuery homepage
- No console errors

### 5.3 Test Authentication Flow

#### Test Signup
1. Register new user
2. Verify account created in MongoDB Atlas

#### Test Login (Chrome Desktop)
1. Login with Chrome on desktop
2. Should receive email OTP (if `OTP_MODE=real`)
3. Check Railway logs for OTP if `OTP_MODE=mock`
4. Verify OTP and complete login

#### Test Login (Edge Browser)
1. Login with Edge
2. Should NOT require OTP
3. Login should complete immediately

### 5.4 Test Core Features
- ✅ Ask a question
- ✅ Post an answer
- ✅ Vote on question/answer
- ✅ AI Assist (Hugging Face)
- ✅ Public Space posting
- ✅ Friend requests
- ✅ Language switching (with OTP)
- ✅ Subscription flow

### 5.5 Test OTP Delivery

#### Email OTP (Chrome Login)
1. Login from Chrome
2. Check email for OTP
3. Verify OTP works

#### Language Change OTP
1. Switch to French → Email OTP
2. Switch to Hindi → SMS OTP (or console if mock)

---

## 🐛 Troubleshooting

### Backend Issues

#### MongoDB Connection Failed
```
Error: MongoServerError: bad auth
```
**Solution:**
- Verify MongoDB connection string
- Check username/password
- Ensure IP whitelist includes `0.0.0.0/0`

#### CORS Error
```
Access to fetch blocked by CORS policy
```
**Solution:**
- Verify `FRONTEND_URL` in Railway matches Vercel URL
- Ensure no trailing slash in URLs
- Redeploy backend after changing `FRONTEND_URL`

#### OTP Not Sending
```
Failed to send OTP email
```
**Solution:**
- Verify `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`
- Check Gmail app password is correct
- Verify `OTP_MODE=real` in production
- Check Railway logs for detailed error

### Frontend Issues

#### API Calls Failing
```
Network Error / 404
```
**Solution:**
- Verify `NEXT_PUBLIC_BACKEND_URL` in Vercel
- Ensure Railway backend is running
- Check Railway logs for errors

#### Build Failed
```
Build error in Next.js
```
**Solution:**
- Check Vercel build logs
- Ensure all dependencies in `package.json`
- Verify TypeScript errors locally first

---

## 📊 Monitoring

### Railway Logs
```bash
# View in Railway dashboard
Project > Deployments > View Logs
```

### Vercel Logs
```bash
# View in Vercel dashboard
Project > Deployments > Function Logs
```

### MongoDB Atlas Monitoring
```bash
# View in Atlas dashboard
Cluster > Metrics
```

---

## 🔄 Continuous Deployment

### Automatic Deployments
Both Vercel and Railway support automatic deployments:

1. **Push to GitHub** → Automatic deployment
2. **Pull Request** → Preview deployment (Vercel)
3. **Merge to main** → Production deployment

### Manual Deployment
- **Railway**: Click **Deploy** in dashboard
- **Vercel**: Click **Redeploy** in deployments

---

## 💰 Cost Estimation

### Free Tier Limits
- **Vercel**: Unlimited personal projects, 100GB bandwidth/month
- **Railway**: $5 credit/month (~500 hours)
- **MongoDB Atlas**: M0 cluster (512MB storage, shared RAM)
- **Hugging Face**: Rate-limited free tier

### Recommended Paid Plans (if needed)
- **Railway Pro**: $20/month (more resources)
- **MongoDB Atlas M10**: $57/month (dedicated cluster)
- **Vercel Pro**: $20/month (team features)

---

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use strong JWT secrets (64+ characters)
- ✅ Rotate secrets regularly
- ✅ Use different credentials for dev/prod

### Database
- ✅ Use strong database passwords
- ✅ Limit IP whitelist when possible
- ✅ Enable MongoDB Atlas encryption
- ✅ Regular backups

### OTP Security
- ✅ `OTP_MODE=real` in production
- ✅ OTPs expire in 5 minutes
- ✅ Single-use OTPs
- ✅ Hashed in database

---

## 📞 Support Resources

- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

---

## 🎉 Deployment Complete!

Your DevQuery application is now live in production! 🚀

**Frontend**: https://your-app.vercel.app  
**Backend**: https://your-backend.railway.app  
**Database**: MongoDB Atlas Production Cluster

Remember to:
- Monitor logs regularly
- Set up error tracking (Sentry recommended)
- Configure backups
- Test all features thoroughly
- Update documentation as needed

---

**Need help?** Check the troubleshooting section or review Railway/Vercel logs for detailed error messages.
