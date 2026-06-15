# uni_Bond Architecture & Technology Stack

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│          TypeScript + React Router + Tailwind           │
│              Running on: localhost:5173                 │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTP/REST API Calls
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Backend (FastAPI + SQLAlchemy)              │
│           Running on: localhost:8000                    │
│                                                         │
│  ┌──────────────────────────────────────────────┐      │
│  │  FastAPI Routes                              │      │
│  │  - /api/users     (User Management)          │      │
│  │  - /api/posts     (Post Management)          │      │
│  │  - /api/auth      (Authentication/Login)     │      │
│  │  - /api/login     (JWT Authentication)       │      │
│  └──────────────┬───────────────────────────────┘      │
│                 │                                       │
│  ┌──────────────▼───────────────────────────────┐      │
│  │  SQLAlchemy ORM                              │      │
│  │  - Models (User, Post, PostMedia)            │      │
│  │  - Sessions & Dependency Injection           │      │
│  └──────────────┬───────────────────────────────┘      │
│                 │                                       │
└─────────────────┼───────────────────────────────────────┘
                  │
         PostgreSQL Connection
                  │
        ┌─────────▼──────────┐
        │   PostgreSQL DB    │
        │   (uni_Bond)       │
        │                    │
        │ Tables:            │
        │ - users            │
        │ - posts            │
        │ - post_media       │
        │ - migrations       │
        └────────────────────┘
```

## 📦 Backend Stack (FastAPI)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **API Framework** | FastAPI 0.134.0 | Modern async web framework |
| **Web Server** | Uvicorn 0.41.0 | ASGI server (production-ready) |
| **ORM** | SQLAlchemy 2.0.47 | Database abstraction layer |
| **Database** | PostgreSQL + psycopg2 | Relational database |
| **Migrations** | Alembic 1.18.4 | Database schema versioning |
| **Validation** | Pydantic 2.12.5 | Data validation & serialization |
| **Authentication** | JWT (python-jose) | Stateless authentication |
| **Security** | bcrypt, passlib | Password hashing & security |
| **Env Config** | python-dotenv | Environment variable management |

### Backend Project Structure

```
backend/
├── .env                        # Environment variables (git-ignored)
├── requirements.txt            # Python dependencies
├── venv/                       # Virtual environment
├── setup_database.py           # Database setup script
├── setup_database.bat          # Batch database setup
├── run_backend.bat/ps1         # Backend startup scripts
├── alembic/                    # Database migrations
│   ├── env.py                  # Alembic config
│   ├── script.py.mako          # Migration template
│   └── versions/               # Migration history
│       └── dc33989f3fe3_initial_migration.py
└── app/
    ├── main.py                 # FastAPI app entry point
    ├── core/
    │   └── config.py           # Settings (reads from .env)
    ├── db/
    │   ├── __init__.py
    │   ├── base.py             # Base model for all models
    │   └── database.py         # Database connection & session
    ├── models/                 # SQLAlchemy ORM models
    │   ├── __init__.py
    │   ├── user.py             # User model
    │   ├── post.py             # Post model
    │   └── post_media.py       # Post media/attachments
    ├── routers/                # API endpoints (RESTful routes)
    │   ├── login.py            # Authentication endpoints
    │   ├── user.py             # User CRUD operations
    │   └── post.py             # Post CRUD operations
    ├── schemas/                # Pydantic request/response models
    │   ├── login.py            # Auth schemas
    │   ├── user.py             # User DTOs
    │   └── post.py             # Post DTOs
    └── utils/
        ├── autho.py            # Authorization helpers
        └── security.py         # Security utilities

```

## 🎨 Frontend Stack (React + Vite)

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 19.2.0 | UI library |
| **Language** | TypeScript 5.9.3 | Type-safe JavaScript |
| **Build Tool** | Vite 7.3.1 | Ultra-fast build tool |
| **Routing** | React Router 7.13.1 | Client-side routing |
| **Styling** | Tailwind CSS 4.2.1 | Utility-first CSS framework |
| **Icons** | lucide-react 0.577.0 | Icon library |
| **Linting** | ESLint 9.39.1 | Code quality |

### Frontend Project Structure

```
frontend/uniBond_Frontend/
├── .env                        # API configuration
├── package.json                # Dependencies
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── index.html                  # Entry HTML
├── public/                     # Static assets
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Root component
│   ├── index.css               # Global styles
│   ├── App.css                 # App styles
│   ├── assets/                 # Images, fonts, etc.
│   ├── components/             # Reusable UI components
│   │   ├── Input.tsx           # Form input
│   │   ├── RoleSelector.tsx    # Role selection
│   │   ├── Select.tsx          # Dropdown component
│   │   ├── CommentList.tsx     # Comments display
│   │   ├── common/             # Shared components
│   │   │   ├── AppLogo.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── IconNavButton.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SectionCard.tsx
│   │   │   └── SidebarButton.tsx
│   │   ├── friend/             # Friend-related components
│   │   ├── layout/             # Layout components
│   │   ├── post/               # Post components
│   │   └── tasks/              # Task components
│   ├── pages/                  # Page components (route targets)
│   │   ├── admin/              # Admin panel pages
│   │   ├── auth/               # Login/Register pages
│   │   ├── classrooms/         # Classroom pages
│   │   ├── companies/          # Company pages
│   │   ├── groups/             # Group pages
│   │   ├── home/               # Home page
│   │   ├── kuppy/              # Kuppy pages
│   │   ├── notices/            # Notices pages
│   │   ├── notifications/      # Notifications pages
│   │   ├── professional-communication/
│   │   ├── profile/            # User profile pages
│   │   ├── search/             # Search results
│   │   └── tasks/              # Tasks pages
│   ├── routes/                 # Routing setup
│   │   ├── AdminRoute.tsx      # Admin-only route guard
│   │   ├── AppRoutes.tsx       # Main route definitions
│   │   ├── ProtectedRoute.tsx  # Authenticated route guard
│   │   └── PublicRoute.tsx     # Public route logic
│   ├── contexts/               # React contexts (global state)
│   │   └── AuthContext.tsx     # Authentication state
│   ├── services/               # API services
│   │   └── mock/               # Mock services for development
│   ├── controllers/            # Business logic controllers
│   │   ├── authController.ts
│   │   ├── postController.ts
│   │   ├── userController.ts
│   │   ├── friendController.ts
│   │   ├── groupController.ts
│   │   ├── classroomController.ts
│   │   ├── noticeController.ts
│   │   ├── notificationController.ts
│   │   ├── kuppyController.ts
│   │   ├── taskController.ts
│   │   └── searchController.ts
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.tsx         # Authentication hook
│   │   └── useAuthHook.ts      # Auth utility hook
│   ├── models/                 # Data models/types logic
│   │   ├── authModel.ts
│   │   ├── postModel.ts
│   │   ├── userModel.ts
│   │   ├── friendModel.ts
│   │   ├── noticeModel.ts
│   │   ├── notificationModel.ts
│   │   ├── searchModel.ts
│   │   └── kuppyModel.ts
│   ├── types/                  # TypeScript type definitions
│   │   ├── user.ts             # User types
│   │   ├── post.ts             # Post types
│   │   ├── classroom.ts
│   │   ├── group.ts
│   │   ├── friend.ts
│   │   ├── notice.ts
│   │   ├── notification.ts
│   │   ├── kuppy.ts
│   │   ├── search.ts
│   │   └── task.ts
│   └── utils/                  # Utility functions
│       ├── constants.ts        # App constants
│       ├── formatters.ts       # Data formatting
│       └── validators.ts       # Input validation
```

## 🔗 API Communication Flow

### Authentication Flow (JWT)
```
1. User submits credentials (email, password)
   POST /api/login
   
