# uni_Bond Quick Reference Guide

## 🚀 Quick Start

### Windows (Recommended)
```batch
REM Run from project root
setup_all.bat
```

### Manual Setup
```batch
REM Backend
cd backend
python -m venv venv
.\venv\Scripts\activate.bat
pip install -r requirements.txt
python setup_database.py
.\run_backend.bat

REM Frontend (new terminal)
cd frontend
.\run_frontend.bat
```

---

## 📚 Common Commands

### Backend Commands

**Start Development Server**
```powershell
cd backend
.\venv\Scripts\activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**View API Documentation**
- Browser: http://localhost:8000/docs
- Or: http://localhost:8000/redoc

**Database Migrations**
```powershell
# Create database
python setup_database.py

# Create new migration
alembic revision --autogenerate -m "description of change"

# View migrations
alembic history

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1  # or specific revision
```

**Database Access**
```bash
# Connect to database directly
psql -U uni_bond_user -d uni_Bond -h localhost

# Common PostgreSQL commands
\dt                  # List tables
\d table_name        # Describe table
SELECT * FROM users; # Query data
\q                   # Exit
```

### Frontend Commands

**Start Dev Server**
```powershell
cd frontend\uniBond_Frontend
npm run dev
```

**Build for Production**
```powershell
npm run build
```

**Run Linter**
```powershell
npm run lint
```

**Preview Production Build**
```powershell
npm run preview
```

---

## 🔧 Environment Configuration

### Backend (.env file)
```env
DATABASE_HOSTNAME=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=uni_bond_user
DATABASE_PASSWORD=uni_bond_secure_password_2024
DATABASE_NAME=uni_Bond
SECRET_KEY=long-random-string-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
```

### Frontend (.env file)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_ENV=development
VITE_DEBUG=true
```

---

## 🐛 Troubleshooting

### Backend Issues

**"ModuleNotFoundError: No module named 'fastapi'"**
- Solution: Activate virtual environment
  ```powershell
  .\venv\Scripts\activate.ps1
  ```

**"Connection refused" (Database)**
- Check PostgreSQL is running (Windows Services)
- Verify credentials in .env match your PostgreSQL setup
- Test connection: `psql -U uni_bond_user -d uni_Bond`

**"Address already in use" (Port 8000)**
- Option 1: Kill process using port 8000
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process
  ```
- Option 2: Use different port
  ```powershell
  uvicorn app.main:app --port 8001
  ```

**"ImportError: No module named 'app'"**
- Make sure you're in the `backend/` directory
- Or add to PYTHONPATH:
  ```powershell
  $env:PYTHONPATH = "$PWD"
  ```

### Frontend Issues

**"npm: command not found"**
- Install Node.js from https://nodejs.org/

**"Port 5173 already in use"**
- Kill process: `Get-Process node | Stop-Process`
- Or use: `npm run dev -- --port 5174`

**"Module not found" errors**
- Delete node_modules: `rmdir /s node_modules`
- Reinstall: `npm install`

**TypeScript errors**
- Clear cache: `rmdir /s dist`
- Rebuild: `npm run build`

### Database Issues

**"FATAL: Ident authentication failed"**
- Solution: Authenticate with password
  ```bash
  psql -U uni_bond_user -d uni_Bond -h localhost -W
  ```

**"Database 'uni_Bond' does not exist"**
- Create database: `python backend/setup_database.py`

**Migrations not applying**
- Check migration files in `backend/alembic/versions/`
- Run: `alembic current` to see current version
- Debug: `alembic history`

---

## 📱 Testing API Endpoints

### Using Swagger UI (Recommended)
1. Start backend: `uvicorn app.main:app --reload`
2. Open: http://localhost:8000/docs
3. Try it out! (Interactive interface)

### Using cURL
```bash
# Login
curl -X POST "http://localhost:8000/api/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Create Post (with JWT token)
curl -X POST "http://localhost:8000/api/posts" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Post","content":"Content here"}'

# Get Posts
curl "http://localhost:8000/api/posts"
```

### Using Postman
1. Import API from http://localhost:8000/openapi.json
2. Set up environment variables for token
3. Create request collections
4. Test all endpoints

### Using Python Requests
```python
import requests

# Base URL
BASE_URL = "http://localhost:8000"

# Login
response = requests.post(f"{BASE_URL}/api/login", json={
    "email": "user@example.com",
    "password": "password"
})
token = response.json()["access_token"]

# Create post
headers = {"Authorization": f"Bearer {token}"}
response = requests.post(f"{BASE_URL}/api/posts", 
    json={"title": "Test", "content": "Test content"},
    headers=headers
)
print(response.json())
```

---

## 📊 Project Statistics

| Aspect | Details |
|--------|---------|
| **Backend Language** | Python 3.8+ |
| **Backend Framework** | FastAPI |
| **Database** | PostgreSQL |
| **Frontend Language** | TypeScript + React |
| **Frontend Build Tool** | Vite |
| **CSS Framework** | Tailwind CSS |
| **Authentication** | JWT |
| **API Style** | RESTful |
| **Total Dependencies** | 30+ (backend), 10+ (frontend) |

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Update `SECRET_KEY` in .env (generate new random key)
- [ ] Change database password
- [ ] Set `DEBUG=False`
- [ ] Configure CORS for production domain
- [ ] Set up SSL/HTTPS certificate
- [ ] Configure production database
- [ ] Review all environment variables
- [ ] Run security checks
- [ ] Set up logging/monitoring
- [ ] Create database backups
- [ ] Test all endpoints
- [ ] Load test the application
- [ ] Set up CI/CD pipeline

---

## 📖 Documentation Links

- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **SQLAlchemy**: https://docs.sqlalchemy.org/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/
- **Vite**: https://vitejs.dev/
- **Pydantic**: https://docs.pydantic.dev/

---

## 💡 Pro Tips

1. **Use Swagger UI** for quick API testing during development
2. **Enable hot reload** for faster development
3. **Use Git branches** for features
4. **Write tests** for critical paths
5. **Monitor logs** for debugging
6. **Use environment variables** for secrets
7. **Version your API** (e.g., /api/v1/)
8. **Document your endpoints** in code comments
9. **Use database indexes** for performance
10. **Backup your database** regularly

---

## 🆘 Getting Help

1. Check this guide first
2. Read SETUP_INSTRUCTIONS.md
3. Review ARCHITECTURE.md
4. Check error messages in console
5. Google the error message
6. Check GitHub issues/Stack Overflow
7. Ask in project team chat

---

**Last Updated**: April 2026  
**Version**: 1.0
