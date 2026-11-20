import { useState } from 'react';

const reports = [
  {
    scenario: 'Morning workout',
    city: 'Delhi, India',
    time: '07:42 AM',
    weather: '9°C · low wind',
    conditions: 'Cold air · low wind',
    aqi: 164,
    status: 'Unhealthy',
    title: 'Swap the morning run',
    action: 'Move your run indoors if you can.',
    reason: 'Hard exercise increases the amount of polluted air you breathe.',
    icon: '↗',
    tone: 'amber',
  },
  {
    scenario: 'School drop-off',
    city: 'Lucknow, India',
    time: '08:05 AM',
    weather: '12°C · hazy',
    conditions: 'Haze · light wind',
    aqi: 138,
    status: 'Unhealthy for sensitive groups',
    title: 'Keep the school run short',
    action: 'Use a quieter drop-off route where available.',
    reason: 'Less time near idling traffic can reduce roadside exposure.',
    icon: '⌂',
    tone: 'orange',
  },
  {
    scenario: 'Evening commute',
    city: 'Pune, India',
    time: '05:30 PM',
    weather: '23°C · breezy',
    conditions: 'Mild air · steady breeze',
    aqi: 76,
    status: 'Moderate',
    title: 'Take the bus if it suits your route',
    action: 'Walk to the stop on a quieter street if one is available.',
    reason: 'Shared trips can reduce emissions compared with driving alone.',
    icon: '⇄',
    tone: 'green',
  },
] as const;

export function ExampleAirReports() {
  const [{ active, previous }, setDeck] = useState({ active: 0, previous: -1 });
  const selectReport = (index: number) => {
    setDeck((deck) => index === deck.active ? deck : { active: index, previous: deck.active });
  };

  return (
    <section className="landing-hero-visual report-deck" aria-label="Example VaayuDootha air reports">
      <div className="visual-orbit visual-orbit-one" aria-hidden="true" />
      <div className="visual-orbit visual-orbit-two report-orbit" role="group" aria-label="Choose an example report">
        {reports.map(({ scenario }, index) => (
          <button
            key={scenario}
            className="report-dot"
            type="button"
            aria-label={scenario}
            aria-pressed={active === index}
            onClick={() => selectReport(index)}
          >
            <span aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className="report-stack" aria-live="polite" aria-atomic="true">
        {reports.map((report, index) => (
          <article
            key={report.scenario}
            className="air-glass-card report-card"
            data-state={active === index ? 'active' : previous === index ? 'outgoing' : 'idle'}
            data-tone={report.tone}
            aria-hidden={active !== index}
          >
            <div className="air-card-topline"><span className="live-tag">EXAMPLE AIR REPORT</span><span>{report.time}</span></div>
            <div className="air-card-location">
              <span className="location-pin" aria-hidden="true">⌖</span>
              <div><strong>{report.city}</strong><small>{report.conditions}</small></div>
            </div>
            <div className="air-score-row">
              <div>
                <small className="metric-caption">SAMPLE US AQI</small>
                <strong className="air-score-number">{report.aqi}</strong>
                <span className="air-score-status">{report.status}</span>
              </div>
              <div className="air-ring" aria-label="PM2.5"><span aria-hidden="true">PM<br />2.5</span></div>
            </div>
            <div className="decision-divider" />
            <p className="decision-label">YOUR NEXT BEST MOVE</p>
            <div className="decision-main">
              <span className="decision-icon" aria-hidden="true">{report.icon}</span>
              <div><strong>{report.title}</strong><span>{report.action}</span></div>
            </div>
            <p className="report-reason">{report.reason}</p>
          </article>
        ))}
      </div>

      <span className="floating-chip chip-weather" aria-hidden="true">☁ {reports[active].weather}</span>
      <div className="report-controls">
        <span>{reports[active].scenario} · {active + 1} / {reports.length}</span>
        <button type="button" onClick={() => selectReport((active + 1) % reports.length)}>
          Next report <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
