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
      style={{
        backgroundColor: 'var(--color-warning-bg)',
        border: '1px solid var(--color-warning-border)',
        borderRadius: 'var(--radius-md)',
        padding: compact ? '10px 14px' : '14px 18px',
        color: 'var(--color-warning-text)',
        fontSize: compact ? '0.82rem' : '0.88rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        lineHeight: 1.45,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '1.25rem', flexShrink: 0, marginTop: '-1px' }}>
        ⚠️
      </span>
      <div>
        <strong style={{ display: 'block', marginBottom: '2px', color: '#78350f' }}>
          Non-Medical Health Advisory
        </strong>
        <span>{MEDICAL_DISCLAIMER}</span>
      </div>
    </div>
  );
};
