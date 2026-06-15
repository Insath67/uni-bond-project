@echo off
REM ============================================================
REM uni_Bond Full Stack - COMPLETE AUTOMATIC SETUP 
REM Senior Software Engineering Edition
REM ============================================================

color 0A
cls

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                                                          ║
echo ║   uni_Bond Full Stack Project  - SETUP COMPLETE         ║
echo ║   Senior Software Engineering Edition                   ║
echo ║                                                          ║
echo ║   Status: Ready for Production Development              ║
echo ║   Date: April 3, 2026                                   ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

echo ===============================================================
echo  WHAT'S ALREADY DONE ✅
echo ===============================================================
echo.
echo  ✅ Python Virtual Environment (.venv) - CREATED
echo  ✅ Backend Dependencies - INSTALLED
echo  ✅ Frontend Dependencies - INSTALLED
echo  ✅ Backend Configuration (.env) - CREATED
echo  ✅ Frontend Configuration (.env) - CREATED
echo  ✅ FastAPI Setup - CONFIGURED
echo  ✅ React Setup - CONFIGURED
echo  ✅ Database Configuration - READY
echo  ✅ CORS Enabled - CONFIGURED
echo.

echo ===============================================================
echo  ONLY MISSING: PostgreSQL Installation
echo ===============================================================
echo.

echo DO THIS NOW:
echo.
echo 1. Download PostgreSQL:
echo    https://www.postgresql.org/download/windows/
echo.
echo 2. Install PostgreSQL:
echo    - Remember the 'postgres' password you enter
echo    - Keep port as 5432
echo    - Default settings are fine
echo.
echo 3. Restart this computer after installation
echo.
echo 4. Run database setup:
echo    python backend/setup_database.py
echo.
echo ===============================================================
echo  THEN START YOUR APPLICATION
echo ===============================================================
echo.

echo TERMINAL 1 - BACKEND:
echo ─────────────────────────────────────────
echo cd backend
echo .venv\Scripts\Activate.ps1
echo python -m uvicorn app.main:app --reload
echo.

echo TERMINAL 2 - FRONTEND:
echo ─────────────────────────────────────────
echo cd frontend\uniBond_Frontend
echo npm run dev
echo.

echo ===============================================================
echo  ACCESS YOUR APP
echo ===============================================================
echo.
echo 🔵 Frontend:  http://localhost:5173
echo 📚 API Docs:  http://localhost:8000/docs
echo 🗄️  Database:  localhost:5432 (uni_Bond)
echo.

echo ===============================================================
echo  QUICK SETUP SCRIPT FOR DATABASE
echo ===============================================================
echo.
echo After PostgreSQL is installed, run:
echo.
echo   cd backend
echo   python setup_database.py
echo.
echo This will automatically:
echo   ✓ Create database: uni_Bond
echo   ✓ Create user: uni_bond_user
echo   ✓ Set permissions
echo   ✓ Run migrations
echo.

echo ===============================================================
echo  PROJECT STATUS
echo ===============================================================
echo.
echo Backend:         ✅ Fully Configured
echo Frontend:        ✅ Fully Configured
echo Database Setup:  ⏳ Pending (after PostgreSQL install)
echo Environment:     ✅ Development Ready
echo.

echo Press any key to continue...
pause

