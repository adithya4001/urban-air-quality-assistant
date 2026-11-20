import { useEffect, useState } from 'react';

const rotationInterval = 6500;

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
  },
] as const;

export function ExampleAirReports() {
  const [{ active, previous }, setDeck] = useState({ active: 0, previous: -1 });
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const rotating = playing && !hovered && !focused;

  const selectReport = (index: number) => {
    setDeck((deck) => index === deck.active ? deck : { active: index, previous: deck.active });
  };
  const step = (direction: number) => selectReport((active + direction + reports.length) % reports.length);

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setDeck(({ active: index }) => ({ active: (index + 1) % reports.length, previous: index }));
    }, rotationInterval);
    return () => window.clearInterval(timer);
  }, [rotating, active]);

  return (
    <section
      className="landing-hero-visual report-deck"
      aria-label="Example VaayuDootha air reports"
      data-playing={playing}
      onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
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

      <div className="report-stack" aria-live={rotating ? 'off' : 'polite'} aria-atomic="true">
        {reports.map((report, index) => (
          <article
            key={report.scenario}
            className="air-glass-card report-card"
            data-state={active === index ? 'active' : previous === index ? 'outgoing' : 'idle'}
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
                <span className="air-score-number">{report.aqi}</span>
                <span className="air-score-status">{report.status}</span>
              </div>
              <div className="air-ring" aria-label="PM2.5"><span aria-hidden="true">PM<br />2.5</span></div>
            </div>
            <div className="decision-divider" />
            <p className="decision-label">YOUR NEXT BEST MOVE</p>
            <div className="decision-main">
              <div><strong>{report.title}</strong><span>{report.action}</span></div>
            </div>
            <p className="report-reason">{report.reason}</p>
          </article>
        ))}
      </div>

      <span className="floating-chip chip-weather" aria-hidden="true">{reports[active].weather}</span>
      <button className="report-arrow report-prev" type="button" aria-label="Previous report" onClick={() => step(-1)}>
        <span aria-hidden="true">‹</span>
      </button>
      <button className="report-arrow report-next" type="button" aria-label="Next report" onClick={() => step(1)}>
        <span aria-hidden="true">›</span>
      </button>
      <button className="report-playback" type="button" onClick={() => setPlaying((value) => !value)}>
        {playing ? 'Pause' : 'Play'}
      </button>
    </section>
  );
}
