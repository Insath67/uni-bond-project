# Task Management & Opportunities System - Database Schema

## Overview

This document describes the complete database schema for the Task Management and Opportunities system.

## Database Diagram

```
users
├── opportunities (company_id → users.id)
│   ├── tasks (opportunity_id → opportunities.id)
│   │   └── task_submissions (task_id → tasks.id, student_id → users.id)
│   └── task_applications (opportunity_id → opportunities.id, student_id → users.id)
├── notifications (recipient_id → users.id)
├── company_profiles (company_id → users.id)
└── student_profiles (student_id → users.id)
```

---

## Table Schemas

### opportunities

Represents job opportunities, internships, projects, or tasks posted by companies.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | Integer | PK, AI | Unique identifier |
| title | String(255) | NOT NULL | Opportunity title |
| description | Text | NOT NULL | Detailed description |
| opportunity_type | Enum | NOT NULL | Type: internship, freelance, part_time, full_time, project, task |
| company_id | Integer | FK, NOT NULL | Reference to users.id (company admin) |
| location | String(255) | NULL | Work location |
| salary_min | Integer | NULL | Minimum salary |
| salary_max | Integer | NULL | Maximum salary |
| requirements | Text | NULL | Requirements/qualifications |
| status | Enum | NOT NULL | Status: draft, active, closed, completed |
| max_applicants | Integer | NOT NULL | Maximum allowed applicants (default: 50) |
| deadline | DateTime | NULL | Application deadline |
| created_at | DateTime(TZ) | NOT NULL | Creation timestamp |
| updated_at | DateTime(TZ) | NOT NULL | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (company_id)
- INDEX (company_id, status)
- INDEX (status)
- INDEX (title)
- INDEX (created_at)

**Relationships:**
- One company_id → One User (company admin)
- One opportunity → Many tasks
- One opportunity → Many task_applications

---

### tasks

Represents individual tasks within opportunities.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | Integer | PK, AI | Unique identifier |
| opportunity_id | Integer | FK, NOT NULL | Reference to opportunities.id |
| title | String(255) | NOT NULL | Task title |
| description | Text | NOT NULL | Task description |
| status | Enum | NOT NULL | Status: pending, in_progress, submitted, reviewed, approved, rejected, completed |
| stage | String(100) | NULL | Development stage (development, testing, review, etc.) |
| created_at | DateTime(TZ) | NOT NULL | Creation timestamp |
| updated_at | DateTime(TZ) | NOT NULL | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (opportunity_id)
- INDEX (opportunity_id)
- INDEX (status)
- INDEX (created_at)

**Relationships:**
- One opportunity → Many tasks
- One task → Many task_submissions

---

### task_applications

Represents student applications to opportunities.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | Integer | PK, AI | Unique identifier |
| opportunity_id | Integer | FK, NOT NULL | Reference to opportunities.id |
| student_id | Integer | FK, NOT NULL | Reference to users.id (student) |
| status | Enum | NOT NULL | Status: applied, shortlisted, rejected, accepted, completed |
| cover_letter | Text | NULL | Student's cover letter |
| resume_url | String(500) | NULL | Link to student's resume |
| applied_at | DateTime(TZ) | NOT NULL | Application timestamp |
| updated_at | DateTime(TZ) | NOT NULL | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (opportunity_id)
- FOREIGN KEY (student_id)
- UNIQUE INDEX (opportunity_id, student_id) - Prevent duplicate applications
- INDEX (status)
- INDEX (applied_at)

**Relationships:**
- One opportunity → Many task_applications
- One student → Many task_applications
- One task_application → triggers notifications

**Constraints:**
- Unique pair of (opportunity_id, student_id) - Student can't apply twice

---

### task_submissions

