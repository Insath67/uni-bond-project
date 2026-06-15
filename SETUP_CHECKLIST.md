# ✅ uni_Bond Development Setup Checklist

## Pre-Development Checklist

### System Requirements
- [ ] Windows 10/11 with PowerShell 5.0+
- [ ] Python 3.8+ installed
- [ ] Node.js v16+ installed
- [ ] PostgreSQL 12+ installed
- [ ] 2GB+ free disk space
- [ ] Stable internet connection

---

## Installation Checklist

### Backend Setup
- [x] Python virtual environment created (`backend/venv/`)
- [x] Backend dependencies installed (30+ packages)
- [x] `.env` file created with database credentials
- [x] FastAPI framework installed
- [x] SQLAlchemy ORM installed
- [x] PostgreSQL driver (psycopg2) installed
- [x] JWT authentication libraries installed
- [x] Alembic migration tool installed

### Frontend Setup
- [x] npm packages installed (203 packages)
- [x] React 19.2.0 ready
- [x] TypeScript 5.9.3 configured
- [x] Vite build tool ready
- [x] React Router setup
- [x] Tailwind CSS configured
- [x] ESLint configured
- [ ] `.env` file created ✅

### Database Setup
- [ ] PostgreSQL installed
- [ ] PostgreSQL service running
- [ ] Database `uni_Bond` created
- [ ] User `uni_bond_user` created with password
- [ ] Permissions granted to user
- [ ] Database connection tested

### Configuration Files
- [x] `backend/.env` - Created with all required variables
- [x] `frontend/.env` - Created with API configuration
- [ ] Review and update if needed

---

## Getting Started: Step-by-Step Checklist

### First Time Setup
- [ ] **Step 1**: Open PowerShell terminal
- [ ] **Step 2**: Install PostgreSQL (if not done)
- [ ] **Step 3**: Run database setup script
  ```powershell
  cd backend
  python setup_database.py
  ```
- [ ] **Step 4**: Verify everything is configured
  ```powershell
  python backend/validate_setup.py
  ```

### Running the Application
- [ ] **Terminal 1**: Start Backend Server
  ```powershell
  cd backend
  .\venv\Scripts\Activate.ps1
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
  ```
  - [ ] Check for: `Application startup complete`

- [ ] **Terminal 2**: Start Frontend Server
  ```powershell
  cd frontend/uniBond_Frontend
  npm run dev
  ```
  - [ ] Check for: `Local: http://localhost:5173/`

### Testing & Verification
- [ ] **Backend API Test**
  - [ ] Visit http://localhost:8000/
  - [ ] Verify: See `"message": "University Student Management System"`

- [ ] **API Documentation Test**
  - [ ] Visit http://localhost:8000/docs
  - [ ] Verify: See Swagger UI with all endpoints

- [ ] **Frontend Test**
  - [ ] Visit http://localhost:5173
  - [ ] Verify: React app loads without errors
  - [ ] Check browser console (F12) for any errors

- [ ] **Database Connection Test**
  ```powershell
  psql -U uni_bond_user -d uni_Bond -h localhost -W
  # Enter password: uni_bond_secure_password_2024
  ```
  - [ ] Successfully connected to database

---

## Development Setup Checklist

### IDE & Tools
- [ ] VS Code installed
- [ ] Python extension installed
- [ ] ESLint extension installed
- [ ] Prettier extension installed
- [ ] REST Client extension (for API testing)
- [ ] Postman or Insomnia installed (optional)

### Project Structure Verified
- [ ] Backend routes organized (`backend/app/routers/`)
- [ ] Frontend components organized (`frontend/src/components/`)
- [ ] Database models created (`backend/app/models/`)
- [ ] TypeScript types defined (`frontend/src/types/`)
- [ ] API schemas defined (`backend/app/schemas/`)

### Git Configuration (if using git)
- [ ] `.gitignore` includes `venv/`, `node_modules/`, `.env`
- [ ] `.env` files are NOT tracked
- [ ] Initial commit made
- [ ] Feature branch created

---

## Features & Functionality Checklist

### Available Endpoints
- [ ] GET `/` - Root endpoint
- [ ] GET `/docs` - Swagger UI
- [ ] GET `/redoc` - ReDoc documentation
- [ ] POST `/api/login` - User authentication
- [ ] GET/POST/PUT/DELETE `/api/users` - User management
- [ ] GET/POST/PUT/DELETE `/api/posts` - Post management
- [ ] POST `/api/posts/{id}/media` - Media upload (if implemented)

### Authentication
- [ ] JWT token generation working
- [ ] Token validation working
- [ ] User registration implemented
- [ ] Password hashing implemented (bcrypt)
- [ ] Token expiration configured

### Database Features
- [ ] User table created
- [ ] Post table created
- [ ] PostMedia table created (if needed)
- [ ] Migrations version tracked
- [ ] Foreign keys configured
- [ ] Indexes created for performance

---

## Documentation Checklist

