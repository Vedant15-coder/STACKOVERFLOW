# 🔧 Railway Deployment Troubleshooting Guide

## 🔴 Current Issue: Deployment Crashed

Based on your Railway logs, the deployment is crashing with module resolution errors related to `path-to-regexp`.

---

## ✅ Quick Fixes (Try in Order)

### Fix 1: Add Engine Specification to package.json

Railway needs to know which Node.js version to use.

**Add this to `server/package.json`:**

```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "type": "module",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "nodemon index.js",
    "start": "node index.js"
  },
  ...
}
```

---

### Fix 2: Verify Environment Variables in Railway

Make sure these are set in Railway dashboard:

```bash
PORT=5000
NODE_ENV=production
MONGODB_URL=<your-mongodb-atlas-url>
JWT_SECRET=<your-jwt-secret>
OTP_MODE=real
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email>
EMAIL_PASSWORD=<your-app-password>
EMAIL_FROM=DevQuery <noreply@devquery.com>
HF_API_KEY=<your-huggingface-key>
GEMINI_API_KEY=<your-gemini-key>
```

**CRITICAL**: Make sure `MONGODB_URL` is correct and MongoDB Atlas IP whitelist includes `0.0.0.0/0`

---

### Fix 3: Check Railway Build Command

In Railway dashboard:
1. Go to **Settings** → **Deploy**
2. Verify **Build Command**: `npm install`
3. Verify **Start Command**: `npm start`
4. Root Directory: `server`

---

### Fix 4: Add .npmrc File (Express 5 Fix)

Create `server/.npmrc`:

```
legacy-peer-deps=true
```

This helps with Express 5.x dependency resolution.

---

### Fix 5: Downgrade Express (If Issue Persists)

Express 5.1.0 is very new and might have compatibility issues.

**Option A: Try Express 4.x (Stable)**

```bash
cd server
npm install express@4.21.2
git add package.json package-lock.json
git commit -m "fix: downgrade to Express 4.x for Railway compatibility"
git push
```

---

## 🔍 Debugging Steps

### Step 1: Check Railway Logs

In Railway dashboard:
1. Click on your deployment
2. Go to **Deploy Logs** tab
3. Look for the specific error message
4. Share the full error if needed

### Step 2: Test Locally

```bash
cd server
npm install
npm start
```

If it works locally but fails on Railway, it's an environment issue.

### Step 3: Check MongoDB Connection

The most common Railway deployment failure is MongoDB connection:

**Verify:**
- ✅ MongoDB Atlas cluster is running
- ✅ IP whitelist includes `0.0.0.0/0`
- ✅ Database user credentials are correct
- ✅ `MONGODB_URL` in Railway matches your connection string

---

## 🚀 Recommended Solution

Based on the logs showing `path-to-regexp` errors with Express 5.1.0, I recommend:

### **Solution: Add engines to package.json**

1. **Update `server/package.json`** to specify Node version
2. **Commit and push**
3. **Railway will auto-redeploy**

This is the safest fix that doesn't require changing dependencies.

---

## 📝 After Applying Fix

1. **Commit changes**:
   ```bash
   git add .
   git commit -m "fix: add Node.js engine specification for Railway"
   git push
   ```

2. **Railway will auto-redeploy**

3. **Check deployment status** in Railway dashboard

4. **Test health endpoint**: `https://your-app.railway.app/health`

---

## ❓ Still Having Issues?

If the deployment still fails:

1. **Share the full error** from Railway Deploy Logs
2. **Check if MongoDB is accessible** from Railway
3. **Verify all environment variables** are set correctly
4. **Try the Express downgrade** as a last resort

---

## 📞 Common Railway Errors

### Error: "Cannot find module"
- **Fix**: Ensure `package-lock.json` is committed
- **Fix**: Run `npm install` locally and commit changes

### Error: "Port already in use"
- **Fix**: Already handled - using `process.env.PORT || 5000`

### Error: "MongoDB connection failed"
- **Fix**: Whitelist `0.0.0.0/0` in MongoDB Atlas
- **Fix**: Verify `MONGODB_URL` environment variable

### Error: "Module not found: path-to-regexp"
- **Fix**: Add `.npmrc` with `legacy-peer-deps=true`
- **Fix**: Add engines specification to `package.json`

---

**Next Step**: Add the engines specification to `package.json` and push to GitHub. Railway will auto-redeploy.