Represents student submissions for tasks.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | Integer | PK, AI | Unique identifier |
| task_id | Integer | FK, NOT NULL | Reference to tasks.id |
| student_id | Integer | FK, NOT NULL | Reference to users.id (student) |
| submission_text | Text | NULL | Submission content/description |
| submission_url | String(500) | NULL | Link to submission (GitHub, Google Drive, etc.) |
| status | Enum | NOT NULL | Status: pending, in_progress, submitted, reviewed, approved, rejected, completed |
| feedback | Text | NULL | Instructor/company feedback |
| submitted_at | DateTime(TZ) | NOT NULL | Submission timestamp |
| updated_at | DateTime(TZ) | NOT NULL | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (task_id)
- FOREIGN KEY (student_id)
- INDEX (task_id)
- INDEX (student_id)

**Relationships:**
- One task → Many task_submissions
- One student → Many task_submissions
- One task_submission → triggers notifications

---

### notifications

Represents notifications sent to users.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | Integer | PK, AI | Unique identifier |
| recipient_id | Integer | FK, NOT NULL | Reference to users.id (recipient) |
| notification_type | Enum | NOT NULL | Type: application_received, application_status, task_assigned, submission_received, feedback_provided |
| title | String(255) | NOT NULL | Notification title |
| message | Text | NOT NULL | Notification message |
| related_opportunity_id | Integer | FK, NULL | Reference to opportunities.id |
| related_task_id | Integer | FK, NULL | Reference to tasks.id |
| related_application_id | Integer | FK, NULL | Reference to task_applications.id |
| is_read | Boolean | NOT NULL | Read status (default: false) |
| created_at | DateTime(TZ) | NOT NULL | Creation timestamp |

**Indexes:**
- PRIMARY KEY (id)
- FOREIGN KEY (recipient_id)
- INDEX (recipient_id, is_read)
- INDEX (created_at)
- INDEX (is_read)

**Relationships:**
- One user → Many notifications (as recipient)
- Optional reference to opportunity, task, or application

---

### company_profiles

Stores company profile information.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | Integer | PK, AI | Unique identifier |
| company_id | Integer | FK, UNIQUE | Reference to users.id (company admin) |
| company_name | String(255) | NOT NULL | Company name |
| company_description | Text | NULL | Company description |
| industry | String(100) | NULL | Industry type |
| website | String(500) | NULL | Company website URL |
| phone | String(20) | NULL | Contact phone |
| address | String(500) | NULL | Physical address |
| city | String(100) | NULL | City |
| country | String(100) | NULL | Country |
| logo_url | String(500) | NULL | Company logo URL |
| established_year | Integer | NULL | Year company was established |
| total_employees | Integer | NULL | Number of employees |
| created_at | DateTime(TZ) | NOT NULL | Creation timestamp |
| updated_at | DateTime(TZ) | NOT NULL | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE FOREIGN KEY (company_id)

**Relationships:**
- One-to-One with users (company admin)

**Constraints:**
- Unique company_id - One profile per company

---

### student_profiles

Stores student profile information.

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| id | Integer | PK, AI | Unique identifier |
| student_id | Integer | FK, UNIQUE | Reference to users.id (student) |
| bio | Text | NULL | Student bio |
| skills | String | NULL | JSON string of skills |
| experience_level | String(50) | NULL | Level: beginner, intermediate, advanced |
| portfolio_url | String(500) | NULL | Portfolio/website URL |
| github_url | String(500) | NULL | GitHub profile URL |
| linkedin_url | String(500) | NULL | LinkedIn profile URL |
| profile_picture_url | String(500) | NULL | Profile picture URL |
| preferred_work_type | String(100) | NULL | Preferred work type |
| available_from | DateTime(TZ) | NULL | Availability date |
| created_at | DateTime(TZ) | NOT NULL | Creation timestamp |
| updated_at | DateTime(TZ) | NOT NULL | Last update timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE FOREIGN KEY (student_id)

**Relationships:**
- One-to-One with users (student)

**Constraints:**
- Unique student_id - One profile per student

---

## Enums

