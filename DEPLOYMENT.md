# 🚀 Deployment Guide - AES Encryption & Decryption Web App

## Overview
This guide will help you deploy the AES Encryption & Decryption app to production.

**Stack:**
- **Backend**: FastAPI (Python) → Render/Railway
- **Frontend**: React → Vercel/Netlify

---

## 📋 Prerequisites

1. **GitHub Account**: Push your code to GitHub
2. **Render Account**: https://render.com (for backend)
3. **Vercel Account**: https://vercel.com (for frontend) OR
4. **Netlify Account**: https://netlify.com (alternative for frontend)

---

## 🔧 Backend Deployment (Render)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - AES Encryption App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aes-encryption-app.git
git push -u origin main
```

### Step 2: Deploy on Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `aes-encryption-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`

5. **Add Environment Variables:**
   - `FRONTEND_URL`: `https://your-frontend-url.vercel.app` (add after frontend is deployed)
   - `PORT`: (auto-set by Render)

6. **Click "Create Web Service"**

7. **Wait for deployment** (5-10 minutes)

8. **Your backend URL will be**: `https://aes-encryption-backend.onrender.com`

### Step 3: Update CORS (After Frontend is Deployed)

Once your frontend is deployed, update the `FRONTEND_URL` environment variable in Render with your actual frontend URL.

---

## 🎨 Frontend Deployment (Vercel)

### Option A: Vercel (Recommended)

#### Step 1: Prepare Frontend

1. **Update API URL** (if needed):
   - The app uses `process.env.REACT_APP_API_URL` by default
   - Vercel will handle this via environment variables

#### Step 2: Deploy on Vercel

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Click "Add New Project"**
3. **Import your GitHub repository**
4. **Configure Project:**
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. **Add Environment Variable:**
   - **Name**: `REACT_APP_API_URL`
   - **Value**: `https://your-backend-url.onrender.com` (your Render backend URL)

6. **Click "Deploy"**

7. **Your frontend URL will be**: `https://aes-encryption-group2.vercel.app` (or similar)

### Option B: Netlify (Alternative)

#### Step 1: Deploy on Netlify

1. **Go to Netlify Dashboard**: https://app.netlify.com
2. **Click "Add new site" → "Import an existing project"**
3. **Connect GitHub repository**
4. **Configure Build Settings:**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`

5. **Add Environment Variable:**
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://your-backend-url.onrender.com`

6. **Click "Deploy site"**

---

## 🔄 Post-Deployment Steps

### 1. Update Backend CORS

After frontend is deployed, update the backend environment variable:

1. **Go to Render Dashboard** → Your Backend Service
2. **Environment** → Edit `FRONTEND_URL`
3. **Set to**: `https://your-frontend-url.vercel.app`
4. **Save** (auto-redeploys)

### 2. Test the Deployment

1. **Visit your frontend URL**
2. **Try encrypting some text**
3. **Verify it works end-to-end**

### 3. Update Frontend Footer (Optional)

If you want to display the actual URLs, you can update the footer in `frontend/src/App.js`:

```javascript
const FRONTEND_URL = "https://aes-encryption-group2.vercel.app";
const BACKEND_URL = "https://aes-encryption-backend.onrender.com";
```

---

## 📝 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Backend URL obtained
- [ ] Frontend deployed on Vercel/Netlify
- [ ] Frontend URL obtained
- [ ] Environment variables configured
- [ ] CORS updated in backend
- [ ] End-to-end encryption/decryption tested
- [ ] Both URLs working correctly

---

## 🌐 Live URLs (Update After Deployment)

**Frontend**: `https://aes-encryption-group2.vercel.app`  
**Backend API**: `https://aes-encryption-backend.onrender.com`  
**API Docs**: `https://aes-encryption-backend.onrender.com/docs`

---

## 🎓 Presentation Demo Flow

1. **Open Frontend URL**: Show the beautiful UI
2. **Enter Plaintext**: "Hello, Group 2!"
3. **Generate Key**: Click "Generate"
4. **Select Settings**: 256-bit, CBC mode
5. **Encrypt**: Click "🔒 Encrypt"
6. **Show Ciphertext**: Display encrypted result
7. **Decrypt**: Click "🔓 Decrypt"
8. **Verify**: Show original text recovered
9. **Show Performance**: Execution time metrics
10. **Demo Features**: Dark mode, copy buttons, download JSON

---

## 🔧 Maintenance

### Updating Backend

1. Make changes to `backend/main.py`
2. Push to GitHub
3. Render auto-deploys (or manually redeploy)

### Updating Frontend

1. Make changes to `frontend/src/`
2. Push to GitHub
3. Vercel/Netlify auto-deploys

### Environment Variables

**Backend (Render):**
- `FRONTEND_URL`: Your frontend URL
- `PORT`: Auto-set by Render

**Frontend (Vercel/Netlify):**
- `REACT_APP_API_URL`: Your backend API URL

---

## 🐛 Troubleshooting

### Backend Issues

- **CORS Errors**: Make sure `FRONTEND_URL` is set correctly
- **Port Issues**: Render handles PORT automatically
- **Dependencies**: Check `requirements.txt` is complete

### Frontend Issues

- **API Connection Failed**: Check `REACT_APP_API_URL` environment variable
- **Build Fails**: Check Node.js version compatibility
- **Blank Page**: Check browser console for errors

---

## 📚 Additional Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Docs**: https://react.dev

---

## ✅ Success!

Once deployed, you'll have:
- ✅ Production-ready AES encryption app
- ✅ HTTPS endpoints
- ✅ Automatic deployments on git push
- ✅ Scalable infrastructure
- ✅ Ready for class presentation!

**Good luck with your presentation! 🎉**

