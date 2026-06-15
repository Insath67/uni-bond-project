#!/usr/bin/env python3
"""
uni_Bond Full Stack Setup & Verification Script
Senior Software Engineering Edition
This script sets up and verifies the entire application
"""

import subprocess
import sys
import os
from pathlib import Path
import json

class Color:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Color.BOLD}{Color.CYAN}{'='*60}{Color.END}")
    print(f"{Color.BOLD}{Color.CYAN}{text:^60}{Color.END}")
    print(f"{Color.BOLD}{Color.CYAN}{'='*60}{Color.END}\n")

def print_success(text):
    print(f"{Color.GREEN}✅ {text}{Color.END}")

def print_error(text):
    print(f"{Color.RED}❌ {text}{Color.END}")

def print_warning(text):
    print(f"{Color.YELLOW}⚠️  {text}{Color.END}")

def print_info(text):
    print(f"{Color.BLUE}ℹ️  {text}{Color.END}")

def check_python():
    """Verify Python installation"""
    try:
        version = sys.version_info
        if version.major == 3 and version.minor >= 8:
            print_success(f"Python {version.major}.{version.minor}.{version.micro}")
            return True
        else:
            print_error(f"Python 3.8+ required (found {version.major}.{version.minor})")
            return False
    except:
        return False

def check_virtual_env(project_root):
    """Check if backend virtual environment exists"""
    venv_path = project_root / "backend" / ".venv"
    if venv_path.exists():
        print_success(f"Virtual environment found: {venv_path}")
        return venv_path
    else:
        print_error(f"Virtual environment not found at {venv_path}")
        return None

