# Task Management & Opportunities System - API Documentation

## Overview

This document provides comprehensive API reference for the Task Management and Opportunities system. The API is built with FastAPI and provides endpoints for managing opportunities, tasks, applications, submissions, and notifications.

## Base URL

```
http://localhost:8000
```

## Authentication

All endpoints (except user registration) require a Bearer token in the Authorization header:

```
Authorization: Bearer {token}
```

## Response Format

All responses are in JSON format with the following structure:

**Success Response:**
```json
{
  "id": 1,
  "field": "value",
  ...
}
```

**Error Response:**
```json
{
  "detail": "Error message"
}
```

---

## Endpoints

### Opportunities

#### Create Opportunity
- **POST** `/opportunities/`
- **Auth:** Required (Company Admin only)
- **Request Body:**
```json
{
  "title": "Senior Developer",
  "description": "We are looking for...",
  "opportunity_type": "full_time",
  "location": "New York",
  "salary_min": 80000,
  "salary_max": 120000,
  "requirements": "5+ years experience...",
  "max_applicants": 50,
  "deadline": "2026-05-31T23:59:59Z"
}
```
- **Response:** 201 Created - Opportunity object

#### Get All Opportunities
- **GET** `/opportunities/?skip=0&limit=10&status_filter=active`
- **Auth:** Required
- **Query Parameters:**
  - `skip` (int): Number of items to skip (default: 0)
  - `limit` (int): Number of items to return (default: 10)
  - `status_filter` (string): Filter by status (active, draft, closed, completed)
- **Response:** 200 OK - List of Opportunity objects

#### Get Opportunity by ID
- **GET** `/opportunities/{opportunity_id}`
- **Auth:** Required
- **Response:** 200 OK - Opportunity object

#### Update Opportunity
- **PUT** `/opportunities/{opportunity_id}`
- **Auth:** Required (Owner only)
- **Request Body:** (Same as Create, all fields optional)
- **Response:** 200 OK - Updated Opportunity object

#### Delete Opportunity
- **DELETE** `/opportunities/{opportunity_id}`
- **Auth:** Required (Owner only)
- **Response:** 204 No Content

---

### Tasks

#### Create Task
- **POST** `/opportunities/{opportunity_id}/tasks`
- **Auth:** Required (Company owner only)
- **Request Body:**
```json
{
  "title": "Phase 1: Setup",
  "description": "Setup project infrastructure...",
  "stage": "development"
}
```
- **Response:** 201 Created - Task object

#### Get Tasks for Opportunity
- **GET** `/opportunities/{opportunity_id}/tasks`
- **Auth:** Required
- **Response:** 200 OK - List of Task objects

