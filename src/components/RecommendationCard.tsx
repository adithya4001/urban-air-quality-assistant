import React from 'react';
import { Recommendation } from '../domain/types';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const getPriorityStyle = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'critical':
        return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case 'high':
        return { bg: '#ffedd5', text: '#9a3412', border: '#fdba74' };
      case 'medium':
        return { bg: '#fef9c3', text: '#854d0e', border: '#fde047' };
      case 'low':
        return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
    }
  };

  const priorityStyle = getPriorityStyle(recommendation.priority);

  const getCategoryLabel = (cat: Recommendation['category']) => {
    switch (cat) {
      case 'outdoor_activity':
        return '🏃 Outdoor Activity & Exercise';
      case 'commute':
        return '🚲 Commute & Mobility';
      case 'indoor_air':
        return '🏠 Indoor Air & Filtration';
      case 'protective_equipment':
        return '😷 Personal Protective Equipment (PPE)';
      case 'emission_reduction':
        return '🌱 Neighborhood Emission Reduction';
    }
  };

  return (
    <article
      className="card"
      style={{
        borderLeft: `5px solid ${priorityStyle.text}`,
        marginBottom: '16px',
      }}
      aria-labelledby={`rec-title-${recommendation.id}`}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '10px',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          {getCategoryLabel(recommendation.category)}
        </span>
        <span
          className="badge"
          style={{
            backgroundColor: priorityStyle.bg,
            color: priorityStyle.text,
            border: `1px solid ${priorityStyle.border}`,
          }}
        >
          {recommendation.priority} Priority
        </span>
      </div>

      <h3
        id={`rec-title-${recommendation.id}`}
        style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--color-text-main)',
          marginBottom: '6px',
        }}
      >
        {recommendation.title}
      </h3>

      <p style={{ fontSize: '0.92rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
        {recommendation.summary}
      </p>

      {/* Actionable Checkpoints */}
      <div style={{ marginBottom: '16px' }}>
        <h4
          style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: '8px',
          }}
        >
          Recommended Action Items
        </h4>
        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {recommendation.actionItems.map((item, idx) => (
            <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Safety Notice if urgent */}
      {recommendation.safetyNotice && (
        <div
          role="note"
          style={{
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#be123c',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            fontSize: '0.85rem',
            marginBottom: '16px',
          }}
        >
          <strong>Safety Clinical Boundary:</strong> {recommendation.safetyNotice}
        </div>
      )}

      {/* Impact Explanations (Health & Environmental) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px',
          backgroundColor: 'var(--color-bg)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          border: '1px solid var(--color-border-subtle)',
        }}
      >
        <div>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#0369a1',
              textTransform: 'uppercase',
            }}
          >
            🩺 Health & Exposure Impact
          </span>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-main)', marginTop: '4px' }}>
            {recommendation.healthImpact}
          </p>
        </div>

        <div>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#15803d',
              textTransform: 'uppercase',
            }}
          >
            🌍 Environmental & Community Footprint
          </span>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-main)', marginTop: '4px' }}>
            {recommendation.environmentalImpact}
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: '10px',
          fontSize: '0.74rem',
          color: '#94a3b8',
          textAlign: 'right',
        }}
      >
        Guidance Source: {recommendation.sourceGuidance}
      </div>
    </article>
  );
};
