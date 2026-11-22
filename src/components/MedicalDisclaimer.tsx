import React from 'react';
import { MEDICAL_DISCLAIMER } from '../domain/recommendationEngine';

interface MedicalDisclaimerProps {
  compact?: boolean;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ compact = false }) => {
  return (
    <div
      role="region"
      aria-label="Important Health & Safety Disclaimer"
      className={`medical-note${compact ? ' medical-note-compact' : ''}`}
    >
      <span className="medical-note-icon" aria-hidden="true">i</span>
      <div>
        <strong>
          A note for your wellbeing
        </strong>
        <span>{MEDICAL_DISCLAIMER}</span>
      </div>
    </div>
  );
};
