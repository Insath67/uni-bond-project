# 🚀 uni_Bond Full Stack - COMPLETE SETUP GUIDE

## ✅ VERIFICATION RESULTS

Your setup is **5/6 ready**:

- ✅ Python 3.14.3
- ✅ Node.js v24.14.0
- ✅ Virtual Environment (.venv)
- ✅ Backend .env configured
- ✅ Frontend .env configured
- ✅ Frontend npm packages
- ❌ **PostgreSQL - NEEDS INSTALLATION**

---

## 🛠️ STEP 1: INSTALL PostgreSQL (REQUIRED)

### Windows Installation:

1. **Download PostgreSQL**
   - Go to: https://www.postgresql.org/download/windows/
   - Download **PostgreSQL 14 or higher**

2. **Install PostgreSQL**
   - Run the installer
   - Choose installation directory (default is fine)
   - **IMPORTANT: Remember the password you set for 'postgres' user**
   - Port: **5432** (default)
   - Locale: [Default]
   - Check "Install Stack Builder" (optional)

3. **Verify Installation**
   ```powershell
   psql --version
   ```
   Should show: `psql (PostgreSQL) 14.x` or similar

4. **Add PostgreSQL to PATH** (if needed)
   - Right-click Computer → Properties
   - Advanced System Settings → Environment Variables
   - Add PostgreSQL bin folder to PATH:
     `C:\Program Files\PostgreSQL\14\bin`
   - Restart PowerShell

---

## 📊 STEP 2: CREATE DATABASE (After PostgreSQL is installed)

Run this command in PowerShell:

```powershell
cd c:\Users\eneth\Desktop\ITPM-Project-UNI-Bond\backend
python setup_database.py
```

When prompted, enter:
- PostgreSQL admin password: `abc123` (from your .env)
- This creates:
  - Database: `uni_Bond`
  - User: `uni_bond_user`
  - Password: `uni_bond_secure_password_2024`

---

## 🏃 STEP 3: START BACKEND SERVER

**Terminal 1 - Backend:**

```powershell
cd c:\Users\eneth\Desktop\ITPM-Project-UNI-Bond\backend
.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
✅ INFO:     Uvicorn running on http://0.0.0.0:8000
✅ INFO:     Application startup complete
```

---

## 🎨 STEP 4: START FRONTEND SERVER

**Terminal 2 - Frontend** (new terminal):

```powershell
cd c:\Users\eneth\Desktop\ITPM-Project-UNI-Bond\frontend\uniBond_Frontend
npm run dev
```

You should see:
```
✅ Local: http://localhost:5173/
```

---

## 🌐 STEP 5: ACCESS YOUR APPLICATION

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **API Documentation** | http://localhost:8000/docs ← **Test endpoints here!** |
| **Database** | localhost:5432 (uni_Bond) |

---

## 🔍 ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────┐
│    React Frontend               │
│  TypeScript + Vite + Tailwind  │
│    Port: 5173                   │
└──────────────┬──────────────────┘
               │
         HTTP/REST API
               │
┌──────────────▼──────────────────┐
│    FastAPI Backend              │
│  Python + Uvicorn + Pydantic   │
│    Port: 8000                   │
└──────────────┬──────────────────┘
               │
       SQLAlchemy + Psycopg2
               │
┌──────────────▼──────────────────┐
│   PostgreSQL Database           │
│   uni_Bond (localhost:5432)     │
└─────────────────────────────────┘
```

---

## 📋 CONFIGURATION DETAILS

### Backend (.env)
```
DATABASE_HOSTNAME=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres      ← Your postgres admin user
DATABASE_PASSWORD=abc123        ← Your postgres password
DATABASE_NAME=uni_Bond         ← Database to create
SECRET_KEY=...                  ← For JWT tokens
DEBUG=True                       ← Development mode
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_ENV=development
VITE_DEBUG=true
```

---

## ✨ FEATURES READY

✅ User Authent ication (JWT)
✅ User Management API
✅ Post Creation & Management
✅ Media Upload Handling
✅ Database Migrations (Alembic)
✅ API Documentation (Swagger UI)
✅ Type Safety (TypeScript + Pydantic)
✅ CORS Configured
✅ Hot Reload Development

---

## 🧪 TESTING

### Test Backend API
1. Open: http://localhost:8000/docs
2. Try any endpoint (click "Try it out")
3. Should see responses!

### Test Frontend
1. Open: http://localhost:5173
2. Should see React app loading
3. Check browser console (F12) for errors

### Test Database
```powershell
psql -U uni_bond_user -d uni_Bond -h localhost -W
# Enter password: uni_bond_secure_password_2024
# Type: \dt (to see tables)
# Type: \q (to quit)
```

---

## 🆘 TROUBLESHOOTING

### PostgreSQL not found?
```
ERROR: PostgreSQL not found or not in PATH
```
**Solution:** Install PostgreSQL from https://www.postgresql.org/download/windows/

### Database creation failed?
```
ERROR: psql: could not translate host name "localhost" to address: Name or service not known
```
**Solution:** 
1. Check PostgreSQL service is running (Windows Services)
2. Make sure you used `-U postgres` with admin password

### Backend won't start?
```
ERROR: ModuleNotFoundError
```
**Solution:** Activate venv first:
```powershell
.venv\Scripts\Activate.ps1
```

### Frontend won't start?
```
ERROR: npm: command not found
```
**Solution:** Install Node.js from https://nodejs.org/

### CORS error in frontend?
Frontend can't reach backend API. **Solution:**
1. Check backend is running on port 8000
2. Check backend .env has correct database settings
3. Verify frontend .env has: `VITE_API_BASE_URL=http://localhost:8000`

