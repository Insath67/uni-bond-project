@echo off
REM Start uni_Bond Frontend Dev Server
REM This script starts the Vite development server

echo.
echo ===============================================
echo  uni_Bond Frontend Development Server
echo ===============================================
echo.

cd /D %~dp0uniBond_Frontend

if not exist "node_modules" (
    echo node_modules not found. Installing dependencies...
    call npm install
)

echo.
echo Starting Vite dev server...
echo Frontend will be available at: http://localhost:5173
echo.

call npm run dev

pause
