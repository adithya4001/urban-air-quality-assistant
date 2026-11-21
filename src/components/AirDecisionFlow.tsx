import { useState } from 'react';

const steps = [
  {
    title: 'Air + winter',
    summary: 'AQI, wind, temperature',
    icon: '☁',
    explanation: 'See how the air and weather around your location could affect your day.',
    image: 'https://images.pexels.com/photos/14979733/pexels-photo-14979733.jpeg?auto=compress&cs=tinysrgb&w=720',
  },
  {
    title: 'Your context',
    summary: 'Place, health, routine',
    icon: '⌖',
    explanation: 'Add your routine and any sensitivities so the guidance fits your situation.',
    image: 'https://images.pexels.com/photos/5999835/pexels-photo-5999835.jpeg?auto=compress&cs=tinysrgb&w=720',
  },
  {
    title: 'One clear next move',
    summary: 'Protect yourself + the city',
    icon: '✦',
    explanation: 'Find practical steps for outdoor activities, indoor air and your commute.',
    image: 'https://images.pexels.com/photos/28351753/pexels-photo-28351753.jpeg?auto=compress&cs=tinysrgb&w=720',
  },
] as const;

export function AirDecisionFlow() {
  const [active, setActive] = useState(0);

  return (
    <div className="story-visual" aria-label="How VaayuDootha turns context into action">
      <div className="story-photo">
        {steps.map((step, index) => (
          <img key={step.title} src={step.image} alt="" loading="lazy" decoding="async"
            className={active === index ? 'story-photo-active' : ''}
          />
        ))}
      </div>
      <div className="story-steps" aria-label="Explore the steps">
        {steps.map((step, index) => (
          <div className="story-step" key={step.title}>
            <button
              className={`story-flow-node story-node-${index + 1}`}
              type="button"
              aria-pressed={active === index}
              onClick={() => setActive(index)}
            >
              <span className="story-node-icon" aria-hidden="true">{step.icon}</span>
              <span className="story-node-copy"><strong>{step.title}</strong><small>{step.summary}</small></span>
              <span className="story-node-arrow" aria-hidden="true">↗</span>
            </button>
            {index < steps.length - 1 && <span className="story-flow-line" aria-hidden="true">↓</span>}
          </div>
        ))}
      </div>
      <p className="story-explanation" aria-live="polite">
        <strong>{steps[active].title}</strong>
        <span>{steps[active].explanation}</span>
      </p>
    </div>
  );
}
