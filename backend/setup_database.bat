@echo off
REM PostgreSQL Database Setup Script for uni_Bond Application
REM This script creates the database and user for the uni_Bond application

REM Note: PostgreSQL must be installed and the postgres user password must be known
REM Default PostgreSQL usually runs on localhost:5432

echo.
echo ===============================================
echo  uni_Bond Database Setup Script
echo ===============================================
echo.

REM Set variables (adjust if using different credentials)
set DB_NAME=uni_Bond
set DB_USER=uni_bond_user
set DB_PASSWORD=uni_bond_secure_password_2024
set DB_HOST=localhost
set DB_PORT=5432
set POSTGRES_USER=postgres

REM Create the database and user
echo Creating database '%DB_NAME%' and user '%DB_USER%'...
echo.

REM Connect as postgres user and create database, user, and grant permissions
psql -U %POSTGRES_USER% -h %DB_HOST% -p %DB_PORT% ^
  -c "CREATE USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%';" ^
  -c "CREATE DATABASE %DB_NAME% OWNER %DB_USER%;" ^
  -c "GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%;" ^
  -c "ALTER DATABASE %DB_NAME% OWNER TO %DB_USER%;"

echo.
echo ===============================================
echo  Setup Complete!
echo ===============================================
echo Database: %DB_NAME%
echo User: %DB_USER%
echo Host: %DB_HOST%
echo Port: %DB_PORT%
echo ===============================================
echo.

pause