---

## 📊 PROJECT STRUCTURE

```
backend/
  ├── .env                 ← Configuration (CREATED ✅)
  ├── .venv/              ← Virtual environment (CREATED ✅)
  ├── requirements.txt    ← Dependencies
  ├── app/
  │   ├── main.py        ← FastAPI entry point
  │   ├── core/config.py ← Settings
  │   ├── db/database.py ← DB connection
  │   ├── models/        ← SQLAlchemy models
  │   ├── routers/       ← API endpoints
  │   └── schemas/       ← Pydantic schemas
  └── alembic/           ← Database migrations

frontend/uniBond_Frontend/
  ├── .env               ← Configuration (CREATED ✅)
  ├── node_modules/      ← npm packages (CREATED ✅)
  ├── src/
  │   ├── App.tsx
  │   ├── pages/         ← Page components
  │   ├── components/    ← UI components
  │   ├── routes/        ← Route definitions
  │   ├── types/         ← TypeScript types
  │   └── services/      ← API services
  └── package.json
```

---

## 🚀 ONE-COMMAND START (After everything is installed)

**Terminal 1:**
```powershell
cd backend ; .venv\Scripts\Activate.ps1 ; python -m uvicorn app.main:app --reload
```

**Terminal 2:**
```powershell
cd frontend\uniBond_Frontend ; npm run dev
```

---

## ✅ SUCCESS CHECKLIST

Before you start building features:

- [ ] PostgreSQL installed and running
- [ ] Database `uni_Bond` created
- [ ] Backend server starts without errors
- [ ] Frontend dev server starts without errors
- [ ] http://localhost:8000/ loads API
- [ ] http://localhost:8000/docs shows Swagger UI
- [ ] http://localhost:5173 shows React app
- [ ] Browser console (F12) has no errors
- [ ] Can connect to database: `psql -U uni_bond_user -d uni_Bond`

---

## 🎓 TECH STACK EXPLANATION

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **API Server** | FastAPI 0.134 | Modern async Python web framework |
| **ASGI Server** | Uvicorn | Lightning-fast server |
| **Database** | PostgreSQL | Reliable relational database |
| **ORM** | SQLAlchemy 2.0 | Database abstraction |
| **API Docs** | Swagger/OpenAPI | Auto-generated documentation |
| **Frontend** | React 19 | UI library |
| **Language** | TypeScript 5.9 | Type-safe JavaScript |
| **Build Tool** | Vite | Ultra-fast bundler |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Routing** | React Router 7 | Client-side routing |

---

## 🎯 NEXT STEPS AFTER SETUP

1. ✅ Get everything running (you are here)
2. ⏭️ Explore API docs: http://localhost:8000/docs
3. ⏭️ Test API endpoints with Swagger UI
4. ⏭️ Create frontend pages
5. ⏭️ Add new API endpoints
6. ⏭️ Connect frontend to backend
7. ⏭️ Deploy to production

---

## 📞 QUICK REFERENCE

**Start Database Connection:**
```powershell
psql -U uni_bond_user -d uni_Bond -h localhost -W
```

**View running processes:**
```powershell
Get-Process | grep python
Get-Process | grep node
```

**Kill a process:**
```powershell
Stop-Process -Name "python" -Force
Stop-Process -Name "node" -Force
```

**Check port usage:**
```powershell
netstat -ano | findstr :8000
netstat -ano | findstr :5173
```

---

## 🎉 YOU'RE READY!

Your **full-stack uni_Bond application** is configured and ready to run!

```
✅ Python
✅ Node.js
✅ Virtual Environment
✅ Backend Configuration
✅ Frontend Configuration
⏳ PostgreSQL (Install it!)
⏳ Run the servers
⏳ Start building!
```

---

**Last Updated:** April 3, 2026  
**Status:** Ready to Go (pending PostgreSQL installation)  
**Edition:** Senior Software Engineering

Happy Coding! 🚀
