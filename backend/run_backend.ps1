# PowerShell Startup Script for uni_Bond Backend
# This script activates the virtual environment and starts the FastAPI server

param(
    [int]$Port = 8000,
    [string]$Host = "0.0.0.0"
)

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  uni_Bond Backend Server" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Get backend directory
$BackendDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Check virtual environment
$VenvPath = Join-Path $BackendDir "venv\Scripts\Activate.ps1"
if (-not (Test-Path $VenvPath)) {
    Write-Host "❌ ERROR: Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run setup first." -ForegroundColor Yellow
    exit 1
}

# Activate virtual environment
& $VenvPath

Write-Host ""
Write-Host "🚀 Starting FastAPI server..." -ForegroundColor Green
Write-Host "   Backend will be available at: http://localhost:$Port" -ForegroundColor Cyan
Write-Host "   API Documentation at: http://localhost:$Port/docs" -ForegroundColor Cyan
Write-Host ""

# Start the server
& uvicorn app.main:app --reload --host $Host --port $Port