2. Backend validates & returns JWT token
   Response: { access_token, token_type }
   
3. Frontend stores token (localStorage)
   
4. Frontend includes token in requests
   Header: "Authorization: Bearer {token}"
   
5. Backend validates token middleware
   → Allows/denies request based on validation
```

### Data Flow Example (Post Creation)
```
1. Frontend collects data
   User fills post form → Data validated locally
   
2. Frontend sends request
   POST /api/posts
   Body: { title, content, category, ... }
   Header: Authorization: Bearer {token}
   
3. Backend receives request
   - Validates JWT token
   - Validates Pydantic schema
   - Creates model instance
   - Saves to database
   
4. Backend returns response
   Response: 201 Created { id, title, created_at, ... }
   
5. Frontend processes response
   Updates UI, shows success message
   Stores post data in state/context
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Posts Table
```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Post Media Table
```sql
CREATE TABLE post_media (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id),
    media_type VARCHAR(50) NOT NULL,  -- image, video, document
    media_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## 🔐 Security Features

- **JWT Authentication**: Token-based stateless auth
- **Password Hashing**: bcrypt with salt
- **CORS Protection**: Configurable allowed origins
- **SQL Injection Prevention**: SQLAlchemy parameterized queries
- **XSS Protection**: React auto-escaping, TypeScript types
- **HTTPS Ready**: Uvicorn supports SSL configuration
- **Environment Secrets**: Sensitive data in .env files

## 📡 API Endpoints (Examples)

```
Authentication:
  POST   /api/login              - User login
  POST   /api/register           - User registration (if enabled)
  POST   /api/logout             - User logout
  POST   /api/refresh-token      - Refresh JWT

Users:
  GET    /api/users              - List all users (admin)
  GET    /api/users/{id}         - Get user profile
  PUT    /api/users/{id}         - Update user profile
  DELETE /api/users/{id}         - Delete user (admin)

Posts:
  GET    /api/posts              - List all posts
  POST   /api/posts              - Create new post
  GET    /api/posts/{id}         - Get post details
  PUT    /api/posts/{id}         - Update post
  DELETE /api/posts/{id}         - Delete post

Posts Media:
  POST   /api/posts/{id}/media   - Upload file to post
  DELETE /api/posts/{id}/media   - Delete media
```

## 🚀 Performance Considerations

- **Frontend**: Vite provides instant HMR, code splitting
- **Backend**: FastAPI is async-by-default, fast startup
- **Database**: PostgreSQL with indexed queries
- **Caching**: Can be added via Redis if needed
- **API Optimization**: Pagination, filtering, field selection

## 📊 Development vs Production

### Development
- Debug mode enabled
- Hot reload (Frontend & Backend)
- CORS permissive
- Logging verbose

### Production
- Debug mode disabled
- Minified bundles
- CORS restricted
- Logging limited
- HTTPS enforced
- Database SSL connections

## 🛠️ Common Development Tasks

### Add a new API endpoint
1. Create Pydantic schema in `schemas/`
2. Create/update SQLAlchemy model in `models/`
3. Add route handler in `routers/`
4. Test with Swagger UI at `/docs`
5. Update frontend with new types in `types/`
6. Add controller in `controllers/`

### Add a new React page
1. Create component in `pages/{feature}/`
2. Define TypeScript types in `types/`
3. Create controller/service in `controllers/`
4. Add route in `AppRoutes.tsx`
5. Add navigation link in layout
6. Style with Tailwind CSS

### Database migration
1. Modify SQLAlchemy models
2. Create migration: `alembic revision --autogenerate -m "description"`
3. Review migration file
4. Apply: `alembic upgrade head`

---

**Happy coding! This architecture is scalable and production-ready. 🚀**
