# ⚡ Quick Deployment Steps

## 🎯 Fast Track Deployment

### Backend (Render) - 5 minutes

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Deploy on Render**
   - Go to https://render.com
   - New → Web Service
   - Connect GitHub repo
   - Settings:
     - **Root Directory**: `backend`
     - **Build**: `pip install -r requirements.txt`
     - **Start**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Deploy!**

3. **Copy Backend URL**: `https://your-app.onrender.com`

---

### Frontend (Vercel) - 3 minutes

1. **Deploy on Vercel**
   - Go to https://vercel.com
   - Add New Project
   - Import GitHub repo
   - Settings:
     - **Root Directory**: `frontend`
     - **Framework**: Create React App
   - **Environment Variable**:
     - `REACT_APP_API_URL` = Your Render backend URL
   - **Deploy!**

2. **Copy Frontend URL**: `https://your-app.vercel.app`

---

### Update CORS (1 minute)

1. Go back to Render dashboard
2. Environment → Add `FRONTEND_URL` = Your Vercel URL
3. Save (auto-redeploys)

---

## ✅ Done!

**Frontend**: https://your-app.vercel.app  
**Backend**: https://your-app.onrender.com  
**API Docs**: https://your-app.onrender.com/docs

---

## 🎤 Presentation Script

1. "We've deployed our AES encryption app live!"
2. Open frontend URL
3. Show encryption flow
4. Show decryption
5. Mention both URLs in footer

**That's it! 🚀**

