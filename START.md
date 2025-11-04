# 🚀 Quick Start - CuraLink

## ⚡ Get Running in 5 Minutes!

### Step 1: Setup Database (1 minute)
```bash
# Start MySQL
brew services start mysql  # macOS
# OR
sudo systemctl start mysql  # Linux

# Create database
mysql -u root -p < curalink-backend/setup_database.sql
```

### Step 2: Start Backend (2 minutes)
```bash
cd curalink-backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Add your OpenAI API key to .env file
# Edit .env and replace: OPENAI_API_KEY=your-key-here

# Start server
python main.py
```

**Backend running at**: http://localhost:8000

### Step 3: Start Frontend (2 minutes)
```bash
# Open new terminal
cd curalink-frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
echo "NEXT_PUBLIC_WS_URL=ws://localhost:8000" >> .env.local

# Start development server
npm run dev
```

**Frontend running at**: http://localhost:3000

---

## ✅ Verify It's Working

1. Open http://localhost:3000
2. You should see the beautiful CuraLink landing page
3. Click "I am a Patient or Caregiver"
4. Fill out the onboarding form
5. Access your personalized dashboard!

---

## 🎨 What You'll See

### Landing Page
- Animated gradient background with floating orbs
- Two beautiful call-to-action buttons
- Smooth animations on every element
- Glass morphism cards

### Patient Dashboard
- Real clinical trials from ClinicalTrials.gov
- Medical publications from PubMed
- AI-generated summaries
- Expert recommendations
- Cura AI chatbot

### Researcher Dashboard
- Collaboration tools
- Forum management
- Meeting requests
- Trial management

---

## 🔧 Troubleshooting

**Backend won't start?**
- Make sure MySQL is running
- Check `.env` file has correct database credentials
- Verify Python 3.9+ is installed

**Frontend won't start?**
- Make sure Node.js 18+ is installed
- Delete `node_modules` and run `npm install` again
- Check `.env.local` exists with correct URLs

**No data showing?**
- Backend must be running on port 8000
- Check browser console for errors
- Verify `.env` has `OPENAI_API_KEY` (optional but recommended)

---

## 📚 Next Steps

1. **Read**: `SETUP_GUIDE.md` for detailed instructions
2. **Explore**: `README.md` for full documentation
3. **Review**: `PROJECT_SUMMARY.md` for complete feature list

---

## 🎉 Enjoy CuraLink!

You're now running a production-ready healthcare discovery platform!

**Built with ❤️ for healthcare innovation**
