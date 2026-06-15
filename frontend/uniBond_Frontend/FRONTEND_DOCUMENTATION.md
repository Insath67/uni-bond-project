# Task Management & Opportunities System - Frontend Documentation

## Overview

This document provides comprehensive guide for using the Task Management and Opportunities frontend components.

## Components

### 1. CompanyDashboard

Main dashboard for company administrators displaying statistics and management tools.

**Location:** `src/components/CompanyDashboard.tsx`

**Features:**
- View dashboard statistics (total posted, active opportunities, staged tasks, applicants reached)
- Manage opportunities (view, edit, delete)
- View recent applications
- Access company profile
- Tab-based navigation

**Usage:**
```tsx
import CompanyDashboard from './components/CompanyDashboard';

function App() {
  return <CompanyDashboard />;
}
```

**Props:** None (uses current user context for authentication)

**Statistics Displayed:**
- **Total Posted:** Number of opportunities created
- **Active Opportunities:** Currently open opportunities
- **Staged Tasks:** Tasks pending completion
- **Applicants Reached:** Total applications received

**Tabs:**
1. **Overview:** Dashboard statistics and recent applications
2. **Opportunities:** List of all opportunities with actions
3. **Applications:** Detailed table of all applications
4. **Profile:** Company profile information

---

### 2. StudentDashboard

Main dashboard for students displaying their applications, submissions, and notifications.

**Location:** `src/components/StudentDashboard.tsx`

**Features:**
- View application statistics
- Track submitted tasks
- View applied opportunities
- Manage notifications (mark as read, view all)
- Tab-based navigation

**Usage:**
```tsx
import StudentDashboard from './components/StudentDashboard';

function App() {
  return <StudentDashboard />;
}
```

**Props:** None (uses current user context for authentication)

**Statistics Displayed:**
- **Tasks Submitted:** Total number of task submissions
- **Applied Opportunities:** Total applications sent
- **Unread Notifications:** Number of unread messages

**Tabs:**
1. **Overview:** Statistics and recent activity
2. **Submitted Tasks:** Table of all submitted tasks with status
3. **Applied Opportunities:** Table of applications with status
4. **Notifications:** List of all notifications with read/unread status

---

### 3. OpportunityCard

Reusable component for displaying opportunity information.

**Location:** `src/components/OpportunityCard.tsx`

**Features:**
- Display opportunity details in card format
- Show opportunity type badge
- Display salary range and location
- Expandable detailed section
- Apply button (if not already applied)
- Responsive design

**Props:**
```tsx
interface OpportunityCardProps {
  id: number;
  title: string;
  description: string;
  opportunity_type: string;
  company_id: number;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  requirements?: string;
  status: string;
  max_applicants: number;
  deadline?: string;
  created_at: string;
  applied?: boolean;
  onApply?: (opportunityId: number) => void;
  onView?: (opportunityId: number) => void;
}
```

**Usage:**
```tsx
import OpportunityCard from './components/OpportunityCard';

<OpportunityCard
  id={1}
  title="Senior Developer"
  description="Looking for experienced developer..."
  opportunity_type="full_time"
  location="New York"
  salary_min={80000}
  salary_max={120000}
  status="active"
  max_applicants={50}
  created_at="2026-04-01"
  onApply={(id) => console.log('Apply:', id)}
  onView={(id) => navigate(`/opportunity/${id}`)}
/>
```

**Opportunity Type Badges:**
- `internship` - Light blue
- `freelance` - Light green
- `part_time` - Light orange
- `full_time` - Light purple
- `project` - Indigo
- `task` - Pink

---

### 4. ApplicationForm

Modal form for students to apply for opportunities.

**Location:** `src/components/ApplicationForm.tsx`

**Features:**
- Cover letter textarea with character counter
- Optional resume URL input
- Form validation
- Success message display
- Error handling

**Props:**
```tsx
interface ApplicationFormProps {
  opportunityId: number;
  opportunityTitle: string;
  onSuccess?: () => void;
  onClose?: () => void;
}
```

**Usage:**
```tsx
import ApplicationForm from './components/ApplicationForm';
import { useState } from 'react';

function ApplyModal() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {showForm && (
        <div className="modal">
          <ApplicationForm
            opportunityId={1}
            opportunityTitle="Senior Developer"
            onSuccess={() => {
              setShowForm(false);
              // Refresh data
            }}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}
      <button onClick={() => setShowForm(true)}>Apply Now</button>
    </>
  );
}
```

**Form Fields:**
- **Cover Letter** (Required): Text area, max 1000 characters
- **Resume URL** (Optional): URL to resume/portfolio

---

### 5. TaskSubmissionForm

Modal form for students to submit completed tasks.

**Location:** `src/components/TaskSubmissionForm.tsx`

**Features:**
- Submission text area with character counter
- Optional submission URL input
- Form validation
- Submission guidelines checklist
- Success message display
- Error handling

**Props:**
```tsx
interface TaskSubmissionProps {
  taskId: number;
  taskTitle: string;
  onSuccess?: () => void;
  onClose?: () => void;
}
```

**Usage:**
```tsx
import TaskSubmissionForm from './components/TaskSubmissionForm';
import { useState } from 'react';

function SubmitModal() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {showForm && (
        <div className="modal">
          <TaskSubmissionForm
            taskId={1}
            taskTitle="Phase 1: Setup"
            onSuccess={() => {
              setShowForm(false);
              // Refresh data
            }}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}
      <button onClick={() => setShowForm(true)}>Submit Task</button>
    </>
  );
}
```

**Form Fields:**
- **Submission Content** (Optional): Text area, max 5000 characters
- **Submission URL** (Optional): URL to code, document, or deliverables

---

## Services (API Client)

### opportunityController

