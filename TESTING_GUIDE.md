# 🧪 Complete Testing Guide - CuraLink Platform

## Prerequisites
- ✅ Backend running on http://localhost:8000
- ✅ Frontend running on http://localhost:3000
- ✅ MySQL database connected
- ✅ All environment variables set

---

## 🎯 Test Scenario 1: Patient Registration & Dashboard

### Step 1: Register as Patient
1. Go to http://localhost:3000
2. Click "I am a Patient or Caregiver"
3. Fill out registration:
   - **Name**: John Doe
   - **Email**: john@test.com
   - **Password**: password123
4. Step 2: Enter medical condition (e.g., "diabetes")
5. Step 3: Complete registration
6. **Expected**: Redirected to patient dashboard

### Step 2: Test Patient Dashboard Features

#### A. Welcome Text
- **Check**: "Welcome back, John!" is clearly visible
- **Status**: ✅ Should be dark gray text on white background

#### B. Loading State
- **Check**: See loading spinner when page loads
- **Status**: ✅ Blue spinning circle

#### C. Stats Cards
- **Check**: Three cards showing:
  - Clinical Trials: 10
  - Publications: 10
  - Experts Found: (number)
- **Status**: ✅ White cards with large numbers

#### D. Clinical Trials
- **Check**: 4 trial cards displayed
- **Data**: Real trials from ClinicalTrials.gov
- **Click "View Details"**: Shows full trial information
- **Status**: ✅ REAL DATA, button works

#### E. Publications
- **Check**: 3 publication cards displayed
- **Data**: Real papers from PubMed
- **Status**: ✅ REAL DATA

#### F. Experts
- **Check**: Expert cards displayed
- **Data**: Real researchers from database
- **Status**: ✅ REAL DATA

#### G. Cura AI Button
1. Click "Cura AI" button (top right)
2. Enter question: "What clinical trials are available for diabetes?"
3. **Expected**: AI response from OpenAI
4. **Status**: ✅ REAL AI INTEGRATION

---

## 🎯 Test Scenario 2: Researcher Registration & Dashboard

### Step 1: Logout & Register as Researcher
1. Click "Logout" in sidebar
2. Go to homepage
3. Click "I am a Researcher"
4. Fill out registration:
   - **Name**: Dr. Sarah Smith
   - **Email**: sarah@research.com
   - **Password**: password123
5. Step 2: Enter specialty (e.g., "Oncology")
6. Step 3: Complete registration
7. **Expected**: Redirected to researcher dashboard

### Step 2: Test Researcher Dashboard Features

#### A. Welcome Text
- **Check**: "Welcome, Dr. Sarah!" is clearly visible
- **Status**: ✅ Dark gray text on white background

#### B. Stats Cards
- **Check**: Three cards showing:
  - Active Collaborations: 12
  - Forum Posts: (number from database)
  - Meeting Requests: (number from database)
- **Status**: ✅ White cards with large numbers

#### C. Create Forum (CRITICAL TEST)
1. Click "Create Forum" button
2. Enter title: "Cancer Research Discussion"
3. Enter description: "Forum for discussing latest cancer research"
4. Enter category: "Research"
5. **Expected**: 
   - Alert: "Forum created successfully!"
   - Forum appears in list
   - **Database**: Check MySQL `forums` table - new row added
6. **Status**: ✅ SAVES TO DATABASE

#### D. Forums Display
- **Check**: Forums list shows all forums from database
- **Data**: Real data from MySQL
- **Status**: ✅ REAL DATABASE DATA

#### E. Meeting Requests
- **Check**: Meeting requests displayed
- **Data**: Real data from MySQL
- **Status**: ✅ REAL DATABASE DATA

---

## 🗄️ Database Verification

### Check MySQL Database

```sql
-- Connect to MySQL
mysql -u root -p

-- Use curalink database
USE curalink;

-- Check users table
SELECT * FROM users;

-- Check patient_profiles table
SELECT * FROM patient_profiles;

-- Check researcher_profiles table
SELECT * FROM researcher_profiles;

-- Check forums table (should have new forum)
SELECT * FROM forums;

-- Check favorites table
SELECT * FROM favorites;

-- Check meeting_requests table
SELECT * FROM meeting_requests;
```

