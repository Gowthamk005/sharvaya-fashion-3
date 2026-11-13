import { HangerIcon } from '../icons.jsx';
import { ABOUT } from '../../data/aboutContent.js';

export default function AboutStory() {
  const { eyebrow, title, paragraphs } = ABOUT.story;
  return (
    <section className="about-story">
      <div className="section-inner about-story-grid">
        <div className="about-photo" role="img" aria-label="Our workshop">
          <HangerIcon size={56} />
          <span>Our story photo</span>
        </div>

        <div className="about-story-text">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title">{title}</h2>
          {paragraphs.map((text) => (
            <p key={text} className="about-paragraph">
              {text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
