import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard.jsx';
import ProductModal from './ProductModal.jsx';
import { ArrowLeftIcon, ArrowRightIcon } from './icons.jsx';
import { useProducts } from '../hooks/useProducts.js';
import './Collections.css';

// How many cards fit in the row at the current screen width
function getVisibleCount() {
  const w = window.innerWidth;
  if (w >= 1200) return 4;
  if (w >= 900) return 3;
  if (w >= 600) return 2;
  return 1;
}

function useVisibleCount() {
  const [count, setCount] = useState(getVisibleCount);
  useEffect(() => {
    const onResize = () => setCount(getVisibleCount());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return count;
}

// The home page shows the newest products; the full catalogue lives on Shop All.
const HOME_PARAMS = { sort: 'featured', limit: 12 };

export default function Collections() {
  const { items: products, loading, error } = useProducts(HOME_PARAMS);
  const visible = useVisibleCount();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const touchStartX = useRef(null);

  const maxIndex = Math.max(0, products.length - visible);
  const current = Math.min(index, maxIndex); // stays valid if products change or the screen resizes

  // Arrow rules: no back arrow on the first product, no forward arrow at the end
  const showBack = current > 0;
  const showForward = current < maxIndex;

  const goBack = () => setIndex(Math.max(0, current - 1));
  const goForward = () => setIndex(Math.min(maxIndex, current + 1));

  // Swipe support for phones / tablets
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) goForward();
    else goBack();
  };

  let message = null;
  if (loading) message = 'Loading the collection...';
  else if (error) message = "We couldn't load the collection right now. Please refresh in a moment.";
  else if (products.length === 0) message = 'Our new collection is coming soon.';

  return (
    <section className="collections" id="collections">
      <div className="section-inner">
        <header className="collections-head">
          <div>
            <p className="eyebrow">The Current Batch</p>
            <h2 className="section-title">
              Explore the
              <br />
              Collections
            </h2>
          </div>

          <Link to="/shop" className="glow-link view-all">
            View all Collections <span aria-hidden="true">→</span>
          </Link>
        </header>

        {message ? (
          <div className="collections-empty" role="status">
            <p>{message}</p>
          </div>
        ) : (
          <>
            <div className="carousel-viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <ul className="carousel-track" style={{ '--visible': visible, '--index': current }}>
                {products.map((product) => (
                  <li className="carousel-item" key={product.id}>
                    <ProductCard product={product} onDetails={setSelected} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="carousel-controls">
              <button
                type="button"
                className={`arrow-btn ${showBack ? '' : 'is-hidden'}`}
                onClick={goBack}
                disabled={!showBack}
                aria-hidden={!showBack}
                aria-label="Previous products"
              >
                <ArrowLeftIcon />
              </button>
              <button
                type="button"
                className={`arrow-btn ${showForward ? '' : 'is-hidden'}`}
                onClick={goForward}
                disabled={!showForward}
                aria-hidden={!showForward}
                aria-label="Next products"
              >
                <ArrowRightIcon />
              </button>
            </div>
          </>
        )}
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