#### Update Task
- **PUT** `/opportunities/tasks/{task_id}`
- **Auth:** Required (Company owner only)
- **Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in_progress",
  "stage": "testing"
}
```
- **Response:** 200 OK - Updated Task object

---

### Applications

#### Apply for Opportunity
- **POST** `/opportunities/applications`
- **Auth:** Required
- **Request Body:**
```json
{
  "opportunity_id": 1,
  "cover_letter": "I am interested in this opportunity because...",
  "resume_url": "https://drive.google.com/file/d/..."
}
```
- **Response:** 201 Created - TaskApplication object

#### Get Applications for Opportunity
- **GET** `/opportunities/applications/{opportunity_id}`
- **Auth:** Required (Company owner only)
- **Response:** 200 OK - List of TaskApplication objects

#### Update Application Status
- **PUT** `/opportunities/applications/{application_id}`
- **Auth:** Required (Company owner only)
- **Request Body:**
```json
{
  "status": "shortlisted"
}
```
- **Status Values:** `applied`, `shortlisted`, `rejected`, `accepted`, `completed`
- **Response:** 200 OK - Updated TaskApplication object

---

### Submissions

#### Submit Task
- **POST** `/opportunities/submissions`
- **Auth:** Required
- **Request Body:**
```json
{
  "task_id": 1,
  "submission_text": "Here is my solution...",
  "submission_url": "https://github.com/user/project"
}
```
- **Response:** 201 Created - TaskSubmission object

#### Get Task Submissions
- **GET** `/opportunities/submissions/task/{task_id}`
- **Auth:** Required
- **Response:** 200 OK - List of TaskSubmission objects

#### Update Submission
- **PUT** `/opportunities/submissions/{submission_id}`
- **Auth:** Required
- **Request Body:**
```json
{
  "status": "approved",
  "feedback": "Great work! Minor improvements needed..."
}
```
- **Response:** 200 OK - Updated TaskSubmission object

---

### Notifications

#### Get Notifications
- **GET** `/opportunities/notifications?skip=0&limit=20&unread_only=false`
- **Auth:** Required
- **Query Parameters:**
  - `skip` (int): Number of items to skip
  - `limit` (int): Number of items to return
  - `unread_only` (bool): Only unread notifications
- **Response:** 200 OK - List of Notification objects

#### Mark Notification as Read
- **PUT** `/opportunities/notifications/{notification_id}`
- **Auth:** Required
- **Response:** 200 OK - Updated Notification object

#### Mark All Notifications as Read
- **PUT** `/opportunities/notifications/read-all`
- **Auth:** Required
- **Response:** 204 No Content

---

### Dashboard

#### Company Dashboard
- **GET** `/opportunities/dashboard/company`
- **Auth:** Required (Company Admin only)
- **Response:** 200 OK
```json
{
  "stats": {
    "total_posted": 5,
    "active_opportunities": 3,
    "staged_tasks": 2,
    "total_applicants_reached": 45
  },
  "opportunities": [...],
  "recent_applications": [...]
}
```

#### Student Dashboard
- **GET** `/opportunities/dashboard/student`
- **Auth:** Required
- **Response:** 200 OK
```json
{
  "submitted_tasks": [...],
  "applied_opportunities": [...],
  "notifications": [...]
}
```

---

### Profiles

#### Create Company Profile
- **POST** `/opportunities/profiles/company`
- **Auth:** Required (Company Admin only)
- **Request Body:**
```json
{
  "company_name": "Tech Corp",
  "company_description": "Leading tech company...",
  "industry": "Information Technology",
  "website": "https://techcorp.com",
  "phone": "+1-555-0000",
  "address": "123 Tech Street",
  "city": "Silicon Valley",
  "country": "USA",
  "logo_url": "https://...",
  "established_year": 2010,
  "total_employees": 500
}
```
- **Response:** 201 Created - CompanyProfile object

#### Get Company Profile
- **GET** `/opportunities/profiles/company/{company_id}`
- **Auth:** Required
- **Response:** 200 OK - CompanyProfile object

#### Update Company Profile
- **PUT** `/opportunities/profiles/company`
- **Auth:** Required (Owner only)
- **Request Body:** (Same as Create, all fields optional)
- **Response:** 200 OK - Updated CompanyProfile object

#### Create Student Profile
- **POST** `/opportunities/profiles/student`
- **Auth:** Required
- **Request Body:**
```json
{
  "bio": "Computer Science student...",
  "skills": "JavaScript,Python,React,Node.js",
  "experience_level": "intermediate",
  "portfolio_url": "https://myportfolio.com",
  "github_url": "https://github.com/user",
  "linkedin_url": "https://linkedin.com/in/user",
  "profile_picture_url": "https://...",
  "preferred_work_type": "freelance",
  "available_from": "2026-06-01T00:00:00Z"
}
```
- **Response:** 201 Created - StudentProfile object

#### Get Student Profile
- **GET** `/opportunities/profiles/student/{student_id}`
- **Auth:** Required
- **Response:** 200 OK - StudentProfile object

#### Update Student Profile
- **PUT** `/opportunities/profiles/student`
- **Auth:** Required (Owner only)
- **Request Body:** (Same as Create, all fields optional)
- **Response:** 200 OK - Updated StudentProfile object

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |

---

## Enums

### OpportunityType
- `internship`
- `freelance`
- `part_time`
- `full_time`
- `project`
- `task`

### OpportunityStatus
- `draft`
- `active`
- `closed`
- `completed`

### ApplicationStatus
- `applied`
- `shortlisted`
- `rejected`
- `accepted`
- `completed`

### TaskStatus
- `pending`
- `in_progress`
- `submitted`
- `reviewed`
- `approved`
- `rejected`
- `completed`

### NotificationType
- `application_received`
- `application_status`
- `task_assigned`
- `submission_received`
- `feedback_provided`

---

## Rate Limiting

Currently no rate limiting is implemented. Future versions may include rate limiting per user/IP.

---

## Pagination

Use `skip` and `limit` query parameters for pagination:

```
GET /opportunities/?skip=0&limit=10
GET /opportunities/?skip=10&limit=10
```

---

## Example Workflows

### Student Applying for Opportunity

1. **Get available opportunities**
   ```
   GET /opportunities/?status_filter=active
   ```

2. **Get opportunity details**
   ```
   GET /opportunities/1
   ```

3. **Create student profile** (if not exists)
   ```
   POST /opportunities/profiles/student
   ```

4. **Apply for opportunity**
   ```
   POST /opportunities/applications
   ```

5. **View dashboard**
   ```
   GET /opportunities/dashboard/student
   ```

### Company Managing Opportunities

1. **Create opportunity**
   ```
   POST /opportunities/
   ```

2. **Create tasks for opportunity**
   ```
   POST /opportunities/1/tasks
   ```

3. **View applications**
   ```
   GET /opportunities/applications/1
   ```

4. **Update application status**
   ```
   PUT /opportunities/applications/1
   ```

5. **View dashboard**
   ```
   GET /opportunities/dashboard/company
   ```

---

## Support

For API support, contact the development team or create an issue in the project repository.
