import React, { useEffect, useRef } from 'react';
import { startIntroCity } from './introCity';
import './introSplash.css';

interface IntroSplashProps {
  onComplete: () => void;
}

const title = 'VaayuDootha';
const cityRevealAt = 2350;
const titleRevealAt = 3450;
const letterInterval = 85;
const subtitleRevealAt = 4630;
const fadeAt = 6050;
const completeAt = 6650;

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const letters = titleRef.current?.querySelectorAll<HTMLSpanElement>('.city-intro-letter');
    const stopCity = canvas && letters && startIntroCity(canvas, Array.from(letters), {
      gatherAt: titleRevealAt - 325,
      titleReadyAt: subtitleRevealAt,
    });
    const timer = window.setTimeout(onComplete, completeAt);
    return () => {
      window.clearTimeout(timer);
      stopCity?.();
    };
  }, [onComplete]);

  const timing = {
    '--city-reveal-at': `${cityRevealAt}ms`,
    '--title-reveal-at': `${titleRevealAt}ms`,
    '--letter-interval': `${letterInterval}ms`,
    '--subtitle-reveal-at': `${subtitleRevealAt}ms`,
    '--intro-fade-at': `${fadeAt}ms`,
    '--intro-fade-duration': `${completeAt - fadeAt}ms`,
  } as React.CSSProperties;

  return (
    <main className="city-intro" style={timing} aria-labelledby="intro-title">
      <canvas ref={canvasRef} className="city-intro-canvas" aria-hidden="true" />
      <div className="city-intro-mist" aria-hidden="true" />
      <div className="city-intro-stage" aria-hidden="true">
        <div className="city-intro-shadow" />
        <div className="city-intro-ball" />
      </div>
      <div className="city-intro-copy">
        <h1 id="intro-title" ref={titleRef} aria-label={title}>
          {Array.from(title, (letter, index) => (
            <span key={index} className="city-intro-letter" aria-hidden="true"
              style={{ '--letter-index': index } as React.CSSProperties}>{letter}</span>
          ))}
        </h1>
        <div className="city-intro-divider" aria-hidden="true" />
        <p>Plan your day around the air you breathe.</p>
      </div>
      <div className="city-intro-exit" aria-hidden="true" />
    </main>
  );
};
