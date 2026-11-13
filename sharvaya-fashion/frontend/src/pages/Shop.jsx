import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import ProductModal from '../components/ProductModal.jsx';
import SearchField from '../components/shop/SearchField.jsx';
import SortMenu from '../components/shop/SortMenu.jsx';
import { useProducts } from '../hooks/useProducts.js';
import { PRICE_RANGES, SIZES, SORTS, rangeLabel, rangeParams, sortLabel } from '../data/shopOptions.js';
import './Shop.css';

const SORT_VALUES = SORTS.map((s) => s.value);
const RANGE_VALUES = PRICE_RANGES.map((r) => r.value);

// Everything on this page lives in the web address (?q=&sort=&price=&size=), so a filtered view can be
// bookmarked or shared, and the browser's back button works.
export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState(null);

  const q = searchParams.get('q') || '';
  const sort = SORT_VALUES.includes(searchParams.get('sort')) ? searchParams.get('sort') : 'featured';
  const price = RANGE_VALUES.includes(searchParams.get('price')) ? searchParams.get('price') : '';
  const sizes = (searchParams.get('size') || '').split(',').filter((s) => SIZES.includes(s));
  const hasFilters = Boolean(q || sort !== 'featured' || price || sizes.length);

  // Writes one or more URL values; an empty value removes that key from the address
  const update = (changes, { replace = false } = {}) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(changes)) {
          if (value === '' || value === undefined || (Array.isArray(value) && !value.length)) next.delete(key);
          else next.set(key, Array.isArray(value) ? value.join(',') : value);
        }
        return next;
      },
      { replace }
    );
  };

  const list = useProducts({ q, sort, sizes, ...rangeParams(price), limit: 24 });

  const clearAll = () => setSearchParams({});

  return (
    <section className="shop">
      <div className="section-inner">
        <header className="shop-head">
          <p className="eyebrow">The full collections</p>
          <h1 className="section-title">Shop All</h1>
        </header>

        <div className="shop-toolbar">
          <SearchField value={q} onSearch={(text) => update({ q: text }, { replace: true })} />

          <SortMenu
            sort={sort}
            price={price}
            sizes={sizes}
            onApply={(f) => update({ sort: f.sort === 'featured' ? '' : f.sort, price: f.price, size: f.sizes })}
          />
        </div>

        {hasFilters && (
          <div className="shop-chips" aria-label="Active filters">
            {q && (
              <button type="button" className="filter-chip" onClick={() => update({ q: '' })}>
                “{q}” <span aria-hidden="true">×</span>
                <span className="sr-only">Remove search</span>
              </button>
            )}
            {sort !== 'featured' && (
              <button type="button" className="filter-chip" onClick={() => update({ sort: '' })}>
                {sortLabel(sort)} <span aria-hidden="true">×</span>
                <span className="sr-only">Remove sort</span>
              </button>
            )}
            {price && (
              <button type="button" className="filter-chip" onClick={() => update({ price: '' })}>
                {rangeLabel(price)} <span aria-hidden="true">×</span>
                <span className="sr-only">Remove price range</span>
              </button>
            )}
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                className="filter-chip"
                onClick={() => update({ size: sizes.filter((s) => s !== size) })}
              >
                Size {size} <span aria-hidden="true">×</span>
                <span className="sr-only">Remove size {size}</span>
              </button>
            ))}
            <button type="button" className="chips-clear" onClick={clearAll}>
              Clear all
            </button>
          </div>
        )}

        <p className="shop-count" aria-live="polite">
          {list.loading && list.items.length === 0
            ? 'Loading products...'
            : `${list.total} ${list.total === 1 ? 'product' : 'products'}`}
        </p>

        {list.error ? (
          <p className="shop-message" role="alert">
            {list.error}
          </p>
        ) : !list.loading && list.items.length === 0 ? (
          <div className="shop-message">
            <p>No products match these choices.</p>
            {hasFilters && (
              <button type="button" className="shop-text-btn" onClick={clearAll}>
                Clear filters and see everything
              </button>
            )}
          </div>
        ) : (
          <ul className={`shop-grid ${list.loading ? 'is-loading' : ''}`}>
            {list.items.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} onDetails={setSelected} />
              </li>
            ))}
          </ul>
        )}

        {list.hasMore && (
          <div className="shop-more">
            <button type="button" className="shop-more-btn" onClick={list.loadMore} disabled={list.loadingMore}>
              {list.loadingMore ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
