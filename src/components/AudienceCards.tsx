import { useState } from 'react';

const audiences = [
  {
    title: 'Outdoor-active people',
    description: 'Know whether to run, walk, cycle, or move today’s activity indoors.',
    prompt: 'Explore an example',
    example: 'When the air is poor, consider an indoor workout or a shorter, gentler activity.',
    image: 'https://images.pexels.com/photos/6039243/pexels-photo-6039243.jpeg?auto=compress&cs=tinysrgb&w=720',
    credit: 'Enric Cruz López',
    source: 'https://www.pexels.com/photo/unrecognizable-woman-jogging-along-footpath-in-park-6039243/',
  },
  {
    title: 'Families',
    description: 'Protect the most sensitive person at home with a shared, calmer routine.',
    prompt: 'Explore an example',
    example: 'Plan school trips around local conditions and follow the most sensitive family member’s needs.',
    image: 'https://images.pexels.com/photos/29718665/pexels-photo-29718665.jpeg?auto=compress&cs=tinysrgb&w=720',
    credit: 'Chris wade NTEZICIMPA',
    source: 'https://www.pexels.com/photo/family-stroll-in-park-with-parents-and-child-29718665/',
  },
  {
    title: 'Everyday commuters',
    description: 'Compare practical travel choices and reduce roadside exposure and emissions.',
    prompt: 'Explore an example',
    example: 'A quieter walking route or a shared trip may fit your commute and reduce exposure or emissions.',
    image: 'https://images.pexels.com/photos/9951857/pexels-photo-9951857.jpeg?auto=compress&cs=tinysrgb&w=720',
    credit: 'Rajan Gaur',
    source: 'https://www.pexels.com/photo/photograph-of-people-waiting-in-a-train-station-9951857/',
  },
] as const;

export function AudienceCards() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="audience-grid">
      {audiences.map((audience, index) => {
        const expanded = active === index;
        return (
          <article className="audience-card" key={audience.title} data-active={expanded}>
            <div className="audience-photo">
              <img src={audience.image} alt="" loading="lazy" decoding="async" />
              <a className="audience-credit" href={audience.source} target="_blank" rel="noreferrer">
                Photo: {audience.credit} / Pexels
              </a>
            </div>
            <div className="audience-content">
              <h3>{audience.title}</h3>
              <p>{audience.description}</p>
              <button className="audience-link" type="button" aria-expanded={expanded}
                aria-controls={`audience-example-${index}`}
                onClick={() => setActive(expanded ? null : index)}>
                {expanded ? 'Close example' : audience.prompt} <span aria-hidden="true">{expanded ? '−' : '↗'}</span>
              </button>
              <div id={`audience-example-${index}`} className="audience-example" hidden={!expanded}>
                <strong>For example</strong>
                <p>{audience.example}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
