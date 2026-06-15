#!/usr/bin/env python3
"""
uni_Bond Configuration Validation Script
Checks if all required components are properly configured
"""

import sys
import subprocess
import os
from pathlib import Path
import json

class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.OKCYAN}{'='*50}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.OKCYAN}{text:^50}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.OKCYAN}{'='*50}{Colors.END}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}✅ {text}{Colors.END}")

def print_warning(text):
    print(f"{Colors.WARNING}⚠️  {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.FAIL}❌ {text}{Colors.END}")

def print_info(text):
    print(f"{Colors.OKBLUE}ℹ️  {text}{Colors.END}")

def check_python():
    """Check Python version"""
    print_header("Checking Python Installation")
    try:
        version = sys.version_info
        if version.major == 3 and version.minor >= 8:
            print_success(f"Python {version.major}.{version.minor}.{version.micro} installed")
            return True
        else:
            print_error(f"Python 3.8+ required (found {version.major}.{version.minor})")
            return False
    except Exception as e:
        print_error(f"Failed to check Python: {e}")
        return False

def check_virtual_env():
    """Check if backend virtual environment exists"""
    print_header("Checking Python Virtual Environment")
    backend_dir = Path(__file__).parent
    venv_path = backend_dir / "venv"
    
    if venv_path.exists():
        print_success(f"Virtual environment exists: {venv_path}")
        return True
    else:
        print_error(f"Virtual environment not found at {venv_path}")
        print_info("Run: python -m venv venv")
        return False

