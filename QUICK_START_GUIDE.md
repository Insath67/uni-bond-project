# 🎉 uni_Bond Full Stack Setup - Complete Guide

**Date**: April 2026  
**Project**: ITPM-Project-UNI-Bond  
**Edition**: Senior Software Engineering  
**Status**: ✅ Ready for Development

---

## 📋 What Has Been Completed

Your full-stack application is now fully configured for development! Here's what has been set up:

### ✅ Backend (FastAPI + PostgreSQL)
- [x] Created Python virtual environment (`backend/venv/`)
- [x] Installed all dependencies (30+ packages)
- [x] Created `.env` configuration file
- [x] Database connection configured
- [x] Alembic migration system ready
- [x] JWT authentication utilities prepared
- [x] API routes structured (users, posts, login)

### ✅ Frontend (React + TypeScript + Vite)
- [x] Installed all npm packages (203 packages)
- [x] Created `.env` configuration
- [x] TypeScript configured
- [x] React Router setup ready
- [x] Tailwind CSS available
- [x] Project structure organized

### ✅ Database (PostgreSQL)
- [x] Configuration template created
- [x] Database setup scripts provided (.bat, .py)
- [x] User credentials configured
- [x] Connection string prepared
- [x] Migration framework ready (Alembic)

### ✅ Development Tools & Documentation
- [x] Startup scripts created (Windows batch & PowerShell)
- [x] Setup helper scripts available
- [x] Configuration validation script
- [x] Comprehensive documentation
- [x] Architecture reference guide
- [x] Quick reference manual
- [x] Troubleshooting guide

---

## 🚀 Next Steps: Getting Started

### Step 1: Install PostgreSQL (if not already installed)

**If PostgreSQL is already installed and running, skip to Step 2.**

1. Download from: https://www.postgresql.org/download/windows/
2. Run installer with these settings:
   - Port: `5432` (default)
   - Password for postgres user: **Note it down!**
   - Install Stack Builder: Optional

3. Verify installation:
   ```powershell
   psql --version
   ```

### Step 2: Create Database & User

**Option A: Automated (Recommended)**
```powershell
cd backend
python setup_database.py
```
*Enter the postgres user password when prompted*

**Option B: Manual Script**
```batch
cd backend
setup_database.bat
```
*Enter the postgres user password when prompted*

### Step 3: Start Backend Server

**Terminal 1:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

✅ Backend is ready at: http://localhost:8000

### Step 4: Start Frontend Server

**Terminal 2:**
```powershell
cd frontend\uniBond_Frontend
npm run dev
```

You should see:
```
  ➜  Local:   http://localhost:5173/
```

✅ Frontend is ready at: http://localhost:5173

### Step 5: Test Everything

**Test Backend API:**
- Browser: http://localhost:8000/docs
- You'll see the interactive Swagger UI with all endpoints

**Test Frontend:**
- Browser: http://localhost:5173
- You'll see your React app running

**Test Database Connection:**
```powershell
psql -U uni_bond_user -d uni_Bond -h localhost -W
# Password: uni_bond_secure_password_2024
```

---

## 📁 Files Created for You

| File | Purpose |
|------|---------|
| `backend/.env` | Backend configuration (database, JWT, etc.) |
| `backend/venv/` | Python virtual environment |
| `backend/setup_database.py` | Python database setup script |
| `backend/setup_database.bat` | Batch database setup script |
| `backend/run_backend.bat` | Windows batch startup script |
| `backend/run_backend.ps1` | PowerShell startup script |
| `backend/validate_setup.py` | Configuration validation script |
| `frontend/uniBond_Frontend/.env` | Frontend API configuration |
| `frontend/run_frontend.bat` | Frontend startup script |
| `frontend/run_frontend.ps1` | PowerShell frontend script |
| `setup_all.bat` | Master setup script |
| `SETUP_INSTRUCTIONS.md` | Detailed setup guide |
| `ARCHITECTURE.md` | Full architecture documentation |
| `QUICK_REFERENCE.md` | Commands & troubleshooting |
| `QUICK_START_GUIDE.md` | This file |

---

## 🎯 Project Architecture at a Glance

```
User Browser (http://localhost:5173)
         ↓
    [React Frontend]
    TypeScript + Vite
    React Router + Tailwind
         ↓
    HTTP/REST API Calls
         ↓
[FastAPI Backend] (http://localhost:8000)
    Python + AsyncIO
    Pydantic Validation
         ↓
    SQLAlchemy ORM
         ↓
[PostgreSQL Database] (localhost:5432)
    uni_Bond database
    Tables: users, posts, post_media
```

---

## 🔐 Current Configuration

### Backend
- **Framework**: FastAPI 0.134.0
- **Server**: Uvicorn
- **Database**: PostgreSQL (uni_Bond)
- **Auth**: JWT (HS256)
- **Port**: 8000
- **Host**: 0.0.0.0

