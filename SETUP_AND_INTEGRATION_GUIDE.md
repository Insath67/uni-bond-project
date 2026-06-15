# Task Management & Opportunities System - Setup & Integration Guide

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- PostgreSQL 12+ (or SQLite for development)
- Git

### Backend Setup

#### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### 2. Configure Database
Update `app/core/config.py` with your database URL:
```python
DATABASE_URL = "postgresql://user:password@localhost/unibond"
# or for SQLite:
DATABASE_URL = "sqlite:///./test.db"
```

#### 3. Run Migrations
```bash
alembic upgrade head
```

#### 4. Start Backend Server
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

**API Documentation:** `http://localhost:8000/docs` (Swagger UI)

---

### Frontend Setup

#### 1. Install Dependencies
```bash
cd frontend/uniBond_Frontend
npm install
```

#### 2. Configure API URL
Create/update `.env.local`:
```env
VITE_API_URL=http://localhost:8000
```

#### 3. Start Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## Integration Checklist

### Backend Integration

- [x] Database models created (9 new tables)
- [x] Alembic migrations added
- [x] Pydantic schemas implemented
- [x] API routes created with full CRUD operations
- [x] Authentication & authorization implemented
- [x] Error handling & validation added
- [x] Main application updated with new routes

### Frontend Integration

- [x] API service client created (`opportunityController.ts`)
- [x] Company Dashboard component created
- [x] Student Dashboard component created
- [x] Opportunity Card component created
- [x] Application Form component created
- [x] Task Submission Form component created
- [x] Stylesheets created for all components
- [x] Responsive design implemented

### Documentation

- [x] API Documentation (`API_DOCUMENTATION.md`)
- [x] Frontend Documentation (`FRONTEND_DOCUMENTATION.md`)
- [x] Database Schema (`DATABASE_SCHEMA.md`)
- [x] Setup Guide (this file)

---

## Detailed Installation Steps

### Step 1: Backend Setup

```bash
# Clone repository
git clone <repo-url>
cd ITPM-Project-UNI-Bond/backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EOF

# Run migrations
alembic upgrade head

# Start server
python -m uvicorn app.main:app --reload
```

### Step 2: Frontend Setup

```bash
# Navigate to frontend
cd ../frontend/uniBond_Frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
VITE_API_URL=http://localhost:8000
EOF

# Start development server
npm run dev
```

### Step 3: Verify Installation

**Backend:**
- Visit `http://localhost:8000/health` → Should return `{"status": "healthy"}`
- Visit `http://localhost:8000/docs` → Should show Swagger UI

**Frontend:**
- Visit `http://localhost:5173` → Should show login page
- Network tab should show API calls to `http://localhost:8000`

---

## Running Database Migrations

### Create New Migration

```bash
# Generate migration after model changes
alembic revision --autogenerate -m "Migration description"

# Review generated migration file in backend/alembic/versions/

# Apply migration
alembic upgrade head
```

### Rollback Migration

```bash
# Downgrade by one revision
alembic downgrade -1

# Or downgrade to specific revision
alembic downgrade <revision-id>
```

---

## Component Integration in Your Application

### 1. Adding CompanyDashboard to Routes

**In `frontend/uniBond_Frontend/src/routes/index.tsx`:**

```tsx
import CompanyDashboard from '@/components/CompanyDashboard';
import { UserRole } from '@/types/auth';

export const companyDashboardRoute = {
  path: '/company/dashboard',
  element: <CompanyDashboard />,
  protected: true,
  requiredRole: UserRole.company_admin,
};
```

### 2. Adding StudentDashboard to Routes

**In `frontend/uniBond_Frontend/src/routes/index.tsx`:**

```tsx
import StudentDashboard from '@/components/StudentDashboard';
import { UserRole } from '@/types/auth';

export const studentDashboardRoute = {
  path: '/student/dashboard',
  element: <StudentDashboard />,
  protected: true,
  requiredRole: UserRole.student,
};
```

### 3. Adding Opportunities Page

**Create `frontend/uniBond_Frontend/src/pages/Opportunities.tsx`:**

```tsx
import React, { useState, useEffect } from 'react';
import OpportunityCard from '@/components/OpportunityCard';
import ApplicationForm from '@/components/ApplicationForm';
import { opportunityService } from '@/controllers/opportunityController';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const response = await opportunityService.getOpportunities(0, 20);
      setOpportunities(response.data);
    } catch (error) {
      console.error('Failed to fetch opportunities', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading opportunities...</div>;

  return (
    <div className="opportunities-page">
      <h1>Available Opportunities</h1>
      
      {showForm && selectedOpp && (
        <ApplicationForm
          opportunityId={selectedOpp.id}
          opportunityTitle={selectedOpp.title}
          onSuccess={() => {
            setShowForm(false);
            fetchOpportunities();
          }}
          onClose={() => setShowForm(false)}
        />
      )}

      <div className="opportunities-grid">
        {opportunities.map((opp) => (
          <OpportunityCard
            key={opp.id}
            {...opp}
            onApply={(id) => {
              setSelectedOpp(opportunities.find(o => o.id === id));
              setShowForm(true);
            }}
            onView={(id) => {
              // Navigate to opportunity detail page
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

### 4. Adding Backend Routes to Main App

The opportunity router is already included in `app/main.py`. Just ensure it's imported:

```python
from app.routers import opportunity

