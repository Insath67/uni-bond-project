import React, { useState, useEffect } from 'react';
import { dashboardService, notificationService } from '../controllers/opportunityController';
import '../styles/StudentDashboard.css';

interface TaskSubmission {
  id: number;
  task_id: number;
  student_id: number;
  submission_text?: string;
  submission_url?: string;
  status: string;
  feedback?: string;
  submitted_at: string;
  updated_at: string;
}

interface AppliedOpportunity {
  id: number;
  opportunity_id: number;
  student_id: number;
  status: string;
  cover_letter?: string;
  resume_url?: string;
  applied_at: string;
  updated_at: string;
}

interface Notification {
  id: number;
  recipient_id: number;
  notification_type: string;
  title: string;
  message: string;
  related_opportunity_id?: number;
  related_task_id?: number;
  related_application_id?: number;
  is_read: boolean;
  created_at: string;
}

interface StudentDashboardResponse {
  submitted_tasks: TaskSubmission[];
  applied_opportunities: AppliedOpportunity[];
  notifications: Notification[];
}

const StudentDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<StudentDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'submitted' | 'applications' | 'notifications'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardService.getStudentDashboard();
      setDashboardData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setDashboardData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification,
          ),
        };
      });
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setDashboardData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.map((notification) => ({
            ...notification,
            is_read: true,
          })),
        };
      });
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading student dashboard...</div>;
  }

  const unreadCount = dashboardData?.notifications.filter((n) => !n.is_read).length || 0;

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p className="subtitle">Track your applications, submissions, and opportunities</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'submitted' ? 'active' : ''}`}
          onClick={() => setActiveTab('submitted')}
        >
          Submitted Tasks
        </button>
        <button
          className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applied Opportunities
        </button>
        <button
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboardData && (
        <div className="overview-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon submitted">📤</div>
              <div className="stat-content">
                <div className="stat-value">{dashboardData.submitted_tasks.length}</div>
                <div className="stat-label">Tasks Submitted</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon applied">📝</div>
              <div className="stat-content">
                <div className="stat-value">{dashboardData.applied_opportunities.length}</div>
                <div className="stat-label">Applied Opportunities</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon notifications">🔔</div>
              <div className="stat-content">
                <div className="stat-value">{unreadCount}</div>
                <div className="stat-label">Unread Notifications</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <div className="activity-section">
              <h3>Recent Submissions</h3>
              {dashboardData.submitted_tasks.length > 0 ? (
                <div className="activity-list">
                  {dashboardData.submitted_tasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="activity-item">
                      <div className="activity-icon">📋</div>
                      <div className="activity-content">
                        <p className="activity-title">Task Submission #{task.id}</p>
                        <p className="activity-meta">
                          {new Date(task.submitted_at).toLocaleDateString()} •{' '}
                          <span className={`status-badge ${task.status.toLowerCase()}`}>
                            {task.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No submissions yet</p>
              )}
            </div>

            <div className="activity-section">
              <h3>Recent Applications</h3>
              {dashboardData.applied_opportunities.length > 0 ? (
                <div className="activity-list">
                  {dashboardData.applied_opportunities.slice(0, 3).map((app) => (
                    <div key={app.id} className="activity-item">
                      <div className="activity-icon">✅</div>
                      <div className="activity-content">
                        <p className="activity-title">Application #{app.id}</p>
                        <p className="activity-meta">
                          {new Date(app.applied_at).toLocaleDateString()} •{' '}
                          <span className={`status-badge ${app.status.toLowerCase()}`}>
                            {app.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No applications yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submitted Tasks Tab */}
      {activeTab === 'submitted' && dashboardData && (
        <div className="submitted-tasks-section">
          <h2>Your Submitted Tasks</h2>
          {dashboardData.submitted_tasks.length > 0 ? (
            <div className="tasks-table">
              <table>
                <thead>
                  <tr>
                    <th>Submission ID</th>
                    <th>Task ID</th>
                    <th>Status</th>
                    <th>Submitted Date</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.submitted_tasks.map((task) => (
                    <tr key={task.id}>
                      <td>#{task.id}</td>
                      <td>#{task.task_id}</td>
                      <td>
                        <span className={`status-badge ${task.status.toLowerCase()}`}>
                          {task.status}
                        </span>
                      </td>
                      <td>{new Date(task.submitted_at).toLocaleDateString()}</td>
                      <td>{new Date(task.updated_at).toLocaleDateString()}</td>
                      <td>
                        <button className="action-btn">View</button>
                        {task.feedback && <button className="action-btn">Feedback</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No task submissions yet. Start applying for opportunities!</p>
          )}
        </div>
      )}

      {/* Applied Opportunities Tab */}
      {activeTab === 'applications' && dashboardData && (
        <div className="applications-section">
          <h2>Your Applied Opportunities</h2>
          {dashboardData.applied_opportunities.length > 0 ? (
            <div className="applications-table">
              <table>
                <thead>
                  <tr>
                    <th>Application ID</th>
                    <th>Opportunity ID</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.applied_opportunities.map((app) => (
                    <tr key={app.id}>
                      <td>#{app.id}</td>
                      <td>#{app.opportunity_id}</td>
                      <td>
                        <span className={`status-badge ${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                      <td>{new Date(app.updated_at).toLocaleDateString()}</td>
                      <td>
                        <button className="action-btn">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">You haven't applied for any opportunities yet.</p>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && dashboardData && (
        <div className="notifications-section">
          <div className="notifications-header">
            <h2>Your Notifications</h2>
            {unreadCount > 0 && (
              <button className="btn btn-secondary" onClick={handleMarkAllAsRead}>
                Mark All as Read
              </button>
            )}
          </div>

          {dashboardData.notifications.length > 0 ? (
            <div className="notifications-list">
              {dashboardData.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                  onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {notification.notification_type === 'application_received' && '📨'}
                    {notification.notification_type === 'application_status' && '⚡'}
                    {notification.notification_type === 'task_assigned' && '📌'}
                    {notification.notification_type === 'submission_received' && '📤'}
                    {notification.notification_type === 'feedback_provided' && '💬'}
                  </div>
                  <div className="notification-content">
                    <p className="notification-title">{notification.title}</p>
                    <p className="notification-message">{notification.message}</p>
                    <p className="notification-time">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.is_read && <div className="unread-indicator"></div>}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No notifications yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
