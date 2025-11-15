# 🚀 KMRL Quick Start - Deployment in 3 Steps

## Step 1: Get Gemini API Key (2 minutes)

1. Go to: **https://ai.google.dev/**
2. Click "Get API Key"
3. Sign in with Google
4. Create a new API key
5. Copy it (starts with `AIza...`)

## Step 2: Create `.env` File (1 minute)

```bash
cd /home/premsaik/Desktop/Projects/kmrl
cp .env.example .env
nano .env  # or use any text editor
```

Add your API key:
```env
GEMINI_API_KEY=AIza_your_actual_key_here
NODE_ENV=production
```

## Step 3: Deploy to Render.com (10 minutes)

### 3.1: Push to GitHub
```bash
# If not already done
git init
git add .
git commit -m "Ready for deployment"

# Create repo at github.com/new
git remote add origin https://github.com/YOUR_USERNAME/kmrl.git
git push -u origin main
```

### 3.2: Deploy on Render
1. Go to **https://render.com**
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your `kmrl` repository
5. Configure:
   - **Build Command:** `npm run install-all`
   - **Start Command:** `npm start`
6. Add environment variable:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** Your API key from Step 1
7. Click "Create Web Service"
8. Wait 5-10 minutes for build
9. Visit your app at `https://your-app.onrender.com`

## ✅ Done!

Your app is now live and accessible worldwide!

## 📚 Need More Help?

- **Full deployment guide:** See `DEPLOYMENT_GUIDE.md`
- **Errors fixed:** See `ERRORS_FIXED.md`
- **Check setup:** Run `./check-setup.sh`

## 🎯 Deployment Options Comparison

| Platform | Cost | Setup Time | Best For |
|----------|------|------------|----------|
| **Render.com** | FREE | 10 min | ⭐ Recommended - Easy all-in-one |
| **Railway.app** | FREE | 8 min | Better performance |
| **Vercel** | FREE | 15 min | Frontend only (need separate backend) |

**Choose Render for easiest deployment!**
