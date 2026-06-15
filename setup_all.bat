@echo off
REM Comprehensive uni_Bond Setup Script
REM This script sets up the entire project: backend, frontend, and database

color 0A
cls

echo.
echo ███████████████████████████████████████████████████████
echo ██                                                     ██
echo ██  uni_Bond Full Stack Application Setup             ██
echo ██  Senior Software Engineering Edition               ██
echo ██                                                     ██
echo ███████████████████████████████████████████████████████
echo.
echo This script will:
echo  1. Create Python virtual environment
echo  2. Install backend dependencies
echo  3. Setup PostgreSQL database
echo  4. Run database migrations
echo  5. Install frontend dependencies
echo  6. Create configuration files
echo.
echo Prerequisites:
echo  ✓ Python 3.8+
echo  ✓ PostgreSQL installed and running
echo  ✓ Node.js and npm installed
echo.
pause

cls

REM Save original directory
set ORIGINAL_DIR=%cd%

REM ==========================================
REM PART 1: Backend Setup
REM ==========================================
echo.
echo [1/5] Setting up Backend Environment...
echo ===============================================
echo.

if not exist "backend\venv" (
    echo Creating Python virtual environment...
    cd backend
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Failed to create virtual environment
        cd %ORIGINAL_DIR%
        exit /b 1
    )
    echo ✅ Virtual environment created
    cd ..
) else (
    echo ✅ Virtual environment already exists
)

echo.
echo Installing backend dependencies...
cd backend
call venv\Scripts\activate.bat
pip install -q -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    cd %ORIGINAL_DIR%
    exit /b 1
)
echo ✅ Backend dependencies installed
cd ..

REM ==========================================
REM PART 2: Database Setup
REM ==========================================
echo.
echo [2/5] Setting up Database...
echo ===============================================
echo.

echo Checking PostgreSQL...
psql --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ⚠️  PostgreSQL is not installed or not in PATH
    echo.
    echo Please:
    echo  1. Install PostgreSQL from: https://www.postgresql.org/download/windows/
    echo  2. Add PostgreSQL bin folder to your PATH
    echo  3. Or run setup_database.bat manually after installing PostgreSQL
    echo.
    echo After PostgreSQL is installed, run:
    echo  - backend\setup_database.bat  (for simple setup)
    echo  - Or: python backend\setup_database.py (for Python-based setup)
    echo.
    pause
) else (
    echo ✅ PostgreSQL found
    echo.
    echo Running database setup...
    cd backend
    call venv\Scripts\activate.bat
    python setup_database.py
    cd ..
)

REM ==========================================
REM PART 3: Frontend Setup
REM ==========================================
echo.
echo [3/5] Setting up Frontend...
echo ===============================================
echo.

if not exist "frontend\uniBond_Frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend\uniBond_Frontend
    call npm install -q
    if errorlevel 1 (
        echo ❌ Failed to install frontend dependencies
        cd %ORIGINAL_DIR%
        exit /b 1
    )
    echo ✅ Frontend dependencies installed
    cd ..
    cd ..
) else (
    echo ✅ Frontend dependencies already installed
)

REM ==========================================
REM PART 4: Summary
REM ==========================================
cls
echo.
echo ███████████████████████████████████████████████████████
echo ██                                                     ██
echo ██  ✅ Setup Complete!                                ██
echo ██                                                     ██
echo ███████████████████████████████████████████████████████
echo.
echo Your uni_Bond application is ready to run!
echo.
echo ═══════════════════════════════════════════════════════
echo TO START THE APPLICATION:
echo ═══════════════════════════════════════════════════════
echo.
echo OPTION 1: Using Individual Scripts (Recommended)
echo ──────────────────────────────────────────────
echo Terminal 1 (Backend):
echo   cd backend
echo   .\run_backend.bat
echo.
echo Terminal 2 (Frontend):
echo   cd frontend
echo   .\run_frontend.bat
echo.
echo OPTION 2: Manual Commands
echo ──────────────────────────
echo Terminal 1 (Backend):
echo   cd backend
echo   .\venv\Scripts\activate.ps1
echo   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
echo.
echo Terminal 2 (Frontend):
echo   cd frontend\uniBond_Frontend
echo   npm run dev
echo.
echo ═══════════════════════════════════════════════════════
echo ACCESS POINTS:
echo ═══════════════════════════════════════════════════════
echo.
echo 🔵 Backend API: http://localhost:8000
echo 📚 API Docs:    http://localhost:8000/docs
echo 🌐 Frontend:    http://localhost:5173 (typically)
echo 🗄️  Database:    postgresql://uni_bond_user@localhost:5432/uni_Bond
echo.
echo ═══════════════════════════════════════════════════════
echo CONFIGURATION FILES:
echo ═══════════════════════════════════════════════════════
echo.
echo ✓ Backend config:   backend\.env
echo ✓ Frontend config:  frontend\uniBond_Frontend\.env
echo.
echo ═══════════════════════════════════════════════════════
echo 📖 For detailed instructions, see: SETUP_INSTRUCTIONS.md
echo ═══════════════════════════════════════════════════════
echo.

pause

