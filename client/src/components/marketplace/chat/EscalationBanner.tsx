import React, { useState } from 'react';
import './EscalationBanner.css';

interface EscalationBannerProps {
  onEscalate?: (reason: string) => void;
}

const EscalationBanner: React.FC<EscalationBannerProps> = ({ onEscalate }) => {
  const [showEscalateForm, setShowEscalateForm] = useState(false);
  const [reason, setReason] = useState('');
  const [escalating, setEscalating] = useState(false);

  const handleEscalate = async () => {
    if (!reason.trim()) return;

    try {
      setEscalating(true);
      await onEscalate?.(reason.trim());
      setShowEscalateForm(false);
      setReason('');
    } catch (error) {
      console.error('Failed to escalate:', error);
    } finally {
      setEscalating(false);
    }
  };

  const handleCancel = () => {
    setShowEscalateForm(false);
    setReason('');
  };

  return (
    <div className="escalation-banner">
      <div className="escalation-content">
        <div className="escalation-icon">
          ⚠️
        </div>
        <div className="escalation-text">
          <h4>This conversation has been escalated</h4>
          <p>Support staff has been notified and will join this conversation to help resolve the issue.</p>
        </div>
      </div>
      
      {!showEscalateForm ? (
        <button 
          className="escalate-button"
          onClick={() => setShowEscalateForm(true)}
        >
          Add Additional Information
        </button>
      ) : (
        <div className="escalation-form">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide additional details about the issue..."
            className="escalation-textarea"
            rows={3}
          />
          <div className="escalation-actions">
            <button 
              className="cancel-button"
              onClick={handleCancel}
              disabled={escalating}
            >
              Cancel
            </button>
            <button 
              className="submit-button"
              onClick={handleEscalate}
              disabled={!reason.trim() || escalating}
            >
              {escalating ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscalationBanner;
