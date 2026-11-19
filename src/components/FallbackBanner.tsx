import React from 'react';

interface FallbackBannerProps {
  isFallback: boolean;
  fallbackReason?: string;
  onToggleForceFallback: (force: boolean) => void;
  isForced: boolean;
}

export const FallbackBanner: React.FC<FallbackBannerProps> = ({
  isFallback,
  fallbackReason,
  onToggleForceFallback,
  isForced,
}) => {
  return (
    <div
      style={{
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {isFallback && (
        <div
          role="status"
          aria-live="polite"
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1e40af',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.9rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>
              🛡️
            </span>
            <div>
              <strong>Fallback State Active:</strong>{' '}
              <span>{fallbackReason || 'Operating on safe baseline protocols.'}</span>
            </div>
          </div>
          <span
            className="badge"
            style={{ backgroundColor: '#dbeafe', color: '#1e3a8a', border: '1px solid #93c5fd' }}
          >
            Safe Conservative Mode
          </span>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <label
          htmlFor="toggle-fallback"
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <input
            id="toggle-fallback"
            type="checkbox"
            checked={isForced}
            onChange={(e) => onToggleForceFallback(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <span>Simulate Sensor / Telemetry Outage (Test Fallback Engine)</span>
        </label>
      </div>
    </div>
  );
};
