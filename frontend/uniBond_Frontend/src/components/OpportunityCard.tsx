import React, { useState } from 'react';
import '../styles/OpportunityCard.css';

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

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  id,
  title,
  description,
  opportunity_type,
  location,
  salary_min,
  salary_max,
  requirements,
  status,
  max_applicants,
  deadline,
  created_at,
  applied,
  onApply,
  onView,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const daysUntilDeadline = deadline
    ? Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && !max) return `$${min.toLocaleString()}+`;
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    return '';
  };

  return (
    <div className={`opportunity-card ${status.toLowerCase()} ${applied ? 'applied' : ''}`}>
      <div className="card-header">
        <div className="title-section">
          <h3 className="opportunity-title">{title}</h3>
          <span className={`opportunity-type-badge ${opportunity_type.toLowerCase()}`}>
            {opportunity_type}
          </span>
        </div>
        <span className={`status-indicator ${status.toLowerCase()}`}>
          {status}
        </span>
      </div>

      <div className="card-body">
        <p className="description">{description.substring(0, 150)}...</p>

        <div className="details-grid">
          {location && (
            <div className="detail-item">
              <span className="detail-icon">📍</span>
              <span className="detail-text">{location}</span>
            </div>
          )}

          {(salary_min || salary_max) && (
            <div className="detail-item">
              <span className="detail-icon">💰</span>
              <span className="detail-text">{formatSalary(salary_min, salary_max)}</span>
            </div>
          )}

          <div className="detail-item">
            <span className="detail-icon">📅</span>
            <span className="detail-text">{formatDate(created_at)}</span>
          </div>

          {deadline && daysUntilDeadline !== null && (
            <div className="detail-item">
              <span className="detail-icon">⏰</span>
              <span
                className={`detail-text ${daysUntilDeadline < 7 ? 'urgent' : ''}`}
              >
                {daysUntilDeadline > 0
                  ? `${daysUntilDeadline} days left`
                  : 'Deadline passed'}
              </span>
            </div>
          )}
        </div>

        {requirements && (
          <div className="requirements-preview">
            <p className="requirements-label">Key Requirements:</p>
            <p className="requirements-text">
              {requirements.substring(0, 100)}...
            </p>
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="applicants-info">
          <span className="applicants-label">Max Applicants:</span>
          <span className="applicants-count">{max_applicants}</span>
        </div>

        {applied && <div className="applied-badge">✓ Applied</div>}

        <div className="card-actions">
          <button
            className="btn-secondary"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>

          {onView && (
            <button className="btn-primary" onClick={() => onView(id)}>
              View Details
            </button>
          )}

          {!applied && onApply && status === 'active' && (
            <button
              className="btn-apply"
              onClick={() => onApply(id)}
            >
              Apply Now
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="expanded-section">
          <div className="expanded-content">
            <h4>Full Description</h4>
            <p>{description}</p>

            {requirements && (
              <>
                <h4>Requirements</h4>
                <p>{requirements}</p>
              </>
            )}

            {(salary_min || salary_max) && (
              <div className="salary-section">
                <h4>Salary Range</h4>
                <p className="salary-text">
                  {formatSalary(salary_min, salary_max)}
                </p>
              </div>
            )}

            {deadline && (
              <div className="deadline-section">
                <h4>Application Deadline</h4>
                <p>{formatDate(deadline)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityCard;