### Expected Results
- ✅ `users` table: 2 rows (John and Sarah)
- ✅ `patient_profiles` table: 1 row (John's profile)
- ✅ `researcher_profiles` table: 1 row (Sarah's profile)
- ✅ `forums` table: At least 1 row (created forum)
- ✅ All data persists after page refresh

---

## 🔍 API Testing

### Test Backend APIs Directly

#### 1. Test Clinical Trials API
```bash
# Get auth token first (login)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"password123"}'

# Use the token to search trials
curl -X GET "http://localhost:8000/api/trials/search?condition=diabetes&max_results=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected**: JSON with real trials from ClinicalTrials.gov

#### 2. Test Publications API
```bash
curl -X GET "http://localhost:8000/api/publications/search?query=diabetes&max_results=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected**: JSON with real publications from PubMed

#### 3. Test Cura AI API
```bash
curl -X POST http://localhost:8000/api/chat/ai-assistant \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"message":"What are the latest treatments for diabetes?","context":"Patient with diabetes"}'
```

**Expected**: JSON with AI-generated response

#### 4. Test Create Forum API
```bash
curl -X POST http://localhost:8000/api/forums/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Forum","description":"Testing forum creation","category":"General"}'
```

**Expected**: JSON with created forum, saved in database

---

## ✅ Verification Checklist

### Visual Checks
- [ ] Welcome text visible on patient dashboard
- [ ] Welcome text visible on researcher dashboard
- [ ] Loading spinners show during data fetch
- [ ] All cards have white backgrounds
- [ ] All text is dark and readable
- [ ] Buttons have hover effects
- [ ] Animations are smooth

### Functionality Checks
- [ ] Patient registration works
- [ ] Researcher registration works
- [ ] Login works for both types
- [ ] Logout works
- [ ] Clinical trials load (real data)
- [ ] Publications load (real data)
- [ ] Experts load (real data)
- [ ] Cura AI button works (real AI)
- [ ] View Details buttons work
- [ ] Create Forum button works
- [ ] Forums display from database
- [ ] Meeting requests display

### Database Checks
- [ ] Users saved to database
- [ ] Patient profiles saved
- [ ] Researcher profiles saved
- [ ] Forums saved to database
- [ ] Data persists after refresh
- [ ] No duplicate entries

### API Checks
- [ ] All APIs return 200 status
- [ ] Authentication works
- [ ] Error handling works
- [ ] Data format is correct
- [ ] AI responses are relevant

---

## 🐛 Common Issues & Solutions

### Issue: "Registration failed"
**Solution**: Check backend is running, database is connected

### Issue: "No trials showing"
**Solution**: Check internet connection, ClinicalTrials.gov API may be slow

### Issue: "Cura AI not working"
**Solution**: Check OPENAI_API_KEY is set in backend .env file

### Issue: "Forum not created"
**Solution**: Check MySQL connection, check backend logs

### Issue: "Welcome text not visible"
**Solution**: Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)

---

## 📊 Performance Metrics

### Expected Load Times
- **Dashboard initial load**: 2-5 seconds
- **API responses**: 1-3 seconds
- **AI responses**: 3-8 seconds
- **Database operations**: < 1 second

### Data Accuracy
- **Clinical Trials**: 100% real from ClinicalTrials.gov
- **Publications**: 100% real from PubMed
- **Experts**: 100% real from database
- **Forums**: 100% real from database

---

## 🎉 Success Criteria

### All Tests Pass When:
1. ✅ Both dashboards load without errors
2. ✅ All text is clearly visible
3. ✅ All buttons are functional
4. ✅ Real data loads from APIs
5. ✅ Cura AI responds with relevant answers
6. ✅ Forums save to database
7. ✅ Data persists across sessions
8. ✅ No console errors
9. ✅ Professional UI/UX
10. ✅ Fast and responsive

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

Patient Dashboard:
- Welcome text visible: ✅ / ❌
- Loading state works: ✅ / ❌
- Trials load: ✅ / ❌
- Publications load: ✅ / ❌
- Experts load: ✅ / ❌
- Cura AI works: ✅ / ❌
- View Details works: ✅ / ❌

Researcher Dashboard:
- Welcome text visible: ✅ / ❌
- Loading state works: ✅ / ❌
- Create Forum works: ✅ / ❌
- Forums display: ✅ / ❌
- Meetings display: ✅ / ❌

Database:
- Data saves: ✅ / ❌
- Data persists: ✅ / ❌

Overall: PASS / FAIL
Notes: ___________
```

---

**Happy Testing! 🚀**
