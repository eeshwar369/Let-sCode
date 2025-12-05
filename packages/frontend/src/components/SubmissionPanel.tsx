import React, { useEffect, useState } from 'react';
import { Submission } from '@letscode/shared';
import './SubmissionPanel.css';

interface SubmissionPanelProps {
  submissionId: string | null;
}

const SubmissionPanel: React.FC<SubmissionPanelProps> = ({ submissionId }) => {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!submissionId) {
      setSubmission(null);
      return;
    }

    const fetchSubmission = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:3000/api/submission/${submissionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch submission');
        }
        const data = await response.json();
        setSubmission(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
    const interval = setInterval(fetchSubmission, 2000);

    return () => clearInterval(interval);
  }, [submissionId]);

  if (!submissionId) {
    return (
      <div className="submission-panel">
        <div className="empty-state">
          <p>Submit your code to see results</p>
        </div>
      </div>
    );
  }

  if (loading && !submission) {
    return (
      <div className="submission-panel">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="submission-panel">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!submission) {
    return null;
  }

  return (
    <div className="submission-panel">
      <div className="panel-header">
        <h2>Submission Results</h2>
        <span className={`status-badge status-${submission.status.toLowerCase()}`}>
          {submission.status}
        </span>
      </div>

      <div className="panel-content">
        <div className="info-section">
          <div className="info-item">
            <span className="label">ID:</span>
            <span className="value">{submission.id.substring(0, 8)}...</span>
          </div>
          <div className="info-item">
            <span className="label">Language:</span>
            <span className="value">{submission.language}</span>
          </div>
          <div className="info-item">
            <span className="label">Strategy:</span>
            <span className="value">{submission.executionStrategy.type}</span>
          </div>
        </div>

        {submission.verdict && (
          <div className="verdict-section">
            <h3>Verdict</h3>
            <div className={`verdict verdict-${submission.verdict.status.toLowerCase().replace(/\s+/g, '-')}`}>
              {submission.verdict.status}
            </div>
            <div className="verdict-details">
              <div className="detail-item">
                <span className="label">Tests Passed:</span>
                <span className="value">
                  {submission.verdict.passedTests} / {submission.verdict.totalTests}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Max Time:</span>
                <span className="value">{submission.verdict.maxTime}ms</span>
              </div>
              <div className="detail-item">
                <span className="label">Max Memory:</span>
                <span className="value">
                  {(submission.verdict.maxMemory / 1024 / 1024).toFixed(2)}MB
                </span>
              </div>
            </div>
          </div>
        )}

        {submission.testResults && submission.testResults.length > 0 && (
          <div className="test-results-section">
            <h3>Test Cases</h3>
            {submission.testResults.map((result, index) => (
              <div key={index} className={`test-case ${result.passed ? 'passed' : 'failed'}`}>
                <div className="test-header">
                  <span>Test Case {result.testCaseNumber}</span>
                  <span className={`test-verdict ${result.passed ? 'passed' : 'failed'}`}>
                    {result.verdict}
                  </span>
                </div>
                <div className="test-details">
                  <span>Time: {result.executionTime}ms</span>
                  <span>Memory: {(result.memoryUsed / 1024 / 1024).toFixed(2)}MB</span>
                </div>
                {result.error && <div className="test-error">{result.error}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionPanel;
