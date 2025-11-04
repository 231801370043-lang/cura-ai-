# 🚀 CuraLink Setup Guide

Complete step-by-step guide to get CuraLink running on your machine.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js 18+** - [Download](https://nodejs.org/)
- [ ] **Python 3.9+** - [Download](https://www.python.org/downloads/)
- [ ] **MySQL 8.0+** - [Download](https://dev.mysql.com/downloads/mysql/)
- [ ] **Git** - [Download](https://git-scm.com/downloads/)
- [ ] **OpenAI API Key** - [Get one](https://platform.openai.com/api-keys)

---

## 🗄️ Step 1: Database Setup

### Option A: Using MySQL Command Line

1. **Start MySQL**:
```bash
# macOS
brew services start mysql

# Windows
net start MySQL80

# Linux
sudo systemctl start mysql
```

2. **Login to MySQL**:
```bash
mysql -u root -p
```

3. **Run the setup script**:
```sql
source /path/to/curalink-backend/setup_database.sql
```

### Option B: Manual Setup

```sql
CREATE DATABASE curalink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'curalink_user'@'localhost' IDENTIFIED BY 'curalink_password_2024';
GRANT ALL PRIVILEGES ON curalink.* TO 'curalink_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🐍 Step 2: Backend Setup

1. **Navigate to backend**:
```bash
cd curalink-backend
```

2. **Create virtual environment**:
```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure environment**:
The `.env` file is already created. Update these values:

```env
# Required: Add your OpenAI API key
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Required: Add your email for PubMed API
ENTREZ_EMAIL=your-email@example.com

# Optional: Change database password if you used a different one
DATABASE_URL=mysql+pymysql://curalink_user:your_password@localhost:3306/curalink

# Optional: Change secret key for production
SECRET_KEY=your-super-secret-key-for-production
```

5. **Start the backend**:
```bash
python main.py
```

You should see:
```
🚀 CuraLink Backend Starting...
INFO:     Uvicorn running on http://0.0.0.0:8000
```

6. **Test the backend**:
Open http://localhost:8000 in your browser. You should see:
```json
{
  "message": "Welcome to CuraLink API",
  "version": "1.0.0",
  "status": "operational"
}
```

---

## ⚛️ Step 3: Frontend Setup

1. **Open a new terminal** (keep backend running)

2. **Navigate to frontend**:
```bash
cd curalink-frontend
```

3. **Install dependencies**:
```bash
npm install
```

4. **Configure environment**:
Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

5. **Start the frontend**:
```bash
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in X.Xs
```

6. **Open the application**:
Navigate to http://localhost:3000 in your browser

---

## ✅ Step 4: Verify Installation

### Test Patient Flow

1. **Landing Page**: You should see the beautiful CuraLink homepage with animated gradients
2. **Click "I am a Patient or Caregiver"**
3. **Fill out the onboarding form**:
   - Step 1: Create account
   - Step 2: Describe your condition (e.g., "I have lung cancer")
   - Step 3: Complete setup
4. **Access Dashboard**: You should see your personalized patient dashboard

### Test Researcher Flow

1. **Go back to homepage**
2. **Click "I am a Researcher"**
3. **Fill out the researcher onboarding**
4. **Access Researcher Dashboard**

### Test AI Features

1. **In Patient Dashboard**, click "Cura AI" button
2. **Ask a question** like "Find trials for brain cancer in California"
3. **Verify AI responds** with relevant information

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'fastapi'`
**Solution**: Make sure virtual environment is activated and dependencies are installed
```bash
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

**Problem**: `sqlalchemy.exc.OperationalError: (2003, "Can't connect to MySQL server")`
**Solution**: 
- Ensure MySQL is running: `brew services start mysql` (macOS)
- Check database credentials in `.env`
- Verify database exists: `mysql -u root -p -e "SHOW DATABASES;"`

**Problem**: `OpenAI API error`
**Solution**: 
- Verify your API key is correct in `.env`
- Check you have credits: https://platform.openai.com/account/usage
- The app will work without AI features, just won't generate summaries

### Frontend Issues

**Problem**: `Module not found: Can't resolve '@/lib/api'`
**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

**Problem**: `Failed to fetch` errors in browser console
**Solution**: 
- Ensure backend is running on port 8000
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Verify CORS is enabled in backend (it is by default)

**Problem**: Styles not loading correctly
**Solution**:
```bash
npm run dev -- --turbo
# or
rm -rf .next
npm run dev
```

### Database Issues

**Problem**: `Access denied for user 'curalink_user'@'localhost'`
**Solution**:
```sql
-- Login as root
mysql -u root -p

-- Reset user
DROP USER IF EXISTS 'curalink_user'@'localhost';
CREATE USER 'curalink_user'@'localhost' IDENTIFIED BY 'curalink_password_2024';
GRANT ALL PRIVILEGES ON curalink.* TO 'curalink_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🌐 Optional: Production Deployment

### Deploy Backend (Render)

1. Create account on [Render](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env`
6. Deploy!

### Deploy Frontend (Vercel)

1. Create account on [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Framework Preset: Next.js
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL
   - `NEXT_PUBLIC_WS_URL`: Your Render WebSocket URL
5. Deploy!

### Database (PlanetScale)

1. Create account on [PlanetScale](https://planetscale.com)
2. Create new database
3. Get connection string
4. Update `DATABASE_URL` in Render environment variables

---

## 📚 Additional Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **PubMed API**: https://www.ncbi.nlm.nih.gov/home/develop/api/
- **ClinicalTrials.gov API**: https://clinicaltrials.gov/api/gui

---

## 🎉 Success!

If you've made it here, CuraLink should be running smoothly!

### What's Next?

1. **Explore the Features**: Try searching for trials, publications, and experts
2. **Test Real-Time**: Open two browser windows and test WebSocket features
3. **Customize**: Modify colors, add features, make it your own!
4. **Deploy**: Share your creation with the world

---

## 💡 Tips

- **Development**: Use `npm run dev` for hot reload
- **Production Build**: Run `npm run build` before deploying
- **Database Migrations**: FastAPI creates tables automatically on first run
- **API Testing**: Use http://localhost:8000/docs for interactive API documentation
- **Debugging**: Check browser console and terminal logs for errors

---

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review terminal/console logs for error messages
3. Ensure all prerequisites are installed correctly
4. Verify all environment variables are set
5. Try restarting both backend and frontend

---

**Happy Coding! 🚀**

Built with ❤️ for healthcare innovation
