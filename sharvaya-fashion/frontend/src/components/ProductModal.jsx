import { useEffect } from 'react';
import { CartIcon, CloseIcon, HangerIcon } from './icons.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { formatPrice } from '../utils/format.js';
import './ProductCard.css';

export default function ProductModal({ product, onClose }) {
  const { addToCart, notify } = useStore();

  // Close on Escape and stop the page behind from scrolling
  useEffect(() => {
    if (!product) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [product, onClose]);

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product.id);
    notify(`${product.name} added to cart`);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} details`}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={20} />
        </button>

        <div className="modal-media">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="product-placeholder">
              <HangerIcon size={54} />
              <span>Product Img</span>
            </div>
          )}
        </div>

        <div className="modal-body">
          <h3 className="modal-title">{product.name}</h3>
          <p className="modal-price">{formatPrice(product.price)}</p>

          <div>
            <p className="modal-label">Size</p>
            <div className="chip-row">
              {(product.sizes?.length ? product.sizes : ['-']).map((size) => (
                <span className="chip" key={size}>
                  {size}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="modal-label">Description</p>
            <p className="modal-desc">{product.description}</p>
          </div>

          <button type="button" className="modal-add" onClick={handleAdd}>
            <CartIcon size={18} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
