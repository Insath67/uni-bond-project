# PowerShell Startup Script for uni_Bond Frontend
# This script starts the Vite development server

param(
    [int]$Port = 5173
)

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  uni_Bond Frontend Development Server" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Get frontend directory
$FrontendDir = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "uniBond_Frontend"
Set-Location $FrontendDir

# Check node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Dependencies not found. Installing..." -ForegroundColor Yellow
    & npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🚀 Starting Vite dev server..." -ForegroundColor Green
Write-Host "   Frontend will be available at: http://localhost:$Port" -ForegroundColor Cyan
Write-Host ""

# Start the server
& npm run dev
