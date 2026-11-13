import GlowText from './GlowText.jsx';
import './BrandQuote.css';

export default function BrandQuote() {
  return (
    <section className="brand-quote" id="brand-quote">
      <div className="quote-inner">
        <span className="quote-ornament" aria-hidden="true" />
        <GlowText as="blockquote" className="quote-text">
          “Our Sharvaya Fashion has more experienced workers, best designs, customize designs based on your
          preference”
        </GlowText>
        <span className="quote-ornament" aria-hidden="true" />
      </div>
    </section>
  );
}
