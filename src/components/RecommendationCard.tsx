import React from 'react';
import { Recommendation } from '../domain/types';
import '../styles/recommendation-card.css';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const categoryLabel: Record<Recommendation['category'], string> = {
    outdoor_activity: '🏃 Outdoor Activity & Exercise',
    commute: '🚲 Commute & Mobility',
    indoor_air: '🏠 Indoor Air & Filtration',
    protective_equipment: '😷 Personal Protective Equipment (PPE)',
    emission_reduction: '🌱 Neighborhood Emission Reduction',
  };

  return (
    <article
      className={`card recommendation-card priority-${recommendation.priority}`}
      aria-labelledby={`rec-title-${recommendation.id}`}
    >
      <div className="recommendation-card-heading">
        <span className="recommendation-category">{categoryLabel[recommendation.category]}</span>
        <span className={`badge recommendation-priority priority-label-${recommendation.priority}`}>
          {recommendation.priority} Priority
        </span>
      </div>

      <h3 id={`rec-title-${recommendation.id}`} className="recommendation-title">
        {recommendation.title}
      </h3>

      <p className="recommendation-summary">{recommendation.summary}</p>

      {/* Actionable Checkpoints */}
      <div className="recommendation-actions">
        <h4>Recommended Action Items</h4>
        <ul>
          {recommendation.actionItems.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>

      {/* Safety Notice if urgent */}
      {recommendation.safetyNotice && (
        <div
          role="note"
          className="recommendation-safety-note"
        >
          <strong>Safety note:</strong> {recommendation.safetyNotice}
        </div>
      )}

      {/* Impact Explanations (Health & Environmental) */}
      <div className="recommendation-impacts">
        <div><h4>🩺 Health & Exposure Impact</h4><p>{recommendation.healthImpact}</p></div>
        <div><h4>🌍 Environmental & Community Footprint</h4><p>{recommendation.environmentalImpact}</p></div>
      </div>

      <p className="recommendation-source">Guidance source: {recommendation.sourceGuidance}</p>
    </article>
  );
};
