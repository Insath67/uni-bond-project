@echo off
REM Start uni_Bond Backend Server
REM This script activates the virtual environment and starts the FastAPI server

echo.
echo ===============================================
echo  uni_Bond Backend Server
echo ===============================================
echo.

cd /D %~dp0

if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please run setup first.
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Start the server
echo.
echo Starting FastAPI server...
echo Backend will be available at: http://localhost:8000
echo API Documentation at: http://localhost:8000/docs
echo.

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
