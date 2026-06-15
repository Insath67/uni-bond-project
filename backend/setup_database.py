#!/usr/bin/env python3
"""
PostgreSQL Database Setup Script for uni_Bond Application
This script creates the database and user if PostgreSQL is running
"""

import sys
import subprocess
import os
from pathlib import Path

def print_banner(message):
    print("\n" + "="*50)
    print(f"  {message}")
    print("="*50 + "\n")

def check_postgres():
    """Check if PostgreSQL is accessible"""
    try:
        result = subprocess.run(
            ["psql", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            print(f"✅ {result.stdout.strip()}")
            return True
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass
    return False

def create_database(db_name, db_user, db_password, db_host, db_port, postgres_password):
    """Create database and user in PostgreSQL"""
    
    print(f"📝 Setting up database...")
    print(f"   Database: {db_name}")
    print(f"   User: {db_user}")
    print(f"   Host: {db_host}:{db_port}\n")
    
    # Build the SQL commands
    sql_commands = [
        f"CREATE USER {db_user} WITH PASSWORD '{db_password}';",
        f"ALTER ROLE {db_user} CREATEDB;",
        f"CREATE DATABASE {db_name} OWNER {db_user};",
        f"GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {db_user};",
    ]
    
    for cmd in sql_commands:
        try:
            process = subprocess.Popen(
                ["psql", "-U", "postgres", "-h", db_host, "-p", str(db_port)],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            stdout, stderr = process.communicate(input=cmd, timeout=10)
            
            if process.returncode != 0:
                if "already exists" in stderr:
                    print(f"⚠️  {cmd.split()[0]} - Already exists (skipping)")
                else:
                    print(f"❌ Error executing: {cmd}")
                    print(f"   {stderr}")
                    return False
            else:
                print(f"✅ {cmd.split()[0]} succeeded")
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    
    return True

def run_migrations(backend_path):
    """Run Alembic migrations"""
    print("\n📝 Running database migrations...")
    
    try:
        # Activate venv and run alembic
        venv_python = os.path.join(backend_path, "venv", "Scripts", "python.exe")
        
        if not os.path.exists(venv_python):
            print("❌ Virtual environment not found. Please create venv first.")
            return False
        
        result = subprocess.run(
            [venv_python, "-m", "alembic", "upgrade", "head"],
            cwd=backend_path,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            print("✅ Migrations completed successfully")
            return True
        else:
            print(f"❌ Migration failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error running migrations: {e}")
        return False

def main():
    print_banner("uni_Bond Database Setup")
    
    # Database configuration (should match .env file)
    DB_NAME = "uni_Bond"
    DB_USER = "uni_bond_user"
    DB_PASSWORD = "uni_bond_secure_password_2024"
    DB_HOST = "localhost"
    DB_PORT = "5432"
    
    # Check PostgreSQL
    print("🔍 Checking PostgreSQL installation...")
    if not check_postgres():
        print("❌ PostgreSQL is not installed or not accessible!")
        print("\n📥 Please install PostgreSQL from: https://www.postgresql.org/download/windows/")
        print("   OR ensure PostgreSQL service is running.")
        sys.exit(1)
    
    # Get authentication
    print("🔐 PostgreSQL Authentication Required")
    postgres_password = input("   Enter 'postgres' user password: ")
    
    # Create database
    backend_path = Path(__file__).parent
    
    if not create_database(DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, postgres_password):
        print("\n❌ Database setup failed!")
        sys.exit(1)
    
    # Run migrations
    if not run_migrations(str(backend_path)):
        print("\n❌ Migration setup failed!")
        print("You may need to run migrations manually:")
        print(f"   cd {backend_path}")
        print("   .\\venv\\Scripts\\activate.ps1")
        print("   alembic upgrade head")
        sys.exit(1)
    
    print_banner("✅ Setup Complete!")
    print("Your database is ready!")
    print(f"\nDatabase: {DB_NAME}")
    print(f"User: {DB_USER}")
    print(f"Connection: {DB_HOST}:{DB_PORT}")
    print("\nYou can now start the backend server!")

if __name__ == "__main__":
    main()