### Frontend
- **Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.3.1
- **Styling**: Tailwind CSS 4.2.1
- **Router**: React Router 7.13.1
- **Port**: 5173

### Database
- **Type**: PostgreSQL
- **Database**: uni_Bond
- **User**: uni_bond_user
- **Host**: localhost:5432
- **Password**: uni_bond_secure_password_2024 (change in production!)

---

## 📚 API Endpoints Available

Your backend comes with these pre-configured routes:

```
Authentication:
  POST   /api/login              - User login
  
User Management:
  GET    /api/users              - List users
  POST   /api/users              - Create user
  GET    /api/users/{id}         - Get user
  PUT    /api/users/{id}         - Update user
  DELETE /api/users/{id}         - Delete user
  
Posts:
  GET    /api/posts              - List posts
  POST   /api/posts              - Create post
  GET    /api/posts/{id}         - Get post
  PUT    /api/posts/{id}         - Update post
  DELETE /api/posts/{id}         - Delete post
```

View full API docs at: http://localhost:8000/docs

---

## 🛠️ Common Tasks

### Add a New Backend Route

1. Create schema in `backend/app/schemas/`
2. Create/update model in `backend/app/models/`
3. Add route in `backend/app/routers/`
4. Test in Swagger UI

### Add a New Frontend Page

1. Create component in `frontend/uniBond_Frontend/src/pages/`
2. Define types in `frontend/uniBond_Frontend/src/types/`
3. Add route in `frontend/uniBond_Frontend/src/routes/AppRoutes.tsx`
4. Add navigation link

### Modify Database Schema

1. Update SQLAlchemy models
2. Create migration: `alembic revision --autogenerate -m "description"`
3. Review migration file
4. Apply: `alembic upgrade head`

---

## 📖 Documentation Files (In Project Root)

1. **SETUP_INSTRUCTIONS.md** - Detailed installation guide
2. **ARCHITECTURE.md** - Complete architecture & tech stack
3. **QUICK_REFERENCE.md** - Commands, shortcuts, troubleshooting
4. **This file** - Quick start guide

---

## ⚡ Quick Commands Reference

```powershell
# Backend startup
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload

# Frontend startup
cd frontend\uniBond_Frontend
npm run dev

# Run all checks
python backend\validate_setup.py

# Database operations
alembic upgrade head          # Apply migrations
alembic revision --autogenerate -m "description"  # Create migration

# Database connection
psql -U uni_bond_user -d uni_Bond -h localhost -W

# API testing
# Visit: http://localhost:8000/docs    (Swagger UI)
# Or:    http://localhost:8000/redoc   (ReDoc)
```

---

## 🔧 Troubleshooting Quick Tips

### PostgreSQL Connection Failed
- ✅ Check PostgreSQL service is running (Windows Services)
- ✅ Verify credentials in `.env` file
- ✅ Make sure database was created: `python setup_database.py`

### Port Already in Use
- ✅ Backend: Change port in startup command `--port 8001`
- ✅ Frontend: Edit `vite.config.ts`

### Module Not Found (Backend)
- ✅ Activate virtual environment: `.\venv\Scripts\Activate.ps1`
- ✅ Reinstall packages: `pip install -r requirements.txt`

### npm Errors (Frontend)
- ✅ Delete `node_modules`: `rmdir /s node_modules`
- ✅ Reinstall: `npm install`

---

## 🌐 Access Points

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **API Documentation** | http://localhost:8000/docs |
| **Alternative API Docs** | http://localhost:8000/redoc |
| **PostgreSQL** | localhost:5432 |

---

## 🚀 Ready to Deploy?

When you're ready for production:

1. Generate new `SECRET_KEY`
2. Change database password
3. Create `.env.production` file
4. Set `DEBUG=False`
5. Build frontend: `npm run build`
6. Use production WSGI server
7. Setup SSL/HTTPS
8. Configure CORS for production domain

---

## 📞 Support & Help

| Issue | Resource |
|-------|----------|
| Setup problems | `SETUP_INSTRUCTIONS.md` |
| Architecture questions | `ARCHITECTURE.md` |
| Commands/Shortcuts | `QUICK_REFERENCE.md` |
| Configuration | `backend/.env`, `frontend/.env` |
| Validation | Run `python backend/validate_setup.py` |

---

## ✨ You're All Set!

Your uni_Bond application is now fully configured and ready for development. 

### To get started right now:

```powershell
# Terminal 1: Backend
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload

# Terminal 2: Frontend (new terminal)
cd frontend\uniBond_Frontend
npm run dev
```

Then open your browser to:
- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs

---

## 📊 What's Next?

1. ✅ Setup complete
2. ⏭️ Start both servers
3. ⏭️ Test API endpoints
4. ⏭️ Build your features
5. ⏭️ Deploy to production

---

**Happy Coding! 🎉**

---

*Created: April 2026*  
*uni_Bond - University Student Management System*  
*Full Stack Ready for Development*
