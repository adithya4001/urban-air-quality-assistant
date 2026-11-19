import React, { useEffect } from 'react';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 4200);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <main className="intro-splash" aria-labelledby="intro-title">
      <div className="intro-noise" aria-hidden="true" />
      <div className="intro-rings" aria-hidden="true"><span /><span /><span /><i className="intro-orbit-dot dot-one" /><i className="intro-orbit-dot dot-two" /><i className="intro-orbit-dot dot-three" /></div>
      <div className="intro-content">
        <div className="intro-mark" aria-hidden="true"><span>◒</span></div>
        <p className="intro-overline">A calmer way to move through winter air</p>
        <h1 id="intro-title"><span className="intro-word intro-word-one">Breathe</span><span className="intro-word intro-word-two">Safe</span></h1>
        <p className="intro-tagline">Not just an AQI number.<br /><strong>A better next move.</strong></p>
        <div className="intro-progress" aria-hidden="true"><span /></div>
        <p className="intro-loading">Reading the air around you <span>·</span><span>·</span><span>·</span></p>
      </div>
      <button className="intro-skip" type="button" onClick={onComplete}>Skip intro <span aria-hidden="true">↗</span></button>
      <p className="intro-footer">Personalized · Explainable · Safety-first</p>
    </main>
  );
};
