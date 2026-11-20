import React from 'react';

interface HowToUseCardProps {
  onJumpToControls: () => void;
}

export const HowToUseCard: React.FC<HowToUseCardProps> = ({ onJumpToControls }) => (
  <section className="how-to-use card" aria-labelledby="how-to-use-title">
    <div className="how-to-use-copy">
      <p className="eyebrow">START HERE</p>
      <h2 id="how-to-use-title" className="section-title">A practical check before you step out</h2>
      <p className="section-copy">
        VaayuDootha is meant for a repeatable daily decision: choose your place, describe the person or household, then act on the first three cards.
      </p>
      <button className="primary-button" type="button" onClick={onJumpToControls}>Set up today’s plan</button>
    </div>
    <ol className="how-to-use-steps">
      <li><span>1</span><div><strong>Choose the area</strong><p>Use the nearest listed city or basin scenario.</p></div></li>
      <li><span>2</span><div><strong>Add the household context</strong><p>Health sensitivity, commute, heating, purifier, and mask access change the advice.</p></div></li>
      <li><span>3</span><div><strong>Use the action feed</strong><p>Start with outdoor exposure, commute, and indoor-air cards; ask the assistant “why” when needed.</p></div></li>
    </ol>
  </section>
);
