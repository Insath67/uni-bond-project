import React, { useState, useEffect } from 'react';
import { dashboardService } from '../controllers/opportunityController';
import '../styles/CompanyDashboard.css';

interface DashboardStats {
  total_posted: number;
  active_opportunities: number;
  staged_tasks: number;
  total_applicants_reached: number;
}

interface Opportunity {
  id: number;
  title: string;
  description: string;
  opportunity_type: string;
  status: string;
  max_applicants: number;
  created_at: string;
}

interface Application {
  id: number;
  opportunity_id: number;
  student_id: number;
  status: string;
  applied_at: string;
  cover_letter?: string;
}

const CompanyDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'opportunities' | 'applications' | 'profile'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardService.getCompanyDashboard();
      const data = response.data;

      setStats(data.stats);
      setOpportunities(data.opportunities);
      setApplications(data.recent_applications);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading company dashboard...</div>;
  }

  return (
    <div className="company-dashboard">
      <div className="dashboard-header">
        <h1>Company Dashboard</h1>
        <p className="subtitle">Manage your opportunities and applications</p>
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
          className={`tab-button ${activeTab === 'opportunities' ? 'active' : ''}`}
          onClick={() => setActiveTab('opportunities')}
        >
          Opportunities
        </button>
        <button
          className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="overview-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon total-posted">📊</div>
              <div className="stat-content">
                <div className="stat-value">{stats.total_posted}</div>
                <div className="stat-label">Total Posted</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon active">🟢</div>
              <div className="stat-content">
                <div className="stat-value">{stats.active_opportunities}</div>
                <div className="stat-label">Active Opportunities</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon staged">📋</div>
              <div className="stat-content">
                <div className="stat-value">{stats.staged_tasks}</div>
                <div className="stat-label">Staged Tasks</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon applicants">👥</div>
              <div className="stat-content">
                <div className="stat-value">{stats.total_applicants_reached}</div>
                <div className="stat-label">Applicants Reached</div>
              </div>
            </div>
          </div>

          {/* Recent Applications Preview */}
          <div className="recent-section">
            <h2>Recent Applications</h2>
            {applications.length > 0 ? (
              <div className="applications-table">
                <table>
                  <thead>
                    <tr>
                      <th>Application ID</th>
                      <th>Status</th>
                      <th>Applied Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.slice(0, 5).map((app) => (
                      <tr key={app.id}>
                        <td>#{app.id}</td>
                        <td>
                          <span className={`status-badge ${app.status.toLowerCase()}`}>
                            {app.status}
                          </span>
                        </td>
                        <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                        <td>
                          <button className="action-btn">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No applications yet</p>
            )}
          </div>
        </div>
      )}

      {/* Opportunities Tab */}
      {activeTab === 'opportunities' && (
        <div className="opportunities-section">
          <div className="section-header">
            <h2>Your Opportunities</h2>
            <button className="btn btn-primary">+ New Opportunity</button>
          </div>

          {opportunities.length > 0 ? (
            <div className="opportunities-list">
              {opportunities.map((opp) => (
                <div key={opp.id} className="opportunity-card">
                  <div className="opp-header">
                    <h3>{opp.title}</h3>
                    <span className={`status-badge ${opp.status.toLowerCase()}`}>
                      {opp.status}
                    </span>
                  </div>
                  <p className="opp-description">{opp.description.substring(0, 150)}...</p>
                  <div className="opp-meta">
                    <span>Type: {opp.opportunity_type}</span>
                    <span>Max Applicants: {opp.max_applicants}</span>
                    <span>Posted: {new Date(opp.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="opp-actions">
                    <button className="action-btn">Edit</button>
                    <button className="action-btn">Applications</button>
                    <button className="action-btn">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No opportunities posted yet. Create one to get started!</p>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="applications-section">
          <h2>All Applications</h2>
          {applications.length > 0 ? (
            <div className="applications-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Opportunity</th>
                    <th>Student ID</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>#{app.id}</td>
                      <td>Opportunity {app.opportunity_id}</td>
                      <td>Student {app.student_id}</td>
                      <td>
                        <span className={`status-badge ${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                      <td>
                        <button className="action-btn">View</button>
                        <button className="action-btn">Respond</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-data">No applications received yet</p>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="profile-section">
          <h2>Company Profile Details</h2>
          <div className="profile-info">
            <div className="info-grid">
              <div className="info-item">
                <label>Company Name</label>
                <p className="info-value">Tech Corp</p>
              </div>
              <div className="info-item">
                <label>Industry</label>
                <p className="info-value">Information Technology</p>
              </div>
              <div className="info-item">
                <label>Established Year</label>
                <p className="info-value">2010</p>
              </div>
              <div className="info-item">
                <label>Total Employees</label>
                <p className="info-value">500+</p>
              </div>
              <div className="info-item full-width">
                <label>Company Description</label>
                <p className="info-value">Leading technology company specializing in software solutions</p>
              </div>
              <div className="info-item full-width">
                <label>Address</label>
                <p className="info-value">123 Tech Street, Silicon Valley, CA 94025</p>
              </div>
            </div>
            <button className="btn btn-primary">Edit Profile</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