### OpportunityStatus
```python
draft = "draft"
active = "active"
closed = "closed"
completed = "completed"
```

### OpportunityType
```python
internship = "internship"
freelance = "freelance"
part_time = "part_time"
full_time = "full_time"
project = "project"
task = "task"
```

### TaskStatus
```python
pending = "pending"
in_progress = "in_progress"
submitted = "submitted"
reviewed = "reviewed"
approved = "approved"
rejected = "rejected"
completed = "completed"
```

### ApplicationStatus
```python
applied = "applied"
shortlisted = "shortlisted"
rejected = "rejected"
accepted = "accepted"
completed = "completed"
```

### NotificationType
```python
application_received = "application_received"
application_status = "application_status"
task_assigned = "task_assigned"
submission_received = "submission_received"
feedback_provided = "feedback_provided"
```

---

## Key Relationships

### 1. User → Opportunity (One-to-Many)
- A company admin can post multiple opportunities
- Foreign key: opportunities.company_id → users.id

### 2. Opportunity → Task (One-to-Many)
- An opportunity can have multiple tasks
- Foreign key: tasks.opportunity_id → opportunities.id

### 3. Opportunity → TaskApplication (One-to-Many)
- An opportunity can have multiple applications
- Foreign key: task_applications.opportunity_id → opportunities.id

### 4. Student → TaskApplication (One-to-Many)
- A student can apply to multiple opportunities
- Foreign key: task_applications.student_id → users.id
- Unique constraint: (opportunity_id, student_id)

### 5. Task → TaskSubmission (One-to-Many)
- A task can have multiple submissions
- Foreign key: task_submissions.task_id → tasks.id

### 6. Student → TaskSubmission (One-to-Many)
- A student can submit multiple tasks
- Foreign key: task_submissions.student_id → users.id

### 7. User → Notification (One-to-Many)
- A user can receive many notifications
- Foreign key: notifications.recipient_id → users.id

### 8. Company → CompanyProfile (One-to-One)
- Each company admin has one profile
- Unique foreign key: company_profiles.company_id → users.id

### 9. Student → StudentProfile (One-to-One)
- Each student has one profile
- Unique foreign key: student_profiles.student_id → users.id

---

## Data Integrity Constraints

### NOT NULL Constraints
- All `_id` fields are NOT NULL
- title, description are NOT NULL
- status fields are NOT NULL
- Timestamps (created_at) are NOT NULL

### UNIQUE Constraints
- company_profiles.company_id (one profile per company)
- student_profiles.student_id (one profile per student)
- (task_applications.opportunity_id, task_applications.student_id) composite unique

### FOREIGN KEY Constraints
- All `_id` references must exist in parent tables
- CASCADE DELETE: tasks and submissions deleted when opportunity deleted

### DEFAULT VALUES
- opportunities.max_applicants = 50
- notifications.is_read = false
- opportunity.status = draft

---

## Performance Considerations

### Recommended Indexes
1. **opportunities:** (company_id), (status), (created_at)
2. **tasks:** (opportunity_id), (status)
3. **task_applications:** (opportunity_id), (student_id), (status), (applied_at)
4. **task_submissions:** (task_id), (student_id)
5. **notifications:** (recipient_id, is_read), (created_at)

### Query Optimization Tips
- Use pagination with skip/limit for large result sets
- Filter by status to reduce result set
- Index frequently filtered columns
- Use database connection pooling

---

## Backup & Recovery

### Regular Backups
- Daily backups recommended
- Store backups in separate location
- Test recovery procedures

### Data Retention
- Keep all historical data for audit trails
- Soft delete if needed (add is_deleted flag)
- Archive old opportunities after 1 year

---

## Migration History

### Migration: `1a2b3c4d5e6f_add_opportunities_tasks_profiles.py`
- Created all opportunity and task management tables
- Created notification system tables
- Created profile tables for companies and students
- Added indexes and constraints

---

## Support

For database schema questions or modifications, contact the database administrator or development team.
