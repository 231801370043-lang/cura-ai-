# ⚡ CuraLink - Quick Start Guide

## 🎯 Automatic Setup (Easiest Way!)

### Backend Setup - Just 2 Commands! 🚀

```bash
cd curalink-backend
./start.sh
```

That's it! The script will:
- ✅ Create virtual environment
- ✅ Install dependencies
- ✅ **Automatically create the database**
- ✅ Create all tables
- ✅ Start the backend server

---

### Frontend Setup - Just 2 Commands! 🎨

Open a **NEW terminal** and run:

```bash
cd curalink-frontend
npm install && npm run dev
```

---

## 🌐 Access Your Application

- **Frontend**: http://localhost:3000 (Beautiful landing page)
- **Backend API**: http://localhost:8000 (API endpoints)
- **API Docs**: http://localhost:8000/docs (Interactive documentation)

---

## 🔧 Manual Setup (If Automatic Fails)

### Backend Manual Setup

```bash
cd curalink-backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install pymysql python-dotenv

# Create database automatically
python3 create_database.py

# Install all dependencies
pip install -r requirements.txt

# Start server
python main.py
```

### Frontend Manual Setup

```bash
cd curalink-frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
echo "NEXT_PUBLIC_WS_URL=ws://localhost:8000" >> .env.local

# Start development server
npm run dev
```

---

## ✅ What Gets Created Automatically

### Database: `curalink`
The script automatically creates:
- ✅ Database with UTF8MB4 encoding
- ✅ All tables (users, patient_profiles, researcher_profiles, etc.)
- ✅ Proper indexes and relationships

### Tables Created:
- `users` - User accounts
- `patient_profiles` - Patient information
- `researcher_profiles` - Researcher information
- `favorites` - Saved items
- `forums` - Discussion forums
- `forum_posts` - Forum posts and replies
- `chat_messages` - Chat history
- `meeting_requests` - Meeting requests
- `clinical_trials` - Cached trial data

---

## 🎉 Test Your Setup

### 1. Test Backend
Open: http://localhost:8000

You should see:
```json
{
  "message": "Welcome to CuraLink API",
  "version": "1.0.0",
  "status": "operational"
}
```

### 2. Test Frontend
Open: http://localhost:3000

You should see:
- Beautiful animated landing page
- Floating gradient orbs
- Two call-to-action buttons
- Smooth animations

### 3. Test Registration
1. Click "I am a Patient or Caregiver"
2. Fill out the 3-step onboarding
3. Access your personalized dashboard!

---

## 🔍 Verify Database

Check your MySQL connection in VS Code:
- You should see the `curalink` database
- With all tables listed above
- Ready to store data!

---

## 🆘 Troubleshooting

### "Permission denied: ./start.sh"
```bash
chmod +x start.sh
./start.sh
```

### "MySQL connection failed"
- Ensure MySQL is running: `brew services start mysql`
- Check password in `.env`: `Karthik@2004`

### "Port 8000 already in use"
```bash
# Kill the process
lsof -ti:8000 | xargs kill -9
# Then restart
python main.py
```

### "Port 3000 already in use"
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9
# Then restart
npm run dev
```

---

## 🎯 Next Steps

Once both servers are running:

1. **Explore the Landing Page** - See the beautiful animations
2. **Create a Patient Account** - Test the onboarding flow
3. **View Your Dashboard** - See real clinical trials and publications
4. **Try Cura AI** - Chat with the AI assistant
5. **Create a Researcher Account** - Test the researcher features

---

## 📊 Database Credentials

Configured in `.env`:
- **Host**: localhost
- **Port**: 3306
- **User**: root
- **Password**: Karthik@2004
- **Database**: curalink

---

## 🚀 You're All Set!

Everything is configured and ready to go. Just run the commands above and enjoy your fully functional healthcare discovery platform!

**Built with ❤️ for healthcare innovation**
