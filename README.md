# 🏥 CuraLink - AI-Powered Healthcare Discovery Platform

**Connecting Patients and Researchers Through AI-Powered Discovery**

CuraLink is a fully functional, production-ready web MVP that seamlessly connects patients and researchers to discover clinical trials, medical publications, and health experts in real-time.

---

## ✨ Features

### For Patients
- 🔍 **AI-Powered Discovery**: Natural language processing to match patients with relevant clinical trials
- 📚 **Medical Publications**: Access to latest research from PubMed with AI-generated summaries
- 👨‍⚕️ **Expert Connections**: Find and connect with verified healthcare professionals and researchers
- ⭐ **Favorites System**: Save trials, publications, and experts for easy access
- 💬 **Cura AI Assistant**: Interactive AI chatbot for personalized guidance
- 🔔 **Real-Time Notifications**: WebSocket-powered instant updates

### For Researchers
- 🤝 **Collaboration Tools**: Connect with fellow researchers worldwide
- 📋 **Trial Management**: Create and manage clinical trials
- 💬 **Discussion Forums**: Engage with patients and colleagues
- 📅 **Meeting Requests**: Handle patient consultation requests
- 🔬 **ORCID Integration**: Verified researcher profiles

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React + TypeScript)
- **Styling**: Tailwind CSS with custom gradients and animations
- **Animations**: Framer Motion for smooth transitions
- **UI Components**: ShadCN/UI + Radix UI
- **API Client**: Axios
- **Real-time**: WebSocket (socket.io-client)

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MySQL with SQLAlchemy ORM
- **Authentication**: JWT-based auth with bcrypt
- **AI/ML**: LangChain + OpenAI GPT for NLP and summaries
- **Real-time**: WebSockets for live updates
- **API Integrations**:
  - PubMed API (medical publications)
  - ClinicalTrials.gov API (clinical trials)
  - ORCID API (researcher verification)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- MySQL 8.0+
- OpenAI API Key (for AI features)

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd curalink-backend
```

2. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Set up MySQL database**:
```sql
CREATE DATABASE curalink;
CREATE USER 'curalink_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON curalink.* TO 'curalink_user'@'localhost';
FLUSH PRIVILEGES;
```

5. **Configure environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
DATABASE_URL=mysql+pymysql://curalink_user:your_password@localhost:3306/curalink
SECRET_KEY=your-super-secret-key-change-this
OPENAI_API_KEY=your-openai-api-key
ENTREZ_EMAIL=your-email@example.com
```

6. **Run the backend**:
```bash
python main.py
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd curalink-frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment** (create `.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

4. **Run the development server**:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

---

## 🎨 UI/UX Highlights

### Design Philosophy
- **Modern & Minimal**: Clean interface inspired by Duolingo, Spotify, and Notion
- **Stunning Animations**: Framer Motion for smooth page transitions and micro-interactions
- **Glass Morphism**: Frosted glass effects with backdrop blur
- **Gradient Magic**: Beautiful color gradients (teal, purple, orange)
- **Neumorphism**: Soft shadows and elevated cards
- **Responsive**: Perfect on desktop, tablet, and mobile

### Color Palette
- **Primary**: Teal (#14b8a6) - Trust and healthcare
- **Secondary**: Purple (#a855f7) - Innovation and technology
- **Accent**: Orange (#f97316) - Energy and warmth
- **Gradients**: Multi-color smooth transitions

### Animations
- Floating orbs in background
- Staggered card animations
- Hover glow effects
- Smooth page transitions
- Pulse notifications
- Shimmer loading states

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users/patient-profile` - Get patient profile
- `PUT /api/users/patient-profile` - Update patient profile
- `GET /api/users/researcher-profile` - Get researcher profile
- `PUT /api/users/researcher-profile` - Update researcher profile

### Clinical Trials
- `GET /api/trials/search` - Search clinical trials
- `GET /api/trials/{nct_id}` - Get trial details

### Publications
- `GET /api/publications/search` - Search publications
- `GET /api/publications/{pmid}` - Get publication details

### Experts
- `GET /api/experts/search` - Search experts
- `GET /api/experts/{expert_id}` - Get expert details

### Forums
- `GET /api/forums/` - Get all forums
- `POST /api/forums/` - Create forum
- `GET /api/forums/{forum_id}/posts` - Get forum posts
- `POST /api/forums/{forum_id}/posts` - Create post

### Favorites
- `GET /api/favorites/` - Get user favorites
- `POST /api/favorites/` - Add favorite
- `DELETE /api/favorites/{favorite_id}` - Remove favorite

### Chat & Meetings
- `GET /api/chat/conversations` - Get conversations
- `POST /api/chat/messages` - Send message
- `POST /api/chat/ai-assistant` - Chat with AI
- `GET /api/meetings/` - Get meeting requests
- `POST /api/meetings/` - Create meeting request

---

## 🌐 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy automatically

### Backend (Render/Heroku)
1. Create new web service
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Database (PlanetScale)
1. Create new database
2. Get connection string
3. Update `DATABASE_URL` in backend

---

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- SQL injection protection (SQLAlchemy ORM)
- Input validation with Pydantic
- Secure WebSocket connections

---

## 🤖 AI Features

### Natural Language Processing
- Extract medical conditions from patient descriptions
- Intelligent matching of patients to trials
- Context-aware expert recommendations

### AI Summaries
- Automatic summarization of clinical trials
- Patient-friendly publication summaries
- Complex medical text simplification

### Cura AI Assistant
- Real-time chat support
- Personalized recommendations
- Natural language trial search

---

## 📊 Database Schema

### Users Table
- id, email, hashed_password, full_name, role, created_at, updated_at

### Patient Profiles
- id, user_id, medical_condition, location, age, additional_info

### Researcher Profiles
- id, user_id, specialty, research_interests, institution, orcid_id, verified

### Favorites
- id, user_id, item_type, item_id, item_data, created_at

### Forums & Posts
- Forum: id, title, description, category, created_at
- ForumPost: id, forum_id, author_id, parent_id, content, created_at

### Chat Messages
- id, sender_id, receiver_id, message, read, created_at

### Meeting Requests
- id, requester_id, expert_id, message, status, created_at

---

## 🎯 Future Enhancements

- [ ] Video consultation integration
- [ ] Mobile apps (React Native)
- [ ] Advanced AI matching algorithms
- [ ] Multi-language support
- [ ] Payment integration for consultations
- [ ] Clinical trial enrollment tracking
- [ ] Research collaboration tools
- [ ] Data analytics dashboard

---

## 📝 License

MIT License - feel free to use this project for learning or building upon it!

---

## 👥 Contributors

Built with ❤️ for healthcare innovation

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**CuraLink** - Empowering healthcare through technology 🏥✨
