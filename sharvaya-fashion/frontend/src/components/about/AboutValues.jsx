import { Link } from 'react-router-dom';
import { ABOUT } from '../../data/aboutContent.js';

// Small numbered mark for each value card, styled like the rest of the site
const Mark = ({ n }) => <span className="value-mark">{String(n).padStart(2, '0')}</span>;

export default function AboutValues() {
  const { eyebrow, title, items } = ABOUT.values;
  const { title: ctaTitle, text: ctaText } = ABOUT.cta;

  return (
    <>
      <section className="about-values">
        <div className="section-inner">
          <header className="values-head">
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="section-title">{title}</h2>
          </header>

          <ul className="values-grid">
            {items.map((item, i) => (
              <li key={item.title} className="value-card">
                <Mark n={i + 1} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="about-cta">
        <div className="section-inner about-cta-inner">
          <div>
            <h2 className="about-cta-title">{ctaTitle}</h2>
            <p>{ctaText}</p>
          </div>
          <div className="about-cta-actions">
            <Link to="/shop" className="about-btn is-primary">
              Shop All
            </Link>
            <a href="#contact" className="about-btn">
              Contact us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
