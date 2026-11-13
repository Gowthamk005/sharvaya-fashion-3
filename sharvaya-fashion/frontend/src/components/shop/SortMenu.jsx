import { useEffect, useRef, useState } from 'react';
import { PRICE_RANGES, SIZES, rangeLabel, sortLabel } from '../../data/shopOptions.js';

const DEFAULT_DRAFT = { sort: 'featured', price: '', sizes: [] };
const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

const Chevron = ({ direction = 'down' }) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ transform: direction === 'right' ? 'rotate(-90deg)' : 'none' }}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// The sort box. Choices are made in the panel and only apply when Submit is pressed.
export default function SortMenu({ sort, price, sizes, onApply }) {
  const [open, setOpen] = useState(false);
  const [flyout, setFlyout] = useState(null); // 'price' | 'size' | null
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const rootRef = useRef(null);

  const openMenu = () => {
    setDraft({ sort, price, sizes });
    setFlyout(null);
    setOpen(true);
  };
  const closeMenu = () => {
    setOpen(false);
    setFlyout(null);
  };

  // Close on a click outside the menu, or on Escape
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) closeMenu();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // A to Z: first press A to Z, next press Z to A, and so on
  const nameSort = draft.sort === 'name-asc' || draft.sort === 'name-desc';
  const toggleAZ = () => setDraft((d) => ({ ...d, sort: d.sort === 'name-asc' ? 'name-desc' : 'name-asc' }));

  const pickPriceSort = (value) => setDraft((d) => ({ ...d, sort: value }));
  const pickRange = (value) => setDraft((d) => ({ ...d, price: d.price === value ? '' : value }));
  const toggleSize = (size) =>
    setDraft((d) => ({
      ...d,
      sizes: d.sizes.includes(size) ? d.sizes.filter((s) => s !== size) : SIZES.filter((s) => s === size || d.sizes.includes(s)),
    }));

  const priceSort = draft.sort === 'price-asc' || draft.sort === 'price-desc';
  const priceSummary = [
    priceSort ? (draft.sort === 'price-asc' ? 'Low to high' : 'High to low') : '',
    draft.price ? rangeLabel(draft.price) : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const activeCount = (sort !== 'featured' ? 1 : 0) + (price ? 1 : 0) + sizes.length;

  const submit = () => {
    onApply({ sort: draft.sort, price: draft.price, sizes: draft.sizes });
    closeMenu();
  };

  const hoverOpen = (name) => {
    if (canHover()) setFlyout(name);
  };

  return (
    <div className="sort-wrap" ref={rootRef}>
      <button
        type="button"
        className={`sort-box ${open ? 'is-open' : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => (open ? closeMenu() : openMenu())}
      >
        <span className="sort-box-label">Sort</span>
        <span className="sort-box-value">{sortLabel(sort)}</span>
        {activeCount > 0 && <span className="sort-badge">{activeCount}</span>}
        <Chevron />
      </button>

      {open && (
        <div className="sort-panel" role="menu" aria-label="Sort and filter">
          {/* ---- Price ---- */}
          <div className="sort-row-wrap" onMouseEnter={() => hoverOpen('price')}>
            <button
              type="button"
              className={`sort-row ${flyout === 'price' || priceSort || draft.price ? 'is-active' : ''}`}
              aria-expanded={flyout === 'price'}
              onClick={() => setFlyout((f) => (f === 'price' && !canHover() ? null : 'price'))}
            >
              <span className="sort-row-text">
                <strong>Price</strong>
                <small>{priceSummary || 'Any price'}</small>
              </span>
              <Chevron direction="right" />
            </button>

            {flyout === 'price' && (
              <div className="sort-flyout" role="group" aria-label="Price options">
                <p className="sort-group-title">Order by price</p>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={draft.sort === 'price-asc'}
                  className="sort-option"
                  onClick={() => pickPriceSort('price-asc')}
                >
                  Low to high
                  {draft.sort === 'price-asc' && <span className="tick">✓</span>}
                </button>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={draft.sort === 'price-desc'}
                  className="sort-option"
                  onClick={() => pickPriceSort('price-desc')}
                >
                  High to low
                  {draft.sort === 'price-desc' && <span className="tick">✓</span>}
                </button>

                <p className="sort-group-title">Show prices</p>
                {PRICE_RANGES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={draft.price === r.value}
                    className="sort-option"
                    onClick={() => pickRange(r.value)}
                  >
                    {r.label}
                    {draft.price === r.value && <span className="tick">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ---- A to Z (a plain toggle, no sub-menu) ---- */}
          <div className="sort-row-wrap">
            <button
              type="button"
              className={`sort-row ${nameSort ? 'is-active' : ''}`}
              aria-pressed={nameSort}
              onClick={toggleAZ}
            >
              <span className="sort-row-text">
                <strong>A to Z</strong>
                <small>{nameSort ? (draft.sort === 'name-desc' ? 'Z to A' : 'A to Z') : 'Tap to sort by name'}</small>
              </span>
              <span className="az-arrow" aria-hidden="true">
                {draft.sort === 'name-desc' ? 'Z → A' : 'A → Z'}
              </span>
            </button>
          </div>

          {/* ---- Size ---- */}
          <div className="sort-row-wrap" onMouseEnter={() => hoverOpen('size')}>
            <button
              type="button"
              className={`sort-row ${flyout === 'size' || draft.sizes.length ? 'is-active' : ''}`}
              aria-expanded={flyout === 'size'}
              onClick={() => setFlyout((f) => (f === 'size' && !canHover() ? null : 'size'))}
            >
              <span className="sort-row-text">
                <strong>Size</strong>
                <small>{draft.sizes.length ? draft.sizes.join(', ') : 'Any size'}</small>
              </span>
              <Chevron direction="right" />
            </button>

            {flyout === 'size' && (
              <div className="sort-flyout size-flyout" role="group" aria-label="Sizes">
                <p className="sort-group-title">Choose sizes</p>
                <div className="size-grid">
                  {SIZES.map((size) => (
                    <label key={size} className={`size-check ${draft.sizes.includes(size) ? 'is-on' : ''}`}>
                      <input
                        type="checkbox"
                        checked={draft.sizes.includes(size)}
                        onChange={() => toggleSize(size)}
                      />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="sort-footer">
            <button type="button" className="sort-clear" onClick={() => setDraft(DEFAULT_DRAFT)}>
              Clear
            </button>
            <button type="button" className="sort-submit" onClick={submit}>
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
