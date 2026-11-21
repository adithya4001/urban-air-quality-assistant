import { useEffect, useRef, useState } from 'react';

const audiences = [
  { title: 'Outdoor routines', caption: 'MOVE WITH THE AIR', image: 'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Choose activity timing and intensity with air conditions in mind.', detail: 'When pollution is high, consider a gentler activity or an indoor alternative.' },
  { title: 'Families & caregivers', caption: 'CARE FOR EVERY DAY', image: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Plan school runs, outdoor play and calmer indoor-air routines.', detail: 'Shape shared plans around the needs of the most sensitive person in your family.' },
  { title: 'Daily commuters', caption: 'A THOUGHTFUL WAY TO GO', image: 'https://images.pexels.com/photos/1756957/pexels-photo-1756957.jpeg?auto=compress&cs=tinysrgb&w=900', description: 'Think through commute exposure and practical route choices.', detail: 'A quieter route or shared journey can be a useful option when it fits your day.' },
] as const;

export function DailyAudienceCards() {
  const [flipped, setFlipped] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={sectionRef} className="daily-audience-grid flip-audience-grid" data-visible={visible}>{audiences.map((item, index) => <button type="button" className="daily-flip-card" key={item.title} aria-label={`${item.title}: ${item.description} ${item.detail} Select to flip the card.`} aria-pressed={flipped === index} onClick={() => setFlipped(flipped === index ? null : index)}><span className="daily-flip-inner" data-manual={flipped === index ? 'back' : undefined} style={{ animationDelay: `${index * .35}s` }}><span className="daily-flip-front"><img src={item.image} alt="" loading="lazy" decoding="async"/><span className="daily-flip-front-shade"/><span className="daily-flip-front-copy"><small>{item.caption}</small><strong>{item.title}</strong><span>Explore the story ↗</span></span></span><span className="daily-flip-back"><span className="daily-flip-orbit" aria-hidden="true"/><small>MADE FOR YOUR DAY</small><strong>{item.title}</strong><span>{item.description}</span><span className="daily-flip-detail">{item.detail}</span><span className="daily-flip-hint">Select to turn ↗</span></span></span></button>)}</div>;
}