def check_requirements():
    """Check if all requirements are installed"""
    print_header("Checking Backend Dependencies")
    backend_dir = Path(__file__).parent
    venv_python = backend_dir / "venv" / "Scripts" / "python.exe"
    
    if not venv_python.exists():
        print_error("Virtual environment Python not found")
        return False
    
    try:
        result = subprocess.run(
            [str(venv_python), "-m", "pip", "list", "--format=json"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode != 0:
            print_error("Failed to list dependencies")
            return False
        
        packages = json.loads(result.stdout)
        required = [
            "fastapi", "uvicorn", "sqlalchemy", "psycopg2-binary",
            "alembic", "pydantic", "python-jose", "bcrypt"
        ]
        
        installed = [p["name"].lower() for p in packages]
        
        missing = [req for req in required if req.lower() not in installed]
        
        if not missing:
            print_success("All required dependencies installed")
            return True
        else:
            print_error(f"Missing dependencies: {', '.join(missing)}")
            print_info("Run: pip install -r requirements.txt")
            return False
    except Exception as e:
        print_error(f"Failed to check dependencies: {e}")
        return False

def check_env_file():
    """Check if .env file exists"""
    print_header("Checking Environment Configuration")
    backend_dir = Path(__file__).parent
    env_path = backend_dir / ".env"
    
    if env_path.exists():
        print_success(f".env file found: {env_path}")
        
        # Check for required variables
        with open(env_path, 'r') as f:
            content = f.read()
        
        required_vars = [
            "DATABASE_HOSTNAME",
            "DATABASE_PORT",
            "DATABASE_USERNAME",
            "DATABASE_PASSWORD",
            "DATABASE_NAME",
            "SECRET_KEY"
        ]
        
        missing = [var for var in required_vars if var not in content]
        
        if missing:
            print_warning(f"Missing env variables: {', '.join(missing)}")
            return False
        else:
            print_success("All required env variables present")
            return True
    else:
        print_error(f".env file not found at {env_path}")
        print_info("See SETUP_INSTRUCTIONS.md for setup")
        return False

def check_postgres():
    """Check PostgreSQL installation"""
    print_header("Checking PostgreSQL Installation")
    try:
        result = subprocess.run(
            ["psql", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode == 0:
            print_success(result.stdout.strip())
            return True
        else:
            print_error("PostgreSQL not found in PATH")
            return False
    except FileNotFoundError:
        print_error("PostgreSQL not installed")
        print_info("Download from: https://www.postgresql.org/download/windows/")
        return False
    except Exception as e:
        print_error(f"Failed to check PostgreSQL: {e}")
        return False

def check_postgres_connection():
    """Check if PostgreSQL is running and accessible"""
    print_header("Checking PostgreSQL Connection")
    
    try:
        result = subprocess.run(
            ["psql", "-U", "uni_bond_user", "-d", "uni_Bond", "-h", "localhost", "-c", "SELECT 1;"],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode == 0:
            print_success("Successfully connected to database 'uni_Bond'")
            return True
        else:
            if "does not exist" in result.stderr:
                print_warning("Database 'uni_Bond' does not exist")
                print_info("Run: python setup_database.py")
                return False
            else:
                print_error("Failed to connect to database")
                print_info("Check password and ensure PostgreSQL is running")
                print_info(result.stderr[:200])
                return False
    except FileNotFoundError:
        print_warning("psql not found - PostgreSQL may not be installed")
        return False
    except Exception as e:
        print_error(f"Connection error: {e}")
        return False

def check_frontend():
    """Check frontend setup"""
    print_header("Checking Frontend Setup")
    
    frontend_dir = Path(__file__).parent.parent / "frontend" / "uniBond_Frontend"
    node_modules = frontend_dir / "node_modules"
    package_json = frontend_dir / "package.json"
    
    if not package_json.exists():
        print_error(f"package.json not found at {package_json}")
        return False
    
    print_success(f"package.json found")
    
    if node_modules.exists():
        print_success("node_modules installed")
        return True
    else:
        print_warning("node_modules not found")
        print_info("Run: npm install (in frontend/uniBond_Frontend)")
        return False

def check_migrations():
    """Check if database migrations are up to date"""
    print_header("Checking Database Migrations")
    
    backend_dir = Path(__file__).parent
    venv_python = backend_dir / "venv" / "Scripts" / "python.exe"
    alembic_dir = backend_dir / "alembic"
    
    if not alembic_dir.exists():
        print_error("Alembic directory not found")
        return False
    
    print_success("Alembic migrations structure found")
    
    # Check if there are migration files
    versions_dir = alembic_dir / "versions"
    if versions_dir.exists():
        migration_files = list(versions_dir.glob("*.py"))
        if migration_files:
            print_success(f"Found {len(migration_files)} migration file(s)")
            return True
        else:
            print_warning("No migrations found in versions directory")
            return False
    
    return False

def main():
    """Run all checks"""
    print(f"\n{Colors.BOLD}{Colors.OKBLUE}")
    print("╔═════════════════════════════════════════════════╗")
    print("║   uni_Bond Configuration Validator v1.0         ║")
    print("╚═════════════════════════════════════════════════╝")
    print(f"{Colors.END}")
    
    checks = [
        ("Python Installation", check_python),
        ("Virtual Environment", check_virtual_env),
        ("Backend Dependencies", check_requirements),
        ("Environment Configuration", check_env_file),
        ("PostgreSQL Installation", check_postgres),
        ("PostgreSQL Connection", check_postgres_connection),
        ("Frontend Setup", check_frontend),
        ("Database Migrations", check_migrations),
    ]
    
    results = {}
    
    for name, check_func in checks:
        try:
            results[name] = check_func()
        except Exception as e:
            print_error(f"Error during {name}: {e}")
            results[name] = False
    
    # Summary
    print_header("Summary")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for name, result in results.items():
        status = f"{Colors.OKGREEN}PASS{Colors.END}" if result else f"{Colors.FAIL}FAIL{Colors.END}"
        print(f"  {status}  {name}")
    
    print(f"\n{Colors.BOLD}Total: {passed}/{total} checks passed{Colors.END}\n")
    
    if passed == total:
        print_success("✨ All systems operational! You're ready to go!")
        print_info("Run: setup_all.bat  or  backend\\run_backend.bat  and  frontend\\run_frontend.bat")
        return 0
    else:
        print_error(f"{total - passed} check(s) failed. Please fix above issues.")
        print_info("Refer to SETUP_INSTRUCTIONS.md or QUICK_REFERENCE.md")
        return 1

if __name__ == "__main__":
    sys.exit(main())
