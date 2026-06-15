import React, { useState } from 'react';
import { submissionService } from '../controllers/opportunityController';
import '../styles/TaskSubmissionForm.css';

interface TaskSubmissionProps {
  taskId: number;
  taskTitle: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

const TaskSubmissionForm: React.FC<TaskSubmissionProps> = ({
  taskId,
  taskTitle,
  onSuccess,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    submission_text: '',
    submission_url: '',
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

    if (!formData.submission_text.trim() && !formData.submission_url.trim()) {
      setError('Please provide either submission text or URL');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await submissionService.submitTask({
        task_id: taskId,
        ...formData,
      });

      setSuccess(true);
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit task');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="submission-success">
        <div className="success-icon">✓</div>
        <h3>Task Submitted Successfully!</h3>
        <p>Your submission for "{taskTitle}" has been received.</p>
        <p className="success-message">
          The instructor will review your work and provide feedback soon.
        </p>
      </div>
    );
  }

  return (
    <div className="task-submission-container">
      <div className="form-header">
        <h2>Submit Task</h2>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <div className="form-body">
        <div className="task-info">
          <p className="info-label">Task:</p>
          <p className="info-value">{taskTitle}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="submission-form">
          <div className="form-group">
            <label htmlFor="submission_text">
              Submission Content
              <span className="optional-badge">Optional</span>
            </label>
            <textarea
              id="submission_text"
              name="submission_text"
              value={formData.submission_text}
              onChange={handleChange}
              placeholder="Describe your work, include any relevant details, findings, or results..."
              rows={8}
              className="textarea-input"
            />
            <p className="helper-text">
              {formData.submission_text.length}/5000 characters
            </p>
          </div>

          <div className="form-divider">
            <span>or</span>
          </div>

          <div className="form-group">
            <label htmlFor="submission_url">
              Submission URL
              <span className="optional-badge">Optional</span>
            </label>
            <input
              type="url"
              id="submission_url"
              name="submission_url"
              value={formData.submission_url}
              onChange={handleChange}
              placeholder="https://example.com/your-submission"
              className="text-input"
            />
            <p className="helper-text">
              Provide a link to your code, document, or deliverables
              (GitHub, Google Drive, Dropbox, etc.)
            </p>
          </div>

          <div className="submission-guidelines">
            <h4>Before submitting, please ensure:</h4>
            <ul>
              <li>Your work is complete and ready for review</li>
              <li>All requirements have been addressed</li>
              <li>Your code/work is properly documented</li>
              <li>You've tested your work thoroughly</li>
              <li>You have the correct links if submitting via URL</li>
            </ul>
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
              {loading ? 'Submitting...' : 'Submit Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskSubmissionForm;