app.include_router(opportunity.router)
```

---

## API Endpoint Usage Examples

### Create Opportunity (Company)

```bash
curl -X POST "http://localhost:8000/opportunities/" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Developer",
    "description": "Looking for experienced developer",
    "opportunity_type": "full_time",
    "location": "New York",
    "salary_min": 80000,
    "salary_max": 120000,
    "max_applicants": 50
  }'
```

### Apply for Opportunity (Student)

```bash
curl -X POST "http://localhost:8000/opportunities/applications" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "opportunity_id": 1,
    "cover_letter": "I am interested in this position...",
    "resume_url": "https://drive.google.com/..."
  }'
```

### Get Company Dashboard

```bash
curl -X GET "http://localhost:8000/opportunities/dashboard/company" \
  -H "Authorization: Bearer {token}"
```

### Get Student Dashboard

```bash
curl -X GET "http://localhost:8000/opportunities/dashboard/student" \
  -H "Authorization: Bearer {token}"
```

---

## Testing the System

### 1. Manual Testing

**Create Test Users:**
```bash
# Company Admin
POST /users/
{
  "first_name": "John",
  "last_name": "Doe",
  "username": "company_admin",
  "email": "admin@company.com",
  "password": "password123",
  "role": "company_admin"
}

# Student
POST /users/
{
  "first_name": "Jane",
  "last_name": "Smith",
  "username": "student1",
  "email": "student@university.edu",
  "password": "password123",
  "role": "student"
}
```

**Test Workflow:**

1. **Company Admin:**
   - Create Profile → POST `/opportunities/profiles/company`
   - Create Opportunity → POST `/opportunities/`
   - View Dashboard → GET `/opportunities/dashboard/company`
   - View Applications → GET `/opportunities/applications/{opportunity_id}`

2. **Student:**
   - Create Profile → POST `/opportunities/profiles/student`
   - Get Opportunities → GET `/opportunities/`
   - Apply → POST `/opportunities/applications`
   - View Dashboard → GET `/opportunities/dashboard/student`

---

## Troubleshooting

### Backend Issues

**Database Connection Error:**
```bash
# Check database URL in config
# Ensure database server is running
# Reset database: alembic downgrade base -> alembic upgrade head
```

**Migration Failed:**
```bash
# View migration status
alembic current

# Check migration history
alembic history

# Downgrade and retry
alembic downgrade -1
alembic upgrade head
```

### Frontend Issues

**API Not Responding:**
- Check backend is running on port 8000
- Verify VITE_API_URL in .env.local
- Check browser console for CORS errors

**Components Not Loading:**
- Verify imports are correct
- Check CSS files are in right location
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

---

## Production Deployment

### Backend Deployment

1. **Use Production Database:**
   ```python
   DATABASE_URL = "postgresql://user:pass@prod-db:5432/unibond"
   ```

2. **Set Environment Variables:**
   ```bash
   SECRET_KEY=<random-secret-key>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

3. **Run Migrations:**
   ```bash
   alembic upgrade head
   ```

4. **Start with Gunicorn:**
   ```bash
   gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
   ```

### Frontend Deployment

1. **Build for Production:**
   ```bash
   npm run build
   ```

2. **Deploy Build Artifacts:**
   - Upload `dist/` folder to static hosting (CDN, S3, etc.)
   - Configure API URL for production environment

---

## Monitoring & Logging

### Backend Logging

Add logging to track operations:

```python
import logging

logger = logging.getLogger(__name__)

@router.post("/opportunities/")
def create_opportunity(...):
    logger.info(f"Creating opportunity: {opportunity.title}")
    # ...
    logger.info(f"Opportunity created with ID: {new_opportunity.id}")
```

### Frontend Logging

Use browser console and error tracking service:

```typescript
// React Error Boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Frontend Error:', error, errorInfo);
    // Send to error tracking service
  }
}
```

---

## Performance Optimization

### Backend
- Implement caching with Redis
- Add pagination to all list endpoints
- Optimize database queries with SELECT specific columns
- Use database connection pooling

### Frontend
- Lazy load routes
- Memoize expensive components
- Implement infinite scroll for lists
- Optimize images and assets

---

## Security Best Practices

1. **API Security:**
   - Use HTTPS in production
   - Implement rate limiting
   - Add CSRF protection
   - Validate all inputs

2. **Frontend Security:**
   - Sanitize user input
   - Store tokens securely (httpOnly cookies)
   - Implement CORS properly
   - Use Content Security Policy headers

3. **Database Security:**
   - Use parameterized queries (SQLAlchemy does this)
   - Regular backups
   - Restrict database access
   - Encrypt sensitive data

---

## Next Steps

1. **Configure your preferred database** (PostgreSQL recommended)
2. **Run the migration** to create all tables
3. **Start both backend and frontend** servers
4. **Test the basic workflows**
5. **Customize styles** to match your branding
6. **Deploy to production** when ready

---

## Support & Resources

- **API Docs:** `http://localhost:8000/docs`
- **API Documentation:** See `API_DOCUMENTATION.md`
- **Frontend Documentation:** See `FRONTEND_DOCUMENTATION.md`
- **Database Schema:** See `DATABASE_SCHEMA.md`
- **Issues:** Check troubleshooting section or create GitHub issue

---

## Version History

- **v1.0.0** (2026-04-03): Initial release with complete opportunities and tasks system

---

For any questions or issues, contact the development team.
