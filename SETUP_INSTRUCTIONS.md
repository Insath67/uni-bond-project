# uni_Bond Full Stack Setup Guide

## 🚀 Prerequisites

### Required Software
1. **PostgreSQL** (v12 or higher) - Download from https://www.postgresql.org/download/windows/
2. **Python** (v3.8+) - Already on your system
3. **Node.js & npm** (v16+) - Download from https://nodejs.org/

## 📋 Installation Steps

### Step 1: Install PostgreSQL (If Not Already Installed)

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. **Remember the password you set for the `postgres` user** (Super important!)
4. Keep default settings:
   - Port: 5432
   - Locale: [Default]
5. After installation, PostgreSQL service should be running automatically

### Step 2: Verify PostgreSQL Installation

Open PowerShell and run:
```powershell
psql --version
```

### Step 3: Create Database and User

Navigate to the backend folder and run the setup script:

```powershell
cd backend
.\setup_database.bat
```

**Enter the postgres password when prompted.**

This will:
- Create database: `uni_Bond`
- Create user: `uni_bond_user`
- Set password: `uni_bond_secure_password_2024`
- Grant all permissions

### Step 4: Run Database Migrations

```powershell
cd backend
.\venv\Scripts\Activate.ps1
alembic upgrade head
```

### Step 5: Install Frontend Dependencies

```powershell
cd frontend/uniBond_Frontend
npm install
```

## 🏃 Running the Application

### Terminal 1: Start Backend Server

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

### Terminal 2: Start Frontend Dev Server

```powershell
cd frontend/uniBond_Frontend
npm run dev
```

Frontend will typically run on: http://localhost:5173

## ✅ Verify Everything Works

1. **Backend API**:
   - Visit http://localhost:8000/docs (Swagger UI)
   - Visit http://localhost:8000/ should show: `"message": "University Student Management System"`

2. **Frontend**:
   - Visit http://localhost:5173
   - Check browser console for no errors

3. **Database**:
   - Connect via: `psql -U uni_bond_user -d uni_Bond -h localhost`

## 🔧 Troubleshooting

### PostgreSQL Connection Error
- Verify PostgreSQL service is running
- Check SQL Server (Windows Services)
- Verify credentials in `.env` file

### Port Already in Use
- Backend port 8000: Change `--port 8001` in start command
- Frontend port 5173: Change in `vite.config.ts`

### Module Import Errors (Backend)
- Ensure virtual environment is activated
- Run: `pip install -r requirements.txt` again

### Node Modules Issues (Frontend)
- Delete `node_modules` folder
- Run: `npm install` again

## 📁 Project Structure

```
backend/
├── .env                 # Environment variables
├── venv/               # Virtual environment
├── app/
│   ├── main.py         # FastAPI entry point
│   ├── core/           # Config
│   ├── db/             # Database connection
│   ├── models/         # SQLAlchemy models
│   ├── routers/        # API endpoints
│   ├── schemas/        # Pydantic schemas
│   └── utils/          # Utilities
└── alembic/            # Database migrations

frontend/uniBond_Frontend/
├── src/
│   ├── pages/          # Page components
│   ├── components/     # Reusable components
│   ├── services/       # API services
│   ├── types/          # TypeScript types
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   └── routes/         # Route definitions
├── package.json        # Dependencies
└── vite.config.ts      # Vite configuration
```

## 🔐 Security Notes (Development Only)

⚠️ **These credentials are for development only!**

Update before production:
- Change `SECRET_KEY` in `.env`
- Change database password
- Enable HTTPS
- Setup proper CORS
- Add rate limiting
- Setup environment-specific configs

## 📞 Next Steps

1. Test API endpoints in Swagger UI
2. Verify database connection
3. Create admin user if needed
4. Test frontend authentication flow
5. Deploy when ready

---

**Happy coding! 🎉**