- [x] `README.md` - Project overview
- [x] `QUICK_START_GUIDE.md` - This checklist & quick start
- [x] `SETUP_INSTRUCTIONS.md` - Detailed setup instructions
- [x] `ARCHITECTURE.md` - Architecture & tech stack overview
- [x] `QUICK_REFERENCE.md` - Commands & troubleshooting
- [ ] Code comments in critical sections
- [ ] Function docstrings added
- [ ] API endpoint documentation

---

## Before Development Starts

### Code Quality
- [ ] ESLint is passing
- [ ] No TypeScript errors
- [ ] No import warnings
- [ ] Code follows project conventions
- [ ] Git pre-commit hooks configured (optional)

### Performance
- [ ] Database queries optimized
- [ ] API response times acceptable
- [ ] Frontend build time acceptable
- [ ] No console errors/warnings

### Security
- [ ] Secrets not in version control
- [ ] `.env` file in `.gitignore`
- [ ] CORS configured correctly
- [ ] Input validation implemented
- [ ] SQL injection prevention (SQLAlchemy prevents this)

---

## Ongoing Development Checklist

### Daily Routine
- [ ] Start backend server
- [ ] Start frontend server
- [ ] Verify no connection errors
- [ ] Check for TypeScript errors
- [ ] Run ESLint
- [ ] Test new features

### Every Few Days
- [ ] Commit code to git
- [ ] Run full test suite (if exists)
- [ ] Check for dependency updates
- [ ] Review code changes

### Before Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] Security review done
- [ ] Environment variables configured
- [ ] Database backups created
- [ ] Performance acceptable
- [ ] Documentation updated

---

## Troubleshooting Checklist

### If Backend Won't Start
- [ ] Is virtual environment activated? `.\venv\Scripts\Activate.ps1`
- [ ] Are all dependencies installed? `pip install -r requirements.txt`
- [ ] Is `.env` file present with all variables?
- [ ] Is PostgreSQL running and database created?
- [ ] Is port 8000 free? 
- [ ] Run: `python backend/validate_setup.py`

### If Frontend Won't Start
- [ ] Are node_modules installed? `npm install`
- [ ] Is Node.js v16+ installed? `node -v`
- [ ] Is port 5173 free?
- [ ] Is TypeScript compiled? `npm run build`
- [ ] Check console for specific errors

### If Database Connection Fails
- [ ] Is PostgreSQL running? (Check Services)
- [ ] Are credentials in `.env` correct?
- [ ] Is database created? `python backend/setup_database.py`
- [ ] Can you connect manually? `psql -U uni_bond_user -d uni_Bond`
- [ ] Run: `test_db_connection()` in backend

### If API Returns Errors
- [ ] Check backend console for error messages
- [ ] Verify request format matches schema
- [ ] Check auth token is valid
- [ ] Try endpoint in Swagger UI (`/docs`)
- [ ] Check database has required tables

---

## Resources & Documentation Map

| Need | File | Location |
|------|------|----------|
| Quick start | `QUICK_START_GUIDE.md` | Project root |
| Detailed setup | `SETUP_INSTRUCTIONS.md` | Project root |
| Tech stack info | `ARCHITECTURE.md` | Project root |
| Commands | `QUICK_REFERENCE.md` | Project root |
| This checklist | `SETUP_CHECKLIST.md` | Project root |
| Backend config | `.env` | `backend/` |
| Frontend config | `.env` | `frontend/uniBond_Frontend/` |
| API docs | Swagger UI | http://localhost:8000/docs |
| Code structure | Various | See ARCHITECTURE.md |

---

## Success Indicators ✨

You'll know everything is working when:

✅ Backend server starts without errors  
✅ Frontend dev server starts without errors  
✅ http://localhost:5173 loads in browser  
✅ http://localhost:8000/docs shows Swagger UI  
✅ No errors in browser console (F12)  
✅ No errors in terminal output  
✅ API endpoints respond with correct data  
✅ Database connection established  

---

## Next Steps After Setup

1. **Explore the codebase** - Understand current structure
2. **Read ARCHITECTURE.md** - Understand tech stack
3. **Test API endpoints** - Use Swagger UI
4. **Create a new feature** - Apply what you learned
5. **Write documentation** - Document your changes
6. **Commit to git** - Save your work
7. **Deploy** - When ready for production

---

## Questions or Issues?

1. Check `QUICK_REFERENCE.md` - Troubleshooting section
2. Review `SETUP_INSTRUCTIONS.md` - Detailed setup help
3. Run validation: `python backend/validate_setup.py`
4. Check error messages in console carefully
5. Google the error message
6. Ask team lead or check project docs

---

## Final Checklist

- [ ] Read this entire checklist
- [ ] Complete all "Installation Checklist" items
- [ ] Complete "Getting Started: Step-by-Step" items
- [ ] Verify all "Testing & Verification" items pass
- [ ] Run `python backend/validate_setup.py` - All green? ✅
- [ ] Both servers running without errors? ✅
- [ ] Ready to start development? ✅

---

**Status**: ✅ READY FOR DEVELOPMENT

**Setup Completed**: April 2026  
**Last Updated**: April 2026  
**Version**: 1.0

📚 **For help, refer to the documentation files in the project root!**

---

*Happy Coding! 🚀*
