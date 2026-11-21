import { useState } from 'react';

const audiences = [
  { title: 'Outdoor routines', caption: 'MOVE WITH THE AIR', image: 'https://images.pexels.com/photos/6039243/pexels-photo-6039243.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Choose activity timing and intensity with air conditions in mind.', detail: 'When pollution is high, consider a gentler activity or an indoor alternative.' },
  { title: 'Families & caregivers', caption: 'CARE FOR EVERY DAY', image: 'https://images.pexels.com/photos/29718665/pexels-photo-29718665.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Plan school runs, outdoor play and calmer indoor-air routines.', detail: 'Shape shared plans around the needs of the most sensitive person in your family.' },
  { title: 'Daily commuters', caption: 'A THOUGHTFUL WAY TO GO', image: 'https://images.pexels.com/photos/9951857/pexels-photo-9951857.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Think through commute exposure and practical route choices.', detail: 'A quieter route or shared journey can be a useful option when it fits your day.' },
] as const;

export function DailyAudienceCards() {
  const [flipped, setFlipped] = useState<number | null>(null);
  return <div className="daily-audience-grid flip-audience-grid">{audiences.map((item, index) => <button type="button" className="daily-flip-card" key={item.title} aria-label={`${item.title}: ${item.description} ${item.detail} Select to flip the card.`} aria-pressed={flipped === index} onClick={() => setFlipped(flipped === index ? null : index)}><span className="daily-flip-inner" data-manual={flipped === index ? 'back' : undefined} style={{ animationDelay: `${index * .4}s` }}><span className="daily-flip-front"><img src={item.image} alt="" loading="lazy" decoding="async"/><span className="daily-flip-front-shade"/><span className="daily-flip-front-copy"><small>{item.caption}</small><strong>{item.title}</strong><span>Explore the story ↗</span></span></span><span className="daily-flip-back"><span className="daily-flip-orbit" aria-hidden="true"/><small>MADE FOR YOUR DAY</small><strong>{item.title}</strong><span>{item.description}</span><span className="daily-flip-detail">{item.detail}</span><span className="daily-flip-hint">Select to turn ↗</span></span></span></button>)}</div>;
}
