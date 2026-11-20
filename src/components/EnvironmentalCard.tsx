import React from 'react';
import { AirQualitySnapshot, DataSource, RiskLevel, WeatherSnapshot } from '../domain/types';
import { formatAqi, formatConcentration, getRiskLevelColor, getRiskLevelLabel } from '../utils/formatters';

interface EnvironmentalCardProps {
  airQuality: AirQualitySnapshot;
  weather: WeatherSnapshot;
  effectiveRisk: RiskLevel;
  dataSource?: DataSource;
  dataAttribution?: string;
}

export const EnvironmentalCard: React.FC<EnvironmentalCardProps> = ({
  airQuality,
  weather,
  effectiveRisk,
  dataSource = 'scenario',
  dataAttribution,
}) => {
  const riskColor = getRiskLevelColor(effectiveRisk);

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div className="card-header">
        <div>
          <h2 className="card-title">Environmental snapshot</h2>
          <p className="muted-note" style={{ marginTop: '4px' }}>
            {dataSource === 'live'
              ? 'Live conditions shape this plan; recommendations still follow deterministic safety rules.'
              : 'Every unavailable signal is labelled and replaced with a conservative planning baseline.'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span className="data-source-badge">
          <span className="status-dot" aria-hidden="true" /> {dataSource === 'live' ? 'Live conditions' : dataSource === 'mixed' ? 'Mixed live + fallback' : dataSource === 'fallback' ? 'Safety fallback' : 'Scenario snapshot'}
        </span>
        <span
          className="badge"
          style={{
            backgroundColor: riskColor.bg,
            color: riskColor.text,
            border: `1px solid ${riskColor.border}`,
            fontSize: '0.8rem',
            padding: '4px 10px',
          }}
        >
          {getRiskLevelLabel(effectiveRisk)}
        </span>
        </div>
      </div>

      {/* Main AQI and Condition Highlight */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: riskColor.bg,
            border: `2px solid ${riskColor.border}`,
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: riskColor.text,
              letterSpacing: '0.04em',
            }}
          >
            Ambient Air Quality Index (AQI)
          </span>
          <div
            style={{
              fontSize: '3rem',
              fontWeight: 900,
              color: riskColor.text,
              lineHeight: 1.1,
              marginTop: '4px',
            }}
          >
            {formatAqi(airQuality.aqi)}
          </div>
          <p style={{ fontSize: '0.82rem', color: riskColor.text, marginTop: '4px', fontWeight: 600 }}>
            Primary Driver: {airQuality.primaryPollutant}
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
            METEOROLOGICAL STATE
          </span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>
            {weather.temperatureC}°C &bull; {weather.condition.toUpperCase()}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Wind: {weather.windSpeedKmh} km/h ({weather.windDirection}) &bull; Humidity: {weather.humidityPercent}%
          </p>
        </div>
      </div>

      {/* Atmospheric Inversion Warning if present */}
      {weather.inversionRisk !== 'none' && (
        <div
          role="region"
          aria-label="Atmospheric Thermal Inversion Alert"
          style={{
            backgroundColor: weather.inversionRisk === 'severe' ? '#fef2f2' : '#fffbeb',
            border: `1px solid ${weather.inversionRisk === 'severe' ? '#fecaca' : '#fde68a'}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '20px',
            color: weather.inversionRisk === 'severe' ? '#991b1b' : '#92400e',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <span aria-hidden="true" style={{ fontSize: '1.4rem' }}>
            🏔️
          </span>
          <div>
            <strong style={{ display: 'block', fontSize: '0.9rem' }}>
              Winter Thermal Inversion Cap Active ({weather.inversionRisk.toUpperCase()} RISK)
            </strong>
            <p style={{ fontSize: '0.82rem', marginTop: '2px', lineHeight: 1.4 }}>
              {weather.forecastSummary}
            </p>
          </div>
        </div>
      )}

      {/* Detailed Pollutant Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
        }}
      >
        <div className="metric-tile">
          <span className="metric-label">PM2.5 (Fine Particles)</span>
          <span className="metric-value">{formatConcentration(airQuality.pm25)}</span>
        </div>
        <div className="metric-tile">
          <span className="metric-label">PM10 (Coarse Inhalable)</span>
          <span className="metric-value">{formatConcentration(airQuality.pm10)}</span>
        </div>
        {airQuality.no2 !== undefined && (
          <div className="metric-tile">
            <span className="metric-label">NO₂ (Combustion / Traffic)</span>
            <span className="metric-value">{airQuality.no2} ppb</span>
          </div>
        )}
        {airQuality.indoorAqiEstimate !== undefined && (
          <div className="metric-tile">
            <span className="metric-label">Indoor Est. AQI</span>
            <span className="metric-value">{airQuality.indoorAqiEstimate}</span>
          </div>
        )}
      </div>
      {dataAttribution && <p className="source-note" aria-label="Environmental data source">{dataAttribution}</p>}
    </div>
  );
};
