import { Link } from 'react-router-dom';
import GlowText from './GlowText.jsx';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero" id="home">
      <GlowText as="h1" className="hero-title">
        “Find Your Perfect Fashion with Us”
      </GlowText>
      <p className="hero-sub">More Reliable, Comfortable, Best Designs</p>

      {/* Links to the Shop All page (to be built later) */}
      <Link to="/shop" className="shop-now">
        <span>Shop Now</span>
        <span className="shop-now-arrow" aria-hidden="true">
          →
        </span>
      </Link>
    </section>
  );
}
