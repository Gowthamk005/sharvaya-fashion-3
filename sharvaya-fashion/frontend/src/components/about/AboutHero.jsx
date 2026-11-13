import { ABOUT } from '../../data/aboutContent.js';

export default function AboutHero() {
  const { eyebrow, title, lead } = ABOUT.hero;
  return (
    <section className="about-hero">
      <div className="section-inner">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="about-hero-title">{title}</h1>
        <p className="about-hero-lead">{lead}</p>
      </div>
    </section>
  );
}