def check_node():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(
            ["node", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            version = result.stdout.strip()
            print_success(f"Node.js {version}")
            return True
    except:
        pass
    print_error("Node.js not found")
    return False

def check_postgres():
    """Check if PostgreSQL is installed"""
    try:
        result = subprocess.run(
            ["psql", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            version = result.stdout.strip()
            print_success(f"PostgreSQL {version}")
            return True
    except:
        pass
    print_error("PostgreSQL not found or not in PATH")
    return False

def check_env_files(project_root):
    """Check if .env files exist"""
    backend_env = project_root / "backend" / ".env"
    frontend_env = project_root / "frontend" / "uniBond_Frontend" / ".env"
    
    files_ok = True
    
    if backend_env.exists():
        print_success(f"Backend .env found")
    else:
        print_error(f"Backend .env not found")
        files_ok = False
    
    if frontend_env.exists():
        print_success(f"Frontend .env found")
    else:
        print_error(f"Frontend .env not found")
        files_ok = False
    
    return files_ok

def check_npm_packages(project_root):
    """Check if npm packages are installed"""
    frontend_path = project_root / "frontend" / "uniBond_Frontend"
    node_modules = frontend_path / "node_modules"
    
    if node_modules.exists():
        print_success("Frontend npm packages installed")
        return True
    else:
        print_warning("Frontend npm packages not installed")
        return False

def create_database(db_name="uni_Bond", db_user="postgres", db_password="abc123", db_host="localhost", db_port="5432"):
    """Create PostgreSQL database"""
    print_info(f"Creating database: {db_name}")
    
    try:
        # Create the database
        cmd1 = f"CREATE DATABASE {db_name};"
        proc1 = subprocess.Popen(
            ["psql", "-U", db_user, "-h", db_host, "-p", db_port],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        stdout, stderr = proc1.communicate(input=cmd1, timeout=10)
        
        if "already exists" in stderr:
            print_warning(f"Database {db_name} already exists")
        elif proc1.returncode == 0:
            print_success(f"Database {db_name} created")
        else:
            print_error(f"Failed to create database: {stderr[:200]}")
            return False
        
        return True
    except Exception as e:
        print_error(f"Database creation error: {e}")
        return False

def test_backend_api():
    """Test if backend API is responding"""
    print_info("Testing backend API connection...")
    try:
        import urllib.request
        response = urllib.request.urlopen("http://localhost:8000/", timeout=5)
        data = json.loads(response.read().decode())
        if "message" in data:
            print_success(f"Backend API responding: {data['message']}")
            return True
    except Exception as e:
        print_warning(f"Backend not responding (might not be started): {str(e)[:50]}")
    return False

def test_database_connection(db_name="uni_Bond", db_user="uni_bond_user", db_password="uni_bond_secure_password_2024"):
    """Test database connection"""
    print_info("Testing database connection...")
    try:
        import psycopg2
        conn = psycopg2.connect(
            host="localhost",
            database=db_name,
            user=db_user,
            password=db_password,
            port=5432
        )
        conn.close()
        print_success("Database connection successful")
        return True
    except Exception as e:
        print_warning(f"Database connection failed: {str(e)[:100]}")
        print_info("This is normal if database user wasn't created yet")
    return False

def main():
    print(f"\n{Color.BOLD}{Color.CYAN}")
    print("╔══════════════════════════════════════════════════════════╗")
    print("║  uni_Bond Full Stack Setup & Verification               ║")
    print("║  Senior Software Engineering Edition                    ║")
    print("║  April 2026                                             ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print(f"{Color.END}")
    
    project_root = Path(__file__).parent
    
    # Phase 1: Check Prerequisites
    print_header("PHASE 1: Checking Prerequisites")
    
    checks = {
        "Python": check_python(),
        "Node.js": check_node(),
        "PostgreSQL": check_postgres(),
        "Virtual Environment": check_virtual_env(project_root) is not None,
        "Environment Files": check_env_files(project_root),
        "NPM Packages": check_npm_packages(project_root),
    }
    
    # Phase 2: Database Setup
    print_header("PHASE 2: Database Setup")
    
    if checks["PostgreSQL"]:
        print_info("PostgreSQL is installed. Attempting to create database...")
        db_created = create_database()
    else:
        print_error("PostgreSQL not found - please install from https://www.postgresql.org/download/windows/")
        db_created = False
    
    # Phase 3: Backend Status
    print_header("PHASE 3: Backend Status")
    print_info("Backend Files:")
    
    backend_files = [
        project_root / "backend" / "app" / "main.py",
        project_root / "backend" / "app" / "core" / "config.py",
        project_root / "backend" / "app" / "db" / "database.py",
        project_root / "backend" / "requirements.txt",
    ]
    
    for file_path in backend_files:
        if file_path.exists():
            print_success(f"  {file_path.name}")
        else:
            print_error(f"  {file_path.name} MISSING")
    
    # Phase 4: Frontend Status
    print_header("PHASE 4: Frontend Status")
    print_info("Frontend Files:")
    
    frontend_files = [
        project_root / "frontend" / "uniBond_Frontend" / "src" / "App.tsx",
        project_root / "frontend" / "uniBond_Frontend" / "src" / "routes" / "AppRoutes.tsx",
        project_root / "frontend" / "uniBond_Frontend" / "package.json",
    ]
    
    for file_path in frontend_files:
        if file_path.exists():
            print_success(f"  {file_path.name}")
        else:
            print_warning(f"  {file_path.name} checking...")
    
    # Phase 5: API Testing
    print_header("PHASE 5: Connection Testing")
    test_backend_api()
    test_database_connection()
    
    # Phase 6: Summary
    print_header("SETUP SUMMARY")
    
    passed = sum(1 for v in checks.values() if v)
    total = len(checks)
    
    print(f"\nPrerequisites Check: {passed}/{total} passed\n")
    
    for check_name, result in checks.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status}  {check_name}")
    
    print(f"\n{Color.BOLD}NEXT STEPS:{Color.END}\n")
    
    print("1️⃣  DATABASE SETUP")
    print("   Run in PowerShell as Administrator:")
    print("   python backend/setup_database.py\n")
    
    print("2️⃣  START BACKEND (Terminal 1)")
    print("   cd backend")
    print("   .venv\\Scripts\\Activate.ps1")
    print(f"   {Color.GREEN}python -m uvicorn app.main:app --reload{Color.END}\n")
    
    print("3️⃣  START FRONTEND (Terminal 2)")
    print("   cd frontend\\uniBond_Frontend")
    print(f"   {Color.GREEN}npm run dev{Color.END}\n")
    
    print("4️⃣  ACCESS YOUR APP")
    print(f"   Frontend:  {Color.GREEN}http://localhost:5173{Color.END}")
    print(f"   API Docs:  {Color.GREEN}http://localhost:8000/docs{Color.END}")
    print(f"   Database:  {Color.GREEN}localhost:5432 (uni_Bond){Color.END}\n")
    
    print(f"{Color.BOLD}Status: {'READY' if passed == total else 'FIX ISSUES ABOVE'}{Color.END}\n")

if __name__ == "__main__":
    main()
