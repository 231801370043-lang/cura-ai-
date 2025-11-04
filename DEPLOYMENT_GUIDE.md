# 🚀 CuraLink Vercel Deployment Guide

## Complete Real-Time Healthcare Platform Deployment

This guide will help you deploy the entire CuraLink application to Vercel with full real-time functionality.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas Account**: Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)
3. **GitHub Account**: For code repository
4. **SambaNova API Key**: Current key included in config

## 🗄️ Step 1: Set Up MongoDB Atlas Database

### Create MongoDB Cluster
1. Go to [MongoDB Atlas](https://mongodb.com/atlas)
2. Create a new project called "CuraLink"
3. Create a new cluster (free tier is sufficient)
4. Choose your preferred cloud provider and region
5. Wait for cluster creation (2-3 minutes)

### Configure Database Access
1. **Database Access**:
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `curalink_user`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

2. **Network Access**:
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

3. **Get Connection String**:
   - Go to "Clusters" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `curalink`

Example: `mongodb+srv://curalink_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/curalink?retryWrites=true&w=majority`

## 🔧 Step 2: Deploy Backend to Vercel

### Push Backend to GitHub
1. Create a new GitHub repository: `curalink-backend`
2. Push the backend code:
```bash
cd "/Users/pailasai/Downloads/AI PROJECT/curalink-backend"
git init
git add .
git commit -m "Initial backend deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/curalink-backend.git
git push -u origin main
```

### Deploy to Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your `curalink-backend` repository
4. **Project Settings**:
   - Framework Preset: "Other"
   - Root Directory: `./` (leave default)
   - Build Command: Leave empty
   - Output Directory: Leave empty
   - Install Command: `pip install -r requirements.txt`

5. **Environment Variables** (CRITICAL):
   Click "Environment Variables" and add:
   ```
   MONGODB_URL = mongodb+srv://curalink_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/curalink?retryWrites=true&w=majority
   JWT_SECRET = your-super-long-secure-jwt-secret-key-for-production-at-least-32-characters-long
   SAMBANOVA_API_KEY = bf368194-8726-452b-a7ca-6eb8c4aaeb21
   ```

6. Click "Deploy"
7. Wait for deployment (2-3 minutes)
8. Copy your backend URL (e.g., `https://curalink-backend.vercel.app`)

## 🎨 Step 3: Deploy Frontend to Vercel

### Push Frontend to GitHub
1. Create a new GitHub repository: `curalink-frontend`
2. Push the frontend code:
```bash
cd "/Users/pailasai/Downloads/AI PROJECT/curalink-frontend"
git init
git add .
git commit -m "Initial frontend deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/curalink-frontend.git
git push -u origin main
```

### Deploy to Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your `curalink-frontend` repository
4. **Project Settings**:
   - Framework Preset: "Next.js"
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

5. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL = https://curalink-backend.vercel.app
   ```
   (Replace with your actual backend URL from Step 2)

6. Click "Deploy"
7. Wait for deployment (3-5 minutes)
8. Your app will be live at `https://curalink-frontend.vercel.app`

## ✅ Step 4: Verify Deployment

### Test All Features
1. **Visit your frontend URL**
2. **Register/Login**: Create test accounts
3. **Patient Dashboard**: Check trials, publications, experts
4. **Researcher Dashboard**: Check collaborations, forums, meetings
5. **Real-Time Features**:
   - Send meeting requests
   - Accept/decline meetings
   - Test video call notifications
   - Test chat messages
   - Test CuraAI assistant

### Check Real-Time Functionality
- **Meeting Notifications**: Should appear within 5 seconds
- **Video Call Invitations**: Accept/decline buttons work
- **Auto Video Modal**: Opens when call accepted
- **Chat Messages**: Real-time delivery
- **Database Persistence**: All data saves correctly

## 🔄 Step 5: Update API URLs (If Needed)

If you need to update the backend URL in frontend:
1. Go to Vercel dashboard → Your frontend project
2. Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` with correct backend URL
4. Redeploy frontend

## 🎯 Production Features Enabled

✅ **Real-Time Notifications** (5-second polling)
✅ **Video Call System** with Accept/Decline
✅ **Auto-Join Video Calls** when accepted
✅ **Chat System** with real-time messages
✅ **CuraAI Assistant** with SambaNova API
✅ **Meeting Management** with status updates
✅ **User Authentication** with JWT tokens
✅ **MongoDB Database** with full persistence
✅ **Beautiful Premium UI** with animations
✅ **Mobile Responsive** design
✅ **Dark/Light Theme** support

## 🚨 Important Notes

1. **Database**: MongoDB Atlas free tier supports up to 512MB storage
2. **API Limits**: SambaNova API has usage limits
3. **Vercel Limits**: Free tier has function execution limits
4. **Real-Time**: Uses polling (not WebSockets) for Vercel compatibility
5. **CORS**: Backend configured for cross-origin requests

## 🔧 Troubleshooting

### Common Issues:
1. **CORS Errors**: Check backend CORS configuration
2. **Database Connection**: Verify MongoDB connection string
3. **Environment Variables**: Ensure all variables are set correctly
4. **API Timeouts**: Check Vercel function timeout limits

### Debug Steps:
1. Check Vercel function logs
2. Test API endpoints directly
3. Verify database connectivity
4. Check browser console for errors

## 🎉 Success!

Your CuraLink application is now fully deployed with:
- **Frontend**: Beautiful, responsive UI
- **Backend**: Fast, scalable API
- **Database**: Reliable MongoDB Atlas
- **Real-Time**: All notifications and features working
- **Production-Ready**: Secure and optimized

**Live URLs:**
- Frontend: `https://curalink-frontend.vercel.app`
- Backend: `https://curalink-backend.vercel.app`
- Database: MongoDB Atlas cluster

The application will work exactly like your local version but accessible worldwide! 🌍
