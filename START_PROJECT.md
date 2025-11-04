# 🚀 CuraLink - Complete Startup Guide

## Quick Start (2 Commands)

### Terminal 1 - Backend:
```bash
cd /Users/srinivasarao/Desktop/AI\ PROJECT/curalink-backend
source venv/bin/activate
python main.py
```

### Terminal 2 - Frontend:
```bash
cd /Users/srinivasarao/Desktop/AI\ PROJECT/curalink-frontend
npm run dev
```

---

## ✅ What Should Happen

### Backend (Terminal 1):
```
INFO:     Started server process [XXXXX]
INFO:     Waiting for application startup.
🚀 CuraLink Backend Starting...
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Frontend (Terminal 2):
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
```

---

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🎯 Complete Features Available

### Patient Dashboard Features:
1. ✅ **Clinical Trials** - Real data from ClinicalTrials.gov
2. ✅ **View Details** - Beautiful modal with full trial info
3. ✅ **Publications** - Real research papers from PubMed
4. ✅ **Experts** - List of researchers
5. ✅ **Request Meeting** - Send meeting requests to researchers
6. ✅ **Cura AI** - Chat with AI assistant (Siri-like interface)
7. ✅ **Favorites** - Save trials, publications, experts

### Researcher Dashboard Features:
1. ✅ **Create Forum** - Beautiful modal to create discussion forums
2. ✅ **Forums List** - View all forums from database
3. ✅ **Meeting Requests** - View pending meeting requests
4. ✅ **Accept/Decline** - Manage meeting requests
5. ✅ **Collaborations** - Track active collaborations

---

## 🎨 UI Components

### Beautiful Modals:
1. **Cura AI Chat** - Siri-like chat interface
2. **Trial Details** - Full-screen trial information
3. **Create Forum** - Professional form modal
4. **Request Meeting** - Meeting request form

### All Features:
- ✅ Centered modals
- ✅ Black text (visible)
- ✅ Smooth animations
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Success messages

---

## 🔧 Troubleshooting

### Backend Won't Start:
```bash
# Check if port 8000 is in use
lsof -ti:8000

# Kill process if needed
kill -9 $(lsof -ti:8000)

# Restart backend
cd /Users/srinivasarao/Desktop/AI\ PROJECT/curalink-backend
source venv/bin/activate
python main.py
```

### Frontend Won't Start:
```bash
# Check if port 3000 is in use
lsof -ti:3000

# Kill process if needed
kill -9 $(lsof -ti:3000)

# Restart frontend
cd /Users/srinivasarao/Desktop/AI\ PROJECT/curalink-frontend
npm run dev
```

### Database Connection Error:
```bash
# Check MySQL is running
mysql -u root -p

# Password: Karthik@2004

# Check database exists
USE curalink;
SHOW TABLES;
```

---

## 📊 Test Accounts

### Patient Account:
- Register as "Patient or Caregiver"
- Access patient dashboard
- Test all patient features

### Researcher Account:
- Register as "Researcher"
- Access researcher dashboard
- Test all researcher features

---

## 🧪 Testing Checklist

### Patient Dashboard:
- [ ] Login as patient
- [ ] See loading spinner
- [ ] View clinical trials
- [ ] Click "View Details" → Modal opens
- [ ] Click "Cura AI" → Chat opens
- [ ] Go to Experts tab
- [ ] Click "Request Meeting" → Modal opens
- [ ] Fill form and send request
- [ ] Check success message

### Researcher Dashboard:
- [ ] Login as researcher
- [ ] See dashboard stats
- [ ] Click "Create Forum" → Modal opens
- [ ] Fill form and create forum
- [ ] See forum in list
- [ ] View meeting requests
- [ ] Click "Accept" on request
- [ ] Check success message

---

## 📁 Project Structure

```
AI PROJECT/
├── curalink-backend/          # FastAPI Backend
│   ├── main.py               # Entry point
│   ├── routers/              # API routes
│   ├── models.py             # Database models
│   └── .env                  # Environment variables
│
├── curalink-frontend/         # Next.js Frontend
│   ├── app/                  # Pages
│   │   └── dashboard/        # Dashboards
│   ├── components/           # UI Components
│   │   ├── CuraAIChat.tsx
│   │   ├── TrialDetailsModal.tsx
│   │   ├── CreateForumModal.tsx
│   │   └── RequestMeetingModal.tsx
│   └── lib/                  # API client
│
└── Documentation/
    ├── COMPLETED_FIXES.md
    ├── NEW_FEATURES_COMPLETED.md
    ├── MEETING_FEATURE_COMPLETED.md
    └── UI_FIXES_COMPLETED.md
```

---

## 🎉 What's Working

### Backend:
- ✅ MySQL database connected
- ✅ All API endpoints working
- ✅ Authentication (JWT)
- ✅ ClinicalTrials.gov integration
- ✅ PubMed integration
- ✅ OpenAI integration (Cura AI)
- ✅ Forum CRUD operations
- ✅ Meeting request system

### Frontend:
- ✅ Beautiful UI with animations
- ✅ All modals working
- ✅ Real-time data loading
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design
- ✅ Dark/light theme support

### Database:
- ✅ All tables created
- ✅ Data persistence
- ✅ Relationships working
- ✅ Migrations complete

---

## 🚀 Production Ready Features

1. ✅ User authentication
2. ✅ Patient dashboard
3. ✅ Researcher dashboard
4. ✅ Clinical trials search
5. ✅ Publications search
6. ✅ Expert directory
7. ✅ Meeting requests
8. ✅ Forum system
9. ✅ AI chat assistant
10. ✅ Favorites system

---

## 📝 Environment Variables

### Backend (.env):
```
DATABASE_URL=mysql+pymysql://root:Karthik%402004@localhost:3306/curalink
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-key-here
```

### Frontend (.env.local):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🎯 Next Steps After Starting

1. **Open browser**: http://localhost:3000
2. **Register account** (Patient or Researcher)
3. **Login** with credentials
4. **Test features**:
   - Patient: View trials, chat with AI, request meetings
   - Researcher: Create forums, manage meeting requests
5. **Enjoy your healthcare platform!** 🎊

---

## 📞 Support

If you encounter issues:
1. Check both terminals for errors
2. Verify MySQL is running
3. Check environment variables
4. Review error messages
5. Restart servers if needed

---

**Your CuraLink platform is ready to launch!** 🚀

Start both servers and access http://localhost:3000 to begin!
