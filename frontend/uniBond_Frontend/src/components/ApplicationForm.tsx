import React, { useState } from 'react';
import { applicationService } from '../controllers/opportunityController';
import '../styles/ApplicationForm.css';

interface ApplicationFormProps {
  opportunityId: number;
  opportunityTitle: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  opportunityId,
  opportunityTitle,
  onSuccess,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    cover_letter: '',
    resume_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cover_letter.trim()) {
      setError('Cover letter is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await applicationService.applyForOpportunity({
        opportunity_id: opportunityId,
        ...formData,
      });

      setSuccess(true);
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="form-success">
        <div className="success-icon">✓</div>
        <h3>Application Submitted Successfully!</h3>
        <p>Your application for "{opportunityTitle}" has been received.</p>
        <p className="success-message">
          The employer will review your application and contact you soon.
        </p>
      </div>
    );
  }

  return (
    <div className="application-form-container">
      <div className="form-header">
        <h2>Apply for Opportunity</h2>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <div className="form-body">
        <div className="opportunity-info">
          <p className="info-label">Position:</p>
          <p className="info-value">{opportunityTitle}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="application-form">
          <div className="form-group">
            <label htmlFor="cover_letter" className="label-required">
              Cover Letter
            </label>
            <textarea
              id="cover_letter"
              name="cover_letter"
              value={formData.cover_letter}
              onChange={handleChange}
              placeholder="Tell the employer why you're interested in this opportunity and what makes you a good fit..."
              rows={6}
              required
              className="textarea-input"
            />
            <p className="helper-text">
              {formData.cover_letter.length}/1000 characters
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="resume_url">
              Resume URL
              <span className="optional-badge">Optional</span>
            </label>
            <input
              type="url"
              id="resume_url"
              name="resume_url"
              value={formData.resume_url}
              onChange={handleChange}
              placeholder="https://example.com/your-resume.pdf"
              className="text-input"
            />
            <p className="helper-text">
              Provide a link to your resume or portfolio (Google Drive, Dropbox, GitHub, etc.)
            </p>
          </div>

          <div className="form-actions">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn-cancel"
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