Located at `src/controllers/opportunityController.ts`

**Available Services:**

#### opportunityService
```tsx
opportunityService.getOpportunities(skip, limit)      // Get all opportunities
opportunityService.getOpportunity(id)                  // Get single opportunity
opportunityService.createOpportunity(data)             // Create opportunity
opportunityService.updateOpportunity(id, data)         // Update opportunity
opportunityService.deleteOpportunity(id)               // Delete opportunity
```

#### taskService
```tsx
taskService.getTasks(opportunityId)                    // Get tasks for opportunity
taskService.createTask(opportunityId, data)            // Create task
taskService.updateTask(taskId, data)                   // Update task
taskService.getSubmissions(taskId)                     // Get submissions for task
```

#### applicationService
```tsx
applicationService.applyForOpportunity(data)           // Apply for opportunity
applicationService.getApplications(opportunityId)      // Get applications (company only)
applicationService.updateApplicationStatus(id, data)   // Update application status
applicationService.getAppliedOpportunities()           // Get student's applications
```

#### submissionService
```tsx
submissionService.submitTask(data)                     // Submit task
submissionService.updateSubmission(id, data)           // Update submission
submissionService.getStudentSubmissions()              // Get student's submissions
```

#### notificationService
```tsx
notificationService.getNotifications(skip, limit, unreadOnly)
notificationService.markAsRead(notificationId)
notificationService.markAllAsRead()
```

#### dashboardService
```tsx
dashboardService.getCompanyDashboard()                 // Get company dashboard data
dashboardService.getStudentDashboard()                 // Get student dashboard data
```

#### profileService
```tsx
profileService.createCompanyProfile(data)
profileService.getCompanyProfile(companyId)
profileService.updateCompanyProfile(data)
profileService.createStudentProfile(data)
profileService.getStudentProfile(studentId)
profileService.updateStudentProfile(data)
```

---

## Styling

### CSS Files

#### CompanyDashboard.css
- Dashboard layout and styling
- Stats grid layout
- Tab navigation styling
- Table styling
- Card layouts

#### StudentDashboard.css
- Dashboard layout and styling
- Stats cards with icons
- Notification list styling
- Activity streams
- Badge styling

#### OpportunityCard.css
- Card container styling
- Type badges
- Status indicators
- Expandable sections
- Responsive layouts

#### ApplicationForm.css
- Modal form styling
- Input and textarea styling
- Form validation feedback
- Success message styling

#### TaskSubmissionForm.css
- Modal form styling
- Submission guidelines box
- Form divider styling
- Success animations

---

## Responsive Design

All components are mobile-responsive with breakpoints:

- **Desktop:** 768px and above - Full layout
- **Tablet:** 481px to 768px - Adjusted layouts
- **Mobile:** below 480px - Stacked layouts

---

## Color Scheme

### Opportunity Type Colors
- Internship: `#0369a1` (Blue)
- Freelance: `#22863a` (Green)
- Part Time: `#e65100` (Orange)
- Full Time: `#7b1fa2` (Purple)
- Project: `#512da8` (Deep Purple)
- Task: `#c2185b` (Pink)

### Status Colors
- Active/Approved: `#155724` (Green)
- Pending/Applied: `#664d03` (Yellow)
- In Progress: `#084298` (Blue)
- Rejected: `#842029` (Red)
- Completed: `#0c5460` (Teal)

---

## Usage Examples

### Display Opportunities List

```tsx
import { useState, useEffect } from 'react';
import OpportunityCard from './components/OpportunityCard';
import { opportunityService } from './controllers/opportunityController';

function OpportunitiesList() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await opportunityService.getOpportunities(0, 10);
        setOpportunities(response.data);
      } catch (error) {
        console.error('Failed to fetch opportunities', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="opportunities-grid">
      {opportunities.map((opp) => (
        <OpportunityCard
          key={opp.id}
          {...opp}
          onApply={(id) => console.log('Apply:', id)}
          onView={(id) => console.log('View:', id)}
        />
      ))}
    </div>
  );
}
```

### Handle Application Submission

```tsx
import { useState } from 'react';
import ApplicationForm from './components/ApplicationForm';

function ApplyPage() {
  const [showForm, setShowForm] = useState(false);
  const opportunityId = 1;

  const handleApplySuccess = () => {
    setShowForm(false);
    // Show toast message or refresh
    alert('Application submitted successfully!');
  };

  return (
    <>
      {showForm && (
        <ApplicationForm
          opportunityId={opportunityId}
          opportunityTitle="Senior Developer"
          onSuccess={handleApplySuccess}
          onClose={() => setShowForm(false)}
        />
      )}
      <button onClick={() => setShowForm(true)}>Apply</button>
    </>
  );
}
```

---

## Common Issues & Solutions

### Notification not updating
- Ensure you're calling `markAsRead()` or `markAllAsRead()` from notificationService
- Clear dashboard cache after updating

### Application submission fails
- Verify cover letter is not empty
- Check resume URL is valid
- Ensure opportunity is still active

### Dashboard not loading
- Check authentication token is valid
- Verify user role is correct (company_admin or student)
- Check network tab for API errors

---

## Best Practices

1. **Error Handling:** Always wrap API calls in try-catch
2. **Loading States:** Show loading indicators while fetching data
3. **User Feedback:** Display success/error messages to users
4. **Performance:** Use React.memo for expensive components
5. **Accessibility:** Include proper ARIA labels and keyboard navigation

---

## Future Enhancements

- Real-time notifications with WebSocket
- File upload for resumes and submissions
- Advanced filtering and search
- Batch operations for company dashboard
- Email notifications
- Analytics dashboard

---

## Support

For component usage questions or issues, refer to the inline documentation in component files or contact the development team.
